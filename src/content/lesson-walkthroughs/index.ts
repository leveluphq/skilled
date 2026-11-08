import catalog from './catalog.json';
import { CodingLanguage } from 'utils/constants/lesson';
import course from 'content/resources/course.json';

export interface LessonWalkthrough {
  lesson: string;
  language: string;
  title: string;
  description: string;
  kind?: 'concept' | 'implementation' | 'javascript';
}
// The content generator validates every kind and required language before publication.
export const lessonWalkthroughs = catalog as LessonWalkthrough[];
export const walkthroughPath = (page: LessonWalkthrough) =>
  `/course/${page.lesson}/${page.language}`;
export const walkthroughLanguage = (page: LessonWalkthrough) =>
  page.language.toUpperCase() as CodingLanguage;
export const getLessonWalkthroughs = (slug: string) =>
  lessonWalkthroughs.filter((page) => page.lesson === slug);
export const getLanguageWalkthroughs = (language: string) =>
  lessonWalkthroughs.filter((page) => page.language === language);

export const getLessonWalkthrough = (lesson: string, language?: string) =>
  lessonWalkthroughs.find((page) => page.lesson === lesson && page.language === language);

/** Reading navigation follows the published course order within one topic. */
export const getWalkthroughNeighbors = (page: LessonWalkthrough) => {
  const lesson = course.lessons.find((item) => item.slug === page.lesson);
  if (!lesson || !getLessonWalkthrough(page.lesson, page.language)) return {};
  const sequence = course.lessons
    .filter((item) => item.category === lesson.category)
    .sort((a, b) => a.position - b.position)
    .flatMap((item) => {
      const reading = getLessonWalkthrough(item.slug, page.language);
      return reading ? [reading] : [];
    });
  const index = sequence.findIndex((item) => item.lesson === page.lesson);
  return { previous: sequence[index - 1], next: sequence[index + 1] };
};
