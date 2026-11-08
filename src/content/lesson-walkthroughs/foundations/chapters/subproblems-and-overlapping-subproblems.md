## Count work in the naive Fibonacci recursion

The example returns both the Fibonacci value and the number of recursive invocations. With F(0) = 0 and F(1) = 1, computing F(4) returns `[3, 9]`. The value is three, but nine calls were needed because the same smaller states were recomputed along different branches.

The count includes the initial call and every base-case call. Its recurrence is C(n) = 1 + C(n − 1) + C(n − 2), with C(0) = C(1) = 1. That gives C(n) = 2F(n + 1) − 1. Counting only non-base calls would produce a different number.

## Identify state before introducing a cache

Each subproblem here is determined entirely by n. No partial path or external mutable state affects the answer. That makes n a sufficient cache key in the memoized version. In a grid or subsequence problem, one integer might be insufficient because different positions can share the same remaining length.

The naive recursion has exponential call growth and O(n) maximum stack depth. The published checks use small nonnegative inputs through fifteen so the example stays quick and its integer results fit every listed language. Test zero and one before tracing four. The [memoization lesson](/course/memoization) computes the same recurrence while retaining each solved state, making the difference in work measurable.
