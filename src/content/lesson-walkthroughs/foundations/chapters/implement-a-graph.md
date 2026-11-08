## Follow a directed and an undirected edge

Create vertices A, B, and C. In directed mode, adding A → B stores B in A's adjacency list only. In undirected mode, it also stores A in B's list. Removing B deletes its own list and filters B from every remaining list, including incoming directed edges.

This implementation stores adjacency entries in lists, so duplicate edges are preserved. In undirected mode, adding a self-loop appends twice to the same list. Those are consequences of the shown representation, not a claim that every graph API chooses the same policies.

## Establish preconditions before mutation

Add each vertex once before adding edges. Calling addVertex again replaces that vertex's existing adjacency list in these teaching versions. Some languages also create or tolerate missing endpoint entries differently, so missing vertices are outside the shared cross-language contract. A product API should choose and enforce one policy explicitly.

With ordinary map assumptions, adding a vertex and appending an edge have expected or amortized constant structural cost. Removing a vertex scans remaining adjacency lists, for O(V + E) work. Storage is O(V + E), counting every stored adjacency entry. Tests include directed edges, reciprocal edges, repeated edges, self-loops, and removal of a vertex with both incoming and outgoing edges. Compare adjacency counts by vertex rather than relying on hash-map iteration order.
