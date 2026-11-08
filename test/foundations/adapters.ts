// Adapters observe published classes. All expected results come from independent models.
export function adapter(language: string, kind: string): string {
  if (language === 'javascript' || language === 'typescript') {
    const body: Record<string, string> = {
      array: `const s=new DynamicArray();for(const [op,a,b] of ops){let v=0;if(op===0)v=s.push(a);if(op===1)v=s.pop()??N;if(op===2)s.insert(a,b);if(op===3)v=s.remove(a)??N;if(op===4)v=s.get(a);out.push(v,s.length);for(let i=0;i<s.length;i++)out.push(s.get(i));out.push(Object.keys(s.data).length);}`,
      hash: `const s=new HashTable(mode);for(const [op,a,b]of ops){let v=0;if(op===0)s.insert('k'+a,b);if(op===1)v=s.remove('k'+a)??N;if(op===2)v=s.get('k'+a)??N;out.push(v);for(let i=0;i<5;i++)out.push(s.get('k'+i)??N);}`,
      list: `const s=new DoublyLinkedList(mode);for(const [op,a]of ops){if(op===0)s.prepend(a);else s.append(a);out.push(s.length);let prev=null;for(let n=s.head;n;n=n.next){if(n.prev!==prev)throw Error('reciprocal');out.push(n.data);prev=n;}if(prev!==s.tail)throw Error('tail');for(let n=s.tail;n;n=n.prev)out.push(n.data);}`,
      queue: `const s=new Queue();for(const [op,a]of ops){let v=0;if(op===0)s.enqueue(a);if(op===1)v=s.dequeue()?.data??N;if(op===2)v=s.peek()?.data??N;out.push(v,s.peek()?.data??N,s.last?.data??N);}`,
      stack: `const s=new Stack();for(const [op,a]of ops){let v=0;if(op===0)s.push(a);if(op===1)v=s.pop()?.data??N;if(op===2)v=s.peek()?.data??N;out.push(v,s.peek()?.data??N);}`,
      tree: `const s=new BinarySearchTree();function walk(n){if(n){walk(n.left);out.push(n.data);walk(n.right);}}let size=0;for(const [op,a]of ops){let v=0;if(op===0){s.insert(a);size++;}else v=s.search(a)?1:0;out.push(v,size);walk(s.root);}`,
      graph: `const s=new Graph(!!mode);const key=i=>String.fromCharCode(65+i);for(const [op,a,b]of ops){if(op===0)s.addVertex(key(a));if(op===1)s.addEdge(key(a),key(b));if(op===2)s.removeVertex(key(a));for(let i=0;i<4;i++){const edges=s.adjacencyList[key(i)];out.push(edges?1:0);for(let j=0;j<4;j++)out.push((edges??[]).filter(x=>x===key(j)).length);}}`,
    };
    return `function verify(ops${language === 'typescript' ? ': number[][]' : ''}, mode${
      language === 'typescript' ? ': number' : ''
    }) {const N=-1000000000;const out${language === 'typescript' ? ': number[]' : ''}=[];${
      language === 'typescript'
        ? body[kind]
            .replace('function walk(n)', 'function walk(n: BinaryNode | null)')
            .replace('const key=i=>', 'const key=(i: number)=>')
            .replace('let prev=null;', 'let prev: DoublyNode | null=null;')
            .replace('for(let n=s.head;', 'for(let n: DoublyNode | null=s.head;')
            .replace('for(let n=s.tail;', 'for(let n: DoublyNode | null=s.tail;')
        : body[kind]
    }return out;}`;
  }
  if (language === 'python') {
    const body: Record<string, string> = {
      array: `s=DynamicArray()\nfor op,a,b in ops:\n    v=0\n    if op==0: v=s.push(a)\n    if op==1: v=s.pop()\n    if op==2: s.insert(a,b)\n    if op==3: v=s.remove(a)\n    if op==4: v=s.get(a)\n    out.extend([N if v is None else v,s.length])\n    out.extend(s.get(i) for i in range(s.length))\n    out.append(len(s.data))`,
      hash: `s=HashTable(mode)\nfor op,a,b in ops:\n    v=0\n    if op==0: s.insert('k'+str(a),b)\n    if op==1: v=s.remove('k'+str(a))\n    if op==2: v=s.get('k'+str(a))\n    out.append(N if v is None else v)\n    for i in range(5):\n        value=s.get('k'+str(i))\n        out.append(N if value is None else value)`,
      list: `s=DoublyLinkedList(mode)\nfor op,a,b in ops:\n    s.prepend(a) if op==0 else s.append(a)\n    out.append(s.length)\n    n=s.head;prev=None\n    while n is not None:\n        assert n.prev is prev, 'reciprocal'\n        out.append(n.data);prev=n;n=n.next\n    assert prev is s.tail\n    n=s.tail\n    while n is not None:\n        out.append(n.data);n=n.prev`,
      tree: `s=BinarySearchTree()\nsize=0\ndef walk(n):\n    if n is not None:\n        walk(n.left);out.append(n.data);walk(n.right)\nfor op,a,b in ops:\n    v=0\n    if op==0: s.insert(a);size+=1\n    else: v=int(s.search(a) is not None)\n    out.extend([v,size]);walk(s.root)`,
      graph: `s=Graph(bool(mode))\nkey=lambda i:chr(65+i)\nfor op,a,b in ops:\n    if op==0: s.add_vertex(key(a))\n    if op==1: s.add_edge(key(a),key(b))\n    if op==2: s.remove_vertex(key(a))\n    for i in range(4):\n        edges=s.adjacency_list.get(key(i))\n        out.append(int(edges is not None))\n        out.extend((edges or []).count(key(j)) for j in range(4))`,
    };
    if (kind === 'queue' || kind === 'stack') {
      const q = kind === 'queue';
      body[kind] = `s=${q ? 'Queue' : 'Stack'}()\nfor op,a,b in ops:\n    v=0\n    if op==0: s.${
        q ? 'enqueue' : 'push'
      }(a)\n    if op==1:\n        node=s.${
        q ? 'dequeue' : 'pop'
      }();v=N if node is None else node.data\n    if op==2:\n        node=s.peek();v=N if node is None else node.data\n    node=s.peek()\n    out.extend([v,N if node is None else node.data])${
        q ? '\n    out.append(N if s.last is None else s.last.data)' : ''
      }`;
    }
    return `def verify(ops, mode):\n    N=-1000000000\n    out=[]\n${body[kind]
      .split('\n')
      .map((line) => '    ' + line)
      .join('\n')}\n    return out\n`;
  }
  if (language === 'java') {
    const body: Record<string, string> = {
      array: `var s=new DynamicArray<Integer>();for(var row:ops){int op=row.get(0),a=row.get(1),b=row.get(2),v=0;if(op==0)v=s.push(a);if(op==1)v=number(s.pop());if(op==2)s.insert(a,b);if(op==3)v=number(s.remove(a));if(op==4)v=s.get(a);int size=(int)field(s,"length");out.add(v);out.add(size);for(int i=0;i<size;i++)out.add(s.get(i));out.add(((Map<?,?>)field(s,"data")).size());}`,
      hash: `var s=new HashTable<Integer>(mode);for(var row:ops){int op=row.get(0),a=row.get(1),b=row.get(2),v=0;if(op==0)s.insert("k"+a,b);if(op==1)v=number(s.remove("k"+a));if(op==2)v=number(s.get("k"+a));out.add(v);for(int i=0;i<5;i++)out.add(number(s.get("k"+i)));}`,
      list: `var s=new DoublyLinkedList<Integer>(mode);for(var row:ops){if(row.get(0)==0)s.prepend(row.get(1));else s.append(row.get(1));out.add((int)field(s,"length"));DoublyNode<Integer> prev=null;for(var n=(DoublyNode<Integer>)field(s,"head");n!=null;n=n.next){if(n.prev!=prev)throw new AssertionError("reciprocal");out.add(n.data);prev=n;}if(prev!=field(s,"tail"))throw new AssertionError("tail");for(var n=(DoublyNode<Integer>)field(s,"tail");n!=null;n=n.prev)out.add(n.data);}`,
      tree: `var s=new BinarySearchTree();int size=0;for(var row:ops){int v=0;if(row.get(0)==0){s.insert(row.get(1));size++;}else v=s.search(row.get(1))==null?0:1;out.add(v);out.add(size);walk((BinaryNode)field(s,"root"),out);}`,
      graph: `var s=new Graph(mode!=0);for(var row:ops){int op=row.get(0),a=row.get(1),b=row.get(2);if(op==0)s.addVertex(key(a));if(op==1)s.addEdge(key(a),key(b));if(op==2)s.removeVertex(key(a));var map=(Map<String,List<String>>)field(s,"adjacencyList");for(int i=0;i<4;i++){var edges=map.get(key(i));out.add(edges==null?0:1);for(int j=0;j<4;j++)out.add(edges==null?0:Collections.frequency(edges,key(j)));}}`,
    };
    if (kind === 'queue' || kind === 'stack') {
      const q = kind === 'queue';
      body[kind] = `var s=new ${
        q ? 'Queue' : 'Stack'
      }<Integer>();for(var row:ops){int op=row.get(0),a=row.get(1),v=0;if(op==0)s.${
        q ? 'enqueue' : 'push'
      }(a);if(op==1){var n=s.${
        q ? 'dequeue' : 'pop'
      }();v=n==null?N:n.data;}if(op==2){var n=s.peek();v=n==null?N:n.data;}out.add(v);out.add(s.peek()==null?N:s.peek().data);${
        q ? 'var last=(Node<Integer>)field(s,"last");out.add(last==null?N:last.data);' : ''
      }}`;
    }
    return `class VerifyExample {static final int N=-1000000000;static int number(Integer v){return v==null?N:v;}static String key(int v){return ""+(char)(65+v);}static Object field(Object s,String name){try{var f=s.getClass().getDeclaredField(name);f.setAccessible(true);return f.get(s);}catch(Exception e){throw new AssertionError(e);}}${
      kind === 'tree'
        ? 'static void walk(BinaryNode n,List<Integer> out){if(n!=null){walk(n.left,out);out.add(n.data);walk(n.right,out);}}'
        : ''
    }static List<Integer> verify(List<List<Integer>> ops,int mode){var out=new ArrayList<Integer>();${
      body[kind]
    }return out;}}`;
  }
  if (language === 'cpp') {
    const body: Record<string, string> = {
      array: `DynamicArray s;for(auto r:ops){int op=r[0],a=r[1],b=r[2],v=0;if(op==0)v=s.push(a);if(op==1)v=s.pop().value_or(N);if(op==2)s.insert(a,b);if(op==3)v=s.remove(a).value_or(N);if(op==4)v=s.get(a);out.push_back(v);out.push_back(s.length);for(int i=0;i<s.length;i++)out.push_back(s.get(i));out.push_back(s.data.size());}`,
      hash: `HashTable s(mode);for(auto r:ops){int op=r[0],a=r[1],b=r[2],v=0;if(op==0)s.insert("k"+std::to_string(a),b);if(op==1)v=s.remove("k"+std::to_string(a)).value_or(N);if(op==2)v=s.get("k"+std::to_string(a)).value_or(N);out.push_back(v);for(int i=0;i<5;i++)out.push_back(s.get("k"+std::to_string(i)).value_or(N));}`,
      list: `DoublyLinkedList s(mode);for(auto r:ops){if(r[0]==0)s.prepend(r[1]);else s.append(r[1]);out.push_back(s.length);DoublyNode* prev=nullptr;for(auto n=s.head;n;n=n->next){if(n->prev!=prev)throw std::runtime_error("reciprocal");out.push_back(n->data);prev=n;}if(prev!=s.tail)throw std::runtime_error("tail");for(auto n=s.tail;n;n=n->prev)out.push_back(n->data);}`,
      tree: `BinarySearchTree s;int size=0;std::function<void(BinaryNode*)> walk=[&](BinaryNode*n){if(n){walk(n->left);out.push_back(n->data);walk(n->right);}};for(auto r:ops){int v=0;if(r[0]==0){s.insert(r[1]);size++;}else v=s.search(r[1])?1:0;out.push_back(v);out.push_back(size);walk(s.root);}`,
      graph: `Graph s(mode!=0);auto key=[](int i){return std::string(1,char(65+i));};for(auto r:ops){if(r[0]==0)s.addVertex(key(r[1]));if(r[0]==1)s.addEdge(key(r[1]),key(r[2]));if(r[0]==2)s.removeVertex(key(r[1]));for(int i=0;i<4;i++){auto it=s.adjacencyList.find(key(i));out.push_back(it==s.adjacencyList.end()?0:1);for(int j=0;j<4;j++)out.push_back(it==s.adjacencyList.end()?0:std::count(it->second.begin(),it->second.end(),key(j)));}}`,
    };
    if (kind === 'queue' || kind === 'stack') {
      const q = kind === 'queue';
      body[kind] = `${q ? 'Queue' : 'Stack'} s;for(auto r:ops){int v=0;if(r[0]==0)s.${
        q ? 'enqueue' : 'push'
      }(r[1]);if(r[0]==1){auto n=s.${
        q ? 'dequeue' : 'pop'
      }();v=n?n->data:N;delete n;}if(r[0]==2){auto n=s.peek();v=n?n->data:N;}out.push_back(v);out.push_back(s.peek()?s.peek()->data:N);${
        q ? 'out.push_back(s.last?s.last->data:N);' : ''
      }}`;
    }
    return `#include <vector>\n#include <string>\n#include <algorithm>\n#include <functional>\nstd::vector<int> verify(const std::vector<std::vector<int>>& ops,int mode){const int N=-1000000000;std::vector<int> out;${body[kind]}return out;}`;
  }
  if (language === 'csharp') {
    const body: Record<string, string> = {
      array: `var s=new DynamicArray<int?>();foreach(var r in ops){int op=r[0],a=r[1],b=r[2],v=0;if(op==0)v=s.Push(a);if(op==1)v=s.Pop()??N;if(op==2)s.Insert(a,b);if(op==3)v=s.Remove(a)??N;if(op==4)v=s.Get(a).Value;output.Add(v);output.Add(s.length);for(int i=0;i<s.length;i++)output.Add(s.Get(i).Value);output.Add(s.data.Count);}`,
      hash: `var s=new HashTable<int?>(mode);foreach(var r in ops){int v=0;if(r[0]==0)s.Insert("k"+r[1],r[2]);if(r[0]==1)v=s.Remove("k"+r[1])??N;if(r[0]==2)v=s.Get("k"+r[1])??N;output.Add(v);for(int i=0;i<5;i++)output.Add(s.Get("k"+i)??N);}`,
      list: `var s=new DoublyLinkedList(mode);foreach(var r in ops){if(r[0]==0)s.Prepend(r[1]);else s.Append(r[1]);output.Add(s.length);DoublyNode prev=null;for(var n=s.head;n!=null;n=n.next){if(n.prev!=prev)throw new Exception("reciprocal");output.Add(n.data);prev=n;}if(prev!=s.tail)throw new Exception("tail");for(var n=s.tail;n!=null;n=n.prev)output.Add(n.data);}`,
      tree: `var s=new BinarySearchTree();int size=0;void Walk(BinaryNode n){if(n!=null){Walk(n.left);output.Add(n.data);Walk(n.right);}}foreach(var r in ops){int v=0;if(r[0]==0){s.Insert(r[1]);size++;}else v=s.Search(r[1])==null?0:1;output.Add(v);output.Add(size);Walk(s.root);}`,
      graph: `var s=new Graph(mode!=0);string Key(int i)=>((char)(65+i)).ToString();foreach(var r in ops){if(r[0]==0)s.AddVertex(Key(r[1]));if(r[0]==1)s.AddEdge(Key(r[1]),Key(r[2]));if(r[0]==2)s.RemoveVertex(Key(r[1]));for(int i=0;i<4;i++){bool exists=s.adjacencyList.TryGetValue(Key(i),out var edges);output.Add(exists?1:0);for(int j=0;j<4;j++){int count=0;if(exists)foreach(var edge in edges)if(edge==Key(j))count++;output.Add(count);}}}`,
    };
    if (kind === 'queue' || kind === 'stack') {
      const q = kind === 'queue';
      body[kind] = `var s=new ${
        q ? 'Queue' : 'Stack'
      }();foreach(var r in ops){int v=0;if(r[0]==0)s.${
        q ? 'Enqueue' : 'Push'
      }(r[1]);if(r[0]==1)v=s.${
        q ? 'Dequeue' : 'Pop'
      }()?.data??N;if(r[0]==2)v=s.Peek()?.data??N;output.Add(v);output.Add(s.Peek()?.data??N);${
        q ? 'output.Add(s.last?.data??N);' : ''
      }}`;
    }
    return `using System;\nusing System.Collections.Generic;\npublic static class VerifyExample {public static List<int> Verify(List<List<int>> ops,int mode){const int N=-1000000000;var output=new List<int>();${body[kind]}return output;}}`;
  }
  if (language === 'kotlin') {
    const body: Record<string, string> = {
      array: `val s=DynamicArray();for(r in ops){val op=r[0];val a=r[1];val b=r[2];var v=0;if(op==0)v=s.push(a);if(op==1)v=s.pop()?:N;if(op==2)s.insert(a,b);if(op==3)v=s.remove(a)?:N;if(op==4)v=s.get(a)!!;out.add(v);out.add(s.length);for(i in 0 until s.length)out.add(s.get(i)!!);out.add(s.data.size)}`,
      hash: `val s=HashTable(mode);for(r in ops){var v=0;if(r[0]==0)s.insert("k"+r[1],r[2]);if(r[0]==1)v=s.remove("k"+r[1])?:N;if(r[0]==2)v=s.get("k"+r[1])?:N;out.add(v);for(i in 0 until 5)out.add(s.get("k"+i)?:N)}`,
      list: `val s=DoublyLinkedList(mode);for(r in ops){if(r[0]==0)s.prepend(r[1])else s.append(r[1]);out.add(s.length);var n:DoublyNode?=s.head;var prev:DoublyNode?=null;while(n!=null){check(n.prev===prev);out.add(n.data);prev=n;n=n.next};check(prev===s.tail);n=s.tail;while(n!=null){out.add(n.data);n=n.prev}}`,
      tree: `val s=BinarySearchTree();var size=0;fun walk(n:BinaryNode?){if(n!=null){walk(n.left);out.add(n.data);walk(n.right)}};for(r in ops){var v=0;if(r[0]==0){s.insert(r[1]);size++}else v=if(s.search(r[1])==null)0 else 1;out.add(v);out.add(size);walk(s.root)}`,
      graph: `val s=Graph(mode!=0);fun key(i:Int)=(65+i).toChar().toString()\nfor(r in ops){if(r[0]==0)s.addVertex(key(r[1]));if(r[0]==1)s.addEdge(key(r[1]),key(r[2]));if(r[0]==2)s.removeVertex(key(r[1]));for(i in 0 until 4){val edges=s.adjacencyList[key(i)];out.add(if(edges==null)0 else 1);for(j in 0 until 4)out.add(edges?.count{it==key(j)}?:0)}}`,
    };
    if (kind === 'queue' || kind === 'stack') {
      const q = kind === 'queue';
      body[kind] = `val s=${q ? 'Queue' : 'Stack'}();for(r in ops){var v=0;if(r[0]==0)s.${
        q ? 'enqueue' : 'push'
      }(r[1]);if(r[0]==1)v=s.${
        q ? 'dequeue' : 'pop'
      }()?.data?:N;if(r[0]==2)v=s.peek()?.data?:N;out.add(v);out.add(s.peek()?.data?:N);${
        q ? 'out.add(s.last?.data?:N);' : ''
      }}`;
    }
    return `fun verify(ops:List<List<Int>>,mode:Int):List<Int>{val N=-1000000000;val out=mutableListOf<Int>();${body[kind]};return out}`;
  }
  if (language === 'swift') {
    const body: Record<string, string> = {
      array: `let s=DynamicArray();for r in ops {var v=0;if r[0]==0 {v=s.push(r[1])};if r[0]==1 {v=s.pop() ?? N};if r[0]==2 {_ = s.insert(r[1],r[2])};if r[0]==3 {v=s.remove(r[1]) ?? N};if r[0]==4 {v=s.get(r[1])!};out.append(contentsOf:[v,s.length]);for i in 0..<s.length {out.append(s.get(i)!)};out.append(s.data.count)}`,
      hash: `let s=HashTable(abs(mode));let keys=["é","e\\u{301}","Å","A\\u{30a}","😀"];func key(_ i:Int)->String {mode<0 ? keys[i] : "k"+String(i)};for r in ops {var v=0;if r[0]==0 {s.insert(key(r[1]),r[2])};if r[0]==1 {v=s.remove(key(r[1])) ?? N};if r[0]==2 {v=s.get(key(r[1])) ?? N};out.append(v);for i in 0..<5 {out.append(s.get(key(i)) ?? N)}}`,
      list: `let s=DoublyLinkedList(mode);for r in ops {if r[0]==0 {_ = s.prepend(r[1])} else {_ = s.append(r[1])};out.append(s.length);var n:DoublyNode?=s.head;var prev:DoublyNode?;while let node=n {precondition(node.prev === prev);out.append(node.data);prev=node;n=node.next};precondition(prev === s.tail);n=s.tail;while let node=n {out.append(node.data);n=node.prev}}`,
      tree: `let s=BinarySearchTree();var size=0;func walk(_ n:BinaryNode?){if let node=n {walk(node.left);out.append(node.data);walk(node.right)}};for r in ops {var v=0;if r[0]==0 {_ = s.insert(r[1]);size+=1} else {v=s.search(r[1]) == nil ? 0:1};out.append(contentsOf:[v,size]);walk(s.root)}`,
      graph: `let s=Graph(undirected:mode != 0);func key(_ i:Int)->String {String(UnicodeScalar(65+i)!)};for r in ops {if r[0]==0 {s.addVertex(key(r[1]))};if r[0]==1 {s.addEdge(key(r[1]),key(r[2]))};if r[0]==2 {s.removeVertex(key(r[1]))};for i in 0..<4 {let edges=s.adjacencyList[key(i)];out.append(edges == nil ? 0:1);for j in 0..<4 {out.append((edges ?? []).filter{$0==key(j)}.count)}}}`,
    };
    if (kind === 'queue' || kind === 'stack') {
      const q = kind === 'queue';
      body[kind] = `let s=${q ? 'Queue' : 'Stack'}();for r in ops {var v=0;if r[0]==0 {_ = s.${
        q ? 'enqueue' : 'push'
      }(r[1])};if r[0]==1 {v=s.${
        q ? 'dequeue' : 'pop'
      }()?.data ?? N};if r[0]==2 {v=s.peek()?.data ?? N};out.append(contentsOf:[v,s.peek()?.data ?? N]);${
        q ? 'out.append(s.last?.data ?? N);' : ''
      }}`;
    }
    return `func verify(_ ops:[[Int]],_ mode:Int)->[Int]{let N = -1000000000;var out:[Int]=[];${body[kind]};return out}`;
  }
  if (language === 'go') {
    const body: Record<string, string> = {
      array: `s:=NewDynamicArray();for _,r:=range ops{v:=0;if r[0]==0{v=s.Push(r[1])};if r[0]==1{value,ok:=s.Pop();v=N;if ok{v=value}};if r[0]==2{s.Insert(r[1],r[2])};if r[0]==3{value,ok:=s.Remove(r[1]);v=N;if ok{v=value}};if r[0]==4{v=s.Get(r[1])};out=append(out,v,s.length);for i:=0;i<s.length;i++{out=append(out,s.Get(i))};out=append(out,len(s.data))}`,
      hash: `s:=NewHashTable(mode);num:=func(v any)int{if v==nil{return N};return v.(int)};key:=func(i int)string{return string(rune(107+i))};for _,r:=range ops{v:=0;if r[0]==0{s.Insert(key(r[1]),r[2])};if r[0]==1{v=num(s.Remove(key(r[1])))};if r[0]==2{v=num(s.Get(key(r[1])))};out=append(out,v);for i:=0;i<5;i++{out=append(out,num(s.Get(key(i))))}}`,
      list: `s:=NewDoublyLinkedList(mode);for _,r:=range ops{if r[0]==0{s.Prepend(r[1])}else{s.Append(r[1])};out=append(out,s.length);var prev *DoublyNode;for n:=s.head;n!=nil;n=n.Next{if n.Prev!=prev{panic("reciprocal")};out=append(out,n.Data);prev=n};if prev!=s.tail{panic("tail")};for n:=s.tail;n!=nil;n=n.Prev{out=append(out,n.Data)}}`,
      tree: `s:=NewBinarySearchTree();size:=0;var walk func(*BinaryNode);walk=func(n *BinaryNode){if n!=nil{walk(n.Left);out=append(out,n.Data);walk(n.Right)}};for _,r:=range ops{v:=0;if r[0]==0{s.Insert(r[1]);size++}else{if s.Search(r[1])!=nil{v=1}};out=append(out,v,size);walk(s.root)}`,
      graph: `s:=NewGraph(mode!=0);key:=func(i int)string{return string(rune(65+i))};for _,r:=range ops{if r[0]==0{s.AddVertex(key(r[1]))};if r[0]==1{s.AddEdge(key(r[1]),key(r[2]))};if r[0]==2{s.RemoveVertex(key(r[1]))};for i:=0;i<4;i++{edges,ok:=s.adjacencyList[key(i)];exists:=0;if ok{exists=1};out=append(out,exists);for j:=0;j<4;j++{count:=0;for _,edge:=range edges{if edge==key(j){count++}};out=append(out,count)}}}`,
    };
    if (kind === 'queue' || kind === 'stack') {
      const q = kind === 'queue';
      body[kind] = `s:=New${
        q ? 'Queue' : 'Stack'
      }();num:=func(n *Node)int{if n==nil{return N};return n.Data};for _,r:=range ops{v:=0;if r[0]==0{s.${
        q ? 'Enqueue' : 'Push'
      }(r[1])};if r[0]==1{v=num(s.${
        q ? 'Dequeue' : 'Pop'
      }())};if r[0]==2{v=num(s.Peek())};out=append(out,v,num(s.Peek()));${
        q ? 'out=append(out,num(s.last));' : ''
      }}`;
    }
    return `func Verify(ops [][]int,mode int)[]int{const N=-1000000000;out:=[]int{};${body[kind]};return out}`;
  }
  if (language === 'rust') {
    const body: Record<string, string> = {
      array: `let mut s=DynamicArray::new();for r in ops{let mut v=0;if r[0]==0{v=s.push(r[1]) as i32;}if r[0]==1{v=s.pop().unwrap_or(N);}if r[0]==2{s.insert(r[1] as usize,r[2]);}if r[0]==3{v=s.remove(r[1] as usize).unwrap_or(N);}if r[0]==4{v=s.get(r[1] as usize).unwrap();}out.extend([v,s.length as i32]);for i in 0..s.length{out.push(s.get(i).unwrap());}out.push(s.data.len() as i32);}`,
      hash: `let mut s=HashTable::new(mode as usize);for r in ops{let mut v=0;if r[0]==0{s.insert(&format!("k{}",r[1]),r[2]);}if r[0]==1{v=s.remove(&format!("k{}",r[1])).unwrap_or(N);}if r[0]==2{v=s.get(&format!("k{}",r[1])).unwrap_or(N);}out.push(v);for i in 0..5{out.push(s.get(&format!("k{}",i)).unwrap_or(N));}}`,
      list: `let mut s=DoublyLinkedList::new(mode);for r in ops{if r[0]==0{s.prepend(r[1]);}else{s.append(r[1]);}out.push(s.length as i32);let mut n=Some(Rc::clone(&s.head));let mut prev:Option<Rc<RefCell<DoublyNode>>>=None;while let Some(node)=n{let back=node.borrow().prev.as_ref().and_then(|p|p.upgrade());assert!(match (&back,&prev){(None,None)=>true,(Some(a),Some(b))=>Rc::ptr_eq(a,b),_=>false});out.push(node.borrow().data);n=node.borrow().next.clone();prev=Some(node);}assert!(Rc::ptr_eq(prev.as_ref().unwrap(),&s.tail));let mut n=Some(Rc::clone(&s.tail));while let Some(node)=n{out.push(node.borrow().data);n=node.borrow().prev.as_ref().and_then(|p|p.upgrade());}}`,
      queue: `let mut s=Queue::new();for r in ops{let mut v=0;if r[0]==0{s.enqueue(r[1]);}if r[0]==1{v=s.dequeue().unwrap_or(N);}if r[0]==2{v=s.peek().unwrap_or(N);}out.extend([v,s.peek().unwrap_or(N),s.last.as_ref().map(|n|n.borrow().data).unwrap_or(N)]);}`,
      stack: `let mut s=Stack::new();for r in ops{let mut v=0;if r[0]==0{s.push(r[1]);}if r[0]==1{v=s.pop().unwrap_or(N);}if r[0]==2{v=s.peek().unwrap_or(N);}out.extend([v,s.peek().unwrap_or(N)]);}`,
      tree: `let mut s=BinarySearchTree::new();let mut size=0;fn walk(n:Option<&BinaryNode>,out:&mut Vec<i32>){if let Some(node)=n{walk(node.left.as_deref(),out);out.push(node.data);walk(node.right.as_deref(),out);}}for r in ops{let mut v=0;if r[0]==0{s.insert(r[1]);size+=1;}else{v=if s.search(r[1]).is_some(){1}else{0};}out.extend([v,size]);walk(s.root.as_deref(),&mut out);}`,
      graph: `let mut s=Graph::new(mode!=0);let key=|i:i32|char::from_u32(65+i as u32).unwrap();for r in ops{if r[0]==0{s.add_vertex(key(r[1]));}if r[0]==1{s.add_edge(key(r[1]),key(r[2]));}if r[0]==2{s.remove_vertex(key(r[1]));}for i in 0..4{let edges=s.adjacency_list.get(&key(i));out.push(if edges.is_some(){1}else{0});for j in 0..4{out.push(edges.map(|e|e.iter().filter(|v|**v==key(j)).count() as i32).unwrap_or(0));}}}`,
    };
    return `fn verify(ops:&Vec<Vec<i32>>,mode:i32)->Vec<i32>{const N:i32=-1000000000;let mut out=Vec::new();${body[kind]}out}`;
  }
  throw Error('Unsupported language ' + language);
}
