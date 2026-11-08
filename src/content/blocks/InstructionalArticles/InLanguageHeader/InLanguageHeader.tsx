import * as React from 'react';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import { LanguageName } from 'utils/constants/lesson';

interface Props {
  dataStructure: string;
}

const InLanguageHeader: React.FC<Props> = ({ dataStructure }) => {
  const { language } = useCodingLanguage();
  return (
    <p>
      <strong>
        {dataStructure} in {LanguageName[language]}:
      </strong>
    </p>
  );
};

export default InLanguageHeader;
