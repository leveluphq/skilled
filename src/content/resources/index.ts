import catalog from './catalog.json';
import course from './course.json';

export interface Resource {
  section: string;
  slug: string;
  title: string;
  description: string;
  published: string;
  updated: string;
  lessons: string[];
  related: string[];
  language?: string;
  languages?: string[];
  images?: string[];
}
export type PublicLesson = (typeof course.lessons)[number];
export const resources: Resource[] = catalog;
export const lessons: PublicLesson[] = course.lessons;
export const sectionNames: Record<string, string> = {
  guides: 'Guides',
  topics: 'Topics',
  patterns: 'Patterns',
  tools: 'Interactive tools',
  'interview-prep': 'Language preparation',
  'study-plans': 'Study plans',
  reference: 'Reference',
};
export const resourcePath = (resource: Resource) => `/${resource.section}/${resource.slug}`;
export const getResource = (id: string) => resources.find((r) => `${r.section}/${r.slug}` === id);
export const languageGuides = resources.filter((r) => r.section === 'interview-prep');
export const getLanguageGuide = (language: string) =>
  languageGuides.find((r) => r.slug === language);
export const getLanguageResources = (language: string) => {
  const guide = getLanguageGuide(language);
  return guide
    ? [
        guide,
        ...resources.filter(
          (r) => (r.language === language || r.languages?.includes(language)) && r !== guide,
        ),
      ]
    : [];
};
export const getRelatedResources = (resource: Resource) =>
  resource.related.map((id) => getResource(id)).filter((r): r is Resource => !!r);
export const getRelatedLessons = (resource: Resource) =>
  resource.lessons
    .map((slug) => lessons.find((lesson) => lesson.slug === slug))
    .filter((lesson): lesson is PublicLesson => !!lesson);
