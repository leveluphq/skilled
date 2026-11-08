import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ThemeProvider from 'components/context/ThemeProvider';
import SortingComparison from '../SortingComparison';
import LinkedListPointers from '../LinkedListPointers';
import RecurrenceExplorer from '../RecurrenceExplorer';
import SpacedReview from '../SpacedReview';
import InterviewRehearsal from '../InterviewRehearsal';
import EdgeCasePractice from '../EdgeCasePractice';
import fs from 'fs';
import path from 'path';

const mount = (component: React.ReactElement) => render(<ThemeProvider>{component}</ThemeProvider>);
beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('retains the last valid sort after invalid input and resets the trace when changing methods', () => {
  mount(<SortingComparison />);
  fireEvent.click(screen.getByRole('button', { name: 'Show result' }));
  expect(screen.getByText('Sorted result')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Input values'), { target: { value: '1,,2' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply input' }));
  expect(screen.getByRole('alert')).toHaveTextContent('comma-separated');
  expect(screen.getByText('Sorted result')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Method'), { target: { value: 'selection' } });
  expect(screen.getByText('Initial input')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Input values'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Apply input' }));
  expect(screen.getByText('The array is empty.')).toBeInTheDocument();
});

it('traces a self-cycle and supports an empty linked list without invalid pointer targets', () => {
  mount(<LinkedListPointers />);
  fireEvent.change(screen.getByLabelText('Number of nodes'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'cycle' } });
  fireEvent.click(screen.getByRole('button', { name: 'Show result' }));
  expect(screen.getByText('Pointers meet: a cycle exists')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Number of nodes'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Show result' }));
  expect(screen.getByText('Fast reaches null: no cycle exists')).toBeInTheDocument();
});

it('changes recurrence methods without retaining an unrelated step and preserves the answer', () => {
  mount(<RecurrenceExplorer dynamic />);
  fireEvent.click(screen.getByRole('button', { name: 'Show result' }));
  expect(screen.getByText('Final result: 5')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Evaluation method'), { target: { value: 'tabulated' } });
  expect(screen.getByText('Set ways(0) = 1: one empty sequence')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show result' }));
  expect(screen.getByText('Return 5')).toBeInTheDocument();
});

it('requires an answer before checking and reveals a concrete counterexample explanation', () => {
  mount(<EdgeCasePractice />);
  expect(screen.getByRole('button', { name: 'Check reasoning' })).toBeDisabled();
  fireEvent.click(screen.getByLabelText('[2, 7], target 9'));
  fireEvent.click(screen.getByRole('button', { name: 'Check reasoning' }));
  expect(screen.getByRole('status')).toHaveTextContent('index 0');
  fireEvent.click(screen.getByRole('button', { name: 'Next question' }));
  expect(screen.getByRole('button', { name: 'Check reasoning' })).toBeDisabled();
});

it('does not overwrite stored reviews on mount and keeps a new review after reload', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-22T12:00:00Z'));
  const key = 'skilled-pattern-review-v1';
  localStorage.setItem(
    key,
    JSON.stringify({ 'signed-subarray': { level: 2, due: Date.now() + 86400000 } }),
  );
  const first = mount(<SpacedReview />);
  expect(screen.getByText('11 of 12 cards are due or new.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reveal explanation' }));
  fireEvent.click(screen.getByRole('button', { name: 'Recalled it; schedule review' }));
  expect(screen.getByText('10 of 12 cards are due or new.')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(key)!)['signed-subarray'].level).toBe(2);
  first.unmount();
  mount(<SpacedReview />);
  expect(screen.getByText('10 of 12 cards are due or new.')).toBeInTheDocument();
  fireEvent.click(screen.getByText('View or clear the local schedule'));
  fireEvent.click(screen.getByRole('button', { name: 'Clear review schedule' }));
  expect(screen.getByText('12 of 12 cards are due or new.')).toBeInTheDocument();
});

it('keeps review usable when local storage is unavailable', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  mount(<SpacedReview />);
  expect(screen.getByRole('status')).toHaveTextContent('will not be saved');
  fireEvent.click(screen.getByRole('button', { name: 'Reveal explanation' }));
  fireEvent.click(screen.getByRole('button', { name: 'Study again in 10 minutes' }));
  expect(screen.getByText('11 of 12 cards are due or new.')).toBeInTheDocument();
});

it('uses elapsed wall time, pauses cleanly, expires, and keeps notes when resetting the rehearsal', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-22T12:00:00Z'));
  mount(<InterviewRehearsal />);
  fireEvent.click(screen.getByRole('button', { name: 'Start rehearsal' }));
  act(() => {
    jest.advanceTimersByTime(65000);
  });
  expect(screen.getByLabelText('Time remaining')).toHaveTextContent('33:55');
  fireEvent.click(screen.getByRole('button', { name: 'Pause timer' }));
  act(() => {
    jest.advanceTimersByTime(60000);
  });
  expect(screen.getByLabelText('Time remaining')).toHaveTextContent('33:55');
  fireEvent.click(screen.getByRole('button', { name: 'Resume timer' }));
  act(() => {
    jest.advanceTimersByTime(34 * 60000);
  });
  expect(screen.getByLabelText('Time remaining')).toHaveTextContent('0:00');
  expect(screen.getByRole('status', { name: 'Rehearsal status' })).toHaveTextContent(
    'Rehearsal finished',
  );
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test index zero.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reset timer and review' }));
  expect(screen.getByRole('textbox')).toHaveValue('Test index zero.');
  expect(screen.getByLabelText('Time remaining')).toHaveTextContent('35:00');
});

it('executes the published closure and receiver examples and tests delayed array reads', () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), 'src/content/resources/guides/javascript-closures-and-this.mdx'),
    'utf8',
  );
  const code = [...source.matchAll(/```javascript\n([\s\S]*?)```/g)]
    .map((match) => match[1])
    .join('\n');
  const result = new Function(
    `${code}\nreturn { makeCounter, makeReaders, makeReceiverExample, observedCounts, boundRead };`,
  )();
  expect(result.observedCounts).toEqual([3, 3, 10]);
  expect(result.boundRead()).toBe(7);
  const value = result.makeReceiverExample();
  const detached = value.read;
  expect(() => detached()).toThrow(TypeError);
  const values = [2, 4];
  const readers = result.makeReaders(values);
  values[0] = 9;
  expect(readers.map((read: () => number) => read())).toEqual([9, 4]);
});

it('executes the published delegation handler across nested targets, roots, dynamic children, and cleanup', () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), 'src/content/resources/guides/frontend-event-delegation.mdx'),
    'utf8',
  );
  const code = [...source.matchAll(/```javascript\n([\s\S]*?)```/g)]
    .map((match) => match[1])
    .join('\n');
  const delegate = new Function(`${code}\nreturn delegateActions;`)();
  const root = document.createElement('div');
  root.setAttribute('data-action-root', '');
  root.innerHTML =
    '<button data-action="save"><span>Save</span></button><button data-action="disabled" disabled>Disabled</button><div data-action-root><button data-action="inner">Inner</button></div>';
  document.body.append(root);
  const action = jest.fn();
  const cleanup = delegate(root, action);
  fireEvent.click(root.querySelector('span')!);
  expect(action).toHaveBeenCalledWith('save', root.querySelector('button'), expect.any(Event));
  fireEvent.click(root.querySelector('button[disabled]')!);
  fireEvent.click(root.querySelector('[data-action="inner"]')!);
  expect(action).toHaveBeenCalledTimes(1);
  const added = document.createElement('button');
  added.dataset.action = 'added';
  root.append(added);
  fireEvent.click(added);
  expect(action).toHaveBeenCalledTimes(2);
  cleanup();
  cleanup();
  fireEvent.click(added);
  expect(action).toHaveBeenCalledTimes(2);
  root.remove();
});
