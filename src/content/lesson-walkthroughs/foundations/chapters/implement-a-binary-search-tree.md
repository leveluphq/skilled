## Use the implementation's duplicate rule

Insert 8, 3, 10, and 3. A smaller value follows the left link; every other value follows the right. The second 3 is therefore placed to the right of the first 3. In-order traversal yields `[3, 3, 8, 10]`, preserving the duplicate. Searching for 3 returns a matching node without promising which duplicate it identifies.

This insertion policy differs from an exercise that requires every key to be unique and bounds both subtrees strictly. In particular, use the separate validation lesson's stated contract before applying its checks to a tree built by this class.

## Relate insertion and search to shape

Both operations follow one downward path, taking O(h) time for height h. The class performs no rotations or balancing. Sorted input can build a chain with O(n) height, making a sequence of insertions quadratic overall. Calling it a binary search tree does not establish logarithmic worst-case operations.

The tree owns or retains O(n) nodes. Iterative search uses constant additional traversal state. Check empty search, root search, an absent value, duplicate insertion, and both increasing and decreasing insertion orders. The standalone code includes the BinaryNode definition so it can be compiled outside the course editor. Removal and balancing are outside this excerpt's API; adding either requires its own invariants and tests.
