import * as React from 'react';
import { Sidebar } from 'components/blocks/Sidebar';

interface Props {
  title?: string;
  label?: string;
  right?: boolean;
}

const EmptySidebar: React.FC<Props> = ({ title = '', label = 'loading...', right = true }) => {
  return (
    <Sidebar title={title} label={label} right={right}>
      {null}
    </Sidebar>
  );
};

const EmptySidebarPage: React.FC<Props> = props => {
  return (
    <div>
      <div>{null}</div>
      <EmptySidebar {...props} />
    </div>
  );
};

export default EmptySidebarPage;
