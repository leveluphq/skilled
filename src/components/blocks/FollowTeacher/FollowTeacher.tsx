import * as React from 'react';
import styled from 'styled-components';
import { ArrowRight16, LogoLinkedin16, LogoTwitter16, LogoYoutube16 } from '@carbon/icons-react';
import { BasePalette } from 'style/theme';
import { mobile } from 'style/breakpoints';
import { rgba } from 'style/utils/color';
import { TREY_TWITTER, TREY_LINKEDIN, TREY_YOUTUBE, JOBS_LINK } from 'utils/constants/internal';

/* The teacher's profiles as chips in each network's color, and the job board in brand yellow */
const Row = styled.nav<{ align: 'center' | 'start' }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ align }) => (align === 'center' ? 'center' : 'flex-start')};
  gap: 10px;
  font-size: 14px;

  > span {
    margin-right: 6px;
    color: ${({ theme }) => theme.color.textLight};
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    background-color: ${rgba(BasePalette.White, 0.06)};
    font-weight: 600;
    color: ${({ theme }) => theme.color.textPrimary};
    text-decoration: none;
    transition: background-color 150ms ease, transform 150ms ease;
  }

  a:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  a:hover {
    background-color: ${rgba(BasePalette.White, 0.12)};
    transform: translateY(-1px);
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.brand};
    outline-offset: 2px;
  }

  svg {
    flex: none;
    fill: currentColor;
  }

  a[href*='x.com'] svg {
    fill: ${BasePalette.White};
  }

  a[href*='linkedin.com'] svg {
    fill: #4a9eff;
  }

  a[href*='youtube.com'] svg {
    fill: #ff4e45;
  }

  ${mobile()} {
    > span {
      flex-basis: 100%;
      margin: 0 0 2px;
    }

    a {
      height: 34px;
      padding: 0 12px;
      font-size: 13px;
    }
  }
`;

const JobLink = styled.a`
  && {
    background-color: ${rgba(BasePalette.Brand, 0.14)};
    color: ${({ theme }) => theme.color.brand};
  }

  &&:hover {
    background-color: ${rgba(BasePalette.Brand, 0.24)};
  }

  svg {
    transition: transform 150ms ease;
  }

  &:hover svg {
    transform: translateX(2px);
  }
`;

interface Props {
  align?: 'center' | 'start';
  showJob?: boolean;
  className?: string;
}

const FollowTeacher: React.FC<Props> = ({ align = 'center', showJob = true, className }) => (
  <Row aria-label="Follow your teacher" align={align} className={className}>
    <span>Follow your teacher</span>
    <a href={TREY_TWITTER} target="_blank" rel="noopener noreferrer">
      <LogoTwitter16 /> @treyhuffine
    </a>
    <a href={TREY_LINKEDIN} target="_blank" rel="noopener noreferrer">
      <LogoLinkedin16 /> LinkedIn
    </a>
    <a href={TREY_YOUTUBE} target="_blank" rel="noopener noreferrer">
      <LogoYoutube16 /> YouTube
    </a>
    {showJob && (
      <JobLink href={JOBS_LINK} target="_blank" rel="noopener noreferrer">
        When you're ready, find a job <ArrowRight16 />
      </JobLink>
    )}
  </Row>
);

export default FollowTeacher;
