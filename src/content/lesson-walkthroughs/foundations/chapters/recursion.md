## Follow the return path for factorial

The example uses factorial to expose the call stack: factorial(4) waits for 4 × factorial(3), which waits for 3 × factorial(2), which waits for 2 × factorial(1). Returning one at the base case lets those suspended multiplications complete in reverse order. factorial(0) is also one by the function's contract.

Each call reduces n by one, so a nonnegative integer eventually reaches a base case. Removing that progress step, or starting with a negative number without a rejection policy, invalidates the termination argument. The published example assumes integer inputs from zero through twelve so its results also fit the signed 32-bit integer implementations shown alongside it.

## Include stack frames in the cost

There are O(n) calls and O(n) simultaneously active frames in the recursive version. The result is one integer, but that does not make auxiliary storage constant. An iterative accumulator could use constant additional storage for this same recurrence.

Testing only factorial(4) would miss a wrong zero base case. Check zero, one, and the upper supported boundary as well as a few intermediate results. Languages differ in overflow behavior and integer precision, so “works for every number” would be an unsupported extension. For larger exact results, change the numeric representation and reassess the cost of arithmetic. The [recursion visualizer](/tools/recursion-call-stack) is useful for comparing a single recursive chain with branching recursive calls.
