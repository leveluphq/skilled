import * as React from 'react';
import Head from 'components/blocks/Head';
import PrivacyPage from './PrivacyPage';

const PrivacyPageContainer = () => {
  return (
    <>
      <Head title="Privacy Policy" description="Skilled.dev Privacy Policy" useCurrentUrl />

      <PrivacyPage />
    </>
  );
};

export default PrivacyPageContainer;
