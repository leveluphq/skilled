## Search by eliminating one subtree at a time

For the heap-indexed tree `[8, 3, 10, 1, 6, null, 14]`, a search for 6 compares with 8, follows the left child to 3, and then follows the right child to 6. A search for 7 reaches an absent child and returns false. The function assumes that the supplied tree already satisfies the ordering contract.

The example stores children at positions 2i + 1 and 2i + 2, with null slots marking missing nodes. A null root is an empty tree. Slots beneath an absent parent are unreachable. This representation is useful for a small worked example; it is not a recommendation for storing a very sparse production tree.

## Relate the cost to height

Each comparison follows at most one child, giving O(h) time for height h and O(1) additional storage in the iterative implementation. A balanced tree makes h logarithmic in its node count. A chain makes h linear. The search function does not rebalance the input or verify all ordering constraints first.

Check the root, both extreme values, an absent value between existing keys, an empty tree, and a singleton. The complete insertion lesson allows equal keys on the right. The separate [validate BST exercise](/course/binary-search-tree-validate) uses its own stricter validation contract; read that contract before sharing duplicate-handling assumptions across the two tasks.
