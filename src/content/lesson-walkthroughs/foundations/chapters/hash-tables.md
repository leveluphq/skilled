## Trace frequency updates without losing input order

For `[7, 3, 7, 7]`, the example builds a frequency map and then returns `[3, 1, 3, 3]`. Each result position reports the total count of the value at the same input position. It is not a list of unique keys or an iteration over the map's entries. The second pass over the original input makes that ordering explicit.

After processing the first three values, the map contains 7 → 2 and 3 → 1. Reading the final 7 must retrieve its existing count before storing 3. Creating a fresh count of one on every visit would turn every result into one and discard the work already done.

## Distinguish expected performance from a guarantee

With expected constant-time map operations, the two passes take O(n) expected time. The map stores O(u) distinct keys, where u is the number of unique input values, and the returned list uses O(n) storage. Hashing, equality, collisions, and resizing belong to the implementation behind that expected bound.

Use an empty input, all-equal values, alternating values, zero, and negative keys as checks. A missing key and a stored zero are different states; this algorithm stores only positive counts, but your lookup logic should still make its default policy readable. The [hash table implementation lesson](/course/implement-a-hash-table) makes collisions visible by storing multiple key/value pairs in a bucket.
