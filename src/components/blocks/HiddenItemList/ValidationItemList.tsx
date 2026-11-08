import * as React from 'react';
import ValidationSection from 'components/blocks/SectionWithHeader/ValidationSection';
import { ValidationProps } from 'content/props';
import HiddenItemList from './HiddenItemList';

import { Wrapper } from './styles';

interface Props extends ValidationProps {
  items: React.FC[];
}

const ValidationItemList: React.FC<Props> = ({
  validationStepsViewed,
  isComplete,
  items,
  isActiveSection,
}) => {
  return (
    <Wrapper isVisible={isComplete || validationStepsViewed > 0}>
      <ValidationSection>
        <HiddenItemList
          isComplete={isComplete}
          items={items}
          numberViewed={validationStepsViewed}
          isActiveSection={isActiveSection}
        />
      </ValidationSection>
    </Wrapper>
  );
};

export default ValidationItemList;
