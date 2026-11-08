import * as React from 'react';
import dynamic from 'next/dynamic';
import UserNotes from './UserNotes';
import { Tabs } from './CodeEditorFullScreen';

import {
  SectionHeader,
  SectionContent,
  ToggleContainer,
  ToggleButton,
  TextSection,
  TextContent,
} from './styles';

const CodeMirrorWrapper = dynamic(() => import('./CodeMirrorWrapper'), {
  ssr: false,
});

interface Props {
  lessonId?: string;
  userId: string;
  QuestionStatement: React.FC;
  validationItems: React.FC[];
  testsCode: string;
  // Shown instead of the editable test code when the tests run on the server
  testsView?: React.ReactNode;
  handleTestsChange?: (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string,
  ) => void | undefined;
  solutionCode: string;
  savedNotes?: string | null;
  mode: string;
  activeTab: Tabs;
  setActiveTab: (activeTab: Tabs) => void;
  executionResults: JSX.Element;
}

const TabSection: React.FC<Props> = ({
  userId,
  lessonId,
  QuestionStatement,
  testsCode,
  testsView,
  savedNotes,
  handleTestsChange,
  solutionCode,
  validationItems,
  mode,
  activeTab,
  setActiveTab,
  executionResults,
}) => {
  // const [showSolution, setShowSolution] = React.useState(false);
  // const editor = React.useRef<Editor | null>(null);

  return (
    <>
      <SectionContent fullScreen>
        <SectionHeader fullScreen>
          <ToggleContainer>
            <ToggleButton
              isActive={activeTab === Tabs.Question}
              onClick={() => setActiveTab(Tabs.Question)}
            >
              {Tabs.Question}
            </ToggleButton>
            <ToggleButton
              isActive={activeTab === Tabs.Validate}
              onClick={() => setActiveTab(Tabs.Validate)}
            >
              {Tabs.Validate}
            </ToggleButton>
            <ToggleButton
              isActive={activeTab === Tabs.Solution}
              onClick={() => setActiveTab(Tabs.Solution)}
            >
              {Tabs.Solution}
            </ToggleButton>
            <ToggleButton
              isActive={activeTab === Tabs.Tests}
              onClick={() => setActiveTab(Tabs.Tests)}
            >
              {Tabs.Tests}
            </ToggleButton>
            <ToggleButton
              isActive={activeTab === Tabs.Results}
              onClick={() => setActiveTab(Tabs.Results)}
            >
              {Tabs.Results}
            </ToggleButton>
            <ToggleButton
              isActive={activeTab === Tabs.Notes}
              onClick={() => setActiveTab(Tabs.Notes)}
            >
              {Tabs.Notes}
            </ToggleButton>
          </ToggleContainer>
        </SectionHeader>
        {activeTab === Tabs.Question && (
          <TextSection fullScreen>
            <TextContent>
              <QuestionStatement />
            </TextContent>
          </TextSection>
        )}
        {activeTab === Tabs.Validate && (
          <TextSection fullScreen>
            <TextContent>
              <ol>
                {validationItems.map((Item, i) => (
                  <li key={i}>
                    <Item />
                  </li>
                ))}
              </ol>
            </TextContent>
          </TextSection>
        )}
        {activeTab === Tabs.Solution && <CodeMirrorWrapper value={solutionCode} mode={mode} />}
        {activeTab === Tabs.Tests && (
          testsView || <CodeMirrorWrapper onChange={handleTestsChange} value={testsCode} mode={mode} />
        )}
        {activeTab === Tabs.Results && (
          <TextSection fullScreen>
            <TextContent>{executionResults}</TextContent>
          </TextSection>
        )}
        {activeTab === Tabs.Notes && (
          <UserNotes userId={userId} lessonId={lessonId} savedNotes={savedNotes} />
        )}
      </SectionContent>
    </>
  );
};

export default TabSection;
