Find a shortest route from the vertex named `base` to the vertex named `ship` in an unweighted adjacency map. Return the vertex names in route order, including both endpoints. If no route exists, return null rather than an empty route. Every referenced neighbor has an entry in the supplied graph, and the route follows the listed edge directions.

## Explore routes in increasing edge count

Breadth-first search uses a first-in, first-out queue. Start by enqueuing `base`. When removing a vertex, enqueue each neighbor that has not already been discovered. All vertices one edge from the start are discovered before vertices two edges away, and so on. The first discovery of a vertex therefore uses a shortest route to it.

Keep a predecessor map. Set the start's predecessor to an absence sentinel and record each newly discovered neighbor's predecessor as the current vertex. The map also serves as the discovered set. Record a neighbor before enqueueing it, so several incoming edges cannot add it to the queue repeatedly.

## Reconstruct one route

Suppose base connects to a and b, a connects to c, b connects to ship, and c also connects to ship. Breadth-first search discovers a and b at distance one. Processing b discovers ship at distance two, before the route through a and c can improve anything. Its predecessor chain is ship, b, base.

Follow that chain backward from ship until the start sentinel, collect the names, then reverse the collection. The result is `[base, b, ship]`. Keeping only a visited set would establish reachability but would lose the information needed to return the route. Storing a full route in every queue item is possible, but copies many shared prefixes.

## Preserve the shortest-route guarantee

The queue processes vertices in nondecreasing distance from base. When a vertex is first discovered from a distance-d predecessor, it gets distance d + 1. Any shorter predecessor would already have been processed and discovered it earlier. The recorded predecessor thus belongs to a shortest route.

Cycles do not break termination because each vertex is discovered once. A self-loop on base sees the existing start entry and adds nothing. If the queue empties without finding ship, every reachable vertex has been explored, proving that no route exists. Several equal-length routes may exist; adjacency order selects one unless the contract supplies a tie rule.

## Inspect the queue implementation's cost

The graph algorithm examines O(V + E) reachable vertices and edges when queue operations take amortized O(1) time. A queue implemented with front insertion or removal on an array can move all its elements on each operation, adding O(V²) work in a wide search. A head index, deque, or linked queue avoids that repeated shifting.

The queue and predecessor map use O(V) storage. Reconstructing a route costs time and output space proportional to its length. String-key hashing also depends on identifier lengths. The unweighted assumption matters: breadth-first search minimizes edge count, not a sum of arbitrary fuel costs or travel durations.

## Test reachability and route validity

Test a direct base-to-ship edge, an unreachable ship, a cycle, a self-loop, and a tempting longer route listed before a shorter one. Include branching paths with a shared destination to check discovery-time deduplication. Verify that every adjacent pair in the returned route is an edge and that the endpoints are correct.

For generated checks, compute shortest distances independently and require the returned route length to equal the minimum distance plus one. If exact output order is required, make the shortest route unique or specify the tie behavior. A weighted follow-up needs an algorithm such as Dijkstra's for nonnegative weights; changing the queue order alone without distance relaxation does not establish correctness.
