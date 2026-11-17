import * as React from 'react';
import { Container } from 'style/elements';
import { Statuses } from 'utils/constants/lesson';
import buildUserLessonStatus from 'utils/client/buildUserLessonStatus';
import { Tabs, PropsWithViewer, TABS } from './props';
import SubscriptionSuccess from './SubscriptionSuccess';
import ContinueCourse from './ContinueCourse';
import CourseItems from './CourseItems';
import Sidebar from './Sidebar';

import { Wrapper, ButtonTab, TabWrapper } from './styles';

const LessonList: React.FC<PropsWithViewer> = ({ data }) => {
  if (!data) {
    // TODO: Do something
    return null;
  }

  const [activeTab, setActiveTab] = React.useState(Tabs.All);
  const { categories, users_lessons_status } = data;
  const statuses: Statuses = React.useMemo(() => buildUserLessonStatus(users_lessons_status), [
    users_lessons_status,
  ]);

  // TODO: Any more sorting and filtering needed?
  // TODO: Abilty to reset status?
  return (
    <div>
      <SubscriptionSuccess />
      <Wrapper>
        {/* Where to pick up comes first; the filter applies to the lessons below it */}
        <ContinueCourse statuses={statuses} />
        <Container>
          <TabWrapper role="tablist" aria-label="Filter lessons by progress">
            <ButtonTab
              role="tab"
              aria-selected={activeTab === Tabs.All}
              isActive={activeTab === Tabs.All}
              color={TABS[Tabs.All].color}
              onClick={() => setActiveTab(Tabs.All)}
            >
              {Tabs.All}
            </ButtonTab>
            <ButtonTab
              role="tab"
              isActive={activeTab === Tabs.Pending}
              aria-selected={activeTab === Tabs.Pending}
              color={TABS[Tabs.Pending].color}
              onClick={() => setActiveTab(Tabs.Pending)}
            >
              {Tabs.Pending}
            </ButtonTab>
            <ButtonTab
              role="tab"
              isActive={activeTab === Tabs.NeedsReview}
              aria-selected={activeTab === Tabs.NeedsReview}
              color={TABS[Tabs.NeedsReview].color}
              onClick={() => setActiveTab(Tabs.NeedsReview)}
            >
              {Tabs.NeedsReview}
            </ButtonTab>
            <ButtonTab
              role="tab"
              isActive={activeTab === Tabs.Complete}
              aria-selected={activeTab === Tabs.Complete}
              color={TABS[Tabs.Complete].color}
              onClick={() => setActiveTab(Tabs.Complete)}
            >
              {Tabs.Complete}
            </ButtonTab>
          </TabWrapper>
        </Container>
        <div role="tabpanel" aria-label={activeTab}>
          <CourseItems categories={categories} statuses={statuses} activeTab={activeTab} />
        </div>
      </Wrapper>
      <Sidebar />
    </div>
  );
};

export default LessonList;
