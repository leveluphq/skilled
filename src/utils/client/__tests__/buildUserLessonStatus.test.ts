import buildUserLessonStatus from 'utils/client/buildUserLessonStatus';
import { LessonStatus } from 'utils/constants/lesson';

describe('buildUserLessonStatus', () => {
  it('indexes statuses by lessonId', () => {
    const result = buildUserLessonStatus([
      { lessonId: 'lesson-1', status: LessonStatus.Complete },
      { lessonId: 'lesson-2', status: LessonStatus.InProgress },
      { lessonId: 'lesson-3', status: LessonStatus.NeedsReview },
    ] as any);

    expect(result).toEqual({
      'lesson-1': LessonStatus.Complete,
      'lesson-2': LessonStatus.InProgress,
      'lesson-3': LessonStatus.NeedsReview,
    });
  });

  it('returns an empty map for an empty list', () => {
    expect(buildUserLessonStatus([])).toEqual({});
  });

  it('lets a later row win for a duplicated lessonId', () => {
    const result = buildUserLessonStatus([
      { lessonId: 'lesson-1', status: LessonStatus.Init },
      { lessonId: 'lesson-1', status: LessonStatus.Complete },
    ] as any);

    // Rows arrive ordered by the GraphQL query, so "last write wins" is the contract.
    expect(result['lesson-1']).toBe(LessonStatus.Complete);
  });

  it('preserves a null status rather than dropping the key', () => {
    const result = buildUserLessonStatus([{ lessonId: 'lesson-1', status: null }] as any);

    expect(result).toHaveProperty('lesson-1', null);
  });

  it('does not mutate the rows it is given', () => {
    const rows = [{ lessonId: 'lesson-1', status: LessonStatus.Complete }] as any;
    const snapshot = JSON.parse(JSON.stringify(rows));

    buildUserLessonStatus(rows);

    expect(rows).toEqual(snapshot);
  });

  it('stringifies a missing lessonId into an "undefined" key', () => {
    const result = buildUserLessonStatus([{ status: LessonStatus.Complete }] as any);

    // BUG: a row with no `lessonId` becomes the literal key "undefined" instead of being
    // skipped. Any lookup for a lesson whose id is genuinely missing/undefined then gets
    // another row's status. Rows without a lessonId should be filtered out.
    // Asserting current behaviour so the suite stays green -- see bugs_found.
    expect(result).toEqual({ undefined: LessonStatus.Complete });
  });
});
