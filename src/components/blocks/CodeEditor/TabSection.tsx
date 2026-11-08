import * as React from 'react';
import dynamic from 'next/dynamic';
import UserNotes from './UserNotes';
import { Tabs } from './CodeEditor';

import {
  SectionHeader,
  SectionContent,
  ToggleContainer,
  ToggleButton,
  TextSection,
  TextContent,
  VisibleTab,
} from './styles';

const UserSolution = dynamic(() => import('./UserSolution'), {
  ssr: false,
});

const CodeMirrorWrapper = dynamic(() => import('./CodeMirrorWrapper'), {
  ssr: false,
});

interface Props {
  lessonId?: string;
  userId: string;
  video: JSX.Element;
  savedCode?: string | null;
  savedNotes?: string | null;
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
  mode: string;
  activeTab: Tabs;
  setActiveTab: (activeTab: Tabs) => void;
  toggleIsOpen: () => void;
  executionResults: JSX.Element;
  userCode: string;
  tabSize: number;
  toggleToResults: () => void;
  setExecutionResults: (ExecutionComponent: JSX.Element) => void;
  isFetchingUserLessonDetails: boolean;
  unavailable?: boolean;
}

const TabSection: React.FC<Props> = ({
  video,
  userId,
  lessonId,
  savedCode,
  savedNotes,
  userCode,
  testsCode,
  testsView,
  handleTestsChange,
  solutionCode,
  validationItems,
  mode,
  activeTab,
  setActiveTab,
  // executionResults,
  tabSize,
  toggleToResults,
  setExecutionResults,
  toggleIsOpen,
  isFetchingUserLessonDetails,
  unavailable,
}) => {
  // const [showSolution, setShowSolution] = React.useState(false);
  // const editor = React.useRef<Editor | null>(null);

  return (
    <>
      <SectionContent>
        <SectionHeader>
          <ToggleContainer>
            <ToggleButton
              isActive={activeTab === Tabs.UserSolution}
              onClick={() => setActiveTab(Tabs.UserSolution)}
            >
              {Tabs.UserSolution}
            </ToggleButton>
            <ToggleButton
              isActive={activeTab === Tabs.Video}
              onClick={() => setActiveTab(Tabs.Video)}
            >
              {Tabs.Video}
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
              isActive={activeTab === Tabs.Notes}
              onClick={() => setActiveTab(Tabs.Notes)}
            >
              {Tabs.Notes}
            </ToggleButton>
          </ToggleContainer>
        </SectionHeader>
        <UserSolution
          userId={userId}
          lessonId={lessonId}
          visible={activeTab === Tabs.UserSolution}
          mode={mode}
          userCode={userCode}
          savedCode={savedCode}
          testsCode={testsCode}
          tabSize={tabSize}
          toggleToResults={toggleToResults}
          setExecutionResults={setExecutionResults}
          toggleIsOpen={toggleIsOpen}
          isFetchingUserLessonDetails={isFetchingUserLessonDetails}
          unavailable={unavailable}
        />
        <VisibleTab visible={activeTab === Tabs.Video}>{video}</VisibleTab>
        {activeTab === Tabs.Validate && (
          <TextSection>
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
        {activeTab === Tabs.Notes && (
          <UserNotes userId={userId} lessonId={lessonId} savedNotes={savedNotes} />
        )}
      </SectionContent>
    </>
  );
};

export default TabSection;
