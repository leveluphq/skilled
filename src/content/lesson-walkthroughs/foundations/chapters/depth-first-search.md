## Predict the order before running DFS

For adjacency lists `[[1, 2], [3], [3], []]` and start 0, the example returns `[0, 1, 3, 2]`. It uses an explicit stack and pushes neighbors in reverse listed order. The next pop therefore follows the first listed neighbor, matching the order of a recursive depth-first traversal.

A vertex is recorded when it is first popped. Already visited pops are skipped. This policy permits duplicate pending stack entries when different paths discover the same vertex, but each vertex's adjacency list is expanded once. A self-loop or cycle therefore cannot create endless traversal.

## Account for edges waiting on the stack

With a visited set created as needed, time is O(Vr + Er) for the reachable part of the graph. Versions initializing a visited array for the whole graph add O(V) time and storage up front. The visited set and returned order use O(Vr) space. This particular push-all-neighbors approach can retain O(Er) pending entries; an explicit stack of traversal frames can track recursive progress differently. Avoid calling every iterative DFS constant-space or automatically bounding its pending stack by the number of unique vertices.

An invalid start returns an empty result. Neighbor identifiers are assumed valid. Check a cycle, a diamond with a shared descendant, an isolated start, a self-loop, and a disconnected vertex. Traversal visits the start's reachable component only. To cover a whole disconnected graph, add an outer loop over unvisited starts and explain how that affects the result order.
