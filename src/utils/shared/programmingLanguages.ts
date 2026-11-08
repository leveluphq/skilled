import { languageGuides, resourcePath } from 'content/resources';
import { CodingLanguage, LanguageName } from 'utils/constants/lesson';
import { absoluteUrl } from './site';

export const programmingLanguageLabel = (slug: string) =>
  LanguageName[slug.toUpperCase() as CodingLanguage] || slug;

/** Programming languages describe the subject; the human prose is still English. */
export const programmingLanguageSubject = (slug?: string) => {
  const guide = languageGuides.find((item) => item.slug === slug);
  if (!guide) return null;
  const url = absoluteUrl(resourcePath(guide));
  return {
    '@type': 'ComputerLanguage',
    '@id': `${url}#language`,
    name: programmingLanguageLabel(guide.slug),
    url,
  };
};

export const programmingLanguageSubjects = languageGuides.map((guide) =>
  programmingLanguageSubject(guide.slug),
);

export const languageLearningResources = languageGuides.map((guide) => ({
  '@type': 'LearningResource',
  name: guide.title,
  url: absoluteUrl(resourcePath(guide)),
  inLanguage: 'en',
  about: programmingLanguageSubject(guide.slug),
}));
