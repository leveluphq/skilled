## Return a sorted copy with a clear mutation contract

The example turns `[4, -1, 4, 2]` into `[-1, 2, 4, 4]` while leaving the caller's input unchanged. Its first obligation is preserving the multiset: every original value appears the same number of times. Its second is ordering each adjacent pair. Checking just the first and last values does not establish either property.

Each language uses a standard numeric sorting operation and an explicit copy or value-semantic result. JavaScript and TypeScript pass a numeric comparator; their default array sort compares string representations and would place 10 before 2. The example uses integers, so subtraction is an adequate comparator within the supported range.

## Separate library use from sorting-algorithm practice

This function demonstrates an application-facing sorting contract. It does not implement merge sort or promise that every runtime uses the same algorithm. Library guarantees about stability, worst-case comparisons, and temporary storage should be read in the documentation for the specific operation and version.

Include already sorted, reverse-sorted, empty, singleton, all-equal, and negative-valued inputs. Freeze or compare the input afterward to catch accidental mutation. The copied result requires O(n) storage before any internal sorting workspace is considered. When an interview asks for a particular sorting algorithm, explain its partition or merge invariant and use the library result as a test oracle, rather than treating this wrapper as that implementation.
