## Trace discovery by layers

For `[[1, 2], [3], [3], []]` and start 0, the example returns `[0, 1, 2, 3]`. It marks a neighbor visited when enqueueing it. When vertex 2 also sees vertex 3, that mark prevents a second enqueue, even though 3 has not necessarily been processed yet.

The queue holds vertices discovered earlier ahead of vertices discovered later. Starting from one vertex in an unweighted graph, this processes reachable vertices in nondecreasing edge distance. If you need actual distances or paths, store a distance or parent at that first discovery; the returned order alone is not a path to every vertex.

## Test queue order and discovery timing

An invalid start returns an empty result. The graph otherwise assumes valid neighbor identifiers. Include an isolated vertex, a cycle, a shared descendant, self-loops, and disconnected components. Repeated adjacency entries should not repeat a vertex in the output.

Traversal with an on-demand visited set takes O(Vr + Er) time over the reachable subgraph, assuming efficient queue operations. Versions initializing a visited array for every vertex add O(V) time and storage up front. The queue, visited state, and returned order use O(Vr) space. Some versions advance a cursor over a growable array; others use a deque. Repeatedly shifting the front of a contiguous array would add avoidable movement. Replacing this queue with a stack would also change discovery order and remove the shortest-layer argument.
