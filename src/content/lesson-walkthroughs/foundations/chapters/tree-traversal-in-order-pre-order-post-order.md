## Work through an in-order traversal

The example uses the same heap-indexed nullable slots as the tree-height example: left is 2i + 1 and right is 2i + 2. For `[8, 3, 10, null, 6]`, the returned order is `[3, 6, 8, 10]`. Visiting left, then node, then right produces that result. Moving the node visit before or after its child calls produces pre-order or post-order instead.

A null parent ends the branch. A later numeric slot does not become reachable merely because it exists in the array. This is a representation contract, so do not copy a compact breadth-first serialization into the function and assume the positions mean the same thing.

## Explain what the order guarantees

In-order traversal returns sorted values only when the tree satisfies the binary-search ordering rule. An arbitrary binary tree still has a valid in-order traversal, but its output need not be sorted. That distinction keeps traversal mechanics separate from tree invariants.

The function visits each reachable node once, for O(r) time, and returns O(r) values. Recursion contributes O(h) active frames for height h. A long chain can exhaust the host call stack even though the algorithm is linear. Include empty, singleton, left-only, right-only, and duplicate-payload shapes in your checks. Duplicates do not change how traversal follows links.
