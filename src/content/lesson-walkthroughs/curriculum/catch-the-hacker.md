Find the email address that occurs most often in the input. The lesson assumes a unique most frequent address, so ties do not need a policy. Addresses are compared as the supplied strings. For `['a@x.test', 'b@x.test', 'a@x.test', 'c@x.test', 'a@x.test']`, return `'a@x.test'`.

## Count identities instead of comparing positions

A nested search can count each address by scanning the whole list again, but repeated addresses repeat the same work. A frequency table stores the count for each distinct address. Read an address, create a zero count if needed, and increment its count. The table's keys are email strings, and its values are occurrence counts.

After any prefix of the input, each table entry equals the number of appearances of that key in the prefix. An update affects exactly the incoming key, so it preserves all other counts. Once the scan ends, the table contains enough information to answer the question without revisiting the original list.

## Choose the largest completed count

Scan the table entries while keeping a current winning address and its count. Replace the winner only when an entry has a larger count. Every skipped entry has count no greater than the retained winner, so after the final entry the retained address has the greatest frequency.

For the example, the completed counts are three for `a@x.test` and one each for the other addresses. The answer is independent of whether the winning address appears first, last, or in scattered positions. A shortcut based on adjacent duplicates fails when its copies are separated by other addresses.

## Separate the promise from a majority vote

Most frequent does not necessarily mean more than half of the input. A list can contain four copies of one address and three copies each of two others. Four is the unique maximum, although it is less than half of ten. A majority-vote algorithm requires a stronger promise, or a verification pass and additional reasoning.

The unique-maximum promise also explains why table iteration order does not affect the result. If you remove that promise, specify a tie rule before coding. First encountered, lexicographically smallest, and arbitrary tied winner are different contracts. Updating on `>=` instead of `>` can change the winner under a tie without solving that ambiguity.

## Treat input text consistently

Do not lowercase, trim, or otherwise normalize addresses unless the contract asks for that behavior. Normalization changes which strings count as equal. This task is a counting exercise over supplied identifiers, not an email-delivery validation system. The table must preserve those exact identifiers through counting and return the original winning string.

A general string-keyed implementation should use a real map or a dictionary with safe key semantics. Some languages' ordinary objects have inherited property names. Valid email-shaped inputs avoid many such collisions, but a reusable counter over arbitrary strings should not rely on that accident. Also avoid sorting the input merely to group copies when a count table is sufficient.

## Complexity and useful tests

For n addresses and u distinct keys, the table stores O(u) entries. Counting and finding the maximum take expected O(n + u) table operations. If string lengths vary, include hashing and equality work: the scan must read the characters in the keys. The shorthand O(n) assumes key handling has an appropriate bounded or amortized cost.

Test one address, an address with every copy adjacent, a winner spread across the whole list, and a winner that first appears last. Add the four-versus-three-versus-three example to reject an unjustified majority shortcut. For generated tests, create a unique largest frequency deliberately, shuffle the copies, and compare with a separately sorted frequency list. A streaming follow-up can update the current winner during counting, avoiding the final table scan while retaining the same table storage.
