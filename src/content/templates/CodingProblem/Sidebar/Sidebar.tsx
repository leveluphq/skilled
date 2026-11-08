import * as React from 'react';
import { Home16, ChevronSort16, Education16, Video16, DragVertical16 } from '@carbon/icons-react';
import { Sidebar, SidebarButton, SidebarItem } from 'components/blocks/Sidebar';
import ContentModal from 'components/blocks/Modal/ContentModal';
import CourseSidebarItems from 'components/blocks/CourseSidebarItems';
import { getHasLessonAccess } from 'utils/client/lesson';
import { LessonType, lessonTypeNames } from 'utils/constants/lesson';
import { PageRoot } from 'utils/constants/routes';
import ProblemScroller from '../ProblemScroller';
import Footer from './Footer';
import { Props } from './props';

import { SectionHeader, ToggleContainer, ToggleButton, Spacer, ButtonText } from './styles';

enum ToggleGroup {
  Question = 'QUESTION',
  Course = 'COURSE',
}

const SidebarContainer: React.FC<Props> = ({
  type,
  label,
  setActiveRef,
  isComplete,
  toggleTray,
  setQuestionComplete,
  toggleCodeEditor,
  LearningOutcomes,
  hasFetchedVideo,
  solutionVideoUrl,
  toggleSolutionVideoTray,
  isSolutionVideoTrayOpen,
  lesson,
  viewer,
}) => {
  const [activeGroup, setActiveGroup] = React.useState(ToggleGroup.Question);
  const [isContentModalOpen, setIsContentModalOpen] = React.useState(false);
  const learningOutcomesContent = LearningOutcomes !== null ? <LearningOutcomes /> : null;
  const hasLessonAccess = getHasLessonAccess(lesson, viewer);
  const title = lessonTypeNames[type as LessonType];

  return (
    <>
      <Sidebar
        right
        title={title}
        label={label}
        footer={<Footer toggleCodeEditor={toggleCodeEditor} />}
      >
        <ToggleContainer>
          <ToggleButton
            isActive={activeGroup === ToggleGroup.Question}
            onClick={() => setActiveGroup(ToggleGroup.Question)}
          >
            Lesson
          </ToggleButton>
          <ToggleButton
            isActive={activeGroup === ToggleGroup.Course}
            onClick={() => setActiveGroup(ToggleGroup.Course)}
          >
            Course
          </ToggleButton>
        </ToggleContainer>
        {activeGroup === ToggleGroup.Question ? (
          <>
            <SectionHeader>
              <ChevronSort16 /> Scroll to Section
            </SectionHeader>
            <ProblemScroller
              setActiveRef={setActiveRef}
              toggleTray={toggleTray}
              isComplete={isComplete}
            />
            <SectionHeader>Quick Access</SectionHeader>
            <SidebarButton onClick={setQuestionComplete} disabled={!hasLessonAccess || isComplete}>
              <DragVertical16 /> <ButtonText>Reveal All Content</ButtonText>
            </SidebarButton>
            <SidebarButton
              onClick={toggleSolutionVideoTray}
              disabled={hasFetchedVideo && !solutionVideoUrl}
              aria-haspopup={true}
              aria-expanded={isSolutionVideoTrayOpen}
            >
              <Video16 /> <ButtonText>Solution Video</ButtonText>
            </SidebarButton>
            <SidebarButton
              onClick={() => setIsContentModalOpen(true)}
              disabled={!learningOutcomesContent}
              aria-haspopup={true}
              aria-expanded={isContentModalOpen}
            >
              <Education16 /> <ButtonText>Learning Outcomes</ButtonText>
            </SidebarButton>
            <Spacer />
          </>
        ) : (
          <>
            <SidebarItem href={`/${PageRoot.Course}`}>
              <Home16 /> <ButtonText>Course Home</ButtonText>
            </SidebarItem>
            <CourseSidebarItems />
            <Spacer />
          </>
        )}
      </Sidebar>
      <ContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        title="Learning Outcomes"
        titleText="Learning outcomes modal"
        content={learningOutcomesContent}
      />
    </>
  );
};

export default SidebarContainer;
