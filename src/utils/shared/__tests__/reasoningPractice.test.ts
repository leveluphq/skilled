import {
  complexityQuestions,
  edgeCaseQuestions,
  readReviews,
  scheduleReview,
} from '../reasoningPractice';

it('has a valid, explained answer for every distinct reasoning prompt', () => {
  const all = [...complexityQuestions, ...edgeCaseQuestions];
  expect(new Set(all.map((item) => item.id)).size).toBe(all.length);
  all.forEach((item) => {
    expect(item.choices[item.answer]).toBeTruthy();
    expect(item.explanation.length).toBeGreaterThan(100);
    expect(item.guide).toMatch(/^\/(course|tools|reference|guides|topics|patterns)\//);
  });
});
it('resets forgotten cards and caps increasing review intervals', () => {
  const now = 1000000;
  let record = scheduleReview(undefined, true, now);
  expect(record).toEqual({ level: 1, due: now + 86400000 });
  for (let i = 0; i < 10; i++) record = scheduleReview(record, true, now);
  expect(record).toEqual({ level: 5, due: now + 30 * 86400000 });
  expect(scheduleReview(record, false, now)).toEqual({ level: 0, due: now + 600000 });
});
it('rejects corrupt or unrelated persisted review state and copies only validated fields', () => {
  for (const value of [
    null,
    'null',
    '[1,2]',
    'bad',
    '{"a":{"level":10,"due":3}}',
    '{"a":{"level":2,"due":-1}}',
  ])
    expect(readReviews(value, ['a'])).toEqual({});
  expect(
    readReviews('{"a":{"level":2,"due":123,"code":"private"},"b":{"level":1,"due":4}}', ['a']),
  ).toEqual({ a: { level: 2, due: 123 } });
});
