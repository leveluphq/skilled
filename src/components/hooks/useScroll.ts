import { useEffect } from 'react';

interface Params {
  delay: number;
  topItemOffset: number;
  numberViewed: number;
  scrollRef?: any;
  activeItemRef: HTMLDivElement | null;
}

const useScroll = ({ delay = 0, scrollRef, activeItemRef }: Params) => {
  useEffect(() => {
    if (activeItemRef) {
      // NOTE: Turning this off because scroll seems to be correct without it.
      // Previously it had jank, but I added overflow-anchor: none to the LeftSection
      // activeItemRef.focus({ preventScroll: true });

      setTimeout(() => {
        if (activeItemRef) {
          activeItemRef.focus({ preventScroll: true });

          if (scrollRef && scrollRef) {
            const scrollPosition = activeItemRef.offsetTop;
            const elementOffset = scrollRef.current.offsetTop;

            scrollRef.current.scrollTo({
              top: scrollPosition - elementOffset,
              left: 0,
              behavior: 'smooth',
            });
          } else if (window.scrollTo) {
            const scrollPosition = activeItemRef.offsetTop;
            window.scrollTo({
              top: scrollPosition,
              left: 0,
              behavior: 'smooth',
            });
          }
        }
      }, delay);
    }
  }, [scrollRef, activeItemRef]);

  return activeItemRef;
};

export default useScroll;
