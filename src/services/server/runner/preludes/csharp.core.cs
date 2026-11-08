
// ==== Skilled runner harness (C# 14 on .NET 10) ====
// Appended after the learner's code under `#line 1 "__harness.cs"`, so their
// line N is still line N of Main.cs. It lives in namespace __Skilled with its
// own usings, which C# searches before the global namespace, so a learner's
// class named Console, H or Test can't change what a name here means.
// docs/adding-a-language.md has the contract it keeps: what it reads from stdin
// and the lines it prints.
#nullable disable
#pragma warning disable
namespace __Skilled {
using global::System;
using global::System.Collections;
using global::System.Collections.Generic;
using global::System.Diagnostics;
using global::System.Globalization;
using global::System.IO;
using global::System.Numerics;
using global::System.Text;
using global::System.Threading;

delegate object Test(Dictionary<string, object> testCase);
// A runner type that writes its own JSON (ListNode as a list, and so on)
interface IJson { void WriteJson(StringBuilder sb); }
sealed class InputError : Exception { public InputError(string m) : base(m) { } }

static class H {
    // .NET can't catch a stack overflow: it ends the run, and the server
    // blames the running test. So the stack only has to fit the deepest
    // correct solutions: 256 MB is well over a million simple frames, and
    // running out of it still comes before running out of memory.
    const int StackBytes = 256 << 20;
    const int ErrorMaxChars = 500;
    internal const long LogCapPerTest = 64L << 10;
    internal const long LogCapTotal = 256L << 10;
    // Worst-case bytes of one start line, error result and truncation note
    const long ErrorLineReserve = 800;
    internal static readonly UTF8Encoding Utf8 = new UTF8Encoding(false);
    internal static readonly CultureInfo Inv = CultureInfo.InvariantCulture;
    // stdout is capped by RLIMIT_FSIZE, and going over it kills the process
    // (SIGXFSZ), so Run() lowers this to the real limit
    static long outBudget = 64L << 20;
    // Lines of the learner's code, set by the driver, to place errors
    public static int UserLines = 0;

    static string nonce;
    static Sink sink;
    static long t0, t1;
    static bool ticked, tocked;
    static int opIndex = -1;
    static string opName;
    static volatile bool harnessFailed;

    // ---------------- entry point (called from the driver's Main) ----------------
    public static void Run(Test test) {
        List<object> tests;
        try {
            var input = new MemoryStream();
            using (Stream stdin = Console.OpenStandardInput()) stdin.CopyTo(input);
            string all = Utf8.GetString(input.GetBuffer(), 0, (int)input.Length);
            int nl = all.IndexOf('\n');
            string n = (nl < 0 ? all : all.Substring(0, nl)).Trim();
            if (!IsNonce(n)) throw new ArgumentException("stdin line 1 must be a 32-char lowercase hex nonce");
            nonce = n;
            tests = List(Field(new Parser(nl < 0 ? "" : all.Substring(nl + 1)).Document(), "tests"), "tests");
        } catch (Exception e) {
            Console.Error.WriteLine("harness: cannot read test input: " + e.Message);
            Environment.Exit(86);
            return;
        }
        Console.SetIn(TextReader.Null);
        outBudget = FileSizeLimit(outBudget);
        sink = new Sink(Console.OpenStandardOutput());
        Console.SetOut(sink);
        // Environment.Exit in the learner's code still shows what they printed
        AppDomain.CurrentDomain.ProcessExit += (_, _) => sink.Flush();
        var worker = new Thread(() => Loop(test, tests), StackBytes) { Name = "skilled-tests" };
        worker.Start();
        worker.Join();
        sink.Flush();
        // Exit, rather than return, so threads the learner started can't keep the run going
        Environment.Exit(harnessFailed ? 86 : 0);
    }

    static bool IsNonce(string s) {
        if (s.Length != 32) return false;
        foreach (char c in s) if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))) return false;
        return true;
    }

    static void Loop(Test test, List<object> tests) {
        try {
            Thread.CurrentThread.CurrentCulture = Inv;
            Thread.CurrentThread.CurrentUICulture = Inv;
            for (int i = 0; i < tests.Count; i++) {
                sink.NewTest();
                Emit("{\"t\":\"start\",\"i\":" + i.ToString(Inv) + "}");
                ticked = false; tocked = false; opIndex = -1; opName = null;
                var line = new StringBuilder(96);
                long end = 0;
                try {
                    object testCase = tests[i];
                    if (!(testCase is Dictionary<string, object> map)) throw Bad("test object", testCase);
                    object result = test(map);
                    end = tocked ? t1 : Stopwatch.GetTimestamp();
                    var json = new StringBuilder();
                    Write(json, result);
                    line.Append("{\"t\":\"result\",\"i\":").Append(i.ToString(Inv)).Append(",\"ok\":true,\"out\":").Append(json);
                    line.Append(",\"ms\":"); Ms(line, end); line.Append('}');
                } catch (Exception e) {
                    if (end == 0) end = tocked ? t1 : Stopwatch.GetTimestamp();
                    line.Clear();
                    ErrorLine(line, i, Describe(e), end);
                }
                byte[] bytes = Utf8.GetBytes(nonce + line + "\n");
                line = null;
                // Keep room for the remaining tests' start and error lines, their
                // capped logs and the done line
                long reserve = ErrorLineReserve * (tests.Count - i) + sink.LogRoomLeft + 64;
                if (sink.Written + bytes.Length + reserve > outBudget) {
                    var small = new StringBuilder(160);
                    ErrorLine(small, i, "Your answer is too large to report", end);
                    bytes = Utf8.GetBytes(nonce + small + "\n");
                }
                EmitBytes(bytes);
            }
            Emit("{\"t\":\"done\"}");
        } catch (Exception fatal) {
            harnessFailed = true;
            Console.Error.WriteLine("harness: internal failure: " + fatal);
        }
    }

    // ---------------- timing and the current operation (called by the driver) ----------------
    public static void Tic() { tocked = false; ticked = true; t0 = Stopwatch.GetTimestamp(); }
    public static void Toc() { t1 = Stopwatch.GetTimestamp(); tocked = true; }
    public static void OpAt(int k, string name) { opIndex = k; opName = name; }
    static void Ms(StringBuilder sb, long end) {
        Dbl(sb, ticked ? Math.Round((end - t0) * 1e6 / Stopwatch.Frequency) / 1000.0 : 0.0);
    }

    // ---------------- protocol output ----------------
    static void Emit(string json) { EmitBytes(Utf8.GetBytes(nonce + json + "\n")); }
    static void EmitBytes(byte[] line) {
        if (!sink.Harness(line) && !harnessFailed) {
            harnessFailed = true;
            Console.Error.WriteLine("harness: writing to stdout failed (output file size limit?)");
        }
    }
    static void ErrorLine(StringBuilder sb, int i, string message, long end) {
        sb.Append("{\"t\":\"result\",\"i\":").Append(i.ToString(Inv)).Append(",\"ok\":false,\"error\":");
        Str(sb, message);
        sb.Append(",\"ms\":"); Ms(sb, end); sb.Append('}');
    }
    // The soft RLIMIT_FSIZE from /proc/self/limits, capped at dflt
    static long FileSizeLimit(long dflt) {
        try {
            foreach (string l in File.ReadAllLines("/proc/self/limits")) {
                if (!l.StartsWith("Max file size", StringComparison.Ordinal)) continue;
                string soft = l.Substring("Max file size".Length).Trim().Split(' ')[0];
                return soft == "unlimited" ? dflt : Math.Min(dflt, long.Parse(soft, Inv));
            }
        } catch (Exception) { }
        return dflt;
    }

    // Everything the learner prints goes through here, capped per test, and
    // flushed before each harness line so it lands in the right test's logs
    sealed class Sink : TextWriter {
        static readonly byte[] Truncated = Utf8.GetBytes("\n… (output truncated)\n");
        readonly Stream output;
        readonly Encoder encoder = Utf8.GetEncoder();
        byte[] bytes = new byte[256];
        byte last = (byte)'\n';
        long testBytes, totalBytes, written;
        bool noted;
        public Sink(Stream stdout) : base(Inv) { output = new BufferedStream(stdout, 1 << 16); NewLine = "\n"; }
        public override Encoding Encoding => Utf8;
        public override void Write(char value) { Write(new ReadOnlySpan<char>(in value)); }
        public override void Write(char[] buffer, int index, int count) { Write(new ReadOnlySpan<char>(buffer, index, count)); }
        public override void Write(string value) { Write(value.AsSpan()); }
        public override void Write(ReadOnlySpan<char> chars) {
            if (chars.IsEmpty) return;
            lock (this) {
                int max = Utf8.GetMaxByteCount(chars.Length);
                if (bytes.Length < max) bytes = new byte[Math.Max(max, bytes.Length * 2)];
                Log(bytes, encoder.GetBytes(chars, bytes, false));
                // Flushed as it's printed, like Java's PrintStream, so a crash
                // or time-out still shows it
                try { output.Flush(); } catch (IOException) { }
            }
        }
        void Log(byte[] b, int len) {
            long room = Math.Min(LogCapPerTest - testBytes, LogCapTotal - totalBytes);
            int n = (int)Math.Max(0, Math.Min(len, room));
            try {
                if (n > 0) { output.Write(b, 0, n); last = b[n - 1]; testBytes += n; totalBytes += n; written += n; }
                if (n < len && !noted) {
                    noted = true;
                    output.Write(Truncated, 0, Truncated.Length);
                    written += Truncated.Length;
                    last = (byte)'\n';
                }
            } catch (IOException) { }
        }
        public override void Flush() { lock (this) { try { output.Flush(); } catch (IOException) { } } }
        // The learner closing Console.Out mustn't stop the harness writing
        protected override void Dispose(bool disposing) { Flush(); }
        public void NewTest() { lock (this) { testBytes = 0; noted = false; } }
        public long Written { get { lock (this) return written; } }
        public long LogRoomLeft { get { lock (this) return Math.Max(0, LogCapTotal - totalBytes) + Truncated.Length; } }
        public bool Harness(byte[] line) {
            lock (this) {
                try {
                    if (last != (byte)'\n') { output.WriteByte((byte)'\n'); written++; }
                    output.Write(line, 0, line.Length);
                    written += line.Length;
                    last = (byte)'\n';
                    output.Flush();
                    return true;
                } catch (IOException) {
                    return false;
                }
            }
        }
    }

    // "IndexOutOfRangeException: Index was outside the bounds of the array.
    // (line 5)", with the line only when it's in the learner's code
    static string Describe(Exception e) {
        try {
            // A static initializer or reflection call hides the real cause
            while ((e is TypeInitializationException || e is global::System.Reflection.TargetInvocationException) && e.InnerException != null) e = e.InnerException;
            var sb = new StringBuilder();
            Type type = e.GetType();
            sb.Append(e is InputError ? "HarnessInputError" : type.Namespace == "System" ? type.Name : type.FullName);
            if (!string.IsNullOrEmpty(e.Message)) sb.Append(": ").Append(e.Message);
            if (opIndex >= 0) sb.Append(" [during call #").Append((opIndex + 1).ToString(Inv)).Append(", ").Append(opName).Append(']');
            int line = UserLine(e);
            if (line > 0) sb.Append(" (line ").Append(line.ToString(Inv)).Append(')');
            return sb.Length > ErrorMaxChars ? sb.ToString(0, ErrorMaxChars) + "…" : sb.ToString();
        } catch (Exception) {
            return e.GetType().FullName;
        }
    }
    // The innermost frame in the learner's code, from the program's portable
    // PDB. #line names their code Main.cs and the harness __harness.cs.
    static int UserLine(Exception e) {
        StackFrame[] frames = new StackTrace(e, true).GetFrames();
        foreach (StackFrame f in frames) {
            int line = f.GetFileLineNumber();
            if (line > 0 && line <= UserLines && Path.GetFileName(f.GetFileName() ?? "") == "Main.cs") return line;
        }
        return 0;
    }

    // ---------------- JSON reader ----------------
    sealed class Parser {
        readonly string s;
        int i;
        static readonly string[] One = new string[128];
        public Parser(string s) { this.s = s; }
        public object Document() {
            object v = Value();
            Ws();
            if (i != s.Length) throw Err("trailing characters");
            return v;
        }
        ArgumentException Err(string m) { return new ArgumentException("bad JSON: " + m + " at offset " + i.ToString(Inv)); }
        void Ws() {
            while (i < s.Length) {
                char c = s[i];
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r') i++; else break;
            }
        }
        object Value() {
            Ws();
            if (i >= s.Length) throw Err("unexpected end of input");
            char c = s[i];
            switch (c) {
                case '{': return ReadObject();
                case '[': return ReadArray();
                case '"': return ReadString();
                case 't': return Literal("true", true);
                case 'f': return Literal("false", false);
                case 'n': return Literal("null", null);
                default:
                    if (c == '-' || (c >= '0' && c <= '9')) return Number();
                    throw Err("unexpected character '" + c + "'");
            }
        }
        object Literal(string w, object v) {
            if (string.CompareOrdinal(s, i, w, 0, w.Length) != 0) throw Err("invalid literal");
            i += w.Length;
            return v;
        }
        List<object> ReadArray() {
            i++;
            var a = new List<object>();
            Ws();
            if (i < s.Length && s[i] == ']') { i++; return a; }
            while (true) {
                a.Add(Value());
                Ws();
                if (i >= s.Length) throw Err("unterminated array");
                char c = s[i++];
                if (c == ']') return a;
                if (c != ',') throw Err("expected ',' or ']'");
            }
        }
        Dictionary<string, object> ReadObject() {
            i++;
            var m = new Dictionary<string, object>(StringComparer.Ordinal);
            Ws();
            if (i < s.Length && s[i] == '}') { i++; return m; }
            while (true) {
                Ws();
                if (i >= s.Length || s[i] != '"') throw Err("expected string key");
                string k = ReadString();
                Ws();
                if (i >= s.Length || s[i] != ':') throw Err("expected ':'");
                i++;
                m[k] = Value();
                Ws();
                if (i >= s.Length) throw Err("unterminated object");
                char c = s[i++];
                if (c == '}') return m;
                if (c != ',') throw Err("expected ',' or '}'");
            }
        }
        string ReadString() {
            int start = ++i;
            while (i < s.Length) {
                char c = s[i];
                if (c == '"') {
                    i++;
                    if (i - start == 2 && s[start] < 128) {
                        char k = s[start];
                        return One[k] ?? (One[k] = k.ToString());
                    }
                    return s.Substring(start, i - 1 - start);
                }
                if (c == '\\') break;
                i++;
            }
            var b = new StringBuilder().Append(s, start, i - start);
            while (true) {
                if (i >= s.Length) throw Err("unterminated string");
                char c = s[i++];
                if (c == '"') return b.ToString();
                if (c != '\\') { b.Append(c); continue; }
                if (i >= s.Length) throw Err("bad escape");
                char e = s[i++];
                switch (e) {
                    case '"': b.Append('"'); break;
                    case '\\': b.Append('\\'); break;
                    case '/': b.Append('/'); break;
                    case 'b': b.Append('\b'); break;
                    case 'f': b.Append('\f'); break;
                    case 'n': b.Append('\n'); break;
                    case 'r': b.Append('\r'); break;
                    case 't': b.Append('\t'); break;
                    case 'u': {
                        if (i + 4 > s.Length) throw Err("bad unicode escape");
                        int cp = 0;
                        for (int k = 0; k < 4; k++) {
                            int d = HexDigit(s[i + k]);
                            if (d < 0) throw Err("bad unicode escape");
                            cp = cp * 16 + d;
                        }
                        b.Append((char)cp);
                        i += 4;
                        break;
                    }
                    default: throw Err("bad escape");
                }
            }
        }
        static int HexDigit(char c) {
            if (c >= '0' && c <= '9') return c - '0';
            if (c >= 'a' && c <= 'f') return c - 'a' + 10;
            if (c >= 'A' && c <= 'F') return c - 'A' + 10;
            return -1;
        }
        object Number() {
            int start = i;
            bool isFloat = false;
            if (s[i] == '-') i++;
            while (i < s.Length) {
                char c = s[i];
                if (c >= '0' && c <= '9') i++;
                else if (c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-') { isFloat = true; i++; }
                else break;
            }
            string t = s.Substring(start, i - start);
            // Integers beyond int64 stay exact, so converters reject them
            // instead of silently rounding
            if (!isFloat) {
                if (long.TryParse(t, NumberStyles.AllowLeadingSign, Inv, out long v)) return v;
                if (BigInteger.TryParse(t, NumberStyles.AllowLeadingSign, Inv, out BigInteger big)) return big;
                throw Err("bad number '" + t + "'");
            }
            if (!double.TryParse(t, NumberStyles.Float, Inv, out double d)) throw Err("bad number '" + t + "'");
            if (double.IsInfinity(d)) throw Err("number out of double range '" + t + "'");
            return d;
        }
    }

    // ---------------- JSON writer ----------------
    public static void Write(StringBuilder sb, object v) {
        switch (v) {
            case null: sb.Append("null"); break;
            case string s: Str(sb, s); break;
            case int x: sb.Append(x.ToString(Inv)); break;
            case long x: sb.Append(x.ToString(Inv)); break;
            case short or byte or sbyte or ushort or uint or ulong: sb.Append(((IFormattable)v).ToString(null, Inv)); break;
            case double d: Dbl(sb, d); break;
            case float f: Dbl(sb, f); break;
            case decimal m: sb.Append(m.ToString(Inv)); break;
            case bool b: sb.Append(b ? "true" : "false"); break;
            case char c: Str(sb, c.ToString()); break;
            case BigInteger big: sb.Append(big.ToString(Inv)); break;
            case IJson j: j.WriteJson(sb); break;
            case int[] a: { sb.Append('['); for (int k = 0; k < a.Length; k++) { if (k > 0) sb.Append(','); sb.Append(a[k].ToString(Inv)); } sb.Append(']'); break; }
            case long[] a: { sb.Append('['); for (int k = 0; k < a.Length; k++) { if (k > 0) sb.Append(','); sb.Append(a[k].ToString(Inv)); } sb.Append(']'); break; }
            case double[] a: { sb.Append('['); for (int k = 0; k < a.Length; k++) { if (k > 0) sb.Append(','); Dbl(sb, a[k]); } sb.Append(']'); break; }
            case bool[] a: { sb.Append('['); for (int k = 0; k < a.Length; k++) { if (k > 0) sb.Append(','); sb.Append(a[k] ? "true" : "false"); } sb.Append(']'); break; }
            case char[] a: { sb.Append('['); for (int k = 0; k < a.Length; k++) { if (k > 0) sb.Append(','); Str(sb, a[k].ToString()); } sb.Append(']'); break; }
            case IDictionary map: {
                // Sorted keys, so a Dictionary's order doesn't matter
                var entries = new List<KeyValuePair<string, object>>(map.Count);
                foreach (DictionaryEntry e in map) entries.Add(new KeyValuePair<string, object>(Convert.ToString(e.Key, Inv), e.Value));
                entries.Sort((x, y) => string.CompareOrdinal(x.Key, y.Key));
                sb.Append('{');
                for (int k = 0; k < entries.Count; k++) {
                    if (k > 0) sb.Append(',');
                    Str(sb, entries[k].Key);
                    sb.Append(':');
                    Write(sb, entries[k].Value);
                }
                sb.Append('}');
                break;
            }
            case IEnumerable items: {
                sb.Append('[');
                bool first = true;
                foreach (object x in items) { if (!first) sb.Append(','); first = false; Write(sb, x); }
                sb.Append(']');
                break;
            }
            default: throw new InvalidOperationException("can't report a value of type " + v.GetType().FullName);
        }
    }

    internal static void Dbl(StringBuilder sb, double d) {
        if (double.IsNaN(d) || double.IsInfinity(d)) sb.Append("null");
        else sb.Append(d.ToString("R", Inv));
    }

    static void Str(StringBuilder sb, string s) {
        sb.Append('"');
        for (int k = 0; k < s.Length; k++) {
            char c = s[k];
            switch (c) {
                case '"': sb.Append("\\\""); break;
                case '\\': sb.Append("\\\\"); break;
                case '\n': sb.Append("\\n"); break;
                case '\r': sb.Append("\\r"); break;
                case '\t': sb.Append("\\t"); break;
                case '\b': sb.Append("\\b"); break;
                case '\f': sb.Append("\\f"); break;
                default:
                    bool lone = char.IsHighSurrogate(c) ? !(k + 1 < s.Length && char.IsLowSurrogate(s[k + 1]))
                        : char.IsLowSurrogate(c) && !(k > 0 && char.IsHighSurrogate(s[k - 1]));
                    if (c < 0x20 || lone) sb.Append("\\u").Append(((int)c).ToString("x4", Inv));
                    else sb.Append(c);
                    break;
            }
        }
        sb.Append('"');
    }

    // ---------------- JSON to C# ----------------
    public static InputError Bad(string want, object got) { return new InputError("expected " + want + ", got " + Kind(got)); }
    static string Kind(object o) {
        switch (o) {
            case null: return "null";
            case string s: return "string \"" + (s.Length > 20 ? s.Substring(0, 20) + "..." : s) + "\"";
            case long n: return "number " + n.ToString(Inv);
            case double d: return "number " + d.ToString("R", Inv);
            case BigInteger big: return "number " + big.ToString(Inv);
            case bool b: return "boolean " + (b ? "true" : "false");
            case List<object>: return "array";
            case Dictionary<string, object>: return "object";
            default: return o.GetType().FullName;
        }
    }
    public static object Field(object o, string k) {
        if (!(o is Dictionary<string, object> m)) throw Bad("object with key \"" + k + "\"", o);
        return m.TryGetValue(k, out object v) ? v : null;
    }
    public static List<object> List(object o, string what) {
        if (o is List<object> a) return a;
        throw Bad(what + " (JSON array)", o);
    }
    public static List<object> Args(Dictionary<string, object> testCase, string key, int n) {
        List<object> a = List(testCase.TryGetValue(key, out object v) ? v : null, key);
        if (a.Count != n) throw new InputError("expected " + n.ToString(Inv) + " value(s) in \"" + key + "\", got " + a.Count.ToString(Inv));
        return a;
    }
    public static int ToInt(object o) {
        if (o is long v) { if (v >= int.MinValue && v <= int.MaxValue) return (int)v; }
        else if (o is double d) { if (d == Math.Truncate(d) && d >= int.MinValue && d <= int.MaxValue) return (int)d; }
        throw Bad("int (32-bit)", o);
    }
    public static long ToLong(object o) {
        if (o is long v) return v;
        // Float-form integers only below 2^53, where they're exact
        if (o is double d && d == Math.Truncate(d) && Math.Abs(d) < 9007199254740992.0) return (long)d;
        throw Bad("long (64-bit int)", o);
    }
    public static double ToDouble(object o) {
        if (o is long v) return v;
        if (o is double d) return d;
        if (o is BigInteger big) { double x = (double)big; if (!double.IsInfinity(x)) return x; }
        throw Bad("double", o);
    }
    public static bool ToBool(object o) {
        if (o is bool b) return b;
        throw Bad("bool", o);
    }
    public static string ToStr(object o) {
        if (o is string s) return s;
        throw Bad("string", o);
    }
    public static char ToChar(object o) {
        if (o is string s && s.Length == 1) return s[0];
        throw Bad("char (1-char string)", o);
    }
    public static int[] ToIntArr(object o) { List<object> a = List(o, "int[]"); var r = new int[a.Count]; for (int k = 0; k < r.Length; k++) r[k] = ToInt(a[k]); return r; }
    public static long[] ToLongArr(object o) { List<object> a = List(o, "long[]"); var r = new long[a.Count]; for (int k = 0; k < r.Length; k++) r[k] = ToLong(a[k]); return r; }
    public static double[] ToDoubleArr(object o) { List<object> a = List(o, "double[]"); var r = new double[a.Count]; for (int k = 0; k < r.Length; k++) r[k] = ToDouble(a[k]); return r; }
    public static bool[] ToBoolArr(object o) { List<object> a = List(o, "bool[]"); var r = new bool[a.Count]; for (int k = 0; k < r.Length; k++) r[k] = ToBool(a[k]); return r; }
    public static char[] ToCharArr(object o) { List<object> a = List(o, "char[]"); var r = new char[a.Count]; for (int k = 0; k < r.Length; k++) r[k] = ToChar(a[k]); return r; }
    public static T[] ToArr<T>(object o, Func<object, T> conv) {
        List<object> a = List(o, "array");
        var r = new T[a.Count];
        for (int k = 0; k < r.Length; k++) r[k] = conv(a[k]);
        return r;
    }
    public static Dictionary<string, T> ToMap<T>(object o, Func<object, T> conv) {
        if (!(o is Dictionary<string, object> m)) throw Bad("map (JSON object)", o);
        var r = new Dictionary<string, T>(m.Count);
        foreach (KeyValuePair<string, object> e in m) r[e.Key] = conv(e.Value);
        return r;
    }
    public static T Nul<T>(object o, Func<object, T> conv) { return o == null ? default(T) : conv(o); }
    public static List<List<object>> Ops(object o) {
        List<object> a = List(o, "ops");
        var r = new List<List<object>>(a.Count);
        for (int k = 0; k < a.Count; k++) {
            if (!(a[k] is List<object> op) || op.Count == 0 || !(op[0] is string))
                throw new InputError("ops[" + k.ToString(Inv) + "] must be [\"name\", ...args]");
            r.Add(op);
        }
        return r;
    }
    public static void OpArity(List<object> op, int n) {
        if (op.Count - 1 != n) throw new InputError("op \"" + op[0] + "\" takes " + n.ToString(Inv) + " argument(s), got " + (op.Count - 1).ToString(Inv));
    }
    public static InputError UnknownOp(string name) { return new InputError("unknown op \"" + name + "\""); }
    public static readonly object Empty = global::System.Array.Empty<object>();
}
}
