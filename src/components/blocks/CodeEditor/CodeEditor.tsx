import * as React from 'react';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import { useLessonDimensions } from 'components/context/AppState/useAppState';
import { CodeSnippetGenerator, CodingLanguageMode } from 'utils/constants/lesson';
import { languageConfig } from 'utils/constants/lesson';
import { GetLessonBySlugWithViewerQuery } from 'types/generated/client';
import Tray from 'components/blocks/Tray';
import TabSection from './TabSection';
import SpecTests, { runnerSpecFor } from './SpecTests';
import { isUnavailableIn } from './availability';
import { Initial } from './ExecutionResults';

import { Container, ResultsText } from './styles';

export enum Tabs {
  UserSolution = 'Code',
  Hints = 'Hints',
  Validate = 'Validate',
  Tests = 'Tests',
  Solution = 'Solution',
  Video = 'Video',
  MyTests = 'My Tests',
  Results = 'Results',
  Notes = 'Notes',
}

interface Props {
  title?: string;
  userId: string;
  lessonId: string;
  slug?: string;
  video: JSX.Element;
  status?: GetLessonBySlugWithViewerQuery['users_lessons_status'][0];
  draft?: GetLessonBySlugWithViewerQuery['code_drafts'][0];
  QuestionStatement: React.FC;
  validationItems: React.FC[];
  toggleIsOpen: () => void;
  getUserAnswer: CodeSnippetGenerator;
  getTests: CodeSnippetGenerator;
  getSolutionCode: CodeSnippetGenerator;
  isFetchingUserLessonDetails: boolean;
}

const CodeEditor: React.FC<Props> = ({
  userId,
  lessonId,
  slug,
  video,
  status,
  draft,
  QuestionStatement,
  validationItems,
  getUserAnswer,
  getTests,
  getSolutionCode,
  toggleIsOpen,
  isFetchingUserLessonDetails,
}) => {
  const { videoWidth } = useLessonDimensions();
  const { language } = useCodingLanguage();
  const { tabSize } = languageConfig[language];
  const mode = CodingLanguageMode[language];
  const spec = runnerSpecFor(slug);
  const unavailable = isUnavailableIn(slug, language);
  const [executionResults, setExecutionResults] = React.useState(<Initial />);
  const [isResultsTrayOpen, setIsResultsTrayOpen] = React.useState(false);
  const codeRefreshState = React.useState(Date.now());
  const setCodeRefresh = codeRefreshState[1];

  const [activeTab, setActiveTab] = React.useState(Tabs.UserSolution);
  const toggleToResults = React.useCallback(() => {
    // setActiveTab(Tabs.Results);
    setIsResultsTrayOpen(true);
  }, [setActiveTab, setIsResultsTrayOpen]);

  const savedCode = draft?.code;
  const savedNotes = status?.notes;
  const userCodeRef = React.useRef<HTMLDivElement>(null);
  const solutionCodeRef = React.useRef<HTMLDivElement>(null);
  const testsCodeRef = React.useRef<HTMLDivElement>(null);
  const userCode = userCodeRef.current ? userCodeRef.current.innerText : '';
  const solutionCode = solutionCodeRef.current ? solutionCodeRef.current.innerText : '';
  const testsCode = testsCodeRef.current ? testsCodeRef.current.innerText : '';

  // NOTE: This is a hack to ensure we always grab the latest code from the DOM
  React.useEffect(() => {
    setTimeout(() => {
      setCodeRefresh(Date.now());
    }, 1);
  }, [language]);

  const UserAnswerCode = React.useMemo(() => {
    return getUserAnswer(language);
  }, [getUserAnswer(language), language]);
  const TestsCode = React.useMemo(() => {
    return getTests(language);
  }, [getTests(language), language]);
  const SolutionCode = React.useMemo(() => {
    return getSolutionCode(language);
  }, [getSolutionCode(language), language]);

  const [dynamicTestsCode, setDynamicTestsCode] = React.useState('');
  const handleTestsChange = React.useCallback((_editor: any, _data: any, value: string) => {
    setDynamicTestsCode(value);
  }, []);
  React.useEffect(() => {
    setDynamicTestsCode(testsCode);
  }, [testsCode]);

  return (
    <>
      <Container>
        <TabSection
          userId={userId}
          lessonId={lessonId}
          video={video}
          savedNotes={savedNotes}
          savedCode={savedCode}
          QuestionStatement={QuestionStatement}
          testsCode={dynamicTestsCode}
          testsView={spec ? <SpecTests spec={spec} /> : undefined}
          handleTestsChange={handleTestsChange}
          solutionCode={solutionCode}
          validationItems={validationItems}
          mode={mode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          executionResults={executionResults}
          userCode={userCode}
          tabSize={tabSize}
          toggleToResults={toggleToResults}
          setExecutionResults={setExecutionResults}
          toggleIsOpen={toggleIsOpen}
          isFetchingUserLessonDetails={isFetchingUserLessonDetails}
          unavailable={unavailable}
        />
      </Container>
      <Tray
        fluid
        width={videoWidth}
        maxWidth="100%"
        isOpen={isResultsTrayOpen}
        toggle={() => setIsResultsTrayOpen(!isResultsTrayOpen)}
        label="your solution results"
      >
        <ResultsText>
          <p style={{ marginBottom: '12px', fontWeight: 600 }}>Test Results</p>
          <div>{executionResults}</div>
        </ResultsText>
      </Tray>
      {/* NOTE: This is a hack to pull the code from the .mdx file */}
      <div ref={userCodeRef} style={{ display: 'none' }}>
        {UserAnswerCode}
      </div>
      <div ref={testsCodeRef} style={{ display: 'none' }}>
        {TestsCode}
      </div>
      <div ref={solutionCodeRef} style={{ display: 'none' }}>
        {SolutionCode}
      </div>
    </>
  );
};

export default CodeEditor;
