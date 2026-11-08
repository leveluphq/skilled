import * as React from 'react';
import Modal from 'components/blocks/Modal';
import { IS_FULL_COURSE_FREE } from 'utils/constants/payments';
import CompanyButton from './CompanyButton';
import { OauthProvider } from 'utils/constants/auth';
import { AuthModalProps } from '../props';

import { ModalContent } from '../styles';
import { Header, Disclaimer, Description, ButtonWrapper } from './styles';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, product }) => {
  return (
    <Modal
      titleText="Authentication modal"
      onExit={onClose}
      mounted={isOpen}
      focusDialog
      verticallyCenter
    >
      <ModalContent>
        <Header>Sign Up or Log In</Header>
        {IS_FULL_COURSE_FREE && <Description>Full course access is currently free.</Description>}
        {IS_FULL_COURSE_FREE && (
          <Description>Create an account to access the entire course</Description>
        )}
        {!IS_FULL_COURSE_FREE && (
          <Description>Land a job you want and increase your salary 🤑</Description>
        )}
        <ButtonWrapper>
          <CompanyButton company={OauthProvider.Github} product={product}>
            GitHub
          </CompanyButton>
        </ButtonWrapper>
        <ButtonWrapper>
          <CompanyButton company={OauthProvider.Google} product={product}>
            Google
          </CompanyButton>
        </ButtonWrapper>
        {/* <ButtonWrapper>
          <CompanyButton company={OauthProvider.Facebook} product={product}>
            Facebook
          </CompanyButton>
        </ButtonWrapper> */}
        {/* <ButtonWrapper>
          <CompanyButton company={Company.Twitter}>Auth Twitter</CompanyButton>
        </ButtonWrapper> */}
        {/* <ButtonWrapper>
          <CompanyButton company={Company.Linkedin}>Auth LinkedIn</CompanyButton>
        </ButtonWrapper> */}
        <Disclaimer>We use OAuth to prevent spam and abuse</Disclaimer>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
