import * as React from 'react';
import { NextPage } from 'next';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import StyledMarkdown from 'components/blocks/StyledMarkdown';
import PrivacyPolicy from './PrivacyPolicy.mdx';

import { Title, ContentWrapper } from './styles';

const PrivacyPage: NextPage = () => (
  <PageLayoutDefault>
    <ContentWrapper>
      <StyledMarkdown>
        <Title>Skilled.dev Privacy Policy</Title>
        <PrivacyPolicy />
      </StyledMarkdown>
    </ContentWrapper>
  </PageLayoutDefault>
);

export default PrivacyPage;
