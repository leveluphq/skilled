"""Rebuild language-independent oracle fixtures from exhaustive small inputs."""
import json,itertools,math,collections
from pathlib import Path
cases=[]
def add(fn,args,result):cases.append({'function':fn,'args':args,'expected':result})
arrays=[list(x) for n in range(5) for x in itertools.product((-2,0,3),repeat=n)]
for a in arrays:
    for index in range(len(a)+1):
        b=a[:index]+[7]+a[index:];add('arraysInsert',[a,index,7],b)
    add('suffixCopies',[a],[a[i:] for i in range(len(a))])
    add('frequencyCounts',[a],[a.count(x) for x in a])
    add('sortCopy',[a],sorted(a));add('middleValue',[a],a[len(a)//2] if a else None)
    add('fifoOrder',[a],a);add('lifoOrder',[a],a[::-1])
    a=sorted(a)
    for target in (-3,-2,-1,0,1,3,4):add('binarySearch',[a,target],a.index(target) if target in a else -1)
for text in ('','a','Aa','a_b_a','A man, a plan, a canal: Panama!','race a car','0P','\nA\tA','éAé','abc','12321'):
    clean=''.join(x.lower() for x in text if x.isascii() and x.isalnum())
    add('asciiPalindrome',[text],clean==clean[::-1])
    for count in range(5):add('repeatText',[text,count],text*count)
for n in range(13):add('factorial',[n],math.factorial(n))
for n in list(range(1,65))+[1023,1024,1025,1048576]:add('halvingSteps',[n],n.bit_length()-1)
add('aliasTrace',[],[1,2,2,9])
# Heap-indexed trees: missing parent slots make their descendants unreachable.
trees=[[],[None],[0],[4,2,6,1,3,5,7],[4,2,6,None,3,None,7],[-2,-5,0,None,-3], [0,None,1,None,None,None,2], [4,None,6,99,99,5,7]]
for values in trees:
    reachable=[];pending=[(0,0)]
    while pending:
        i,d=pending.pop(0)
        if i>=len(values) or values[i] is None:continue
        reachable.append((i,d));pending.extend([(2*i+1,d+1),(2*i+2,d+1)])
    add('maxDepth',[values],max((d for _,d in reachable),default=-1))
    output=[];stack=[];index=0
    while stack or (index<len(values) and values[index] is not None):
        while index<len(values) and values[index] is not None:stack.append(index);index=2*index+1
        index=stack.pop();output.append(values[index]);index=2*index+2
    add('inOrder',[values],output)
    for target in range(-6,9):add('containsBST',[values,target],any(values[i]==target for i,_ in reachable))
for n in range(4):
    # Exhaust every directed graph on up to three vertices, including self loops.
    for mask in range(1<<(n*n)):
        graph=[[j for j in range(n) if mask & (1<<(i*n+j))]for i in range(n)]
        add('outDegrees',[graph],[len(row) for row in graph])
        for start in range(-1,n+1):
            visited=set();depth_order=[]
            def dfs(v):
                if v in visited:return
                visited.add(v);depth_order.append(v)
                for w in graph[v]:dfs(w)
            if 0<=start<n:dfs(start)
            add('dfsOrder',[graph,start],depth_order)
            frontier=[start] if 0<=start<n else [];seen=set(frontier);breadth_order=[]
            while frontier:
                breadth_order+=frontier;next_level=[]
                for v in frontier:
                    for w in graph[v]:
                        if w not in seen:seen.add(w);next_level.append(w)
                frontier=next_level
            add('bfsOrder',[graph,start],breadth_order)
for n in range(21):
    table=[0,1]
    while len(table)<=n+1:table.append(sum(table[-2:]))
    add('fibTable',[n],table[:n+1])
    add('fibMemoStats',[n],[table[n],1 if n<2 else n+1])
    if n<=15:add('fibCalls',[n],[table[n],2*table[n+1]-1])
for size in range(4):
    for coins in itertools.combinations(range(1,7),size):
        for amount in range(21):
            distance={0:0};queue=collections.deque([0])
            while queue:
                current=queue.popleft()
                for coin in coins:
                    nxt=current+coin
                    if nxt<=amount and nxt not in distance:distance[nxt]=distance[current]+1;queue.append(nxt)
            add('minimumCoins',[list(coins),amount],distance.get(amount,-1))
Path(__file__).with_name('cases.json').write_text(json.dumps(cases,separators=(',',':'))+'\n')
print('Independent concept cases',len(cases))
