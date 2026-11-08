import { CodingLanguage, codingLanguageList } from 'utils/constants/lesson';

export const LANGUAGE_KEY = '@@skilled/preferred-language';
// An explicit choice in this tab takes priority over a late profile response.
export const LANGUAGE_CHOICE_KEY = '@@skilled/language-choice';

export const isCodingLanguage = (value: unknown): value is CodingLanguage =>
  codingLanguageList.includes(value as CodingLanguage);

export const readLanguage = (storage: 'localStorage' | 'sessionStorage', key: string) => {
  try {
    const value: unknown = JSON.parse(window[storage].getItem(key) || 'null');
    return isCodingLanguage(value) ? value : null;
  } catch {
    return null;
  }
};

export const rememberLanguage = (language: CodingLanguage) => {
  for (const [storage, key] of [
    ['localStorage', LANGUAGE_KEY],
    ['sessionStorage', LANGUAGE_CHOICE_KEY],
  ] as const) {
    try {
      window[storage].setItem(key, JSON.stringify(language));
    } catch {
      // Storage is optional; a selection still works in the current page.
    }
  }
};
