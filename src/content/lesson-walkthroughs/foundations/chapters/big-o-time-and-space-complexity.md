## Analyze a result that grows quadratically

The example returns every nonempty suffix of its input. For `[2, 5, 9]`, the result is `[[2, 5, 9], [5, 9], [9]]`. The outer loop runs three times, but each iteration copies a different number of values. For n inputs, the number of copied values is n + (n − 1) + ... + 1, or n(n + 1)/2.

That sum gives O(n²) time and O(n²) returned storage. Counting only the outer loop would miss the copy inside it. Calling the result “constant auxiliary memory” without discussing the returned arrays would also hide almost all the allocation. State explicitly whether your analysis includes output space.

## Separate an abstract bound from a measurement

The implementation creates independent suffix arrays, rather than views into one backing buffer. That choice makes later mutation of a result less surprising, but it is part of the cost. A view-based design would have a different ownership contract and could retain the original buffer.

Try inputs of length zero, one, and four. At length four, ten elements appear across the returned suffixes. Doubling n approaches four times the number of copies as n grows. Actual elapsed time also includes allocation, compilation, and runtime effects, so a single stopwatch result cannot prove a complexity class. Use the operation count to justify the bound, then measure when choosing between implementations with the same growth rate.
