## Verify links in both directions

The complete example here is a doubly linked list with a nonempty constructor, prepend, and append. Starting at 5, prepend 2 and append 9. Forward traversal should read `[2, 5, 9]`; backward traversal should read `[9, 5, 2]`. Length should be three, the head's previous link absent, and the tail's next link absent.

On prepend, retain the old head before replacing it. Connect the new head forward to the old head, then connect the old head backward to the new one. Append performs the corresponding endpoint updates. Checking only forward traversal can miss a broken previous link.

## Describe the API that is actually provided

The constructor creates one node. This excerpt does not implement an empty-list constructor, removal, or indexed insertion. The main lesson develops additional operations separately. Calling this a complete general-purpose list library would overstate what the shown class supports.

Each prepend and append changes a fixed number of links, for O(1) structural work and one new allocation. Traversal takes O(n), and nodes occupy O(n) storage. Shared forward and backward ownership can form a retention cycle; Swift uses weak previous links and Rust uses Weak for that reason. Check several alternating prepends/appends, repeated payloads, both traversal directions, and the length. Compare node identity when verifying reciprocal links, because equal values can hide references to the wrong node.
