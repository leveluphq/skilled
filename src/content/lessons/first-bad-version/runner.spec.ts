import { CodingLanguage } from 'utils/constants/lesson';
import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'firstBadVersion',
  params: [{ name: 'n', type: 'int' }],
  // The first bad version for each test, which only isBadVersion knows
  hidden: [{ name: 'badVersion', type: 'int' }],
  // The API the learner's code calls. Python sees is_bad_version and bad_version.
  injected: {
    name: 'isBadVersion',
    baseClass: 'VersionControl',
    params: [{ name: 'version', type: 'int' }],
    returns: 'bool',
    body: {
      [CodingLanguage.Javascript]: 'return version >= badVersion;',
      [CodingLanguage.Python]: 'return version >= bad_version',
      [CodingLanguage.Rust]: 'return version >= bad_version;',
    },
  },
  returns: 'int',
  tests: [
    { description: 'only one version', args: [1], hidden: [1], expected: 1 },
    { description: 'first item is bad', args: [10], hidden: [1], expected: 1 },
    { description: 'last item is bad', args: [10], hidden: [10], expected: 10 },
    { description: 'item between first and last', args: [100], hidden: [42], expected: 42 },
    { description: 'exact middle item', args: [3], hidden: [2], expected: 2 },
    // Last, because a midpoint of (lo + hi) / 2 overflows 32-bit ints here and
    // can loop until the CPU limit (Java, C#, Kotlin)
    {
      description: 'billions of versions',
      args: [2126753390],
      hidden: [1702766719],
      expected: 1702766719,
    },
  ],
  // So an overflowing midpoint fails fast
  limits: { cpuTimeLimit: 2 },
});
