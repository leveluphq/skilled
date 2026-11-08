## Preserve last-in, first-out order

The example pushes the input values and drains the stack. For `[6, 2, 6, 9]`, the result is `[9, 6, 2, 6]`. Equal values remain separate entries. The output is a reversed sequence because the final inserted item is always the next one removed.

An array's append and end-removal operations fit this access pattern well. A linked implementation can instead replace a single top reference. Both need an explicit empty-stack policy. The example checks emptiness before removing an element, so a valid zero or negative payload never doubles as an empty marker.

## Use a stack when pending work should resume in reverse order

A stack also models suspended work. Depth-first traversal pushes alternatives while following one branch, and a recursive call stack retains the work that must resume after a child returns. That relationship helps explain why replacing a recursive traversal with a queue changes its order.

Filling and draining n values takes O(n) time when each end operation is constant or amortized constant time. The retained entries and result use O(n) storage. Check empty, singleton, and repeated-value inputs. For an implementation with exposed nodes, also check that popping the final entry clears the top reference. A copied payload result and an exposed removed node have different ownership implications, even if both display the same value.
