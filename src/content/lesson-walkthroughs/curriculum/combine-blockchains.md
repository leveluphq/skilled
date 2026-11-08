Merge two nonempty singly linked chains whose timestamps are already sorted in ascending order. Return one chain containing every original timestamp in sorted order, including duplicates. For `[1, 4, 8]` and `[2, 4, 9]`, the merged values are `[1, 2, 4, 4, 8, 9]`. The blockchain framing does not require cryptographic operations; the task is sorted linked-list merging.

## Compare the two remaining heads

At any step, the smallest remaining timestamp must be at the head of one of the two unconsumed chains. Compare those heads, choose the smaller one, and advance only the chain that contributed it. There is no need to scan either chain to find another minimum because its own ordering already supplies that information.

The implementation first selects a result head and initializes a result tail to it. It then repeats the same selection while both chains still have nodes. Attach the selected node after the result tail, advance the contributing pointer, and move the tail to the node just attached. Keep the result head fixed throughout the traversal.

## Trace duplicate timestamps

For the example, choose 1 before 2, then choose 2 before 4. Both remaining heads now contain 4. Either can be chosen first because the required output is ordered by timestamp alone. After consuming one four, the other still remains at its chain's head and will also be attached.

Using a strict less-than comparison chooses from the second chain on a tie in several versions. That is a deterministic tie policy, but it does not promise stability across separate chains. If records carry an original global ordering that must be preserved, define that ordering explicitly and make the tie comparison reflect it.

## Attach an exhausted chain's remainder

Once one chain is empty, every node left in the other chain is already sorted. Its first node is no smaller than the current result tail, because the preceding selection chose the smallest available head. Connect that entire suffix to the result tail in one link assignment.

The invariant is that the result prefix is sorted and contains exactly the nodes already consumed from the two inputs. Choosing the minimum head preserves both properties. Attaching the sorted remainder finishes the result without dropping or duplicating any timestamp. Returning the moving tail would expose only the last node; return the fixed result head.

## Understand mutation and storage

The reference-based versions reuse nodes by changing their next links. A caller should regard the original chains as consumed by the merge. Rust's owned representation makes that transfer explicit by taking nodes from their input options and moving them into the result. Do not claim the original separate chains remain intact unless the implementation deliberately clones them.

For chain lengths n and m, time is O(n + m). Iterative relinking uses O(1) auxiliary link state. A recursive merge would use up to O(n + m) call frames. A version that creates replacement nodes instead of moving them needs O(n + m) new storage, so check the actual code when discussing a language adaptation.

## Exercise the boundaries

Use two singleton chains, one chain entirely before the other, alternating timestamps, equal timestamps across chains, and unequal chain lengths. Check that the output length is n + m and that its multiset of timestamps equals the union of the inputs. Traverse with a bound to detect accidental cycles.

The lesson's chosen solution assumes both initial heads exist. Supporting an empty input requires an early return of the other chain before reading either head's data. For a follow-up with k sorted chains, a heap can choose the smallest available head in O(log k) per node. Repeatedly scanning all k heads would add a linear factor in k.
