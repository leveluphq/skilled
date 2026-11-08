## Count outgoing adjacency entries

The example accepts a list of neighbor lists and returns each vertex's out-degree. For `[[1, 2], [2], []]`, the answer is `[2, 1, 0]`. Vertex identifiers are the integer positions of the outer list. An empty neighbor list is a real isolated or sink vertex; an absent outer entry would mean something else.

Parallel edges count separately because each is an adjacency entry. A self-loop contributes one outgoing entry in this directed representation. An undirected graph usually records each ordinary edge in both endpoint lists, so summing all degrees counts those stored representations rather than the number of unique undirected edges.

## Choose a representation for the operation

Reading each list's stored length takes O(V) time in these examples and returns O(V) integers. It does not traverse every neighbor simply to count it. Other graph operations, including traversal and vertex removal, must inspect more of the adjacency data and often take O(V + E).

Test no vertices, one isolated vertex, a self-loop, and duplicate edges. The examples assume neighbor identifiers refer to existing positions when a traversal actually follows them. Deciding whether to reject, skip, or create missing vertices belongs in an external-input contract. For an implementation that mutates graphs, also decide whether repeated vertex insertion preserves or replaces its existing adjacency list.
