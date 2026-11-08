import * as React from 'react';
import FocusTrap from 'focus-trap-react';
import dynamic from 'next/dynamic';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import { CodeSnippetGenerator, CodingLanguageMode } from 'utils/constants/lesson';
import { GetLessonBySlugWithViewerQuery } from 'types/generated/client';
import { freezeBody, unfreezeBody } from 'utils/client/dom';
import { languageConfig } from 'utils/constants/lesson';
import LanguageSelect from 'components/blocks/LanguageSelect';
import FullScreenTabSection from './FullScreenTabSection';
import SpecTests, { runnerSpecFor } from './SpecTests';
import { isUnavailableIn } from './availability';
import { Initial } from './ExecutionResults';

import {
  Wrapper,
  Container,
  TitleContainer,
  Title,
  CloseButton,
  CloseIcon,
  Section,
  TitleRight,
} from './styles';

const UserSolution = dynamic(() => import('./UserSolution'), {
  ssr: false,
});

export enum Tabs {
  Question = 'Question',
  Hints = 'Hints',
  Validate = 'Validate',
  Tests = 'Tests',
  Solution = 'Solution',
  MyTests = 'My Tests',
  Results = 'Results',
  Notes = 'Notes',
}

interface Props {
  title?: string;
  isOpen: boolean;
  userId: string;
  lessonId: string;
  slug?: string;
  status?: GetLessonBySlugWithViewerQuery['users_lessons_status'][0];
  draft?: GetLessonBySlugWithViewerQuery['code_drafts'][0];
  toggleIsOpen: () => void;
  QuestionStatement: React.FC;
  validationItems: React.FC[];
  getUserAnswer: CodeSnippetGenerator;
  getTests: CodeSnippetGenerator;
  getSolutionCode: CodeSnippetGenerator;
  isFetchingUserLessonDetails: boolean;
}

const CodeEditor: React.FC<Props> = ({
  title = 'Run Your Code',
  userId,
  lessonId,
  slug,
  draft,
  status,
  isOpen,
  toggleIsOpen,
  QuestionStatement,
  validationItems,
  getUserAnswer,
  getTests,
  getSolutionCode,
  isFetchingUserLessonDetails,
}) => {
  const { language } = useCodingLanguage();
  const { tabSize } = languageConfig[language];
  const mode = CodingLanguageMode[language];
  const spec = runnerSpecFor(slug);
  const unavailable = isUnavailableIn(slug, language);
  const [executionResults, setExecutionResults] = React.useState(<Initial />);
  const codeRefreshState = React.useState(Date.now());
  const setCodeRefresh = codeRefreshState[1];

  const [activeTab, setActiveTab] = React.useState(Tabs.Question);
  const toggleToResults = React.useCallback(() => {
    setActiveTab(Tabs.Results);
  }, [setActiveTab]);

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

  React.useEffect(() => {
    if (isOpen) {
      freezeBody();
    } else {
      unfreezeBody();
    }

    return () => unfreezeBody();
  }, [isOpen]);

  return (
    <>
      <FocusTrap active={isOpen} focusTrapOptions={{ initialFocus: '#code-editor' }}>
        <Wrapper isOpen={isOpen} id="code-editor" tabIndex={-1}>
          <TitleContainer>
            <Title>{title}</Title>
            <TitleRight>
              <div style={{ marginRight: '12px' }}>
                <LanguageSelect />
              </div>
              <CloseButton onClick={toggleIsOpen}>
                <CloseIcon>&times;</CloseIcon> Back to Lesson
              </CloseButton>
            </TitleRight>
          </TitleContainer>
          <Container>
            <Section>
              <UserSolution
                visible
                fullScreen
                toggleIsOpen={toggleIsOpen}
                userId={userId}
                lessonId={lessonId}
                mode={mode}
                userCode={userCode}
                savedCode={savedCode}
                testsCode={dynamicTestsCode}
                tabSize={tabSize}
                toggleToResults={toggleToResults}
                setExecutionResults={setExecutionResults}
                isFetchingUserLessonDetails={isFetchingUserLessonDetails}
                unavailable={unavailable}
              />
            </Section>
            <Section>
              <FullScreenTabSection
                userId={userId}
                lessonId={lessonId}
                savedNotes={savedNotes}
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
              />
            </Section>
          </Container>
        </Wrapper>
      </FocusTrap>
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
