import * as React from 'react';
import { Restart24, Maximize20 } from '@carbon/icons-react';

import { UnControlled as CodeMirror } from 'react-codemirror2';
// Supported languages
import './codemirrorModes';

// Addons
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets.js';

import { Editor } from 'codemirror';
import { useDebouncedCallback } from 'use-debounce';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import { unavailableMessage } from 'utils/shared/runner/settings';
import {
  useUpdateUserSavedCodeMutation,
  useGetCodeSubmissionByTokenQuery,
} from 'types/generated/client';
import Sentry from 'utils/shared/sentry';
import api from 'services/client/api';
import { learningEvent } from 'utils/client/learningEvents';
import LanguageSelect from 'components/blocks/LanguageSelect';
import { Running, ErrorMessage, RunProblem } from './ExecutionResults';
import getSubmissionOutcome from './submissionOutcome';

import {
  UserCodeSection,
  RunButton,
  TopBar,
  BottomBar,
  FlexItems,
  SavingText,
  ResetText,
  SvgButton,
  SectionHeader,
  LanguageSelectWrapper,
  UnavailableNotice,
} from './styles';

// NOTE: current turning this "off" for videos
const SAVING_TEXT = ' ';
const POLL_INTERNAL = 500;
// Give up on a run whose result hasn't arrived by then, rather than leave the
// learner watching the loader. Judge0 allows each run 5 seconds of CPU time.
const RESULT_TIMEOUT_MS = 45000;
// Judge0 tries a callback only three times. If the result hasn't arrived by
// these times, ask the server to fetch it from Judge0 instead.
const REFRESH_AFTER_MS = [10000, 25000];

interface Props {
  fullScreen?: boolean;
  userId: string;
  lessonId?: string;
  savedCode?: string | null;
  userCode: string;
  testsCode: string;
  mode: string;
  tabSize: number;
  toggleToResults: () => void;
  toggleIsOpen: () => void;
  setExecutionResults: (ExecutionComponent: JSX.Element) => void;
  visible: boolean;
  isFetchingUserLessonDetails: boolean;
  // The lesson has no code in the selected language yet
  unavailable?: boolean;
}

enum ExecutionStatus {
  Running = 'RUNNING',
  Idle = 'IDLE',
}

// TODO: need to break code up so I can different sections
const UserSolution: React.FC<Props> = ({
  fullScreen,
  userId,
  lessonId,
  userCode,
  savedCode,
  testsCode,
  mode,
  tabSize,
  toggleToResults,
  setExecutionResults,
  visible,
  toggleIsOpen,
  isFetchingUserLessonDetails,
  unavailable,
}) => {
  // NOTE: Setting this as the default value so it doesn't change from props on save
  const [code, setCode] = React.useState('');
  const [codeRunnerToken, setCodeRunnerToken] = React.useState('');
  const { language } = useCodingLanguage();

  React.useEffect(() => {
    if (isFetchingUserLessonDetails) {
      setCode('');
      return;
    }

    const defaultCode = savedCode && savedCode.trim() ? savedCode.trim() : userCode;
    setCode(defaultCode);
  }, [isFetchingUserLessonDetails, userCode]);

  const [executionStatus, setExecutionStatus] = React.useState(ExecutionStatus.Idle);
  const isRunning = executionStatus === ExecutionStatus.Running;
  const editor = React.useRef<Editor | null>(null);
  const { data, error, startPolling, stopPolling, refetch } = useGetCodeSubmissionByTokenQuery({
    variables: {
      codeRunnerToken,
    },
    skip: !codeRunnerToken,
  });

  React.useEffect(() => {
    if (codeRunnerToken) {
      refetch({ codeRunnerToken });
      startPolling(POLL_INTERNAL);
    }
  }, [codeRunnerToken]);

  const resultTimeout = React.useRef<number>();
  const refreshTimeouts = React.useRef<number[]>([]);
  const clearTimers = () => {
    window.clearTimeout(resultTimeout.current);
    refreshTimeouts.current.forEach((timeout) => window.clearTimeout(timeout));
    refreshTimeouts.current = [];
  };

  // Puts the cursor on a line a compile error points at
  const selectLine = (line: number, column: number | null) => {
    if (editor.current) {
      editor.current.focus();
      editor.current.setCursor({ line: line - 1, ch: column ? column - 1 : 0 });
    }
  };

  const finishRun = (element: JSX.Element) => {
    clearTimers();
    stopPolling();
    setExecutionResults(element);
    setExecutionStatus(ExecutionStatus.Idle);
    setCodeRunnerToken('');
  };
  // Timers and request callbacks outlive the render that created them
  const finishRunRef = React.useRef(finishRun);
  finishRunRef.current = finishRun;

  React.useEffect(() => () => clearTimers(), []);

  React.useEffect(() => {
    if (isRunning && data && data?.code_submissions[0]) {
      const { element, isUnexpected } = getSubmissionOutcome(data.code_submissions[0], {
        onSelectLine: selectLine,
      });

      if (isUnexpected) {
        Sentry.withScope((_scope) => {
          Sentry.captureException(new Error('*** No results or error from code runner ***'));
        });
      }

      finishRun(element);
    }
  }, [data, isRunning]);

  React.useEffect(() => {
    if (isRunning && error) {
      finishRun(<ErrorMessage message={error.message} />);
    }
  }, [error, isRunning]);

  const runCode = () => {
    if (isRunning || unavailable) {
      return;
    }

    if (!editor.current) {
      Sentry.withScope((_scope) => {
        Sentry.captureException(new Error('Could not run code'));
      });

      alert(
        'Error: There was an issue loading the code runner. We have been alerted and will fix the issue shortly.',
      );
      return;
    }

    setExecutionStatus(ExecutionStatus.Running);
    setExecutionResults(<Running />);
    toggleToResults();

    clearTimers();
    resultTimeout.current = window.setTimeout(() => {
      finishRunRef.current(
        <RunProblem
          title="No response from the code runner"
          detail="Your results didn't arrive within 45 seconds. Please run your code again."
        />,
      );
    }, RESULT_TIMEOUT_MS);

    const input = editor.current.getValue();
    learningEvent('code_run_requested', window.location.pathname);

    api
      .post(`lessons/${lessonId}/submissions/code`, {
        payload: { code: input, tests: testsCode, language },
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      })
      .then((result) => {
        setCodeRunnerToken(result.token);

        // With Docker the result is already saved
        if (process.env.CODE_RUNNER === 'judge0' && result.token) {
          refreshTimeouts.current = REFRESH_AFTER_MS.map((delay) =>
            window.setTimeout(() => {
              // Polling picks up whatever it records; a failure leaves the 45 s give-up
              api
                .post(`judge0/refresh/${encodeURIComponent(result.token)}`, {})
                .catch(() => undefined);
            }, delay),
          );
        }
      })
      .catch((error) => {
        // Running code too often: the message says when to try again
        if (error?.statusCode === 429 && typeof error.message === 'string') {
          finishRunRef.current(
            <RunProblem title="Taking a short break" detail={`${error.message}.`} />,
          );
          return;
        }

        Sentry.withScope((_scope) => {
          Sentry.captureException(new Error(error?.message || error));
        });

        // The API answers with { message, statusCode }; anything else is a network failure
        const reason =
          error?.statusCode && typeof error.message === 'string'
            ? `${error.message}.`
            : 'Check your connection.';

        finishRunRef.current(
          <RunProblem title="Your code wasn't submitted" detail={`${reason} Please try again.`} />,
        );
      });
  };

  const [updateUserSavedCode, { loading }] = useUpdateUserSavedCodeMutation();
  const saveCallback = React.useCallback(
    (newCodeValue: string) => {
      if (userId && lessonId && language) {
        updateUserSavedCode({
          variables: {
            userId,
            lessonId,
            language,
            code: newCodeValue,
          },
        });
      }
    },
    [userId, lessonId, language],
  );
  const [updateCode] = useDebouncedCallback(saveCallback, 1000);

  React.useEffect(() => {
    if (visible && editor && editor.current) {
      editor.current.refresh();
    }
  }, [visible]);

  return (
    <UserCodeSection visible={visible} fullScreen={fullScreen}>
      {fullScreen && (
        <SectionHeader fullScreen>
          <TopBar>
            <FlexItems>
              <RunButton disabled={isRunning || unavailable} onClick={runCode}>
                {isRunning ? 'Running...' : 'Run Code'}
              </RunButton>
              {loading && <SavingText>{SAVING_TEXT}</SavingText>}
            </FlexItems>
            <FlexItems>
              <SvgButton
                aria-label="reset code"
                onClick={() => {
                  setCode(userCode);
                  if (userId && lessonId && language) {
                    updateUserSavedCode({
                      variables: {
                        userId,
                        lessonId,
                        language,
                        code: null,
                      },
                    });
                  }
                }}
              >
                <ResetText>Reset to Starting Code</ResetText> <Restart24 />
              </SvgButton>
            </FlexItems>
          </TopBar>
        </SectionHeader>
      )}
      {unavailable && (
        <UnavailableNotice role="status">
          {unavailableMessage(language)} Choose another language to run your code.
        </UnavailableNotice>
      )}
      <CodeMirror
        autoCursor={false}
        autoScroll={false}
        editorDidMount={(instance) => {
          editor.current = instance;
        }}
        onChange={(_editor, _data, value) => {
          if (value !== userCode) {
            updateCode(value);
          }
          setCode(value);
        }}
        value={code}
        options={{
          tabSize,
          mode,
          theme: 'material',
          lineNumbers: true,
          smartIndent: true,
          autoCloseTags: true,
          autoCloseBrackets: true,
          matchBrackets: true,
        }}
      />
      {!fullScreen && (
        <BottomBar>
          <FlexItems>
            <RunButton disabled={isRunning || unavailable} onClick={runCode}>
              {isRunning ? 'Running...' : 'Run Code'}
            </RunButton>
            <LanguageSelectWrapper>
              <LanguageSelect up left />
            </LanguageSelectWrapper>
            {loading && <SavingText>{SAVING_TEXT}</SavingText>}
          </FlexItems>
          <FlexItems>
            <SvgButton
              aria-label="reset code"
              onClick={() => {
                setCode(userCode);
                if (userId && lessonId && language) {
                  updateUserSavedCode({
                    variables: {
                      userId,
                      lessonId,
                      language,
                      code: null,
                    },
                  });
                }
              }}
            >
              <ResetText>Reset to Starting Code</ResetText> <Restart24 />
            </SvgButton>
            <SvgButton aria-label="full screen code" onClick={toggleIsOpen}>
              <Maximize20 />
            </SvgButton>
          </FlexItems>
        </BottomBar>
      )}
    </UserCodeSection>
  );
};

export default UserSolution;
