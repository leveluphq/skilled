import * as React from 'react';
import Head from 'components/blocks/Head';
import TermsOfServicePage from './TermsOfServicePage';

const TermsOfServicePageContainer = () => {
  return (
    <>
      <Head title="Terms of Service" description="Skilled.dev Terms of Service" useCurrentUrl />

      <TermsOfServicePage />
    </>
  );
};

export default TermsOfServicePageContainer;
