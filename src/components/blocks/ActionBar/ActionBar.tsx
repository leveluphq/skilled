import * as React from 'react';
import { AddComment16 } from '@carbon/icons-react';
import NavigateCourseButtons from 'components/blocks/NavigateCourseButtons';
import AuthModal from 'components/blocks/Modal/AuthModal';
import FeedbackModal from 'components/blocks/Modal/FeedbackModal';
import LogoSvg from 'svg/Logo';
import noop from 'utils/shared/noop';
import { PageRoot } from 'utils/constants/routes';
import { LessonStatus } from 'utils/constants/lesson';
import { codingLanguageList, LanguageName } from 'utils/constants/lesson';
import { runnableLanguages } from 'utils/shared/runner/settings';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import LeftPanelToggle from './LeftPanelToggle';
import DropdownButton from './DropdownButton';
import Timer from './Timer';
import { Props } from './props';

// import { Container, Title, ButtonWrapper, RegisterButton, UpgradeButton } from './styles';
import { Wrapper, Logo, Item, Left, Right, FadedButton, RegisterButton } from './styles';

const mapStatusToText: Record<string, string> = {
  [LessonStatus.Init]: 'Not Started',
  [LessonStatus.InProgress]: 'In Progress',
  [LessonStatus.Complete]: 'Complete',
  [LessonStatus.NeedsReview]: 'Needs Review',
};

const ActionBar: React.FC<Props> = ({
  data,
  loading,
  slug,
  insertLessonStatus,
  activeLeftPanel,
  toggleActiveLeftPanel,
}) => {
  const { language, setLanguage } = useCodingLanguage();
  const [hasViewer, setHasViewer] = React.useState(false);
  const [mounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  React.useEffect(() => {
    setHasViewer(!!data?.users_by_pk);
  }, [data]);
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const openFeedbackModal = React.useCallback(() => {
    setIsFeedbackOpen(true);
  }, []);
  const closeFeedbackModal = React.useCallback(() => {
    setIsFeedbackOpen(false);
  }, []);
  const openAuthModal = React.useCallback(() => {
    setIsAuthOpen(true);
  }, []);
  const closeAuthModal = React.useCallback(() => {
    setIsAuthOpen(false);
  }, []);
  const setLessonStatus = React.useCallback(
    (newStatus: LessonStatus) => {
      return () => {
        const user = data?.users_by_pk;
        const lesson = data?.lessons[0];
        const lessonStatus = data?.users_lessons_status[0];

        if (user && lesson && lessonStatus) {
          insertLessonStatus({
            variables: {
              userId: user.id,
              lessonId: lesson.id,
              status: newStatus,
              explanationStepsViewed: lessonStatus.explanationStepsViewed,
              validationStepsViewed: lessonStatus.validationStepsViewed,
            },
          });
        }
      };
    },
    [data],
  );

  const statusResponse = data?.users_lessons_status[0];
  const status = statusResponse?.status;
  let triggerText =
    !!data && !!status ? mapStatusToText[status || LessonStatus.Init] : 'Loading...';

  if (mounted && !hasViewer && !loading) {
    triggerText = mapStatusToText[status || LessonStatus.Init];
  }

  return (
    <>
      <Wrapper>
        <Left fullWidthMobile={hasViewer}>
          <Logo href={hasViewer ? `/${PageRoot.Course}` : '/'}>
            <LogoSvg />
          </Logo>
          <Item displayMobile={hasViewer}>
            <NavigateCourseButtons slug={slug} displayTitle={false} />
          </Item>
          <Item>
            <DropdownButton
              left
              triggerText={triggerText}
              handleFocus={noop}
              handleBlur={noop}
              items={[
                {
                  name: mapStatusToText[LessonStatus.Init],
                  onClick: setLessonStatus(LessonStatus.Init),
                },
                {
                  name: mapStatusToText[LessonStatus.InProgress],
                  onClick: setLessonStatus(LessonStatus.InProgress),
                },
                {
                  name: mapStatusToText[LessonStatus.Complete],
                  onClick: setLessonStatus(LessonStatus.Complete),
                },
                {
                  name: mapStatusToText[LessonStatus.NeedsReview],
                  onClick: setLessonStatus(LessonStatus.NeedsReview),
                },
              ]}
            />
          </Item>
          {activeLeftPanel && (
            <Item>
              <LeftPanelToggle
                activeLeftPanel={activeLeftPanel}
                toggleActiveLeftPanel={toggleActiveLeftPanel}
              />
            </Item>
          )}
        </Left>
        <Right>
          <Item>
            <Timer />
          </Item>
          <Item>
            <DropdownButton
              handleFocus={noop}
              handleBlur={noop}
              triggerText={LanguageName[language]}
              items={runnableLanguages(codingLanguageList).map((l) => ({
                name: LanguageName[l],
                onClick: () => setLanguage(l),
              }))}
            />
          </Item>
          <Item>
            <FadedButton onClick={openFeedbackModal}>
              Submit Feedback <AddComment16 />
            </FadedButton>
          </Item>
          {/* <Item>
            <ShareButton>
              Share <Share16 width={14} height={14} />
            </ShareButton>
          </Item> */}
          {mounted && !hasViewer && !loading && (
            <Item displayMobile>
              <RegisterButton
                onClick={openAuthModal}
                aria-haspopup={true}
                aria-expanded={isAuthOpen}
              >
                Sign Up / Log In
              </RegisterButton>
            </Item>
          )}
        </Right>
      </Wrapper>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={closeFeedbackModal} />
      <AuthModal onClose={closeAuthModal} isOpen={isAuthOpen} />
    </>
  );
};

export default ActionBar;
