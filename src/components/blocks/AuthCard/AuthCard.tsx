import * as React from 'react';
import AuthModal from 'components/blocks/Modal/AuthModal';
import { getHasSubscription } from 'utils/client/lesson';
import { IS_FULL_COURSE_FREE, OPEN_ALL_LESSONS } from 'utils/constants/payments';
import { Props } from './props';

import { Container, Title, ButtonWrapper, RegisterButton, UpgradeButton } from './styles';

const AuthCard: React.FC<Props> = ({ Wrapper, data, loading, error }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const viewer = data && data.users_by_pk;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading || error || !isMounted) {
    return null;
  }

  // With every lesson open there's nothing to log in or upgrade for
  if (OPEN_ALL_LESSONS || getHasSubscription(viewer)) {
    return null;
  }

  if (!viewer) {
    return (
      <>
        <Wrapper>
          <Container>
            <Title>
              {IS_FULL_COURSE_FREE
                ? 'Log in for free access to the full course'
                : 'Log in to continue or upgrade to the full course'}
            </Title>
            <ButtonWrapper>
              <RegisterButton onClick={() => setIsOpen(true)}>Sign Up / Log In</RegisterButton>
              {!IS_FULL_COURSE_FREE && (
                <UpgradeButton href="/pricing?from=auth_card">Upgrade to Full Course</UpgradeButton>
              )}
            </ButtonWrapper>
          </Container>
        </Wrapper>
        <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Wrapper>
        <Container>
          <Title>Upgrade to get access to the full course</Title>
          <ButtonWrapper>
            <UpgradeButton href="/pricing?from=auth_card">Upgrade to Full Course</UpgradeButton>
          </ButtonWrapper>
        </Container>
      </Wrapper>
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AuthCard;
