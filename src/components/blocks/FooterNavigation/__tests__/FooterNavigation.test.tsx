import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import FooterNavigation from '../FooterNavigation';

const renderFooter = () =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <FooterNavigation />
    </ThemeProvider>,
  );

it('has an open-source column whose GitHub links open in a new tab', () => {
  renderFooter();
  const column = screen.getByRole('heading', { name: 'Open source' }).closest('section')!;
  const link = (name: string) => within(column).getByRole('link', { name });

  for (const [name, href] of [
    ['GitHub', 'https://github.com/leveluphq/skilled'],
    ['Report a security issue', 'https://github.com/leveluphq/skilled/security/policy'],
    ['License', 'https://github.com/leveluphq/skilled/blob/main/LICENSE'],
  ]) {
    expect(link(name)).toHaveAttribute('href', href);
    expect(link(name)).toHaveAttribute('target', '_blank');
    expect(link(name)).toHaveAttribute('rel', 'noopener noreferrer');
  }

  // Pages on the site stay in the same tab
  expect(link('Docs')).toHaveAttribute('href', '/docs');
  expect(link('Docs')).not.toHaveAttribute('target');
  expect(link('Run it locally')).toHaveAttribute('href', '/docs#install');
});
