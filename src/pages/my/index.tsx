import * as React from 'react';
import { useRouter } from 'next/router';
import { PageRoot, AccountPaths } from 'utils/constants/routes';
import withApollo from 'utils/client/withApollo';
import Head from 'components/blocks/Head';

const MyPage = () => {
  const router = useRouter();
  React.useEffect(() => {
    router.push(`/${PageRoot.My}/${AccountPaths.Settings}`);
  }, []);

  return <Head title="Your account" noIndex canonicalPath="/my" />;
};

export default withApollo(MyPage, { ssr: false });
