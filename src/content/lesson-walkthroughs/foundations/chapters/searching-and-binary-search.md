## Search for the first occurrence

For the sorted input `[1, 3, 3, 3, 8]` and target 3, the example returns index 1. It computes a lower bound using a half-open interval `[low, high)`. Values before low are known to be too small. Values at or after high are outside the remaining candidates for the first position that could hold the target.

When the middle value is smaller than the target, low becomes middle + 1. Otherwise high becomes middle, keeping a matching middle value available while looking farther left. On termination low equals high. One final equality check distinguishes an actual match from an insertion position.

## Test interval edges and duplicate values

An empty input begins with both bounds at zero and returns −1 after the final guard. A target above every element produces an insertion position equal to the length, so indexing before checking that bound would be an error. Targets below the first element and repeated targets exercise the opposite boundary.

The function assumes the values are already sorted in ascending order. Sorting inside a wrapper changes both its cost and the meaning of the returned index. The search itself uses O(log n) comparisons and O(1) additional storage for random-access input. If you use a linked structure instead, reaching the middle is no longer a constant-time indexing operation. Keep that representation cost in the explanation.
