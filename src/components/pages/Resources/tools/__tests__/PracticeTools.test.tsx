import * as React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ThemeProvider from 'components/context/ThemeProvider';
import { defaultPlanOptions, buildStudyPlan, planStorageKey } from 'utils/shared/studyPlan';
import { patternQuestions } from 'utils/shared/patternQuiz';
import StudyPlanner from '../StudyPlanner';
import PatternQuiz from '../PatternQuiz';

beforeEach(() => window.localStorage.clear());
afterEach(() => jest.restoreAllMocks());

it('restores a saved planner without overwriting it first and keeps progress when rebuilding the same settings', () => {
  const options = { ...defaultPlanOptions, days: 3 };
  const id = buildStudyPlan(options).days[0].sessions[0].id;
  window.localStorage.setItem(
    planStorageKey,
    JSON.stringify({ version: 1, options, completed: [id] }),
  );
  render(
    <ThemeProvider>
      <StudyPlanner />
    </ThemeProvider>,
  );
  expect(screen.getByText('1 of 6 blocks marked complete.')).toBeInTheDocument();
  expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Build plan' }));
  expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
  expect(JSON.parse(window.localStorage.getItem(planStorageKey)!).completed).toEqual([id]);
});

it('retains the current schedule on invalid input and resets marks on an actual schedule change', () => {
  render(
    <ThemeProvider>
      <StudyPlanner />
    </ThemeProvider>,
  );
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  fireEvent.change(screen.getByLabelText('Study days (3–60)'), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Build plan' }));
  expect(screen.getByRole('alert')).toHaveTextContent('3 to 60');
  expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
  fireEvent.change(screen.getByLabelText('Study days (3–60)'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Minutes per study day'), { target: { value: '30' } });
  fireEvent.click(screen.getByRole('button', { name: 'Build plan' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  expect(screen.getByText('0 of 3 blocks marked complete.')).toBeInTheDocument();
  expect(screen.getByText(/This schedule leaves 14 topics/)).toBeInTheDocument();
});

it('remains usable when browser storage is unavailable', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  render(
    <ThemeProvider>
      <StudyPlanner />
    </ThemeProvider>,
  );
  expect(screen.getByText(/This browser cannot save progress/)).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('checkbox')[0]);
  expect(screen.getByText('1 of 28 blocks marked complete.')).toBeInTheDocument();
});

it('requires an answer, explains a wrong choice, and retries only the missed question', () => {
  render(
    <ThemeProvider>
      <PatternQuiz />
    </ThemeProvider>,
  );
  expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
  for (let index = 0; index < patternQuestions.length; index += 1) {
    const question = patternQuestions[index];
    const selected =
      index === 0
        ? question.choices.find((choice) => choice.id !== question.answer)!
        : question.choices.find((choice) => choice.id === question.answer)!;
    const group = screen.getByRole('group', { name: question.prompt, exact: true });
    fireEvent.click(within(group).getByRole('radio', { name: selected.title }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(within(group).getByRole('radio', { name: selected.title })).toBeDisabled();
    if (index === 0)
      expect(screen.getByText(`Your choice: ${selected.explanation}`)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {
        name: index + 1 === patternQuestions.length ? 'See results' : 'Next question',
      }),
    );
  }
  expect(screen.getByText('11 of 12 correct in this round.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Retry missed questions' }));
  expect(screen.getByRole('heading', { name: 'Question 1 of 1' })).toHaveFocus();
  const first = patternQuestions[0];
  fireEvent.click(
    within(screen.getByRole('group', { name: first.prompt, exact: true })).getByRole('radio', {
      name: first.choices.find((choice) => choice.id === first.answer)!.title,
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
  fireEvent.click(screen.getByRole('button', { name: 'See results' }));
  expect(screen.getByText('1 of 1 correct in this round.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry missed questions' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Start all questions again' }));
  expect(screen.getByRole('heading', { name: 'Question 1 of 12' })).toBeInTheDocument();
});
