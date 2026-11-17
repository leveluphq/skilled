import * as React from 'react';
import { Statuses } from 'utils/constants/lesson';
import { Tabs, Props } from './props';
import CourseItems from './CourseItems';
import Sidebar from './Sidebar';

import { Wrapper } from './styles';

const LessonList: React.FC<Props> = ({ data }) => {
  if (!data) {
    // TODO: Do something
    return null;
  }

  const [activeTab] = React.useState(Tabs.All);
  const { categories } = data;
  const statuses: Statuses = {};

  // TODO: Any more sorting and filtering needed?
  // TODO: Abilty to reset status?
  return (
    <div>
      <Wrapper>
        <div>
          <CourseItems categories={categories} statuses={statuses} activeTab={activeTab} />
        </div>
      </Wrapper>
      <Sidebar />
    </div>
  );
};

export default LessonList;
