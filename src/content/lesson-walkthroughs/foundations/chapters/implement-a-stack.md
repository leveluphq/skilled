## Trace the top link through a push and pop

Push 4, then 9. The top node contains 9 and points to the earlier node containing 4. Pop returns 9 and replaces top with that earlier link. The next pop returns 4 and leaves an absent top. A later push must create a fresh valid stack without depending on the old nodes.

The linked implementation needs one endpoint because every operation uses the top. This differs from a queue, which needs access to both insertion and removal ends for constant-time operations. The node field named `prev` points toward the older stack entry.

## Separate a returned node from a returned payload

Most versions return a node from peek and pop; Rust returns an optional integer. Neither policy permits a valid zero to mean empty. Tests normalize the observed payload while still checking the structural state. A consumer retaining a returned node may also retain the older chain if links remain attached.

Push, peek, and pop use O(1) structural work and O(n) retained node storage for n entries. Check empty peek/pop, one push/pop, repeated payloads, alternating operations, and draining then refilling. Also verify that peek does not remove the entry. A linked stack exposes pointer updates clearly, although a native growable array is often simpler when a product only needs stack behavior.
