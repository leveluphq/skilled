import * as React from 'react';
import { MigrateAlt16 } from '@carbon/icons-react';
import { LeftPanelTabs } from 'content/templates/CodingProblemDualView/props';
import { LeftPanelProps } from './props';
import { LeftPanelToggleButton } from './styles';

const LeftPanelToggle: React.FC<LeftPanelProps> = ({ activeLeftPanel, toggleActiveLeftPanel }) => {
  return (
    <LeftPanelToggleButton
      onClick={toggleActiveLeftPanel}
      isRotated={activeLeftPanel !== LeftPanelTabs.Text}
    >
      <MigrateAlt16 />{' '}
      <span>
        {activeLeftPanel === LeftPanelTabs.Text ? 'Question Breakdown' : 'Solution Video'}
      </span>
    </LeftPanelToggleButton>
  );
};

export default LeftPanelToggle;
