import * as React from 'react';
import Head from 'components/blocks/Head';
import CoursePage from './CoursePage';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import { site, absoluteUrl } from 'utils/shared/site';
import { languageLearningResources } from 'utils/shared/programmingLanguages';
import course from 'content/resources/course.json';

const CoursePageContainer = () => {
  return (
    <>
      <Head
        title="Coding Interview Course"
        description="Study data structures and algorithms with coding exercises and companion interview preparation guides in ten programming languages."
        useCurrentUrl
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          '@id': `${absoluteUrl('/course')}#course`,
          name: 'Coding interview course',
          url: absoluteUrl('/course'),
          description:
            'Data structures, algorithms, and JavaScript practice, with companion guides in ten programming languages. Editor language availability depends on the exercise and configured runner.',
          provider: { '@id': `${site.origin}/#publisher` },
          teaches: ['Data structures', 'Algorithm design', 'Coding interview problem solving'],
          hasPart: [
            ...course.lessons.map((lesson) => ({
              '@type': 'LearningResource',
              '@id': `${absoluteUrl(`/course/${lesson.slug}`)}#lesson`,
              name: lesson.title,
              url: absoluteUrl(`/course/${lesson.slug}`),
            })),
            ...languageLearningResources,
          ],
        }}
      />

      <CoursePage />
    </>
  );
};

export default CoursePageContainer;
