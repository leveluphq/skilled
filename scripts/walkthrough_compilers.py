"""Local compiler adapters for the published lesson walkthrough checker."""
import json
import os
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
NAMES = {'target-two-sum': 'getTargetIndexes', 'valid-brackets': 'hasValidBrackets', 'product-array': 'buildProductArray'}


def tool(name):
    result = shutil.which(name)
    if not result:
        raise RuntimeError(f'Required compiler is not installed: {name}')
    return result


def test_lines(lesson, entries):
    lines = []
    for entry in entries:
        if lesson == 'target-two-sum':
            expected = ','.join(sorted(f'{i}:{j}' for i, j in entry[2]))
            lines.append(','.join(map(str, entry[0])) + '\t' + str(entry[1]) + '\t' + expected)
        elif lesson == 'valid-brackets':
            lines.append(entry[0] + '\t' + str(entry[1]).lower())
        else:
            lines.append(','.join(map(str, entry[0])) + '\t' + ','.join(map(str, entry[1])))
    return '\n'.join(lines) + '\n'


CPP = r'''
#include <algorithm>
#include <fstream>
#include <string>
#include <vector>
std::vector<std::string> split(const std::string& text, char delimiter) {
    std::vector<std::string> out;
    std::size_t start = 0;
    while (true) {
        const auto end = text.find(delimiter, start);
        out.push_back(text.substr(start, end == std::string::npos ? end : end - start));
        if (end == std::string::npos) return out;
        start = end + 1;
    }
}
std::vector<long long> numbers(const std::string& text) {
    std::vector<long long> result;
    if (!text.empty()) for (const auto& item : split(text, ',')) result.push_back(std::stoll(item));
    return result;
}
int main() {
    checkExamples();
    Solution solution;
    std::ifstream file("cases.tsv");
    std::string line;
    while (std::getline(file, line)) {
        const auto fields = split(line, '\t');
        BODY
    }
}
'''
CPP_BODIES = {
    'target-two-sum': r'''
        const auto raw = numbers(fields.at(0));
        std::vector<int> input(raw.begin(), raw.end());
        const auto before = input;
        const auto actual = solution.getTargetIndexes(input, std::stoi(fields.at(1)));
        std::vector<std::string> keys;
        for (const auto& pair : actual) {
            if (pair.size() != 2) throw std::runtime_error("Pair shape");
            keys.push_back(std::to_string(std::min(pair[0], pair[1])) + ":" + std::to_string(std::max(pair[0], pair[1])));
        }
        std::sort(keys.begin(), keys.end());
        std::string encoded;
        for (const auto& key : keys) { if (!encoded.empty()) encoded += ","; encoded += key; }
        if (encoded != fields.at(2) || input != before) throw std::runtime_error(line);
    ''',
    'valid-brackets': r'''
        if (solution.hasValidBrackets(fields.at(0)) != (fields.at(1) == "true")) throw std::runtime_error(line);
    ''',
    'product-array': r'''
        auto input = numbers(fields.at(0));
        const auto before = input;
        if (solution.buildProductArray(input) != numbers(fields.at(1)) || input != before) throw std::runtime_error(line);
    ''',
}

GO_BODIES = {
    'target-two-sum': r'''
        input := []int{}
        if fields[0] != "" { for _, part := range strings.Split(fields[0], ",") { value, e := strconv.Atoi(part); if e != nil { panic(e) }; input = append(input, value) } }
        before := append([]int(nil), input...)
        target, e := strconv.Atoi(fields[1]); if e != nil { panic(e) }
        keys := []string{}
        for _, pair := range getTargetIndexes(input, target) {
            if len(pair) != 2 { panic("pair shape") }; i,j := pair[0],pair[1]; if i > j { i,j = j,i }
            keys = append(keys, strconv.Itoa(i) + ":" + strconv.Itoa(j))
        }
        sort.Strings(keys)
        if strings.Join(keys, ",") != fields[2] { panic(line) }
        for i := range input { if input[i] != before[i] { panic("input changed") } }
    ''',
    'valid-brackets': r'''
        if hasValidBrackets(fields[0]) != (fields[1] == "true") { panic(line) }
    ''',
    'product-array': r'''
        parse := func(text string) []int64 { out:=[]int64{}; if text != "" { for _,part := range strings.Split(text,",") { n,e:=strconv.ParseInt(part,10,64); if e!=nil {panic(e)};out=append(out,n) } }; return out }
        input, expected := parse(fields[0]), parse(fields[1]); before := append([]int64(nil), input...)
        actual := buildProductArray(input); if len(actual) != len(expected) { panic("length") }
        for i := range actual { if actual[i] != expected[i] || input[i] != before[i] { panic(line) } }
    ''',
}
GO = r'''
func main() {
    checkExamples()
    file, err := os.Open("cases.tsv"); if err != nil { panic(err) }; defer file.Close()
    scanner := bufio.NewScanner(file)
    for scanner.Scan() { line := scanner.Text(); fields := strings.Split(line,"\t"); BODY }
    if err := scanner.Err(); err != nil { panic(err) }
}
'''

KOTLIN_BODIES = {
    'target-two-sum': '''
        val input = if (fields[0].isEmpty()) intArrayOf() else fields[0].split(",").map { it.toInt() }.toIntArray()
        val before = input.copyOf()
        val actual = solution.getTargetIndexes(input, fields[1].toInt())
        check(actual.all { it.size == 2 })
        val keys = actual.map { it.sorted().joinToString(":") }.sorted().joinToString(",")
        check(keys == fields[2] && input.contentEquals(before)) { line }
    ''',
    'valid-brackets': '''check(solution.hasValidBrackets(fields[0]) == fields[1].toBooleanStrict()) { line }''',
    'product-array': '''
        fun parse(text: String): LongArray = if (text.isEmpty()) longArrayOf() else text.split(",").map { it.toLong() }.toLongArray()
        val input = parse(fields[0]); val before = input.copyOf()
        check(solution.buildProductArray(input).contentEquals(parse(fields[1])) && input.contentEquals(before)) { line }
    ''',
}
KOTLIN = '''
fun main() {
    checkExamples()
    val solution = Solution()
    java.io.File("cases.tsv").forEachLine { line ->
        val fields = line.split('\\t')
        BODY
    }
}
'''

SWIFT_BODIES = {
    'target-two-sum': '''
        let input = fields[0].isEmpty ? [] : fields[0].split(separator: ",").map { Int($0)! }
        let actual = solution.getTargetIndexes(input, Int(fields[1])!)
        precondition(actual.allSatisfy { $0.count == 2 })
        let keys = actual.map { $0.sorted().map(String.init).joined(separator: ":") }.sorted().joined(separator: ",")
        precondition(keys == fields[2])
    ''',
    'valid-brackets': '''precondition(solution.hasValidBrackets(fields[0]) == (fields[1] == "true"))''',
    'product-array': '''
        let parse: (String) -> [Int] = { text in text.isEmpty ? [] : text.split(separator: ",").map { Int($0)! } }
        precondition(solution.buildProductArray(parse(fields[0])) == parse(fields[1]))
    ''',
}
SWIFT = '''
checkExamples()
let solution = Solution()
let contents = try String(contentsOfFile: "cases.tsv", encoding: .utf8)
for line in contents.split(separator: "\\n") {
    let fields = String(line).components(separatedBy: "\\t")
    BODY
}
'''

RUST_BODIES = {
    'target-two-sum': '''
        let input: Vec<i32> = if fields[0].is_empty() { vec![] } else { fields[0].split(',').map(|v| v.parse().unwrap()).collect() };
        let actual = Solution::get_target_indexes(input, fields[1].parse().unwrap());
        assert!(actual.iter().all(|pair| pair.len() == 2));
        let mut keys: Vec<String> = actual.iter().map(|pair| format!("{}:{}", pair[0].min(pair[1]), pair[0].max(pair[1]))).collect();
        keys.sort(); assert_eq!(keys.join(","), fields[2]);
    ''',
    'valid-brackets': '''assert_eq!(Solution::has_valid_brackets(fields[0].to_owned()), fields[1] == "true");''',
    'product-array': '''
        let parse = |text: &str| -> Vec<i64> { if text.is_empty() { vec![] } else { text.split(',').map(|v| v.parse().unwrap()).collect() } };
        assert_eq!(Solution::build_product_array(parse(fields[0])), parse(fields[1]));
    ''',
}
RUST = '''
fn main() {
    check_examples();
    let contents = std::fs::read_to_string("cases.tsv").unwrap();
    for line in contents.lines() {
        let fields: Vec<&str> = line.split('\\t').collect();
        BODY
    }
}
'''

CSHARP_BODIES = {
    'target-two-sum': '''
        int[] input = fields[0].Length == 0 ? System.Array.Empty<int>() : System.Array.ConvertAll(fields[0].Split(','), int.Parse);
        int[] before = (int[])input.Clone();
        var keys = new System.Collections.Generic.List<string>();
        foreach (var pair in solution.GetTargetIndexes(input, int.Parse(fields[1]))) {
            if (pair.Length != 2) throw new System.Exception("Pair shape");
            keys.Add(System.Math.Min(pair[0], pair[1]) + ":" + System.Math.Max(pair[0], pair[1]));
        }
        keys.Sort(System.StringComparer.Ordinal);
        if (string.Join(",",keys) != fields[2] || !System.Linq.Enumerable.SequenceEqual(input,before)) throw new System.Exception(line);
    ''',
    'valid-brackets': '''if (solution.HasValidBrackets(fields[0]) != bool.Parse(fields[1])) throw new System.Exception(line);''',
    'product-array': '''
        long[] input = fields[0].Length == 0 ? System.Array.Empty<long>() : System.Array.ConvertAll(fields[0].Split(','),long.Parse);
        long[] expected = fields[1].Length == 0 ? System.Array.Empty<long>() : System.Array.ConvertAll(fields[1].Split(','),long.Parse);
        long[] before = (long[])input.Clone();
        if (!System.Linq.Enumerable.SequenceEqual(solution.BuildProductArray(input),expected) || !System.Linq.Enumerable.SequenceEqual(input,before)) throw new System.Exception(line);
    ''',
}
CSHARP = '''
public static class Program {
    public static void Main() {
        WalkthroughExamples.Check();
        var solution = new Solution();
        foreach (string line in System.IO.File.ReadLines("cases.tsv")) {
            var fields = line.Split('\\t');
            BODY
        }
    }
}
'''


def check_typescript(data, directory, source, execute):
    (directory / 'empty-types').mkdir()
    for lesson, entries in data.items():
        work = directory / lesson
        work.mkdir()
        (work / 'example.ts').write_text('export {};\n' + source(lesson, 'typescript'))
        execute([tool('node'), ROOT / 'node_modules/typescript/bin/tsc', 'example.ts', '--strict', '--noUncheckedIndexedAccess',
                 '--target', 'ES2020', '--module', 'commonjs', '--lib', 'ES2020', '--skipLibCheck', '--typeRoots', directory / 'empty-types'], work)
        harness = '''
const checks = JSON.parse(require('node:fs').readFileSync('cases.json','utf8'));
for (const entry of checks) {
  const before = JSON.stringify(entry[0]);
  let actual = FUNCTION(...entry.slice(0,-1));
  if (PAIRS) actual = actual.map(pair => pair.slice().sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0] || a[1]-b[1]);
  require('node:assert/strict').equal(JSON.stringify(actual),JSON.stringify(entry[entry.length-1]));
  require('node:assert/strict').equal(JSON.stringify(entry[0]),before);
}
'''.replace('FUNCTION', NAMES[lesson]).replace('PAIRS', str(lesson == 'target-two-sum').lower())
        output = work / 'example.js'
        output.write_text(output.read_text() + '\n' + harness)
        (work / 'cases.json').write_text(json.dumps(entries))
        execute([tool('node'), 'example.js'], work)


def check_compiled(language, data, directory, options, source, execute):
    if language == 'typescript':
        check_typescript(data, directory, source, execute)
        return
    for lesson, entries in data.items():
        work = directory / lesson
        work.mkdir()
        (work / 'cases.tsv').write_text(test_lines(lesson, entries))
        published = source(lesson, language)
        if language == 'cpp':
            (work / 'example.cpp').write_text(published + '\n' + CPP.replace('BODY', CPP_BODIES[lesson]))
            execute([tool('clang++'), '-std=c++17', '-Wall', '-Wextra', '-Werror', '-pedantic', '-fsanitize=undefined',
                     '-fno-sanitize-recover=all', 'example.cpp', '-o', 'example'], work)
            execute([work / 'example'], work)
        elif language == 'go':
            imports = ['bufio', 'os', 'strings'] + (['sort', 'strconv'] if lesson == 'target-two-sum' else ['strconv'] if lesson == 'product-array' else [])
            header = 'package main\nimport (' + ';'.join(json.dumps(name) for name in imports) + ')\n'
            (work / 'example.go').write_text(header + published + '\n' + GO.replace('BODY', GO_BODIES[lesson]))
            execute([tool('go'), 'run', 'example.go'], work)
        elif language == 'kotlin':
            (work / 'Example.kt').write_text(published + '\n' + KOTLIN.replace('BODY', KOTLIN_BODIES[lesson]))
            env = {'JAVA_HOME': str(options.java_home)} if options.java_home else {}
            execute([options.kotlinc or tool('kotlinc'), 'Example.kt', '-jvm-target', '17', '-Werror', '-include-runtime', '-d', 'example.jar'], work, env)
            java = options.java_home / 'bin/java' if options.java_home else tool('java')
            execute([java, '-jar', 'example.jar'], work)
        elif language == 'swift':
            (work / 'example.swift').write_text('import Foundation\n' + published + '\n' + SWIFT.replace('BODY', SWIFT_BODIES[lesson]))
            execute([tool('swiftc'), '-swift-version', '6', '-warnings-as-errors', 'example.swift', '-o', 'example'], work)
            execute([work / 'example'], work)
        elif language == 'rust':
            (work / 'example.rs').write_text('struct Solution;\n' + published + '\n' + RUST.replace('BODY', RUST_BODIES[lesson]))
            execute([tool('rustc'), '--edition=2021', '-D', 'warnings', '-C', 'overflow-checks=yes', 'example.rs', '-o', 'example'], work)
            execute([work / 'example'], work)
        elif language == 'csharp':
            (work / 'Program.cs').write_text(published + '\n' + CSHARP.replace('BODY', CSHARP_BODIES[lesson]))
            (work / 'Examples.csproj').write_text('<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><ImplicitUsings>disable</ImplicitUsings><Nullable>enable</Nullable><TreatWarningsAsErrors>true</TreatWarningsAsErrors><NuGetAudit>false</NuGetAudit></PropertyGroup></Project>')
            (work / 'NuGet.Config').write_text('<configuration><packageSources><clear /></packageSources></configuration>')
            env = {'DOTNET_CLI_HOME': str(work / 'dotnet-home'), 'DOTNET_CLI_TELEMETRY_OPTOUT': '1',
                   'DOTNET_SKIP_FIRST_TIME_EXPERIENCE': '1', 'DOTNET_GENERATE_ASPNET_CERTIFICATE': 'false',
                   'DOTNET_NOLOGO': 'true', 'DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE': 'true', 'NUGET_PACKAGES': str(work / 'packages')}
            dotnet = options.dotnet or tool('dotnet')
            execute([dotnet, 'restore', 'Examples.csproj', '--configfile', 'NuGet.Config', '--nologo'], work, env)
            execute([dotnet, 'build', '--no-restore', '-o', 'out', '--nologo', '-v', 'quiet'], work, env)
            execute([dotnet, work / 'out/Examples.dll'], work, env)
        else:
            raise ValueError(f'Unknown compiler: {language}')
