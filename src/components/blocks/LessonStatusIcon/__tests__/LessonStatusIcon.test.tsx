/**
 * LessonStatusIcon is the per-lesson progress marker shown in the sidebar and on
 * every lesson card. It must stay silent for the "nothing interesting yet"
 * statuses - rendering a checkmark for an in-progress lesson would misreport
 * progress across the whole course listing.
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { LessonStatus } from 'utils/constants/lesson';
import LessonStatusIcon from '../LessonStatusIcon';

const renderIcon = (status: any) =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <LessonStatusIcon status={status} />
    </ThemeProvider>,
  );

describe('LessonStatusIcon', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['init', LessonStatus.Init],
    ['in progress', LessonStatus.InProgress],
    ['an unrecognised status', 'SOMETHING_ELSE'],
  ])('renders nothing for %s', (_label, status) => {
    const { container } = renderIcon(status);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders an icon for a lesson that needs review', () => {
    const { container } = renderIcon(LessonStatus.NeedsReview);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders an icon for a completed lesson', () => {
    const { container } = renderIcon(LessonStatus.Complete);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('uses visually distinct icons for review and complete', () => {
    const review = renderIcon(LessonStatus.NeedsReview).container.innerHTML;
    const complete = renderIcon(LessonStatus.Complete).container.innerHTML;

    expect(review).not.toEqual(complete);
  });
});
