## Count integer halvings precisely

The example repeatedly divides a positive integer by two, discarding the fractional part, until the value is at most one. For 13, the visited values are 13, 6, 3, and 1, so the answer is three steps. For one, the answer is zero. The exact count for a positive integer n is floor(log₂ n).

This loop is O(log n) time and O(1) additional storage under fixed-width arithmetic. The loop count is not n/2: that expression describes only the size after one reduction. Successive reductions multiply their effects, which is why powers of two provide useful boundaries.

## Keep the rounding rule tied to the algorithm

Check 7, 8, and 9. Their counts are two, three, and three. A process that rounds each division upward has a different exact count, even though it also has logarithmic growth. Binary search likewise needs an interval definition before you can count its exact comparisons.

The example accepts positive integers and does not compute a floating-point logarithm. That avoids rounding near powers of two and makes the progress condition visible. Zero and negative inputs belong outside this contract; a caller that accepts arbitrary data should validate them. When explaining O(log n), say what shrinks, by what factor, and when it stops. Naming the logarithm alone does not explain why the loop terminates.
