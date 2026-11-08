## Force a collision to test the implementation

Construct a table with a positive bucket count of one. Insert `ab` → 4 and `ba` → 9. Both keys must land in the same bucket. Looking up either key must compare stored keys inside the bucket; the bucket index alone cannot identify a pair. Inserting `ab` again updates its value while preserving `ba`.

Removing `ab` should return its previous value and leave `ba` readable. A second removal returns an absent result. These operations exercise the collision chain more thoroughly than inserting several keys into conveniently different buckets.

## Keep the teaching hash separate from production requirements

The example adds character values modulo a fixed bucket count. It exposes indexing and separate chaining, but it is easy to collide deliberately and does not resize. With a long bucket, operations become linear in the number of stored pairs, plus the cost of hashing and comparing the key. Expected constant-time lookup needs assumptions about distribution and load; it is not guaranteed by the class name.

Use a positive size, string keys, and integer values for the cross-language trace. Native string iteration units differ, so do not expect identical Unicode bucket indices in every version. That does not affect key/value correctness within one version. Test updates, colliding removals, missing keys, and values of zero. Zero must remain distinguishable from absence.
