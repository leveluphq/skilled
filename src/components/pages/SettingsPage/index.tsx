import * as React from 'react';
import { NextPage } from 'next';
import ViewerContext from 'components/context/ViewerContext';
import { useGetUserSettingsQuery } from 'types/generated/client';
import Head from 'components/blocks/Head';
import SettingsPage from './SettingsPage';

const SettingsPageContainer: NextPage = () => {
  // NOTE: How can I SSG these situations? I can't request a user without a viewerId, but the viewerId doesn't exist until it's on the client.
  const viewerId = React.useContext(ViewerContext);

  if (viewerId) {
    const { data, loading, error } = useGetUserSettingsQuery({
      variables: {
        id: viewerId,
      },
    });
    return (
      <>
        <Head title="Settings" description="Your settings." noIndex useCurrentUrl />

        <SettingsPage data={data} loading={loading} error={error} />
      </>
    );
  } else {
    const isServer = typeof window === 'undefined';
    return (
      <>
        <Head title="Settings" description="Your settings." noIndex useCurrentUrl />

        <SettingsPage loading={isServer} />
      </>
    );
  }
};

export default SettingsPageContainer;
