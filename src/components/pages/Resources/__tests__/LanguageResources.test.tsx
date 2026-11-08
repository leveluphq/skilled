import * as React from 'react';
import { render, screen } from '@testing-library/react';
import ThemeProvider from 'components/context/ThemeProvider';
import CodingLanguageContext from 'components/context/CodingLanguage/CodingLanguageContext';
import { CodingLanguage, codingLanguageList } from 'utils/constants/lesson';
import { getLanguageGuide, getLanguageResources, languageGuides } from 'content/resources';
import RelatedResources from 'components/blocks/RelatedResources/RelatedResources';
import LanguageIndex from '../LanguageIndex';

jest.mock('components/blocks/Head', () => () => null);

it('groups every language guide and its deeper resources in the language index', () => {
  const { container } = render(
    <ThemeProvider>
      <LanguageIndex />
    </ThemeProvider>,
  );
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(languageGuides).toHaveLength(10);
  const collection = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
  expect(collection.hasPart.map((part: { url: string }) => part.url)).toHaveLength(
    new Set(collection.hasPart.map((part: { url: string }) => part.url)).size,
  );
  for (const guide of languageGuides) {
    expect(
      screen.getByRole('heading', { name: guide.title, level: 3 }).closest('a'),
    ).toHaveAttribute('href', `/interview-prep/${guide.slug}`);
    expect(getLanguageResources(guide.slug)).toContainEqual(guide);
    expect(getLanguageResources(guide.slug)[0]).toBe(guide);
    expect(guide.language).toBe(guide.slug);
  }
  expect(screen.getByRole('link', { name: 'C++', exact: true })).toHaveAttribute(
    'href',
    '#language-cpp',
  );
  expect(
    screen
      .getByRole('heading', { name: /Count islands in Python with iterative flood fill/, level: 3 })
      .closest('a'),
  ).toHaveAttribute('href', '/guides/count-islands-python');
  expect(
    screen
      .getByRole('heading', { name: /TypeScript collections: missing values/, level: 3 })
      .closest('a'),
  ).toHaveAttribute('href', '/guides/typescript-collections');
});

it('keeps JavaScript runtime material useful for TypeScript without duplicate topic links', () => {
  render(
    <ThemeProvider>
      <CodingLanguageContext.Provider
        value={{ language: CodingLanguage.Typescript, setLanguage: () => {} }}
      >
        <RelatedResources slug="debounce" />
      </CodingLanguageContext.Provider>
    </ThemeProvider>,
  );
  expect(screen.getByRole('link', { name: getLanguageGuide('typescript')!.title })).toHaveAttribute(
    'href',
    '/interview-prep/typescript',
  );
  expect(
    screen.getAllByRole('link', { name: 'JavaScript interview utilities and concepts' }),
  ).toHaveLength(1);
  expect(screen.getByRole('link', { name: 'Debounce vs. throttle in JavaScript' })).toHaveAttribute(
    'href',
    '/guides/debounce-vs-throttle',
  );
});

const courseResources = (language: CodingLanguage) => (
  <ThemeProvider>
    <CodingLanguageContext.Provider value={{ language, setLanguage: () => {} }}>
      <RelatedResources slug="target-two-sum" />
    </CodingLanguageContext.Provider>
  </ThemeProvider>
);

it('updates course preparation links when the selected programming language changes', () => {
  const { rerender } = render(courseResources(CodingLanguage.Python));
  for (const language of codingLanguageList) {
    const guide = getLanguageGuide(language.toLowerCase());
    expect(guide).toBeDefined();
    rerender(courseResources(language));
    expect(screen.getByRole('link', { name: guide!.title })).toHaveAttribute(
      'href',
      `/interview-prep/${guide!.slug}`,
    );
    expect(
      screen
        .getByRole('navigation', { name: 'Related guides and tools' })
        .querySelectorAll('a[href^="/interview-prep/"]'),
    ).toHaveLength(1);
  }
});

it('uses the language index when the chosen language has no published guide', () => {
  render(courseResources('UNSUPPORTED' as CodingLanguage));
  expect(
    screen.getByRole('link', { name: 'Preparation guides by programming language' }),
  ).toHaveAttribute('href', '/interview-prep');
  expect(getLanguageGuide('unsupported')).toBeUndefined();
});

it('keeps the index compact and links the complete grouped language reading library', () => {
  const { unmount } = render(
    <ThemeProvider>
      <LanguageIndex />
    </ThemeProvider>,
  );
  const links = screen.getAllByRole('link', { name: /Browse all \d+ lessons in this language/ });
  expect(links).toHaveLength(10);
  expect(links.map((link) => link.getAttribute('href'))).toContain(
    '/interview-prep/python#lesson-walkthroughs',
  );
  unmount();
});
