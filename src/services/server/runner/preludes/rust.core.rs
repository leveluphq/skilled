
// ==== Skilled runner harness (Rust 1.99) ====
// Appended after the learner's code (so their line N is line N of main.rs).
// It lives in `mod __harness`, where the learner's names can't reach, adds no
// `use` at the crate root (theirs would clash, E0252), and spells out std's
// macros (a learner's own `vec!` would otherwise replace std's here).
// docs/adding-a-language.md has the contract it keeps: what it reads from stdin
// and the lines it prints.
#[allow(unknown_lints, renamed_and_removed_lints, warnings, dead_code, unused, unused_qualifications, unused_results, unused_lifetimes, unused_import_braces, unused_extern_crates, unused_macro_rules, unsafe_code, unsafe_op_in_unsafe_fn, non_snake_case, non_camel_case_types, non_upper_case_globals, nonstandard_style, missing_docs, missing_debug_implementations, missing_copy_implementations, unreachable_pub, single_use_lifetimes, trivial_casts, trivial_numeric_casts, elided_lifetimes_in_paths, let_underscore_drop, variant_size_differences, rust_2018_idioms, rust_2021_compatibility, rust_2024_compatibility, future_incompatible, keyword_idents, meta_variable_misuse, missing_abi, unit_bindings, deprecated, unreachable_code, unreachable_patterns, clippy::all)]
mod __harness {
    use ::std::any::Any;
    use ::std::cell::{Cell, RefCell};
    use ::std::io::{Read, Write};
    use ::std::sync::atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering};
    use ::std::sync::{Mutex, MutexGuard, OnceLock};
    use ::std::time::Instant;

    // Room for 200,000 frames of a recursive solution and plenty more. Where
    // the system won't give a thread that much, smaller stacks are tried. A
    // stack overflow can't be caught in Rust: it aborts the run.
    const STACK_SIZES: [usize; 3] = [256 << 20, 64 << 20, 16 << 20];
    const ERROR_MAX_CHARS: usize = 500;
    const LOG_CAP_PER_TEST: u64 = 64 << 10;
    const LOG_CAP_TOTAL: u64 = 256 << 10;
    // Worst-case bytes of one start line, error result and truncation note
    const ERROR_LINE_RESERVE: u64 = 800;
    const TRUNCATED: &str = "\n… (output truncated)\n";
    const TOO_LARGE: &str = "Your answer is too large to report";

    // stdout is capped by RLIMIT_FSIZE, and writing past it kills the program,
    // so nothing is written past it. run() lowers this to the real limit.
    static OUT_BUDGET: AtomicU64 = AtomicU64::new(64 << 20);
    // Lines of the learner's code, set by the driver, to place panics
    static USER_LINES: AtomicUsize = AtomicUsize::new(0);
    static HARNESS_FAILED: AtomicBool = AtomicBool::new(false);
    static NONCE: OnceLock<String> = OnceLock::new();

    // ---------------- errors ----------------
    // A test whose input doesn't fit the lesson's types (a mistake in the lesson)
    pub struct InputError(pub String);
    // An answer that can't be reported (a list that never ends, a huge answer)
    pub struct AnswerError(pub String);

    pub fn input_error(message: String) -> ! {
        ::std::panic::panic_any(InputError(message))
    }

    pub fn answer_error(message: &str) -> ! {
        ::std::panic::panic_any(AnswerError(message.to_string()))
    }

    pub fn bad(want: &str, got: &Json) -> ! {
        input_error(::std::format!("expected {}, got {}", want, kind(got)))
    }

    // ---------------- JSON ----------------
    pub enum Json {
        Null,
        Bool(bool),
        Int(i64),
        Float(f64),
        Str(String),
        Arr(Vec<Json>),
        // In order; a repeated key's last value wins, as in JSON.parse
        Obj(Vec<(String, Json)>),
    }

    pub fn kind(j: &Json) -> String {
        match j {
            Json::Null => "null".to_string(),
            Json::Bool(b) => ::std::format!("boolean {}", b),
            Json::Int(n) => ::std::format!("number {}", n),
            Json::Float(f) => ::std::format!("number {}", f),
            Json::Str(s) => {
                let short: String = s.chars().take(20).collect();
                let more = if short.len() < s.len() { "..." } else { "" };
                ::std::format!("string \"{}{}\"", short, more)
            }
            Json::Arr(_) => "array".to_string(),
            Json::Obj(_) => "object".to_string(),
        }
    }

    pub fn field<'a>(j: &'a Json, key: &str) -> Option<&'a Json> {
        match j {
            Json::Obj(fields) => fields.iter().rev().find(|(k, _)| k == key).map(|(_, v)| v),
            _ => None,
        }
    }

    struct Parser<'a> {
        b: &'a [u8],
        i: usize,
    }

    impl<'a> Parser<'a> {
        fn err<T>(&self, m: &str) -> Result<T, String> {
            Err(::std::format!("bad JSON: {} at offset {}", m, self.i))
        }
        fn ws(&mut self) {
            while self.i < self.b.len() && ::std::matches!(self.b[self.i], b' ' | b'\t' | b'\n' | b'\r') {
                self.i += 1;
            }
        }
        fn peek(&self) -> Option<u8> {
            self.b.get(self.i).copied()
        }
        fn document(&mut self) -> Result<Json, String> {
            let v = self.value(0)?;
            self.ws();
            if self.i != self.b.len() {
                return self.err("trailing characters");
            }
            Ok(v)
        }
        fn value(&mut self, depth: usize) -> Result<Json, String> {
            if depth > 1000 {
                return self.err("nesting too deep");
            }
            self.ws();
            match self.peek() {
                None => self.err("unexpected end of input"),
                Some(b'{') => {
                    self.i += 1;
                    let mut fields = Vec::new();
                    self.ws();
                    if self.peek() == Some(b'}') {
                        self.i += 1;
                        return Ok(Json::Obj(fields));
                    }
                    loop {
                        self.ws();
                        if self.peek() != Some(b'"') {
                            return self.err("expected string key");
                        }
                        let k = self.string()?;
                        self.ws();
                        if self.peek() != Some(b':') {
                            return self.err("expected ':'");
                        }
                        self.i += 1;
                        let v = self.value(depth + 1)?;
                        fields.push((k, v));
                        self.ws();
                        match self.peek() {
                            Some(b',') => self.i += 1,
                            Some(b'}') => {
                                self.i += 1;
                                return Ok(Json::Obj(fields));
                            }
                            _ => return self.err("expected ',' or '}'"),
                        }
                    }
                }
                Some(b'[') => {
                    self.i += 1;
                    let mut items = Vec::new();
                    self.ws();
                    if self.peek() == Some(b']') {
                        self.i += 1;
                        return Ok(Json::Arr(items));
                    }
                    loop {
                        items.push(self.value(depth + 1)?);
                        self.ws();
                        match self.peek() {
                            Some(b',') => self.i += 1,
                            Some(b']') => {
                                self.i += 1;
                                return Ok(Json::Arr(items));
                            }
                            _ => return self.err("expected ',' or ']'"),
                        }
                    }
                }
                Some(b'"') => Ok(Json::Str(self.string()?)),
                Some(b't') => self.literal("true", Json::Bool(true)),
                Some(b'f') => self.literal("false", Json::Bool(false)),
                Some(b'n') => self.literal("null", Json::Null),
                Some(c) if c == b'-' || c.is_ascii_digit() => self.number(),
                Some(_) => self.err("unexpected character"),
            }
        }
        fn literal(&mut self, word: &str, v: Json) -> Result<Json, String> {
            if self.b[self.i..].starts_with(word.as_bytes()) {
                self.i += word.len();
                Ok(v)
            } else {
                self.err("invalid literal")
            }
        }
        fn number(&mut self) -> Result<Json, String> {
            let start = self.i;
            let mut float = false;
            if self.peek() == Some(b'-') {
                self.i += 1;
            }
            while let Some(c) = self.peek() {
                if c.is_ascii_digit() {
                    self.i += 1;
                } else if ::std::matches!(c, b'.' | b'e' | b'E' | b'+' | b'-') {
                    float = true;
                    self.i += 1;
                } else {
                    break;
                }
            }
            let text = ::std::str::from_utf8(&self.b[start..self.i]).unwrap_or("");
            // Integers stay exact; one beyond 64 bits becomes a double, which
            // the converters reject rather than silently round
            if !float {
                if let Ok(n) = text.parse::<i64>() {
                    return Ok(Json::Int(n));
                }
            }
            match text.parse::<f64>() {
                Ok(f) if f.is_finite() => Ok(Json::Float(f)),
                _ => self.err(&::std::format!("bad number '{}'", text)),
            }
        }
        fn hex4(&mut self) -> Result<u32, String> {
            if self.i + 4 > self.b.len() || !self.b[self.i..self.i + 4].iter().all(|c| c.is_ascii_hexdigit()) {
                return self.err("bad unicode escape");
            }
            let text = ::std::str::from_utf8(&self.b[self.i..self.i + 4]).unwrap_or("0");
            self.i += 4;
            Ok(u32::from_str_radix(text, 16).unwrap_or(0xFFFD))
        }
        fn string(&mut self) -> Result<String, String> {
            self.i += 1;
            let mut out: Vec<u8> = Vec::new();
            loop {
                let c = match self.peek() {
                    None => return self.err("unterminated string"),
                    Some(c) => c,
                };
                self.i += 1;
                match c {
                    b'"' => break,
                    b'\\' => {
                        let e = match self.peek() {
                            None => return self.err("bad escape"),
                            Some(e) => e,
                        };
                        self.i += 1;
                        let ch = match e {
                            b'"' => '"',
                            b'\\' => '\\',
                            b'/' => '/',
                            b'b' => '\u{8}',
                            b'f' => '\u{c}',
                            b'n' => '\n',
                            b'r' => '\r',
                            b't' => '\t',
                            b'u' => {
                                let high = self.hex4()?;
                                let code = if (0xD800..0xDC00).contains(&high) && self.b[self.i..].starts_with(b"\\u") {
                                    let save = self.i;
                                    self.i += 2;
                                    let low = self.hex4()?;
                                    if (0xDC00..0xE000).contains(&low) {
                                        0x10000 + ((high - 0xD800) << 10) + (low - 0xDC00)
                                    } else {
                                        self.i = save;
                                        0xFFFD
                                    }
                                } else {
                                    high
                                };
                                char::from_u32(code).unwrap_or('\u{FFFD}')
                            }
                            _ => return self.err("bad escape"),
                        };
                        let mut buf = [0u8; 4];
                        out.extend_from_slice(ch.encode_utf8(&mut buf).as_bytes());
                    }
                    c if c < 0x20 => return self.err("control character in string"),
                    c => out.push(c),
                }
            }
            String::from_utf8(out).or_else(|_| self.err("invalid UTF-8 in string"))
        }
    }

    // ---------------- JSON to Rust ----------------
    pub trait FromJson: Sized {
        fn from_json(j: &Json) -> Self;
        // As the inside of an Option: null is None (lists and trees take [] too)
        fn from_json_opt(j: &Json) -> Option<Self> {
            match j {
                Json::Null => None,
                _ => Some(Self::from_json(j)),
            }
        }
    }

    pub fn from_json<T: FromJson>(j: &Json) -> T {
        T::from_json(j)
    }

    impl FromJson for i32 {
        fn from_json(j: &Json) -> Self {
            match *j {
                Json::Int(n) if n >= i32::MIN as i64 && n <= i32::MAX as i64 => n as i32,
                Json::Float(f) if f == f.trunc() && f >= i32::MIN as f64 && f <= i32::MAX as f64 => f as i32,
                _ => bad("int (32-bit)", j),
            }
        }
    }
    impl FromJson for i64 {
        fn from_json(j: &Json) -> Self {
            match *j {
                Json::Int(n) => n,
                // Float-form integers only below 2^53, where they're exact
                Json::Float(f) if f == f.trunc() && f.abs() < 9007199254740992.0 => f as i64,
                _ => bad("long (64-bit int)", j),
            }
        }
    }
    impl FromJson for f64 {
        fn from_json(j: &Json) -> Self {
            match *j {
                Json::Int(n) => n as f64,
                Json::Float(f) => f,
                _ => bad("double", j),
            }
        }
    }
    impl FromJson for bool {
        fn from_json(j: &Json) -> Self {
            match *j {
                Json::Bool(b) => b,
                _ => bad("bool", j),
            }
        }
    }
    impl FromJson for String {
        fn from_json(j: &Json) -> Self {
            match j {
                Json::Str(s) => s.clone(),
                _ => bad("string", j),
            }
        }
    }
    impl FromJson for char {
        fn from_json(j: &Json) -> Self {
            if let Json::Str(s) = j {
                let mut chars = s.chars();
                if let (Some(c), None) = (chars.next(), chars.next()) {
                    return c;
                }
            }
            bad("char (1-char string)", j)
        }
    }
    impl<T: FromJson> FromJson for Vec<T> {
        fn from_json(j: &Json) -> Self {
            match j {
                Json::Arr(items) => items.iter().map(T::from_json).collect(),
                _ => bad("array", j),
            }
        }
    }
    impl<T: FromJson> FromJson for Option<T> {
        fn from_json(j: &Json) -> Self {
            T::from_json_opt(j)
        }
    }
    impl<T: FromJson> FromJson for ::std::collections::HashMap<String, T> {
        fn from_json(j: &Json) -> Self {
            match j {
                Json::Obj(fields) => fields.iter().map(|(k, v)| (k.clone(), T::from_json(v))).collect(),
                _ => bad("map (JSON object)", j),
            }
        }
    }

    // ---------------- the driver's helpers ----------------
    // A test's "args", "hidden" or "ctorArgs", which must have n values
    pub fn args<'a>(case: &'a Json, key: &str, n: usize) -> &'a [Json] {
        match field(case, key) {
            Some(Json::Arr(values)) if values.len() == n => values,
            Some(Json::Arr(values)) => input_error(::std::format!(
                "expected {} value(s) in \"{}\", got {}",
                n,
                key,
                values.len()
            )),
            Some(other) => bad(&::std::format!("{} (JSON array)", key), other),
            None => bad(&::std::format!("{} (JSON array)", key), &Json::Null),
        }
    }

    // A design test's calls, each ["name", ...args]
    pub fn ops(case: &Json) -> &[Json] {
        let ops = match field(case, "ops") {
            Some(Json::Arr(ops)) => ops,
            Some(other) => bad("ops (JSON array)", other),
            None => bad("ops (JSON array)", &Json::Null),
        };
        for (k, op) in ops.iter().enumerate() {
            match op {
                Json::Arr(parts) if ::std::matches!(parts.first(), Some(Json::Str(_))) => {}
                _ => input_error(::std::format!("ops[{}] must be [\"name\", ...args]", k)),
            }
        }
        ops
    }

    // The k-th call's method name; errors from here on name the call
    pub fn op_at(k: usize, op: &Json) -> &str {
        match op {
            Json::Arr(parts) => match parts.first() {
                Some(Json::Str(name)) => {
                    OP.with(|o| *o.borrow_mut() = Some((k, name.clone())));
                    name
                }
                _ => unknown_op(""),
            },
            _ => unknown_op(""),
        }
    }

    pub fn op_arity(op: &Json, n: usize) {
        if let Json::Arr(parts) = op {
            if parts.len() - 1 != n {
                let name = match parts.first() {
                    Some(Json::Str(name)) => name.as_str(),
                    _ => "",
                };
                input_error(::std::format!("op \"{}\" takes {} argument(s), got {}", name, n, parts.len() - 1));
            }
        }
    }

    pub fn op_arg(op: &Json, i: usize) -> &Json {
        match op {
            Json::Arr(parts) => &parts[i + 1],
            _ => &Json::Null,
        }
    }

    pub fn unknown_op(name: &str) -> ! {
        input_error(::std::format!("unknown op \"{}\"", name))
    }

    // Values for the tests' helper functions (first-bad-version's badVersion)
    pub fn set_hidden<T: 'static>(key: &'static ::std::thread::LocalKey<RefCell<Option<T>>>, value: T) {
        key.with(|cell| *cell.borrow_mut() = Some(value));
    }

    pub fn hidden<T: Clone + 'static>(key: &'static ::std::thread::LocalKey<RefCell<Option<T>>>) -> T {
        match key.with(|cell| cell.borrow().clone()) {
            Some(value) => value,
            None => answer_error("The tests' helper function was called outside a test"),
        }
    }

    // ---------------- timing (called by the driver) ----------------
    ::std::thread_local! {
        static T0: Cell<Option<Instant>> = const { Cell::new(None) };
        static T1: Cell<Option<Instant>> = const { Cell::new(None) };
        static OP: RefCell<Option<(usize, String)>> = const { RefCell::new(None) };
        static PANIC: RefCell<Option<Panic>> = const { RefCell::new(None) };
    }

    pub fn tic() {
        T1.with(|t| t.set(None));
        T0.with(|t| t.set(Some(Instant::now())));
    }

    pub fn toc() {
        T1.with(|t| t.set(Some(Instant::now())));
    }

    // ---------------- Rust to JSON ----------------
    // Whatever a solution returns: a lesson's int[] may come back as a Vec<i32>,
    // a Vec<usize>, a VecDeque, a [i32; 2]...
    pub trait ToJson {
        fn to_json(&self, out: &mut String);
        // How None is reported when this is inside an Option: null, or [] for
        // a list or a tree
        fn none_json(out: &mut String) {
            out.push_str("null");
        }
    }

    // Stops an answer from outgrowing the output (a list with a loop, say)
    pub fn check_size(out: &String) {
        if out.len() as u64 > OUT_BUDGET.load(Ordering::Relaxed) {
            answer_error(TOO_LARGE)
        }
    }

    pub fn str_json(out: &mut String, s: &str) {
        out.push('"');
        for c in s.chars() {
            match c {
                '"' => out.push_str("\\\""),
                '\\' => out.push_str("\\\\"),
                '\n' => out.push_str("\\n"),
                '\r' => out.push_str("\\r"),
                '\t' => out.push_str("\\t"),
                '\u{8}' => out.push_str("\\b"),
                '\u{c}' => out.push_str("\\f"),
                c if (c as u32) < 0x20 => out.push_str(&::std::format!("\\u{:04x}", c as u32)),
                c => out.push(c),
            }
        }
        out.push('"');
    }

    pub fn f64_json(out: &mut String, f: f64) {
        use ::std::fmt::Write as _;
        if f.is_finite() {
            // The shortest text that reads back as the same double: 0.1, 1e21
            let _ = ::std::write!(out, "{:?}", f);
        } else {
            out.push_str("null");
        }
    }

    fn list_json<'a, T: ToJson + 'a>(out: &mut String, items: impl Iterator<Item = &'a T>) {
        out.push('[');
        for (k, item) in items.enumerate() {
            if k > 0 {
                out.push(',');
            }
            item.to_json(out);
            check_size(out);
        }
        out.push(']');
    }

    // Keys sorted, so a HashMap's order doesn't matter
    fn map_json<'a, K: JsonKey + 'a, V: ToJson + 'a>(out: &mut String, entries: impl Iterator<Item = (&'a K, &'a V)>) {
        let mut sorted: Vec<(String, &V)> = entries.map(|(k, v)| (k.key(), v)).collect();
        sorted.sort_by(|a, b| a.0.cmp(&b.0));
        out.push('{');
        for (k, (key, value)) in sorted.into_iter().enumerate() {
            if k > 0 {
                out.push(',');
            }
            str_json(out, &key);
            out.push(':');
            value.to_json(out);
            check_size(out);
        }
        out.push('}');
    }

    pub trait JsonKey {
        fn key(&self) -> String;
    }
    impl JsonKey for String {
        fn key(&self) -> String {
            self.clone()
        }
    }
    impl JsonKey for &str {
        fn key(&self) -> String {
            self.to_string()
        }
    }
    impl JsonKey for char {
        fn key(&self) -> String {
            self.to_string()
        }
    }

    macro_rules! integer_json {
        ($($t:ty),*) => {$(
            impl ToJson for $t {
                fn to_json(&self, out: &mut String) {
                    use ::std::fmt::Write as _;
                    let _ = ::std::write!(out, "{}", self);
                }
            }
        )*};
    }
    integer_json!(i8, i16, i32, i64, i128, isize, u8, u16, u32, u64, u128, usize);

    impl ToJson for f64 {
        fn to_json(&self, out: &mut String) {
            f64_json(out, *self);
        }
    }
    impl ToJson for f32 {
        fn to_json(&self, out: &mut String) {
            use ::std::fmt::Write as _;
            if self.is_finite() {
                let _ = ::std::write!(out, "{:?}", self);
            } else {
                out.push_str("null");
            }
        }
    }
    impl ToJson for bool {
        fn to_json(&self, out: &mut String) {
            out.push_str(if *self { "true" } else { "false" });
        }
    }
    impl ToJson for char {
        fn to_json(&self, out: &mut String) {
            let mut buf = [0u8; 4];
            str_json(out, self.encode_utf8(&mut buf));
        }
    }
    impl ToJson for str {
        fn to_json(&self, out: &mut String) {
            str_json(out, self);
            check_size(out);
        }
    }
    impl ToJson for String {
        fn to_json(&self, out: &mut String) {
            str_json(out, self);
            check_size(out);
        }
    }
    impl ToJson for () {
        fn to_json(&self, out: &mut String) {
            out.push_str("null");
        }
    }
    impl<T: ToJson + ?Sized> ToJson for &T {
        fn to_json(&self, out: &mut String) {
            (**self).to_json(out);
        }
        fn none_json(out: &mut String) {
            T::none_json(out);
        }
    }
    impl<T: ToJson + ?Sized> ToJson for &mut T {
        fn to_json(&self, out: &mut String) {
            (**self).to_json(out);
        }
        fn none_json(out: &mut String) {
            T::none_json(out);
        }
    }
    impl<T: ToJson + ?Sized> ToJson for Box<T> {
        fn to_json(&self, out: &mut String) {
            (**self).to_json(out);
        }
        fn none_json(out: &mut String) {
            T::none_json(out);
        }
    }
    impl<T: ToJson + ?Sized> ToJson for ::std::rc::Rc<T> {
        fn to_json(&self, out: &mut String) {
            (**self).to_json(out);
        }
        fn none_json(out: &mut String) {
            T::none_json(out);
        }
    }
    impl<T: ToJson> ToJson for RefCell<T> {
        fn to_json(&self, out: &mut String) {
            match self.try_borrow() {
                Ok(value) => value.to_json(out),
                Err(_) => answer_error("The answer is still borrowed (RefCell::borrow_mut)"),
            }
        }
        fn none_json(out: &mut String) {
            T::none_json(out);
        }
    }
    impl<T: ToJson> ToJson for Option<T> {
        fn to_json(&self, out: &mut String) {
            match self {
                Some(value) => value.to_json(out),
                None => T::none_json(out),
            }
        }
    }
    impl<T: ToJson> ToJson for [T] {
        fn to_json(&self, out: &mut String) {
            list_json(out, self.iter());
        }
    }
    impl<T: ToJson, const N: usize> ToJson for [T; N] {
        fn to_json(&self, out: &mut String) {
            list_json(out, self.iter());
        }
    }
    impl<T: ToJson> ToJson for Vec<T> {
        fn to_json(&self, out: &mut String) {
            list_json(out, self.iter());
        }
    }
    impl<T: ToJson> ToJson for ::std::collections::VecDeque<T> {
        fn to_json(&self, out: &mut String) {
            list_json(out, self.iter());
        }
    }
    impl<T: ToJson> ToJson for ::std::collections::LinkedList<T> {
        fn to_json(&self, out: &mut String) {
            list_json(out, self.iter());
        }
    }
    impl<T: ToJson, S> ToJson for ::std::collections::HashSet<T, S> {
        fn to_json(&self, out: &mut String) {
            list_json(out, self.iter());
        }
    }
    impl<T: ToJson> ToJson for ::std::collections::BTreeSet<T> {
        fn to_json(&self, out: &mut String) {
            list_json(out, self.iter());
        }
    }
    impl<K: JsonKey, V: ToJson, S> ToJson for ::std::collections::HashMap<K, V, S> {
        fn to_json(&self, out: &mut String) {
            map_json(out, self.iter());
        }
    }
    impl<K: JsonKey, V: ToJson> ToJson for ::std::collections::BTreeMap<K, V> {
        fn to_json(&self, out: &mut String) {
            map_json(out, self.iter());
        }
    }
    impl<A: ToJson, B: ToJson> ToJson for (A, B) {
        fn to_json(&self, out: &mut String) {
            out.push('[');
            self.0.to_json(out);
            out.push(',');
            self.1.to_json(out);
            out.push(']');
        }
    }
    impl<A: ToJson, B: ToJson, C: ToJson> ToJson for (A, B, C) {
        fn to_json(&self, out: &mut String) {
            out.push('[');
            self.0.to_json(out);
            out.push(',');
            self.1.to_json(out);
            out.push(',');
            self.2.to_json(out);
            out.push(']');
        }
    }

    pub fn answer<T: ToJson + ?Sized>(value: &T) -> String {
        let mut out = String::new();
        value.to_json(&mut out);
        check_size(&out);
        out
    }

    // A design test's answers, one per call
    pub struct Answers(String);

    impl Answers {
        pub fn new() -> Answers {
            Answers(String::from("["))
        }
        pub fn push<T: ToJson + ?Sized>(&mut self, value: &T) {
            if self.0.len() > 1 {
                self.0.push(',');
            }
            value.to_json(&mut self.0);
            check_size(&self.0);
        }
        pub fn push_json(&mut self, json: String) {
            if self.0.len() > 1 {
                self.0.push(',');
            }
            self.0.push_str(&json);
            check_size(&self.0);
        }
        pub fn finish(mut self) -> String {
            self.0.push(']');
            self.0
        }
    }

    // ---------------- panics ----------------
    // What the panic hook saw: the message, and the line when it's the learner's
    struct Panic {
        prefix: &'static str,
        message: String,
        line: Option<u32>,
    }

    fn panic_of(payload: &(dyn Any + Send)) -> (&'static str, String) {
        if let Some(e) = payload.downcast_ref::<InputError>() {
            ("HarnessInputError", e.0.clone())
        } else if let Some(e) = payload.downcast_ref::<AnswerError>() {
            ("", e.0.clone())
        } else if let Some(s) = payload.downcast_ref::<&'static str>() {
            ("panicked", s.to_string())
        } else if let Some(s) = payload.downcast_ref::<String>() {
            ("panicked", s.clone())
        } else {
            ("panicked", "Box<dyn Any>".to_string())
        }
    }

    // Installed before every test, as the learner's code may replace it. It
    // keeps the message for the result instead of printing it to stderr.
    fn install_panic_hook() {
        ::std::panic::set_hook(Box::new(|info| {
            let (prefix, message) = panic_of(info.payload());
            let user_lines = USER_LINES.load(Ordering::Relaxed) as u32;
            let line = info
                .location()
                .filter(|l| l.file() == "main.rs" && l.line() >= 1 && l.line() <= user_lines)
                .map(|l| l.line());
            let _ = PANIC.try_with(|p| *p.borrow_mut() = Some(Panic { prefix, message, line }));
        }));
    }

    // "panicked: attempt to divide by zero (line 5)", with the line only when
    // it's in the learner's code
    fn describe(payload: &(dyn Any + Send)) -> String {
        let panic = PANIC.with(|p| p.borrow_mut().take()).unwrap_or_else(|| {
            let (prefix, message) = panic_of(payload);
            Panic { prefix, message, line: None }
        });
        let mut text = String::new();
        if !panic.prefix.is_empty() {
            text.push_str(panic.prefix);
            text.push_str(": ");
        }
        text.push_str(&panic.message);
        if let Some((k, name)) = OP.with(|o| o.borrow().clone()) {
            text.push_str(&::std::format!(" [during call #{}, {}]", k + 1, name));
        }
        if let Some(line) = panic.line {
            text.push_str(&::std::format!(" (line {})", line));
        }
        if text.chars().count() > ERROR_MAX_CHARS {
            text = text.chars().take(ERROR_MAX_CHARS).collect::<String>() + "…";
        }
        text
    }

    // ---------------- output ----------------
    // The learner's prints go to fd 1, which is a pipe the harness reads, so
    // each test's prints can be capped and land before its result line. The
    // harness writes its own lines to a copy of the real stdout.
    #[repr(C)]
    struct PollFd {
        fd: i32,
        events: i16,
        revents: i16,
    }

    unsafe extern "C" {
        fn dup(fd: i32) -> i32;
        fn dup2(old: i32, new: i32) -> i32;
        fn pipe(fds: *mut i32) -> i32;
        fn close(fd: i32) -> i32;
        fn fcntl(fd: i32, cmd: i32, ...) -> i32;
        fn poll(fds: *mut PollFd, count: u64, timeout: i32) -> i32;
    }

    // Linux (x86_64 and arm64)
    const F_GETFL: i32 = 3;
    const F_SETFL: i32 = 4;
    const O_NONBLOCK: i32 = 0o4000;
    const POLLIN: i16 = 1;

    struct Sink {
        // The real stdout, and the pipe the learner's prints arrive on (-1
        // when they go straight to stdout)
        real: i32,
        pipe: i32,
        last: u8,
        test_bytes: u64,
        total_bytes: u64,
        written: u64,
        noted: bool,
    }

    static SINK: Mutex<Sink> = Mutex::new(Sink {
        real: 1,
        pipe: -1,
        last: b'\n',
        test_bytes: 0,
        total_bytes: 0,
        written: 0,
        noted: false,
    });

    fn sink() -> MutexGuard<'static, Sink> {
        SINK.lock().unwrap_or_else(|e| e.into_inner())
    }

    fn write_fd(fd: i32, bytes: &[u8]) -> bool {
        use ::std::os::unix::io::FromRawFd;
        let mut file = ::std::mem::ManuallyDrop::new(unsafe { ::std::fs::File::from_raw_fd(fd) });
        file.write_all(bytes).is_ok()
    }

    impl Sink {
        fn new_test(&mut self) {
            self.test_bytes = 0;
            self.noted = false;
        }

        fn log_room_left(&self) -> u64 {
            LOG_CAP_TOTAL.saturating_sub(self.total_bytes) + TRUNCATED.len() as u64
        }

        // The learner's prints, capped per test and in total
        fn user(&mut self, bytes: &[u8]) {
            let room = (LOG_CAP_PER_TEST.saturating_sub(self.test_bytes)).min(LOG_CAP_TOTAL.saturating_sub(self.total_bytes));
            let n = (bytes.len() as u64).min(room) as usize;
            if n > 0 {
                write_fd(self.real, &bytes[..n]);
                self.last = bytes[n - 1];
                self.test_bytes += n as u64;
                self.total_bytes += n as u64;
                self.written += n as u64;
            }
            if n < bytes.len() && !self.noted {
                self.noted = true;
                write_fd(self.real, TRUNCATED.as_bytes());
                self.written += TRUNCATED.len() as u64;
                self.last = b'\n';
            }
        }

        // Passes on whatever is waiting in the pipe. True at its end.
        fn drain(&mut self) -> bool {
            use ::std::os::unix::io::FromRawFd;
            if self.pipe < 0 {
                return true;
            }
            let mut file = ::std::mem::ManuallyDrop::new(unsafe { ::std::fs::File::from_raw_fd(self.pipe) });
            let mut buf = [0u8; 16384];
            loop {
                match file.read(&mut buf) {
                    Ok(0) => return true,
                    Ok(n) => self.user(&buf[..n]),
                    Err(e) if e.kind() == ::std::io::ErrorKind::Interrupted => {}
                    Err(e) if e.kind() == ::std::io::ErrorKind::WouldBlock => return false,
                    Err(_) => return true,
                }
            }
        }

        // A harness line, always on a line of its own
        fn harness(&mut self, line: &[u8]) -> bool {
            if self.last != b'\n' {
                if !write_fd(self.real, b"\n") {
                    return false;
                }
                self.written += 1;
            }
            self.last = b'\n';
            self.written += line.len() as u64;
            write_fd(self.real, line)
        }
    }

    fn capture_stdout() {
        let mut fds = [0i32; 2];
        let real = unsafe { dup(1) };
        if real < 0 {
            return;
        }
        if unsafe { pipe(fds.as_mut_ptr()) } != 0 {
            unsafe { close(real) };
            return;
        }
        if unsafe { dup2(fds[1], 1) } < 0 {
            unsafe {
                close(fds[0]);
                close(fds[1]);
                close(real);
            }
            return;
        }
        unsafe {
            close(fds[1]);
            let flags = fcntl(fds[0], F_GETFL);
            fcntl(fds[0], F_SETFL, flags | O_NONBLOCK);
        }
        {
            let mut s = sink();
            s.real = real;
            s.pipe = fds[0];
        }
        let reader = fds[0];
        let spawned = ::std::thread::Builder::new()
            .name("output".to_string())
            .stack_size(256 << 10)
            .spawn(move || forward(reader));
        if spawned.is_err() {
            // Without a reader a full pipe would block the learner's prints
            unsafe { dup2(real, 1) };
            sink().pipe = -1;
        }
    }

    // Passes the learner's prints on as they come, so a pipe that fills up
    // never blocks them
    fn forward(pipe: i32) {
        loop {
            let mut p = PollFd { fd: pipe, events: POLLIN, revents: 0 };
            if unsafe { poll(&mut p, 1, -1) } < 0 {
                if ::std::io::Error::last_os_error().kind() == ::std::io::ErrorKind::Interrupted {
                    continue;
                }
                return;
            }
            if sink().drain() {
                return;
            }
        }
    }

    fn emit(json: &str) {
        let nonce = NONCE.get().map(|n| n.as_str()).unwrap_or("");
        let mut line = String::with_capacity(nonce.len() + json.len() + 1);
        line.push_str(nonce);
        line.push_str(json);
        line.push('\n');
        emit_bytes(line.as_bytes());
    }

    fn emit_bytes(line: &[u8]) {
        // The learner's buffered prints go first, so they land in this test's logs
        let stdout = ::std::io::stdout();
        let mut lock = stdout.lock();
        let _ = lock.flush();
        let mut s = sink();
        s.drain();
        if !s.harness(line) && !HARNESS_FAILED.swap(true, Ordering::Relaxed) {
            let _ = ::std::writeln!(::std::io::stderr(), "harness: writing to stdout failed (output file size limit?)");
        }
    }

    // The soft RLIMIT_FSIZE from /proc/self/limits, capped at dflt
    fn file_size_limit(dflt: u64) -> u64 {
        let limits = match ::std::fs::read_to_string("/proc/self/limits") {
            Ok(text) => text,
            Err(_) => return dflt,
        };
        for line in limits.lines() {
            if let Some(rest) = line.strip_prefix("Max file size") {
                return match rest.split_whitespace().next() {
                    Some("unlimited") | None => dflt,
                    Some(soft) => soft.parse::<u64>().map(|n| n.min(dflt)).unwrap_or(dflt),
                };
            }
        }
        dflt
    }

    // The tests are in stdin, which is a file: point it at /dev/null so the
    // learner's code can't seek back and read the nonce
    fn seal_stdin() {
        use ::std::os::unix::io::AsRawFd;
        if let Ok(null) = ::std::fs::File::open("/dev/null") {
            unsafe { dup2(null.as_raw_fd(), 0) };
        }
    }

    fn read_tests() -> Result<Vec<Json>, String> {
        let mut raw = Vec::new();
        ::std::io::stdin().lock().read_to_end(&mut raw).map_err(|e| e.to_string())?;
        let text = String::from_utf8(raw).map_err(|_| "stdin is not UTF-8".to_string())?;
        let (first, rest) = match text.find('\n') {
            Some(at) => (&text[..at], &text[at + 1..]),
            None => (&text[..], ""),
        };
        let nonce = first.trim();
        if nonce.len() != 32 || !nonce.bytes().all(|c| ::std::matches!(c, b'0'..=b'9' | b'a'..=b'f')) {
            return Err("stdin line 1 must be a 32-char lowercase hex nonce".to_string());
        }
        let _ = NONCE.set(nonce.to_string());
        let document = Parser { b: rest.as_bytes(), i: 0 }.document()?;
        match document {
            Json::Obj(fields) => match fields.into_iter().rev().find(|(k, _)| k == "tests") {
                Some((_, Json::Arr(tests))) => Ok(tests),
                _ => Err("expected \"tests\" (JSON array)".to_string()),
            },
            _ => Err("expected an object with \"tests\"".to_string()),
        }
    }

    // ---------------- entry point (called from the generated main) ----------------
    pub fn run(test: fn(&Json) -> String, user_lines: usize) {
        USER_LINES.store(user_lines, Ordering::Relaxed);
        let tests = match read_tests() {
            Ok(tests) => tests,
            Err(e) => {
                let _ = ::std::writeln!(::std::io::stderr(), "harness: cannot read test input: {}", e);
                ::std::process::exit(86);
            }
        };
        seal_stdin();
        OUT_BUDGET.store(file_size_limit(64 << 20), Ordering::Relaxed);
        capture_stdout();

        let mut pending = Some(tests);
        for &size in STACK_SIZES.iter() {
            let tests = match pending.take() {
                Some(tests) => tests,
                None => break,
            };
            let shared = ::std::sync::Arc::new(Mutex::new(Some(tests)));
            let mine = ::std::sync::Arc::clone(&shared);
            let spawned = ::std::thread::Builder::new()
                .name("tests".to_string())
                .stack_size(size)
                .spawn(move || {
                    let tests = mine.lock().unwrap_or_else(|e| e.into_inner()).take();
                    if let Some(tests) = tests {
                        run_tests(test, tests);
                    }
                });
            match spawned {
                Ok(worker) => {
                    if worker.join().is_err() {
                        HARNESS_FAILED.store(true, Ordering::Relaxed);
                        let _ = ::std::writeln!(::std::io::stderr(), "harness: internal failure");
                    }
                }
                Err(_) => pending = shared.lock().unwrap_or_else(|e| e.into_inner()).take(),
            }
        }
        if let Some(tests) = pending {
            run_tests(test, tests);
        }
        let _ = ::std::io::stdout().lock().flush();
        sink().drain();
        ::std::process::exit(if HARNESS_FAILED.load(Ordering::Relaxed) { 86 } else { 0 });
    }

    fn ms(out: &mut String, end: Option<Instant>) {
        let elapsed = match (T0.with(|t| t.get()), end) {
            (Some(t0), Some(end)) => (end.saturating_duration_since(t0).as_nanos() as f64 / 1000.0).round() / 1000.0,
            _ => 0.0,
        };
        f64_json(out, elapsed);
    }

    fn error_line(i: usize, message: &str, end: Option<Instant>) -> String {
        let mut line = ::std::format!("{{\"t\":\"result\",\"i\":{},\"ok\":false,\"error\":", i);
        str_json(&mut line, message);
        line.push_str(",\"ms\":");
        ms(&mut line, end);
        line.push('}');
        line
    }

    fn run_tests(test: fn(&Json) -> String, mut tests: Vec<Json>) {
        let count = tests.len();
        for i in 0..count {
            sink().new_test();
            emit(&::std::format!("{{\"t\":\"start\",\"i\":{}}}", i));
            T0.with(|t| t.set(None));
            T1.with(|t| t.set(None));
            OP.with(|o| *o.borrow_mut() = None);
            PANIC.with(|p| *p.borrow_mut() = None);
            install_panic_hook();
            let case = ::std::mem::replace(&mut tests[i], Json::Null);
            let outcome = ::std::panic::catch_unwind(::std::panic::AssertUnwindSafe(|| test(&case)));
            let end = T1.with(|t| t.get()).or_else(|| Some(Instant::now()));
            let mut line = match outcome {
                Ok(json) => {
                    let mut line = ::std::format!("{{\"t\":\"result\",\"i\":{},\"ok\":true,\"out\":", i);
                    line.push_str(&json);
                    line.push_str(",\"ms\":");
                    ms(&mut line, end);
                    line.push('}');
                    line
                }
                Err(payload) => {
                    let message = describe(&*payload);
                    // A panicking Drop in the payload mustn't take the harness down
                    let _ = ::std::panic::catch_unwind(::std::panic::AssertUnwindSafe(move || drop(payload)));
                    error_line(i, &message, end)
                }
            };
            drop(case);
            // Keep room for the remaining tests' start and error lines, their
            // capped logs and the done line
            let (written, room) = {
                let s = sink();
                (s.written, s.log_room_left())
            };
            let reserve = ERROR_LINE_RESERVE * (count - i) as u64 + room + 64;
            let nonce = NONCE.get().map(|n| n.len()).unwrap_or(0) as u64;
            if written + nonce + line.len() as u64 + 1 + reserve > OUT_BUDGET.load(Ordering::Relaxed) {
                line = error_line(i, TOO_LARGE, end);
            }
            emit(&line);
        }
        emit("{\"t\":\"done\"}");
    }
}
