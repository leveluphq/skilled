import * as React from 'react';
import Link from 'next/link';
import AuthModal from 'components/blocks/Modal/AuthModal';
import UpgradeModal from 'components/blocks/Modal/UpgradeModal';
import { LessonStatus, LessonConfidence } from 'utils/constants/lesson';
import { getHasLessonAccess } from 'utils/client/lesson';
import { BasePalette } from 'style/theme';
import NavigateCourseButtons from 'components/blocks/NavigateCourseButtons';
import { ButtonProps, CallbackParams, TextParams } from '../props';

import {
  Wrapper,
  Button,
  ButtonLink,
  ExpandText,
  ConfidenceSection,
  ConfidenceTitle,
  ConfidenceSubtitle,
  ConfidenceSliderWrapper,
  ConfidenceInput,
  ConfidenceLabelWrapper,
  ConfidenceLabel,
  ConfidenceOutput,
  FinishButtonsWrapper,
  FinishTitle,
  CTAButton,
  ErrorButton,
  BreakdownIcon,
  ValidateIcon,
  NavigateWrapper,
} from './styles';

const getExplanationText = ({ viewedCount }: TextParams) => {
  if (viewedCount > 0) {
    return 'Continue Problem Breakdown';
  }

  return 'Begin Problem Breakdown';
};

const useProgressCallback = ({
  authCallback,
  actionCallback,
  insertLessonStatus,
  loading,
  error,
  viewer,
  lesson,
  status,
  explanationStepsViewed,
  validationStepsViewed,
  overrideAccessSetting,
}: CallbackParams) => {
  return (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || error || !lesson) {
      return;
    }

    if (overrideAccessSetting) {
      actionCallback(event);
      return;
    }

    if (!getHasLessonAccess(lesson, viewer)) {
      authCallback();
      return;
    }

    if (viewer && insertLessonStatus) {
      if (!status || status.status === LessonStatus.Init) {
        insertLessonStatus({
          variables: {
            userId: viewer.id,
            lessonId: lesson.id,
            status: LessonStatus.InProgress,
            explanationStepsViewed,
            validationStepsViewed,
          },
        });
      }
    }

    actionCallback(event);
  };
};

const ProgressButtons: React.FC<ButtonProps> = ({
  incrementExplanationStep,
  setQuestionComplete,
  isComplete,
  loading,
  error,
  viewer,
  lesson,
  status,
  insertLessonStatus,
  setFinishLessonStatus,
  nextLessonUrl,
  explanationStepsViewed,
  totalExplanationSteps,
  validationStepsViewed,
  toggleTray,
  scrollToSolution,
  overrideAccessSetting,
}) => {
  const previousConfidence = (status && status.confidence) || 0;
  const [confidence, setConfidence] = React.useState(previousConfidence);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const authCallback = React.useCallback(() => setIsAuthModalOpen(true), []);
  const upgradeCallback = React.useCallback(() => setIsUpgradeModalOpen(true), []);
  const hasViewer = !!viewer;

  const explanationCallback = useProgressCallback({
    authCallback: hasViewer ? upgradeCallback : authCallback,
    actionCallback: incrementExplanationStep,
    insertLessonStatus,
    loading,
    error,
    viewer,
    lesson,
    status,
    explanationStepsViewed: explanationStepsViewed + 1,
    validationStepsViewed,
    overrideAccessSetting,
  });
  const setCompleteCallback = useProgressCallback({
    authCallback: hasViewer ? upgradeCallback : authCallback,
    actionCallback: setQuestionComplete,
    insertLessonStatus,
    loading,
    error,
    viewer,
    lesson,
    status,
    explanationStepsViewed: 0,
    validationStepsViewed: 0,
    overrideAccessSetting,
  });

  // TODO: Get the slug of the next lesson to router push
  if (isComplete) {
    return (
      <Wrapper>
        <ConfidenceSection>
          <ConfidenceTitle>
            Select your confidence in understanding the optimal solution (optional)
          </ConfidenceTitle>
          <ConfidenceSubtitle>This will allow us to help you prioritize work</ConfidenceSubtitle>
          <ConfidenceSliderWrapper>
            <div>
              <ConfidenceInput
                type="range"
                id="confidence-range"
                min="0"
                max="5"
                step="1"
                value={confidence}
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={0}
                onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
                confidence={confidence}
              />
            </div>
            <ConfidenceLabelWrapper>
              <ConfidenceLabel htmlFor="confidence-range"> Confidence: </ConfidenceLabel>
              <ConfidenceOutput htmlFor="confidence-range" id="confidence" confidence={confidence}>
                {LessonConfidence[confidence]}
              </ConfidenceOutput>
            </ConfidenceLabelWrapper>
          </ConfidenceSliderWrapper>
        </ConfidenceSection>
        <FinishButtonsWrapper>
          <FinishTitle>Do you want to review this question later?</FinishTitle>
          <Link passHref href={nextLessonUrl.href ? nextLessonUrl.href : '/'}>
            <CTAButton
              onClick={() => {
                if (setFinishLessonStatus) {
                  setFinishLessonStatus({
                    variables: {
                      confidence,
                      status: LessonStatus.Complete,
                      userId: viewer!.id,
                      lessonId: lesson!.id,
                    },
                  });
                }
              }}
            >
              Mark as Complete
            </CTAButton>
          </Link>
          <Link passHref href={nextLessonUrl.href ? nextLessonUrl.href : '/'}>
            <ErrorButton
              onClick={() => {
                if (setFinishLessonStatus) {
                  setFinishLessonStatus({
                    variables: {
                      confidence,
                      status: LessonStatus.NeedsReview,
                      userId: viewer!.id,
                      lessonId: lesson!.id,
                    },
                  });
                }
              }}
            >
              Mark as Needs Review
            </ErrorButton>
          </Link>
        </FinishButtonsWrapper>
        <NavigateWrapper>
          <NavigateCourseButtons slug={lesson!.slug} displayText />
        </NavigateWrapper>
      </Wrapper>
    );
  }

  return (
    <>
      <Wrapper>
        {!totalExplanationSteps || explanationStepsViewed < totalExplanationSteps ? (
          <Button hoverable color={BasePalette.Button} onClick={explanationCallback}>
            <BreakdownIcon /> {getExplanationText({ viewedCount: explanationStepsViewed })}
          </Button>
        ) : (
          <Button
            solid
            color={BasePalette.Teal}
            onClick={(e) => {
              explanationCallback(e);
              scrollToSolution();
            }}
          >
            View Solution
          </Button>
        )}
        <Button hoverable color={BasePalette.Button} onClick={toggleTray}>
          <ValidateIcon /> Validate My Answer
        </Button>
        <div>
          <ButtonLink onClick={setCompleteCallback}>
            <ExpandText>Reveal All Sections</ExpandText>
          </ButtonLink>
        </div>
      </Wrapper>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </>
  );
};

export default ProgressButtons;
