
// ==== Skilled runner harness (Java 25) ====
// Appended after the learner's code (so their line N is line N of Main.java),
// with fully qualified names and no imports. docs/adding-a-language.md has
// the contract it keeps: what it reads from stdin and the lines it prints.
final class __H {
    private __H() {}
    // Big enough for about a million simple frames. Not more: unwinding a
    // StackOverflowError through JIT frames costs several times the stack in
    // memory, and a bigger stack gets the run killed instead of the test failed.
    static final long STACK_BYTES = 32L << 20;
    static final int ERROR_MAX_CHARS = 500;
    static final long LOG_CAP_PER_TEST = 64L << 10;
    static final long LOG_CAP_TOTAL = 256L << 10;
    // Worst-case bytes of one start line, error result and truncation note
    static final long ERROR_LINE_RESERVE = 800;
    static final java.nio.charset.Charset UTF8 = java.nio.charset.StandardCharsets.UTF_8;
    // stdout is capped by RLIMIT_FSIZE and the JVM ignores SIGXFSZ, so an
    // oversized write would fail mid-line. run() lowers this to the real limit.
    static long outBudget = 64L << 20;
    // Lines of the learner's code, set by the driver, to place errors
    static int userLines = 0;

    @FunctionalInterface interface Test { Object run(java.util.Map<?, ?> testCase) throws Throwable; }
    // A runner type that writes its own JSON (ListNode as a list, and so on)
    interface Json { void __json(StringBuilder sb); }
    static final class InputError extends RuntimeException { InputError(String m) { super(m); } }

    private static String nonce;
    private static Sink sink;
    private static java.io.PrintStream userOut;
    private static long t0, t1;
    private static boolean ticked, tocked;
    private static int opIndex = -1;
    private static String opName;
    private static volatile boolean harnessFailed;

    // ---------------- entry point (called from the generated Main.main) ----------------
    static void run(Test test) {
        java.util.List<Object> tests;
        try {
            String all = new String(System.in.readAllBytes(), UTF8);
            int nl = all.indexOf('\n');
            String n = (nl < 0 ? all : all.substring(0, nl)).trim();
            if (!n.matches("[0-9a-f]{32}")) throw new IllegalArgumentException("stdin line 1 must be a 32-char lowercase hex nonce");
            nonce = n;
            tests = list(field(new Parser(nl < 0 ? "" : all.substring(nl + 1)).document(), "tests"), "tests");
        } catch (Throwable e) {
            System.err.println("harness: cannot read test input: " + e);
            System.exit(86);
            return;
        }
        System.setIn(new java.io.ByteArrayInputStream(new byte[0]));
        outBudget = fileSizeLimit(outBudget);
        sink = new Sink(new java.io.BufferedOutputStream(new java.io.FileOutputStream(java.io.FileDescriptor.out), 1 << 16));
        userOut = new java.io.PrintStream(sink, true, UTF8);
        System.setOut(userOut);
        System.setErr(new java.io.PrintStream(new java.io.FileOutputStream(java.io.FileDescriptor.err), true, UTF8));
        Runtime.getRuntime().addShutdownHook(new Thread(() -> userOut.flush()));
        final java.util.List<Object> cases = tests;
        Thread worker = new Thread(null, () -> loop(test, cases), "skilled-tests", STACK_BYTES);
        worker.start();
        try { worker.join(); } catch (InterruptedException ignored) { }
        userOut.flush();
        System.exit(harnessFailed ? 86 : 0);
    }

    private static void loop(Test test, java.util.List<Object> tests) {
        try {
            for (int i = 0; i < tests.size(); i++) {
                sink.newTest();
                emit("{\"t\":\"start\",\"i\":" + i + "}");
                ticked = false; tocked = false; opIndex = -1; opName = null;
                StringBuilder line = new StringBuilder(96);
                long end = 0;
                try {
                    Object testCase = tests.get(i);
                    if (!(testCase instanceof java.util.Map)) throw bad("test object", testCase);
                    Object out = test.run((java.util.Map<?, ?>) testCase);
                    end = tocked ? t1 : System.nanoTime();
                    StringBuilder json = new StringBuilder();
                    write(json, out);
                    line.append("{\"t\":\"result\",\"i\":").append(i).append(",\"ok\":true,\"out\":").append(json);
                    line.append(",\"ms\":"); ms(line, end); line.append('}');
                } catch (Throwable e) {
                    if (end == 0) end = tocked ? t1 : System.nanoTime();
                    errorLine(line, i, describe(e), end);
                }
                byte[] bytes = (nonce + line + "\n").getBytes(UTF8);
                line = null;
                // Keep room for the remaining tests' start and error lines, their
                // capped logs and the done line
                long reserve = ERROR_LINE_RESERVE * (tests.size() - i) + sink.logRoomLeft() + 64;
                if (sink.written() + bytes.length + reserve > outBudget) {
                    StringBuilder small = new StringBuilder(160);
                    errorLine(small, i, "Your answer is too large to report", end);
                    bytes = (nonce + small + "\n").getBytes(UTF8);
                }
                emitBytes(bytes);
            }
            emit("{\"t\":\"done\"}");
        } catch (Throwable fatal) {
            harnessFailed = true;
            System.err.println("harness: internal failure: " + fatal);
        }
    }

    // ---------------- timing and the current operation (called by the driver) ----------------
    static void tic() { tocked = false; ticked = true; t0 = System.nanoTime(); }
    static void toc() { t1 = System.nanoTime(); tocked = true; }
    static void opAt(int k, String name) { opIndex = k; opName = name; }
    private static void ms(StringBuilder sb, long end) { dbl(sb, ticked ? Math.round((end - t0) / 1000.0) / 1000.0 : 0.0); }

    // ---------------- protocol output ----------------
    private static void emit(CharSequence json) { emitBytes((nonce + json + "\n").getBytes(UTF8)); }
    private static void emitBytes(byte[] line) {
        userOut.flush();
        if (!sink.harness(line) && !harnessFailed) {
            harnessFailed = true;
            System.err.println("harness: writing to stdout failed (output file size limit?)");
        }
    }
    private static void errorLine(StringBuilder sb, int i, String message, long end) {
        sb.append("{\"t\":\"result\",\"i\":").append(i).append(",\"ok\":false,\"error\":");
        str(sb, message);
        sb.append(",\"ms\":"); ms(sb, end); sb.append('}');
    }
    // The soft RLIMIT_FSIZE from /proc/self/limits, capped at dflt
    private static long fileSizeLimit(long dflt) {
        try {
            for (String l : java.nio.file.Files.readAllLines(java.nio.file.Paths.get("/proc/self/limits"))) {
                if (!l.startsWith("Max file size")) continue;
                String soft = l.substring("Max file size".length()).trim().split("\\s+")[0];
                return soft.equals("unlimited") ? dflt : Math.min(dflt, Long.parseLong(soft));
            }
        } catch (Throwable ignored) { }
        return dflt;
    }

    // Everything the learner prints goes through here, capped per test, and
    // flushed before each harness line so it lands in the right test's logs
    static final class Sink extends java.io.OutputStream {
        private final java.io.OutputStream out;
        private int last = '\n';
        private long testBytes, totalBytes, written;
        private boolean noted;
        private static final byte[] TRUNCATED = "\n… (output truncated)\n".getBytes(UTF8);
        Sink(java.io.OutputStream out) { this.out = out; }
        @Override public void write(int b) throws java.io.IOException { write(new byte[] {(byte) b}, 0, 1); }
        @Override public synchronized void write(byte[] b, int off, int len) throws java.io.IOException {
            if (len <= 0) return;
            long room = Math.min(LOG_CAP_PER_TEST - testBytes, LOG_CAP_TOTAL - totalBytes);
            int n = (int) Math.max(0, Math.min(len, room));
            if (n > 0) { out.write(b, off, n); last = b[off + n - 1]; testBytes += n; totalBytes += n; written += n; }
            if (n < len && !noted) {
                noted = true;
                out.write(TRUNCATED);
                written += TRUNCATED.length;
                last = '\n';
            }
        }
        @Override public synchronized void flush() throws java.io.IOException { out.flush(); }
        synchronized void newTest() { testBytes = 0; noted = false; }
        synchronized long written() { return written; }
        synchronized long logRoomLeft() { return Math.max(0, LOG_CAP_TOTAL - totalBytes) + TRUNCATED.length; }
        synchronized boolean harness(byte[] line) {
            try {
                if (last != '\n') { out.write('\n'); written++; }
                out.write(line);
                written += line.length;
                last = '\n';
                out.flush();
                return true;
            } catch (java.io.IOException e) {
                return false;
            }
        }
    }

    // "ArithmeticException: / by zero (line 5)", with the line only when it's
    // in the learner's code
    static String describe(Throwable e) {
        try {
            StringBuilder sb = new StringBuilder();
            String name = e.getClass().getName();
            sb.append(e instanceof InputError ? "HarnessInputError" : name.startsWith("java.lang.") ? name.substring(10) : name);
            if (e.getMessage() != null) sb.append(": ").append(e.getMessage());
            if (opIndex >= 0) sb.append(" [during call #").append(opIndex + 1).append(", ").append(opName).append("]");
            for (StackTraceElement f : e.getStackTrace()) {
                if ("Main.java".equals(f.getFileName()) && f.getLineNumber() > 0 && f.getLineNumber() <= userLines) {
                    sb.append(" (line ").append(f.getLineNumber()).append(')');
                    break;
                }
            }
            return sb.length() > ERROR_MAX_CHARS ? sb.substring(0, ERROR_MAX_CHARS) + "…" : sb.toString();
        } catch (Throwable again) {
            return e.getClass().getName();
        }
    }

    // ---------------- JSON reader ----------------
    static final class Parser {
        private final String s;
        private int i;
        private static final String[] ONE = new String[128];
        Parser(String s) { this.s = s; }
        Object document() {
            Object v = value();
            ws();
            if (i != s.length()) throw err("trailing characters");
            return v;
        }
        private IllegalArgumentException err(String m) { return new IllegalArgumentException("bad JSON: " + m + " at offset " + i); }
        private void ws() {
            while (i < s.length()) {
                char c = s.charAt(i);
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r') i++; else break;
            }
        }
        private Object value() {
            ws();
            if (i >= s.length()) throw err("unexpected end of input");
            char c = s.charAt(i);
            switch (c) {
                case '{': return object();
                case '[': return array();
                case '"': return string();
                case 't': return literal("true", Boolean.TRUE);
                case 'f': return literal("false", Boolean.FALSE);
                case 'n': return literal("null", null);
                default:
                    if (c == '-' || (c >= '0' && c <= '9')) return number();
                    throw err("unexpected character '" + c + "'");
            }
        }
        private Object literal(String w, Object v) {
            if (!s.startsWith(w, i)) throw err("invalid literal");
            i += w.length();
            return v;
        }
        private java.util.List<Object> array() {
            i++;
            java.util.ArrayList<Object> a = new java.util.ArrayList<>();
            ws();
            if (i < s.length() && s.charAt(i) == ']') { i++; return a; }
            while (true) {
                a.add(value());
                ws();
                if (i >= s.length()) throw err("unterminated array");
                char c = s.charAt(i++);
                if (c == ']') return a;
                if (c != ',') throw err("expected ',' or ']'");
            }
        }
        private java.util.Map<String, Object> object() {
            i++;
            java.util.LinkedHashMap<String, Object> m = new java.util.LinkedHashMap<>();
            ws();
            if (i < s.length() && s.charAt(i) == '}') { i++; return m; }
            while (true) {
                ws();
                if (i >= s.length() || s.charAt(i) != '"') throw err("expected string key");
                String k = string();
                ws();
                if (i >= s.length() || s.charAt(i) != ':') throw err("expected ':'");
                i++;
                m.put(k, value());
                ws();
                if (i >= s.length()) throw err("unterminated object");
                char c = s.charAt(i++);
                if (c == '}') return m;
                if (c != ',') throw err("expected ',' or '}'");
            }
        }
        private String string() {
            int start = ++i;
            while (i < s.length()) {
                char c = s.charAt(i);
                if (c == '"') {
                    i++;
                    if (i - start == 2 && s.charAt(start) < 128) {
                        char k = s.charAt(start);
                        String one = ONE[k];
                        return one != null ? one : (ONE[k] = String.valueOf(k));
                    }
                    return s.substring(start, i - 1);
                }
                if (c == '\\') break;
                i++;
            }
            StringBuilder b = new StringBuilder().append(s, start, i);
            while (true) {
                if (i >= s.length()) throw err("unterminated string");
                char c = s.charAt(i++);
                if (c == '"') return b.toString();
                if (c != '\\') { b.append(c); continue; }
                if (i >= s.length()) throw err("bad escape");
                char e = s.charAt(i++);
                switch (e) {
                    case '"': b.append('"'); break;
                    case '\\': b.append('\\'); break;
                    case '/': b.append('/'); break;
                    case 'b': b.append('\b'); break;
                    case 'f': b.append('\f'); break;
                    case 'n': b.append('\n'); break;
                    case 'r': b.append('\r'); break;
                    case 't': b.append('\t'); break;
                    case 'u': {
                        if (i + 4 > s.length()) throw err("bad unicode escape");
                        int cp = 0;
                        for (int k = 0; k < 4; k++) {
                            int d = Character.digit(s.charAt(i + k), 16);
                            if (d < 0) throw err("bad unicode escape");
                            cp = cp * 16 + d;
                        }
                        b.append((char) cp);
                        i += 4;
                        break;
                    }
                    default: throw err("bad escape");
                }
            }
        }
        private Object number() {
            int start = i;
            boolean isFloat = false;
            if (s.charAt(i) == '-') i++;
            while (i < s.length()) {
                char c = s.charAt(i);
                if (c >= '0' && c <= '9') i++;
                else if (c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-') { isFloat = true; i++; }
                else break;
            }
            String t = s.substring(start, i);
            try {
                // Integers beyond int64 stay exact, so converters reject them
                // instead of silently rounding
                if (!isFloat) {
                    try { return Long.parseLong(t); } catch (NumberFormatException tooBig) { return new java.math.BigInteger(t); }
                }
                double d = Double.parseDouble(t);
                if (Double.isInfinite(d)) throw err("number out of double range '" + t + "'");
                return d;
            } catch (NumberFormatException e) {
                throw err("bad number '" + t + "'");
            }
        }
    }

    // ---------------- JSON writer ----------------
    static void write(StringBuilder sb, Object v) {
        if (v == null) sb.append("null");
        else if (v instanceof String) str(sb, (String) v);
        else if (v instanceof Integer || v instanceof Long || v instanceof Short || v instanceof Byte) sb.append(((Number) v).longValue());
        else if (v instanceof Double) dbl(sb, (Double) v);
        else if (v instanceof Float) dbl(sb, (Float) v);
        else if (v instanceof Boolean) sb.append(((Boolean) v) ? "true" : "false");
        else if (v instanceof Character) str(sb, String.valueOf((char) (Character) v));
        else if (v instanceof Json) ((Json) v).__json(sb);
        else if (v instanceof int[]) { int[] a = (int[]) v; sb.append('['); for (int k = 0; k < a.length; k++) { if (k > 0) sb.append(','); sb.append(a[k]); } sb.append(']'); }
        else if (v instanceof long[]) { long[] a = (long[]) v; sb.append('['); for (int k = 0; k < a.length; k++) { if (k > 0) sb.append(','); sb.append(a[k]); } sb.append(']'); }
        else if (v instanceof double[]) { double[] a = (double[]) v; sb.append('['); for (int k = 0; k < a.length; k++) { if (k > 0) sb.append(','); dbl(sb, a[k]); } sb.append(']'); }
        else if (v instanceof boolean[]) { boolean[] a = (boolean[]) v; sb.append('['); for (int k = 0; k < a.length; k++) { if (k > 0) sb.append(','); sb.append(a[k] ? "true" : "false"); } sb.append(']'); }
        else if (v instanceof char[]) { char[] a = (char[]) v; sb.append('['); for (int k = 0; k < a.length; k++) { if (k > 0) sb.append(','); str(sb, String.valueOf(a[k])); } sb.append(']'); }
        else if (v instanceof Object[]) { Object[] a = (Object[]) v; sb.append('['); for (int k = 0; k < a.length; k++) { if (k > 0) sb.append(','); write(sb, a[k]); } sb.append(']'); }
        else if (v instanceof java.util.Map) {
            // Sorted keys, so a HashMap's order doesn't matter
            java.util.TreeMap<String, Object> sorted = new java.util.TreeMap<>();
            for (java.util.Map.Entry<?, ?> e : ((java.util.Map<?, ?>) v).entrySet()) sorted.put(String.valueOf(e.getKey()), e.getValue());
            sb.append('{');
            boolean first = true;
            for (java.util.Map.Entry<String, Object> e : sorted.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                str(sb, e.getKey());
                sb.append(':');
                write(sb, e.getValue());
            }
            sb.append('}');
        }
        else if (v instanceof Iterable) {
            sb.append('[');
            boolean first = true;
            for (Object x : (Iterable<?>) v) { if (!first) sb.append(','); first = false; write(sb, x); }
            sb.append(']');
        }
        else if (v instanceof java.math.BigInteger || v instanceof java.math.BigDecimal) sb.append(v.toString());
        else throw new IllegalStateException("can't report a value of type " + v.getClass().getName());
    }

    static void dbl(StringBuilder sb, double d) {
        if (Double.isNaN(d) || Double.isInfinite(d)) sb.append("null");
        else sb.append(Double.toString(d));
    }

    static void str(StringBuilder sb, String s) {
        sb.append('"');
        for (int k = 0; k < s.length(); k++) {
            char c = s.charAt(k);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                default:
                    boolean lone = Character.isHighSurrogate(c) ? !(k + 1 < s.length() && Character.isLowSurrogate(s.charAt(k + 1)))
                        : Character.isLowSurrogate(c) && !(k > 0 && Character.isHighSurrogate(s.charAt(k - 1)));
                    if (c < 0x20 || lone) {
                        sb.append("\\u");
                        String h = Integer.toHexString(c);
                        for (int p = h.length(); p < 4; p++) sb.append('0');
                        sb.append(h);
                    } else {
                        sb.append(c);
                    }
            }
        }
        sb.append('"');
    }

    // ---------------- JSON to Java ----------------
    static InputError bad(String want, Object got) { return new InputError("expected " + want + ", got " + kind(got)); }
    static String kind(Object o) {
        if (o == null) return "null";
        if (o instanceof String) { String s = (String) o; return "string \"" + (s.length() > 20 ? s.substring(0, 20) + "..." : s) + "\""; }
        if (o instanceof Long || o instanceof Double || o instanceof java.math.BigInteger) return "number " + o;
        if (o instanceof Boolean) return "boolean " + o;
        if (o instanceof java.util.List) return "array";
        if (o instanceof java.util.Map) return "object";
        return o.getClass().getName();
    }
    static Object field(Object o, String k) {
        if (!(o instanceof java.util.Map)) throw bad("object with key \"" + k + "\"", o);
        return ((java.util.Map<?, ?>) o).get(k);
    }
    @SuppressWarnings("unchecked")
    static java.util.List<Object> list(Object o, String what) {
        if (o instanceof java.util.List) return (java.util.List<Object>) o;
        throw bad(what + " (JSON array)", o);
    }
    static java.util.List<Object> args(java.util.Map<?, ?> testCase, String key, int n) {
        java.util.List<Object> a = list(testCase.get(key), key);
        if (a.size() != n) throw new InputError("expected " + n + " value(s) in \"" + key + "\", got " + a.size());
        return a;
    }
    static int toInt(Object o) {
        if (o instanceof Long) { long v = (Long) o; if (v >= Integer.MIN_VALUE && v <= Integer.MAX_VALUE) return (int) v; }
        else if (o instanceof Double) { double d = (Double) o; if (d == Math.rint(d) && d >= Integer.MIN_VALUE && d <= Integer.MAX_VALUE) return (int) d; }
        throw bad("int (32-bit)", o);
    }
    static long toLong(Object o) {
        if (o instanceof Long) return (Long) o;
        // Float-form integers only below 2^53, where they're exact
        if (o instanceof Double) { double d = (Double) o; if (d == Math.rint(d) && Math.abs(d) < 9007199254740992.0) return (long) d; }
        throw bad("long (64-bit int)", o);
    }
    static double toDouble(Object o) {
        if (o instanceof Long) return (double) (Long) o;
        if (o instanceof Double) return (Double) o;
        if (o instanceof java.math.BigInteger) { double d = ((java.math.BigInteger) o).doubleValue(); if (!Double.isInfinite(d)) return d; }
        throw bad("double", o);
    }
    static boolean toBool(Object o) {
        if (o instanceof Boolean) return (Boolean) o;
        throw bad("bool", o);
    }
    static String toStr(Object o) {
        if (o instanceof String) return (String) o;
        throw bad("string", o);
    }
    static char toChar(Object o) {
        if (o instanceof String && ((String) o).length() == 1) return ((String) o).charAt(0);
        throw bad("char (1-char string)", o);
    }
    static int[] toIntArr(Object o) { java.util.List<Object> a = list(o, "int[]"); int[] r = new int[a.size()]; for (int k = 0; k < r.length; k++) r[k] = toInt(a.get(k)); return r; }
    static long[] toLongArr(Object o) { java.util.List<Object> a = list(o, "long[]"); long[] r = new long[a.size()]; for (int k = 0; k < r.length; k++) r[k] = toLong(a.get(k)); return r; }
    static double[] toDoubleArr(Object o) { java.util.List<Object> a = list(o, "double[]"); double[] r = new double[a.size()]; for (int k = 0; k < r.length; k++) r[k] = toDouble(a.get(k)); return r; }
    static boolean[] toBoolArr(Object o) { java.util.List<Object> a = list(o, "bool[]"); boolean[] r = new boolean[a.size()]; for (int k = 0; k < r.length; k++) r[k] = toBool(a.get(k)); return r; }
    static char[] toCharArr(Object o) { java.util.List<Object> a = list(o, "char[]"); char[] r = new char[a.size()]; for (int k = 0; k < r.length; k++) r[k] = toChar(a.get(k)); return r; }
    static <T> T[] toArr(Object o, java.util.function.IntFunction<T[]> make, java.util.function.Function<Object, ? extends T> conv) {
        java.util.List<Object> a = list(o, "array");
        T[] r = make.apply(a.size());
        for (int k = 0; k < r.length; k++) r[k] = conv.apply(a.get(k));
        return r;
    }
    static <T> java.util.Map<String, T> toMap(Object o, java.util.function.Function<Object, ? extends T> conv) {
        if (!(o instanceof java.util.Map)) throw bad("map (JSON object)", o);
        java.util.HashMap<String, T> r = new java.util.HashMap<>();
        for (java.util.Map.Entry<?, ?> e : ((java.util.Map<?, ?>) o).entrySet()) r.put((String) e.getKey(), conv.apply(e.getValue()));
        return r;
    }
    static <T> T nul(Object o, java.util.function.Function<Object, ? extends T> conv) { return o == null ? null : conv.apply(o); }
    static java.util.List<java.util.List<Object>> ops(Object o) {
        java.util.List<Object> a = list(o, "ops");
        java.util.ArrayList<java.util.List<Object>> r = new java.util.ArrayList<>(a.size());
        for (int k = 0; k < a.size(); k++) {
            Object x = a.get(k);
            if (!(x instanceof java.util.List) || ((java.util.List<?>) x).isEmpty() || !(((java.util.List<?>) x).get(0) instanceof String))
                throw new InputError("ops[" + k + "] must be [\"name\", ...args]");
            r.add(list(x, "op"));
        }
        return r;
    }
    static void opArity(java.util.List<Object> op, int n) {
        if (op.size() - 1 != n) throw new InputError("op \"" + op.get(0) + "\" takes " + n + " argument(s), got " + (op.size() - 1));
    }
    static InputError unknownOp(String name) { return new InputError("unknown op \"" + name + "\""); }
    static final java.util.List<Object> EMPTY = java.util.Collections.emptyList();
}
