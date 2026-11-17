import * as React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { languageGuides, resourcePath } from 'content/resources';
import HomePage from '../HomePage';

// The page chrome (navbar/footer) needs Apollo and the Next router.
jest.mock('components/pages/PageLayout/Default', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
// The three live demos are the lesson's own components, tested where they live.
jest.mock('../SampleVideo', () => ({ __esModule: true, default: () => <div>sample video</div> }));
jest.mock('../SampleArticle', () => ({ __esModule: true, default: () => <div>sample article</div> }));
jest.mock('next/dynamic', () => () => () => <div>sample editor</div>);
jest.mock('components/blocks/Modal/AuthModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div role="dialog">sign up</div> : null),
}));

const renderHome = () =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <HomePage loading={false} />
    </ThemeProvider>,
  );

it('has one h1, the headline', () => {
  const { container } = renderHome();
  expect(container.querySelectorAll('h1')).toHaveLength(1);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ace your coding interviews');
});

it('asks visitors to sign up and to star the repository', () => {
  renderHome();
  const star = screen.getByRole('link', { name: 'Star on GitHub' });
  expect(star).toHaveAttribute('href', 'https://github.com/leveluphq/skilled');
  expect(star).toHaveAttribute('rel', 'noopener noreferrer');

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  // The hero's button and the closing one both open sign-up
  const signUps = screen.getAllByRole('button', { name: /create a free account/i });
  expect(signUps).toHaveLength(2);
  fireEvent.click(signUps[0]);
  expect(screen.getByRole('dialog')).toHaveTextContent('sign up');
});

it('points every in-page link at an element on the page', () => {
  const { container } = renderHome();
  const fragments = Array.from(container.querySelectorAll('a[href^="#"]'), (a) =>
    a.getAttribute('href')!.slice(1),
  );
  expect(fragments).toEqual(['video-section', 'code-section', 'article-section']);
  for (const id of fragments) expect(container.querySelectorAll(`#${id}`)).toHaveLength(1);
});

it('links each language guide and each course topic', () => {
  renderHome();
  const languages = screen.getByRole('list', { name: 'Programming language guides' });
  const hrefs = within(languages)
    .getAllByRole('link')
    .map((a) => a.getAttribute('href'));
  expect(hrefs).toEqual(languageGuides.map(resourcePath));

  const topics = screen
    .getAllByRole('link')
    .filter((a) => a.getAttribute('href')?.startsWith('/course#'));
  expect(topics).toHaveLength(12);
});

it('gives every image alternative text and uses logos that exist', () => {
  const { container } = renderHome();
  const images = Array.from(container.querySelectorAll('img'));
  for (const img of images) expect(img).toHaveAttribute('alt');

  const publicDir = path.join(__dirname, '../../../../../public');
  for (const img of images) {
    const src = img.getAttribute('src')!;
    if (src.startsWith('/')) expect(fs.existsSync(path.join(publicDir, src))).toBe(true);
  }
  expect(screen.getByRole('img', { name: 'Microsoft' })).toHaveAttribute(
    'src',
    '/images/companylogos/windows.svg',
  );
});
