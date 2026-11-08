import * as React from 'react';
import AuthModal from 'components/blocks/Modal/AuthModal';
import UpgradeModal from 'components/blocks/Modal/UpgradeModal';
import { getHasLessonAccess } from 'utils/client/lesson';
import { Props } from './props';

import { MarginContainerCenter } from 'content/blocks/styles';
import { Wrapper, Solution, Button } from './styles';

const QuestionHiddenSolution: React.FC<Props> = ({
  introduction,
  solution,
  data,
  isDefaultOpen,
}) => {
  const [isRevealed, setIsRevealed] = React.useState(isDefaultOpen || false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const viewer = data?.users_by_pk;
  const lesson = data?.lessons[0];

  const handleSolutionClick = React.useCallback(() => {
    const hasLessonAccess = getHasLessonAccess(lesson, viewer);

    if (hasLessonAccess) {
      setIsRevealed(true);
    } else if (!!viewer) {
      setIsUpgradeModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  }, [viewer, lesson]);

  return (
    <>
      <Wrapper>
        <>{introduction}</>
        {!isRevealed && (
          <MarginContainerCenter>
            <Button hoverable onClick={handleSolutionClick}>
              Show Solution
            </Button>
          </MarginContainerCenter>
        )}
        {isRevealed ? <>{solution}</> : <Solution>{solution}</Solution>}
      </Wrapper>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </>
  );
};

export default QuestionHiddenSolution;
