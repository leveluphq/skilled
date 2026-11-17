import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { TREY_TWITTER, TREY_LINKEDIN, TREY_YOUTUBE, JOBS_LINK } from 'utils/constants/internal';
import FollowTeacher from '../FollowTeacher';

const renderFollow = (props = {}) =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <FollowTeacher {...props} />
    </ThemeProvider>,
  );

it("links the teacher's profiles and the job board, each in a new tab", () => {
  renderFollow();
  const nav = screen.getByRole('navigation', { name: 'Follow your teacher' });
  const links = within(nav).getAllByRole('link');
  expect(links.map((a) => a.getAttribute('href'))).toEqual([
    TREY_TWITTER,
    TREY_LINKEDIN,
    TREY_YOUTUBE,
    JOBS_LINK,
  ]);
  for (const link of links) {
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
});

it('can leave out the job link', () => {
  renderFollow({ showJob: false });
  expect(screen.getAllByRole('link')).toHaveLength(3);
  expect(screen.queryByRole('link', { name: /find a job/i })).not.toBeInTheDocument();
});
