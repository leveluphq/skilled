import { useEffect } from 'react';

interface Params {
  numberViewed: number;
  delay: number;
  revealedItemRef: HTMLDivElement | null;
  hasRevealedItems: boolean;
}

const useRevealDown = ({ numberViewed, delay, revealedItemRef, hasRevealedItems }: Params) => {
  useEffect(() => {
    if (hasRevealedItems && revealedItemRef) {
      revealedItemRef.style.height = `${revealedItemRef.scrollHeight}px`;

      setTimeout(() => {
        if (revealedItemRef) {
          revealedItemRef.style.height = '100%';
        }
      }, delay);
    }
  }, [hasRevealedItems, numberViewed]);

  return revealedItemRef;
};

export default useRevealDown;
