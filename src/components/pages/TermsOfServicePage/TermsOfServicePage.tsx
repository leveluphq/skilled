import * as React from 'react';
import { NextPage } from 'next';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import StyledMarkdown from 'components/blocks/StyledMarkdown';
import TermsOfService from './TermsOfService.mdx';

import { Title, ContentWrapper } from './styles';

const TermsOfServicePage: NextPage = () => (
  <PageLayoutDefault>
    <ContentWrapper>
      <StyledMarkdown>
        <Title>Website Terms and Conditions of Use</Title>
        <TermsOfService />
      </StyledMarkdown>
    </ContentWrapper>
  </PageLayoutDefault>
);

export default TermsOfServicePage;
