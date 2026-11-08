## Understand the backing store used here

This teaching DynamicArray stores numeric positions in a map or object and tracks a separate logical length. It exposes shifting and index bookkeeping without managing a contiguous memory allocation or a growth capacity. It therefore does not demonstrate the amortized resize proof of a production vector. The native array concept example is the better place to compare host-language collection operations.

Push 4, 8, and 12, then insert 6 at position 1. Length becomes four and the right-to-left shift preserves the old suffix. Shifting left-to-right would overwrite a value before copying it. Removing position 2 then shifts the suffix left and deletes the obsolete final entry.

## State this API's boundaries

`insert` accepts an existing index only. It does not insert into an empty structure or append at length; use `push` for those operations. Removal returns the language's absent result for an invalid position. Retrieval policies vary: some versions return an optional/default value and others throw on a missing key; the language notes identify those differences. Rust uses unsigned indices, so a negative external index must be rejected before conversion.

Expected constant-time backing-map access gives expected O(1) get, push, and pop. Insert and remove take expected O(n) because of shifting. The store retains O(n) active entries. Check invalid indices, empty pop, first and last removal, and repeated drain/refill cycles. After removal, no old value should remain retrievable beyond the logical end. This last check catches stale backing entries even when the displayed length looks correct.
