import * as React from 'react';
import { SidebarButton } from 'components/blocks/Sidebar';
import { ProblemRefs } from 'components/hooks/useProblemScroller';
import { ScrollerPalette } from 'style/theme';
import { ScrollerProps } from 'content/templates/CodingProblemDualView/props';

enum SectionTitle {
  Introduction = 'Question',
  Breakdown = 'Breakdown',
  Validate = 'Validate',
  Solution = 'Solution',
  Buttons = 'Buttons',
}

const buttons = [
  {
    title: SectionTitle.Introduction,
    color: ScrollerPalette.Introduction,
    activeRef: ProblemRefs.IntroductionRef,
  },
  {
    title: SectionTitle.Breakdown,
    color: ScrollerPalette.Explanation,
    activeRef: ProblemRefs.ExplanationRef,
  },
  {
    title: SectionTitle.Validate,
    color: ScrollerPalette.Validation,
    activeRef: ProblemRefs.ValidationRef,
  },
  {
    title: SectionTitle.Solution,
    color: ScrollerPalette.Solution,
    activeRef: ProblemRefs.SolutionRef,
  },
  {
    title: SectionTitle.Buttons,
    color: ScrollerPalette.Progress,
    activeRef: ProblemRefs.ButtonsRef,
  },
];

const ProblemScroller: React.FC<ScrollerProps> = ({ setActiveRef, toggleTray, isComplete }) => {
  return (
    <>
      {buttons.map((b) => (
        <SidebarButton
          key={b.title}
          onClick={() => {
            if (b.title === SectionTitle.Validate && !isComplete) {
              toggleTray();
            } else {
              setActiveRef(null);
              window.requestAnimationFrame(() => {
                setActiveRef(b.activeRef);
              });
            }
          }}
        >
          {b.title}
        </SidebarButton>
      ))}
    </>
  );
};

export default ProblemScroller;
