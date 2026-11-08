import * as React from 'react';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import LessonWalkthroughPage from '../LessonWalkthroughPage';
import LessonLanguageLinks from 'components/blocks/LessonLanguageLinks/LessonLanguageLinks';
import ThemeProvider from 'components/context/ThemeProvider';
import { lessonWalkthroughs, walkthroughPath } from 'content/lesson-walkthroughs';
import lessonLanguages from 'content/lessonLanguages.gen';
import { LANGUAGE_KEY } from 'utils/client/programmingLanguagePreference';
import { LanguageName, CodingLanguage } from 'utils/constants/lesson';

jest.mock('components/blocks/Head', () => () => null);
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => React.cloneElement(children, { href }),
}));

const originalRunner = process.env.CODE_RUNNER;
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  if (originalRunner === undefined) delete process.env.CODE_RUNNER;
  else process.env.CODE_RUNNER = originalRunner;
});

it('renders real sibling links, a single title, matching language schema, and the original exercise URL', () => {
  process.env.CODE_RUNNER = 'docker';
  for (const page of lessonWalkthroughs.filter((item) => !item.kind)) {
    const { container, unmount } = render(
      <LessonWalkthroughPage walkthrough={page} headings={[]} minutes={4}>
        <p>Explanation</p>
      </LessonWalkthroughPage>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(page.title);
    const navigation = screen.getByRole('navigation', { name: 'Walkthrough programming language' });
    expect(navigation.querySelector('a[aria-current="page"]')).toHaveAttribute(
      'href',
      walkthroughPath(page),
    );
    expect(navigation.querySelectorAll('a')).toHaveLength(10);
    const practice = screen.getAllByRole('link', {
      name: `Practice in ${LanguageName[page.language.toUpperCase() as CodingLanguage]}`,
    });
    expect(practice[0]).toHaveAttribute('href', `/course/${page.lesson}`);
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBeNull();
    fireEvent.click(practice[0]);
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe(
      JSON.stringify(page.language.toUpperCase()),
    );
    const [entity] = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(entity.about.name).toBe(LanguageName[page.language.toUpperCase() as CodingLanguage]);
    expect(entity.inLanguage).toBe('en');
    expect(entity.isAccessibleForFree).toBe(true);
    expect(entity.isPartOf['@id']).toContain(`/course/${page.lesson}#lesson`);
    unmount();
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
});

it('does not force an unavailable Java runtime when opening the normal exercise', () => {
  process.env.CODE_RUNNER = 'system';
  const page = lessonWalkthroughs.find((item) => item.language === 'java')!;
  render(
    <LessonWalkthroughPage walkthrough={page} headings={[]} minutes={4}>
      <p>Java code</p>
    </LessonWalkthroughPage>,
  );
  expect(
    screen.queryByRole('link', { name: 'Practice in Java', exact: true }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('link', { name: 'Open the exercise' })[0]);
  expect(window.localStorage.getItem(LANGUAGE_KEY)).toBeNull();
  expect(
    screen.getByText(/online editor currently runs JavaScript, TypeScript, Python/),
  ).toBeInTheDocument();
});

it('publishes actual lesson code languages while linking only edited walkthroughs', () => {
  render(
    <ThemeProvider>
      <LessonLanguageLinks slug="target-two-sum" />
    </ThemeProvider>,
  );
  const list = screen.getByRole('list', { name: 'Code languages' });
  expect(list.children).toHaveLength(lessonLanguages['target-two-sum'].length);
  for (const language of lessonLanguages['target-two-sum'])
    expect(list).toHaveTextContent(LanguageName[language]);
  expect(screen.getByRole('link', { name: 'Python walkthrough' })).toHaveAttribute(
    'href',
    '/course/target-two-sum/python',
  );
  expect(screen.getByRole('link', { name: 'Rust walkthrough' })).toHaveAttribute(
    'href',
    '/course/target-two-sum/rust',
  );
});

it('makes no language coverage claim for lessons without a starter/reference inventory', () => {
  const { container } = render(
    <ThemeProvider>
      <LessonLanguageLinks slug="unknown" />
    </ThemeProvider>,
  );
  expect(container).toBeEmptyDOMElement();
});

it.each([
  ['arrays', 'python', 10],
  ['implement-a-queue', 'rust', 10],
  ['debounce', 'typescript', 2],
])(
  'opens the original %s lesson explicitly without treating it as a runnable exercise',
  (slug, language, count) => {
    process.env.CODE_RUNNER = 'system';
    window.localStorage.setItem(LANGUAGE_KEY, JSON.stringify('JAVA'));
    const page = lessonWalkthroughs.find(
      (item) => item.lesson === slug && item.language === language,
    )!;
    const { container } = render(
      <LessonWalkthroughPage walkthrough={page} headings={[]} minutes={8}>
        <p>Reading example</p>
      </LessonWalkthroughPage>,
    );
    expect(screen.queryByRole('link', { name: /^Practice in / })).toBeNull();
    expect(screen.queryByText(/online editor currently runs/)).toBeNull();
    const nav = screen.getByRole('navigation', { name: 'Walkthrough programming language' });
    expect(nav.querySelectorAll('a')).toHaveLength(Number(count));
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe(JSON.stringify('JAVA'));
    fireEvent.click(nav.querySelector('a')!);
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe(JSON.stringify('JAVA'));
    const action = screen.getAllByRole('link', { name: 'Open the course lesson' })[0];
    expect(action).toHaveAttribute('href', `/course/${slug}`);
    fireEvent.click(action);
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe(JSON.stringify('JAVA'));
    expect(
      JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!)[0]
        .isPartOf['@id'],
    ).toContain(`/course/${slug}#lesson`);
  },
);

it.each([
  ['arrays', 10],
  ['implement-a-queue', 10],
  ['debounce', 2],
])('links every reading language from the normal %s lesson', (slug, count) => {
  render(
    <ThemeProvider>
      <LessonLanguageLinks slug={String(slug)} />
    </ThemeProvider>,
  );
  expect(screen.getByRole('list', { name: 'Code languages' }).children).toHaveLength(Number(count));
  expect(
    screen.getByRole('navigation', { name: 'Language walkthroughs' }).querySelectorAll('a'),
  ).toHaveLength(Number(count));
  expect(screen.queryByText(/editor shows which/)).toBeNull();
});
