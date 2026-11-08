## Choose the second middle for an even-length list

The example builds a singly linked list from the supplied values and advances two runners. Slow moves one link per iteration; fast moves two. With `[10, 20, 30, 40]`, the result is 30, the second of the two middle values. With three values it is the ordinary middle. An empty input returns an explicit absent result.

The loop continues only while fast and its next link both exist. This guard makes the two-link step safe. Since the lists constructed here are acyclic, fast eventually reaches the end. Applying the same loop to a cyclic external list would need a different contract or cycle handling.

## Separate construction from traversal

Building n nodes takes O(n) time and storage. Traversing them to find the middle takes O(n) time and only a constant number of runner references. The entire function therefore allocates O(n); calling the whole example constant-space would omit its construction step.

Check lengths zero through four before trying larger inputs. These small cases establish the selected middle convention and the empty-list behavior. Values can repeat, because the runners follow node identity and links rather than comparing payload values. Native ownership choices differ: some versions use garbage-collected references, while others use owning nodes and borrowed traversal references. Those choices must preserve the same traversal without introducing an ownership cycle. For deletion or reversal practice, keep track of the link you still need before replacing it.
