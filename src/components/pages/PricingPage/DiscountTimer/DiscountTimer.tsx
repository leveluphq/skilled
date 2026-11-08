import * as React from 'react';
import Countdown from 'components/blocks/Countdown';
import { Props } from './props';

import { Wrapper, CountdownWrapper, MetaText, TitleText } from './styles';

const DiscountTimer: React.FC<Props> = () => {
  return (
    <Wrapper>
      <TitleText>
        I didn't want to add another email to your inbox for Black Friday to notify you, so instead
        I'm extending our discount for another week so more devs have the opportunity to discover it
        and take advantage of this deal!
      </TitleText>
      <CountdownWrapper>
        <Countdown />
      </CountdownWrapper>
      <MetaText>Discount ends on December 8 at 1pm PST</MetaText>
    </Wrapper>
  );
};

export default DiscountTimer;
