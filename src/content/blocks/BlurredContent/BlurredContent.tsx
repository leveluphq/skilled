import React from 'react';
import { BasePalette } from 'style/theme';

import { Wrapper, Blur, BlurToggleButton } from './styles';

interface Props {
  buttonText?: string;
}

const BlurredContent: React.FC<Props> = ({ children, buttonText = 'Show Solution' }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const toggle = React.useCallback(() => {
    setIsVisible(true);
  }, []);

  return (
    <Wrapper>
      {!isVisible && (
        <BlurToggleButton solid hoverable color={BasePalette.Teal} onClick={toggle}>
          {buttonText}
        </BlurToggleButton>
      )}
      <Blur isVisible={isVisible}>{children}</Blur>
    </Wrapper>
  );
};

export default BlurredContent;
