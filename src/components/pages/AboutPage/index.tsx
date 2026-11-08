import * as React from 'react';
import Head from 'components/blocks/Head';
import AboutPage from './AboutPage';

const AboutPageContainer = () => {
  return (
    <>
      <Head title="About the course and instructor" description="Learn about Trey Huffine, the instructor behind the coding interview curriculum, and the experience that shaped its lessons and exercises." useCurrentUrl />

      <AboutPage />
    </>
  );
};

export default AboutPageContainer;
