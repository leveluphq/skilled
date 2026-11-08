Remove the node k positions from the end of a singly linked list, counting the tail as position zero. For `10 -> 20 -> 30 -> 40`, k = 0 removes 40, k = 1 removes 30, and k = 3 removes 10. If k is at least the list length, return the original list unchanged. Inputs use nonnegative k.

## Find the predecessor without knowing the length

A two-pass solution first counts the nodes and then walks to the target's predecessor. That is O(n) time and constant auxiliary space, and is a useful baseline. Two pointers let us find the same predecessor during one forward traversal after an initial offset.

Start lead and follow at the head. Advance lead k + 1 links, returning the original head if lead becomes null before completing those advances. The extra one positions follow at the predecessor of the node to delete once lead reaches the tail. The gap is measured in links, so draw actual nodes before deciding whether an offset of k or k + 1 matches the later stopping condition.

## Distinguish head removal from an invalid offset

If lead becomes null exactly after the k + 1 advances, the target is the head. Return `head.next`. For a four-node list and k = 3, those four advances end exactly at null, so removing the head is valid. For k = 4, the algorithm discovers null before completing the fifth advance, so it returns the list unchanged.

For k = 1, lead first advances two links, from 10 to 30. Move both pointers until lead is the tail. They then point to 20 and 40. The target is follow's next node, 30. Assign follow's next link to the node after 30, reconnecting 20 directly to 40.

## Prove that the gap identifies the target

After initialization, lead is k + 1 links ahead of follow. Moving both one link preserves that distance. When lead is at the final node, there are exactly k nodes after follow's next node. Therefore follow's next node is the one whose zero-based distance from the end is k.

The head-removal case needs a separate return because no ordinary predecessor exists before the head. A dummy node is an alternative design that supplies such a predecessor. Whichever form you choose, the caller must assign the returned head. Ignoring it makes a correct head deletion appear to have failed.

## Mutation and ownership

The reference-based versions relink the existing chain. They do not shift data values between nodes. That preserves the meaning of the remaining node identities, although an external reference to the removed node can still exist. Ownership-based implementations must detach and move the relevant links without leaving multiple mutable owners.

The scan takes O(n) time. The usual pointer version uses O(1) auxiliary space. Read the language implementation's allocation choices before extending that claim: a version that materializes all values or clones a suffix has a different storage cost. The input is assumed acyclic so forward traversal eventually reaches null.

## Tests and adaptations

Test every valid k for a small list, k equal to its length, and a much larger k. Include an empty list, removing the only node of a singleton, removing a tail, and removing the head. Repeated values prevent a test from accidentally identifying the target by value instead of position.

For an independent oracle, convert the original list to an array and remove index `length - 1 - k` only when that index is valid. Compare the resulting sequence and check that no cycle was introduced. If a caller instead numbers positions from one, translate that input once at the boundary. Mixing the two conventions inside the pointer loop usually produces an off-by-one deletion.
