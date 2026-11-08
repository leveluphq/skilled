import * as React from 'react';
import AriaModal, { AriaModalProps, RequiredAriaTypes } from 'react-aria-modal';
import { MAX_CONTENT_WIDTH } from 'style/elements';
import CloseButton from './CloseButton';

import { ModalWrapper } from './styles';

export enum ModalWidths {
  Skinny = 'skinny',
  Medium = 'medium',
  Content = 'content',
}

export const maxModalWidths = {
  [ModalWidths.Skinny]: '456px',
  [ModalWidths.Medium]: '560px',
  [ModalWidths.Content]: `${MAX_CONTENT_WIDTH}px`,
};

interface Props {
  useCloseButton?: boolean;
  width?: ModalWidths;
  border?: boolean;
  dark?: boolean;
}

const Modal: React.FC<Props & AriaModalProps & RequiredAriaTypes> = ({
  useCloseButton = true,
  width = ModalWidths.Skinny,
  dark,
  border,
  children,
  ...props
}) => {
  if (typeof window === 'undefined' || !props.mounted) {
    return null;
  }

  const maxModalWidth = maxModalWidths[width] || maxModalWidths.skinny;

  return (
    <AriaModal underlayColor="rgba(0,0,0,0.85)" {...props}>
      <ModalWrapper width={maxModalWidth} dark={dark} border={border}>
        {children}
        {useCloseButton && <CloseButton onExit={props.onExit} />}
      </ModalWrapper>
    </AriaModal>
  );
};

export default Modal;
