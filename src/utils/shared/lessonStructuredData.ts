import course from 'content/resources/course.json';
import { lessonMetadata } from './lessonMetadata';
import { absoluteUrl, site } from './site';
import lessonLanguages from 'content/lessonLanguages.gen';
import {
  getLessonWalkthroughs,
  walkthroughPath,
  walkthroughLanguage,
} from 'content/lesson-walkthroughs';
import { programmingLanguageSubject } from './programmingLanguages';
import overviews from 'content/resources/lesson-overviews.json';

/** Describe published teaching material without exposing solutions or viewer state. */
export const lessonStructuredData = (slug: string): Record<string, unknown>[] | null => {
  const lesson = course.lessons.find((item) => item.slug === slug);
  if (!lesson) return null;
  const metadata = lessonMetadata({ slug: lesson.slug, title: lesson.title });
  const url = absoluteUrl(`/course/${lesson.slug}`);
  const languages = lessonLanguages[slug] || getLessonWalkthroughs(slug).map(walkthroughLanguage);
  return [
    {
      '@context': 'https://schema.org',
      '@type': ['WebPage', 'LearningResource'],
      '@id': `${url}#lesson`,
      url,
      name: metadata.title,
      description: metadata.description,
      inLanguage: 'en',
      ...(overviews[slug as keyof typeof overviews]
        ? { teaches: overviews[slug as keyof typeof overviews].focus }
        : {}),
      ...(languages.length
        ? {
            about: languages.map((language) => programmingLanguageSubject(language.toLowerCase())),
          }
        : {}),
      ...(getLessonWalkthroughs(slug).length
        ? {
            hasPart: getLessonWalkthroughs(slug).map((page) => ({
              '@type': 'LearningResource',
              name: page.title,
              url: absoluteUrl(walkthroughPath(page)),
            })),
          }
        : {}),
      learningResourceType: lesson.type === 'INSTRUCTIONAL' ? 'Lesson' : 'Practice question',
      isPartOf: { '@id': `${absoluteUrl('/course')}#course` },
      publisher: { '@id': `${site.origin}/#publisher` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Course', item: absoluteUrl('/course') },
        { '@type': 'ListItem', position: 2, name: lesson.title, item: url },
      ],
    },
  ];
};
