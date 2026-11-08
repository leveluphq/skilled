import * as React from 'react';
import styled from 'styled-components';
import { mobile } from 'style/breakpoints';

const ITEM_HEIGHT = 56;
const EXTRA_PAD = 12;
const MOVEMENT_SPEED = 1000;
const ITEM_MARGIN = 4;
const items = [{ text: 'back' }, { text: 'mid' }, { text: 'front' }];

enum Status {
  Idle = 'IDLE',
  Enqueue = 'ENQUEUE',
  Dequeue = 'DEQUEUE',
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

const Queue = styled.div`
  display: flex;
  border: 4px solid ${({ theme }) => theme.color.text};
  border-left: none;
  border-right: none;
  padding: 12px;
`;

const getTransform = (status: Status, direction: Status, num: number, activeItemNumber: number) => {
  const stationaryOffset = (items.length - activeItemNumber) * (ITEM_HEIGHT + 2 * ITEM_MARGIN);
  const horizontalOffset =
    stationaryOffset + (num + 1) * (ITEM_HEIGHT + EXTRA_PAD) + 2 * ITEM_MARGIN;

  if (status === Status.Idle) {
    return `translateX(-${horizontalOffset}px)`;
  } else if (status === Status.Enqueue && direction === Status.Enqueue) {
    return `translateX(0)`;
  } else if (status === Status.Enqueue && direction === Status.Dequeue && num < activeItemNumber) {
    return `translateX(${stationaryOffset}px)`;
  } else {
    return `translateX(${horizontalOffset}px)`;
  }
};

const Item = styled.div<{
  status: Status;
  direction: Status;
  num: number;
  activeItemNumber: number;
}>`
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
  background-color: ${({ theme }) => theme.color.basePalette.Blue};
  margin-left: ${ITEM_MARGIN}px;
  margin-right: ${ITEM_MARGIN}px;
  transition: opacity ${MOVEMENT_SPEED}ms ease, transform ${MOVEMENT_SPEED}ms ease;
  transform: ${({ status, direction, num, activeItemNumber }) =>
    getTransform(status, direction, num, activeItemNumber)};
  opacity: ${({ status }) => (status === Status.Idle || status === Status.Dequeue ? 0 : 1)};
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

  if (animationDirection === Status.Enqueue) {
    if (num > activeItemNumber) {
      return Status.Enqueue;
    } else {
      return Status.Idle;
    }
  } else if (animationDirection === Status.Dequeue) {
    if (num < activeItemNumber) {
      return Status.Enqueue;
    } else {
      return Status.Idle;
    }
  }
};

const enqueueDirectionNextItem = {
  [Status.Idle]: Status.Enqueue,
  [Status.Enqueue]: null,
};

const dequeueDirectionNextItem = {
  [Status.Enqueue]: Status.Dequeue,
  [Status.Dequeue]: null,
};

const initalState = {
  activeItemNumber: items.length - 1,
  activeItemStatus: Status.Idle,
  animationDirection: Status.Enqueue,
};

const AnimatedQueue = () => {
  const [animationState, setAnimationState] = React.useState(initalState);

  React.useEffect(() => {
    const { activeItemNumber, activeItemStatus, animationDirection } = animationState;

    let timeout = setTimeout(() => {
      if (animationDirection === Status.Enqueue) {
        // @ts-ignore
        const nextStatus: any = enqueueDirectionNextItem[activeItemStatus] as any;

        if (!nextStatus) {
          const endOfList = activeItemNumber - 1 === -1;
          const nextItemNumber = endOfList ? items.length - 1 : activeItemNumber - 1;
          const nextStatus = endOfList ? Status.Dequeue : Status.Enqueue;
          const nextAnimationDirection = endOfList ? Status.Dequeue : Status.Enqueue;

          setAnimationState({
            activeItemNumber: nextItemNumber,
            activeItemStatus: nextStatus,
            animationDirection: nextAnimationDirection,
          });
        } else {
          setAnimationState({
            activeItemNumber,
            activeItemStatus: nextStatus,
            animationDirection: Status.Enqueue,
          });
        }
      } else {
        // @ts-ignore
        const nextStatus: any = dequeueDirectionNextItem[activeItemStatus] as any;

        if (!nextStatus) {
          const endOfList = activeItemNumber === 0;
          const nextItemNumber = endOfList ? items.length - 1 : activeItemNumber - 1;
          const nextStatus = endOfList ? Status.Idle : Status.Dequeue;
          const nextAnimationDirection = endOfList ? Status.Enqueue : Status.Dequeue;

          setAnimationState({
            activeItemNumber: nextItemNumber,
            activeItemStatus: nextStatus,
            animationDirection: nextAnimationDirection,
          });
        } else {
          setAnimationState({
            activeItemNumber,
            activeItemStatus: nextStatus,
            animationDirection: Status.Dequeue,
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
        {animationState.animationDirection === Status.Enqueue
          ? `enqueue(${activeItem.text})`
          : `dequeue(${activeItem.text})`}
      </Text>
      <Queue>
        {items.map((item, i) => {
          return (
            <Item
              key={item.text}
              direction={animationState.animationDirection}
              status={getAnimationState({
                num: i,
                ...animationState,
              })}
              num={i}
              activeItemNumber={animationState.activeItemNumber}
            >
              {item.text}
            </Item>
          );
        })}
      </Queue>
    </Wrapper>
  );
};

export default AnimatedQueue;
