import * as React from 'react';

import { Wrapper, Container, CloseButton } from './styles';

const DEFAULT_HEIGHT = '50vh';

interface Props {
  isOpen: boolean;
  isSidebarPage?: boolean;
  toggle: () => void;
  label?: string;
  useContentHeight?: boolean;
  backgroundOpacity?: number;
  width?: number;
  maxWidth?: string;
  fluid?: boolean;
}

const Tray: React.FC<Props> = ({
  isOpen,
  isSidebarPage = false,
  toggle,
  label = '',
  useContentHeight = false,
  backgroundOpacity = 1,
  width = 100,
  maxWidth,
  fluid,
  children,
}) => {
  const activeItemRef = React.useRef<HTMLDivElement>(null);
  const height = activeItemRef.current ? `${activeItemRef.current.clientHeight}px` : DEFAULT_HEIGHT;
  React.useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.focus();
    }

    if (!isOpen && activeItemRef.current) {
      activeItemRef.current.blur();
    }
  }, [isOpen]);

  return (
    <Wrapper
      isSidebarPage={isSidebarPage}
      isOpen={isOpen}
      ref={activeItemRef}
      height={height}
      width={width}
      maxWidth={maxWidth}
      fluid={fluid}
    >
      <Container useContentHeight={useContentHeight} backgroundOpacity={backgroundOpacity}>
        {children}
      </Container>
      <CloseButton aria-label={`close ${label}`} onClick={toggle}>
        &times;
      </CloseButton>
    </Wrapper>
  );
};

export default Tray;
