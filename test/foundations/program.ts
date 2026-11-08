import fs from 'fs';
import path from 'path';
const preludes = path.join(process.cwd(), 'src/services/server/runner/preludes');
const camel = (name: string) => name[0].toUpperCase() + name.slice(1);
const snake = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

export function prepare(
  language: string,
  nonce: string,
  example: { body: string; imports: string },
  concepts: { function: string; arguments: string[] }[],
  cases: unknown[],
) {
  const { body, imports } = example;
  const base = (name: string) => fs.readFileSync(path.join(preludes, name), 'utf8');
  const names = concepts.map((entry) => entry.function);
  const plainInput = JSON.stringify(cases);
  const protocolInput = `${nonce}\n${JSON.stringify({ tests: cases })}`;
  if (['javascript', 'typescript'].includes(language)) {
    const script = `\n${
      language === 'typescript'
        ? 'declare function require(name: string): any; declare const console: { log(value: string): void };'
        : ''
    }\nconst __functions${
      language === 'typescript' ? ': Record<string, (...args: any[]) => unknown>' : ''
    } = { ${names.join(
      ', ',
    )} };\nconst __cases = JSON.parse(require('fs').readFileSync(0, 'utf8'));\nfor (const __case of __cases) { const before = JSON.stringify(__case.args); const answer = __functions[__case.function](...__case.args); if (JSON.stringify(__case.args) !== before) throw new Error('Input mutated: ' + __case.function); console.log(JSON.stringify(answer)); }\n`;
    return { source: body + script, stdin: plainInput, protocol: false };
  }
  if (language === 'python')
    return {
      source:
        body +
        `\nimport json, sys\n_functions = {${names
          .map((name) => `${JSON.stringify(name)}: ${snake(name)}`)
          .join(
            ',',
          )}}\nfor case in json.load(sys.stdin):\n    before = json.dumps(case['args'])\n    answer = _functions[case['function']](*case['args'])\n    assert json.dumps(case['args']) == before, 'Input mutated: ' + case['function']\n    print(json.dumps(answer))\n`,
      stdin: plainInput,
      protocol: false,
    };
  if (language === 'java' || language === 'kotlin') {
    const java = language === 'java';
    const convert = (type: string, i: number) =>
      ({
        int: `__H.toInt(a${java ? '.get(' + i + ')' : '[' + i + ']'})`,
        string: `__H.toStr(a${java ? '.get(' + i + ')' : '[' + i + ']'})`,
        ints: `ints(a${java ? '.get(' + i + ')' : '[' + i + ']'})`,
        tree: `${java ? 'ints' : 'tree'}(a${java ? '.get(' + i + ')' : '[' + i + ']'})`,
        graph: `graph(a${java ? '.get(' + i + ')' : '[' + i + ']'})`,
      }[type]!);
    if (java) {
      const dispatch = concepts
        .map(
          (entry) =>
            `case "${entry.function}": return ${camel(entry.function)}Example.${
              entry.function
            }(${entry.arguments.map(convert).join(', ')});`,
        )
        .join('\n');
      return {
        source: `${imports}\n${body}\n${base(
          'java.core.java',
        )}\nclass Main {\nstatic java.util.List<Integer> ints(Object value) { java.util.List<Integer> out = new java.util.ArrayList<>(); for (Object item : __H.list(value, "ints")) out.add(item == null ? null : __H.toInt(item)); return out; }\nstatic java.util.List<java.util.List<Integer>> graph(Object value) { java.util.List<java.util.List<Integer>> out = new java.util.ArrayList<>(); for(Object row: __H.list(value,"graph")) out.add(ints(row)); return out; }\npublic static void main(String[] ignored) { __H.run(test -> { var a = __H.list(test.get("args"), "args"); switch (__H.toStr(test.get("function"))) { ${dispatch} default: throw new AssertionError("Unknown example"); } }); }\n}`,
        stdin: protocolInput,
        protocol: true,
      };
    }
    const dispatch = concepts
      .map(
        (entry) =>
          `"${entry.function}" -> ${entry.function}(${entry.arguments.map(convert).join(', ')})`,
      )
      .join('\n');
    return {
      source: `${imports}\n${body}\n${base(
        'kotlin.core.kt',
      )}\nfun ints(value: Any?): List<Int> = __H.list(value,"ints").map { __H.toInt(it) }\nfun tree(value: Any?): List<Int?> = __H.list(value,"tree").map { if(it == null) null else __H.toInt(it) }\nfun graph(value: Any?): List<List<Int>> = __H.list(value,"graph").map { ints(it) }\nfun main() { __H.run { test -> val a = __H.list(test["args"],"args"); when(__H.toStr(test["function"])) { ${dispatch}\nelse -> error("Unknown example") } } }`,
      stdin: protocolInput,
      protocol: true,
    };
  }
  if (language === 'cpp') {
    const types: Record<string, string> = {
      int: 'int',
      string: 'std::string',
      ints: 'std::vector<int>',
      tree: 'std::vector<std::optional<int>>',
      graph: 'std::vector<std::vector<int>>',
    };
    const dispatch = concepts
      .map(
        (entry) =>
          `if (name == "${entry.function}") { std::string output; __skh::put(output, ${
            entry.function
          }(${entry.arguments
            .map((type, i) => `__skh::from<${types[type]}>(a[${i}])`)
            .join(', ')})); return output; }`,
      )
      .join('\n');
    return {
      source: `${base(
        'cpp.core.h',
      )}\n${body}\nint main() { return __skh::run([](const __skh::JVal& test) -> std::string { const auto name = __skh::field(test,"function")->str(); const auto& a = *__skh::field(test,"args"); ${dispatch} throw std::runtime_error("Unknown example"); }); }`,
      stdin: protocolInput,
      protocol: true,
    };
  }
  if (language === 'rust') {
    const types: Record<string, string> = {
      int: 'i32',
      string: 'String',
      ints: 'Vec<i32>',
      tree: 'Vec<Option<i32>>',
      graph: 'Vec<Vec<i32>>',
    };
    const dispatch = concepts
      .map(
        (entry) =>
          `"${entry.function}" => { let a = __harness::args(test, "args", ${
            entry.arguments.length
          }); __harness::answer(&${snake(entry.function)}(${entry.arguments
            .map(
              (type, i) =>
                `${type === 'int' ? '' : '&'}__harness::from_json::<${types[type]}>(&a[${i}])`,
            )
            .join(', ')})) }`,
      )
      .join(',\n');
    return {
      source: `${imports}\n${body}\n${base(
        'rust.core.rs',
      )}\nfn check(test: &__harness::Json) -> String { let name: String = __harness::from_json(__harness::field(test,"function").unwrap()); match name.as_str() { ${dispatch}, _ => panic!("Unknown example") } }\nfn main() { __harness::run(check,0); }`,
      stdin: protocolInput,
      protocol: true,
    };
  }
  if (language === 'swift' && process.env.FOUNDATION_SWIFTC) {
    // Trusted examples can use an explicitly selected local Swift compiler.
    // The Linux runner prelude intentionally calls Glibc; use Foundation JSON
    // for this author-only driver rather than changing production harness code.
    const convert = (type: string, i: number) =>
      ({
        int: `a[${i}] as! Int`,
        string: `a[${i}] as! String`,
        ints: `fixtureInts(a[${i}])`,
        tree: `fixtureTree(a[${i}])`,
        graph: `fixtureGraph(a[${i}])`,
      }[type]!);
    const dispatch = concepts
      .map(
        (entry) =>
          `case "${entry.function}": emit(${entry.function}(${entry.arguments
            .map(convert)
            .join(', ')}))`,
      )
      .join('\n');
    return {
      source: `import Foundation\n${body}\nfunc fixtureInts(_ value:Any)->[Int]{(value as! [Any]).map{$0 as! Int}}\nfunc fixtureTree(_ value:Any)->[Int?]{(value as! [Any]).map{$0 is NSNull ? nil : $0 as? Int}}\nfunc fixtureGraph(_ value:Any)->[[Int]]{(value as! [Any]).map{fixtureInts($0)}}\nfunc emit<T:Encodable>(_ value:T){let data=try! JSONEncoder().encode(value);FileHandle.standardOutput.write(data);FileHandle.standardOutput.write(Data([10]))}\nlet fixtures=try JSONSerialization.jsonObject(with:FileHandle.standardInput.readDataToEndOfFile()) as! [[String:Any]]\nfor test in fixtures {let a=test["args"] as! [Any];switch test["function"] as! String {${dispatch}\ndefault: fatalError("Unknown fixture")}}`,
      stdin: plainInput,
      protocol: false,
    };
  }
  if (language === 'swift') {
    const types: Record<string, string> = {
      int: 'Int',
      string: 'String',
      ints: '[Int]',
      tree: '[Int?]',
      graph: '[[Int]]',
    };
    const dispatch = concepts
      .map(
        (entry) =>
          `case "${entry.function}":\nlet a = try __H.args(test, "args", ${
            entry.arguments.length
          })\n${entry.arguments
            .map((type, i) => `let v${i}: ${types[type]} = try __in(a[${i}])`)
            .join('\n')}\nreturn try __json(${entry.function}(${entry.arguments
            .map((_, i) => `v${i}`)
            .join(', ')}))`,
      )
      .join('\n');
    return {
      source: `import Foundation\n#if os(Linux)\nimport Glibc\n#else\nimport Darwin\n#endif\n${base(
        'swift.core.swift',
      )}\n${body}\n__H.run(userLines:0) { test in let name: String = try __in(try __H.field(test,"function")); switch name { ${dispatch}\ndefault: throw NSError(domain:"Unknown example",code:1) } }`,
      stdin: protocolInput,
      protocol: true,
    };
  }
  if (language === 'go') {
    const convert = (type: string, i: number) =>
      ({
        int: `int(a[${i}].(float64))`,
        string: `a[${i}].(string)`,
        ints: `ints(a[${i}])`,
        tree: `tree(a[${i}])`,
        graph: `graph(a[${i}])`,
      }[type]!);
    const dispatch = concepts
      .map(
        (entry) =>
          `case "${entry.function}": answer = ${camel(entry.function)}(${entry.arguments
            .map(convert)
            .join(', ')})`,
      )
      .join('\n');
    return {
      source: `package main\nimport "encoding/json"\nimport "os"\nimport "fmt"\n${imports}\n${body}\nfunc ints(value any) []int { out := []int{}; for _, item := range value.([]any) {out=append(out,int(item.(float64)))}; return out }\nfunc tree(value any) []*int { out:=[]*int{}; for _, item:=range value.([]any) {if item==nil {out=append(out,nil)} else {v:=int(item.(float64));out=append(out,&v)}};return out }\nfunc graph(value any) [][]int {out:=[][]int{};for _, row:=range value.([]any){out=append(out,ints(row))};return out}\nfunc main() {var tests []map[string]any; if err:=json.NewDecoder(os.Stdin).Decode(&tests);err!=nil{panic(err)};for _, test:=range tests{a:=test["args"].([]any);var answer any;switch test["function"].(string){${dispatch}\ndefault: panic("Unknown example")};result,err:=json.Marshal(answer);if err!=nil{panic(err)};fmt.Println(string(result))}}`,
      stdin: plainInput,
      protocol: false,
    };
  }
  if (language === 'csharp') {
    const convert = (type: string, i: number) =>
      ({
        int: `a[${i}].GetInt32()`,
        string: `a[${i}].GetString()`,
        ints: `Ints(a[${i}])`,
        tree: `Tree(a[${i}])`,
        graph: `Graph(a[${i}])`,
      }[type]!);
    const dispatch = concepts
      .map(
        (entry) =>
          `case "${entry.function}": answer = ${camel(entry.function)}Example.${camel(
            entry.function,
          )}(${entry.arguments.map(convert).join(', ')}); break;`,
      )
      .join('\n');
    return {
      source: `${imports}\nusing System.Text.Json;\n${body}\nnamespace __SkilledDriver { class Program {\nstatic List<int> Ints(JsonElement value) { var list=new List<int>();foreach(var item in value.EnumerateArray())list.Add(item.GetInt32());return list;}\nstatic List<int?> Tree(JsonElement value) {var list=new List<int?>();foreach(var item in value.EnumerateArray())list.Add(item.ValueKind==JsonValueKind.Null?null:item.GetInt32());return list;}\nstatic List<List<int>> Graph(JsonElement value) {var list=new List<List<int>>();foreach(var row in value.EnumerateArray())list.Add(Ints(row));return list;}\nstatic void Main() { using var document=JsonDocument.Parse(Console.In.ReadToEnd()); foreach(var test in document.RootElement.EnumerateArray()){var a=test.GetProperty("args");object answer;switch(test.GetProperty("function").GetString()){${dispatch}\ndefault:throw new Exception("Unknown example");}Console.WriteLine(JsonSerializer.Serialize(answer));}}\n} }`,
      stdin: plainInput,
      protocol: false,
    };
  }
  throw new Error(`Unsupported author language: ${language}`);
}
