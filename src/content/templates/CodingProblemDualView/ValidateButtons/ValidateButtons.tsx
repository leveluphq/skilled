import * as React from 'react';
import AuthModal from 'components/blocks/Modal/AuthModal';
import UpgradeModal from 'components/blocks/Modal/UpgradeModal';
import { LessonStatus } from 'utils/constants/lesson';
// import { TEST_BUTTON_TEXT } from 'utils/constants/lesson';
import { BasePalette } from 'style/theme';
import { getHasLessonAccess } from 'utils/client/lesson';
import { ButtonProps, CallbackParams } from '../props';

import { Wrapper, Button } from './styles';

const useProgressCallback = ({
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

const ValidateButtons: React.FC<ButtonProps> = ({
  incrementValidationStep,
  loading,
  error,
  viewer,
  lesson,
  status,
  insertLessonStatus,
  explanationStepsViewed,
  validationStepsViewed,
  totalValidationSteps,
  scrollToSolution,
  overrideAccessSetting,
  // toggleCodeEditor,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const authCallback = React.useCallback(() => setIsModalOpen(true), []);
  const upgradeCallback = React.useCallback(() => setIsUpgradeModalOpen(true), []);
  const hasViewer = !!viewer;

  const validationCallback = useProgressCallback({
    authCallback: hasViewer ? upgradeCallback : authCallback,
    actionCallback: incrementValidationStep,
    insertLessonStatus,
    loading,
    error,
    viewer,
    lesson,
    status,
    explanationStepsViewed,
    validationStepsViewed: validationStepsViewed + 1,
    overrideAccessSetting,
  });

  return (
    <>
      <Wrapper>
        {!totalValidationSteps || validationStepsViewed < totalValidationSteps ? (
          <Button color={BasePalette.Button} onClick={validationCallback}>
            Reveal Next Item
          </Button>
        ) : (
          <Button
            solid
            color={BasePalette.Teal}
            onClick={(e) => {
              if (overrideAccessSetting || getHasLessonAccess(lesson, viewer)) {
                validationCallback(e);
                scrollToSolution();
              } else {
                if (hasViewer) {
                  upgradeCallback();
                } else {
                  authCallback();
                }
              }
            }}
          >
            View Solution
          </Button>
        )}
        {/* <SolutionButton color={BasePalette.Violet} onClick={toggleCodeEditor}>
          {TEST_BUTTON_TEXT}
        </SolutionButton> */}
      </Wrapper>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </>
  );
};

export default ValidateButtons;
