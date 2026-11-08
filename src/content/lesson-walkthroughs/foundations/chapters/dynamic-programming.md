## Solve minimum coin count as a state recurrence

The example accepts positive integer denominations and a nonnegative target amount. Coins may be used repeatedly. With `[1, 3, 4]` and amount 6, it returns 2 by using two threes. A greedy choice of four followed by two ones would use three coins and miss the optimum.

State dp[a] is the minimum number of coins that make amount a. The base state dp[0] is zero. For every usable coin c, a candidate for dp[a] is dp[a − c] + 1, provided that preceding amount is reachable. Filling amounts upward makes each required smaller state available.

## Represent unreachable amounts explicitly

The table uses amount + 1 as an unreachable sentinel. Positive integer coins imply that any reachable answer needs at most amount coins, so this sentinel lies above the valid result range. The function returns −1 when the target remains unreachable. An empty denomination list still makes amount zero with zero coins.

For target A and k denominations, the implementation takes O(Ak) time and O(A) table space. Duplicate denominations repeat work but do not change the answer. Zero or negative denominations are outside the contract and should be rejected by a wrapper accepting untrusted data. Check `[2]` with target 3, the greedy counterexample, zero target, and no coins. To reconstruct the selected coins, retain a predecessor choice alongside each improved state.
