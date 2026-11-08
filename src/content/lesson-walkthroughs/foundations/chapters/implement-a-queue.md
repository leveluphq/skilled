## Trace the final removal and the next insertion

Enqueue 4 and 9. First points to 4, last points to 9, and the first node's link reaches 9. Dequeue returns 4 and advances first. Dequeue again returns 9 and must clear both endpoints. A new enqueue of 6 should then create a valid singleton queue with first and last referring to that same node.

The code calls the link toward a newer item `prev`. Follow its actual direction when reading the snippet: dequeue advances from the oldest entry toward the next oldest. Renaming the field in a sketch is harmless only if every update still follows the same representation.

## Check absence independently of payload values

Peek and dequeue return an absent result for an empty queue. Most versions expose nodes; the Rust version returns the stored integer. The reading examples explain that return-type difference. A payload of zero is valid and cannot be used as an empty sentinel.

Enqueue, peek, and dequeue perform O(1) structural work. Retained queue storage is O(n). An exposed removed node can still refer to later nodes in some versions, so holding it may retain more of the chain; a production API might return only a value or detach that link. Check empty reads, FIFO order, repeated values, and several empty/refill cycles. Endpoint invariants are as important as the sequence returned by one short run.
