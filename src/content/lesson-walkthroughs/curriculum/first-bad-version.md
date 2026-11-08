Versions are numbered from 1 through n. A provided predicate reports whether a version is bad, and once a version is bad, every later version is bad too. At least one bad version exists. Return the smallest bad version using as few predicate calls as possible. For n = 8 with versions 5 through 8 bad, return 5.

## Search for a boundary

A linear scan can stop at the first bad version, but may make n calls. Monotonicity lets a single call rule out a large interval. If version m is good, every version through m is good. If m is bad, the first bad version lies at m or earlier.

Maintain inclusive bounds `low = 1` and `high = n`. The invariant is that the first bad version lies somewhere in that interval. While the bounds differ, evaluate the midpoint. A bad midpoint moves `high` to that midpoint. A good midpoint moves `low` to one past it. Keeping the bad midpoint is necessary because it may be the answer.

## Trace a search that keeps its answer

With n = 8 and first bad version 5, the interval begins at `[1, 8]`. Midpoint 4 is good, so the new interval is `[5, 8]`. Midpoint 6 is bad, leaving `[5, 6]`. Midpoint 5 is bad, leaving `[5, 5]`. The bounds meet at the answer.

Setting `high = midpoint - 1` after a bad result would discard version 5 in that final step. That update belongs to some exact-value searches, but a boundary search must preserve the candidate that satisfied its predicate. Similarly, setting `low = midpoint` after a good result can repeat the same two-element interval forever.

## Explain termination and correctness

Each iteration preserves the answer interval and strictly shortens it. When the midpoint is good, the answer must be larger. When it is bad, the answer cannot be larger than it. The loop stops only when the interval contains one version. Because the invariant still holds, that version must be the first bad one.

The first version may already be bad, and the last may be the only bad one. Both cases obey the same updates. No special case is needed for n = 1 under the promise that a bad version exists. If no bad version is possible, the contract needs a missing-answer result and the initialization or final validation must change.

## Use the provided predicate correctly

The lesson supplies `isBadVersion`, or the corresponding language-specific method. Its hidden test state determines the boundary. Do not define a replacement predicate inside the solution, hardcode the example boundary, or inspect hidden state. Some languages inherit the API from `VersionControl`; others receive a callable in the runner environment.

Compute the midpoint as `low + (high - low) / 2` using integer division or an explicit floor. The common `(low + high) / 2` can overflow in a bounded integer type even when each endpoint is valid. A floating midpoint also produces an invalid version identifier unless it is rounded appropriately.

## Costs and boundary tests

The interval shrinks by roughly half each time, giving O(log n) predicate calls and O(1) auxiliary storage. If the predicate is a network or storage operation, that call count is often more useful than counting arithmetic statements. No array of all versions is necessary.

Test n = 1, the first version bad, the last version bad, and boundaries immediately beside a midpoint. For generated tests, enumerate every possible first-bad position for many small n and compare with that chosen boundary. A follow-up can replace version status with a monotone capacity check, such as finding the smallest feasible batch size. The boundary invariant and candidate-preserving update remain the same.
