## Follow one insertion through the example

Start with `[4, 8, 12]`, an insertion index of `1`, and a new value of `6`. The result should be `[4, 6, 8, 12]`. The prefix before index 1 stays in place. The original suffix moves one position right. The example constructs a separate result, so the caller still owns an unchanged three-element input after the function returns.

Its contract accepts positions from zero through the input length, including insertion after the last element. That differs from the course's small map-backed DynamicArray, whose `insert` method accepts existing positions only. Use `push` to append in that implementation. A shared operation name does not guarantee identical boundary behavior.

## Count copying and check the boundaries

Copying the input and making room for the new value costs O(n) time and O(n) returned storage. An insertion at the beginning moves the largest suffix; an insertion at the end still copies the input in this particular function. Neither case is constant time merely because an array index is involved.

Test an empty input, both endpoints, repeated values, and negative numbers. Check the original array afterward as well as the returned value. If you replace this function with an in-place operation, explain that changed mutation contract before comparing its memory use. The [array operation reference](/reference/data-structure-time-complexity) helps separate indexed access from operations that shift elements.
