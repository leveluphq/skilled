import * as React from 'react';
import useScroll from 'components/hooks/useScroll';
import useRevealDown from 'components/hooks/useRevealDown';

import { DELAY, ItemWrapper, ArrowContainer, ArrowIcon, Reveal, Arrow } from './styles';

interface Props {
  items: React.FC[];
  isComplete: boolean;
  numberViewed: number;
  isActiveSection: boolean;
  scrollRef?: any;
}

const TOP_ITEM_OFFSET = 50;

const HiddenItemList: React.FC<Props> = (props) => {
  const { items, isComplete, numberViewed, isActiveSection, scrollRef } = props;
  const hasRevealedItems = numberViewed > 0;
  const activeItemIndex = numberViewed - 1;
  const activeItemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const revealRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  useScroll({
    delay: DELAY,
    topItemOffset: TOP_ITEM_OFFSET,
    numberViewed,
    scrollRef,
    activeItemRef: activeItemRefs.current[activeItemIndex] || null,
  });
  useRevealDown({
    numberViewed,
    delay: DELAY,
    revealedItemRef: revealRefs.current[activeItemIndex] || null,
    hasRevealedItems,
  });

  const list = items.map((Item, i) => {
    const isLastItem = i === numberViewed - 1;
    const isVisible = numberViewed > i || isComplete;
    const isFocusedItem = isVisible && isActiveSection && isLastItem;

    return (
      <ItemWrapper
        tabIndex={-1}
        ref={(el) => (activeItemRefs.current[i] = el)}
        key={i}
        isVisible={isVisible}
      >
        <Reveal ref={(el) => (revealRefs.current[i] = el)} allItemsVisible={isComplete}>
          <ArrowContainer>
            <Arrow isFocusedItem={isFocusedItem}>
              <ArrowIcon />
            </Arrow>
            <Item />
          </ArrowContainer>
        </Reveal>
      </ItemWrapper>
    );
  });

  return <div>{list}</div>;
};

export default HiddenItemList;
