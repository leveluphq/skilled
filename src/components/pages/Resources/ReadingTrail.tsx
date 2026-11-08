import * as React from 'react';
import Link from 'next/link';
import {
  LessonWalkthrough,
  getWalkthroughNeighbors,
  walkthroughPath,
} from 'content/lesson-walkthroughs';
import { programmingLanguageLabel } from 'utils/shared/programmingLanguages';
import { Section, Grid, Card } from './styles';

export default function ReadingTrail({ page }: { page: LessonWalkthrough }) {
  const { previous, next } = getWalkthroughNeighbors(page);
  if (!previous && !next) return null;
  const label = programmingLanguageLabel(page.language);
  return (
    <Section className="screen-related">
      <h2>Continue reading in {label}</h2>
      <p>
        Follow the lessons in this topic. Reading another walkthrough keeps your course progress and
        saved editor language unchanged.
      </p>
      <nav aria-label={`${label} reading sequence`}>
        <Grid>
          {[
            { page: previous, direction: 'Previous' },
            { page: next, direction: 'Next' },
          ].map(({ page: neighbor, direction }) =>
            neighbor ? (
              <Link href={walkthroughPath(neighbor)} passHref key={direction}>
                <Card rel={direction === 'Previous' ? 'prev' : 'next'}>
                  <small>{direction} in this topic</small>
                  <h3>{neighbor.title}</h3>
                  <p>{neighbor.description}</p>
                </Card>
              </Link>
            ) : null,
          )}
        </Grid>
      </nav>
    </Section>
  );
}
