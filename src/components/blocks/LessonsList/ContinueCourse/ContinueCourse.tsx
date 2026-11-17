import * as React from 'react';
import Link from 'next/link';
import { ArrowRight20 } from '@carbon/icons-react';
import LessonStatusIcon from 'components/blocks/LessonStatusIcon';
import getActiveLessonSlug from 'utils/client/getActiveLessonSlug';
import { Container } from 'style/elements';
import { Props } from './props';

import {
  Continue,
  ContinueLink,
  ContinueSectionTitle,
  ContinueTitle,
  ContinueDescription,
} from '../styles';

const ContinueCourse: React.FC<Props> = ({ data, statuses }) => {
  const viewer = data && data.users_by_pk;
  const { href } = getActiveLessonSlug(viewer);
  const activeLesson = viewer && viewer.activeLesson;

  if (!activeLesson || !href) {
    return null;
  }

  return (
    <Container>
      <Continue>
        <Link href={href} passHref>
          <ContinueLink>
            <div>
              <ContinueSectionTitle>Continue where you left off</ContinueSectionTitle>
              <ContinueTitle>
                {activeLesson.title} <LessonStatusIcon status={statuses[activeLesson.id]} />
              </ContinueTitle>
              {!!activeLesson.description && (
                <ContinueDescription>{activeLesson.description}</ContinueDescription>
              )}
            </div>
            <ArrowRight20 />
          </ContinueLink>
        </Link>
      </Continue>
    </Container>
  );
};

export default ContinueCourse;
