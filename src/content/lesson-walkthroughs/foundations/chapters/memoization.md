## Count distinct solved states

The example returns the Fibonacci value and the number of states actually computed. For input 4, it returns `[3, 5]`: states 0 through 4 are each computed once. For input 0 or 1, only the requested base state is computed, so the state count is one.

A cache lookup must distinguish “not stored” from a stored value of zero. F(0) is zero and is a perfectly valid cached answer. A truthiness check would treat it as missing in some languages. The examples use presence checks or explicit optional results instead.

## Keep the cache lifetime visible

A new cache is created for each top-level call. Calling the function twice therefore repeats its O(n) preparation, rather than sharing process-wide state. A global cache would need a different lifetime, memory, and concurrency discussion.

For n at least two, the function solves n + 1 distinct states. With fixed-width arithmetic, the total work and retained cache are O(n), and the recursive stack is O(n). Memoization removes duplicate subtrees but does not remove stack depth. A large n can still overflow the host stack or numeric range.

Test the base states and a small value with overlapping branches. Compare the state count with the naive call count to show what was saved. A correct final Fibonacci number alone cannot prove that memoization is effective; an implementation that recomputes every state might return the same value.
