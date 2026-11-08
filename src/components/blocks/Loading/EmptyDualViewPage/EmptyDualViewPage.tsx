import * as React from 'react';
import { useLessonDimensions } from 'components/context/AppState/useAppState';
import PageWithVideo from 'components/pages/PageLayout/PageWithVideo';
import ActionBarDisabled from 'components/blocks/ActionBar/ActionBarDisabled';

import { PageContainer, Wrapper, Left, Right } from './styles';

const EmptyDualViewPage: React.FC = () => {
  const { videoWidth, textWidth } = useLessonDimensions();
  return (
    <PageWithVideo>
      <PageContainer>
        <ActionBarDisabled />
        <Wrapper>
          <Left width={textWidth}> </Left>
          <Right width={videoWidth}> </Right>
        </Wrapper>
      </PageContainer>
    </PageWithVideo>
  );
};

export default EmptyDualViewPage;
