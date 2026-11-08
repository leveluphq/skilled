/**
 * RunnerResults shows a submission judged by the new runner: one row per test,
 * the reason a run stopped in plain words, and compile errors that move the
 * editor to the line they point at.
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import RunnerResults, { RunnerResultsData, RunnerTest } from '../RunnerResults';

const renderResults = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={themeMap[ThemeNames.Dark]}>{ui}</ThemeProvider>);

const runnerTest = (overrides: Partial<RunnerTest> = {}): RunnerTest => ({
  description: 'adds two numbers',
  status: 'passed',
  expected: 3,
  actual: 3,
  logs: '',
  ms: 1,
  ...overrides,
});

const results = (overrides: Partial<RunnerResultsData> = {}): RunnerResultsData => ({
  version: 2,
  tests: [],
  problem: null,
  problemDetail: null,
  ...overrides,
});

describe('RunnerResults', () => {
  it('marks each test as passed or failed, with the answers only for failures', () => {
    renderResults(
      <RunnerResults
        results={results({
          tests: [
            runnerTest(),
            runnerTest({
              description: 'handles negatives',
              status: 'failed',
              expected: -1,
              actual: [5, 6],
            }),
          ],
        })}
      />,
    );

    expect(screen.getByText(/adds two numbers/)).toHaveTextContent('adds two numbers ----- passed');
    expect(screen.getByText(/handles negatives/)).toHaveTextContent(
      'handles negatives ----- failed',
    );
    expect(screen.getByText('Your Answer: [5,6]')).toBeInTheDocument();
    expect(screen.getByText('Expected: -1')).toBeInTheDocument();
    expect(screen.queryByText('Your Answer: 3')).not.toBeInTheDocument();
  });

  it('shows big integers without their tag', () => {
    renderResults(
      <RunnerResults
        results={results({
          tests: [
            runnerTest({ status: 'failed', expected: { $int: '9007199254740993' }, actual: 1 }),
          ],
        })}
      />,
    );

    expect(screen.getByText('Expected: 9007199254740993')).toBeInTheDocument();
  });

  it("shows a test's error and what it printed", () => {
    renderResults(
      <RunnerResults
        results={results({
          tests: [
            runnerTest({
              status: 'error',
              error: 'TypeError: x is not a function (line 3)',
              logs: 'got here\n',
            }),
          ],
        })}
      />,
    );

    expect(screen.getByText(/adds two numbers/)).toHaveTextContent('error');
    expect(screen.getByText('TypeError: x is not a function (line 3)')).toBeInTheDocument();
    expect(screen.getByText('got here')).toBeInTheDocument();
  });

  it('explains a time-out and names the tests that never ran', () => {
    renderResults(
      <RunnerResults
        results={results({
          problem: 'timed_out',
          tests: [
            runnerTest({ status: 'timeout' }),
            runnerTest({ description: 'second', status: 'not_run' }),
          ],
        })}
      />,
    );

    expect(screen.getByText('Time limit exceeded')).toBeInTheDocument();
    expect(screen.getByText(/adds two numbers/)).toHaveTextContent('ran out of time');
    expect(screen.getByText(/second/)).toHaveTextContent('not run');
  });

  it('shows the error output when the code crashed before any test ran', () => {
    renderResults(
      <RunnerResults
        results={results({
          problem: 'crashed_before_tests',
          tests: [runnerTest({ status: 'not_run' })],
        })}
        stderr={'SyntaxError: Unexpected token\n'}
      />,
    );

    expect(screen.getByText('Your code crashed before the tests ran')).toBeInTheDocument();
    expect(screen.getByText('SyntaxError: Unexpected token')).toBeInTheDocument();
  });

  it('uses the detail the runner gave when the problem has none of its own', () => {
    renderResults(
      <RunnerResults
        results={results({ problem: 'crashed', problemDetail: 'Segmentation fault' })}
      />,
    );

    expect(screen.getByText('Your code crashed')).toBeInTheDocument();
    expect(screen.getByText('Segmentation fault')).toBeInTheDocument();
  });

  describe('when the runner itself failed', () => {
    const env = process.env.CODE_RUNNER;

    afterEach(() => {
      process.env.CODE_RUNNER = env;
    });

    const failed = results({
      problem: 'runner_error',
      problemDetail: "Docker isn't running. Start it, then run your code again.",
    });

    it('says why when code runs locally in Docker, as the learner runs the app too', () => {
      process.env.CODE_RUNNER = 'docker';
      renderResults(<RunnerResults results={failed} />);

      expect(
        screen.getByText("Docker isn't running. Start it, then run your code again."),
      ).toBeInTheDocument();
    });

    it("says why with the system runner, as the learner runs the app too", () => {
      process.env.CODE_RUNNER = 'system';
      renderResults(
        <RunnerResults
          results={results({
            problem: 'runner_error',
            problemDetail: "Python isn't installed, or isn't on your PATH as python3.",
          })}
        />,
      );

      expect(
        screen.getByText("Python isn't installed, or isn't on your PATH as python3."),
      ).toBeInTheDocument();
    });

    it("keeps Judge0's errors to itself", () => {
      process.env.CODE_RUNNER = 'judge0';
      renderResults(<RunnerResults results={failed} />);

      expect(screen.getByText(/Please try again in a moment/)).toBeInTheDocument();
      expect(screen.queryByText(/Docker/)).not.toBeInTheDocument();
    });
  });

  it('still says something for a problem it does not know', () => {
    renderResults(<RunnerResults results={results({ problem: 'something_new' })} />);

    expect(screen.getByText('Your code stopped')).toBeInTheDocument();
  });

  it("doesn't repeat the run's explanation on the test the program stopped in", () => {
    renderResults(
      <RunnerResults
        results={results({
          problem: 'crashed',
          problemDetail: 'Exited with error status 3',
          tests: [runnerTest({ status: 'crashed', error: 'Exited with error status 3' })],
        })}
      />,
    );

    expect(screen.getAllByText('Exited with error status 3')).toHaveLength(1);
  });

  it("shows the compiler's output when none of it could be placed on a line", () => {
    renderResults(
      <RunnerResults
        results={results({ problem: 'compile_error' })}
        compileOutput="Compilation time limit exceeded."
        diagnostics={[]}
      />,
    );

    expect(screen.getByText('Compilation time limit exceeded.')).toBeInTheDocument();
  });

  it('lists compile errors by line, and moves the editor to the one clicked', () => {
    const onSelectLine = jest.fn();

    renderResults(
      <RunnerResults
        results={results({ problem: 'compile_error' })}
        compileOutput="script.ts(7,3): error TS2304: Cannot find name 'x'."
        diagnostics={[
          { line: 7, column: 3, message: "Cannot find name 'x'." },
          { line: null, column: null, message: 'Something without a place' },
        ]}
        onSelectLine={onSelectLine}
      />,
    );

    expect(screen.getByText("Your code didn't compile:")).toBeInTheDocument();
    expect(screen.getByText('Something without a place')).toBeInTheDocument();
    // The raw output counts lines from the top of the whole program
    expect(screen.queryByText(/script\.ts/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Line 7, column 3' }));

    expect(onSelectLine).toHaveBeenCalledWith(7, 3);
  });

  it('shows compile error lines as text when the editor cannot move', () => {
    renderResults(
      <RunnerResults
        results={results({ problem: 'compile_error' })}
        diagnostics={[{ line: 2, column: null, message: 'expected ;' }]}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
  });
});
