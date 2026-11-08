import * as React from 'react';
import dynamic from 'next/dynamic';
import ReactPlayer from 'react-player';
import PageWithSidebar from 'components/pages/PageLayout/PageWithSidebar';
import useLessonProgress from 'components/hooks/useLessonProgress';
import SolutionSectionTitle from 'content/blocks/SolutionSection/SolutionSectionTitle.mdx';
import useProblemScroller, { ProblemRefs } from 'components/hooks/useProblemScroller';
import TitleSection from 'content/blocks/TitleSection';
import StyledMarkdown from 'components/blocks/StyledMarkdown';
import BlurredItemList from 'components/blocks/BlurredItemList';
import ExplanationItemList from 'components/blocks/HiddenItemList/ExplanationItemList';
import ValidationItemList from 'components/blocks/HiddenItemList/ValidationItemList';
import Tray from 'components/blocks/Tray';
import { ContentProps } from 'content/props';
import { CodeSnippetGenerator, VALIDATE_TITLE, videoProps } from 'utils/constants/lesson';
import { Container } from 'style/elements';
import { VideoWrapper } from 'style/elements/lesson';
import useFetchSolutionVideo from 'components/hooks/useFetchSolutionVideo';
import ProgressButtons from 'content/templates/CodingProblemDualView/ProgressButtons';
import ValidateButtons from 'content/templates/CodingProblemDualView/ValidateButtons';
import Sidebar from './Sidebar';

import { Wrapper } from '../styles';
import {
  Body,
  Section,
  TrayHeader,
  TrayContainer,
  EditorContainer,
  TrayVideoWrapper,
  ShowSolutionVideoWrapper,
  ShowSolutionVideoButton,
} from './styles';

const CodeEditorFullScreen = dynamic(
  () => import('components/blocks/CodeEditor/CodeEditorFullScreen'),
  {
    ssr: false,
  },
);

enum ProblemTrays {
  Validation = 'VALIDATION',
  SolutionVideo = 'SOLUTION_VIDEO',
}

interface Props extends ContentProps {
  Introduction: React.FC;
  QuestionStatement: React.FC;
  Solution: React.FC;
  LearningOutcomes: React.FC | null;
  validationItems: React.FC[];
  explanationItems: React.FC[];
  getUserAnswer: CodeSnippetGenerator;
  getTests: CodeSnippetGenerator;
  getSolutionCode: CodeSnippetGenerator;
  isFetchingUserLessonDetails: boolean;
}

const CodingProblem: React.FC<Props> = ({
  slug,
  lesson,
  Introduction,
  QuestionStatement,
  Solution,
  LearningOutcomes,
  validationItems,
  explanationItems,
  getUserAnswer,
  getTests,
  getSolutionCode,
  toggleCodeEditor,
  isCodeEditorOpen,
  isFetchingUserLessonDetails,
}) => {
  const { refs, setActiveRef } = useProblemScroller();
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
  const toggleSolutionVideoTray = React.useCallback(() => {
    if (openTray === ProblemTrays.SolutionVideo) {
      setOpenTray(null);
    } else {
      setOpenTray(ProblemTrays.SolutionVideo);
    }
  }, [openTray, setOpenTray]);
  const { solutionVideoUrl, hasFetchedVideo } = useFetchSolutionVideo(lesson.id);

  return (
    // NOTE: Headroom was messing up the section scrolling
    <PageWithSidebar disableHeadroom hideContinue right>
      <div>
        <Wrapper>
          <div>
            <TitleSection
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
              isOpen
            >
              <Introduction />
              {!!lesson.introductionVideoUrl && (
                <VideoWrapper>
                  <ReactPlayer {...videoProps} url={lesson.introductionVideoUrl} />
                </VideoWrapper>
              )}
              {!!solutionVideoUrl && (
                <Container>
                  <ShowSolutionVideoWrapper>
                    Ready for the solution video?{' '}
                    <ShowSolutionVideoButton onClick={toggleSolutionVideoTray}>
                      Click here watch now
                    </ShowSolutionVideoButton>
                  </ShowSolutionVideoWrapper>
                </Container>
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
                isOpen={isComplete}
              >
                {isComplete && <SolutionSectionTitle />}
                {isComplete && solutionVideoUrl && (
                  <VideoWrapper>
                    <ReactPlayer {...videoProps} url={solutionVideoUrl} />
                  </VideoWrapper>
                )}
                {isComplete && <Solution />}
              </Section>
            </Body>
          </StyledMarkdown>
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
          <TrayContainer>
            <Tray
              isSidebarPage
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
          {!!solutionVideoUrl && (
            <TrayContainer>
              <Tray
                isSidebarPage
                isOpen={openTray === ProblemTrays.SolutionVideo && !!solutionVideoUrl}
                toggle={toggleSolutionVideoTray}
                label="solution video"
                useContentHeight
                backgroundOpacity={0.925}
              >
                <Section aria-label="solution video" tabIndex={-1}>
                  <TrayVideoWrapper>
                    <ReactPlayer {...videoProps} url={solutionVideoUrl} />
                  </TrayVideoWrapper>
                </Section>
              </Tray>
            </TrayContainer>
          )}
          <Sidebar
            slug={slug}
            title={lesson.title}
            type={lesson.type}
            label="Question navigation"
            setActiveRef={setActiveRef}
            toggleTray={toggleValidationTray}
            isComplete={isComplete}
            setQuestionComplete={setQuestionComplete}
            toggleCodeEditor={toggleCodeEditor}
            isCodeEditorOpen={isCodeEditorOpen}
            LearningOutcomes={LearningOutcomes}
            hasFetchedVideo={hasFetchedVideo}
            solutionVideoUrl={solutionVideoUrl}
            toggleSolutionVideoTray={toggleSolutionVideoTray}
            isSolutionVideoTrayOpen={openTray === ProblemTrays.SolutionVideo}
          />
          <EditorContainer>
            <CodeEditorFullScreen
              userId=""
              lessonId=""
              isFetchingUserLessonDetails={isFetchingUserLessonDetails}
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
        </Wrapper>
      </div>
    </PageWithSidebar>
  );
};

export default CodingProblem;
