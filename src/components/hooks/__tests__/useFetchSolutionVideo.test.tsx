import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import api from 'services/client/api';
import Sentry from 'utils/shared/sentry';
import useFetchSolutionVideo from '../useFetchSolutionVideo';

jest.mock('services/client/api', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('utils/shared/sentry', () => ({
  __esModule: true,
  default: { withScope: (callback: () => void) => callback(), captureException: jest.fn() },
}));

const deferred = () => {
  let resolve!: (value: { solutionVideoUrl: string | null }) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<{ solutionVideoUrl: string | null }>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const request = api.get as jest.Mock;
const State = ({ id }: { id?: string }) => {
  const { hasFetchedVideo, solutionVideoUrl } = useFetchSolutionVideo(id);
  return <output>{hasFetchedVideo ? solutionVideoUrl || 'No private video' : 'Loading'}</output>;
};
beforeEach(() => jest.clearAllMocks());

it('settles a failed lookup so the video panel can offer the public recording', async () => {
  const pending = deferred();
  request.mockReturnValueOnce(pending.promise);
  render(<State id="first" />);
  expect(screen.getByText('Loading')).toBeInTheDocument();
  const error = new Error('Video API unavailable');
  await act(async () => pending.reject(error));
  expect(screen.getByText('No private video')).toBeInTheDocument();
  expect(Sentry.captureException).toHaveBeenCalledWith(error);
});

it.each(['resolve', 'reject'] as const)(
  'ignores a stale request that will %s after the lesson changes',
  async (finish) => {
    const old = deferred();
    const current = deferred();
    request.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    const { rerender } = render(<State id="first" />);
    rerender(<State id="second" />);
    await act(async () => {
      if (finish === 'resolve') old.resolve({ solutionVideoUrl: 'Wrong lesson' });
      else old.reject(new Error('Old failure'));
    });
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(Sentry.captureException).not.toHaveBeenCalled();
    await act(async () => current.resolve({ solutionVideoUrl: 'Current lesson' }));
    expect(screen.getByText('Current lesson')).toBeInTheDocument();
  },
);

it('clears the previous URL during another lookup and settles an absent lesson ID', async () => {
  request.mockResolvedValueOnce({ solutionVideoUrl: 'First lesson' });
  const { rerender } = render(<State id="first" />);
  await act(async () => {});
  expect(screen.getByText('First lesson')).toBeInTheDocument();
  request.mockReturnValueOnce(deferred().promise);
  rerender(<State id="second" />);
  expect(screen.getByText('Loading')).toBeInTheDocument();
  rerender(<State />);
  expect(screen.getByText('No private video')).toBeInTheDocument();
  expect(request).toHaveBeenCalledTimes(2);
});

it('ignores an outstanding failure after unmounting', async () => {
  const pending = deferred();
  request.mockReturnValueOnce(pending.promise);
  const { unmount } = render(<State id="first" />);
  unmount();
  await act(async () => pending.reject(new Error('Late failure')));
  expect(Sentry.captureException).not.toHaveBeenCalled();
});
