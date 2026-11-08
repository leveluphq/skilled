#!/usr/bin/env python3
"""Compile and exercise the code actually published in language resource MDX.

Defaults to Python and TypeScript. Other compilers are opt-in; missing requested
compilers fail the check. No packages are installed and no course services run.
"""
import argparse
import itertools
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def published(resource, language):
    source = (ROOT / 'src/content/resources' / (resource + '.mdx')).read_text()
    blocks = re.findall(r'^```' + re.escape(language) + r'\n(.*?)^```', source, re.M | re.S)
    if not blocks:
        raise AssertionError('No published ' + language + ' examples in ' + resource)
    return '\n'.join(blocks)


def execute(command, directory, extra_env=None):
    result = subprocess.run([str(part) for part in command], cwd=directory,
                            capture_output=True, text=True, timeout=120,
                            env={**os.environ, **(extra_env or {})})
    if result.returncode:
        raise RuntimeError('Command failed: ' + str(command[0]) + '\n' + result.stdout + result.stderr)


def signed_arrays():
    return [list(values) for n in range(5) for values in itertools.product((-1, 0, 1), repeat=n)]


def check_python():
    prep, collections, islands = {}, {}, {}
    for resource, namespace in [('interview-prep/python', prep),
                                ('reference/python-collections', collections),
                                ('guides/count-islands-python', islands)]:
        exec(compile(published(resource, 'python'), resource, 'exec'), namespace)
    for values in signed_arrays():
        for target in (-2, -1, 0, 1, 2):
            pairs = [(i, j) for i in range(len(values)) for j in range(i + 1, len(values))
                     if values[i] + values[j] == target]
            actual = prep['two_sum'](values, target)
            if not pairs:
                assert actual is None
            else:
                i, j = actual
                assert 0 <= i < j < len(values) and values[i] + values[j] == target
        expected = next((i for i, value in enumerate(values) if values.count(value) == 1), None)
        assert collections['first_unique_index'](values) == expected
    graph = {'A': ['B', 'C'], 'B': ['D', 'A'], 'C': ['D'], 'X': []}
    assert prep['bfs_order'](graph, 'A') == ['A', 'B', 'C', 'D']
    assert collections['shortest_hops'](graph, 'A') == {'A': 0, 'B': 1, 'C': 1, 'D': 2}
    assert collections['shortest_hops']({}, 'missing') == {'missing': 0}
    adjacency = collections['adjacency_list']([('A', 'B'), ('C', 'D'), ('A', 'E')])
    adjacency['A'].append('Z')
    assert adjacency['C'] == ['D']
    first, second, urgent = {'id': 1}, {'id': 2}, {'id': 3}
    output = collections['stable_priority_order']([(4, first), (4, second), (1, urgent)])
    assert all(a is b for a, b in zip(output, (urgent, first, second)))

    # Union-find is independent of either published flood-fill implementation.
    def components(grid):
        rows, columns = len(grid), len(grid[0]) if grid else 0
        parent = {(r, c): (r, c) for r in range(rows) for c in range(columns) if grid[r][c] == '#'}
        def root(cell):
            while parent[cell] != cell:
                cell = parent[cell]
            return cell
        for r, c in parent:
            for neighbor in ((r + 1, c), (r, c + 1)):
                if neighbor in parent:
                    parent[root(neighbor)] = root((r, c))
        return len({root(cell) for cell in parent})

    grids = [[]] + [[[] for _ in range(rows)] for rows in (1, 2)]
    for rows, columns in ((1, 1), (1, 4), (2, 2), (2, 3), (3, 3)):
        for mask in range(1 << (rows * columns)):
            grids.append([['#' if mask & (1 << (r * columns + c)) else '~'
                           for c in range(columns)] for r in range(rows)])
    for grid in grids:
        original = [row[:] for row in grid]
        expected = components(grid)
        assert islands['countIslands'](grid) == expected
        assert grid == original
        mutable = [row[:] for row in grid]
        assert islands['countIslandsInPlace'](mutable) == expected
        assert all(cell == '~' for row in mutable for cell in row)
    for invalid in ([['#'], []], [['1']], ['#'], None):
        for name in ('countIslands', 'countIslandsInPlace'):
            try:
                islands[name](invalid)
                raise AssertionError('Accepted invalid grid')
            except ValueError:
                pass
    shared = ['#']
    alias_grid = [shared, ['~'], shared]
    assert islands['countIslands'](alias_grid) == 2
    try:
        islands['countIslandsInPlace'](alias_grid)
        raise AssertionError('Accepted aliased mutable rows')
    except ValueError:
        pass
    assert islands['countIslands']([['#'] * 20000]) == 1
    print('Python: preparation, collections, heap ties, 613 exhaustive/empty grids, mutation, aliasing, invalid grids, and a 20,000-cell island passed.')


JAVA_TEST = r'''
class JavaExamplesTest {
    static void check(boolean condition) { if (!condition) throw new AssertionError(); }
    public static void main(String[] args) {
        int[][] inputs = { {}, {3}, {3,3}, {0,2}, {-2,1,4},
            {Integer.MIN_VALUE, Integer.MAX_VALUE, 1, 0}, {Integer.MAX_VALUE, Integer.MAX_VALUE} };
        int[] targets = {0,2,6,9,Integer.MIN_VALUE,Integer.MAX_VALUE,-1,-2};
        for (int[] values : inputs) for (int target : targets) {
            boolean possible = false;
            for (int i = 0; i < values.length; i++) for (int j = i+1; j < values.length; j++)
                if ((long) values[i] + values[j] == target) possible = true;
            var result = JavaInterview.twoSum(values, target);
            check(result.isPresent() == possible);
            if (result.isPresent()) {
                int[] pair = result.get();
                check(pair[0] >= 0 && pair[0] < pair[1] && pair[1] < values.length);
                check((long) values[pair[0]] + values[pair[1]] == target);
            }
        }
        Map<Integer,List<Integer>> graph = Map.of(1,List.of(2,3),2,List.of(4,1),3,List.of(4));
        check(JavaInterview.bfsOrder(graph,1).equals(List.of(1,2,3,4)));
        check(JavaInterview.bfsOrder(Map.of(),9).equals(List.of(9)));
    }
}
'''

CPP_TEST = r'''
#include <algorithm>
#include <cassert>
#include <climits>
int main() {
    const std::vector<std::vector<int>> inputs = {{},{3},{3,3},{0,2},{-2,1,4},
        {INT_MIN,INT_MAX,1,0},{INT_MAX,INT_MAX}};
    const std::vector<int> targets = {0,2,6,9,INT_MIN,INT_MAX,-1,-2};
    for (auto values : inputs) {
        for (const int target : targets) {
            bool possible = false;
            for (std::size_t i=0;i<values.size();++i) for (std::size_t j=i+1;j<values.size();++j)
                if (static_cast<long long>(values[i])+values[j]==target) possible=true;
            const auto result = twoSum(values,target);
            assert(result.has_value()==possible);
            if (result) {
                const auto [i,j]=*result;
                assert(i<j && j<values.size());
                assert(static_cast<long long>(values[i])+values[j]==target);
            }
        }
        std::sort(values.begin(),values.end());
        for (const int target : targets)
            assert(lowerBound(values,target)==static_cast<std::size_t>(
                std::lower_bound(values.begin(),values.end(),target)-values.begin()));
    }
}
'''

GO_TEST = r'''
func require(ok bool) { if !ok { panic("Published Go example failed") } }
func main() {
    inputs := [][]int64{nil,{}, {3}, {3,3}, {0,2}, {-2,1,4}, {-1000000000,1000000000,0}}
    for _, values := range inputs {
        for _, target := range []int64{-1000000000,-2,0,2,6,9,1000000000} {
            possible := false
            for i:=0;i<len(values);i++ { for j:=i+1;j<len(values);j++ {
                if values[i]+values[j]==target { possible=true }
            }}
            pair,found := twoSum(values,target)
            require(found==possible)
            if found { require(pair[0]>=0 && pair[0]<pair[1] && pair[1]<len(values))
                require(values[pair[0]]+values[pair[1]]==target) }
        }
    }
    graph:=map[string][]string{"A":{"B","C"},"B":{"D","A"},"C":{"D"}}
    order:=bfsOrder(graph,"A")
    require(len(order)==4 && order[0]=="A" && order[1]=="B" && order[2]=="C" && order[3]=="D")
    missing:=bfsOrder(nil,"missing");require(len(missing)==1 && missing[0]=="missing")
    original:=make([]int,1,5);original[0]=4
    snapshot:=make([]int,len(original));copy(snapshot,original);original[0]=9
    require(snapshot[0]==4)
    offsets:=[]int{};for index:=range "a🙂b" { offsets=append(offsets,index) }
    require(len(offsets)==3 && offsets[0]==0 && offsets[1]==1 && offsets[2]==5)
}
'''

RUST_TEST = r'''
fn main() {
    let inputs = vec![vec![],vec![3],vec![3,3],vec![0,2],vec![-2,1,4],
        vec![i64::MIN,i64::MAX,1,0],vec![i64::MAX,i64::MAX],vec![i64::MIN,2,4]];
    let targets = [0,2,6,9,i64::MIN,i64::MAX,-1,-2];
    for values in &inputs {
        for &target in &targets {
            let mut possible=false;
            for i in 0..values.len() { for j in i+1..values.len() {
                if i128::from(values[i])+i128::from(values[j])==i128::from(target) { possible=true; }
            }}
            let result=two_sum(values,target);
            assert_eq!(result.is_some(),possible);
            if let Some((i,j))=result {
                assert!(i<j && j<values.len());
                assert_eq!(i128::from(values[i])+i128::from(values[j]),i128::from(target));
            }
        }
        for k in [0,1,2,4,20] {
            let mut actual=largest_k(values,k);actual.sort_unstable_by(|a,b| b.cmp(a));
            let mut expected=values.clone();expected.sort_unstable_by(|a,b| b.cmp(a));expected.truncate(k);
            assert_eq!(actual,expected);
        }
    }
}
'''

TS_PREP_TEST = r'''
function ensure(value: unknown): asserts value { if (!value) throw new Error('Published TypeScript preparation example failed'); }
const pair = twoSum([3,3],6);ensure(pair !== null && pair[0] === 0 && pair[1] === 1);
ensure(twoSum([3],6) === null);
ensure(maxDepth(null) === 0);
ensure(maxDepth({value:1,left:{value:2,left:null,right:null},right:null}) === 2);
ensure(describeResult({found:false}) === 'No match');
ensure(describeResult({found:true,value:'a',index:0}) === 'a at index 0');
'''
TS_COLLECTIONS_TEST = r'''
function ensure(value: unknown): asserts value { if (!value) throw new Error('Published TypeScript collections example failed'); }
const counts = frequencies([0,0,1]);ensure(counts.get(0) === 2 && counts.get(1) === 1);
const entries = new Map<string, {readonly value: string | undefined}>([['present',{value:undefined}]]);
const present = readEntry(entries,'present');ensure(present.found && present.value === undefined);
ensure(!readEntry(entries,'missing').found);
const graph = new Map<string | undefined, readonly (string | undefined)[]>([[undefined,['B','C']],['B',[undefined,'D']],['C',['D']]]);
const order = bfsOrder(graph,undefined);ensure(order.length === 4 && order[0] === undefined && order[3] === 'D');
const first = {id:1}, second = {id:1};const objects = frequencies([first,first,second]);
ensure(objects.size === 2 && objects.get(first) === 2 && objects.get(second) === 1);
'''


def compiler(name):
    executable = shutil.which(name)
    if not executable:
        raise RuntimeError('Requested compiler is unavailable: ' + name)
    return executable


def check_compiled(language, directory, options):
    if language == 'typescript':
        empty_types = directory / 'empty-types'
        empty_types.mkdir()
        for resource, harness, unchecked in [('interview-prep/typescript', TS_PREP_TEST, False),
                                              ('guides/typescript-collections', TS_COLLECTIONS_TEST, True)]:
            filename = resource.split('/')[-1]
            source = directory / (filename + '.ts')
            source.write_text('export {};\n' + published(resource, 'typescript') + '\n' + harness)
            command = [compiler('node'), ROOT / 'node_modules/typescript/bin/tsc', source,
                       '--strict', '--target', 'ES2020', '--module', 'commonjs', '--lib', 'ES2020',
                       '--skipLibCheck', '--typeRoots', empty_types]
            if unchecked:
                command.append('--noUncheckedIndexedAccess')
            execute(command, directory)
            execute([compiler('node'), source.with_suffix('.js')], directory)
    else:
        cases = ROOT / 'test/resource-examples'
        def case(name):
            return (cases / name).read_text()
        jobs = {
            'java': [('interview-prep/java', JAVA_TEST, 'JavaExamplesTest'),
                     ('guides/java-priority-queue', case('java-priority-queue.java'), 'JavaPriorityQueueTests')],
            'cpp': [('interview-prep/cpp', CPP_TEST, ''),
                    ('guides/cpp-search-boundaries', case('cpp-search-boundaries.cpp'), '')],
            'go': [('interview-prep/go', GO_TEST, ''),
                   ('guides/go-unicode-sliding-window', case('go-unicode-sliding-window.go'), '')],
            'rust': [('interview-prep/rust', RUST_TEST, ''),
                     ('guides/rust-graph-traversal', case('rust-graph-traversal.rs'), '')],
            'csharp': [('interview-prep/csharp', case('csharp.cs'), '')],
            'kotlin': [('interview-prep/kotlin', case('kotlin.kt'), '')],
            'swift': [('interview-prep/swift', case('swift.swift'), '')],
        }
        for resource, harness, entry in jobs[language]:
            work = directory / language / resource.split('/')[-1]
            work.mkdir(parents=True)
            text = published(resource, language) + '\n' + harness
            binary = work / 'examples'
            if language == 'java':
                source = work / 'Examples.java'
                source.write_text(text)
                javac = Path(options.java_home) / 'bin/javac' if options.java_home else compiler('javac')
                java = Path(options.java_home) / 'bin/java' if options.java_home else compiler('java')
                execute([javac, '--release', '17', '-Xlint:all', '-Werror', source], work)
                execute([java, '-cp', work, entry], work)
            elif language == 'cpp':
                source = work / 'examples.cpp'
                source.write_text(text)
                execute([compiler('clang++') if shutil.which('clang++') else compiler('g++'), '-std=c++17',
                         '-Wall', '-Wextra', '-Werror', '-pedantic', source, '-o', binary], work)
                execute([binary], work)
            elif language == 'go':
                source = work / 'examples.go'
                source.write_text(text)
                execute([compiler('go'), 'run', source], work)
            elif language == 'rust':
                source = work / 'examples.rs'
                source.write_text(text)
                execute([compiler('rustc'), '--edition=2021', '-D', 'warnings', source, '-o', binary], work)
                execute([binary], work)
            elif language == 'kotlin':
                source = work / 'examples.kt'
                source.write_text(text)
                archive = work / 'examples.jar'
                environment = {'JAVA_HOME': options.java_home} if options.java_home else {}
                execute([options.kotlinc or compiler('kotlinc'), source, '-jvm-target', '17',
                         '-Werror', '-include-runtime', '-d', archive], work, environment)
                java = Path(options.java_home) / 'bin/java' if options.java_home else compiler('java')
                execute([java, '-jar', archive], work)
            elif language == 'swift':
                source = work / 'examples.swift'
                source.write_text(text)
                execute([compiler('swiftc'), '-swift-version', '6', '-warnings-as-errors', source, '-o', binary], work)
                execute([binary], work)
            elif language == 'csharp':
                (work / 'Program.cs').write_text(text)
                (work / 'Examples.csproj').write_text(
                    '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup>'
                    '<OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework>'
                    '<ImplicitUsings>disable</ImplicitUsings><Nullable>enable</Nullable>'
                    '<TreatWarningsAsErrors>true</TreatWarningsAsErrors><NuGetAudit>false</NuGetAudit>'
                    '</PropertyGroup></Project>')
                (work / 'NuGet.Config').write_text('<configuration><packageSources><clear /></packageSources></configuration>')
                environment = {
                    'DOTNET_CLI_HOME': str(work / 'dotnet-home'),
                    'DOTNET_CLI_TELEMETRY_OPTOUT': '1', 'DOTNET_SKIP_FIRST_TIME_EXPERIENCE': '1',
                    'DOTNET_GENERATE_ASPNET_CERTIFICATE': 'false', 'DOTNET_NOLOGO': 'true',
                    'DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE': 'true',
                    'NUGET_PACKAGES': str(work / 'nuget-packages'),
                }
                dotnet = options.dotnet or compiler('dotnet')
                execute([dotnet, 'restore', 'Examples.csproj', '--configfile', 'NuGet.Config', '--nologo'], work, environment)
                execute([dotnet, 'build', '--no-restore', '-o', 'out', '--nologo', '-v', 'quiet'], work, environment)
                execute([dotnet, work / 'out/Examples.dll'], work, environment)
    print(language + ': published examples compiled and behavioral checks passed.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--languages', nargs='+', choices=['python', 'typescript', 'java', 'cpp', 'go', 'rust', 'csharp', 'kotlin', 'swift'],
                        default=['python', 'typescript'])
    parser.add_argument('--java-home', help='Optional JDK directory, without changing machine configuration')
    parser.add_argument('--kotlinc', help='Optional Kotlin/JVM compiler path')
    parser.add_argument('--dotnet', help='Optional .NET 10 SDK executable path')
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='skilled-resource-examples-') as name:
        directory = Path(name)
        for language in dict.fromkeys(args.languages):
            if language == 'python':
                check_python()
            else:
                check_compiled(language, directory, args)
    print('All requested resource languages passed; temporary build files removed.')


if __name__ == '__main__':
    main()
