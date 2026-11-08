import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'sumDigits',
  // `n` rather than `number`: Number/number is a type name in several languages
  params: [{ name: 'n', type: 'int' }],
  returns: 'int',
  tests: [
    { description: 'handles one number', args: [1], expected: 1 },
    { description: 'handles 0', args: [0], expected: 0 },
    { description: 'simple input', args: [123], expected: 6 },
    { description: 'handles 0s in the middle', args: [50201], expected: 8 },
    { description: 'handles trailing 0s', args: [200], expected: 2 },
  ],
});
