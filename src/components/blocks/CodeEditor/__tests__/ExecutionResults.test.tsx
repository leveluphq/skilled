/**
 * ExecutionResults renders whatever the Judge0 sandbox returned. The failure
 * details (expected vs. actual) are the whole point of the pane, so they must be
 * rendered for failing cases and kept out of the way for passing ones.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { Results, ErrorMessage, Initial, CompileError, RunProblem } from '../ExecutionResults';

const renderResults = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={themeMap[ThemeNames.Dark]}>{ui}</ThemeProvider>);

describe('Results', () => {
  const passing = { passed: true, description: 'returns the sum', expected: 3, userAnswer: 3 };
  const failing = { passed: false, description: 'handles negatives', expected: -1, userAnswer: 5 };

  it('marks each assertion as passed or failed', () => {
    renderResults(<Results results={[passing, failing]} />);

    expect(screen.getByText(/returns the sum/)).toHaveTextContent('returns the sum ----- passed');
    expect(screen.getByText(/handles negatives/)).toHaveTextContent(
      'handles negatives ----- failed',
    );
  });

  it('shows expected vs. actual only for the assertions that failed', () => {
    renderResults(<Results results={[passing, failing]} />);

    expect(screen.getByText('Your Answer: 5')).toBeInTheDocument();
    expect(screen.getByText('Expected: -1')).toBeInTheDocument();
    expect(screen.queryByText('Your Answer: 3')).not.toBeInTheDocument();
  });

  it('JSON-stringifies non-primitive answers so objects are readable', () => {
    renderResults(
      <Results
        results={[
          { passed: false, description: 'returns a list', expected: [1, 2], userAnswer: { a: 1 } },
        ]}
      />,
    );

    expect(screen.getByText('Your Answer: {"a":1}')).toBeInTheDocument();
    expect(screen.getByText('Expected: [1,2]')).toBeInTheDocument();
  });

  it('renders undefined answers rather than dropping the row', () => {
    // JSON.stringify(undefined) is undefined, so React renders nothing for the
    // value - the label still has to be there or a failing test looks blank.
    renderResults(
      <Results
        results={[
          { passed: false, description: 'returns nothing', expected: 1, userAnswer: undefined },
        ]}
      />,
    );

    expect(screen.getByText('Your Answer:')).toBeInTheDocument();
    expect(screen.getByText('Expected: 1')).toBeInTheDocument();
  });

  it('renders console logs above the assertions when the sandbox captured any', () => {
    renderResults(<Results results={[passing]} logs="hello from console.log" />);

    expect(screen.getByText('hello from console.log')).toBeInTheDocument();
  });

  it('omits the log and error blocks when they are empty strings', () => {
    // `!!logs` means an empty string must not render an empty box.
    const { container } = renderResults(<Results results={[passing]} logs="" err="" />);

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild!.tagName).toBe('OL');
  });

  it('appends stderr after the assertions when the run also errored', () => {
    renderResults(<Results results={[failing]} err="ReferenceError: x is not defined" />);

    expect(screen.getByText('ReferenceError: x is not defined')).toBeInTheDocument();
  });

  it('renders an empty list rather than crashing when there are no assertions', () => {
    const { container } = renderResults(<Results results={[]} logs="only the logs" />);

    // the list shell survives (so logs/stderr still have somewhere to sit) but
    // carries no rows
    expect(container.querySelector('ol')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(0);
    expect(screen.getByText('only the logs')).toBeInTheDocument();
  });
});

describe('ErrorMessage', () => {
  it('quotes the runner error for the viewer', () => {
    renderResults(<ErrorMessage message="SyntaxError: unexpected token" />);

    expect(screen.getByText('There was an error running your code:')).toBeInTheDocument();
    expect(screen.getByText('"SyntaxError: unexpected token"')).toBeInTheDocument();
  });

  it('shows the captured logs alongside the error when there are any', () => {
    renderResults(<ErrorMessage message="boom" logs="partial output" />);

    expect(screen.getByText('partial output')).toBeInTheDocument();
  });

  it('does not render a log paragraph when logs are null', () => {
    const { container } = renderResults(<ErrorMessage message="boom" logs={null} />);

    expect(container.querySelectorAll('p')).toHaveLength(2);
  });
});

describe('CompileError', () => {
  it('shows the compiler output as preformatted text, keeping its line breaks', () => {
    const output = "script.ts(2,1): error TS1005: '}' expected.\nscript.ts(4,3): error TS1128";
    const { container } = renderResults(<CompileError output={output} />);

    expect(screen.getByText("Your code didn't compile:")).toBeInTheDocument();
    expect(container.querySelector('pre')!.textContent).toBe(output);
  });

  it('still says the code did not compile when the compiler printed nothing', () => {
    const { container } = renderResults(<CompileError output="" />);

    expect(screen.getByText("Your code didn't compile:")).toBeInTheDocument();
    expect(container.querySelector('pre')).toBeNull();
  });
});

describe('RunProblem', () => {
  it('shows the title, the explanation and any printed output', () => {
    renderResults(
      <RunProblem title="Time limit exceeded" detail="Look for an infinite loop." logs="step 1\nstep 2" />,
    );

    expect(screen.getByText('Time limit exceeded')).toBeInTheDocument();
    expect(screen.getByText('Look for an infinite loop.')).toBeInTheDocument();
    expect(screen.getByText(/step 1/).tagName).toBe('PRE');
  });

  it('leaves out the output block when nothing was printed', () => {
    const { container } = renderResults(<RunProblem title="Something went wrong" detail="Try again." />);

    expect(container.querySelector('pre')).toBeNull();
  });
});

describe('Initial', () => {
  it('prompts the viewer to run their code', () => {
    renderResults(<Initial />);

    expect(screen.getByText('Run your code and see results here...')).toBeInTheDocument();
  });
});
