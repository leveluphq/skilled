// ==== Skilled runner harness (Go 1.27) ====
// Follows the learner's code in main.go, after a //line directive, so their
// line N is line N. Its packages are imported under __ aliases on the file's
// first line (runtimes/go.ts) and every name it declares starts with __, so
// the learner's own names and imports can't clash with it. It never uses the
// min and max builtins, which learners often redefine, and it has no backquote
// or block comment, so a raw string or comment the learner never closes runs
// to the end of the file and is reported where it starts.
// docs/adding-a-language.md has the contract it keeps: what it reads from stdin
// and the lines it prints.

const (
	// Runaway recursion ends in "fatal error: stack overflow" rather than
	// running out of memory: the stack is copied when it grows, so this stays
	// at a quarter of the 256 MB limit. About a million simple frames.
	__stackBytes    = 64 << 20
	__errorMaxChars = 500
	__logCapPerTest = 64 << 10
	__logCapTotal   = 256 << 10
	// Worst-case bytes of one start line, error result and truncation note
	__errorLineReserve = 800
	__truncatedNote    = "\n… (output truncated)\n"
)

// The harness writes to its own copy of fd 1, taken while package variables
// are set up, so a learner who reassigns os.Stdout can't redirect it
var __stdout = __dupStdout()

var (
	__nonce     string
	__userLines int
	__failed    bool
	// When stdout is a file (as in Docker and on Judge0), the learner's prints
	// go straight to it, so nothing is lost if the program crashes, and the
	// harness reads the file's offset before each of its lines to cap them
	__seekable bool
	// stdout opened for reading, to see whether the learner's output ended
	// with a newline
	__stdoutReader = -1
	// Where the last harness line ended, and the learner's output so far
	__mark     int64
	__testLog  int64
	__totalLog int64
	// stdout is capped by RLIMIT_FSIZE and Go ignores SIGXFSZ, so an
	// oversized write would fail mid-line. __setUpStdout lowers this to the
	// real limit.
	__outBudget int64 = 64 << 20
	// Timing of the learner's call, and the operation running in a design lesson
	__t0, __t1         __time.Time
	__ticked, __tocked bool
	__opIndex          = -1
	__opName           string
)

func __dupStdout() int {
	if fd, err := __syscall.Dup(1); err == nil {
		return fd
	}
	return 1
}

// ---------------- entry point (called from the generated main) ----------------

func __run(test func(map[string]any) any, userLines int) {
	__userLines = userLines
	__debug.SetMaxStack(__stackBytes)
	__defaultSigxcpu()
	var tests []any
	if msg := __try(func() { tests = __readTests() }); msg != "" {
		__os.Stderr.WriteString("harness: cannot read test input: " + msg + "\n")
		__os.Exit(86)
	}
	__setUpStdout()
	for i := range tests {
		testCase := tests[i]
		// Each test's JSON is garbage once its inputs are converted
		tests[i] = nil
		__testLog = 0
		__emit("{\"t\":\"start\",\"i\":" + __strconv.Itoa(i) + "}")
		line := __runOne(test, i, testCase)
		// Keep room for the remaining tests' start and error lines, their
		// capped logs and the done line
		reserve := int64(__errorLineReserve*(len(tests)-i)) + __logRoomLeft() + 64
		if __mark+int64(len(__nonce)+len(line)+1)+reserve > __outBudget {
			line = __errorLine(i, "Your answer is too large to report")
		}
		__emit(line)
	}
	__emit("{\"t\":\"done\"}")
	if __failed {
		__os.Exit(86)
	}
}

// Reads all of stdin (the nonce, then the tests) before any test runs, and
// leaves the learner nothing to read
func __readTests() []any {
	var data []byte
	buf := make([]byte, 1<<16)
	for {
		n, err := __syscall.Read(0, buf)
		if n > 0 {
			data = append(data, buf[:n]...)
		}
		if err == __syscall.EINTR {
			continue
		}
		if n <= 0 || err != nil {
			break
		}
	}
	__sealStdin()
	all := string(data)
	nl := __strings.IndexByte(all, '\n')
	if nl < 0 {
		panic(__inputError{"stdin has no test input"})
	}
	nonce := __strings.TrimSpace(all[:nl])
	if !__isNonce(nonce) {
		panic(__inputError{"stdin line 1 must be a 32-char lowercase hex nonce"})
	}
	__nonce = nonce
	parsed := __parseJSON(all[nl+1:])
	doc, ok := parsed.(map[string]any)
	if !ok {
		panic(__bad("object with key \"tests\"", parsed))
	}
	tests, ok := doc["tests"].([]any)
	if !ok {
		panic(__bad("tests (JSON array)", doc["tests"]))
	}
	return tests
}

func __isNonce(s string) bool {
	if len(s) != 32 {
		return false
	}
	for i := 0; i < len(s); i++ {
		if !(s[i] >= '0' && s[i] <= '9' || s[i] >= 'a' && s[i] <= 'f') {
			return false
		}
	}
	return true
}

// Puts /dev/null on fd 0 in one step: closing fd 0 instead lets the runtime's
// next file (its poller) take that number
func __sealStdin() {
	if fd, err := __syscall.Open("/dev/null", __syscall.O_RDONLY|__syscall.O_CLOEXEC, 0); err == nil && fd != 0 {
		__syscall.Dup3(fd, 0, 0)
		__syscall.Close(fd)
	}
}

// Go ignores SIGXCPU, so a learner's endless loop would run on to the hard CPU
// limit and be killed with SIGKILL, which reads as running out of memory. With
// the default action back, the soft limit ends the program as it would any
// other, and the server reports a time-out. No core file is written.
func __defaultSigxcpu() {
	__syscall.Setrlimit(__syscall.RLIMIT_CORE, &__syscall.Rlimit{})
	// A kernel struct sigaction, all zero: SIG_DFL, no flags, an empty mask
	var action [4]uint64
	__syscall.RawSyscall6(__syscall.SYS_RT_SIGACTION, uintptr(__syscall.SIGXCPU),
		uintptr(__unsafe.Pointer(&action)), 0, 8, 0, 0)
}

func __runOne(test func(map[string]any) any, i int, testCase any) string {
	__ticked, __tocked, __opIndex, __opName = false, false, -1, ""
	var out any
	msg := __try(func() {
		tc, ok := testCase.(map[string]any)
		if !ok {
			panic(__bad("test object", testCase))
		}
		out = test(tc)
	})
	end := __t1
	if !__tocked {
		end = __time.Now()
	}
	if msg != "" {
		return __errorLineAt(i, msg, end)
	}
	var b __strings.Builder
	if msg = __try(func() { __writeJSON(&b, out, nil) }); msg != "" {
		return __errorLineAt(i, msg, end)
	}
	return "{\"t\":\"result\",\"i\":" + __strconv.Itoa(i) + ",\"ok\":true,\"out\":" + b.String() +
		",\"ms\":" + __ms(end) + "}"
}

// ---------------- timing and the current operation (called by the driver) ----------------

func __tic() { __tocked, __ticked, __t0 = false, true, __time.Now() }
func __toc() { __t1, __tocked = __time.Now(), true }

func __opAt(k int, name string) { __opIndex, __opName = k, name }

func __ms(end __time.Time) string {
	if !__ticked {
		return "0"
	}
	micros := (end.Sub(__t0).Nanoseconds() + 500) / 1000
	return __strconv.FormatFloat(float64(micros)/1000, 'f', -1, 64)
}

// ---------------- protocol output ----------------

func __errorLine(i int, message string) string {
	end := __t1
	if !__tocked {
		end = __time.Now()
	}
	return __errorLineAt(i, message, end)
}

func __errorLineAt(i int, message string, end __time.Time) string {
	var b __strings.Builder
	b.WriteString("{\"t\":\"result\",\"i\":")
	b.WriteString(__strconv.Itoa(i))
	b.WriteString(",\"ok\":false,\"error\":")
	__writeString(&b, message)
	b.WriteString(",\"ms\":")
	b.WriteString(__ms(end))
	b.WriteByte('}')
	return b.String()
}

func __emit(line string) {
	__settleLogs()
	if !__write([]byte(__nonce+line+"\n")) && !__failed {
		__failed = true
		__os.Stderr.WriteString("harness: writing to stdout failed (output file size limit?)\n")
	}
	__updateMark(int64(len(__nonce) + len(line) + 1))
}

func __write(b []byte) bool {
	for len(b) > 0 {
		n, err := __syscall.Write(__stdout, b)
		if err == __syscall.EINTR {
			continue
		}
		if err != nil || n <= 0 {
			return false
		}
		b = b[n:]
	}
	return true
}

// The soft RLIMIT_FSIZE, and whether stdout is a file the harness can measure
func __setUpStdout() {
	var limit __syscall.Rlimit
	if __syscall.Getrlimit(__syscall.RLIMIT_FSIZE, &limit) == nil && limit.Cur < uint64(__outBudget) {
		__outBudget = int64(limit.Cur)
	}
	var stat __syscall.Stat_t
	if __syscall.Fstat(__stdout, &stat) != nil || stat.Mode&__syscall.S_IFMT != __syscall.S_IFREG {
		return
	}
	if pos, err := __syscall.Seek(__stdout, 0, 1); err == nil {
		__seekable, __mark = true, pos
	}
	if fd, err := __syscall.Open("/proc/self/fd/1", __syscall.O_RDONLY|__syscall.O_CLOEXEC, 0); err == nil {
		__stdoutReader = fd
	}
}

func __updateMark(written int64) {
	if __seekable {
		if pos, err := __syscall.Seek(__stdout, 0, 1); err == nil {
			__mark = pos
			return
		}
	}
	__mark += written
}

func __logRoomLeft() int64 {
	room := int64(__logCapTotal) - __totalLog
	if room < 0 {
		room = 0
	}
	return room + int64(len(__truncatedNote))
}

// Before a harness line: caps what the learner printed since the last one (by
// cutting the file back) and ends their last line, so the harness line starts
// on one of its own
func __settleLogs() {
	if !__seekable {
		return
	}
	pos, err := __syscall.Seek(__stdout, 0, 1)
	if err != nil || pos <= __mark {
		return
	}
	printed := pos - __mark
	room := int64(__logCapPerTest) - __testLog
	if total := int64(__logCapTotal) - __totalLog; total < room {
		room = total
	}
	if room < 0 {
		room = 0
	}
	if printed > room {
		end := __mark + room
		__syscall.Ftruncate(__stdout, end)
		__syscall.Seek(__stdout, end, 0)
		__testLog += room
		__totalLog += room
		__write([]byte(__truncatedNote))
		return
	}
	__testLog += printed
	__totalLog += printed
	last := []byte{0}
	if __stdoutReader < 0 {
		__write([]byte{'\n'})
	} else if n, err := __syscall.Pread(__stdoutReader, last, pos-1); err != nil || n != 1 || last[0] != '\n' {
		__write([]byte{'\n'})
	}
}

// ---------------- errors ----------------

// The test's input doesn't fit the lesson's types
type __inputError struct{ msg string }

// The learner's answer can't be turned into JSON
type __answerError struct{ msg string }

func __bad(want string, got any) __inputError {
	return __inputError{"expected " + want + ", got " + __kind(got)}
}

func __kind(v any) string {
	switch x := v.(type) {
	case nil:
		return "null"
	case string:
		if len(x) > 20 {
			x = x[:20] + "..."
		}
		return "string \"" + x + "\""
	case int64:
		return "number " + __strconv.FormatInt(x, 10)
	case float64:
		return "number " + __strconv.FormatFloat(x, 'g', -1, 64)
	case bool:
		return "boolean " + __strconv.FormatBool(x)
	case []any:
		return "array"
	case map[string]any:
		return "object"
	}
	return "unknown"
}

// Runs f, returning what it panicked with as an error message ("" if it didn't)
func __try(f func()) (msg string) {
	defer func() {
		if r := recover(); r != nil {
			msg = __describe(r, __panicLine())
		}
	}()
	f()
	return ""
}

// The learner's line the panic came from, or 0. Called while panicking, when
// the panicking frames are still on the stack.
func __panicLine() int {
	pcs := make([]uintptr, 64)
	frames := __runtime.CallersFrames(pcs[:__runtime.Callers(3, pcs)])
	for {
		frame, more := frames.Next()
		if (frame.File == "main.go" || __strings.HasSuffix(frame.File, "/main.go")) &&
			frame.Line > 0 && frame.Line <= __userLines {
			return frame.Line
		}
		if !more {
			return 0
		}
	}
}

// "panic: runtime error: integer divide by zero (line 5)", with the line only
// when it's in the learner's code
func __describe(r any, line int) (msg string) {
	defer func() {
		if recover() != nil {
			msg = "panic: (a value that can't be printed)"
		}
	}()
	var b __strings.Builder
	switch x := r.(type) {
	case __inputError:
		b.WriteString("HarnessInputError: " + x.msg)
	case __answerError:
		b.WriteString(x.msg)
	case error:
		b.WriteString("panic: " + x.Error())
	default:
		b.WriteString("panic: " + __fmt.Sprint(x))
	}
	if __opIndex >= 0 {
		b.WriteString(" [during call #" + __strconv.Itoa(__opIndex+1) + ", " + __opName + "]")
	}
	if line > 0 {
		b.WriteString(" (line " + __strconv.Itoa(line) + ")")
	}
	return __truncate(b.String(), __errorMaxChars)
}

// At most n characters, cut on a character boundary
func __truncate(s string, n int) string {
	count := 0
	for at := range s {
		if count == n {
			return s[:at] + "…"
		}
		count++
	}
	return s
}

// ---------------- JSON reader ----------------

type __parser struct {
	s   string
	pos int
}

func __parseJSON(s string) any {
	p := &__parser{s: s}
	v := p.value()
	p.ws()
	if p.pos != len(p.s) {
		p.fail("trailing characters")
	}
	return v
}

func (p *__parser) fail(what string) {
	panic(__inputError{"bad JSON: " + what + " at offset " + __strconv.Itoa(p.pos)})
}

func (p *__parser) ws() {
	for p.pos < len(p.s) {
		c := p.s[p.pos]
		if c != ' ' && c != '\t' && c != '\n' && c != '\r' {
			return
		}
		p.pos++
	}
}

func (p *__parser) value() any {
	p.ws()
	if p.pos >= len(p.s) {
		p.fail("unexpected end of input")
	}
	switch c := p.s[p.pos]; {
	case c == '{':
		return p.object()
	case c == '[':
		return p.array()
	case c == '"':
		// A one-character ASCII string (a cell of a grid), boxed once
		if p.pos+2 < len(p.s) && p.s[p.pos+2] == '"' && p.s[p.pos+1] < 0x80 && p.s[p.pos+1] != '\\' && p.s[p.pos+1] != '"' {
			p.pos += 3
			return __oneChar[p.s[p.pos-2]]
		}
		return p.str()
	case c == 't':
		return p.literal("true", true)
	case c == 'f':
		return p.literal("false", false)
	case c == 'n':
		return p.literal("null", nil)
	case c == '-' || c >= '0' && c <= '9':
		return p.number()
	}
	p.fail("unexpected character")
	return nil
}

func (p *__parser) literal(word string, v any) any {
	if !__strings.HasPrefix(p.s[p.pos:], word) {
		p.fail("invalid literal")
	}
	p.pos += len(word)
	return v
}

func (p *__parser) array() []any {
	p.pos++
	a := []any{}
	p.ws()
	if p.pos < len(p.s) && p.s[p.pos] == ']' {
		p.pos++
		return a
	}
	for {
		a = append(a, p.value())
		p.ws()
		if p.pos >= len(p.s) {
			p.fail("unterminated array")
		}
		c := p.s[p.pos]
		p.pos++
		if c == ']' {
			return a
		}
		if c != ',' {
			p.fail("expected ',' or ']'")
		}
	}
}

func (p *__parser) object() map[string]any {
	p.pos++
	m := map[string]any{}
	p.ws()
	if p.pos < len(p.s) && p.s[p.pos] == '}' {
		p.pos++
		return m
	}
	for {
		p.ws()
		if p.pos >= len(p.s) || p.s[p.pos] != '"' {
			p.fail("expected string key")
		}
		k := p.str()
		p.ws()
		if p.pos >= len(p.s) || p.s[p.pos] != ':' {
			p.fail("expected ':'")
		}
		p.pos++
		m[k] = p.value()
		p.ws()
		if p.pos >= len(p.s) {
			p.fail("unterminated object")
		}
		c := p.s[p.pos]
		p.pos++
		if c == '}' {
			return m
		}
		if c != ',' {
			p.fail("expected ',' or '}'")
		}
	}
}

var __oneChar = func() (t [128]any) {
	for i := range t {
		t[i] = string(rune(i))
	}
	return
}()

func (p *__parser) str() string {
	p.pos++
	start := p.pos
	for p.pos < len(p.s) && p.s[p.pos] != '"' && p.s[p.pos] != '\\' {
		p.pos++
	}
	if p.pos < len(p.s) && p.s[p.pos] == '"' {
		p.pos++
		return p.s[start : p.pos-1]
	}
	var b __strings.Builder
	b.WriteString(p.s[start:p.pos])
	for {
		if p.pos >= len(p.s) {
			p.fail("unterminated string")
		}
		c := p.s[p.pos]
		p.pos++
		if c == '"' {
			return b.String()
		}
		if c != '\\' {
			b.WriteByte(c)
			continue
		}
		if p.pos >= len(p.s) {
			p.fail("bad escape")
		}
		e := p.s[p.pos]
		p.pos++
		switch e {
		case '"', '\\', '/':
			b.WriteByte(e)
		case 'b':
			b.WriteByte('\b')
		case 'f':
			b.WriteByte('\f')
		case 'n':
			b.WriteByte('\n')
		case 'r':
			b.WriteByte('\r')
		case 't':
			b.WriteByte('\t')
		case 'u':
			r := p.hex4()
			if r >= 0xD800 && r < 0xDC00 && p.pos+6 <= len(p.s) && p.s[p.pos] == '\\' && p.s[p.pos+1] == 'u' {
				save := p.pos
				p.pos += 2
				if low := p.hex4(); low >= 0xDC00 && low < 0xE000 {
					r = 0x10000 + (r-0xD800)<<10 + (low - 0xDC00)
				} else {
					p.pos = save
				}
			}
			// A lone surrogate becomes U+FFFD
			b.WriteRune(rune(r))
		default:
			p.fail("bad escape")
		}
	}
}

func (p *__parser) hex4() int {
	if p.pos+4 > len(p.s) {
		p.fail("bad unicode escape")
	}
	r := 0
	for i := 0; i < 4; i++ {
		c := p.s[p.pos+i]
		switch {
		case c >= '0' && c <= '9':
			r = r*16 + int(c-'0')
		case c >= 'a' && c <= 'f':
			r = r*16 + int(c-'a') + 10
		case c >= 'A' && c <= 'F':
			r = r*16 + int(c-'A') + 10
		default:
			p.fail("bad unicode escape")
		}
	}
	p.pos += 4
	return r
}

// Integers as int64 and everything else as float64. An integer beyond int64
// becomes a float64, which the integer converters reject.
func (p *__parser) number() any {
	start := p.pos
	isFloat := false
	if p.s[p.pos] == '-' {
		p.pos++
	}
	for p.pos < len(p.s) {
		c := p.s[p.pos]
		if c >= '0' && c <= '9' {
			p.pos++
		} else if c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-' {
			isFloat = true
			p.pos++
		} else {
			break
		}
	}
	text := p.s[start:p.pos]
	if !isFloat {
		if n, err := __strconv.ParseInt(text, 10, 64); err == nil {
			return n
		}
	}
	f, err := __strconv.ParseFloat(text, 64)
	if err != nil {
		p.pos = start
		p.fail("bad number '" + text + "'")
	}
	return f
}

// ---------------- JSON writer ----------------

// A runner type that writes its own JSON (a ListNode as a list, and so on)
type __jsoner interface{ __json(b *__strings.Builder) }

var __jsonerType = __reflect.TypeOf((*__jsoner)(nil)).Elem()

// What a value's Go type can't say about how to report it: whether nil is null
// (the lesson's type is T?) or empty, and whether bytes and runes are chars
type __shape struct {
	nullable bool
	chars    bool
	of       *__shape
}

var __plain = &__shape{}

// A value with the shape of the lesson's type, from the driver
type __shaped struct {
	v any
	s *__shape
}

// Writes whatever the learner returned: any integer or float type, slices and
// arrays, maps with string keys, pointers, and the runner types
func __writeJSON(b *__strings.Builder, v any, s *__shape) {
	switch x := v.(type) {
	case nil:
		b.WriteString("null")
	case __shaped:
		__writeJSON(b, x.v, x.s)
	default:
		__writeValue(b, __reflect.ValueOf(v), s)
	}
}

func __writeValue(b *__strings.Builder, v __reflect.Value, s *__shape) {
	if s == nil {
		s = __plain
	}
	switch v.Kind() {
	case __reflect.Invalid:
		b.WriteString("null")
	case __reflect.Interface:
		if v.IsNil() {
			b.WriteString("null")
		} else {
			__writeJSON(b, v.Interface(), s)
		}
	case __reflect.Pointer:
		// A ListNode or BinaryNode writes itself, an empty one too
		if t := v.Type(); t.Implements(__jsonerType) && !t.Elem().Implements(__jsonerType) {
			v.Interface().(__jsoner).__json(b)
		} else if v.IsNil() {
			b.WriteString("null")
		} else {
			__writeValue(b, v.Elem(), s)
		}
	case __reflect.Bool:
		b.WriteString(__strconv.FormatBool(v.Bool()))
	case __reflect.Int, __reflect.Int8, __reflect.Int16, __reflect.Int32, __reflect.Int64:
		if s.chars && v.Kind() == __reflect.Int32 {
			__writeString(b, string(rune(v.Int())))
		} else {
			b.WriteString(__strconv.FormatInt(v.Int(), 10))
		}
	case __reflect.Uint, __reflect.Uint8, __reflect.Uint16, __reflect.Uint32, __reflect.Uint64, __reflect.Uintptr:
		if s.chars && v.Kind() == __reflect.Uint8 {
			__writeString(b, string(rune(v.Uint())))
		} else {
			b.WriteString(__strconv.FormatUint(v.Uint(), 10))
		}
	case __reflect.Float32:
		__writeFloat(b, v.Float(), 32)
	case __reflect.Float64:
		__writeFloat(b, v.Float(), 64)
	case __reflect.String:
		__writeString(b, v.String())
	case __reflect.Slice, __reflect.Array:
		if v.Kind() == __reflect.Slice && v.IsNil() && s.nullable {
			b.WriteString("null")
			return
		}
		b.WriteByte('[')
		for i, n := 0, v.Len(); i < n; i++ {
			if i > 0 {
				b.WriteByte(',')
			}
			__writeValue(b, v.Index(i), s.of)
		}
		b.WriteByte(']')
	case __reflect.Map:
		if v.IsNil() && s.nullable {
			b.WriteString("null")
			return
		}
		__writeMap(b, v, s)
	case __reflect.Struct:
		if v.CanInterface() {
			if j, ok := v.Interface().(__jsoner); ok {
				j.__json(b)
				return
			}
		}
		panic(__answerError{"Can't report a value of type " + v.Type().String()})
	default:
		panic(__answerError{"Can't report a value of type " + v.Type().String()})
	}
}

// Sorted keys, so a map's order doesn't matter
func __writeMap(b *__strings.Builder, v __reflect.Value, s *__shape) {
	keys := make([]string, 0, v.Len())
	values := map[string]__reflect.Value{}
	for it := v.MapRange(); it.Next(); {
		var key string
		switch k := it.Key(); k.Kind() {
		case __reflect.String:
			key = k.String()
		case __reflect.Int, __reflect.Int8, __reflect.Int16, __reflect.Int32, __reflect.Int64:
			key = __strconv.FormatInt(k.Int(), 10)
		default:
			panic(__answerError{"Can't report a map with keys of type " + k.Type().String()})
		}
		keys = append(keys, key)
		values[key] = it.Value()
	}
	__sortStrings(keys)
	b.WriteByte('{')
	for i, key := range keys {
		if i > 0 {
			b.WriteByte(',')
		}
		__writeString(b, key)
		b.WriteByte(':')
		__writeValue(b, values[key], s.of)
	}
	b.WriteByte('}')
}

func __sortStrings(a []string) {
	for i := 1; i < len(a); i++ {
		for j := i; j > 0 && a[j] < a[j-1]; j-- {
			a[j], a[j-1] = a[j-1], a[j]
		}
	}
}

// Shortest round-trip form, as JavaScript writes it; NaN and infinity as null
func __writeFloat(b *__strings.Builder, f float64, bits int) {
	if f != f || f > 1.7976931348623157e308 || f < -1.7976931348623157e308 {
		b.WriteString("null")
		return
	}
	abs := f
	if abs < 0 {
		abs = -abs
	}
	if abs == 0 || abs >= 1e-6 && abs < 1e21 {
		b.WriteString(__strconv.FormatFloat(f, 'f', -1, bits))
		return
	}
	e := __strconv.FormatFloat(f, 'e', -1, bits)
	// 1.5e-07 as 1.5e-7
	if n := len(e); n >= 4 && e[n-4] == 'e' && e[n-2] == '0' {
		e = e[:n-2] + e[n-1:]
	}
	b.WriteString(e)
}

// Escaped, and always valid UTF-8 (invalid bytes become U+FFFD)
func __writeString(b *__strings.Builder, s string) {
	const hex = "0123456789abcdef"
	b.WriteByte('"')
	for _, r := range s {
		switch {
		case r == '"':
			b.WriteString("\\\"")
		case r == '\\':
			b.WriteString("\\\\")
		case r == '\n':
			b.WriteString("\\n")
		case r == '\r':
			b.WriteString("\\r")
		case r == '\t':
			b.WriteString("\\t")
		case r == '\b':
			b.WriteString("\\b")
		case r == '\f':
			b.WriteString("\\f")
		case r < 0x20:
			b.WriteString("\\u00")
			b.WriteByte(hex[r>>4])
			b.WriteByte(hex[r&15])
		default:
			b.WriteRune(r)
		}
	}
	b.WriteByte('"')
}

// ---------------- JSON to Go ----------------

func __argsOf(testCase map[string]any, key string, n int) []any {
	a, ok := testCase[key].([]any)
	if !ok {
		panic(__bad(key+" (JSON array)", testCase[key]))
	}
	if len(a) != n {
		panic(__inputError{"expected " + __strconv.Itoa(n) + " value(s) in \"" + key + "\", got " + __strconv.Itoa(len(a))})
	}
	return a
}

func __jInt(v any) int {
	switch x := v.(type) {
	case int64:
		if x >= -2147483648 && x <= 2147483647 {
			return int(x)
		}
	case float64:
		if x >= -2147483648 && x <= 2147483647 && x == float64(int64(x)) {
			return int(x)
		}
	}
	panic(__bad("int (32-bit)", v))
}

func __jLong(v any) int64 {
	switch x := v.(type) {
	case int64:
		return x
	case float64:
		// Float-form integers only below 2^53, where they're exact
		if x > -9007199254740992.0 && x < 9007199254740992.0 && x == float64(int64(x)) {
			return int64(x)
		}
	}
	panic(__bad("long (64-bit int)", v))
}

func __jDouble(v any) float64 {
	switch x := v.(type) {
	case float64:
		return x
	case int64:
		return float64(x)
	}
	panic(__bad("double", v))
}

func __jBool(v any) bool {
	if x, ok := v.(bool); ok {
		return x
	}
	panic(__bad("bool", v))
}

func __jString(v any) string {
	if x, ok := v.(string); ok {
		return x
	}
	panic(__bad("string", v))
}

// A char is a byte, as on LeetCode: the lessons' chars are ASCII
func __jChar(v any) byte {
	if x, ok := v.(string); ok && len(x) == 1 {
		return x[0]
	}
	panic(__bad("char (1-character ASCII string)", v))
}

func __jArr[T any](convert func(any) T) func(any) []T {
	return func(v any) []T {
		a, ok := v.([]any)
		if !ok {
			panic(__bad("array", v))
		}
		out := make([]T, len(a))
		for i, x := range a {
			out[i] = convert(x)
		}
		return out
	}
}

func __jMap[T any](convert func(any) T) func(any) map[string]T {
	return func(v any) map[string]T {
		m, ok := v.(map[string]any)
		if !ok {
			panic(__bad("map (JSON object)", v))
		}
		out := make(map[string]T, len(m))
		for k, x := range m {
			out[k] = convert(x)
		}
		return out
	}
}

// T[]? and map<string,T>?: null is nil
func __jOrNil[T any](convert func(any) T) func(any) T {
	return func(v any) T {
		if v == nil {
			var zero T
			return zero
		}
		return convert(v)
	}
}

// int?, Interval? and so on: null is a nil pointer
func __jPtr[T any](convert func(any) T) func(any) *T {
	return func(v any) *T {
		if v == nil {
			return nil
		}
		x := convert(v)
		return &x
	}
}

// ---------------- design lessons: a list of operations ----------------

type __op struct {
	name string
	args []any
}

func __opsOf(v any) []__op {
	a, ok := v.([]any)
	if !ok {
		panic(__bad("ops (JSON array)", v))
	}
	ops := make([]__op, len(a))
	for k, x := range a {
		op, ok := x.([]any)
		if ok && len(op) > 0 {
			if name, ok := op[0].(string); ok {
				ops[k] = __op{name, op[1:]}
				continue
			}
		}
		panic(__inputError{"ops[" + __strconv.Itoa(k) + "] must be [\"name\", ...args]"})
	}
	return ops
}

func __opArity(op __op, n int) {
	if len(op.args) != n {
		panic(__inputError{"op \"" + op.name + "\" takes " + __strconv.Itoa(n) + " argument(s), got " + __strconv.Itoa(len(op.args))})
	}
}

func __unknownOp(name string) __inputError {
	return __inputError{"unknown op \"" + name + "\""}
}
