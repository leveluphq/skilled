## Read the example's array representation carefully

The function uses heap-indexed slots: the children of position i are at 2i + 1 and 2i + 2. A null slot means there is no node at that position. This is not the compact queue serialization used by some interview platforms.

For `[8, 3, 10, null, 6]`, the root is 8, its left child is 3, and 3's right child is 6. The maximum edge depth is two. A singleton root has depth zero, and an empty tree has depth −1. A value placed below a null parent is unreachable and is ignored by the example's recursive traversal.

## Count reachable nodes and active recursion

For r reachable nodes and height h, the recursive visit uses O(r) calls and O(h) active stack frames. The input array may contain extra unreachable slots; the function does not scan every slot just to validate the representation. Building or validating a different external tree format would add its own cost.

Test an empty input, a null root with trailing values, a singleton, a skewed shape, and a complete small tree. Explicitly state whether height counts edges or nodes: both conventions exist, and a one-node test reveals the difference immediately. The node-based implementations in other lessons use references instead of numeric slots, but the same parent/child reachability rule applies.
