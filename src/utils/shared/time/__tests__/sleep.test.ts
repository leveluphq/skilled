import sleep from 'utils/shared/time/sleep';

describe('sleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not resolve before the requested delay has elapsed', async () => {
    const onResolve = jest.fn();
    sleep(1000).then(onResolve);

    jest.advanceTimersByTime(999);
    await Promise.resolve();
    expect(onResolve).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(onResolve).toHaveBeenCalledTimes(1);
  });

  it('resolves with the delay it was given', async () => {
    const promise = sleep(250);
    jest.advanceTimersByTime(250);
    await expect(promise).resolves.toBe(250);
  });

  it('resolves on the next tick for a 0ms delay', async () => {
    const promise = sleep(0);
    jest.advanceTimersByTime(0);
    await expect(promise).resolves.toBe(0);
  });

  it.each([
    ['a negative delay', -1000],
    ['NaN', NaN],
  ])('still resolves for %s instead of hanging the caller', async (_label, delay) => {
    // The Judge0 poll loop in pages/api/v1/lessons/[id]/submissions/code.ts
    // awaits this between attempts; a delay that never fires would hold the API
    // route open until the platform timeout rather than returning a result.
    const promise = sleep(delay);
    jest.advanceTimersByTime(0);

    await expect(promise).resolves.toBe(delay);
  });
});
