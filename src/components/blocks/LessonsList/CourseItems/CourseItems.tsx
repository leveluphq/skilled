import * as React from 'react';
import Link from 'next/link';
import { Container } from 'style/elements';
import LessonCard from 'components/blocks/LessonCard';
import FeedbackModal from 'components/blocks/Modal/FeedbackModal';
import { GetCategoryLessonsQuery } from 'types/generated/client';
import { PageRoot } from 'utils/constants/routes';
import { Statuses, LessonType } from 'utils/constants/lesson';
import { Tabs, TABS, Lessons } from '../props';

import {
  SectionTitle,
  SectionSubtitle,
  SectionDescription,
  Section,
  List,
  StyledLink,
  Item,
  QuestionWrapper,
} from '../styles';

interface BaseProps {
  statuses: Statuses;
  activeTab: Tabs;
}

interface MainProps extends BaseProps {
  categories: GetCategoryLessonsQuery['categories'];
}

interface SectionProps extends BaseProps {
  lessons: Lessons;
}

const LessonList: React.FC<SectionProps & { title: string }> = ({ lessons, statuses, title }) => {
  return (
    <QuestionWrapper>
      <SectionSubtitle>{title}</SectionSubtitle>
      <List>
        {lessons.length > 0 &&
          lessons.map((lesson) => {
            return (
              <Item key={lesson.id}>
                <Link href={`/${PageRoot.Course}/${lesson.slug}`} passHref>
                  <StyledLink>
                    <LessonCard hoverable lesson={lesson} status={statuses[lesson.id]} />
                  </StyledLink>
                </Link>
              </Item>
            );
          })}
      </List>
    </QuestionWrapper>
  );
};

const CourseSection: React.FC<SectionProps> = ({ lessons, statuses, activeTab }) => {
  const activeLessons = React.useMemo(() => {
    const getActiveLessons = TABS[activeTab].getActiveLessons;
    return getActiveLessons(lessons, statuses);
  }, [activeTab, lessons, statuses]);
  const learn = activeLessons.filter((l) => l.type === LessonType.Instructional);
  const questions = activeLessons.filter((l) => l.type === LessonType.Question);

  return (
    <div>
      {learn.length > 0 && (
        <LessonList lessons={learn} statuses={statuses} title="Learn" activeTab={activeTab} />
      )}
      {questions.length > 0 && (
        <LessonList
          lessons={questions}
          statuses={statuses}
          title="Questions"
          activeTab={activeTab}
        />
      )}
    </div>
  );
};

const CourseItems: React.FC<MainProps> = ({ categories, statuses, activeTab }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);

  return (
    <>
      {categories.map((category, index) => {
        return (
          <Section id={category.slug} key={category.id}>
            <Container>
              <SectionTitle>
                {index}. {category.title}
              </SectionTitle>
              {!!category.description && (
                <SectionDescription>{category.description}</SectionDescription>
              )}
              <CourseSection lessons={category.lessons} statuses={statuses} activeTab={activeTab} />
            </Container>
          </Section>
        );
      })}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};

export default CourseItems;
