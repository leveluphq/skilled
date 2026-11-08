export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AuthModalProps extends ModalProps {
  product?: string;
}
