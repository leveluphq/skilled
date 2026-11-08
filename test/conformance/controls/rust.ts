import { CodingLanguage } from 'utils/constants/lesson';
import { LanguageControls } from './types';

const solution = (body: string, imports = '') =>
  `${imports}impl Solution {\n    pub fn add_numbers(a: i32, b: i32) -> i32 {\n${body}\n    }\n}\n`;

const controls: LanguageControls = {
  name: 'Rust',
  language: CodingLanguage.Rust,
  correct: solution('        a + b'),
  throwsOnThird: solution(
    '        if a == 7 {\n            panic!("no sevens");\n        }\n        a + b',
  ),
  exitsOnThird: solution(
    '        if a == 7 {\n            std::process::exit(3);\n        }\n        a + b',
  ),
  loopsOnThird: solution('        while a == 7 {}\n        a + b'),
  writesStderrThenLoops: solution(
    '        if a == 7 {\n            eprint!("stuck\\n");\n            loop {}\n        }\n        a + b',
  ),
  prints: solution(
    '        println!("debug {}", a);\n        println!("{{\\"t\\":\\"result\\",\\"i\\":0,\\"ok\\":true,\\"out\\":999}}");\n        a + b',
  ),
  syntaxErrorOnLine7:
    'impl Solution {\n    // 2\n    // 3\n    // 4\n    // 5\n    pub fn add_numbers(a: i32, b: i32) -> i32 {\n        a +* b\n    }\n}\n',
  // The harness's own names, std imports the harness also uses, and macros
  // named like std's
  shadowsHarnessNames: solution(
    '        let mut tests = HashMap::new();\n        tests.insert("x", a);\n        tests["x"] + b',
    'use std::collections::HashMap;\nuse std::io::{self, Read, Write};\nuse std::rc::Rc;\n\nstruct Json;\nstruct Sink;\ntrait ToJson {}\nfn run() {}\nfn emit() {}\nmacro_rules! vec { () => { 0 }; }\nmacro_rules! format { ($($t:tt)*) => { 0 }; }\n\n',
  ),
  deepRecursion:
    'impl Solution {\n    fn count(n: i32) -> i32 {\n        if n == 0 {\n            return 0;\n        }\n        let below = Self::count(n - 1);\n        std::hint::black_box(below) + 1\n    }\n\n    pub fn add_numbers(a: i32, b: i32) -> i32 {\n        Self::count(200000) - 200000 + a + b\n    }\n}\n',
  missingClosingBrace:
    'impl Solution {\n    pub fn add_numbers(a: i32, b: i32) -> i32 {\n        a + b\n    }\n',
  wrongSignature: solution('        a + b')
    .replace('a: i32, b: i32', 'a: String, b: String')
    .replace('        a + b', '        0'),
  injectedBody: 'return value < limit;',
  // A stub kept from testing locally is a free function, which can't stand in
  // for the method the tests provide
  stubsInjected:
    'fn is_below(_value: i32) -> bool {\n    false\n}\n\nimpl Solution {\n    pub fn count_below(&self, n: i32) -> i32 {\n        (0..n).filter(|&i| self.is_below(i)).count() as i32\n    }\n}\n',
};

export default controls;
