import * as React from 'react';
import ExplanationSection from 'components/blocks/SectionWithHeader/ExplanationSection';
import { ExplanationProps } from 'content/props';
import HiddenItemList from './HiddenItemList';

import { Wrapper } from './styles';

interface Props extends ExplanationProps {
  items: React.FC[];
}

const ExplanationItemList: React.FC<Props> = ({
  explanationStepsViewed,
  isComplete,
  items,
  isActiveSection,
  scrollRef,
}) => {
  return (
    <Wrapper isVisible={isComplete || explanationStepsViewed > 0}>
      <ExplanationSection>
        <HiddenItemList
          isComplete={isComplete}
          items={items}
          numberViewed={explanationStepsViewed}
          isActiveSection={isActiveSection}
          scrollRef={scrollRef}
        />
      </ExplanationSection>
    </Wrapper>
  );
};

export default ExplanationItemList;
