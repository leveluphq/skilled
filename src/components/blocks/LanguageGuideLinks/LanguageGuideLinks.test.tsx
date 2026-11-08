import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import ThemeProvider from 'components/context/ThemeProvider';
import { codingLanguageList, LanguageName } from 'utils/constants/lesson';
import LanguageGuideLinks from './LanguageGuideLinks';

it('makes every language guide visible and directly navigable without changing editor availability', () => {
  render(
    <ThemeProvider>
      <LanguageGuideLinks />
    </ThemeProvider>,
  );
  const navigation = screen.getByRole('navigation', { name: 'Course companion language guides' });
  expect(within(navigation).getAllByRole('link')).toHaveLength(codingLanguageList.length);
  for (const language of codingLanguageList)
    expect(
      within(navigation).getByRole('link', { name: LanguageName[language], exact: true }),
    ).toHaveAttribute('href', `/interview-prep/${language.toLowerCase()}`);
  expect(screen.getByText(/configured runner/)).toBeInTheDocument();
});
