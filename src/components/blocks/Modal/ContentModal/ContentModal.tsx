import * as React from 'react';
import Modal from 'components/blocks/Modal';
import { Container } from 'style/elements';
import { ModalWidths } from '../Modal';
import { ModalProps } from '../props';

import { ModalContent, MarkdownContent, Title } from './styles';

interface Props extends ModalProps {
  title?: string;
  titleText: string;
  content: React.ReactNode;
}

const ContentModal: React.FC<Props> = ({ onClose, isOpen, title, titleText, content }) => {
  return (
    <Modal
      dark
      border
      width={ModalWidths.Content}
      titleText={titleText}
      onExit={onClose}
      mounted={isOpen}
      focusDialog
      verticallyCenter
    >
      <ModalContent>
        {!!title && (
          <Container>
            <Title>{title}</Title>
          </Container>
        )}
        <MarkdownContent>{content}</MarkdownContent>
      </ModalContent>
    </Modal>
  );
};

export default ContentModal;
