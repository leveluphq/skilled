
// ==== Skilled runner harness (Kotlin 2.4) ====
// Appended after the learner's code (so their line N is line N of Main.kt),
// with fully qualified names and no imports. docs/adding-a-language.md has
// the contract it keeps: what it reads from stdin and the lines it prints.
object __H {
    // Big enough for about a million simple frames. Not more: unwinding a
    // StackOverflowError through JIT frames costs several times the stack in
    // memory, and a bigger stack gets the run killed instead of the test failed.
    private const val STACK_BYTES: Long = 32L shl 20
    private const val ERROR_MAX_CHARS: Int = 500
    private const val LOG_CAP_PER_TEST: Long = 64L shl 10
    private const val LOG_CAP_TOTAL: Long = 256L shl 10
    // Worst-case bytes of one start line, error result and truncation note
    private const val ERROR_LINE_RESERVE: Long = 800
    private val UTF8: java.nio.charset.Charset = java.nio.charset.StandardCharsets.UTF_8
    // stdout is capped by RLIMIT_FSIZE and the JVM ignores SIGXFSZ, so an
    // oversized write would fail mid-line. run() lowers this to the real limit.
    private var outBudget: Long = 64L shl 20
    // Lines of the learner's code, set by the driver, to place errors
    @JvmField var userLines: Int = 0

    // A runner type that writes its own JSON (ListNode as a list, and so on)
    interface Json { fun __json(sb: java.lang.StringBuilder) }
    class InputError(message: kotlin.String) : java.lang.RuntimeException(message)

    private var nonce: kotlin.String = ""
    private var sink: Sink? = null
    private var userOut: java.io.PrintStream? = null
    private var t0: Long = 0
    private var t1: Long = 0
    private var ticked: Boolean = false
    private var tocked: Boolean = false
    private var opIndex: Int = -1
    private var opName: kotlin.String? = null
    @Volatile private var harnessFailed: Boolean = false

    // ---------------- entry point (called from the generated main) ----------------
    fun run(test: (kotlin.collections.Map<kotlin.String, Any?>) -> Any?) {
        val tests: kotlin.collections.List<Any?>
        try {
            val all = kotlin.text.String(java.lang.System.`in`.readAllBytes(), UTF8)
            val nl = all.indexOf('\n')
            val n = (if (nl < 0) all else all.substring(0, nl)).trim()
            if (n.length != 32 || n.any { !(it in '0'..'9' || it in 'a'..'f') }) {
                throw java.lang.IllegalArgumentException("stdin line 1 must be a 32-char lowercase hex nonce")
            }
            nonce = n
            tests = list(field(Parser(if (nl < 0) "" else all.substring(nl + 1)).document(), "tests"), "tests")
        } catch (e: kotlin.Throwable) {
            java.lang.System.err.println("harness: cannot read test input: " + e)
            java.lang.System.exit(86)
            return
        }
        java.lang.System.setIn(java.io.ByteArrayInputStream(kotlin.ByteArray(0)))
        outBudget = fileSizeLimit(outBudget)
        val s = Sink(java.io.BufferedOutputStream(java.io.FileOutputStream(java.io.FileDescriptor.out), 1 shl 16))
        val out = java.io.PrintStream(s, true, UTF8)
        sink = s
        userOut = out
        java.lang.System.setOut(out)
        java.lang.System.setErr(java.io.PrintStream(java.io.FileOutputStream(java.io.FileDescriptor.err), true, UTF8))
        java.lang.Runtime.getRuntime().addShutdownHook(java.lang.Thread { out.flush() })
        val worker = java.lang.Thread(null, { loop(test, tests, s) }, "skilled-tests", STACK_BYTES)
        worker.start()
        try { worker.join() } catch (ignored: java.lang.InterruptedException) { }
        out.flush()
        java.lang.System.exit(if (harnessFailed) 86 else 0)
    }

    private fun loop(test: (kotlin.collections.Map<kotlin.String, Any?>) -> Any?, tests: kotlin.collections.List<Any?>, sink: Sink) {
        try {
            for (i in 0 until tests.size) {
                sink.newTest()
                emit("{\"t\":\"start\",\"i\":" + i + "}")
                ticked = false; tocked = false; opIndex = -1; opName = null
                val line = java.lang.StringBuilder(96)
                var end = 0L
                try {
                    val testCase = tests[i]
                    if (testCase !is kotlin.collections.Map<*, *>) throw bad("test object", testCase)
                    @Suppress("UNCHECKED_CAST")
                    val out = test(testCase as kotlin.collections.Map<kotlin.String, Any?>)
                    end = if (tocked) t1 else java.lang.System.nanoTime()
                    val json = java.lang.StringBuilder()
                    write(json, out)
                    line.append("{\"t\":\"result\",\"i\":").append(i).append(",\"ok\":true,\"out\":").append(json)
                    line.append(",\"ms\":"); ms(line, end); line.append('}')
                } catch (e: kotlin.Throwable) {
                    if (end == 0L) end = if (tocked) t1 else java.lang.System.nanoTime()
                    line.setLength(0)
                    errorLine(line, i, describe(e), end)
                }
                var bytes = (nonce + line + "\n").toByteArray(UTF8)
                line.setLength(0)
                line.trimToSize()
                // Keep room for the remaining tests' start and error lines, their
                // capped logs and the done line
                val reserve = ERROR_LINE_RESERVE * (tests.size - i) + sink.logRoomLeft() + 64
                if (sink.written() + bytes.size + reserve > outBudget) {
                    val small = java.lang.StringBuilder(160)
                    errorLine(small, i, "Your answer is too large to report", end)
                    bytes = (nonce + small + "\n").toByteArray(UTF8)
                }
                emitBytes(bytes)
            }
            emit("{\"t\":\"done\"}")
        } catch (fatal: kotlin.Throwable) {
            harnessFailed = true
            java.lang.System.err.println("harness: internal failure: " + fatal)
        }
    }

    // ---------------- timing and the current operation (called by the driver) ----------------
    fun tic() { tocked = false; ticked = true; t0 = java.lang.System.nanoTime() }
    fun toc() { t1 = java.lang.System.nanoTime(); tocked = true }
    fun opAt(k: Int, name: kotlin.String) { opIndex = k; opName = name }
    private fun ms(sb: java.lang.StringBuilder, end: Long) {
        dbl(sb, if (ticked) java.lang.Math.round((end - t0) / 1000.0) / 1000.0 else 0.0)
    }

    // ---------------- protocol output ----------------
    private fun emit(json: kotlin.String) { emitBytes((nonce + json + "\n").toByteArray(UTF8)) }
    private fun emitBytes(line: kotlin.ByteArray) {
        userOut!!.flush()
        if (!sink!!.harness(line) && !harnessFailed) {
            harnessFailed = true
            java.lang.System.err.println("harness: writing to stdout failed (output file size limit?)")
        }
    }
    private fun errorLine(sb: java.lang.StringBuilder, i: Int, message: kotlin.String, end: Long) {
        sb.append("{\"t\":\"result\",\"i\":").append(i).append(",\"ok\":false,\"error\":")
        str(sb, message)
        sb.append(",\"ms\":"); ms(sb, end); sb.append('}')
    }
    // The soft RLIMIT_FSIZE from /proc/self/limits, capped at dflt
    private fun fileSizeLimit(dflt: Long): Long {
        try {
            for (l in java.nio.file.Files.readAllLines(java.nio.file.Paths.get("/proc/self/limits"))) {
                if (!l.startsWith("Max file size")) continue
                val soft = l.substring("Max file size".length).trim().split(' ')[0]
                return if (soft == "unlimited") dflt else java.lang.Math.min(dflt, java.lang.Long.parseLong(soft))
            }
        } catch (ignored: kotlin.Throwable) { }
        return dflt
    }

    // Everything the learner prints goes through here, capped per test, and
    // flushed before each harness line so it lands in the right test's logs
    private class Sink(private val out: java.io.OutputStream) : java.io.OutputStream() {
        private var last: Int = '\n'.code
        private var testBytes: Long = 0
        private var totalBytes: Long = 0
        private var written: Long = 0
        private var noted: Boolean = false
        private val truncated: kotlin.ByteArray = "\n… (output truncated)\n".toByteArray(java.nio.charset.StandardCharsets.UTF_8)
        override fun write(b: Int) { write(byteArrayOf(b.toByte()), 0, 1) }
        @Synchronized override fun write(b: kotlin.ByteArray, off: Int, len: Int) {
            if (len <= 0) return
            val room = java.lang.Math.min(LOG_CAP_PER_TEST - testBytes, LOG_CAP_TOTAL - totalBytes)
            val n = java.lang.Math.max(0L, java.lang.Math.min(len.toLong(), room)).toInt()
            if (n > 0) { out.write(b, off, n); last = b[off + n - 1].toInt(); testBytes += n; totalBytes += n; written += n }
            if (n < len && !noted) {
                noted = true
                out.write(truncated)
                written += truncated.size
                last = '\n'.code
            }
        }
        @Synchronized override fun flush() { out.flush() }
        @Synchronized fun newTest() { testBytes = 0; noted = false }
        @Synchronized fun written(): Long = written
        @Synchronized fun logRoomLeft(): Long = java.lang.Math.max(0L, LOG_CAP_TOTAL - totalBytes) + truncated.size
        @Synchronized fun harness(line: kotlin.ByteArray): Boolean {
            try {
                if (last != '\n'.code) { out.write('\n'.code); written++ }
                out.write(line)
                written += line.size
                last = '\n'.code
                out.flush()
                return true
            } catch (e: java.io.IOException) {
                return false
            }
        }
    }

    // "ArithmeticException: / by zero (line 5)", with the line only when it's
    // in the learner's code
    fun describe(e: kotlin.Throwable): kotlin.String {
        try {
            val sb = java.lang.StringBuilder()
            val name = e.javaClass.name
            val dot = name.lastIndexOf('.')
            sb.append(
                if (e is InputError) "HarnessInputError"
                else if ((name.startsWith("java.lang.") && dot == 9) || (name.startsWith("kotlin.") && dot == 6)) name.substring(dot + 1)
                else name
            )
            if (e.message != null) sb.append(": ").append(e.message)
            if (opIndex >= 0) sb.append(" [during call #").append(opIndex + 1).append(", ").append(opName).append(']')
            for (f in e.stackTrace) {
                if ("Main.kt" == f.fileName && f.lineNumber > 0 && f.lineNumber <= userLines) {
                    sb.append(" (line ").append(f.lineNumber).append(')')
                    break
                }
            }
            return if (sb.length > ERROR_MAX_CHARS) sb.substring(0, ERROR_MAX_CHARS) + "…" else sb.toString()
        } catch (again: kotlin.Throwable) {
            return e.javaClass.name
        }
    }

    // ---------------- JSON reader ----------------
    private class Parser(private val s: kotlin.String) {
        private var i: Int = 0
        fun document(): Any? {
            val v = value()
            ws()
            if (i != s.length) throw err("trailing characters")
            return v
        }
        private fun err(m: kotlin.String) = java.lang.IllegalArgumentException("bad JSON: " + m + " at offset " + i)
        private fun ws() {
            while (i < s.length) {
                val c = s[i]
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r') i++ else break
            }
        }
        private fun value(): Any? {
            ws()
            if (i >= s.length) throw err("unexpected end of input")
            val c = s[i]
            return when (c) {
                '{' -> obj()
                '[' -> array()
                '"' -> string()
                't' -> literal("true", true)
                'f' -> literal("false", false)
                'n' -> literal("null", null)
                else -> if (c == '-' || c in '0'..'9') number() else throw err("unexpected character '" + c + "'")
            }
        }
        private fun literal(w: kotlin.String, v: Any?): Any? {
            if (!s.startsWith(w, i)) throw err("invalid literal")
            i += w.length
            return v
        }
        private fun array(): kotlin.collections.List<Any?> {
            i++
            val a = java.util.ArrayList<Any?>()
            ws()
            if (i < s.length && s[i] == ']') { i++; return a }
            while (true) {
                a.add(value())
                ws()
                if (i >= s.length) throw err("unterminated array")
                val c = s[i++]
                if (c == ']') return a
                if (c != ',') throw err("expected ',' or ']'")
            }
        }
        private fun obj(): kotlin.collections.Map<kotlin.String, Any?> {
            i++
            val m = java.util.LinkedHashMap<kotlin.String, Any?>()
            ws()
            if (i < s.length && s[i] == '}') { i++; return m }
            while (true) {
                ws()
                if (i >= s.length || s[i] != '"') throw err("expected string key")
                val k = string()
                ws()
                if (i >= s.length || s[i] != ':') throw err("expected ':'")
                i++
                m.put(k, value())
                ws()
                if (i >= s.length) throw err("unterminated object")
                val c = s[i++]
                if (c == '}') return m
                if (c != ',') throw err("expected ',' or '}'")
            }
        }
        private fun string(): kotlin.String {
            val start = ++i
            while (i < s.length) {
                val c = s[i]
                if (c == '"') { i++; return s.substring(start, i - 1) }
                if (c == '\\') break
                i++
            }
            val b = java.lang.StringBuilder().append(s, start, i)
            while (true) {
                if (i >= s.length) throw err("unterminated string")
                val c = s[i++]
                if (c == '"') return b.toString()
                if (c != '\\') { b.append(c); continue }
                if (i >= s.length) throw err("bad escape")
                when (s[i++]) {
                    '"' -> b.append('"')
                    '\\' -> b.append('\\')
                    '/' -> b.append('/')
                    'b' -> b.append('\b')
                    'f' -> b.append('\u000C')
                    'n' -> b.append('\n')
                    'r' -> b.append('\r')
                    't' -> b.append('\t')
                    'u' -> {
                        if (i + 4 > s.length) throw err("bad unicode escape")
                        var cp = 0
                        for (k in 0 until 4) {
                            val d = java.lang.Character.digit(s[i + k], 16)
                            if (d < 0) throw err("bad unicode escape")
                            cp = cp * 16 + d
                        }
                        b.append(cp.toChar())
                        i += 4
                    }
                    else -> throw err("bad escape")
                }
            }
        }
        private fun number(): Any {
            val start = i
            var isFloat = false
            if (s[i] == '-') i++
            while (i < s.length) {
                val c = s[i]
                if (c in '0'..'9') i++
                else if (c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-') { isFloat = true; i++ }
                else break
            }
            val t = s.substring(start, i)
            try {
                // Integers beyond int64 stay exact, so converters reject them
                // instead of silently rounding
                if (!isFloat) {
                    try { return java.lang.Long.parseLong(t) } catch (tooBig: java.lang.NumberFormatException) { return java.math.BigInteger(t) }
                }
                val d = java.lang.Double.parseDouble(t)
                if (d.isInfinite()) throw err("number out of double range '" + t + "'")
                return d
            } catch (e: java.lang.NumberFormatException) {
                throw err("bad number '" + t + "'")
            }
        }
    }

    // ---------------- JSON writer ----------------
    fun write(sb: java.lang.StringBuilder, v: Any?) {
        when (v) {
            null, is Unit -> sb.append("null")
            is kotlin.String -> str(sb, v)
            is Int -> sb.append(v)
            is Long -> sb.append(v)
            is Short -> sb.append(v.toInt())
            is Byte -> sb.append(v.toInt())
            is Double -> dbl(sb, v)
            is Float -> dbl(sb, v.toDouble())
            is Boolean -> sb.append(if (v) "true" else "false")
            is Char -> str(sb, v.toString())
            is Json -> v.__json(sb)
            is kotlin.IntArray -> { sb.append('['); for (k in v.indices) { if (k > 0) sb.append(','); sb.append(v[k]) }; sb.append(']') }
            is kotlin.LongArray -> { sb.append('['); for (k in v.indices) { if (k > 0) sb.append(','); sb.append(v[k]) }; sb.append(']') }
            is kotlin.DoubleArray -> { sb.append('['); for (k in v.indices) { if (k > 0) sb.append(','); dbl(sb, v[k]) }; sb.append(']') }
            is kotlin.BooleanArray -> { sb.append('['); for (k in v.indices) { if (k > 0) sb.append(','); sb.append(if (v[k]) "true" else "false") }; sb.append(']') }
            is kotlin.CharArray -> { sb.append('['); for (k in v.indices) { if (k > 0) sb.append(','); str(sb, v[k].toString()) }; sb.append(']') }
            is kotlin.Array<*> -> { sb.append('['); for (k in v.indices) { if (k > 0) sb.append(','); write(sb, v[k]) }; sb.append(']') }
            is kotlin.collections.Map<*, *> -> {
                // Sorted keys, so a HashMap's order doesn't matter
                val sorted = java.util.TreeMap<kotlin.String, Any?>()
                for (e in v.entries) sorted.put(e.key.toString(), e.value)
                sb.append('{')
                var first = true
                for (e in sorted.entries) {
                    if (!first) sb.append(',')
                    first = false
                    str(sb, e.key)
                    sb.append(':')
                    write(sb, e.value)
                }
                sb.append('}')
            }
            is kotlin.collections.Iterable<*> -> {
                sb.append('[')
                var first = true
                for (x in v) { if (!first) sb.append(','); first = false; write(sb, x) }
                sb.append(']')
            }
            // A pair reads as a two-element list (a pair of indexes, say)
            is kotlin.Pair<*, *> -> { sb.append('['); write(sb, v.first); sb.append(','); write(sb, v.second); sb.append(']') }
            is java.math.BigInteger, is java.math.BigDecimal -> sb.append(v.toString())
            else -> throw java.lang.IllegalStateException("can't report a value of type " + v.javaClass.name)
        }
    }

    fun dbl(sb: java.lang.StringBuilder, d: Double) {
        if (d.isNaN() || d.isInfinite()) sb.append("null") else sb.append(java.lang.Double.toString(d))
    }

    fun str(sb: java.lang.StringBuilder, s: kotlin.String) {
        sb.append('"')
        for (k in 0 until s.length) {
            val c = s[k]
            when (c) {
                '"' -> sb.append("\\\"")
                '\\' -> sb.append("\\\\")
                '\n' -> sb.append("\\n")
                '\r' -> sb.append("\\r")
                '\t' -> sb.append("\\t")
                '\b' -> sb.append("\\b")
                '\u000C' -> sb.append("\\f")
                else -> {
                    val lone = if (java.lang.Character.isHighSurrogate(c)) !(k + 1 < s.length && java.lang.Character.isLowSurrogate(s[k + 1]))
                        else java.lang.Character.isLowSurrogate(c) && !(k > 0 && java.lang.Character.isHighSurrogate(s[k - 1]))
                    if (c.code < 0x20 || lone) {
                        sb.append("\\u")
                        val h = java.lang.Integer.toHexString(c.code)
                        for (p in h.length until 4) sb.append('0')
                        sb.append(h)
                    } else {
                        sb.append(c)
                    }
                }
            }
        }
        sb.append('"')
    }

    // ---------------- JSON to Kotlin ----------------
    fun bad(want: kotlin.String, got: Any?): InputError = InputError("expected " + want + ", got " + kind(got))
    private fun kind(o: Any?): kotlin.String = when (o) {
        null -> "null"
        is kotlin.String -> "string \"" + (if (o.length > 20) o.substring(0, 20) + "..." else o) + "\""
        is Long, is Double, is java.math.BigInteger -> "number " + o
        is Boolean -> "boolean " + o
        is kotlin.collections.List<*> -> "array"
        is kotlin.collections.Map<*, *> -> "object"
        else -> o.javaClass.name
    }
    fun field(o: Any?, k: kotlin.String): Any? {
        if (o !is kotlin.collections.Map<*, *>) throw bad("object with key \"" + k + "\"", o)
        return o.get(k)
    }
    @Suppress("UNCHECKED_CAST")
    fun list(o: Any?, what: kotlin.String): kotlin.collections.List<Any?> {
        if (o is kotlin.collections.List<*>) return o as kotlin.collections.List<Any?>
        throw bad(what + " (JSON array)", o)
    }
    fun args(testCase: kotlin.collections.Map<kotlin.String, Any?>, key: kotlin.String, n: Int): kotlin.collections.List<Any?> {
        val a = list(testCase.get(key), key)
        if (a.size != n) throw InputError("expected " + n + " value(s) in \"" + key + "\", got " + a.size)
        return a
    }
    fun toInt(o: Any?): Int {
        if (o is Long) { if (o >= Int.MIN_VALUE && o <= Int.MAX_VALUE) return o.toInt() }
        else if (o is Double) { if (o == java.lang.Math.rint(o) && o >= Int.MIN_VALUE && o <= Int.MAX_VALUE) return o.toInt() }
        throw bad("int (32-bit)", o)
    }
    fun toLong(o: Any?): Long {
        if (o is Long) return o
        // Float-form integers only below 2^53, where they're exact
        if (o is Double && o == java.lang.Math.rint(o) && java.lang.Math.abs(o) < 9007199254740992.0) return o.toLong()
        throw bad("long (64-bit int)", o)
    }
    fun toDouble(o: Any?): Double {
        if (o is Long) return o.toDouble()
        if (o is Double) return o
        if (o is java.math.BigInteger) { val d = o.toDouble(); if (!d.isInfinite()) return d }
        throw bad("double", o)
    }
    fun toBool(o: Any?): Boolean {
        if (o is Boolean) return o
        throw bad("bool", o)
    }
    fun toStr(o: Any?): kotlin.String {
        if (o is kotlin.String) return o
        throw bad("string", o)
    }
    fun toChar(o: Any?): Char {
        if (o is kotlin.String && o.length == 1) return o[0]
        throw bad("char (1-char string)", o)
    }
    fun toIntArr(o: Any?): kotlin.IntArray { val a = list(o, "IntArray"); return kotlin.IntArray(a.size) { toInt(a[it]) } }
    fun toLongArr(o: Any?): kotlin.LongArray { val a = list(o, "LongArray"); return kotlin.LongArray(a.size) { toLong(a[it]) } }
    fun toDoubleArr(o: Any?): kotlin.DoubleArray { val a = list(o, "DoubleArray"); return kotlin.DoubleArray(a.size) { toDouble(a[it]) } }
    fun toBoolArr(o: Any?): kotlin.BooleanArray { val a = list(o, "BooleanArray"); return kotlin.BooleanArray(a.size) { toBool(a[it]) } }
    fun toCharArr(o: Any?): kotlin.CharArray { val a = list(o, "CharArray"); return kotlin.CharArray(a.size) { toChar(a[it]) } }
    inline fun <reified T> toArr(o: Any?, conv: (Any?) -> T): kotlin.Array<T> {
        val a = list(o, "array")
        return kotlin.Array(a.size) { conv(a[it]) }
    }
    inline fun <T> toMap(o: Any?, conv: (Any?) -> T): kotlin.collections.Map<kotlin.String, T> {
        if (o !is kotlin.collections.Map<*, *>) throw bad("map (JSON object)", o)
        val r = java.util.LinkedHashMap<kotlin.String, T>()
        for (e in o.entries) r.put(e.key as kotlin.String, conv(e.value))
        return r
    }
    inline fun <T> nul(o: Any?, conv: (Any?) -> T): T? = if (o == null) null else conv(o)
    fun ops(o: Any?): kotlin.collections.List<kotlin.collections.List<Any?>> {
        val a = list(o, "ops")
        val r = java.util.ArrayList<kotlin.collections.List<Any?>>(a.size)
        for (k in 0 until a.size) {
            val x = a[k]
            if (x !is kotlin.collections.List<*> || x.isEmpty() || x[0] !is kotlin.String) {
                throw InputError("ops[" + k + "] must be [\"name\", ...args]")
            }
            r.add(list(x, "op"))
        }
        return r
    }
    fun opArity(op: kotlin.collections.List<Any?>, n: Int) {
        if (op.size - 1 != n) throw InputError("op \"" + op[0] + "\" takes " + n + " argument(s), got " + (op.size - 1))
    }
    fun unknownOp(name: kotlin.String): InputError = InputError("unknown op \"" + name + "\"")
    @JvmField val EMPTY: kotlin.collections.List<Any?> = java.util.Collections.emptyList()
}
