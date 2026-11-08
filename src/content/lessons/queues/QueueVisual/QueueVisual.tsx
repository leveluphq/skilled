import * as React from 'react';
import styled, { css } from 'styled-components';

const ITEM_HEIGHT = 56;
const ITEM_MARGIN = 4;

const Wrapper = styled.div`
  margin: 0 auto;
  display: flex;
  align-items: center;
`;

const AddRemoveItem = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const ArrowContainer = styled.div`
  position: relative;
  height: 100%;
  z-index: 1;
`;

const Arrow = styled.div`
  font-size: 40px;
`;

const ArrowLeft = styled(Arrow)`
  transform: scaleX(-1);
  margin-left: 16px;
`;

const ArrowRight = styled(Arrow)`
  transform: scaleY(-1);
  margin-right: 16px;
`;

const Queue = styled.div`
  display: flex;
  border: 4px solid ${({ theme }) => theme.color.text};
  border-left: none;
  border-right: none;
  padding: 12px 8px;
  margin-left: 8px;
  margin-right: 8px;
  margin-top: 76px;
`;

const itemStyles = css`
  width: ${ITEM_HEIGHT}px;
  height: ${ITEM_HEIGHT}px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  position: relative;
  font-size: 12px;
  font-weight: bold;
`;

const Item = styled.div`
  ${itemStyles};
  background-color: ${({ theme }) => theme.color.basePalette.Blue};
  margin-left: ${ITEM_MARGIN}px;
  margin-right: ${ITEM_MARGIN}px;
`;

const TopItem = styled.div<{ right?: boolean }>`
  ${itemStyles};
  width: 80px;
  background: linear-gradient(
    ${({ theme, right }) =>
      right
        ? `90deg, ${theme.color.basePalette.Blue}, transparent`
        : `90deg, transparent, ${theme.color.basePalette.Blue}`}
  );
`;

const QueueItem = ({ text = ' ' }) => <Item>{text}</Item>;

const QueueVisual = () => {
  return (
    <Wrapper>
      <AddRemoveItem>
        <TopItem>enqueue</TopItem>
        <ArrowContainer>
          <ArrowLeft>&#8626;</ArrowLeft>
        </ArrowContainer>
      </AddRemoveItem>
      <Queue>
        <QueueItem text="last" />
        <QueueItem />
        <QueueItem text="first" />
      </Queue>
      <AddRemoveItem>
        <TopItem right>dequeue</TopItem>
        <ArrowContainer>
          <ArrowRight>&#x21b4;</ArrowRight>
        </ArrowContainer>
      </AddRemoveItem>
    </Wrapper>
  );
};

export default QueueVisual;
