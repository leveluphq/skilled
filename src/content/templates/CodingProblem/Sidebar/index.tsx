import * as React from 'react';
import useButtonQueries from 'components/hooks/useButtonQueries';
import Sidebar from './Sidebar';
import { OwnProps } from './props';

const SidebarContainer: React.FC<OwnProps> = (props) => {
  const { viewer, lesson } = useButtonQueries(props.slug);

  return <Sidebar viewer={viewer} lesson={lesson} {...props} />;
};

export default SidebarContainer;
