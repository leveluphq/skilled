import * as React from 'react';
import RelatedResources from 'components/blocks/RelatedResources/RelatedResources';
import ReactPlayer from 'react-player';
import PageWithVideo from 'components/pages/PageLayout/PageWithVideo';
import { useLessonDimensions } from 'components/context/AppState/useAppState';
import useLessonProgress from 'components/hooks/useLessonProgress';
import useStaticViewerToken from 'components/hooks/useStaticViewerToken';
import useProblemScroller, { ProblemRefs } from 'components/hooks/useProblemScroller';
import ActionBar from 'components/blocks/ActionBar';
import SolutionSectionTitle from 'content/blocks/SolutionSection/SolutionSectionTitle.mdx';
import TitleSection from 'content/blocks/TitleSection';
import StyledMarkdown from 'components/blocks/StyledMarkdown';
import BlurredItemList from 'components/blocks/BlurredItemList';
import ExplanationItemList from 'components/blocks/HiddenItemList/ExplanationItemList';
import ValidationItemList from 'components/blocks/HiddenItemList/ValidationItemList';
import LessonVideo from 'components/blocks/LessonVideo';
import Tray from 'components/blocks/Tray';
import CodeEditor from 'components/blocks/CodeEditor';
import CodeEditorFullScreen from 'components/blocks/CodeEditor/CodeEditorFullScreen';
import { VALIDATE_TITLE, videoProps } from 'utils/constants/lesson';
import { Container } from 'style/elements';
import { VideoWrapper } from 'style/elements/lesson';
import useFetchSolutionVideo from 'components/hooks/useFetchSolutionVideo';
import ProgressButtons from './ProgressButtons';
import ValidateButtons from './ValidateButtons';
import { Props, LeftPanelTabs } from './props';

import {
  Wrapper,
  PageContainer,
  LeftSection,
  RightSection,
  Body,
  Section,
  TrayHeader,
  TrayContainer,
  EditorContainer,
  HideDesktop,
  ContentWrapper,
  LeftPanelTabWrapper,
  TabLeft,
  TabRight,
  FullVideoWrapper,
} from './styles';

enum ProblemTrays {
  Validation = 'VALIDATION',
  SolutionVideo = 'SOLUTION_VIDEO',
}

// interface SolutionVideoUrlResponse {
//   solutionVideoUrl: string | null;
// }

const CodingProblem: React.FC<Props> = ({
  slug,
  hasLessonAccess,
  lesson,
  status,
  draft,
  isFetchingUserLessonDetails,
  Introduction,
  QuestionStatement,
  Solution,
  LearningOutcomes,
  validationItems,
  explanationItems,
  getUserAnswer,
  getTests,
  getSolutionCode,
  isCodeEditorOpen,
  toggleCodeEditor,
  video,
}) => {
  const viewerToken = useStaticViewerToken();
  const { videoWidth, textWidth } = useLessonDimensions();
  const leftSectionRef = React.useRef<HTMLDivElement>(null);
  const { refs, setActiveRef } = useProblemScroller(leftSectionRef);
  const scrollToSolution = React.useCallback(() => {
    setActiveRef(ProblemRefs.SolutionRef);
  }, [refs, setActiveRef]);
  const {
    incrementExplanationStep,
    incrementValidationStep,
    totalExplanationSteps,
    totalValidationSteps,
    setQuestionComplete,
    isComplete,
    explanationStepsViewed,
    validationStepsViewed,
    activeSection,
    SectionType,
  } = useLessonProgress({
    explanationLength: explanationItems.length,
    validationLength: validationItems.length,
  });
  const [openTray, setOpenTray] = React.useState<ProblemTrays | null>(null);
  const toggleValidationTray = React.useCallback(() => {
    if (openTray === ProblemTrays.Validation) {
      setOpenTray(null);
    } else {
      setOpenTray(ProblemTrays.Validation);
    }
  }, [openTray, setOpenTray]);
  const { solutionVideoUrl, hasFetchedVideo } = useFetchSolutionVideo(lesson.id);
  const [activeLeftPanel, setActiveLeftPanel] = React.useState(LeftPanelTabs.Text);
  const toggleActiveLeftPanel = React.useCallback(() => {
    if (activeLeftPanel === LeftPanelTabs.Text) {
      setActiveLeftPanel(LeftPanelTabs.Video);
    } else {
      setActiveLeftPanel(LeftPanelTabs.Text);
    }
  }, [activeLeftPanel]);

  return (
    <PageWithVideo>
      <PageContainer>
        <ActionBar
          slug={lesson.slug}
          activeLeftPanel={activeLeftPanel}
          toggleActiveLeftPanel={toggleActiveLeftPanel}
        />
        <Wrapper>
          <LeftSection
            ref={leftSectionRef}
            width={textWidth}
            hasScroll={activeLeftPanel === LeftPanelTabs.Text}
          >
            <LeftPanelTabWrapper>
              <TabLeft
                isActive={activeLeftPanel === LeftPanelTabs.Text}
                aria-pressed={activeLeftPanel === LeftPanelTabs.Text}
                onClick={() => setActiveLeftPanel(LeftPanelTabs.Text)}
              >
                Question Breakdown
              </TabLeft>
              <TabRight
                isActive={activeLeftPanel === LeftPanelTabs.Video}
                aria-pressed={activeLeftPanel === LeftPanelTabs.Video}
                onClick={() => setActiveLeftPanel(LeftPanelTabs.Video)}
              >
                Solution Video
              </TabRight>
            </LeftPanelTabWrapper>
            <ContentWrapper isPadded isActive={activeLeftPanel === LeftPanelTabs.Text}>
              <div>
                <TitleSection
                  hideNavButtons
                  type={lesson.type}
                  title={lesson.title}
                  slug={lesson.slug}
                  categoryTitle={lesson.category.title}
                  categorySlug={lesson.category.slug}
                  description={lesson.description}
                  LearningOutcomes={LearningOutcomes}
                />
              </div>
              <StyledMarkdown>
                <Section
                  aria-label="Question introduction"
                  tabIndex={-1}
                  ref={(node) => (refs[ProblemRefs.IntroductionRef] = node)}
                  style={{ paddingTop: 0 }}
                  isOpen
                >
                  <Introduction />
                  {!!lesson.introductionVideoUrl && (
                    <VideoWrapper>
                      <ReactPlayer {...videoProps} url={lesson.introductionVideoUrl} />
                    </VideoWrapper>
                  )}
                </Section>
                <Body isOpen={explanationStepsViewed > 0}>
                  <Section
                    aria-label="Explanation of the question"
                    tabIndex={-1}
                    ref={(node) => (refs[ProblemRefs.ExplanationRef] = node)}
                    isOpen={explanationStepsViewed > 0 || isComplete}
                  >
                    <ExplanationItemList
                      items={explanationItems}
                      isComplete={isComplete}
                      explanationStepsViewed={explanationStepsViewed}
                      isActiveSection={activeSection === SectionType.Explanation}
                      scrollRef={leftSectionRef}
                    />
                  </Section>
                  {isComplete && (
                    <Section
                      tabIndex={-1}
                      ref={(node) => (refs[ProblemRefs.ValidationRef] = node)}
                      isOpen
                    >
                      <ValidationItemList
                        items={validationItems}
                        isComplete={isComplete}
                        validationStepsViewed={0}
                        isActiveSection={activeSection === SectionType.Validation}
                      />
                    </Section>
                  )}
                  <Section
                    tabIndex={-1}
                    ref={(node) => (refs[ProblemRefs.SolutionRef] = node)}
                    isOpen={isComplete || hasLessonAccess}
                  >
                    {hasLessonAccess && (
                      <details open={isComplete}>
                        <summary>Read the solution and complexity analysis</summary>
                        <SolutionSectionTitle />
                        {solutionVideoUrl && (
                          <HideDesktop>
                            <VideoWrapper>
                              <ReactPlayer {...videoProps} url={solutionVideoUrl} />
                            </VideoWrapper>
                          </HideDesktop>
                        )}
                        <Solution />
                      </details>
                    )}
                  </Section>
                </Body>
              </StyledMarkdown>
              <RelatedResources slug={lesson.slug} />
              <Container>
                <Section
                  aria-label="Buttons to trigger additional steps"
                  tabIndex={-1}
                  ref={(node) => (refs[ProblemRefs.ButtonsRef] = node)}
                  isOpen
                >
                  <ProgressButtons
                    slug={slug}
                    incrementExplanationStep={incrementExplanationStep}
                    incrementValidationStep={incrementValidationStep}
                    setQuestionComplete={setQuestionComplete}
                    isComplete={isComplete}
                    hasStartedLesson={explanationStepsViewed > 0 || validationStepsViewed > 0}
                    explanationStepsViewed={explanationStepsViewed}
                    validationStepsViewed={validationStepsViewed}
                    totalExplanationSteps={totalExplanationSteps}
                    totalValidationSteps={totalValidationSteps}
                    toggleTray={toggleValidationTray}
                    scrollToSolution={scrollToSolution}
                    toggleCodeEditor={toggleCodeEditor}
                  />
                </Section>
              </Container>
            </ContentWrapper>
            <ContentWrapper isActive={activeLeftPanel === LeftPanelTabs.Video}>
              <FullVideoWrapper>
                <LessonVideo
                  isLoading={!hasFetchedVideo}
                  url={solutionVideoUrl}
                  segments={video.segments}
                  changesSinceRecording={video.changesSinceRecording}
                  uniqueKey={`${lesson.id}-video-tab`}
                  slug={lesson.slug}
                />
              </FullVideoWrapper>
            </ContentWrapper>
            <TrayContainer>
              <Tray
                isSidebarPage
                width={60}
                isOpen={openTray === ProblemTrays.Validation && !isComplete}
                toggle={toggleValidationTray}
                label="validate your answer"
              >
                <Section aria-label="Validate that your answer is optimal" tabIndex={-1}>
                  <TrayHeader>{VALIDATE_TITLE}</TrayHeader>
                  <BlurredItemList items={validationItems} viewedCount={validationStepsViewed} />
                </Section>
                <ValidateButtons
                  slug={slug}
                  incrementExplanationStep={incrementExplanationStep}
                  incrementValidationStep={incrementValidationStep}
                  setQuestionComplete={setQuestionComplete}
                  isComplete={isComplete}
                  hasStartedLesson={explanationStepsViewed > 0 || validationStepsViewed > 0}
                  explanationStepsViewed={explanationStepsViewed}
                  validationStepsViewed={validationStepsViewed}
                  totalExplanationSteps={totalExplanationSteps}
                  totalValidationSteps={totalValidationSteps}
                  toggleTray={toggleValidationTray}
                  scrollToSolution={scrollToSolution}
                  toggleCodeEditor={toggleCodeEditor}
                />
              </Tray>
            </TrayContainer>
          </LeftSection>
          <RightSection width={videoWidth}>
            <CodeEditor
              video={
                <LessonVideo
                  isLoading={!hasFetchedVideo}
                  url={solutionVideoUrl}
                  segments={video.segments}
                  changesSinceRecording={video.changesSinceRecording}
                  uniqueKey={`${lesson.id}-editor-panel`}
                  slug={lesson.slug}
                />
              }
              isFetchingUserLessonDetails={isFetchingUserLessonDetails}
              status={status}
              draft={draft}
              userId={viewerToken}
              lessonId={lesson.id}
              slug={lesson.slug}
              QuestionStatement={QuestionStatement}
              validationItems={validationItems}
              getUserAnswer={getUserAnswer}
              getTests={getTests}
              getSolutionCode={getSolutionCode}
              title={lesson.title}
              toggleIsOpen={toggleCodeEditor}
            />
          </RightSection>
        </Wrapper>
      </PageContainer>
      <EditorContainer>
        <CodeEditorFullScreen
          isFetchingUserLessonDetails={isFetchingUserLessonDetails}
          status={status}
          draft={draft}
          userId={viewerToken}
          lessonId={lesson.id}
          slug={lesson.slug}
          QuestionStatement={QuestionStatement}
          validationItems={validationItems}
          getUserAnswer={getUserAnswer}
          getTests={getTests}
          getSolutionCode={getSolutionCode}
          title={lesson.title}
          isOpen={isCodeEditorOpen}
          toggleIsOpen={toggleCodeEditor}
        />
      </EditorContainer>
    </PageWithVideo>
  );
};

export default CodingProblem;
