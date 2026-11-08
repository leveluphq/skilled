import styled from 'styled-components';
import { PageLast32 } from '@carbon/icons-react';
import { MAX_CONTENT_WIDTH } from 'style/elements';

export const DELAY = 150;

export const ArrowContainer = styled.div`
  width: ${MAX_CONTENT_WIDTH}px;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  position: relative;
`;

export const ArrowIcon = styled(PageLast32)`
  fill: ${(props) => props.theme.color.brand};
`;

export const Reveal = styled.div<{ allItemsVisible: boolean }>`
  height: ${({ allItemsVisible }) => (allItemsVisible ? '100%' : 0)};
  overflow: hidden;
  transition: all ${DELAY}ms ease;
`;

export const ItemWrapper = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};

  &:focus {
    outline: none;
  }
`;

export const Arrow = styled.div<{ isFocusedItem: boolean }>`
  position: absolute;
  top: 4px;
  left: -20px;
  transition: opacity ${DELAY}ms ease;
  opacity: ${({ isFocusedItem }) => (isFocusedItem ? 1 : 0)};
`;

export const Wrapper = styled.div<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
`;
