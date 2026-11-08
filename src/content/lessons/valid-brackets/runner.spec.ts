import { defineSpec } from 'utils/shared/runner/spec';

export default defineSpec({
  kind: 'function',
  entry: 'hasValidBrackets',
  // `s` rather than `string`: string is a type name in most languages
  params: [{ name: 's', type: 'string' }],
  returns: 'bool',
  tests: [
    { description: 'empty input', args: [''], expected: true },
    { description: 'simple brackets', args: ['()'], expected: true },
    { description: 'close before open', args: ['}{'], expected: false },
    { description: 'sequence of brackets', args: ['{}[]()'], expected: true },
    { description: 'complex valid series', args: ['{[{[([])]}][{}]()}'], expected: true },
    { description: 'overlapping brackets', args: ['([)]'], expected: false },
    { description: 'missing closing bracket', args: ['([]'], expected: false },
    { description: 'no closing brackets', args: ['([{'], expected: false },
    { description: 'ignore non-bracket characters', args: ['(abc123[321]{1}42)'], expected: true },
    { description: 'only a closing bracket', args: [')'], expected: false },
    { description: 'extra closing bracket', args: ['())'], expected: false },
  ],
});
