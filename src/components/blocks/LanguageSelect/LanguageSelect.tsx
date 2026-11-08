import * as React from 'react';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import { codingLanguageList, LanguageName } from 'utils/constants/lesson';
import { runnableLanguages } from 'utils/shared/runner/settings';
import noop from 'utils/shared/noop';
import DropdownButton from './DropdownButton';

import { LanguageSelectorWrapper } from './styles';

const LanguageSelect: React.FC<{ up?: boolean; left?: boolean }> = ({ up, left }) => {
  const { language, setLanguage } = useCodingLanguage();

  return (
    <LanguageSelectorWrapper>
      <DropdownButton
        up={up}
        left={left}
        handleFocus={noop}
        handleBlur={noop}
        triggerText={LanguageName[language]}
        items={runnableLanguages(codingLanguageList).map((l) => {
          return {
            name: LanguageName[l],
            onClick: () => setLanguage(l),
          };
        })}
      />
    </LanguageSelectorWrapper>
  );
};

export default LanguageSelect;
