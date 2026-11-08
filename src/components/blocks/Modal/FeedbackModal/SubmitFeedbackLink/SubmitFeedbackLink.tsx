import * as React from 'react';
import FeedbackModal from 'components/blocks/Modal/FeedbackModal';

import { Text } from './styles';

interface Props {
  text?: string;
}

const SubmitFeedbackLink: React.FC<Props> = ({ text = 'submit feedback' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const setModalOpen = React.useCallback(() => {
    setIsOpen(true);
  }, []);
  const setModalClose = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <Text onClick={setModalOpen}>{text}</Text>
      <FeedbackModal isOpen={isOpen} onClose={setModalClose} />
    </>
  );
};

export default SubmitFeedbackLink;
