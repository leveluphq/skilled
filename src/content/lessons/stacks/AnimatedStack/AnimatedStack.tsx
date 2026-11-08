import * as React from 'react';
import styled from 'styled-components';
import { mobile } from 'style/breakpoints';

const WIDTH = 160;
const ITEM_HEIGHT = 40;
const TOP_PAD = 12;
const MOVEMENT_SPEED = 1000;
enum Status {
  Idle = 'IDLE',
  Push = 'PUSH',
  Lower = 'LOWER',
  Rise = 'RISE',
  Pop = 'POP',
}

const Wrapper = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${mobile()} {
    margin-top: 24px;
  }
`;

const Text = styled.div`
  padding-bottom: 16px;
`;

const Stack = styled.div`
  width: ${WIDTH}px;
  border: 4px solid ${({ theme }) => theme.color.text};
  border-top: none;
  padding: 12px;
  padding-top: 0;
`;

const getTransform = (status: Status, num: number) => {
  const verticalOffset = `${(num + 1) * (ITEM_HEIGHT + TOP_PAD) + 8}px`;

  if (status === Status.Idle) {
    return `translateX(-100px) translateY(-${verticalOffset})`;
  } else if (status === Status.Push) {
    return `translateX(0) translateY(-${verticalOffset})`;
  } else if (status === Status.Lower) {
    return `translateX(0) translateY(0)`;
  } else if (status === Status.Rise) {
    return `translateX(0) translateY(-${verticalOffset})`;
  } else if (status === Status.Pop) {
    return `translateX(100px) translateY(-${verticalOffset})`;
  }
};

const Item = styled.div<{ status: Status; num: number }>`
  height: ${ITEM_HEIGHT}px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  position: relative;
  font-size: 12px;
  font-weight: bold;
  background-color: ${({ theme }) => theme.color.basePalette.Blue};
  margin-top: 12px;
  transition: opacity ${MOVEMENT_SPEED}ms ease, transform ${MOVEMENT_SPEED}ms ease;
  transform: ${({ status, num }) => getTransform(status, num)};
  opacity: ${({ status }) => (status === Status.Idle || status === Status.Pop ? 0 : 1)};
`;

const getAnimationState = ({
  num,
  activeItemNumber,
  activeItemStatus,
  animationDirection,
}: any) => {
  if (num === activeItemNumber) {
    return activeItemStatus;
  }

  if (animationDirection === Status.Push) {
    if (num > activeItemNumber) {
      return Status.Lower;
    } else {
      return Status.Idle;
    }
  } else if (animationDirection === Status.Pop) {
    if (num < activeItemNumber) {
      return Status.Idle;
    } else {
      return Status.Lower;
    }
  }
};

const pushDirectionNextItem = {
  [Status.Idle]: Status.Push,
  [Status.Push]: Status.Lower,
  [Status.Lower]: null,
};

const popDirectionNextItem = {
  [Status.Lower]: Status.Rise,
  [Status.Rise]: Status.Pop,
  [Status.Pop]: null,
};

const items = [{ text: 'top' }, { text: 'middle' }, { text: 'bottom' }];
const initalState = {
  activeItemNumber: items.length - 1,
  activeItemStatus: Status.Idle,
  animationDirection: Status.Push,
};

const AnimatedStack = () => {
  const [animationState, setAnimationState] = React.useState(initalState);

  React.useEffect(() => {
    const { activeItemNumber, activeItemStatus, animationDirection } = animationState;

    let timeout = setTimeout(() => {
      if (animationDirection === Status.Push) {
        // @ts-ignore
        const nextStatus: any = pushDirectionNextItem[activeItemStatus] as any;

        if (!nextStatus) {
          const endOfList = activeItemNumber - 1 === -1;
          const nextItemNumber = endOfList ? 0 : activeItemNumber - 1;
          const nextStatus = endOfList ? Status.Rise : Status.Push;
          const nextAnimationDirection = endOfList ? Status.Pop : Status.Push;

          setAnimationState({
            activeItemNumber: nextItemNumber,
            activeItemStatus: nextStatus,
            animationDirection: nextAnimationDirection,
          });
        } else {
          setAnimationState({
            activeItemNumber,
            activeItemStatus: nextStatus,
            animationDirection: Status.Push,
          });
        }
      } else {
        // @ts-ignore
        const nextStatus: any = popDirectionNextItem[activeItemStatus] as any;

        if (!nextStatus) {
          const endOfList = activeItemNumber === items.length - 1;
          const nextItemNumber = endOfList ? items.length - 1 : activeItemNumber + 1;
          const nextStatus = endOfList ? Status.Idle : Status.Rise;
          const nextAnimationDirection = endOfList ? Status.Push : Status.Pop;

          setAnimationState({
            activeItemNumber: nextItemNumber,
            activeItemStatus: nextStatus,
            animationDirection: nextAnimationDirection,
          });
        } else {
          setAnimationState({
            activeItemNumber,
            activeItemStatus: nextStatus,
            animationDirection: Status.Pop,
          });
        }
      }
    }, MOVEMENT_SPEED + 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [animationState]);

  const activeItem = items[animationState.activeItemNumber];

  return (
    <Wrapper>
      <Text>
        {animationState.animationDirection === Status.Push
          ? `push(${activeItem.text})`
          : `pop(${activeItem.text})`}
      </Text>
      <Stack>
        {items.map((item, i) => {
          return (
            <Item
              key={item.text}
              status={getAnimationState({
                num: i,
                ...animationState,
              })}
              num={i}
            >
              {item.text}
            </Item>
          );
        })}
      </Stack>
    </Wrapper>
  );
};

export default AnimatedStack;
