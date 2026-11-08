## Build the dependency table in order

The example returns the entire Fibonacci table through n. Input 5 produces `[0, 1, 1, 2, 3, 5]`. Each cell after the first two reads the two previous cells, both of which are already final. The loop invariant is that every earlier position contains its correct recurrence value.

For n = 0, the result contains only `[0]`. Initializing an unconditional two-element result would violate that contract. The examples handle this boundary before filling later cells. Inputs are nonnegative and bounded to avoid overflow in the fixed-width implementations.

## Match retained state to the requested result

Returning the full table requires O(n) output space. If the caller wanted only F(n), two rolling values could reduce retained recurrence state to O(1). That optimization would change what the function returns, so it is not a drop-in replacement for this example.

Bottom-up evaluation does O(n) additions and uses no recursive call chain. A top-down memoized version also does linear work here, but reaches states through calls and retains a cache. For a different state graph with many unreachable states, top-down evaluation might avoid table entries that an eager bottom-up pass would fill. Choose an order by examining dependencies and required states, then justify it. Merely replacing recursion with a loop does not establish that those dependencies are ready when read.
