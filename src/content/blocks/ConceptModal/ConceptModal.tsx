import * as React from 'react';
import ContentModal from 'components/blocks/Modal/ContentModal';

import { TriggerButton } from './styles';

interface Props {
  content: React.ReactNode;
}

const ConceptModal: React.FC<Props> = ({ children, content }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleModal = React.useCallback(() => setIsOpen(prevIsOpen => !prevIsOpen), []);

  return (
    <>
      <TriggerButton onClick={toggleModal} aria-haspopup={true} aria-expanded={isOpen}>
        {children}
      </TriggerButton>
      <ContentModal
        titleText="Concept reference"
        isOpen={isOpen}
        onClose={toggleModal}
        content={content}
      />
    </>
  );
};

export default ConceptModal;
