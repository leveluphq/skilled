#!/usr/bin/env python3
"""Execute the actual published walkthrough snippets against independent oracles.

Uses existing local compilers; installs nothing. --languages selects explicit
subsets. Supply --java-home, --kotlinc, or --dotnet for tools outside PATH.
Source and test data live in a temporary folder.
"""
import argparse
import itertools
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from walkthrough_compilers import check_compiled

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'src/content/lesson-walkthroughs'


def source(lesson, language):
    text = (CONTENT / lesson / (language + '.mdx')).read_text()
    blocks = re.findall(r'^```' + language + r'\n(.*?)^```', text, re.M | re.S)
    if not blocks:
        raise AssertionError(f'No {language} code in {lesson}')
    return '\n'.join(blocks)


def cases():
    sums = []
    for size in range(6):
        for values in itertools.permutations(range(-2, 3), size):
            for target in range(-4, 5):
                pairs = [[i, j] for i in range(size) for j in range(i + 1, size)
                         if values[i] + values[j] == target]
                sums.append([list(values), target, pairs])
    for values, target in [([2147483647, 1], -2147483648),
                           ([-2147483648, 2147483647], -1)]:
        pairs = [[i, j] for i in range(len(values)) for j in range(i + 1, len(values))
                 if values[i] + values[j] == target]
        sums.append([values, target, pairs])
    products = []
    for size in range(6):
        for values in itertools.product((-2, -1, 0, 1, 2), repeat=size):
            expected = []
            for excluded in range(size):
                product = 1
                for i, value in enumerate(values):
                    if i != excluded:
                        product *= value
                expected.append(product)
            products.append([list(values), expected])
    products.append([[3000000000, 2, 3], [6, 9000000000, 6000000000]])
    brackets = []
    for size in range(6):
        for chars in itertools.product('()[]{}x', repeat=size):
            text = ''.join(chars)
            remaining = text.replace('x', '')
            while True:
                reduced = remaining.replace('()', '').replace('[]', '').replace('{}', '')
                if reduced == remaining:
                    break
                remaining = reduced
            brackets.append([text, not remaining])
    brackets += [['🙂{x[y](z)}', True], ['(\u0301)', True], ['(\u0301', False], ['(' * 20000 + ')' * 20000, True]]
    return {'target-two-sum': sums, 'valid-brackets': brackets, 'product-array': products}


def execute(command, directory, extra_env=None):
    result = subprocess.run([str(part) for part in command], cwd=directory, text=True, capture_output=True, timeout=120,
                            env={**os.environ, **(extra_env or {})})
    if result.returncode:
        raise RuntimeError('Command failed: ' + str(command[0]) + '\n' + result.stdout + result.stderr)


def check_python(data):
    names = {'target-two-sum': 'get_target_indexes', 'valid-brackets': 'has_valid_brackets',
             'product-array': 'build_product_array'}
    for lesson, entries in data.items():
        namespace = {}
        exec(compile(source(lesson, 'python'), lesson, 'exec'), namespace)
        function = namespace[names[lesson]]
        for entry in entries:
            before = json.loads(json.dumps(entry[0]))
            actual = function(*entry[:-1])
            if lesson == 'target-two-sum':
                actual = sorted(sorted(pair) for pair in actual)
            assert actual == entry[-1], (lesson, entry, actual)
            assert entry[0] == before, (lesson, 'input changed')


def check_javascript(data, directory, node):
    names = {'target-two-sum': 'getTargetIndexes', 'valid-brackets': 'hasValidBrackets',
             'product-array': 'buildProductArray'}
    for lesson, entries in data.items():
        (directory / 'cases.json').write_text(json.dumps(entries))
        check = '''
const exhaustiveCases = JSON.parse(require('node:fs').readFileSync('cases.json', 'utf8'));
for (const entry of exhaustiveCases) {
  const before = JSON.stringify(entry[0]);
  let actual = FUNCTION(...entry.slice(0, -1));
  if (IS_PAIRS) actual = actual.map(pair => pair.slice().sort((a,b) => a-b))
    .sort((a,b) => a[0]-b[0] || a[1]-b[1]);
  require('node:assert/strict').equal(JSON.stringify(actual), JSON.stringify(entry[entry.length - 1]));
  require('node:assert/strict').equal(JSON.stringify(entry[0]), before);
}
'''.replace('FUNCTION', names[lesson]).replace('IS_PAIRS', str(lesson == 'target-two-sum').lower())
        (directory / 'check.cjs').write_text(source(lesson, 'javascript') + '\n' + check)
        execute([node, 'check.cjs'], directory)


JAVA_CHECK = r'''
class WalkthroughCheck {
    static int[] ints(String text) {
        if (text.isEmpty()) return new int[0];
        return java.util.Arrays.stream(text.split(",")).mapToInt(Integer::parseInt).toArray();
    }
    static long[] longs(String text) {
        if (text.isEmpty()) return new long[0];
        return java.util.Arrays.stream(text.split(",")).mapToLong(Long::parseLong).toArray();
    }
    public static void main(String[] args) throws Exception {
        Solution solution = new Solution();
        for (String line : java.nio.file.Files.readAllLines(java.nio.file.Path.of("cases.tsv"))) {
            String[] fields = line.split("\t", -1);
            CHECK
        }
    }
}
'''
JAVA_BODIES = {
    'target-two-sum': '''
        int[] input = ints(fields[0]), before = input.clone();
        java.util.List<String> keys = new java.util.ArrayList<>();
        for (int[] pair : solution.getTargetIndexes(input, Integer.parseInt(fields[1]))) {
            if (pair.length != 2) throw new AssertionError("Pair shape");
            keys.add(Math.min(pair[0], pair[1]) + ":" + Math.max(pair[0], pair[1]));
        }
        java.util.Collections.sort(keys);
        if (!String.join(",", keys).equals(fields[2]) || !java.util.Arrays.equals(input, before))
            throw new AssertionError(line);
    ''',
    'valid-brackets': '''
        if (solution.hasValidBrackets(fields[0]) != Boolean.parseBoolean(fields[1]))
            throw new AssertionError(line);
    ''',
    'product-array': '''
        long[] input = longs(fields[0]), before = input.clone();
        if (!java.util.Arrays.equals(solution.buildProductArray(input), longs(fields[1]))
                || !java.util.Arrays.equals(input, before)) throw new AssertionError(line);
    ''',
}


def check_java(data, directory, java, javac):
    examples = {'target-two-sum': 'TwoSumExamples', 'valid-brackets': 'BracketExamples',
                'product-array': 'ProductExamples'}
    for lesson, entries in data.items():
        lines = []
        for entry in entries:
            if lesson == 'target-two-sum':
                expected = ','.join(sorted(f'{i}:{j}' for i, j in entry[2]))
                lines.append(','.join(map(str, entry[0])) + '\t' + str(entry[1]) + '\t' + expected)
            elif lesson == 'valid-brackets':
                lines.append(entry[0] + '\t' + str(entry[1]).lower())
            else:
                lines.append(','.join(map(str, entry[0])) + '\t' + ','.join(map(str, entry[1])))
        (directory / 'cases.tsv').write_text('\n'.join(lines) + '\n')
        (directory / 'Solution.java').write_text(source(lesson, 'java') + '\n' + JAVA_CHECK.replace('CHECK', JAVA_BODIES[lesson]))
        execute([javac, '-encoding', 'UTF-8', 'Solution.java'], directory)
        execute([java, examples[lesson]], directory)
        execute([java, 'WalkthroughCheck'], directory)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--java-home', type=Path)
    parser.add_argument('--kotlinc', help='Path to an existing Kotlin compiler')
    parser.add_argument('--dotnet', help='Path to an existing .NET 10 SDK')
    parser.add_argument('--languages', nargs='+', choices=['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'go', 'kotlin', 'swift', 'rust'],
                        default=['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'go', 'kotlin', 'swift', 'rust'])
    args = parser.parse_args()
    node = shutil.which('node')
    java = str(args.java_home / 'bin/java') if args.java_home else shutil.which('java')
    javac = str(args.java_home / 'bin/javac') if args.java_home else shutil.which('javac')
    if ('javascript' in args.languages and not node) or ('java' in args.languages and not all((java, javac))):
        parser.error('Python, Node, and a local JDK are required; use --java-home for an existing JDK.')
    data = cases()
    with tempfile.TemporaryDirectory(prefix='skilled-walkthrough-examples-') as temporary:
        directory = Path(temporary)
        for language in dict.fromkeys(args.languages):
            work = directory / language
            work.mkdir()
            if language == 'python': check_python(data)
            elif language == 'javascript': check_javascript(data, work, node)
            elif language == 'java': check_java(data, work, java, javac)
            else: check_compiled(language, data, work, args, source, execute)
            print(language + ': all three published walkthroughs and independent cases passed.', flush=True)
    print('All requested published walkthroughs passed their examples and independent checks: '
          + ', '.join(f'{len(entries):,} {lesson} cases per language' for lesson, entries in data.items())
          + '. Input preservation, all-pairs output, numeric boundaries, text, and deep nesting passed.')


if __name__ == '__main__':
    main()
