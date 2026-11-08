import * as React from 'react';
import Modal from 'components/blocks/Modal';
import { ModalWidths } from 'components/blocks/Modal/Modal';
import { ModalProps } from '../props';

import { ModalContent } from '../styles';
import { Header, Description, ButtonWrapper, CTAButton } from './styles';

const UpgradeModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      titleText="Authentication modal"
      onExit={onClose}
      mounted={isOpen}
      focusDialog
      verticallyCenter
      width={ModalWidths.Medium}
    >
      <ModalContent>
        <Header>🔥 Upgrade for Access</Header>
        <Description>
          This lesson requires a Pro account. Upgrade now to get full course access and learn how to
          master the coding interview and land your next software engineering job.
        </Description>
        <ButtonWrapper>
          <CTAButton href="/pricing?from=upgrade_modal">View Upgrade Options</CTAButton>
        </ButtonWrapper>
      </ModalContent>
    </Modal>
  );
};

export default UpgradeModal;
