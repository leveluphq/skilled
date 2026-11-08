import * as React from 'react';
import styled, { css } from 'styled-components';

const WIDTH = 160;

const Wrapper = styled.div`
  width: ${2 * WIDTH}px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PushPop = styled.div`
  width: 100%;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
`;

const PushPopItem = styled.div`
  display: flex;
  align-items: flex-end;
`;

const ArrowContainer = styled.div`
  position: relative;
  height: 100%;
  z-index: 1;
`;

const Arrow = styled.div`
  font-size: 40px;
  position: absolute;
`;

const ArrowLeft = styled(Arrow)`
  left: -15px;
  top: -3px;
`;

const ArrowRight = styled(Arrow)`
  right: -19px;
  top: -6px;
`;

const Stack = styled.div`
  width: ${WIDTH}px;
  border: 4px solid ${({ theme }) => theme.color.text};
  border-top: none;
  padding: 12px;
`;

const itemStyles = css`
  height: 40px;
  width: 100%;
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
  margin-top: 12px;
`;

const TopItem = styled.div<{ right?: boolean }>`
  ${itemStyles};
  width: 112px;
  background: linear-gradient(
    ${({ theme, right }) =>
      right
        ? `90deg, ${theme.color.basePalette.Blue}, transparent`
        : `90deg, transparent, ${theme.color.basePalette.Blue}`}
  );
`;

const StackItem = ({ text = ' ' }) => <Item>{text}</Item>;

const StackVisual = () => {
  return (
    <Wrapper>
      <PushPop>
        <PushPopItem>
          <TopItem>push</TopItem>
          <ArrowContainer>
            <ArrowLeft>&#8628;</ArrowLeft>
          </ArrowContainer>
        </PushPopItem>
        <PushPopItem>
          <ArrowContainer>
            <ArrowRight>&#8625;</ArrowRight>
          </ArrowContainer>
          <TopItem right>pop</TopItem>
        </PushPopItem>
      </PushPop>
      <Stack>
        <StackItem text="top (last in)" />
        <StackItem />
        <StackItem />
        <StackItem text="bottom (first in)" />
      </Stack>
    </Wrapper>
  );
};

export default StackVisual;
