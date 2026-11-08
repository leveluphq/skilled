import * as React from 'react';
import SkipToContent from 'components/pages/PageLayout/SkipToContent';
// import Navbar from 'components/blocks/Navbar';
// import Footer from 'components/pages/PageLayout/Footer';
import { Props } from './props';

import { Page, PageContent } from '../styles';

const PageLayoutDefault: React.FC<Props> = ({
  children,
  hideSkipToContent,
  // hideNav,
  subNav,
  // disableHeadroom,
  // isNavbarFixed,
  // hideFooter,
  // hideContinue,
}) => {
  return (
    <Page>
      {!hideSkipToContent && <SkipToContent />}
      {subNav}
      <PageContent tabIndex={-1}>{children}</PageContent>
    </Page>
  );
};

export default PageLayoutDefault;
