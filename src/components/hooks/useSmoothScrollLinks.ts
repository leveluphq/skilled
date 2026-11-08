import * as React from 'react';
import { smoothScrollLinks, unSmoothScrollLinks } from 'utils/client/dom';

const useSmoothScrollLinks = () => {
  React.useEffect(() => {
    // NOTE: Hack because this was smooth scrolling pages to the top on client side route changes
    setTimeout(() => {
      smoothScrollLinks();
    }, 10);

    return () => unSmoothScrollLinks();
  }, []);
};

export default useSmoothScrollLinks;
