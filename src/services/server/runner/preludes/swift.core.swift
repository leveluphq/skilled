// ==== Skilled runner harness (Swift 6.4, Swift 5 language mode) ====
// Comes first in main.swift, before the learner's code: top-level code runs in
// order, so the harness reads stdin before any of theirs can. #sourceLocation
// directives give their code its own line numbers. Harness names start with __
// and libc is always called as Glibc.x, so a learner's own `write` or `errno`
// can't break it. docs/adding-a-language.md has the contract it keeps: what
// it reads from stdin and the lines it prints.
//
// Swift traps (an index out of range, unwrapping nil, overflow) can't be
// caught, so every test runs in a fork()ed child, and only the parent writes
// harness lines. The child's prints, its stderr and its result come back over
// pipes. A trap fails only its own test: the parent takes the message from the
// child's stderr and the learner's line from the crash report the Swift
// backtracer writes (SWIFT_BACKTRACE, set in the runtime's docker.env).
import Glibc

enum __H {
    // Room for about 500,000 frames of a recursive DFS. The memory limit is
    // well above it, so runaway recursion hits the guard page (a stack
    // overflow, for that test only) before the out-of-memory killer.
    static let stackBytes = 256 << 20
    static let errorMaxChars = 500
    static let logCapPerTest = 64 << 10
    static let logCapTotal = 256 << 10
    // Worst-case bytes of one start line, error result and truncation note
    static let errorLineReserve = 800
    // How long a test's process may take to exit after reporting its result
    static let graceMs = 1000.0
    // Where the backtracer writes crash reports (output-to in SWIFT_BACKTRACE)
    static let crashDir = "/tmp/swift-crashes"
    static let truncatedNote: [UInt8] = Array("\n… (output truncated)\n".utf8)

    // Lines of the learner's code, set by the driver, to place errors
    static var userLines = 0
    static var nonce: [UInt8] = []
    static var tests: [__J] = []
    // Private copies of stdout and stderr: learner code that closes fd 1 can't
    // break the protocol
    static var outFd: Int32 = 1
    static var errFd: Int32 = 2
    // stdout is capped by RLIMIT_FSIZE, so the harness budgets what it writes;
    // run() lowers this to the real limit
    static var outBudget = 64 << 20
    static var written = 0
    static var lastByte: UInt8 = 0x0A
    static var logTotal = 0
    static var harnessFailed = false
    // Shared with each test's process: the operation it's on and how long the
    // learner's calls have taken, for a test that dies without reporting
    static var shared: UnsafeMutableRawPointer? = nil
    // In the test's process: the operation being called (design lessons)
    static var opIndex = -1
    static var opName = ""
    static var elapsedMs = 0.0
    static var callStart = 0.0

    // ---------------- start (top-level, before any of the learner's code runs) ----------------
    static func start() {
        // Line-buffered, so a test's complete lines survive a trap
        Glibc.setvbuf(Glibc.stdout, nil, Glibc._IOLBF, 0)
        let o = Glibc.fcntl(1, Glibc.F_DUPFD, 20)
        if o >= 0 { outFd = o }
        let e = Glibc.fcntl(2, Glibc.F_DUPFD, 20)
        if e >= 0 { errFd = e }
        // No core files from crashes; the backtracer reports them instead
        var noCore = Glibc.rlimit(rlim_cur: 0, rlim_max: 0)
        _ = Glibc.setrlimit(Glibc.__rlimit_resource_t(Glibc.RLIMIT_CORE.rawValue), &noCore)
        _ = Glibc.mkdir(crashDir, 0o700)

        var data: [UInt8] = []
        var buf = [UInt8](repeating: 0, count: 1 << 16)
        while true {
            let n = buf.withUnsafeMutableBytes { Glibc.read(0, $0.baseAddress, $0.count) }
            if n > 0 { data.append(contentsOf: buf[0..<n]) }
            else if n < 0 && Glibc.errno == Glibc.EINTR { continue }
            else { break }
        }
        // The learner's code reads an empty stdin
        let devNull = Glibc.open("/dev/null", Glibc.O_RDONLY)
        if devNull > 0 { _ = Glibc.dup2(devNull, 0); _ = Glibc.close(devNull) }
        Glibc.clearerr(Glibc.stdin)

        do {
            let nl = data.firstIndex(of: 0x0A) ?? data.count
            let line = Array(data[0..<nl])
            if line.count != 32 || !line.allSatisfy({ ($0 >= 0x30 && $0 <= 0x39) || ($0 >= 0x61 && $0 <= 0x66) }) {
                throw __HInputError("stdin line 1 must be a 32-char lowercase hex nonce")
            }
            nonce = line
            let rest = nl < data.count ? Array(data[(nl + 1)...]) : []
            let document = try rest.withUnsafeBufferPointer { p -> __J in
                var parser = __JParser(p.baseAddress ?? UnsafePointer(bitPattern: 1)!, p.count)
                return try parser.document()
            }
            guard case .arr(let all) = try field(document, "tests") else { throw bad("tests (JSON array)", document) }
            tests = all
        } catch {
            errText("harness: cannot read test input: \(error)\n")
            Glibc.exit(86)
        }
    }

    // ---------------- the test loop (called by the generated driver) ----------------
    static func run(userLines: Int, _ test: @escaping (__J) throws -> __J) -> Never {
        self.userLines = userLines
        Glibc.fflush(Glibc.stdout)
        // The learner's top-level code has run. From here an oversized write
        // fails (and the harness keeps within the limit) instead of killing it.
        _ = Glibc.signal(Glibc.SIGXFSZ, Glibc.SIG_IGN)
        outBudget = fileSizeLimit(outBudget)
        let position = Glibc.lseek(outFd, 0, Glibc.SEEK_CUR)
        if position > 0 {
            written = Int(position)
            var last: UInt8 = 0
            lastByte = Glibc.pread(outFd, &last, 1, position - 1) == 1 ? last : 0
        }
        let page = Glibc.mmap(nil, 4096, Glibc.PROT_READ | Glibc.PROT_WRITE, Glibc.MAP_SHARED | Glibc.MAP_ANONYMOUS, -1, 0)
        if let page = page, page != UnsafeMutableRawPointer(bitPattern: -1) { shared = page }

        for i in 0..<tests.count {
            if harnessFailed { break }
            emit("{\"t\":\"start\",\"i\":\(i)}")
            if !runForked(i, test) {
                // No process for the test (out of processes): run it here, where a
                // trap ends the run
                let room = resultRoom(i)
                var r = (ok: false, ms: 0.0, payload: [UInt8]())
                onBigStack { r = compute(tests[i], test, room: room) }
                finish(i, r.ok, r.payload, r.ms)
            }
        }
        emit("{\"t\":\"done\"}")
        Glibc.exit(harnessFailed ? 86 : 0)
    }

    // The largest result test i can report, keeping room for the remaining
    // tests' start and error lines, the logs they may print and the done line
    static func resultRoom(_ i: Int) -> Int {
        return outBudget - written - errorLineReserve * (tests.count - i) - logRoomLeft() - 64 - 2 * nonce.count
    }

    static func logRoomLeft() -> Int { return Swift.max(0, logCapTotal - logTotal) + truncatedNote.count }

    // ---------------- one test, in a process of its own ----------------
    static func runForked(_ i: Int, _ test: @escaping (__J) throws -> __J) -> Bool {
        var out: [Int32] = [-1, -1], err: [Int32] = [-1, -1], res: [Int32] = [-1, -1]
        if Glibc.pipe(&out) != 0 { return false }
        if Glibc.pipe(&err) != 0 { closeAll(out); return false }
        if Glibc.pipe(&res) != 0 { closeAll(out + err); return false }
        let room = resultRoom(i)
        let cpuLeft = cpuSecondsLeft()
        setShared(opIndex: -1, name: "", elapsed: 0, callStart: 0)
        Glibc.fflush(Glibc.stdout)
        Glibc.fflush(Glibc.stderr)
        let pid = Glibc.fork()
        if pid < 0 { closeAll(out + err + res); return false }

        if pid == 0 {
            // ---- the test's process: run it, send the result back, exit
            _ = Glibc.setpgid(0, 0)
            _ = Glibc.dup2(out[1], 1)
            _ = Glibc.dup2(err[1], 2)
            closeAll([out[0], out[1], err[0], err[1], res[0], outFd, errFd])
            for k in nonce.indices { nonce[k] = 0 }
            if let left = cpuLeft {
                var limit = Glibc.rlimit()
                let resource = Glibc.__rlimit_resource_t(Glibc.RLIMIT_CPU.rawValue)
                if Glibc.getrlimit(resource, &limit) == 0 && Glibc.rlim_t(left) < limit.rlim_cur {
                    limit.rlim_cur = Glibc.rlim_t(left)
                    _ = Glibc.setrlimit(resource, &limit)
                }
            }
            var r = (ok: false, ms: 0.0, payload: [UInt8]())
            onBigStack { r = compute(tests[i], test, room: room) }
            var message = [UInt8]()
            appendInt(&message, UInt64(9 + r.payload.count))
            message.append(r.ok ? 1 : 0)
            appendInt(&message, r.ms.bitPattern)
            message.append(contentsOf: r.payload)
            _ = message.withUnsafeBytes { writeAll(res[1], $0) }
            Glibc.fflush(Glibc.stdout)
            Glibc._exit(0)
        }

        // ---- the parent: relay the test's output until it exits
        _ = Glibc.setpgid(pid, pid)
        closeAll([out[1], err[1], res[1]])
        let fds = [out[0], err[0], res[0]]
        for fd in fds { _ = Glibc.fcntl(fd, Glibc.F_SETFL, Glibc.fcntl(fd, Glibc.F_GETFL) | Glibc.O_NONBLOCK) }
        var open = [true, true, true]
        var result = [UInt8]()
        var resultSize = -1
        var stderrRelay = __HStderr()
        var status: Int32 = 0
        var exited = false
        var killDeadline = -1.0
        var buffer = [UInt8](repeating: 0, count: 1 << 16)
        var testLogs = 0
        var noted = false

        func consume(_ k: Int) -> Int {
            let n = buffer.withUnsafeMutableBytes { Glibc.read(fds[k], $0.baseAddress, $0.count) }
            if n == 0 || (n < 0 && Glibc.errno != Glibc.EAGAIN && Glibc.errno != Glibc.EINTR) { open[k] = false; return 0 }
            if n < 0 { return -1 }
            switch k {
            case 0:
                // The learner's prints, capped per test and in total
                let room = Swift.max(0, Swift.min(logCapPerTest - testLogs, logCapTotal - logTotal))
                let shown = Swift.min(n, room)
                if shown > 0 {
                    buffer.withUnsafeBytes { writeOut(UnsafeRawBufferPointer(rebasing: $0[0..<shown])) }
                    testLogs += shown
                    logTotal += shown
                }
                if shown < n && !noted {
                    noted = true
                    truncatedNote.withUnsafeBytes { writeOut($0) }
                }
            case 1:
                stderrRelay.feed(buffer[0..<n])
            default:
                result.append(contentsOf: buffer[0..<n])
                if resultSize < 0 && result.count >= 8 {
                    var size: UInt64 = 0
                    for s in 0..<8 { size |= UInt64(result[s]) << UInt64(8 * s) }
                    resultSize = size > UInt64(1 << 40) ? Int.max : 8 + Int(size)
                }
            }
            return n
        }

        while !exited {
            var polled: [Glibc.pollfd] = []
            var which: [Int] = []
            for k in 0..<3 where open[k] {
                polled.append(Glibc.pollfd(fd: fds[k], events: Int16(Glibc.POLLIN), revents: 0))
                which.append(k)
            }
            if polled.isEmpty {
                if killDeadline < 0 {
                    while Glibc.waitpid(pid, &status, 0) < 0 && Glibc.errno == Glibc.EINTR {}
                    exited = true
                    break
                }
                Glibc.usleep(2000)
            } else {
                _ = Glibc.poll(&polled, Glibc.nfds_t(polled.count), 20)
                for (j, p) in polled.enumerated() where p.revents != 0 { _ = consume(which[j]) }
                stderrRelay.idle()
            }
            if Glibc.waitpid(pid, &status, Glibc.WNOHANG) == pid { exited = true; break }
            // A test that reported but doesn't exit (a thread holding a lock) is stopped
            if resultSize >= 0 && result.count >= resultSize && killDeadline < 0 { killDeadline = now() + graceMs }
            if killDeadline >= 0 && now() > killDeadline { _ = Glibc.kill(-pid, Glibc.SIGKILL); _ = Glibc.kill(pid, Glibc.SIGKILL) }
        }
        let ended = now()
        // Processes the test started, and whatever they still had to say
        _ = Glibc.kill(-pid, Glibc.SIGKILL)
        for k in 0..<3 {
            var reads = 0
            while open[k] && reads < 256 && consume(k) > 0 { reads += 1 }
            _ = Glibc.close(fds[k])
        }
        while Glibc.waitpid(-1, nil, Glibc.WNOHANG) > 0 {}

        let signal = status & 0x7f
        let reported = resultSize >= 17 && result.count == resultSize
        stderrRelay.finish(crashed: !reported)

        if reported {
            var bits: UInt64 = 0
            for s in 0..<8 { bits |= UInt64(result[9 + s]) << UInt64(8 * s) }
            finish(i, result[8] == 1, Array(result[17...]), Double(bitPattern: bits))
            return true
        }

        if signal == 0 {
            // The learner's code called exit(): the run ends there, as in other languages
            Glibc.exit((status >> 8) & 0xff)
        }
        if ![Glibc.SIGTRAP, Glibc.SIGILL, Glibc.SIGABRT, Glibc.SIGSEGV, Glibc.SIGBUS, Glibc.SIGFPE, Glibc.SIGSYS].contains(signal) {
            // Out of CPU time (SIGXCPU), memory (SIGKILL) and the like end the run
            // with the same signal, so it's reported as for any other language
            endRun(signal)
        }
        let s = sharedState()
        let stopped = stderrRelay.crashedAt > 0 ? stderrRelay.crashedAt : ended
        let ms = s.callStart > 0 ? s.elapsed + Swift.max(0, stopped - s.callStart) : s.elapsed
        finish(i, false, Array(crashMessage(pid, signal, stderrRelay.fatal, s.opIndex, s.opName).utf8), ms)
        return true
    }

    static func endRun(_ signal: Int32) -> Never {
        _ = Glibc.signal(signal, Glibc.SIG_DFL)
        var set = Glibc.sigset_t()
        Glibc.sigemptyset(&set)
        Glibc.sigaddset(&set, signal)
        Glibc.sigprocmask(Glibc.SIG_UNBLOCK, &set, nil)
        Glibc.raise(signal)
        Glibc._exit(128 + signal)
    }

    // ---------------- running the learner's code ----------------
    static func compute(_ testCase: __J, _ test: (__J) throws -> __J, room: Int) -> (ok: Bool, ms: Double, payload: [UInt8]) {
        opIndex = -1
        opName = ""
        elapsedMs = 0
        callStart = 0
        do {
            let answer = try test(testCase)
            var json = [UInt8]()
            answer.write(&json)
            if json.count > room { return (false, elapsedMs, Array("Your answer is too large to report".utf8)) }
            return (true, elapsedMs, json)
        } catch {
            return (false, elapsedMs, Array(describe(error).utf8))
        }
    }

    static var job: (() -> Void)? = nil

    // Runs f on a thread with a big stack, with an alternate signal stack so a
    // stack overflow still gets a crash report
    static func onBigStack(_ f: @escaping () -> Void) {
        job = f
        for size in [stackBytes, 128 << 20, 64 << 20] {
            var attributes = Glibc.pthread_attr_t()
            Glibc.pthread_attr_init(&attributes)
            Glibc.pthread_attr_setstacksize(&attributes, size)
            var thread = Glibc.pthread_t()
            let rc = Glibc.pthread_create(&thread, &attributes, { _ in
                var alt = Glibc.stack_t()
                alt.ss_size = 1 << 18
                alt.ss_sp = Glibc.malloc(alt.ss_size)
                alt.ss_flags = 0
                if alt.ss_sp != nil { _ = Glibc.sigaltstack(&alt, nil) }
                __H.job?()
                return nil
            }, nil)
            Glibc.pthread_attr_destroy(&attributes)
            if rc == 0 {
                Glibc.pthread_join(thread, nil)
                job = nil
                return
            }
        }
        job = nil
        f()
    }

    // Timing of the learner's own calls (the driver's __call), shared with the
    // parent in case the test dies mid-call
    static func tic() {
        callStart = now()
        setShared(opIndex: opIndex, name: opName, elapsed: elapsedMs, callStart: callStart)
    }
    static func toc() {
        elapsedMs += now() - callStart
        callStart = 0
        setShared(opIndex: opIndex, name: opName, elapsed: elapsedMs, callStart: 0)
    }
    static func opAt(_ k: Int, _ name: String) {
        opIndex = k
        opName = name
        setShared(opIndex: k, name: name, elapsed: elapsedMs, callStart: 0)
    }

    static func setShared(opIndex: Int, name: String, elapsed: Double, callStart: Double) {
        guard let p = shared else { return }
        p.storeBytes(of: opIndex, toByteOffset: 0, as: Int.self)
        p.storeBytes(of: elapsed, toByteOffset: 8, as: Double.self)
        p.storeBytes(of: callStart, toByteOffset: 16, as: Double.self)
        let bytes = Array(name.utf8.prefix(64))
        p.storeBytes(of: bytes.count, toByteOffset: 24, as: Int.self)
        for (k, b) in bytes.enumerated() { p.storeBytes(of: b, toByteOffset: 32 + k, as: UInt8.self) }
    }

    static func sharedState() -> (opIndex: Int, opName: String, elapsed: Double, callStart: Double) {
        guard let p = shared else { return (-1, "", 0, 0) }
        let count = Swift.min(64, Swift.max(0, p.load(fromByteOffset: 24, as: Int.self)))
        let name = (0..<count).map { p.load(fromByteOffset: 32 + $0, as: UInt8.self) }
        return (p.load(fromByteOffset: 0, as: Int.self), String(decoding: name, as: UTF8.self),
                p.load(fromByteOffset: 8, as: Double.self), p.load(fromByteOffset: 16, as: Double.self))
    }

    // ---------------- errors ----------------
    // "MyError: details [during call #3, pop]"; a thrown Swift error has no line
    static func describe(_ error: Swift.Error) -> String {
        var text: String
        if let input = error as? __HInputError {
            text = "HarnessInputError: \(input.message)"
        } else if let answer = error as? __HAnswerError {
            text = answer.message
        } else {
            let name = String(describing: type(of: error))
            let details = String(describing: error)
            text = details == name || details == name + "()" ? name : "\(name): \(details)"
        }
        return truncate(text + duringCall(opIndex, opName))
    }

    static func duringCall(_ k: Int, _ name: String) -> String {
        return k >= 0 ? " [during call #\(k + 1), \(name)]" : ""
    }

    static func truncate(_ text: String) -> String {
        return text.count > errorMaxChars ? String(text.prefix(errorMaxChars)) + "…" : text
    }

    // "Fatal error: Index out of range (line 5)", from what the runtime printed
    // and the crash report of the test's process
    static func crashMessage(_ pid: Int32, _ signal: Int32, _ fatal: String?, _ k: Int, _ name: String) -> String {
        let report = crashReport(pid)
        var text: String
        if let fatal = fatal {
            text = fatal
        } else if let description = report?.description, description.hasPrefix("Swift runtime failure") {
            text = description
        } else if signal == Glibc.SIGSEGV || signal == Glibc.SIGBUS {
            text = report?.stackOverflow ?? true
                ? "Stack overflow: the recursion went too deep"
                : "Segmentation fault: \(report?.description ?? "invalid memory access")"
        } else if signal == Glibc.SIGABRT {
            text = "Aborted"
        } else if signal == Glibc.SIGFPE {
            text = "Arithmetic error"
        } else {
            text = report?.description ?? "Crashed (signal \(signal))"
        }
        text += duringCall(k, name)
        if let line = report?.line { text += " (line \(line))" }
        return truncate(text)
    }

    // The backtracer's JSON report on a crashed test's process: what happened,
    // and the first frame in the learner's code
    static func crashReport(_ pid: Int32) -> (description: String?, line: Int?, stackOverflow: Bool)? {
        guard let dir = Glibc.opendir(crashDir) else { return nil }
        var path: String? = nil
        while let entry = Glibc.readdir(dir) {
            let name = withUnsafeBytes(of: entry.pointee.d_name) { raw in
                String(decoding: raw.prefix(while: { $0 != 0 }), as: UTF8.self)
            }
            if name.contains("-\(pid)-") { path = crashDir + "/" + name }
        }
        Glibc.closedir(dir)
        guard let file = path else { return nil }
        defer { _ = Glibc.unlink(file) }
        let fd = Glibc.open(file, Glibc.O_RDONLY)
        if fd < 0 { return nil }
        var data: [UInt8] = []
        var buf = [UInt8](repeating: 0, count: 1 << 16)
        while true {
            let n = buf.withUnsafeMutableBytes { Glibc.read(fd, $0.baseAddress, $0.count) }
            if n <= 0 { break }
            data.append(contentsOf: buf[0..<n])
        }
        _ = Glibc.close(fd)
        guard let report = try? data.withUnsafeBufferPointer({ p -> __J in
            var parser = __JParser(p.baseAddress ?? UnsafePointer(bitPattern: 1)!, p.count)
            return try parser.document()
        }) else { return nil }

        let description = report["description"]?.asString
        var line: Int? = nil
        var stackOverflow = false
        let threads = report["threads"]?.asArray ?? []
        if let thread = threads.first(where: { $0["crashed"]?.asBool == true }) ?? threads.first {
            // A fault just below the stack pointer is the stack's guard page
            if let fault = hex(report["faultAddress"]?.asString),
               let sp = hex(thread["registers"]?["sp"]?.asString ?? thread["registers"]?["rsp"]?.asString) {
                stackOverflow = (fault > sp ? fault - sp : sp - fault) < (1 << 20)
            }
            var first: Int? = nil
            for frame in thread["frames"]?.asArray ?? [] {
                guard let location = frame["sourceLocation"], let file = location["file"]?.asString,
                      file == "Main.swift" || file.hasSuffix("/Main.swift"),
                      let n = location["line"]?.asInt, n >= 1 && n <= userLines else { continue }
                if first == nil { first = n }
                // Column 0 is a function's entry; prefer the line that called it
                if location["column"]?.asInt != 0 { line = n; break }
            }
            if line == nil { line = first }
        }
        return (description, line, stackOverflow)
    }

    static func hex(_ text: String?) -> UInt64? {
        guard let text = text, text.hasPrefix("0x") else { return nil }
        return UInt64(text.dropFirst(2), radix: 16)
    }

    // ---------------- output ----------------
    static func finish(_ i: Int, _ ok: Bool, _ payload: [UInt8], _ ms: Double) {
        var line = Array("{\"t\":\"result\",\"i\":\(i),".utf8)
        if ok {
            line += Array("\"ok\":true,\"out\":".utf8)
            line += payload
        } else {
            line += Array("\"ok\":false,\"error\":".utf8)
            __J.str(truncate(String(decoding: payload, as: UTF8.self))).write(&line)
        }
        line += Array(",\"ms\":".utf8)
        __J.dbl((ms * 1000).rounded() / 1000).write(&line)
        line.append(0x7D)
        // Keep room for the remaining tests' start and error lines, their
        // capped logs and the done line
        let reserve = errorLineReserve * (tests.count - i - 1) + logRoomLeft() + 64 + 2 * nonce.count
        if written + line.count + nonce.count + 2 + reserve > outBudget {
            line = Array("{\"t\":\"result\",\"i\":\(i),\"ok\":false,\"error\":\"Your answer is too large to report\",\"ms\":".utf8)
            __J.dbl((ms * 1000).rounded() / 1000).write(&line)
            line.append(0x7D)
        }
        emitBytes(line)
    }

    static func emit(_ json: String) { emitBytes(Array(json.utf8)) }

    // A harness line, on a line of its own
    static func emitBytes(_ json: [UInt8]) {
        var line = [UInt8]()
        if lastByte != 0x0A { line.append(0x0A) }
        line += nonce
        line += json
        line.append(0x0A)
        line.withUnsafeBytes { writeOut($0) }
    }

    static func writeOut(_ bytes: UnsafeRawBufferPointer) {
        if bytes.count == 0 || harnessFailed { return }
        if !writeAll(outFd, bytes) {
            harnessFailed = true
            errText("harness: writing to stdout failed (output file size limit?)\n")
            return
        }
        written += bytes.count
        lastByte = bytes[bytes.count - 1]
    }

    static func errText(_ text: String) {
        _ = Array(text.utf8).withUnsafeBytes { writeAll(errFd, $0) }
    }

    @discardableResult
    static func writeAll(_ fd: Int32, _ bytes: UnsafeRawBufferPointer) -> Bool {
        var offset = 0
        while offset < bytes.count {
            let n = Glibc.write(fd, bytes.baseAddress! + offset, bytes.count - offset)
            if n > 0 { offset += n }
            else if n < 0 && Glibc.errno == Glibc.EINTR { continue }
            else { return false }
        }
        return true
    }

    // ---------------- system helpers ----------------
    static func now() -> Double {
        var t = Glibc.timespec()
        Glibc.clock_gettime(Glibc.CLOCK_MONOTONIC, &t)
        return Double(t.tv_sec) * 1000 + Double(t.tv_nsec) / 1_000_000
    }

    static func closeAll(_ fds: [Int32]) { for fd in fds where fd >= 0 { _ = Glibc.close(fd) } }

    static func appendInt(_ bytes: inout [UInt8], _ value: UInt64) {
        for s in Swift.stride(from: 0, to: 64, by: 8) { bytes.append(UInt8(truncatingIfNeeded: value >> UInt64(s))) }
    }

    // The soft RLIMIT_FSIZE, capped at dflt
    static func fileSizeLimit(_ dflt: Int) -> Int {
        var limit = Glibc.rlimit()
        if Glibc.getrlimit(Glibc.__rlimit_resource_t(Glibc.RLIMIT_FSIZE.rawValue), &limit) == 0 && limit.rlim_cur < Glibc.rlim_t(dflt) {
            return Int(limit.rlim_cur)
        }
        return dflt
    }

    // RLIMIT_CPU counts each process on its own: a test gets what the run has left
    static func cpuSecondsLeft() -> Int? {
        var limit = Glibc.rlimit()
        if Glibc.getrlimit(Glibc.__rlimit_resource_t(Glibc.RLIMIT_CPU.rawValue), &limit) != 0 || limit.rlim_cur == Glibc.rlim_t.max {
            return nil
        }
        var used = 0.0
        for who in [Glibc.RUSAGE_SELF.rawValue, Glibc.RUSAGE_CHILDREN.rawValue] {
            var usage = Glibc.rusage()
            if Glibc.getrusage(who, &usage) == 0 {
                used += Double(usage.ru_utime.tv_sec + usage.ru_stime.tv_sec)
                used += Double(usage.ru_utime.tv_usec + usage.ru_stime.tv_usec) / 1_000_000
            }
        }
        return Swift.max(1, Int((Double(limit.rlim_cur) - used).rounded(.up)))
    }

    // ---------------- reading the tests (called by the driver) ----------------
    static func bad(_ want: String, _ got: __J) -> __HInputError {
        return __HInputError("expected \(want), got \(got.kind)")
    }

    static func field(_ value: __J, _ key: String) throws -> __J {
        guard case .obj(let members) = value else { throw bad("object with key \"\(key)\"", value) }
        return members.first(where: { $0.0 == key })?.1 ?? .null
    }

    static func args(_ testCase: __J, _ key: String, _ n: Int) throws -> [__J] {
        let value = try field(testCase, key)
        guard case .arr(let all) = value else { throw bad("\(key) (JSON array)", value) }
        if all.count != n { throw __HInputError("expected \(n) value(s) in \"\(key)\", got \(all.count)") }
        return all
    }

    static func ops(_ testCase: __J) throws -> [__HOp] {
        let value = try field(testCase, "ops")
        guard case .arr(let all) = value else { throw bad("ops (JSON array)", value) }
        return try all.enumerated().map { k, op in
            guard case .arr(let parts) = op, let first = parts.first, case .str(let name) = first else {
                throw __HInputError("ops[\(k)] must be [\"name\", ...args]")
            }
            return __HOp(name: name, args: Array(parts.dropFirst()))
        }
    }

    static func opArity(_ op: __HOp, _ n: Int) throws {
        if op.args.count != n { throw __HInputError("op \"\(op.name)\" takes \(n) argument(s), got \(op.args.count)") }
    }

    static func unknownOp(_ name: String) -> __HInputError { return __HInputError("unknown op \"\(name)\"") }
}

struct __HInputError: Swift.Error, CustomStringConvertible {
    let message: String
    init(_ message: String) { self.message = message }
    var description: String { return message }
}

// Something wrong with the learner's answer, such as a list with a cycle
struct __HAnswerError: Swift.Error {
    let message: String
    init(_ message: String) { self.message = message }
}

struct __HOp {
    let name: String
    let args: [__J]
}

// A test's stderr, passed on as it arrives, without the runtime's own report
// of a crash (kept as the test's error instead). Lines that look like the
// runtime's are held back, and passed on if the test goes on without crashing.
struct __HStderr {
    var pending: [UInt8] = []
    var blankLines = 0
    var withheld: [UInt8] = []
    var lastData = 0.0
    var fatal: String? = nil
    // When the runtime started reporting a crash: when the test stopped
    var crashedAt = 0.0

    static let fatalKinds = ["Fatal error", "Precondition failed", "Assertion failed", "Could not cast value", "Simultaneous accesses"]

    mutating func feed(_ chunk: ArraySlice<UInt8>) {
        lastData = __H.now()
        for byte in chunk {
            pending.append(byte)
            if byte == 0x0A { line() }
        }
        if crashedAt == 0 && pending.starts(with: Array("*** ".utf8)) { crashedAt = lastData }
        if pending.count > 4096 { flushPending() }
    }

    // A partial line that has sat for a while isn't the runtime's (it writes
    // whole lines), so pass it on: the test may be stuck in a loop
    mutating func idle() {
        if !pending.isEmpty && __H.now() - lastData > 50 && !pending.starts(with: Array("*** ".utf8)) { flushPending() }
    }

    mutating func finish(crashed: Bool) {
        if crashed {
            // The runtime's report, then the backtracer's status lines
            withheld = []
            blankLines = 0
            if !pending.isEmpty && !pending.starts(with: Array("*** ".utf8)) && !runtimeText(String(decoding: pending, as: UTF8.self)) {
                flushPending()
            }
        } else {
            flushPending()
        }
        withheld = []
        pending = []
        blankLines = 0
    }

    mutating func line() {
        let text = String(decoding: pending.dropLast(), as: UTF8.self)
        if text.isEmpty {
            blankLines += 1
            pending = []
            if blankLines > 100 { flushBlank() }
            return
        }
        if runtimeText(text) {
            if crashedAt == 0 { crashedAt = lastData }
            withheld += [UInt8](repeating: 0x0A, count: blankLines) + pending
            blankLines = 0
            pending = []
            return
        }
        flushPending()
    }

    mutating func flushBlank() {
        if blankLines > 0 { _ = [UInt8](repeating: 0x0A, count: blankLines).withUnsafeBytes { __H.writeAll(__H.errFd, $0) } }
        blankLines = 0
    }

    // Everything held back so far, in order
    mutating func flushPending() {
        _ = withheld.withUnsafeBytes { __H.writeAll(__H.errFd, $0) }
        withheld = []
        flushBlank()
        _ = pending.withUnsafeBytes { __H.writeAll(__H.errFd, $0) }
        pending = []
    }

    // "Swift/Array.swift:418: Fatal error: Index out of range", and the
    // backtracer's "*** Signal 5: Backtracing from 0x... done ***"
    mutating func runtimeText(_ text: String) -> Bool {
        if text.hasPrefix("*** Signal ") || text.hasPrefix("*** Program crashed") { return true }
        for kind in __HStderr.fatalKinds {
            guard let range = text.firstRange(of: kind) else { continue }
            let before = text[..<range.lowerBound]
            // The runtime puts nothing or "Swift/Array.swift:418: " in front
            if before.isEmpty || (before.hasSuffix(": ") && before.contains(".swift:") && !before.dropLast(2).contains(" ")) {
                fatal = __HStderr.clean(String(text[range.lowerBound...]))
                return true
            }
        }
        return false
    }

    // Without the addresses: "Could not cast value of type 'Swift.String' to 'Swift.Int'."
    static func clean(_ text: String) -> String {
        var out = ""
        var rest = Substring(text)
        while let range = rest.firstRange(of: " (0x") ?? rest.firstRange(of: " to 0x") {
            out += rest[..<range.lowerBound]
            var after = rest[range.upperBound...].drop(while: { $0.isHexDigit })
            if after.first == ")" { after = after.dropFirst() }
            rest = after
        }
        return out + rest
    }
}

// ---------------- JSON ----------------
enum __J {
    case null
    case bool(Bool)
    case int(Int)
    case dbl(Double)
    case str(String)
    case arr([__J])
    case obj([(String, __J)])

    var kind: String {
        switch self {
        case .null: return "null"
        case .bool(let b): return "boolean \(b)"
        case .int(let n): return "number \(n)"
        case .dbl(let d): return "number \(d)"
        case .str(let s): return "string \"\(s.count > 20 ? String(s.prefix(20)) + "..." : s)\""
        case .arr: return "array"
        case .obj: return "object"
        }
    }

    subscript(key: String) -> __J? {
        guard case .obj(let members) = self else { return nil }
        return members.first(where: { $0.0 == key })?.1
    }
    var asString: String? { if case .str(let s) = self { return s }; return nil }
    var asInt: Int? { if case .int(let n) = self { return n }; return nil }
    var asBool: Bool? { if case .bool(let b) = self { return b }; return nil }
    var asArray: [__J]? { if case .arr(let a) = self { return a }; return nil }

    func write(_ o: inout [UInt8]) {
        switch self {
        case .null: o += Array("null".utf8)
        case .bool(let b): o += Array((b ? "true" : "false").utf8)
        case .int(let n): o += Array(String(n).utf8)
        // Shortest round-trip form; NaN and infinity as null
        case .dbl(let d): o += Array((d.isFinite ? d.description : "null").utf8)
        case .str(let s): __J.writeString(s, &o)
        case .arr(let items):
            o.append(0x5B)
            for (k, item) in items.enumerated() {
                if k > 0 { o.append(0x2C) }
                item.write(&o)
            }
            o.append(0x5D)
        case .obj(let members):
            o.append(0x7B)
            for (k, member) in members.enumerated() {
                if k > 0 { o.append(0x2C) }
                __J.writeString(member.0, &o)
                o.append(0x3A)
                member.1.write(&o)
            }
            o.append(0x7D)
        }
    }

    static func writeString(_ s: String, _ o: inout [UInt8]) {
        let hex = Array("0123456789abcdef".utf8)
        o.append(0x22)
        for c in s.utf8 {
            switch c {
            case 0x22: o += [0x5C, 0x22]
            case 0x5C: o += [0x5C, 0x5C]
            case 0x0A: o += [0x5C, 0x6E]
            case 0x0D: o += [0x5C, 0x72]
            case 0x09: o += [0x5C, 0x74]
            case 0x08: o += [0x5C, 0x62]
            case 0x0C: o += [0x5C, 0x66]
            case 0x00..<0x20: o += [0x5C, 0x75, 0x30, 0x30, hex[Int(c >> 4)], hex[Int(c & 0xF)]]
            default: o.append(c)
            }
        }
        o.append(0x22)
    }
}

struct __JParser {
    // A raw pointer: much faster byte access than [UInt8] at -Onone
    let b: UnsafePointer<UInt8>
    let n: Int
    var i = 0
    var depth = 0
    init(_ b: UnsafePointer<UInt8>, _ n: Int) { self.b = b; self.n = n }

    func fail(_ m: String) -> __HInputError { return __HInputError("bad JSON: \(m) at offset \(i)") }

    mutating func ws() {
        while i < n && (b[i] == 0x20 || b[i] == 0x0A || b[i] == 0x0D || b[i] == 0x09) { i += 1 }
    }

    mutating func document() throws -> __J {
        let v = try value()
        ws()
        if i != n { throw fail("trailing characters") }
        return v
    }

    mutating func value() throws -> __J {
        ws()
        if i >= n { throw fail("unexpected end of input") }
        switch b[i] {
        case 0x7B: return try object()
        case 0x5B: return try array()
        case 0x22: return .str(try string())
        case 0x74: try literal("true"); return .bool(true)
        case 0x66: try literal("false"); return .bool(false)
        case 0x6E: try literal("null"); return .null
        default: return try number()
        }
    }

    mutating func literal(_ word: String) throws {
        for u in word.utf8 {
            if i >= n || b[i] != u { throw fail("invalid literal") }
            i += 1
        }
    }

    mutating func nest() throws {
        depth += 1
        if depth > 512 { throw fail("nested more than 512 deep") }
    }

    mutating func array() throws -> __J {
        try nest()
        defer { depth -= 1 }
        i += 1
        var items: [__J] = []
        ws()
        if i < n && b[i] == 0x5D { i += 1; return .arr(items) }
        while true {
            items.append(try value())
            ws()
            if i >= n { throw fail("unterminated array") }
            if b[i] == 0x2C { i += 1; continue }
            if b[i] == 0x5D { i += 1; return .arr(items) }
            throw fail("expected ',' or ']'")
        }
    }

    mutating func object() throws -> __J {
        try nest()
        defer { depth -= 1 }
        i += 1
        var members: [(String, __J)] = []
        ws()
        if i < n && b[i] == 0x7D { i += 1; return .obj(members) }
        while true {
            ws()
            if i >= n || b[i] != 0x22 { throw fail("expected string key") }
            let key = try string()
            ws()
            if i >= n || b[i] != 0x3A { throw fail("expected ':'") }
            i += 1
            members.append((key, try value()))
            ws()
            if i >= n { throw fail("unterminated object") }
            if b[i] == 0x2C { i += 1; continue }
            if b[i] == 0x7D { i += 1; return .obj(members) }
            throw fail("expected ',' or '}'")
        }
    }

    mutating func hex4() throws -> UInt32 {
        if i + 4 > n { throw fail("bad unicode escape") }
        var v: UInt32 = 0
        for _ in 0..<4 {
            let c = b[i]
            let d: UInt32
            if c >= 0x30 && c <= 0x39 { d = UInt32(c - 0x30) }
            else if c >= 0x61 && c <= 0x66 { d = UInt32(c - 0x61 + 10) }
            else if c >= 0x41 && c <= 0x46 { d = UInt32(c - 0x41 + 10) }
            else { throw fail("bad unicode escape") }
            v = v * 16 + d
            i += 1
        }
        return v
    }

    mutating func string() throws -> String {
        i += 1
        let start = i
        while i < n && b[i] != 0x22 && b[i] != 0x5C { i += 1 }
        if i < n && b[i] == 0x22 {
            let s = String(decoding: UnsafeBufferPointer(start: b + start, count: i - start), as: UTF8.self)
            i += 1
            return s
        }
        var out = [UInt8](UnsafeBufferPointer(start: b + start, count: i - start))
        while true {
            if i >= n { throw fail("unterminated string") }
            let c = b[i]
            i += 1
            if c == 0x22 { break }
            if c != 0x5C { out.append(c); continue }
            if i >= n { throw fail("bad escape") }
            let e = b[i]
            i += 1
            switch e {
            case 0x22, 0x5C, 0x2F: out.append(e)
            case 0x62: out.append(0x08)
            case 0x66: out.append(0x0C)
            case 0x6E: out.append(0x0A)
            case 0x72: out.append(0x0D)
            case 0x74: out.append(0x09)
            case 0x75:
                var cp = try hex4()
                if cp >= 0xD800 && cp < 0xDC00 && i + 6 <= n && b[i] == 0x5C && b[i + 1] == 0x75 {
                    let save = i
                    i += 2
                    let low = try hex4()
                    if low >= 0xDC00 && low < 0xE000 { cp = 0x10000 + ((cp - 0xD800) << 10) + (low - 0xDC00) } else { i = save }
                }
                out += Array(String(Character(Unicode.Scalar(cp) ?? "\u{FFFD}")).utf8)
            default: throw fail("bad escape")
            }
        }
        return String(decoding: out, as: UTF8.self)
    }

    mutating func number() throws -> __J {
        let start = i
        var isFloat = false
        if i < n && b[i] == 0x2D { i += 1 }
        while i < n {
            let c = b[i]
            if c >= 0x30 && c <= 0x39 { i += 1 }
            else if c == 0x2E || c == 0x65 || c == 0x45 || c == 0x2B || c == 0x2D { isFloat = true; i += 1 }
            else { break }
        }
        if i == start { throw fail("unexpected character") }
        let text = String(decoding: UnsafeBufferPointer(start: b + start, count: i - start), as: UTF8.self)
        // Integers beyond 64 bits arrive as doubles, which the converters reject
        if !isFloat, let v = Int(text) { return .int(v) }
        guard let d = Double(text) else { throw fail("bad number '\(text)'") }
        if !d.isFinite { throw fail("number out of double range '\(text)'") }
        return .dbl(d)
    }
}

// ---------------- JSON to Swift, and answers back to JSON ----------------
// A type the tests pass in
protocol __HIn {
    static func __from(_ j: __J) throws -> Self
    // What a nil of this type arrives as: null, or [] for a list or tree
    static func __fromNullable(_ j: __J) throws -> Self?
}

extension __HIn {
    static func __fromNullable(_ j: __J) throws -> Self? {
        if case .null = j { return nil }
        return try __from(j)
    }
}

// A type an answer can be. Any of these is accepted, so a method may return
// [Int], ArraySlice<Int> or a Set where the spec says int[].
protocol __HOut {
    func __json() throws -> __J
    // What a nil of this type reports: null, or [] for a list or tree
    static var __nilJson: __J { get }
}

extension __HOut {
    static var __nilJson: __J { return .null }
}

func __in<T: __HIn>(_ j: __J) throws -> T { return try T.__from(j) }
func __json<T: __HOut>(_ value: T) throws -> __J { return try value.__json() }

extension Swift.Int: __HIn, __HOut {
    static func __from(_ j: __J) throws -> Int {
        switch j {
        case .int(let v): return v
        // Float-form integers only below 2^53, where they're exact
        case .dbl(let d) where d == d.rounded() && Swift.abs(d) < 9007199254740992.0: return Int(d)
        default: throw __H.bad("int", j)
        }
    }
    func __json() -> __J { return .int(self) }
}
extension Swift.Int8: __HOut { func __json() -> __J { return .int(Int(self)) } }
extension Swift.Int16: __HOut { func __json() -> __J { return .int(Int(self)) } }
extension Swift.Int32: __HOut { func __json() -> __J { return .int(Int(self)) } }
extension Swift.Int64: __HOut { func __json() -> __J { return .int(Int(self)) } }
extension Swift.UInt8: __HOut { func __json() -> __J { return .int(Int(self)) } }
extension Swift.UInt16: __HOut { func __json() -> __J { return .int(Int(self)) } }
extension Swift.UInt32: __HOut { func __json() -> __J { return .int(Int(self)) } }
extension Swift.UInt: __HOut { func __json() -> __J { return Int(exactly: self).map { .int($0) } ?? .dbl(Double(self)) } }
extension Swift.UInt64: __HOut { func __json() -> __J { return Int(exactly: self).map { .int($0) } ?? .dbl(Double(self)) } }

extension Swift.Double: __HIn, __HOut {
    static func __from(_ j: __J) throws -> Double {
        switch j {
        case .int(let v): return Double(v)
        case .dbl(let d): return d
        default: throw __H.bad("double", j)
        }
    }
    func __json() -> __J { return .dbl(self) }
}
extension Swift.Float: __HOut { func __json() -> __J { return .dbl(Double(self)) } }

extension Swift.Bool: __HIn, __HOut {
    static func __from(_ j: __J) throws -> Bool {
        guard case .bool(let v) = j else { throw __H.bad("bool", j) }
        return v
    }
    func __json() -> __J { return .bool(self) }
}

extension Swift.String: __HIn, __HOut {
    static func __from(_ j: __J) throws -> String {
        guard case .str(let v) = j else { throw __H.bad("string", j) }
        return v
    }
    func __json() -> __J { return .str(self) }
}
extension Swift.Substring: __HOut { func __json() -> __J { return .str(String(self)) } }

extension Swift.Character: __HIn, __HOut {
    static func __from(_ j: __J) throws -> Character {
        guard case .str(let s) = j, s.count == 1, let c = s.first else { throw __H.bad("char (1-char string)", j) }
        return c
    }
    func __json() -> __J { return .str(String(self)) }
}

extension Swift.Array: __HIn where Element: __HIn {
    static func __from(_ j: __J) throws -> [Element] {
        guard case .arr(let items) = j else { throw __H.bad("array", j) }
        return try items.map { try Element.__from($0) }
    }
}
extension Swift.Array: __HOut where Element: __HOut {
    func __json() throws -> __J { return .arr(try map { try $0.__json() }) }
}
extension Swift.ArraySlice: __HOut where Element: __HOut {
    func __json() throws -> __J { return .arr(try map { try $0.__json() }) }
}
extension Swift.ContiguousArray: __HOut where Element: __HOut {
    func __json() throws -> __J { return .arr(try map { try $0.__json() }) }
}
extension Swift.Set: __HOut where Element: __HOut {
    func __json() throws -> __J { return .arr(try map { try $0.__json() }) }
}

extension Swift.Optional: __HIn where Wrapped: __HIn {
    static func __from(_ j: __J) throws -> Wrapped? { return try Wrapped.__fromNullable(j) }
}
extension Swift.Optional: __HOut where Wrapped: __HOut {
    func __json() throws -> __J {
        guard let value = self else { return Wrapped.__nilJson }
        return try value.__json()
    }
}

extension Swift.Dictionary: __HIn where Key == String, Value: __HIn {
    static func __from(_ j: __J) throws -> [String: Value] {
        guard case .obj(let members) = j else { throw __H.bad("map (JSON object)", j) }
        var out: [String: Value] = [:]
        for (key, value) in members { out[key] = try Value.__from(value) }
        return out
    }
}
extension Swift.Dictionary: __HOut where Key == String, Value: __HOut {
    // Sorted keys: a Dictionary's order changes from run to run
    func __json() throws -> __J {
        return .obj(try keys.sorted().map { ($0, try self[$0]!.__json()) })
    }
}

func __call0<R>(_ f: () throws -> R) rethrows -> R {
    __H.tic()
    defer { __H.toc() }
    return try f()
}
func __call1<A0, R>(_ f: (A0) throws -> R, _ a0: A0) rethrows -> R {
    __H.tic()
    defer { __H.toc() }
    return try f(a0)
}
func __call2<A0, A1, R>(_ f: (A0, A1) throws -> R, _ a0: A0, _ a1: A1) rethrows -> R {
    __H.tic()
    defer { __H.toc() }
    return try f(a0, a1)
}
func __call3<A0, A1, A2, R>(_ f: (A0, A1, A2) throws -> R, _ a0: A0, _ a1: A1, _ a2: A2) rethrows -> R {
    __H.tic()
    defer { __H.toc() }
    return try f(a0, a1, a2)
}
func __call4<A0, A1, A2, A3, R>(_ f: (A0, A1, A2, A3) throws -> R, _ a0: A0, _ a1: A1, _ a2: A2, _ a3: A3) rethrows -> R {
    __H.tic()
    defer { __H.toc() }
    return try f(a0, a1, a2, a3)
}

// Reads the tests before the learner's top-level code runs
__H.start()
