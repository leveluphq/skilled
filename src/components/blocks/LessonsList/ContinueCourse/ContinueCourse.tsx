import * as React from 'react';
import Link from 'next/link';
import LessonCard from 'components/blocks/LessonCard';
import getActiveLessonSlug from 'utils/client/getActiveLessonSlug';
import { Container } from 'style/elements';
import { Props } from './props';

import { ContinueSectionTitle, Section, StyledLink } from '../styles';

const ContinueCourse: React.FC<Props> = ({ data, statuses }) => {
  const viewer = data && data.users_by_pk;
  const { href } = getActiveLessonSlug(viewer);
  const activeLesson = viewer && viewer.activeLesson;

  if (!activeLesson || !href) {
    return null;
  }

  return (
    <Section>
      <Container>
        <ContinueSectionTitle>Continue where you left off:</ContinueSectionTitle>
        <Link href={href} passHref>
          <StyledLink>
            <LessonCard
              hoverable
              showDescription
              lesson={activeLesson}
              status={statuses[activeLesson.id]}
            />
          </StyledLink>
        </Link>
      </Container>
    </Section>
  );
};

export default ContinueCourse;
