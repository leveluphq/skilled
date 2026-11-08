import { useRef, useEffect, useState } from 'react';

export enum ProblemRefs {
  IntroductionRef = 'IntroductionRef',
  ValidationRef = 'ValidationRef',
  ExplanationRef = 'ExplanationRef',
  SolutionRef = 'SolutionRef',
  ButtonsRef = 'ButtonsRef',
}

export type RefsMap = Record<ProblemRefs, HTMLElement | null>;

const useProblemScroller = (elementToScroll?: any) => {
  const [activeRef, setActiveRef] = useState<ProblemRefs | null>(null);
  const refs = useRef<RefsMap>({
    [ProblemRefs.IntroductionRef]: null,
    [ProblemRefs.ValidationRef]: null,
    [ProblemRefs.ExplanationRef]: null,
    [ProblemRefs.SolutionRef]: null,
    [ProblemRefs.ButtonsRef]: null,
  }).current;

  useEffect(() => {
    if (activeRef) {
      const ref = refs[activeRef];
      if (ref) {
        ref.focus({ preventScroll: true });
        if (elementToScroll && elementToScroll.current) {
          const scrollPosition = ref.offsetTop;
          const elementOffset = elementToScroll.current.offsetTop;
          elementToScroll.current.scrollTo({
            left: 0,
            top: scrollPosition - elementOffset,
            behavior: 'smooth',
          });
        } else if (window.scrollTo) {
          const scrollPosition = ref.offsetTop;
          window.scrollTo({ left: 0, top: scrollPosition, behavior: 'smooth' });
        }
      }
    }
  }, [activeRef, elementToScroll]);

  return {
    refs,
    setActiveRef,
  };
};

export default useProblemScroller;
