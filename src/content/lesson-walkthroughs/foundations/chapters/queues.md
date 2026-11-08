## Preserve first-in, first-out order

The example enqueues every input value and then drains the queue. For `[6, 2, 6]`, the output is `[6, 2, 6]`. The repeated six is a separate queue entry each time; equal payloads do not collapse into one item. An empty input produces an empty result.

The implementation varies with the host language. A deque or linked queue offers a direct front-removal operation. An array-backed example can instead advance a head cursor, avoiding a full shift on every removal. Advancing that cursor does not itself release earlier array entries, so an indefinitely growing service queue would need a compaction or ring-buffer policy.

## Include the cost of draining the queue

With constant-time queue operations, filling and draining n entries takes O(n) time. The queue and returned list together use O(n) storage. Repeated front removal from a contiguous array may require moving the remaining suffix and turn draining into O(n²) work.

Test one item, repeated values, negative values, and the empty stream. The complete queue implementation lesson adds the more revealing lifecycle check: remove the last item, enqueue again, and verify that both endpoint references describe the new queue. Queue order also matters in [breadth-first search](/course/breadth-first-search), where a stack would produce a different traversal and would not establish unweighted shortest-path layers.
