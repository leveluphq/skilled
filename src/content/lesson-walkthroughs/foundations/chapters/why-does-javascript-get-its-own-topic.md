## Validate a runtime value at a boundary

The example accepts an unknown value and returns a finite score between zero and one hundred, or null. The number 8 passes; the string `"8"` does not. Zero is valid. NaN, infinity, negative values, and values above one hundred are rejected.

This is a small model for handling JSON, form input, or another runtime boundary. TypeScript can describe the value after checking it, but it cannot make a string arriving over a network become a number. A type assertion alone would not validate or convert that data.

## Keep conversion separate from acceptance

If a product should accept numeric strings, add an explicit parsing contract. Decide what an empty string means, whether whitespace is allowed, and whether partial strings such as `8points` should pass. Calling a conversion function without stating those choices can accidentally accept inputs that the interface meant to reject.

The function performs a fixed number of checks and uses O(1) time and storage for its number/primitive contract. That simplicity makes the behavior easy to enumerate. Test zero, both range endpoints, a decimal, a numeric string, null, an object, NaN, and infinity. TypeScript's `unknown` parameter forces the implementation to narrow before arithmetic; the JavaScript version relies on the same executable checks. Both have the same runtime acceptance policy.
