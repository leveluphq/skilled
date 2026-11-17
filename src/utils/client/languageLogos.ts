import { CodingLanguage } from 'utils/constants/lesson';

// A logo for each language the code editor runs
const LOGOS = 'https://gitconnected.com/public/images/tutorials/svg';

export const LANGUAGE_LOGOS: Record<CodingLanguage, string> = {
  [CodingLanguage.Javascript]: `${LOGOS}/javascript.svg`,
  [CodingLanguage.Typescript]: `${LOGOS}/typescript.svg`,
  [CodingLanguage.Python]: `${LOGOS}/python.svg`,
  [CodingLanguage.Java]: `${LOGOS}/java.svg`,
  [CodingLanguage.Cpp]: `${LOGOS}/c-plus-plus.svg`,
  [CodingLanguage.Csharp]: `${LOGOS}/c-sharp.svg`,
  [CodingLanguage.Go]: `${LOGOS}/golang.svg`,
  [CodingLanguage.Kotlin]: `${LOGOS}/kotlin.svg`,
  [CodingLanguage.Swift]: `${LOGOS}/ios-swift.svg`,
  // Rust's logo is black, so this copy is white for the dark background
  [CodingLanguage.Rust]: '/images/languages/rust.svg',
};

/** The logo for a language guide's slug, such as `python` */
export const languageLogo = (slug: string) =>
  LANGUAGE_LOGOS[slug.toUpperCase() as CodingLanguage];
