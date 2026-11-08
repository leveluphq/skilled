/**
 * When a lesson's tests run on the server, the Tests tab lists them read-only:
 * each input by its parameter name, and the answer expected.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { LessonSpec } from 'utils/shared/runner/types';
import SpecTests, { runnerSpecFor } from '../SpecTests';

const renderTests = (spec: LessonSpec) =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <SpecTests spec={spec} />
    </ThemeProvider>,
  );

describe('SpecTests', () => {
  it("lists a function's tests by parameter name", () => {
    const { container } = renderTests({
      kind: 'function',
      entry: 'firstBadVersion',
      params: [{ name: 'n', type: 'int' }],
      hidden: [{ name: 'badVersion', type: 'int' }],
      returns: 'int',
      tests: [{ description: 'last item is bad', args: [10], hidden: [10], expected: 10 }],
    });

    expect(screen.getByText('last item is bad')).toBeInTheDocument();
    expect(container.querySelector('li pre')?.textContent).toBe(
      'n = 10\nbadVersion = 10\nexpected: 10',
    );
  });

  it("lists a class's tests as the calls made and what each returns", () => {
    const { container } = renderTests({
      kind: 'design',
      className: 'MaxMinStack',
      ctor: [],
      methods: [],
      tests: [
        {
          description: 'tracks the max',
          ops: [['push', 3], ['getMax']],
          expected: [null, 3],
        },
      ],
    } as any);

    expect(screen.getByText('tracks the max')).toBeInTheDocument();
    expect(container.querySelector('li pre')?.textContent).toBe(
      'new MaxMinStack()\npush(3) -> null\ngetMax() -> 3',
    );
  });
});

describe('runnerSpecFor', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it('finds the spec of a lesson on the new runner', () => {
    process.env.CODE_RUNNER = 'docker';

    expect(runnerSpecFor('reverse-a-linked-list')).toMatchObject({ entry: 'reverseLinkedList' });
  });

  it('has nothing for a lesson without a spec, or without a slug', () => {
    process.env.CODE_RUNNER = 'docker';

    expect(runnerSpecFor('not-a-lesson')).toBeNull();
    expect(runnerSpecFor('constructor')).toBeNull();
    expect(runnerSpecFor(undefined)).toBeNull();
  });

  it('has nothing for a Judge0 lesson not yet moved to the new runner', () => {
    process.env.CODE_RUNNER = 'judge0';
    process.env.RUNNER_V2_LESSONS = 'count-islands';

    expect(runnerSpecFor('reverse-a-linked-list')).toBeNull();
    expect(runnerSpecFor('count-islands')).not.toBeNull();
  });
});

describe('SpecTests notation', () => {
  const functionSpec = (
    params: { name: string; type: string }[],
    returns: string,
    args: unknown[],
  ) =>
    ({
      kind: 'function',
      entry: 'solve',
      params,
      returns,
      tests: [{ description: 'one', args, expected: [] }],
    }) as LessonSpec;

  it('explains how lists are shown only for lessons that use them', () => {
    renderTests(functionSpec([{ name: 'head', type: 'ListNode?' }], 'ListNode?', [[1, 2]]));

    expect(screen.getByText(/A linked list is shown as an array/)).toBeInTheDocument();
    expect(screen.queryByText(/cycleIndex/)).not.toBeInTheDocument();
    expect(screen.queryByText(/A tree is shown/)).not.toBeInTheDocument();
  });

  it('explains cycleIndex when a test has a list with a loop', () => {
    renderTests(
      functionSpec([{ name: 'head', type: 'ListNode' }], 'bool', [
        { values: [1, 2], cycleIndex: 0 },
      ]),
    );

    expect(
      screen.getByText(/cycleIndex is the node the last one links back to/),
    ).toBeInTheDocument();
  });

  it('explains how trees are shown for lessons that use them', () => {
    renderTests(functionSpec([{ name: 'root', type: 'BinaryNode?' }], 'int', [[1, null, 2]]));

    expect(
      screen.getByText(/A tree is shown as an array of its values level by level/),
    ).toBeInTheDocument();
  });

  it('says nothing about lists or trees for other lessons', () => {
    renderTests(functionSpec([{ name: 'matrix', type: 'int[][]' }], 'int[]', [[[1]]]));

    expect(screen.queryByText(/linked list|tree is shown/)).not.toBeInTheDocument();
  });
});
