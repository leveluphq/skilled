import * as React from 'react';
import ViewerContext from 'components/context/ViewerContext';
import { useGetViewerQuery } from 'types/generated/client';
import Head from 'components/blocks/Head';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import { absoluteUrl, site } from 'utils/shared/site';
import {
  programmingLanguageSubjects,
  languageLearningResources,
} from 'utils/shared/programmingLanguages';
import HomePage from './HomePage';

const DEFAULT_TITLE = 'Coding interview practice, guides, and interactive tools';
const DESCRIPTION =
  'Prepare with data structures, algorithms, and guides for JavaScript, TypeScript, Python, Java, C++, C#, Go, Kotlin, Swift, and Rust.';

const homeData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${absoluteUrl('/')}#home`,
  name: DEFAULT_TITLE,
  description: DESCRIPTION,
  url: absoluteUrl('/'),
  inLanguage: 'en',
  isPartOf: { '@id': `${site.origin}/#website` },
  about: programmingLanguageSubjects,
  hasPart: languageLearningResources,
};

const HomePageContainer = () => {
  const viewerToken = React.useContext(ViewerContext);

  if (viewerToken) {
    const { data, loading, error } = useGetViewerQuery({ variables: { id: viewerToken } });
    return (
      <>
        <Head title={DEFAULT_TITLE} description={DESCRIPTION} useCurrentUrl />
        <StructuredData data={homeData} />

        <HomePage loading={loading} error={error} data={data} />
      </>
    );
  } else {
    return (
      <>
        <Head title={DEFAULT_TITLE} description={DESCRIPTION} useCurrentUrl />
        <StructuredData data={homeData} />

        <HomePage loading={false} />
      </>
    );
  }
};

export default HomePageContainer;
