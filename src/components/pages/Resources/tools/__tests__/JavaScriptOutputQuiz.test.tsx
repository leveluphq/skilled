import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ThemeProvider from 'components/context/ThemeProvider';
import { outputQuestions } from 'utils/shared/javascriptOutputQuiz';
import JavaScriptOutputQuiz from '../JavaScriptOutputQuiz';

it('locks checked answers, explains a wrong output, scores a round, and retries only missed snippets', () => {
  render(
    <ThemeProvider>
      <JavaScriptOutputQuiz />
    </ThemeProvider>,
  );
  expect(screen.getByRole('button', { name: 'Check output' })).toBeDisabled();
  for (const [index, question] of outputQuestions.entries()) {
    const choice = question.choices.find((item) =>
      index === 0 ? item.id !== question.answer : item.id === question.answer,
    )!;
    expect(screen.getByLabelText('JavaScript snippet')).toHaveTextContent(
      question.code.replace(/\s+/g, ' '),
    );
    const group = screen.getByRole('group', { name: 'What is logged?' });
    const accessibleName = (name: string) =>
      name.replace(/\s+/g, ' ') === choice.output.replace(/\s+/g, ' ');
    fireEvent.click(within(group).getByRole('radio', { name: accessibleName }));
    fireEvent.click(screen.getByRole('button', { name: 'Check output' }));
    expect(within(group).getByRole('radio', { name: accessibleName })).toBeDisabled();
    const feedback = screen.getByRole('region', {
      name: index === 0 ? 'Trace the execution again.' : 'Correct output.',
    });
    expect(feedback).toHaveAttribute('aria-live', 'polite');
    expect(within(feedback).getByText(question.explanation)).toBeInTheDocument();
    if (index === 0)
      expect(within(feedback).getByText('Your choice: ' + choice.reason)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {
        name: index + 1 === outputQuestions.length ? 'See results' : 'Next snippet',
      }),
    );
  }
  expect(screen.getByRole('status')).toHaveTextContent('11 of 12 correct');
  fireEvent.click(screen.getByRole('button', { name: 'Retry missed snippets' }));
  expect(screen.getByRole('heading', { name: 'Output question 1 of 1' })).toHaveFocus();
  const first = outputQuestions[0];
  const correct = first.choices.find((choice) => choice.id === first.answer)!;
  fireEvent.click(
    within(screen.getByRole('group', { name: 'What is logged?' })).getByRole('radio', {
      name: correct.output,
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Check output' }));
  fireEvent.click(screen.getByRole('button', { name: 'See results' }));
  expect(screen.getByRole('status')).toHaveTextContent('1 of 1 correct');
  expect(screen.queryByRole('button', { name: 'Retry missed snippets' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Start all snippets again' }));
  expect(screen.getByRole('heading', { name: 'Output question 1 of 12' })).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Check output' })).toBeDisabled();
});

it('keeps the complete snippet and explanation reference readable without completing a round', () => {
  render(
    <ThemeProvider>
      <JavaScriptOutputQuiz />
    </ThemeProvider>,
  );
  const summary = screen.getByText('Read all 12 snippets, outputs, and explanations');
  const reference = summary.closest('details')!;
  fireEvent.click(summary);
  for (const question of outputQuestions) {
    expect(reference).toHaveTextContent(question.code.replace(/\s+/g, ' '));
    expect(within(reference).getByText(question.explanation)).toBeInTheDocument();
    for (const choice of question.choices.filter((item) => item.id !== question.answer))
      expect(reference).toHaveTextContent(choice.reason);
  }
});
