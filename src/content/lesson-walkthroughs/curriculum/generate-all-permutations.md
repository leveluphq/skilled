Generate all positional permutations of an input string. Choose each character position as the next character, recursively permute the remaining positions, and prepend the chosen character to each returned suffix. The empty string produces a list containing one empty string. Repeated characters can produce repeated output strings because the selected implementation distinguishes positions.

## Choose a first position and recurse

For a string of length at least two, loop over its positions. At position i, save that character and build the remaining string by concatenating the prefix before i with the suffix after i. Recursively generate permutations of that remaining string. Append the chosen character to the front of each suffix result and collect every result.

Strings of length zero or one have exactly one positional arrangement, so return a one-element list containing the input. The empty-string base case is also the identity needed by the recurrence: choosing the final character must combine with one empty suffix, rather than with no suffixes at all.

## Expand a three-character example

For `abc`, choose a first and permute `bc`, obtaining `bc` and `cb`. That contributes `abc` and `acb`. Choosing b leaves `ac`, contributing `bac` and `bca`. Choosing c leaves `ab`, contributing `cab` and `cba`. The final list contains six strings.

Every result begins with exactly one selected input position. Within that branch, the recursive result orders all remaining positions. This partitions positional permutations into disjoint first-position choices and proves completeness by induction. The implementation's traversal order determines its output order, but the course comparator accepts the permutation collection without requiring that order.

## Decide what duplicates mean

For `aa`, choosing the first a and choosing the second a each produce `aa`. The output therefore contains two identical strings. A set would collapse those occurrences and change the contract from positional permutations to distinct text permutations. Tests and explanations must agree about which result is required.

To generate only distinct strings, one can count character frequencies and recurse by choosing a character with a remaining positive count. That avoids creating duplicate branches in the first place. Generating every positional permutation and deduplicating afterward still pays for the repeated work and can require a large additional set.

## Count the output before optimizing

There are n! positional permutations of n characters. Materializing each length-n result requires at least O(n × n!) total character output. The recursive implementation also slices remaining strings and concatenates prefixes, so copying is part of its cost. Claiming O(n!) time without accounting for string length hides required output work.

The result occupies O(n × n!) character storage. Recursion depth is O(n), with additional temporary strings and intermediate result lists. The exact peak allocation depends on the language's string representation and collection lifetimes. A generator can reduce retained output storage for a streaming consumer, but it cannot avoid emitting the factorial number of results.

## Keep character semantics explicit

The course examples use simple character strings. Byte indexing, UTF-16 indexing, Unicode scalar iteration, and grapheme-cluster iteration do not identify the same units for arbitrary Unicode text. Go's byte slices and JavaScript's indexed strings are therefore not a general user-visible-character contract. Define the unit before extending the implementation to emoji or combining sequences.

Test empty, one character, two distinct characters, three distinct characters, and repeated characters. Verify each output's length and character multiset, and compare output multiplicities with an independent positional-index permutation oracle. A useful follow-up asks for the next lexicographic permutation or the kth permutation; those tasks can avoid materializing every preceding arrangement when their ordering contract is specified.
