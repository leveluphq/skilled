import * as React from 'react';
import { Sidebar } from 'components/blocks/Sidebar';
import CourseSidebarItems from 'components/blocks/CourseSidebarItems';

export const TITLE = 'Course';
export const LABEL = 'Course';
export const RIGHT = true;

const SidebarContainer: React.FC = () => {
  return (
    <Sidebar title={TITLE} label={LABEL} right={RIGHT}>
      <CourseSidebarItems showScrollToSection />
    </Sidebar>
  );
};

export default SidebarContainer;
