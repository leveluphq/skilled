import * as React from 'react';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { CodingLanguage, LessonAccessLevel, LessonStatus } from 'utils/constants/lesson';
import CodingLanguageContext from 'components/context/CodingLanguage/CodingLanguageContext';
import LessonPage from '../LessonPage';

const PAID_BODY = 'the-paid-answer-walkthrough';

const makeLesson = (accessLevel: LessonAccessLevel) => ({
  id: 'lesson-1',
  slug: 'two-sum',
  accessLevel,
  title: 'Two Sum',
  solution: PAID_BODY,
});

interface RecordedProps {
  hasLessonAccess: boolean;
  slug: string;
  lesson: any;
  status: any;
  draft: any;
  isFetchingUserLessonDetails: boolean;
  isCodeEditorOpen: boolean;
  toggleCodeEditor: () => void;
}

let received: RecordedProps[] = [];

const RecordingComponent: any = (props: RecordedProps) => {
  received.push(props);
  return (
    <div data-testid="lesson-content">
      {props.hasLessonAccess ? 'FULL LESSON' : 'PAYWALL'}
      <span data-testid="solution">{props.lesson?.solution}</span>
    </div>
  );
};

const insertLessonStatus = jest.fn();
const setActiveLesson = jest.fn();

const renderLessonPage = (
  overrides: Partial<React.ComponentProps<typeof LessonPage>> = {},
  language: CodingLanguage = CodingLanguage.Javascript,
) =>
  render(
    <CodingLanguageContext.Provider value={{ language, setLanguage: jest.fn() }}>
      <LessonPage
        lesson={makeLesson(LessonAccessLevel.Subscription)}
        Component={RecordingComponent}
        insertLessonStatus={insertLessonStatus as any}
        setActiveLesson={setActiveLesson as any}
        toggleCodeEditor={jest.fn()}
        isCodeEditorOpen={false}
        isFetchingUserLessonDetails={false}
        {...(overrides as any)}
      />
    </CodingLanguageContext.Provider>,
  );

const last = () => received[received.length - 1];

describe('LessonPage access gating', () => {
  beforeEach(() => {
    received = [];
    jest.clearAllMocks();
  });

  it('locks a subscription lesson for an anonymous visitor', () => {
    const { getByTestId } = renderLessonPage();

    expect(last().hasLessonAccess).toBe(false);
    expect(getByTestId('lesson-content')).toHaveTextContent('PAYWALL');
  });

  it('unlocks a FREE lesson for an anonymous visitor', () => {
    const { getByTestId } = renderLessonPage({ lesson: makeLesson(LessonAccessLevel.Free) });

    expect(last().hasLessonAccess).toBe(true);
    expect(getByTestId('lesson-content')).toHaveTextContent('FULL LESSON');
  });

  it('locks a TRIAL lesson for an anonymous visitor but unlocks it once signed in', () => {
    renderLessonPage({ lesson: makeLesson(LessonAccessLevel.Trial) });
    expect(last().hasLessonAccess).toBe(false);

    received = [];
    renderLessonPage({
      lesson: makeLesson(LessonAccessLevel.Trial),
      data: {
        users_by_pk: { id: 'user-1', fullCourseAccessEndsAt: null },
        users_lessons_status: [],
      } as any,
    });
    expect(last().hasLessonAccess).toBe(true);
  });

  it('unlocks a subscription lesson for any signed-in viewer while the course is free', () => {
    // IS_FULL_COURSE_FREE is currently true, so merely having an account grants
    // full access even with no fullCourseAccessEndsAt. If that flag is flipped back
    // off, this expectation must flip too.
    renderLessonPage({
      data: {
        users_by_pk: { id: 'user-1', fullCourseAccessEndsAt: null },
        users_lessons_status: [],
      } as any,
    });

    expect(last().hasLessonAccess).toBe(true);
  });

  it('makes an anonymous free lesson available in the initial render', () => {
    // Public access is derived before SSR; restricted lessons still use the
    // same access calculation, independently of client effects.
    renderLessonPage({ lesson: makeLesson(LessonAccessLevel.Free) });

    expect(received[0].hasLessonAccess).toBe(true);
    expect(last().hasLessonAccess).toBe(true);
  });

  it('server-renders free content while keeping subscription content locked', () => {
    const htmlFor = (accessLevel: LessonAccessLevel) => renderToString(
      <LessonPage
        lesson={makeLesson(accessLevel) as any}
        Component={RecordingComponent}
        insertLessonStatus={insertLessonStatus as any}
        setActiveLesson={setActiveLesson as any}
        toggleCodeEditor={jest.fn()}
        isCodeEditorOpen={false}
        isFetchingUserLessonDetails={false}
      />,
    );
    expect(htmlFor(LessonAccessLevel.Free)).toContain('FULL LESSON');
    expect(htmlFor(LessonAccessLevel.Subscription)).toContain('PAYWALL');
  });

  // BUG (known, by design today): the paywall is client-side only. The entire
  // lesson object - including the paid solution/walkthrough content - is handed to
  // the renderer regardless of `hasLessonAccess`, so a locked-out visitor can read
  // the paid content straight out of the page source / React props.
  // Expected: the server should omit paid fields for viewers without access.
  it('still passes the full paid lesson payload to the renderer when locked out (see BUG note)', () => {
    const { getByTestId } = renderLessonPage();

    expect(last().hasLessonAccess).toBe(false);
    expect(last().lesson.solution).toBe(PAID_BODY);
    expect(getByTestId('solution')).toHaveTextContent(PAID_BODY);
  });

  // BUG: the optional chain stops at `data` - `data?.users_lessons_status[0]` throws
  // a TypeError whenever the response contains `users_by_pk` but no
  // `users_lessons_status` array (a partial Apollo result, or an errored query that
  // still returns data). The whole lesson page crashes instead of degrading.
  // Expected: `data?.users_lessons_status?.[0]`.
  // `it.failing` documents the crash without cementing it: once the optional chain
  // is fixed this test passes and jest flags the stale `.failing`.
  it.failing('degrades gracefully when the viewer response omits users_lessons_status', () => {
    renderLessonPage({ data: { users_by_pk: { id: 'user-1' } } as any });

    expect(last().status).toBeUndefined();
  });

  it('keeps the paywall closed for an explicitly signed-out viewer response', () => {
    // Apollo returns `users_by_pk: null` (not a missing key) for a query run with
    // an unknown/expired viewer id, which still satisfies the `'users_by_pk' in obj`
    // shape check - the null viewer must not be mistaken for an authorised one.
    renderLessonPage({
      data: { users_by_pk: null, users_lessons_status: [], code_drafts: [] } as any,
    });

    expect(last().hasLessonAccess).toBe(false);
    expect(last().draft).toBeUndefined();
    expect(insertLessonStatus).not.toHaveBeenCalled();
    expect(setActiveLesson).not.toHaveBeenCalled();
  });

  it('treats a response with no users_by_pk key as anonymous', () => {
    renderLessonPage({ data: { lessons: [] } as any });

    expect(last().hasLessonAccess).toBe(false);
    expect(insertLessonStatus).not.toHaveBeenCalled();
    expect(setActiveLesson).not.toHaveBeenCalled();
  });
});

describe('LessonPage progress tracking', () => {
  beforeEach(() => {
    received = [];
    jest.clearAllMocks();
  });

  const viewerData = (extra: any = {}) =>
    ({
      users_by_pk: { id: 'user-1', fullCourseAccessEndsAt: null },
      users_lessons_status: [],
      code_drafts: [],
      ...extra,
    } as any);

  it('seeds a lesson status and marks the lesson active for a signed-in viewer', () => {
    renderLessonPage({ data: viewerData() });

    expect(insertLessonStatus).toHaveBeenCalledTimes(1);
    expect(insertLessonStatus).toHaveBeenCalledWith({
      variables: {
        userId: 'user-1',
        lessonId: 'lesson-1',
        status: LessonStatus.Init,
        explanationStepsViewed: 0,
        validationStepsViewed: 0,
      },
    });
    expect(setActiveLesson).toHaveBeenCalledWith({
      variables: { userId: 'user-1', lessonId: 'lesson-1' },
    });
  });

  it('does not re-seed a status that already exists, but still marks the lesson active', () => {
    renderLessonPage({
      data: viewerData({ users_lessons_status: [{ id: 'status-1', status: LessonStatus.Init }] }),
    });

    expect(insertLessonStatus).not.toHaveBeenCalled();
    expect(setActiveLesson).toHaveBeenCalledTimes(1);
    expect(last().status).toEqual({ id: 'status-1', status: LessonStatus.Init });
  });

  it('never writes progress for an anonymous visitor', () => {
    renderLessonPage();

    expect(insertLessonStatus).not.toHaveBeenCalled();
    expect(setActiveLesson).not.toHaveBeenCalled();
  });
});

describe('LessonPage code draft selection', () => {
  beforeEach(() => {
    received = [];
    jest.clearAllMocks();
  });

  const drafts = [
    { id: 'draft-js', language: CodingLanguage.Javascript, code: 'js code' },
    { id: 'draft-py', language: CodingLanguage.Python, code: 'py code' },
  ];

  it('hands the renderer the draft for the currently selected language', () => {
    renderLessonPage(
      {
        data: {
          users_by_pk: { id: 'user-1' },
          users_lessons_status: [],
          code_drafts: drafts,
        } as any,
      },
      CodingLanguage.Python,
    );

    expect(last().draft).toEqual(drafts[1]);
  });

  it('passes no draft when the viewer has none saved for that language', () => {
    renderLessonPage(
      {
        data: {
          users_by_pk: { id: 'user-1' },
          users_lessons_status: [],
          code_drafts: [drafts[0]],
        } as any,
      },
      CodingLanguage.Python,
    );

    expect(last().draft).toBeUndefined();
  });

  it('never reads drafts for an anonymous visitor', () => {
    renderLessonPage({}, CodingLanguage.Javascript);

    expect(last().draft).toBeUndefined();
  });
});

describe('LessonPage missing content', () => {
  beforeEach(() => {
    received = [];
    jest.clearAllMocks();
  });

  it('404s instead of rendering when the lesson is missing', () => {
    // process.browser is falsy under jest, which is the server branch of throw404.
    expect(() => renderLessonPage({ lesson: undefined })).toThrow('Not found');
    expect(received).toHaveLength(0);
  });

  it('404s instead of rendering when the content Component is missing', () => {
    expect(() => renderLessonPage({ Component: undefined })).toThrow('Not found');
  });
});
