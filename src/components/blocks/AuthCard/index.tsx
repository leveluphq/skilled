import * as React from 'react';
import { useGetViewerLazyQuery } from 'types/generated/client';
import useStaticViewerToken from 'components/hooks/useStaticViewerToken';
import AuthCard from './AuthCard';
import { OwnProps } from './props';

const IMMEDIATE = true;

const AuthCardContainer: React.FC<OwnProps> = (props) => {
  const viewerToken = useStaticViewerToken(IMMEDIATE);
  const [getViewer, { data, loading, error, called }] = useGetViewerLazyQuery();

  React.useEffect(() => {
    if (viewerToken) {
      getViewer({
        variables: {
          id: viewerToken,
        },
      });
    }
  }, [viewerToken]);

  if (viewerToken) {
    return <AuthCard loading={loading || !called} error={error} data={data} {...props} />;
  } else {
    return <AuthCard loading={!process.browser} {...props} />;
  }
};

export default AuthCardContainer;
