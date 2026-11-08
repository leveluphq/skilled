import { codingLanguageList, LanguageName } from 'utils/constants/lesson';
import { languageGuides, resources } from 'content/resources';
import {
  programmingLanguageSubject,
  programmingLanguageSubjects,
  languageLearningResources,
} from '../programmingLanguages';
import { absoluteUrl } from '../site';

it('identifies every taught language as a subject while preserving English as the prose language', () => {
  expect(programmingLanguageSubjects).toHaveLength(codingLanguageList.length);
  for (const language of codingLanguageList) {
    const slug = language.toLowerCase();
    const url = absoluteUrl(`/interview-prep/${slug}`);
    const subject = programmingLanguageSubject(slug);
    expect(subject).toEqual({
      '@type': 'ComputerLanguage',
      '@id': `${url}#language`,
      name: LanguageName[language],
      url,
    });
    expect(languageLearningResources).toContainEqual(
      expect.objectContaining({ url, inLanguage: 'en', about: subject }),
    );
  }
  expect(programmingLanguageSubject('unknown')).toBeNull();
  expect(programmingLanguageSubject()).toBeNull();
  expect(languageGuides.every((guide) => guide.language === guide.slug)).toBe(true);
  for (const resource of resources.filter((item) => item.language))
    expect(programmingLanguageSubject(resource.language)).not.toBeNull();
});
