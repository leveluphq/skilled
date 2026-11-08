import * as React from 'react';
import ViewerContext from 'components/context/ViewerContext';

const useStaticViewerToken = (immediate: boolean = false) => {
  const [viewerToken, setViewerToken] = React.useState(
    immediate ? React.useContext(ViewerContext) : '',
  );
  const tokenInContext = React.useContext(ViewerContext);

  React.useEffect(() => {
    setViewerToken(tokenInContext);
  }, [tokenInContext]);

  return viewerToken;
};

export default useStaticViewerToken;
