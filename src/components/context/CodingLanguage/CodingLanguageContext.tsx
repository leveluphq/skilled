import * as React from 'react';
import { CodingLanguage } from 'utils/constants/lesson';
export { LANGUAGE_KEY } from 'utils/client/programmingLanguagePreference';

const CodingLanguageContext = React.createContext({
  language: CodingLanguage.Javascript,
  setLanguage: (_language: CodingLanguage) => {},
});

export default CodingLanguageContext;
