import * as React from 'react';
import { AddComment16 } from '@carbon/icons-react';
import ViewerContext from 'components/context/ViewerContext';
import AuthModal from 'components/blocks/Modal/AuthModal';
import NavigateCourseButtons from 'components/blocks/NavigateCourseButtons';
import FeedbackModal from 'components/blocks/Modal/FeedbackModal';
import LogoSvg from 'svg/Logo';
import { PageRoot } from 'utils/constants/routes';
import noop from 'utils/shared/noop';
import DropdownButton from './DropdownButton';
import Timer from './Timer';

import { Wrapper, Logo, Item, Left, Right, FadedButton, RegisterButton } from './styles';

const ActionBarDisabled: React.FC = () => {
  const viewerToken = React.useContext(ViewerContext);
  const hasViewer = !!viewerToken;
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

  return (
    <>
      <Wrapper>
        <Left fullWidthMobile={hasViewer}>
          <Logo href={hasViewer ? `/${PageRoot.Course}` : '/'}>
            <LogoSvg />
          </Logo>
          <Item displayMobile={hasViewer}>
            <NavigateCourseButtons slug="" displayTitle={false} />
          </Item>
          {
            <Item>
              <DropdownButton
                left
                triggerText=""
                handleFocus={noop}
                handleBlur={noop}
                items={[
                  {
                    name: '',
                    onClick: () => {},
                  },
                ]}
              />
            </Item>
          }
        </Left>
        <Right>
          <Item>
            <Timer />
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
          {!hasViewer && (
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

export default ActionBarDisabled;
