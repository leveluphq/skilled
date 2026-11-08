// TODO: import the things you need from the sample editor component and the video lesson

import * as React from 'react';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import { CodingLanguageMode } from 'utils/constants/lesson';
import { GetLessonBySlugWithViewerQuery } from 'types/generated/client';
import { languageConfig } from 'utils/constants/lesson';
import UserSolution from 'components/blocks/CodeEditor/UserSolution';
import FullScreenTabSection from 'components/blocks/CodeEditor/FullScreenTabSection';
import { Initial } from 'components/blocks/CodeEditor/ExecutionResults';

import sampleLesson from '../sampleLesson';

import { Container, Section } from 'components/blocks/CodeEditor/styles';
import { Wrapper } from './styles';

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
  userId: string;
  status?: GetLessonBySlugWithViewerQuery['users_lessons_status'][0];
}

const SampleEditor: React.FC<Props> = ({ userId }) => {
  const { language } = useCodingLanguage();
  const { tabSize } = languageConfig[language];
  const mode = CodingLanguageMode[language];
  const [executionResults, setExecutionResults] = React.useState(<Initial />);
  const [visible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const [activeTab, setActiveTab] = React.useState(Tabs.Question);
  const toggleToResults = React.useCallback(() => {
    setActiveTab(Tabs.Results);
  }, [setActiveTab]);

  const savedCode = '';
  const userCodeRef = React.useRef<HTMLDivElement>(null);
  const solutionCodeRef = React.useRef<HTMLDivElement>(null);
  const testsCodeRef = React.useRef<HTMLDivElement>(null);
  const userCode = userCodeRef.current ? userCodeRef.current.innerText : '';
  const solutionCode = solutionCodeRef.current ? solutionCodeRef.current.innerText : '';
  const testsCode = testsCodeRef.current ? testsCodeRef.current.innerText : '';

  const UserAnswerCode = React.useMemo(() => {
    return sampleLesson.getUserAnswer(language);
  }, [language]);
  const TestsCode = React.useMemo(() => {
    return sampleLesson.getTests(language);
  }, [language]);
  const SolutionCode = React.useMemo(() => {
    return sampleLesson.getSolutionCode();
  }, [language]);

  return (
    <>
      <Wrapper>
        <Container>
          <Section>
            <UserSolution
              fullScreen
              isFetchingUserLessonDetails={false}
              visible={visible}
              toggleIsOpen={() => {}}
              userId={userId}
              lessonId={sampleLesson.id}
              mode={mode}
              userCode={userCode}
              savedCode={savedCode}
              testsCode={testsCode}
              tabSize={tabSize}
              toggleToResults={toggleToResults}
              setExecutionResults={setExecutionResults}
            />
          </Section>
          <Section>
            <FullScreenTabSection
              userId={userId}
              lessonId={sampleLesson.id}
              QuestionStatement={sampleLesson.QuestionStatement}
              testsCode={testsCode}
              solutionCode={solutionCode}
              validationItems={sampleLesson.validationItems}
              mode={mode}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              executionResults={executionResults}
            />
          </Section>
        </Container>
      </Wrapper>
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

export default SampleEditor;
