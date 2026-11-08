## Match each operation to its result

For `[-2, 0, 3, 1]`, the example returns doubled values `[-4, 0, 6, 2]`, positive values `[3, 1]`, and a first positive value of 3. It also reports zero membership, whether every value is nonnegative, and whether any value is negative. None of these operations mutates the dense input array.

An empty input produces empty mapped and filtered arrays. Every is true because there is no failing element; some is false because there is no satisfying element. Find returns undefined when there is no match, which this wrapper converts to null with a nullish fallback.

## Keep the wrapper's assumptions visible

The example accepts dense finite-number arrays. Sparse arrays introduce method-specific hole behavior; this page does not treat holes as explicit undefined values. Object arrays would also require a decision about whether returned elements share their original objects, because map and filter do not automatically deep-clone them.

Each full pass is O(n), so a fixed number of these calls is still O(n) time. Map and filter return O(n) storage in the worst case. Find, some, and every can stop early, but their worst case still examines the whole input. Includes correctly finds a zero at any position. Avoid a truthiness-based replacement that mistakes index zero or a valid zero value for absence.
