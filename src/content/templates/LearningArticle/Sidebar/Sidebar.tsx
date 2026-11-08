import * as React from 'react';
import { Home16 } from '@carbon/icons-react';
import { PageRoot } from 'utils/constants/routes';
import { Sidebar, SidebarItem } from 'components/blocks/Sidebar';
import CourseSidebarItems from 'components/blocks/CourseSidebarItems';
import { LessonType, lessonTypeNames } from 'utils/constants/lesson';

import { ButtonText } from './styles';

interface Props {
  type: string;
}

const SidebarContainer: React.FC<Props> = ({ type }) => {
  const title = lessonTypeNames[type as LessonType];

  return (
    <Sidebar right title={title} label="Question navigation">
      <SidebarItem href={`/${PageRoot.Course}`}>
        <Home16 /> <ButtonText>Course Home</ButtonText>
      </SidebarItem>
      <CourseSidebarItems />
    </Sidebar>
  );
};

export default SidebarContainer;
