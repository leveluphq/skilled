import * as React from 'react';

import { SkipButton } from './styles';

const skipToMain = () => {
  const main = document.getElementsByTagName('main')[0];

  if (main && main.offsetTop) {
    main.focus({ preventScroll: true });
    if (window.scrollTo) {
      const scrollPosition = main.offsetTop;
      window.scrollTo({ left: 0, top: scrollPosition, behavior: 'auto' });
    }
  }
};

const SkipToContent = () => {
  return <SkipButton onClick={skipToMain}>Skip to content</SkipButton>;
};

export default SkipToContent;
