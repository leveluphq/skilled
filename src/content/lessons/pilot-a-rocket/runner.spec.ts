import { defineSpec } from 'utils/shared/runner/spec';

// Every satellite id a test mentions is a key of the graph (with [] when it
// links nowhere), since looking up a missing key behaves differently per language.
export default defineSpec({
  kind: 'function',
  entry: 'pilotRocket',
  params: [{ name: 'satellites', type: 'map<string,string[]>' }],
  // The shortest path from base to ship, or null when the ship can't be reached
  // (null and [] are different answers)
  returns: 'string[]?',
  tests: [
    {
      description: 'empty',
      args: [{ base: [], ship: [] }],
      expected: null,
    },
    {
      description: 'simple path',
      args: [{ base: ['sat0'], sat0: ['ship'], ship: [] }],
      expected: ['base', 'sat0', 'ship'],
    },
    {
      description: 'path with cycle',
      args: [
        {
          base: ['sat0'],
          sat0: ['base', 'sat1', 'sat3', 'sat4'],
          sat1: ['sat0', 'sat2'],
          sat2: ['sat1', 'sat3', 'sat4'],
          sat3: ['sat0', 'sat2', 'sat4'],
          sat4: ['sat0', 'sat2', 'sat3', 'sat5'],
          sat5: ['sat4', 'ship'],
          ship: [],
        },
      ],
      expected: ['base', 'sat0', 'sat4', 'sat5', 'ship'],
    },
    {
      description: 'no valid path',
      args: [
        {
          base: ['sat0'],
          sat0: ['sat1', 'sat3', 'sat4'],
          sat1: ['sat2'],
          sat2: ['sat3', 'sat4'],
          sat3: ['sat4'],
          sat4: ['sat2'],
          sat5: ['ship'],
          ship: [],
        },
      ],
      expected: null,
    },
  ],
});
