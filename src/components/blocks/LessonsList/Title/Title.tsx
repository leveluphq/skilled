import * as React from 'react';
import { publicCourse } from 'content/resources/publicCourse';
import { LessonType } from 'utils/constants/lesson';
import FollowTeacher from 'components/blocks/FollowTeacher';

import { Header, Eyebrow, TitleText, Lead } from '../styles';

const lessons = publicCourse.categories.reduce<
  typeof publicCourse.categories[0]['lessons']
>((all, category) => all.concat(category.lessons), []);
const questions = lessons.filter((lesson) => lesson.type === LessonType.Question).length;

/** The course page's header: what's in the course, and the teacher's links. */
const Title = () => (
  <Header>
    <Eyebrow>The course</Eyebrow>
    <TitleText>Coding interview course</TitleText>
    <Lead>
      {lessons.length} lessons across {publicCourse.categories.length} topics:{' '}
      {lessons.length - questions} that teach the ideas, and {questions} interview questions you
      solve and test in the editor.
    </Lead>
    <FollowTeacher align="start" showJob={false} />
  </Header>
);

export default Title;
