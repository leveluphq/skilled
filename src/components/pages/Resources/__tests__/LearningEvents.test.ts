import { learningEvent } from 'utils/client/learningEvents';

const original = process.env.GOOGLE_TAG_MANAGER_ID;
afterEach(() => {
  if (original === undefined) delete process.env.GOOGLE_TAG_MANAGER_ID;
  else process.env.GOOGLE_TAG_MANAGER_ID = original;
  delete (window as any).dataLayer;
});

it('does nothing on unconfigured deployments and never sends arbitrary paths or query data', () => {
  const push = jest.fn();
  (window as any).dataLayer = { push };
  delete process.env.GOOGLE_TAG_MANAGER_ID;
  learningEvent('tool_interaction', '/tools/sorting-comparison');
  expect(push).not.toHaveBeenCalled();
  process.env.GOOGLE_TAG_MANAGER_ID = 'GTM-TEST';
  learningEvent('practice_open', '/tools/interview-rehearsal', '/course/target-two-sum');
  expect(push).toHaveBeenCalledWith({
    event: 'learning_practice_open',
    learning_page: '/tools/interview-rehearsal',
    learning_target: '/course/target-two-sum',
  });
  learningEvent('tool_interaction', '/tools/sorting-comparison?email=private@example.com');
  learningEvent('practice_open', '/tools/interview-rehearsal', '/auth/private');
  expect(push).toHaveBeenCalledTimes(1);
});

it('does not interrupt learning when a deployment has no working data layer', () => {
  process.env.GOOGLE_TAG_MANAGER_ID = 'GTM-TEST';
  expect(() => learningEvent('code_run_requested', '/course/target-two-sum')).not.toThrow();
  (window as any).dataLayer = {
    push: () => {
      throw new Error('tag failed');
    },
  };
  expect(() => learningEvent('code_run_requested', '/course/target-two-sum')).not.toThrow();
});
