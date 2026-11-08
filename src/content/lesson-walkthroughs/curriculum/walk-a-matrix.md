Return every value of a rectangular matrix in clockwise spiral order, starting at its top-left corner. For `[[1, 2, 3], [4, 5, 6], [7, 8, 9]]`, the order is `[1, 2, 3, 6, 9, 8, 7, 4, 5]`. Reading values in this order does not require rotating the matrix or marking its cells.

## Maintain four unvisited boundaries

Keep the first and last unvisited row and the first and last unvisited column. Initially those bounds describe the full matrix. Each pass walks the top edge left to right, the right edge top to bottom, the bottom edge right to left, and the left edge bottom to top. Move the corresponding boundary inward after walking an edge.

Moving the top boundary before walking the right edge prevents the top-right corner from being visited twice. Moving the right boundary before the bottom edge does the same for the bottom-right corner. The sequence of updates is part of the algorithm; treating all four edges as independent full-length walks repeats corners.

## Trace the shrinking rectangle

In the three-by-three example, the top walk emits 1, 2, 3 and moves the top boundary to row 1. The right walk emits 6, 9 and moves the right boundary to column 1. The bottom walk emits 8, 7 and moves the bottom boundary to row 1. The left walk emits 4 and moves the left boundary to column 1.

The remaining rectangle contains only 5. The next top walk emits it, and the updated bounds cross. The outer loop then stops. The output length is nine, matching the cell count. The same boundary representation also handles a non-square rectangle without changing direction logic.

## Guard the last row and column

After the top and right walks, there may be no bottom row left to visit. Check the row bounds before walking backward along it. Likewise, check the column bounds before walking upward along the left edge. A one-row input otherwise gets emitted forward and backward, and a one-column input can repeat its interior cells.

For `[[1, 2, 3, 4]]`, the top walk finishes all useful work. For `[[1], [2], [3]]`, the top walk emits 1 and the right walk emits 2 and 3. The remaining guards prevent a duplicate return trip. These narrow shapes expose mistakes that a square example can hide.

## Prove complete, unique visitation

Before a pass, the bounds contain exactly the cells not yet emitted. Each edge walk consumes an exposed edge of that rectangle, and its boundary update removes precisely those cells. Corner handling and the final-edge guards ensure those consumed regions do not overlap. Any remaining interior cells form the next smaller rectangle.

The process ends when no rows or columns remain. Every original cell has then been consumed exactly once. Total time is O(r × c), and boundary tracking uses O(1) auxiliary space. The returned sequence needs O(r × c) storage. There is no separate visited matrix, and the input cells are not changed.

## Check dimensions and adapt deliberately

The lesson assumes a rectangular matrix. Empty rows yield no values; an empty outer array must be checked before accessing its first row in languages that reject that access. Test both forms explicitly when supporting them. Ragged rows need a different contract because four rectangular bounds cannot describe their shape.

Test one cell, one row, one column, two-by-three, three-by-two, and an odd-sized square with a central cell. Use distinct cell values so repeated visits are visible. Compare output length with the cell count and use a direction-and-visited-set simulator as an independent oracle. A counterclockwise variant changes the edge order and start directions; it should preserve the same unvisited-region invariant.
