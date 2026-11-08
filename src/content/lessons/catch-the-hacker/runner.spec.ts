import { defineSpec } from 'utils/shared/runner/spec';

const HACKER = 'hey@skilled.dev';

export default defineSpec({
  kind: 'function',
  entry: 'findHackerEmail',
  params: [{ name: 'emails', type: 'string[]' }],
  returns: 'string',
  tests: [
    {
      description: 'handles valid input',
      args: [[HACKER, 'a@b.test', HACKER, HACKER, 'a@b.test', 'c@d.test', 'c@d.test']],
      expected: HACKER,
    },
    {
      description: 'the hacker is the last email in the list',
      args: [['a@b.test', 'c@d.test', 'c@d.test', HACKER, HACKER, HACKER]],
      expected: HACKER,
    },
    { description: 'only one email', args: [['solo@skilled.dev']], expected: 'solo@skilled.dev' },
    {
      description: 'the hacker is first and their copies are spread out',
      args: [[HACKER, 'a@b.test', HACKER, 'c@d.test', 'a@b.test', HACKER, 'c@d.test']],
      expected: HACKER,
    },
    {
      description: 'the hacker has only one more copy than the others',
      args: [
        [
          'a@b.test',
          HACKER,
          'c@d.test',
          'a@b.test',
          HACKER,
          'c@d.test',
          'a@b.test',
          HACKER,
          'c@d.test',
          HACKER,
        ],
      ],
      expected: HACKER,
    },
    {
      description: "another email's copies are next to each other",
      args: [['a@b.test', 'a@b.test', HACKER, 'c@d.test', HACKER, 'c@d.test', HACKER]],
      expected: HACKER,
    },
  ],
});
