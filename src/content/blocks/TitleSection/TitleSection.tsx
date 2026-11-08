import * as React from 'react';
import copy from 'copy-to-clipboard';
import AuthCard from 'components/blocks/AuthCard';
import NavigateCourseButtons from 'components/blocks/NavigateCourseButtons';
import SubmitFeedbackLink from 'components/blocks/Modal/FeedbackModal/SubmitFeedbackLink';
import ContentModal from 'components/blocks/Modal/ContentModal';
import { LessonType, lessonTypeNames } from 'utils/constants/lesson';

import {
  PreTitle,
  Title,
  TitleContent,
  TitleText,
  TitleButtonWrapper,
  TitleButtons,
  HeaderWrapper,
  AuthWrapper,
  FeedbackWrapper,
  SummaryButton,
  PreTitleContainer,
  ShareTitle,
  CopyButton,
  FollowContainer,
} from './styles';

interface Props {
  type: string;
  title: string;
  slug: string;
  categorySlug: string;
  categoryTitle: string;
  description: string;
  hideNavButtons?: boolean;
  LearningOutcomes: React.FC | null;
}

const IS_SUMMARY_OFF = true;

const TitleSection: React.FC<Props> = ({
  type,
  title,
  slug,
  hideNavButtons = false,
  LearningOutcomes,
}) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isOutcomesOpen, setIsOutcomesOpen] = React.useState(false);
  const lessonTypeName = lessonTypeNames[type as LessonType];
  const learningOutcomesContent = !!LearningOutcomes ? <LearningOutcomes /> : null;
  const openOutcomesModal = React.useCallback(() => {
    setIsOutcomesOpen(true);
  }, []);
  const closeOutcomesModal = React.useCallback(() => {
    setIsOutcomesOpen(false);
  }, []);

  return (
    <>
      <HeaderWrapper>
        <TitleContent>
          <TitleText>
            {!!lessonTypeName && (
              <PreTitleContainer>
                <PreTitle>
                  <span>{lessonTypeName}</span>
                </PreTitle>
                <FollowContainer>
                  <ShareTitle>Share Lesson</ShareTitle>{' '}
                  <CopyButton
                    onClick={() => {
                      try {
                        copy(window.location.href);
                      } catch (e) {
                        alert('Could not copy link. Please try again later.');
                      }
                      setIsCopied(true);
                    }}
                  >
                    {isCopied ? 'Copied!' : 'Copy Link'}
                  </CopyButton>
                </FollowContainer>
              </PreTitleContainer>
            )}
            <Title>{title}</Title>
          </TitleText>
          {!IS_SUMMARY_OFF && !!learningOutcomesContent && (
            <SummaryButton onClick={openOutcomesModal}>Lesson Summary</SummaryButton>
          )}
          {!hideNavButtons && (
            <TitleButtonWrapper>
              <TitleButtons>
                <FeedbackWrapper>
                  <SubmitFeedbackLink />
                </FeedbackWrapper>
                <NavigateCourseButtons slug={slug} />
              </TitleButtons>
            </TitleButtonWrapper>
          )}
        </TitleContent>
        <AuthCard Wrapper={AuthWrapper} />
      </HeaderWrapper>
      <ContentModal
        isOpen={isOutcomesOpen}
        onClose={closeOutcomesModal}
        title="Learning Outcomes"
        titleText="Learning outcomes modal"
        content={learningOutcomesContent}
      />
    </>
  );
};

export default TitleSection;
