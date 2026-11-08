import { useContext } from 'react';
import CodingLanguageContext from 'components/context/CodingLanguage/CodingLanguageContext';

const useCodingLanguage = () => {
  return useContext(CodingLanguageContext);
};

export default useCodingLanguage;
