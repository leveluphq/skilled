import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import ThemeProvider from 'components/context/ThemeProvider';
import ViewerContext from 'components/context/ViewerContext';
import { useGetCategoryLessonsWithViewerQuery } from 'types/generated/client';
import { publicCourse } from 'content/resources/publicCourse';
import course from 'content/resources/course.json';
import LessonsContainer from '../index';

jest.mock('types/generated/client', () => ({ useGetCategoryLessonsWithViewerQuery: jest.fn() }));
jest.mock('../Sidebar', () => () => null);
jest.mock('components/blocks/Modal/FeedbackModal', () => () => null);
jest.mock('../LessonListWithViewer', () => ({ data }: any) => (
  <p>Saved progress: {data.users_lessons_status[0].status}</p>
));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => React.cloneElement(children, { href }),
}));
const query = useGetCategoryLessonsWithViewerQuery as jest.Mock;
const ui = (viewer = '') => (
  <ThemeProvider>
    <ViewerContext.Provider value={viewer}>
      <LessonsContainer />
    </ViewerContext.Provider>
  </ThemeProvider>
);
afterEach(() => jest.resetAllMocks());

it('renders every published lesson and category anchor without JavaScript or a query', () => {
  const html = renderToStaticMarkup(ui());
  for (const category of course.categories) expect(html).toContain(`id="${category.slug}"`);
  for (const lesson of course.lessons) expect(html).toContain(`href="/course/${lesson.slug}"`);
  expect(html).not.toContain('/course/knapsack');
  expect(html).not.toContain('/course/detect-a-loop');
  expect(query).not.toHaveBeenCalled();
});

it('uses seed identities and ordering while excluding draft data', () => {
  const seed = require('../../../../../hasura/seeds/course.json');
  const lessons = publicCourse.categories.flatMap((category) => category.lessons);
  expect(lessons).toHaveLength(66);
  expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(66);
  for (const lesson of lessons)
    expect(seed.lessons.find((item: any) => item.id === lesson.id)).toMatchObject({
      slug: lesson.slug,
      status: 'ACTIVE',
      accessLevel: lesson.accessLevel,
    });
  for (const category of publicCourse.categories) {
    expect(category.lessons.map((lesson) => lesson.position)).toEqual(
      [...category.lessons]
        .sort((a, b) => a.position! - b.position!)
        .map((lesson) => lesson.position),
    );
  }
});

it('switches to the viewer progress query and back without changing hook order', () => {
  query.mockImplementation(() => {
    React.useState(0); // Exercise a real hook boundary across viewer changes.
    return {
      loading: false,
      data: { ...publicCourse, users_lessons_status: [{ status: 'COMPLETE' }] },
    };
  });
  const { rerender } = render(ui());
  expect(screen.getByRole('link', { name: 'Arrays', exact: true })).toHaveAttribute(
    'href',
    '/course/arrays',
  );
  rerender(ui('viewer-id'));
  expect(query).toHaveBeenCalledWith({ variables: { userId: 'viewer-id' } });
  expect(screen.getByText('Saved progress: COMPLETE')).toBeInTheDocument();
  rerender(ui());
  expect(screen.getByRole('link', { name: 'Arrays', exact: true })).toHaveAttribute(
    'href',
    '/course/arrays',
  );
});
