import * as React from 'react';
import SkipToContent from 'components/pages/PageLayout/SkipToContent';
import Navbar from 'components/blocks/Navbar';
import Footer from 'components/pages/PageLayout/Footer';
import { Props } from './props';

import { Page } from '../styles';
import { PageContent } from './styles';

const PageWithSidebarLayout: React.FC<Props> = ({
  children,
  hideSkipToContent,
  hideNav,
  subNav,
  sidebar,
  disableHeadroom,
  isNavbarFixed,
  hideFooter,
  hideContinue,
  right,
}) => {
  return (
    <Page>
      {!hideSkipToContent && <SkipToContent />}
      {!hideNav && (
        <Navbar
          disableHeadroom={disableHeadroom}
          isFixed={isNavbarFixed}
          hideContinue={hideContinue}
          sidebar
          right={right}
        />
      )}
      {subNav}
      {sidebar}
      <PageContent tabIndex={-1} right={right}>
        {children}
      </PageContent>
      {!hideFooter && <Footer sidebar right={right} />}
    </Page>
  );
};

export default PageWithSidebarLayout;
