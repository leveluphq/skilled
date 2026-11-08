import * as React from 'react';
import { NextPage } from 'next';
import ViewerContext from 'components/context/ViewerContext';
import { useGetAffiliateViewerQuery } from 'types/generated/client';
import Head from 'components/blocks/Head';
import AffiliatePage from './AffiliatePage';

const AffiliatePageContainer: NextPage = () => {
  // NOTE: How can I SSG these situations? I can't request a user without a viewerId, but the viewerId doesn't exist until it's on the client.
  const viewerId = React.useContext(ViewerContext);

  if (viewerId) {
    const { data, loading, error } = useGetAffiliateViewerQuery({
      variables: {
        id: viewerId,
      },
    });
    return (
      <>
        <Head
          title="Affiliate Dashboard"
          description="Your affiliate dashboard."
          noIndex
          useCurrentUrl
        />

        <AffiliatePage data={data} loading={loading} error={error} />
      </>
    );
  } else {
    const isServer = typeof window === 'undefined';
    return (
      <>
        <Head
          title="Affiliate Dashboard"
          description="Your affiliate dashboard."
          noIndex
          useCurrentUrl
        />

        <AffiliatePage loading={isServer} />
      </>
    );
  }
};

export default AffiliatePageContainer;
