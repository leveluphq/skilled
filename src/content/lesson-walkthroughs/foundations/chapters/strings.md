## Repeat a value and count the actual output

The example repeats a complete string a nonnegative number of times. Repeating `ab` three times gives `ababab`; repeating it zero times gives an empty string. If the input contains an emoji or a combining character sequence, this operation repeats that sequence intact. It does not need to decide where individual user-perceived characters begin.

That distinction keeps the example's contract narrow. A separate task such as reversing visible characters requires an explicit text model: bytes, code points, or grapheme clusters. A repetition function should not be used as evidence that every indexing operation has the same Unicode behavior across these languages.

## Account for construction strategy

Let m be the size of one copy in the representation used by the language and k be the repeat count. The returned text occupies O(mk) space, and constructing its contents requires O(mk) copying work. Versions retaining k references before joining add O(k) temporary storage and loop work, including when m is zero. Implementations here use an appropriate repetition operation, builder, or growable buffer. Repeatedly copying a growing immutable prefix can do more work than the final output size suggests.

The example assumes k is nonnegative and small enough for the result to fit in memory. Test an empty string, zero repetitions, one repetition, line breaks, and multibyte text. If accepting arbitrary external requests, put a product-specific bound on output size before allocating it. A valid integer can still request an impractically large string.
