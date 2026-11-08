import * as React from 'react';
import specs from 'content/runnerSpecs.gen';
import { LessonSpec } from 'utils/shared/runner/types';
import { usesNewRunner } from 'utils/shared/runner/settings';
import { formatValue } from 'utils/shared/runner/values';
import { OutputText, SpecTestsSection } from './styles';

// The lesson's tests, when they run on the server (the new runner). Lessons
// still on the old runner show their editable test code instead.
export const runnerSpecFor = (slug?: string): LessonSpec | null =>
  slug && Object.prototype.hasOwnProperty.call(specs, slug) && usesNewRunner(slug, true)
    ? specs[slug]
    : null;

const show = (value: unknown) => {
  const text = formatValue(value);
  return text.length > 1000 ? `${text.slice(0, 1000)}…` : text;
};

// Every type the learner's code is given or returns
const typesIn = (spec: LessonSpec) =>
  spec.kind === 'function'
    ? [...spec.params.map((param) => param.type), spec.returns]
    : [
        ...spec.ctor.map((param) => param.type),
        ...spec.methods.flatMap((method) => [
          ...method.params.map((param) => param.type),
          method.returns,
        ]),
      ];

const SpecTests: React.FC<{ spec: LessonSpec }> = ({ spec }) => {
  const types = typesIn(spec).join(' ');
  const hasCycles = JSON.stringify(spec.tests).includes('"cycleIndex"');

  return (
    <SpecTestsSection>
      <p>These are the tests your code runs against when you click Run Code.</p>
      {types.includes('ListNode') && (
        <p>
          A linked list is shown as an array of its values, from the head.
          {hasCycles &&
            ' In a list with a loop, cycleIndex is the node the last one links back to.'}
        </p>
      )}
      {/BinaryNode\b/.test(types) && (
        <p>
          A tree is shown as an array of its values level by level, left to right, with null where a
          child is missing.
        </p>
      )}
      <ol>
        {spec.kind === 'function'
          ? spec.tests.map((test, i) => (
              <li key={`${i}-${test.description}`}>
                <strong>{test.description}</strong>
                <OutputText>
                  {[
                    ...spec.params.map((param, j) => `${param.name} = ${show(test.args[j])}`),
                    ...(spec.hidden || []).map(
                      (param, j) => `${param.name} = ${show((test.hidden || [])[j])}`,
                    ),
                    `expected: ${show(test.expected)}`,
                  ].join('\n')}
                </OutputText>
              </li>
            ))
          : spec.tests.map((test, i) => (
              <li key={`${i}-${test.description}`}>
                <strong>{test.description}</strong>
                <OutputText>
                  {[
                    `new ${spec.className}(${(test.ctorArgs || []).map(show).join(', ')})`,
                    ...test.ops.map(
                      ([name, ...args], j) =>
                        `${name}(${args.map(show).join(', ')}) -> ${show(test.expected[j])}`,
                    ),
                  ].join('\n')}
                </OutputText>
              </li>
            ))}
      </ol>
    </SpecTestsSection>
  );
};

export default SpecTests;
