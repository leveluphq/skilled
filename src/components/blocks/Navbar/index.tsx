import * as React from 'react';
import ViewerContext from 'components/context/ViewerContext';
import { useGetViewerQuery } from 'types/generated/client';
import Navbar from './Navbar';
import { OwnProps } from './props';

const NavbarContainer: React.FC<OwnProps> = (props) => {
  const viewerToken = React.useContext(ViewerContext);

  if (viewerToken) {
    const { data, loading, error } = useGetViewerQuery({ variables: { id: viewerToken } });
    return <Navbar loading={loading} error={error} data={data} {...props} />;
  } else {
    const isServer = typeof window === 'undefined';
    return <Navbar loading={isServer} {...props} />;
  }
};

export default NavbarContainer;
