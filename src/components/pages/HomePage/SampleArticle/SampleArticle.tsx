import * as React from 'react';
import useLessonProgress from 'components/hooks/useLessonProgress';
import SolutionSectionTitle from 'content/blocks/SolutionSection/SolutionSectionTitle.mdx';
import useProblemScroller, { ProblemRefs } from 'components/hooks/useProblemScroller';
import StyledMarkdown from 'components/blocks/StyledMarkdown';
import BlurredItemList from 'components/blocks/BlurredItemList';
import ExplanationItemList from 'components/blocks/HiddenItemList/ExplanationItemList';
import ValidationItemList from 'components/blocks/HiddenItemList/ValidationItemList';
import Tray from 'components/blocks/Tray';
import { VALIDATE_TITLE } from 'utils/constants/lesson';
import { Container } from 'style/elements';
import ProgressButtons from 'content/templates/CodingProblemDualView/ProgressButtons';
import ValidateButtons from 'content/templates/CodingProblemDualView/ValidateButtons';

import { Wrapper } from './styles';
import {
  Body,
  Section,
  TrayHeader,
  TrayContainer,
} from 'content/templates/CodingProblemDualView/styles';

import sampleLesson from '../sampleLesson';

import { GetLessonBySlugQuery, GetLessonBySlugWithViewerQuery } from 'types/generated/client';

export interface ContentProps {
  slug?: string;
  lesson?: GetLessonBySlugQuery['lessons'][0];
  status?: GetLessonBySlugWithViewerQuery['users_lessons_status'][0];
  toggleCodeEditor?: () => void;
}

enum ProblemTrays {
  Validation = 'VALIDATION',
  SolutionVideo = 'SOLUTION_VIDEO',
}

interface Props extends ContentProps {
  Introduction?: React.FC;
  Solution?: React.FC;
  LearningOutcomes?: React.FC | null;
  validationItems?: React.FC[];
  explanationItems?: React.FC[];
}

const SampleArticle: React.FC<Props> = ({
  slug = sampleLesson.slug,
  Introduction = sampleLesson.Introduction,
  Solution = sampleLesson.Solution,
  validationItems = sampleLesson.validationItems,
  explanationItems = sampleLesson.explanationItems,
  toggleCodeEditor = () => {},
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

  return (
    // NOTE: Headroom was messing up the section scrolling
    <div>
      <Wrapper>
        <StyledMarkdown>
          <Section
            aria-label="Question introduction"
            tabIndex={-1}
            ref={(node) => (refs[ProblemRefs.IntroductionRef] = node)}
            isOpen
          >
            <Introduction />
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
              {isComplete && <Solution />}
            </Section>
          </Body>
        </StyledMarkdown>
        {!isComplete && (
          <Container>
            <Section
              aria-label="Buttons to trigger additional steps"
              tabIndex={-1}
              ref={(node) => (refs[ProblemRefs.ButtonsRef] = node)}
              style={{ backgroundColor: 'transparent' }}
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
                overrideAccessSetting
              />
            </Section>
          </Container>
        )}
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
              overrideAccessSetting
            />
          </Tray>
        </TrayContainer>
      </Wrapper>
    </div>
  );
};

export default SampleArticle;
