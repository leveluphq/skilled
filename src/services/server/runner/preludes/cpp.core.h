// ==== Skilled runner harness (C++23, GCC 16) ====
// Comes before the learner's code, which follows `#line 1 "solution.cpp"`, so
// compiler errors give their own line numbers. Everything is in namespace
// __skh with qualified names, so the learner's names, `using` declarations and
// macros can't change it. docs/adding-a-language.md has the contract it
// keeps: what it reads from stdin and the lines it prints.
//
// Compiled with -D_GLIBCXX_ASSERTIONS: an index out of range in a vector or
// string, or back() on an empty one, stops the run with a readable error
// instead of reading garbage. <bits/stdc++.h> must come first, so the image's
// precompiled header for it applies.
#include <bits/stdc++.h>
// No longer in <bits/stdc++.h> as of GCC 16, but LeetCode code uses assert()
#include <cassert>
#include <cxxabi.h>

// LeetCode's C++ has the standard library without std::
using namespace std;

namespace __skh {

// Room for 200,000 frames of a recursive solution many times over. Half the
// memory limit, so recursion that never ends overflows the stack, and is
// reported as that, before the program runs out of memory.
constexpr std::size_t STACK_BYTES = std::size_t(128) << 20;
constexpr std::size_t GUARD_BYTES = std::size_t(1) << 20;
constexpr std::size_t ERROR_MAX_CHARS = 500;
constexpr long long LOG_CAP_PER_TEST = 64LL << 10;
constexpr long long LOG_CAP_TOTAL = 256LL << 10;
// Worst-case bytes of one start line, error result and truncation note
constexpr long long ERROR_LINE_RESERVE = 800;

// Test input the harness can't use: a bug in the runner or the lesson's spec
struct InputError : std::runtime_error {
    using std::runtime_error::runtime_error;
};

// ---------------- JSON reader ----------------
// 16-byte nodes. Strings and child nodes live in two arenas that only grow
// while parsing, so `const JVal&` references stay valid for the whole run.
struct JVal;
inline std::vector<JVal> g_nodes;  // the children of every array and object, contiguous per container
inline std::string g_strs;         // the bytes of every string (UTF-8, unescaped)
struct JVal {
    // BIG: an integer beyond 64 bits, kept as a double so converters can refuse it
    enum Kind : unsigned char { NUL, BOOL, INT, BIG, DBL, STR, ARR, OBJ };
    Kind k = NUL;
    std::uint32_t n = 0;  // STR: bytes; ARR: elements; OBJ: 2 * entries (key, value, key, ...)
    union {
        long long i;        // BOOL (0 or 1), INT
        double d;           // BIG, DBL
        std::uint64_t off;  // STR: offset in g_strs; ARR, OBJ: first child in g_nodes
    };
    JVal() : i(0) {}
    std::size_t size() const { return n; }
    const JVal& operator[](std::size_t idx) const { return g_nodes[off + idx]; }
    const char* sdata() const { return g_strs.data() + off; }
    std::string str() const { return std::string(sdata(), n); }
    bool is(const char* z) const { return k == STR && std::string_view(sdata(), n) == z; }
};

// The value for a key, or null when it's missing
inline const JVal* field(const JVal& o, const char* key) {
    if (o.k != JVal::OBJ) return nullptr;
    const JVal* found = nullptr;
    for (std::size_t k = 0; k + 1 < o.size(); k += 2)
        if (o[k].is(key)) found = &o[k + 1];
    return found;
}

struct Parser {
    const char* b;
    const char* p;
    const char* e;
    [[noreturn]] void fail(const char* m) {
        throw std::invalid_argument(std::string("bad JSON: ") + m + " at offset " + std::to_string(p - b));
    }
    void ws() {
        while (p < e && (*p == ' ' || *p == '\t' || *p == '\n' || *p == '\r')) ++p;
    }
    void literal(const char* w, std::size_t n) {
        if (std::size_t(e - p) < n || std::memcmp(p, w, n) != 0) fail("invalid literal");
        p += n;
    }
    static void utf8(std::string& o, std::uint32_t c) {
        if (c < 0x80) {
            o += char(c);
        } else if (c < 0x800) {
            o += char(0xC0 | (c >> 6));
            o += char(0x80 | (c & 0x3F));
        } else if (c < 0x10000) {
            o += char(0xE0 | (c >> 12));
            o += char(0x80 | ((c >> 6) & 0x3F));
            o += char(0x80 | (c & 0x3F));
        } else {
            o += char(0xF0 | (c >> 18));
            o += char(0x80 | ((c >> 12) & 0x3F));
            o += char(0x80 | ((c >> 6) & 0x3F));
            o += char(0x80 | (c & 0x3F));
        }
    }
    std::uint32_t hex4() {
        if (e - p < 4) fail("bad unicode escape");
        std::uint32_t v = 0;
        for (int k = 0; k < 4; ++k) {
            char c = *p++;
            v <<= 4;
            if (c >= '0' && c <= '9') v |= std::uint32_t(c - '0');
            else if (c >= 'a' && c <= 'f') v |= std::uint32_t(c - 'a' + 10);
            else if (c >= 'A' && c <= 'F') v |= std::uint32_t(c - 'A' + 10);
            else fail("bad unicode escape");
        }
        return v;
    }
    void string(JVal& v) {
        std::string& o = g_strs;
        v.k = JVal::STR;
        v.off = o.size();
        ++p;
        for (;;) {
            if (p >= e) fail("unterminated string");
            char c = *p++;
            if (c == '"') {
                if (o.size() - v.off > UINT32_MAX) fail("string too long");
                v.n = std::uint32_t(o.size() - v.off);
                return;
            }
            if (c != '\\') {
                o += c;
                continue;
            }
            if (p >= e) fail("bad escape");
            switch (*p++) {
                case '"': o += '"'; break;
                case '\\': o += '\\'; break;
                case '/': o += '/'; break;
                case 'b': o += '\b'; break;
                case 'f': o += '\f'; break;
                case 'n': o += '\n'; break;
                case 'r': o += '\r'; break;
                case 't': o += '\t'; break;
                case 'u': {
                    std::uint32_t c1 = hex4();
                    if (c1 >= 0xD800 && c1 <= 0xDBFF && e - p >= 6 && p[0] == '\\' && p[1] == 'u') {
                        const char* save = p;
                        p += 2;
                        std::uint32_t c2 = hex4();
                        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
                            c1 = 0x10000 + ((c1 - 0xD800) << 10) + (c2 - 0xDC00);
                        } else {
                            p = save;
                            c1 = 0xFFFD;
                        }
                    } else if (c1 >= 0xD800 && c1 <= 0xDFFF) {
                        c1 = 0xFFFD;  // a lone surrogate
                    }
                    utf8(o, c1);
                    break;
                }
                default: fail("bad escape");
            }
        }
    }
    void number(JVal& v) {
        const char* start = p;
        bool isFloat = false;
        if (p < e && *p == '-') ++p;
        if (p >= e || !std::isdigit((unsigned char) *p)) fail("bad number");
        while (p < e && std::isdigit((unsigned char) *p)) ++p;
        if (p < e && *p == '.') {
            isFloat = true;
            ++p;
            while (p < e && std::isdigit((unsigned char) *p)) ++p;
        }
        if (p < e && (*p == 'e' || *p == 'E')) {
            isFloat = true;
            ++p;
            if (p < e && (*p == '+' || *p == '-')) ++p;
            while (p < e && std::isdigit((unsigned char) *p)) ++p;
        }
        if (!isFloat) {
            long long x = 0;
            auto r = std::from_chars(start, p, x);
            if (r.ec == std::errc() && r.ptr == p) {
                v.k = JVal::INT;
                v.i = x;
                return;
            }
        }
        // Integers beyond int64 stay distinct, so converters reject them
        // instead of silently rounding
        v.k = isFloat ? JVal::DBL : JVal::BIG;
        v.d = std::strtod(std::string(start, p).c_str(), nullptr);
        if (!std::isfinite(v.d)) fail("number out of double range");
    }
    void value(JVal& v, int depth) {
        if (depth > 1000) fail("nested too deeply");
        ws();
        if (p >= e) fail("unexpected end of input");
        char c = *p;
        if (c == '{' || c == '[') {
            bool object = c == '{';
            char close = object ? '}' : ']';
            v.k = object ? JVal::OBJ : JVal::ARR;
            ++p;
            ws();
            if (p < e && *p == close) {
                ++p;
                v.off = g_nodes.size();
                v.n = 0;
                return;
            }
            // Grandchildren go into g_nodes first, then this level as one block
            std::vector<JVal> kids;
            for (;;) {
                ws();
                if (object) {
                    if (p >= e || *p != '"') fail("expected string key");
                    kids.emplace_back();
                    string(kids.back());
                    ws();
                    if (p >= e || *p != ':') fail("expected ':'");
                    ++p;
                }
                JVal child;
                value(child, depth + 1);
                kids.push_back(child);
                ws();
                if (p < e && *p == ',') {
                    ++p;
                    continue;
                }
                if (p < e && *p == close) {
                    ++p;
                    if (kids.size() > UINT32_MAX) fail("container too large");
                    v.off = g_nodes.size();
                    v.n = std::uint32_t(kids.size());
                    g_nodes.insert(g_nodes.end(), kids.begin(), kids.end());
                    return;
                }
                fail(object ? "expected ',' or '}'" : "expected ',' or ']'");
            }
        }
        if (c == '"') return string(v);
        if (c == 't') {
            literal("true", 4);
            v.k = JVal::BOOL;
            v.i = 1;
            return;
        }
        if (c == 'f') {
            literal("false", 5);
            v.k = JVal::BOOL;
            v.i = 0;
            return;
        }
        if (c == 'n') {
            literal("null", 4);
            v.k = JVal::NUL;
            return;
        }
        if (c == '-' || (c >= '0' && c <= '9')) return number(v);
        fail("unexpected character");
    }
};

// ---------------- JSON writer ----------------
inline void w_int(std::string& o, long long x) {
    char buf[24];
    auto r = std::to_chars(buf, buf + sizeof buf, x);
    o.append(buf, r.ptr);
}
inline void w_uint(std::string& o, unsigned long long x) {
    char buf[24];
    auto r = std::to_chars(buf, buf + sizeof buf, x);
    o.append(buf, r.ptr);
}
// The shortest text that reads back as the same double; NaN and infinity as null
template <class F> void w_dbl(std::string& o, F d) {
    if (!std::isfinite(d)) {
        o += "null";
        return;
    }
    char buf[40];
    auto r = std::to_chars(buf, buf + sizeof buf, d);
    o.append(buf, r.ptr);
}
// Escaped, with invalid UTF-8 replaced by U+FFFD
inline void w_str(std::string& o, std::string_view s) {
    static const char* hex = "0123456789abcdef";
    o += '"';
    std::size_t k = 0, n = s.size();
    while (k < n) {
        unsigned char c = (unsigned char) s[k];
        if (c < 0x80) {
            switch (c) {
                case '"': o += "\\\""; break;
                case '\\': o += "\\\\"; break;
                case '\n': o += "\\n"; break;
                case '\r': o += "\\r"; break;
                case '\t': o += "\\t"; break;
                case '\b': o += "\\b"; break;
                case '\f': o += "\\f"; break;
                default:
                    if (c < 0x20 || c == 0x7F) {
                        o += "\\u00";
                        o += hex[c >> 4];
                        o += hex[c & 15];
                    } else {
                        o += char(c);
                    }
            }
            ++k;
            continue;
        }
        std::size_t len = 0;
        std::uint32_t cp = 0;
        if (c >= 0xC2 && c <= 0xDF) { len = 2; cp = c & 0x1F; }
        else if (c >= 0xE0 && c <= 0xEF) { len = 3; cp = c & 0x0F; }
        else if (c >= 0xF0 && c <= 0xF4) { len = 4; cp = c & 0x07; }
        bool good = len != 0 && k + len <= n;
        for (std::size_t j = 1; good && j < len; ++j) {
            unsigned char cc = (unsigned char) s[k + j];
            if ((cc & 0xC0) != 0x80) good = false;
            else cp = (cp << 6) | (cc & 0x3F);
        }
        if (good && ((len == 3 && (cp < 0x800 || (cp >= 0xD800 && cp <= 0xDFFF))) || (len == 4 && (cp < 0x10000 || cp > 0x10FFFF))))
            good = false;
        if (good) {
            o.append(s.data() + k, len);
            k += len;
        } else {
            o += "\\ufffd";
            ++k;
        }
    }
    o += '"';
}

// ---------------- JSON to C++ ----------------
// Conv<T>::from(json) for each type a spec can take. The runner types
// (ListNode, BinaryNode, Interval, Item) add their own, with to() for answers.
template <class T, class = void> struct Conv {};

inline std::string kind(const JVal& v) {
    switch (v.k) {
        case JVal::NUL: return "null";
        case JVal::BOOL: return v.i ? "boolean true" : "boolean false";
        case JVal::INT: return "number " + std::to_string(v.i);
        case JVal::BIG:
        case JVal::DBL: {
            std::string o = "number ";
            w_dbl(o, v.d);
            return o;
        }
        case JVal::STR: return "string \"" + (v.n > 20 ? std::string(v.sdata(), 20) + "..." : v.str()) + "\"";
        case JVal::ARR: return "array";
        default: return "object";
    }
}
inline InputError bad(const std::string& want, const JVal& got) {
    return InputError("expected " + want + ", got " + kind(got));
}

template <> struct Conv<int> {
    static int from(const JVal& v) {
        if (v.k == JVal::INT && v.i >= INT_MIN && v.i <= INT_MAX) return int(v.i);
        if (v.k == JVal::DBL && v.d == std::rint(v.d) && v.d >= INT_MIN && v.d <= INT_MAX) return int(v.d);
        throw bad("int (32-bit)", v);
    }
};
template <> struct Conv<long long> {
    static long long from(const JVal& v) {
        if (v.k == JVal::INT) return v.i;
        // Float-form integers only below 2^53, where they're exact
        if (v.k == JVal::DBL && v.d == std::rint(v.d) && std::fabs(v.d) < 9007199254740992.0) return (long long) v.d;
        throw bad("long (64-bit int)", v);
    }
};
template <> struct Conv<double> {
    static double from(const JVal& v) {
        if (v.k == JVal::INT) return double(v.i);
        if (v.k == JVal::DBL || v.k == JVal::BIG) return v.d;
        throw bad("double", v);
    }
};
template <> struct Conv<bool> {
    static bool from(const JVal& v) {
        if (v.k == JVal::BOOL) return v.i != 0;
        throw bad("bool", v);
    }
};
template <> struct Conv<std::string> {
    static std::string from(const JVal& v) {
        if (v.k == JVal::STR) return v.str();
        throw bad("string", v);
    }
};
template <> struct Conv<char> {
    static char from(const JVal& v) {
        if (v.k == JVal::STR && v.n == 1) return v.sdata()[0];
        throw bad("char (1-character ASCII string)", v);
    }
};
template <class T> struct Conv<std::vector<T>> {
    static std::vector<T> from(const JVal& v) {
        if (v.k != JVal::ARR) throw bad("array", v);
        std::vector<T> r;
        r.reserve(v.size());
        for (std::size_t k = 0; k < v.size(); ++k) r.push_back(Conv<T>::from(v[k]));
        return r;
    }
};
template <class T> struct Conv<std::optional<T>> {
    static std::optional<T> from(const JVal& v) {
        if (v.k == JVal::NUL) return std::nullopt;
        return Conv<T>::from(v);
    }
};
template <class T> struct Conv<std::unordered_map<std::string, T>> {
    static std::unordered_map<std::string, T> from(const JVal& v) {
        if (v.k != JVal::OBJ) throw bad("map (JSON object)", v);
        std::unordered_map<std::string, T> r;
        for (std::size_t k = 0; k + 1 < v.size(); k += 2) r.insert_or_assign(v[k].str(), Conv<T>::from(v[k + 1]));
        return r;
    }
};
template <class T> T from(const JVal& v) { return Conv<T>::from(v); }

// ---------------- C++ to JSON ----------------
// Whatever the learner returns, as long as it has a JSON form: any integer
// where the spec says int or long, a vector, array, deque, pair or other
// range where it says a list, and so on.
template <class T> struct is_optional : std::false_type {};
template <class T> struct is_optional<std::optional<T>> : std::true_type {};
template <class T> struct is_tuple : std::false_type {};
template <class A, class B> struct is_tuple<std::pair<A, B>> : std::true_type {};
template <class... A> struct is_tuple<std::tuple<A...>> : std::true_type {};
template <class> inline constexpr bool unsupported = false;
// A runner type's pointer without const, so a const ListNode* reports too
template <class U>
using runner_t = std::conditional_t<std::is_pointer_v<U>, std::remove_cv_t<std::remove_pointer_t<U>>*, U>;

template <class T> void put(std::string& o, const T& v) {
    using U = std::remove_cvref_t<T>;
    if constexpr (std::is_same_v<U, bool>) {
        o += v ? "true" : "false";
    } else if constexpr (std::is_same_v<U, char>) {
        w_str(o, std::string_view(&v, 1));
    } else if constexpr (std::is_integral_v<U> && std::is_signed_v<U>) {
        w_int(o, (long long) v);
    } else if constexpr (std::is_integral_v<U>) {
        w_uint(o, (unsigned long long) v);
    } else if constexpr (std::is_floating_point_v<U>) {
        w_dbl(o, v);
    } else if constexpr (std::is_same_v<U, std::nullptr_t> || std::is_same_v<U, std::nullopt_t>) {
        o += "null";
    } else if constexpr (requires(const runner_t<U>& x) { Conv<runner_t<U>>::to(o, x); }) {
        Conv<runner_t<U>>::to(o, v);
    } else if constexpr (std::is_convertible_v<const U&, std::string_view>) {
        if constexpr (std::is_pointer_v<U>) {
            if (!v) {
                o += "null";
                return;
            }
        }
        w_str(o, std::string_view(v));
    } else if constexpr (is_optional<U>::value) {
        if (v) put(o, *v);
        else o += "null";
    } else if constexpr (is_tuple<U>::value) {
        o += '[';
        std::apply([&](const auto&... x) {
            bool first = true;
            ((o += first ? "" : ",", first = false, put(o, x)), ...);
        }, v);
        o += ']';
    } else if constexpr (requires { typename U::key_type; typename U::mapped_type; }) {
        static_assert(std::is_convertible_v<const typename U::key_type&, std::string_view>,
                      "can't report a map whose keys aren't strings");
        // Sorted keys, so an unordered_map's order doesn't matter
        std::vector<const typename U::value_type*> entries;
        for (const auto& e : v) entries.push_back(&e);
        std::sort(entries.begin(), entries.end(), [](auto* x, auto* y) {
            return std::string_view(x->first) < std::string_view(y->first);
        });
        o += '{';
        for (std::size_t k = 0; k < entries.size(); ++k) {
            if (k) o += ',';
            w_str(o, std::string_view(entries[k]->first));
            o += ':';
            put(o, entries[k]->second);
        }
        o += '}';
    } else if constexpr (std::ranges::range<const U>) {
        o += '[';
        bool first = true;
        for (auto&& x : v) {
            if (!first) o += ',';
            first = false;
            // vector<bool> hands out proxies
            if constexpr (std::is_same_v<std::ranges::range_value_t<const U>, bool>) put(o, bool(x));
            else put(o, x);
        }
        o += ']';
    } else {
        static_assert(unsupported<U>, "can't report a value of this type");
    }
}

// ---------------- the run ----------------
using Test = std::string (*)(const JVal&);

inline char g_nonce[33];
inline volatile std::sig_atomic_t g_cur = -1;  // the running test, or -1
inline volatile long long g_t0 = 0, g_t1 = 0;
inline volatile std::sig_atomic_t g_ticked = 0, g_tocked = 0;
inline int g_op_index = -1;
inline std::string g_op_name;
inline char* g_stack_lo = nullptr;  // the low end of the tests' stack, for telling a stack overflow
// A crash's message, set just before a deliberate abort(), JSON-escaped
inline char g_fatal_msg[1024];
inline long long g_out_budget = 64LL << 20;
inline bool g_harness_failed = false;

inline long long now_ns() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (long long) ts.tv_sec * 1000000000LL + ts.tv_nsec;
}

// ---------------- timing and the current operation (called by the driver) ----------------
inline void tic() {
    g_tocked = 0;
    g_ticked = 1;
    g_t0 = now_ns();
}
inline void toc() {
    g_t1 = now_ns();
    g_tocked = 1;
}
inline void op_at(std::size_t k, const std::string& name) {
    g_op_index = int(k);
    g_op_name = name;
}
inline long long end_ns() { return g_tocked ? g_t1 : now_ns(); }
inline void ms(std::string& o, long long end) {
    w_dbl(o, g_ticked ? double(std::llround((end - g_t0) / 1000.0)) / 1000.0 : 0.0);
}

inline bool write_all(int fd, const char* d, std::size_t n) {
    while (n) {
        ssize_t w = ::write(fd, d, n);
        if (w < 0) {
            if (errno == EINTR) continue;
            return false;
        }
        d += w;
        n -= std::size_t(w);
    }
    return true;
}

// Everything the learner prints, through cout or printf, goes through here:
// capped per test and in total, and line-buffered, so it's written before
// the harness's next line, and whole lines survive a crash or a time-out
struct Sink {
    std::mutex m;
    long long testBytes = 0, totalBytes = 0, written = 0;
    bool noted = false;
    volatile std::sig_atomic_t endsLine = 1;
    // Also read by the crash handler, which writes out what's pending
    char buf[1 << 13];
    volatile std::size_t pending = 0;
    static constexpr std::string_view TRUNCATED = "\n… (output truncated)\n";

    void flushLocked() {
        if (pending) write_all(1, buf, pending);
        pending = 0;
    }
    void append(const char* s, std::size_t n) {
        if (pending + n > sizeof buf) {
            flushLocked();
            if (n > sizeof buf) {
                write_all(1, s, n);
                return;
            }
        }
        std::memcpy(buf + pending, s, n);
        pending += n;
    }
    void write(const char* s, std::size_t len) {
        std::lock_guard<std::mutex> lock(m);
        if (!len) return;
        long long room = std::min(LOG_CAP_PER_TEST - testBytes, LOG_CAP_TOTAL - totalBytes);
        std::size_t n = std::size_t(std::max(0LL, std::min((long long) len, room)));
        if (n > 0) {
            append(s, n);
            endsLine = s[n - 1] == '\n';
            testBytes += n;
            totalBytes += n;
            written += n;
            if (std::memchr(s, '\n', n)) flushLocked();
        }
        if (n < len && !noted) {
            noted = true;
            append(TRUNCATED.data(), TRUNCATED.size());
            flushLocked();
            written += TRUNCATED.size();
            endsLine = 1;
        }
    }
    void newTest() {
        std::lock_guard<std::mutex> lock(m);
        testBytes = 0;
        noted = false;
    }
    long long writtenSoFar() {
        std::lock_guard<std::mutex> lock(m);
        return written;
    }
    long long logRoomLeft() {
        std::lock_guard<std::mutex> lock(m);
        return std::max(0LL, LOG_CAP_TOTAL - totalBytes) + (long long) TRUNCATED.size();
    }
    // A harness line, on a line of its own after what the learner printed
    bool harness(const std::string& line) {
        std::lock_guard<std::mutex> lock(m);
        std::string out(buf, pending);
        pending = 0;
        if (!endsLine) out += '\n';
        out += line;
        written += (long long) line.size() + (endsLine ? 0 : 1);
        endsLine = 1;
        return write_all(1, out.data(), out.size());
    }
};
// Never destroyed, so prints during exit() and static destructors still work
inline Sink& g_sink = *new Sink;

// cout's buffer: none of its own, straight into the sink
struct OutBuf : std::streambuf {
    int_type overflow(int_type c) override {
        if (!traits_type::eq_int_type(c, traits_type::eof())) {
            char ch = traits_type::to_char_type(c);
            g_sink.write(&ch, 1);
        }
        return traits_type::not_eof(c);
    }
    std::streamsize xsputn(const char* s, std::streamsize n) override {
        g_sink.write(s, std::size_t(n));
        return n;
    }
};
inline OutBuf& g_outbuf = *new OutBuf;

// printf, puts and std::print write to C's stdout, which becomes this
inline ssize_t stdout_write(void*, const char* s, std::size_t n) {
    g_sink.write(s, n);
    return ssize_t(n);
}

// ---------------- protocol output ----------------
inline void emit(const std::string& json) {
    std::cout.flush();
    std::fflush(stdout);
    std::string line;
    line.reserve(32 + json.size() + 1);
    line.append(g_nonce, 32);
    line += json;
    line += '\n';
    if (!g_sink.harness(line) && !g_harness_failed) {
        g_harness_failed = true;
        std::fprintf(stderr, "harness: writing to stdout failed (output file size limit?)\n");
    }
}
inline std::string error_line(std::size_t i, const std::string& message, long long end) {
    std::string o = "{\"t\":\"result\",\"i\":" + std::to_string(i) + ",\"ok\":false,\"error\":";
    w_str(o, message);
    o += ",\"ms\":";
    ms(o, end);
    o += '}';
    return o;
}
// The soft RLIMIT_FSIZE from /proc/self/limits, capped at dflt
inline long long file_size_limit(long long dflt) {
    std::ifstream in("/proc/self/limits");
    std::string line;
    while (std::getline(in, line)) {
        if (line.rfind("Max file size", 0) != 0) continue;
        std::istringstream fields(line.substr(13));
        std::string soft;
        fields >> soft;
        if (soft == "unlimited") return dflt;
        try {
            return std::min(dflt, std::stoll(soft));
        } catch (...) {
            return dflt;
        }
    }
    return dflt;
}

// ---------------- errors ----------------
inline std::string demangle(const char* name) {
    int status = 0;
    char* d = abi::__cxa_demangle(name, nullptr, nullptr, &status);
    std::string r = status == 0 && d ? d : name;
    std::free(d);
    if (r == "std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char> >") return "std::string";
    if (r.rfind("std::__cxx11::", 0) == 0) r = "std::" + r.substr(14);
    return r;
}
// Cut to at most `max` bytes on a UTF-8 boundary, marking the cut
inline std::string clip(std::string s, std::size_t max) {
    if (s.size() <= max) return s;
    std::size_t n = max;
    while (n > 0 && ((unsigned char) s[n] & 0xC0) == 0x80) --n;
    s.resize(n);
    return s + "…";
}
// "std::invalid_argument: no sevens". C++ exceptions don't carry the line
// they were thrown from, so unlike other languages there's no (line N).
inline std::string describe(std::exception_ptr ep) {
    std::string r;
    try {
        std::rethrow_exception(ep);
    } catch (const InputError& e) {
        r = std::string("HarnessInputError: ") + e.what();
    } catch (const std::exception& e) {
        std::string name = demangle(typeid(e).name()), what = e.what();
        r = what.empty() || what == name || what == "std::exception" ? name : name + ": " + what;
    } catch (const char* s) {
        r = std::string("const char*: ") + (s ? s : "null");
    } catch (const std::string& s) {
        r = "std::string: " + s;
    } catch (int x) {
        r = "int: " + std::to_string(x);
    } catch (long long x) {
        r = "long long: " + std::to_string(x);
    } catch (...) {
        const std::type_info* type = abi::__cxa_current_exception_type();
        r = type ? demangle(type->name()) : "unknown exception";
    }
    if (g_op_index >= 0) r += " [during call #" + std::to_string(g_op_index + 1) + ", " + g_op_name + "]";
    return clip(r, ERROR_MAX_CHARS);
}

// Stores a crash's message for the SIGABRT line, JSON-escaped
inline void set_fatal_msg(const std::string& message) {
    std::string escaped;
    w_str(escaped, clip(message, ERROR_MAX_CHARS));
    std::size_t n = std::min(escaped.size() - 2, sizeof g_fatal_msg - 1);
    std::memcpy(g_fatal_msg, escaped.data() + 1, n);
    g_fatal_msg[n] = 0;
}

// A crash ends the run. Before it does, this writes the running test's
// result, with only async-signal-safe calls, then dies by the same signal.
[[noreturn]] inline void die_by(int sig) {
    struct sigaction dfl;
    std::memset(&dfl, 0, sizeof dfl);
    dfl.sa_handler = SIG_DFL;
    sigemptyset(&dfl.sa_mask);
    sigaction(sig, &dfl, nullptr);
    sigset_t mask;
    sigemptyset(&mask);
    sigaddset(&mask, sig);
    sigprocmask(SIG_UNBLOCK, &mask, nullptr);
    raise(sig);
    _exit(128 + sig);
}
inline volatile std::sig_atomic_t g_fatal_seen = 0;
inline void on_fatal(int sig, siginfo_t* info, void*) {
    if (g_fatal_seen) die_by(sig);  // a second fault while reporting the first
    g_fatal_seen = 1;
    long long cur = g_cur;
    if (cur >= 0) {
        const char* message;
        char* addr = info ? (char*) info->si_addr : nullptr;
        switch (sig) {
            case SIGSEGV:
                message = g_stack_lo && addr && addr < g_stack_lo + (1 << 16) && addr >= g_stack_lo - GUARD_BYTES - (1 << 16)
                    ? "Stack overflow: the recursion went too deep"
                    : "Segmentation fault: an invalid memory access, such as a null or dangling pointer, or an index out of range";
                break;
            case SIGBUS: message = "Bus error: an invalid memory access"; break;
            case SIGFPE:
                message = info && info->si_code == FPE_INTOVF
                    ? "Arithmetic error: integer overflow in a division"
                    : "Arithmetic error: integer division by zero";
                break;
            case SIGABRT: message = g_fatal_msg[0] ? g_fatal_msg : "Aborted: abort() was called"; break;
            default: message = "Illegal instruction: the program reached code it can't run, such as after undefined behavior";
        }
        char buf[2048];
        std::size_t n = 0;
        auto put = [&](const char* s) {
            while (*s && n < sizeof buf - 2) buf[n++] = *s++;
        };
        auto put_u = [&](unsigned long long x, int width) {
            char t[24];
            int m = 0;
            do {
                t[m++] = char('0' + x % 10);
                x /= 10;
            } while (x);
            while (m < width) t[m++] = '0';
            while (m && n < sizeof buf - 2) buf[n++] = t[--m];
        };
        // What the learner printed last, then the result on a line of its own
        if (g_sink.pending) write_all(1, g_sink.buf, g_sink.pending);
        if (!g_sink.endsLine) buf[n++] = '\n';
        for (int k = 0; k < 32; ++k) buf[n++] = g_nonce[k];
        put("{\"t\":\"result\",\"i\":");
        put_u((unsigned long long) cur, 1);
        put(",\"ok\":false,\"error\":\"");
        put(message);
        put("\",\"ms\":");
        long long elapsed = g_ticked ? end_ns() - g_t0 : 0;
        unsigned long long us = elapsed > 0 ? (unsigned long long) elapsed / 1000 : 0;
        put_u(us / 1000, 1);
        put(".");
        put_u(us % 1000, 3);
        put("}\n");
        write_all(1, buf, n);
    }
    die_by(sig);
}
inline void install_signal_handlers() {
    struct sigaction sa;
    std::memset(&sa, 0, sizeof sa);
    sa.sa_sigaction = on_fatal;
    sa.sa_flags = SA_SIGINFO | SA_ONSTACK | SA_NODEFER;
    sigemptyset(&sa.sa_mask);
    for (int sig : {SIGSEGV, SIGBUS, SIGFPE, SIGILL, SIGTRAP, SIGABRT}) sigaction(sig, &sa, nullptr);
}
// The signal handler runs on a stack of its own, so it can report a stack
// overflow. Set up on the tests' thread.
inline void use_alt_stack() {
    static char stack[1 << 16];
    stack_t ss;
    std::memset(&ss, 0, sizeof ss);
    ss.ss_sp = stack;
    ss.ss_size = sizeof stack;
    sigaltstack(&ss, nullptr);
}
// An exception escaping a noexcept function or a destructor, or one thrown
// in a thread the learner started
[[noreturn]] inline void on_terminate() {
    std::exception_ptr ep = std::current_exception();
    set_fatal_msg(ep ? "Uncaught exception: " + describe(ep)
                     : std::string("Aborted: std::terminate was called, such as by a std::thread destroyed without join()"));
    std::abort();
}

// ---------------- the tests ----------------
inline Test g_test = nullptr;
inline const JVal* g_tests = nullptr;

inline void loop() {
    try {
        for (std::size_t i = 0; i < g_tests->size(); ++i) {
            if (std::cout.rdbuf() != &g_outbuf) std::cout.rdbuf(&g_outbuf);
            std::cout.clear();
            g_sink.newTest();
            emit("{\"t\":\"start\",\"i\":" + std::to_string(i) + "}");
            g_ticked = 0;
            g_tocked = 0;
            g_op_index = -1;
            g_op_name.clear();
            g_cur = std::sig_atomic_t(i);
            std::string line;
            long long end = 0;
            try {
                const JVal& testCase = (*g_tests)[i];
                if (testCase.k != JVal::OBJ) throw bad("test object", testCase);
                std::string out = g_test(testCase);
                end = end_ns();
                line = "{\"t\":\"result\",\"i\":" + std::to_string(i) + ",\"ok\":true,\"out\":" + out + ",\"ms\":";
                ms(line, end);
                line += '}';
            } catch (...) {
                if (!end) end = end_ns();
                line = error_line(i, describe(std::current_exception()), end);
            }
            // Keep room for the remaining tests' start and error lines, their
            // capped logs and the done line
            long long reserve = ERROR_LINE_RESERVE * (long long) (g_tests->size() - i) + g_sink.logRoomLeft() + 64;
            if (g_sink.writtenSoFar() + (long long) line.size() + 33 + reserve > g_out_budget)
                line = error_line(i, "Your answer is too large to report", end);
            emit(line);
            g_cur = -1;
        }
        emit("{\"t\":\"done\"}");
    } catch (...) {
        g_harness_failed = true;
        std::fprintf(stderr, "harness: internal failure: %s\n", describe(std::current_exception()).c_str());
    }
}

inline void* worker(void*) {
    use_alt_stack();
    pthread_attr_t attr;
    if (pthread_getattr_np(pthread_self(), &attr) == 0) {
        void* lo = nullptr;
        std::size_t size = 0;
        if (pthread_attr_getstack(&attr, &lo, &size) == 0) g_stack_lo = (char*) lo;
        pthread_attr_destroy(&attr);
    }
    loop();
    return nullptr;
}

// ---------------- entry point (called from the generated main) ----------------
inline int run(Test test) {
    std::string in;
    {
        char buf[1 << 16];
        std::size_t n;
        while ((n = std::fread(buf, 1, sizeof buf, stdin)) > 0) in.append(buf, n);
    }
    static JVal root;
    try {
        std::size_t nl = in.find('\n');
        std::string nonce = in.substr(0, nl == std::string::npos ? in.size() : nl);
        while (!nonce.empty() && std::isspace((unsigned char) nonce.back())) nonce.pop_back();
        if (nonce.size() != 32 || nonce.find_first_not_of("0123456789abcdef") != std::string::npos)
            throw std::invalid_argument("stdin line 1 must be a 32-char lowercase hex nonce");
        std::memcpy(g_nonce, nonce.data(), 32);
        std::size_t start = nl == std::string::npos ? in.size() : nl + 1;
        Parser parser{in.data(), in.data() + start, in.data() + in.size()};
        parser.value(root, 0);
        parser.ws();
        if (parser.p != parser.e) parser.fail("trailing characters");
        g_tests = field(root, "tests");
        if (!g_tests || g_tests->k != JVal::ARR) throw bad("tests (JSON array)", g_tests ? *g_tests : JVal());
    } catch (const std::exception& e) {
        std::fprintf(stderr, "harness: cannot read test input: %s\n", e.what());
        return 86;
    }
    std::string().swap(in);
    g_test = test;
    g_out_budget = file_size_limit(g_out_budget);

    // The learner's prints go through the sink: cout by its buffer, and C's
    // stdio by replacing stdout. Turning off stdio sync first makes a
    // learner's own sync_with_stdio(false) do nothing, as cout can't go back
    // to writing straight to stdout.
    std::fflush(stdout);
    std::ios_base::sync_with_stdio(false);
    std::cout.rdbuf(&g_outbuf);
    if (FILE* out = fopencookie(nullptr, "w", cookie_io_functions_t{nullptr, stdout_write, nullptr, nullptr})) {
        std::setvbuf(out, nullptr, _IONBF, 0);
        stdout = out;
    }
    install_signal_handlers();
    std::set_terminate(on_terminate);
    // On the learner's exit(), what they printed still lands in the test's logs
    std::atexit([] {
        if (g_sink.m.try_lock()) {
            g_sink.flushLocked();
            g_sink.m.unlock();
        }
    });

    // The tests run on a thread with a big stack, or on this one if that fails
    pthread_attr_t attr;
    pthread_t thread;
    bool started = pthread_attr_init(&attr) == 0 && pthread_attr_setstacksize(&attr, STACK_BYTES) == 0 &&
                   pthread_attr_setguardsize(&attr, GUARD_BYTES) == 0 && pthread_create(&thread, &attr, worker, nullptr) == 0;
    if (started) pthread_join(thread, nullptr);
    else worker(nullptr);
    std::cout.flush();
    std::fflush(nullptr);
    // Without running the learner's static destructors, which can't change
    // the results any more
    std::_Exit(g_harness_failed ? 86 : 0);
}

}  // namespace __skh

// The learner's assert() calls this. Defined here, it replaces the C
// library's, so the test reports the failed check and its line.
extern "C" [[noreturn]] void __assert_fail(const char* expr, const char* file, unsigned int line, const char*) noexcept {
    std::string message = std::string("Assertion failed: ") + (expr ? expr : "?");
    if (file && std::strcmp(file, "solution.cpp") == 0) message += " (line " + std::to_string(line) + ")";
    __skh::set_fatal_msg(message);
    std::abort();
}

// _GLIBCXX_ASSERTIONS checks call this, from noexcept code such as
// vector::operator[], so it can't throw. It records a readable error for the
// crash line instead: "Index out of range: std::vector<int>::operator[]".
namespace std {
[[noreturn]] void __glibcxx_assert_fail(const char*, int, const char* function, const char* condition) noexcept {
    std::string f(function ? function : "?"), c(condition ? condition : "?"), what;
    if (c.find("size()") != std::string::npos || c.find("_Nm") != std::string::npos) what = "Index out of range";
    else if (c.find("empty()") != std::string::npos) what = "Empty container";
    else if (c.find("_M_is_engaged") != std::string::npos || c.find("has_value") != std::string::npos) what = "Empty optional";
    else if (c.find("pointer()") != std::string::npos || c.find("nullptr") != std::string::npos) what = "Null pointer";
    else what = "Failed check " + c;
    // "constexpr std::vector<_Tp, _Alloc>::reference std::vector<_Tp, _Alloc>::operator[](size_type)
    // [with _Tp = int; ...]" becomes "std::vector<int>::operator[]"
    std::size_t paren = f.find('('), space = 0;
    int depth = 0;
    for (std::size_t k = 0; k < paren && paren != std::string::npos; ++k) {
        if (f[k] == '<') ++depth;
        else if (f[k] == '>') --depth;
        else if (f[k] == ' ' && depth == 0) space = k + 1;
    }
    std::string name = paren == std::string::npos ? f : f.substr(space, paren - space);
    for (const char* extra : {", _Alloc", ", _Traits", ", _Sequence", ", _Compare", ", _Hash", ", _Pred"}) {
        for (std::size_t at; (at = name.find(extra)) != std::string::npos;) name.erase(at, std::strlen(extra));
    }
    std::size_t with = f.find(" [with ");
    if (with != std::string::npos) {
        std::string params = f.substr(with + 7);
        for (const char* param : {"_Tp", "_CharT", "_Nm"}) {
            std::size_t at = params.find(std::string(param) + " = ");
            if (at == std::string::npos) continue;
            std::size_t start = at + std::strlen(param) + 3, stop = params.find_first_of(";]", start);
            std::string value = params.substr(start, stop - start);
            for (std::size_t pos; (pos = name.find(param)) != std::string::npos;) name.replace(pos, std::strlen(param), value);
        }
    }
    for (const char* text : {"std::__cxx11::basic_string<char>", "std::basic_string<char>"}) {
        std::size_t at = name.find(text);
        if (at != std::string::npos) name.replace(at, std::strlen(text), "std::string");
    }
    __skh::set_fatal_msg(what + ": " + name);
    std::abort();
}
}  // namespace std

// ---------------- driver-facing helpers ----------------
namespace __skh {
// A test's argument list, checked for its length
inline const JVal& args(const JVal& testCase, const char* key, std::size_t n) {
    const JVal* a = field(testCase, key);
    if (!a || a->k != JVal::ARR) throw bad(std::string(key) + " (JSON array)", a ? *a : JVal());
    if (a->size() != n)
        throw InputError("expected " + std::to_string(n) + " value(s) in \"" + key + "\", got " + std::to_string(a->size()));
    return *a;
}
inline const JVal& ops(const JVal& testCase) {
    const JVal* a = field(testCase, "ops");
    if (!a || a->k != JVal::ARR) throw bad("ops (JSON array)", a ? *a : JVal());
    for (std::size_t k = 0; k < a->size(); ++k) {
        const JVal& op = (*a)[k];
        if (op.k != JVal::ARR || op.size() == 0 || op[0].k != JVal::STR)
            throw InputError("ops[" + std::to_string(k) + "] must be [\"name\", ...args]");
    }
    return *a;
}
inline void op_arity(const JVal& op, std::size_t n) {
    if (op.size() - 1 != n)
        throw InputError("op \"" + op[0].str() + "\" takes " + std::to_string(n) + " argument(s), got " + std::to_string(op.size() - 1));
}
inline InputError unknown_op(const std::string& name) { return InputError("unknown op \"" + name + "\""); }
}  // namespace __skh
