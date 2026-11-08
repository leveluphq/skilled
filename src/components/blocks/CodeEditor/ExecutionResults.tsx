import * as React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Checkmark16, Close16 } from '@carbon/icons-react';
import Pulse from 'components/blocks/Loading/Pulse';

import { ResultItem, ResultText, AnswerText, OutputText } from './styles';

const LOADING_PHRASES = ['Uploading your code', 'Compiling', 'Running Tests', 'Processing Results'];

const INITIAL_POSITION = 24;

const fadeInOut = keyframes`
  0% {
    transform: translateY(-${INITIAL_POSITION}px);
    opacity: 0;
  }

  35% {
    transform: translateY(0px);
    opacity: 1;
  }

  65% {
    transform: translateY(0px);
    opacity: 1;
  }

  100% {
    transform: translateY(-${INITIAL_POSITION}px);
    opacity: 0;
  }
`;

const fadeIn = keyframes`
  0% {
    transform: translateY(-${INITIAL_POSITION}px);
    opacity: 0;
  }

  35% {
    transform: translateY(0px);
    opacity: 1;
  }

  65% {
    transform: translateY(0px);
    opacity: 1;
  }

  100% {
    transform: translateY(0px);
    opacity: 1;
  }
`;

const LoaderWrapper = styled.div`
  text-align: center;
`;

const TextContainer = styled.div`
  position: relative;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextItem = styled.div<{ index: number; isLast: boolean }>`
  position: absolute;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.color.textSecondary};
  animation: ${({ index, isLast }) =>
    css`
      ${isLast ? fadeIn : fadeInOut} 2000ms linear ${2000 * index + 500}ms 1 normal forwards
    `};
  transform: translateY(-${INITIAL_POSITION}px);
  opacity: 0;
`;

export const Initial = () => {
  return (
    <>
      <p>Run your code and see results here...</p>
    </>
  );
};

export const Running = () => {
  return (
    <>
      <LoaderWrapper>
        <TextContainer>
          {LOADING_PHRASES.map((p, i) => (
            <TextItem key={p} index={i} isLast={i === LOADING_PHRASES.length - 1}>
              {p}
            </TextItem>
          ))}
        </TextContainer>
        <Pulse />
      </LoaderWrapper>
    </>
  );
};

interface Result {
  passed: boolean;
  description: string;
  expected: any;
  userAnswer: any;
}

interface ResultProps {
  results: Result[];
  logs?: string | null | undefined;
  err?: string | null | undefined;
}

export const Results: React.FC<ResultProps> = ({ results, logs, err }) => (
  <>
    {!!logs && <div>{logs}</div>}
    <ol>
      {results.map(({ passed, description, expected, userAnswer }) => (
        <ResultItem key={description} passed={passed}>
          <ResultText>
            {description} {' ----- '}
            {passed ? (
              <>
                passed <Checkmark16 />
              </>
            ) : (
              <>
                failed <Close16 />
              </>
            )}
          </ResultText>
          {!passed && (
            <AnswerText>
              <div>Your Answer: {JSON.stringify(userAnswer)}</div>
              <div>Expected: {JSON.stringify(expected)}</div>
            </AnswerText>
          )}
        </ResultItem>
      ))}
    </ol>
    {!!err && <div>{err}</div>}
  </>
);

export const ErrorMessage = ({
  message,
  logs,
}: {
  message: string;
  logs?: string | null | undefined;
}) => (
  <>
    {!!logs && <p>{logs}</p>}
    <p>There was an error running your code:</p>
    <p>
      <i>"{message}"</i>
    </p>
  </>
);

export const CompileError = ({ output }: { output: string }) => (
  <>
    <p>Your code didn't compile:</p>
    {output ? <OutputText>{output}</OutputText> : null}
  </>
);

// A run that ended without test results, explained in plain words
export const RunProblem = ({
  title,
  detail,
  logs,
}: {
  title: string;
  detail: string;
  logs?: string | null | undefined;
}) => (
  <>
    {!!logs && <OutputText>{logs}</OutputText>}
    <p>
      <strong>{title}</strong>
    </p>
    <p>{detail}</p>
  </>
);
