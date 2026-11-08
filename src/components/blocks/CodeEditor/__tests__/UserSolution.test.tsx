/**
 * UserSolution is the code editor pane: it seeds CodeMirror, debounce-saves
 * drafts, submits code to the sandbox runner and polls for the result. CodeMirror
 * itself cannot render in jsdom, so react-codemirror2 is replaced with a textarea
 * that records the props it was handed and forwards change events.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { CodingLanguage } from 'utils/constants/lesson';

const mockEditor = {
  getValue: jest.fn(() => 'code currently in the editor'),
  refresh: jest.fn(),
};

const mockCm: { props: any; skipMount: boolean } = { props: null, skipMount: false };

jest.mock('react-codemirror2', () => {
  const ReactLib = require('react');
  return {
    __esModule: true,
    UnControlled: (props: any) => {
      mockCm.props = props;
      ReactLib.useEffect(() => {
        if (props.editorDidMount && !mockCm.skipMount) {
          props.editorDidMount(mockEditor);
        }
      }, []);
      return ReactLib.createElement('textarea', {
        'data-testid': 'codemirror',
        value: props.value,
        onChange: (event: any) => {
          if (props.onChange) {
            props.onChange(mockEditor, {}, event.target.value);
          }
        },
      });
    },
    Controlled: () => null,
  };
});

// CodeMirror mode/addon side-effect imports need the real codemirror lib, which
// touches document during import. They contribute nothing to this component.
jest.mock('../codemirrorModes', () => ({}));
jest.mock('codemirror/addon/edit/closebrackets', () => ({}));
jest.mock('codemirror/addon/edit/closetag', () => ({}));
jest.mock('codemirror/addon/edit/matchbrackets.js', () => ({}));

const mockApi = { post: jest.fn() };
jest.mock('services/client/api', () => ({ __esModule: true, default: mockApi }));

const mockCaptureException = jest.fn();
jest.mock('utils/shared/sentry', () => ({
  __esModule: true,
  default: {
    captureException: (...args: any[]) => mockCaptureException(...args),
    withScope: (cb: any) => cb({}),
  },
}));

const mockSaveCode = jest.fn();
const mockQuery: any = {
  data: undefined,
  error: undefined,
  startPolling: jest.fn(),
  stopPolling: jest.fn(),
  refetch: jest.fn(),
  lastArgs: null,
};
const mockMutationState = { loading: false };

jest.mock('types/generated/client', () => ({
  __esModule: true,
  useGetCodeSubmissionByTokenQuery: (args: any) => {
    mockQuery.lastArgs = args;
    return mockQuery;
  },
  useUpdateUserSavedCodeMutation: () => [mockSaveCode, mockMutationState],
  useUpdateUserLessonNotesMutation: () => [jest.fn(), {}],
}));

import UserSolution from '../UserSolution';
import { Results, ErrorMessage, Running, RunProblem } from '../ExecutionResults';

const defaultProps = () => ({
  userId: 'user-1',
  lessonId: 'lesson-1',
  userCode: 'function solution() {}',
  savedCode: null,
  testsCode: 'expect(solution()).toBe(1)',
  mode: 'javascript',
  tabSize: 2,
  visible: true,
  isFetchingUserLessonDetails: false,
  toggleToResults: jest.fn(),
  toggleIsOpen: jest.fn(),
  setExecutionResults: jest.fn(),
});

const renderEditor = (overrides: any = {}) => {
  const props = { ...defaultProps(), ...overrides };
  const utils = render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <UserSolution {...(props as any)} />
    </ThemeProvider>,
  );
  return { ...utils, props };
};

const runButton = () => screen.getAllByText(/Run Code|Running\.\.\./)[0].closest('button')!;

beforeEach(() => {
  jest.clearAllMocks();
  mockCm.props = null;
  mockCm.skipMount = false;
  mockQuery.data = undefined;
  mockQuery.error = undefined;
  mockMutationState.loading = false;
  mockApi.post.mockResolvedValue({ token: 'run-token-1' });
});

describe('UserSolution editor seeding', () => {
  it('seeds the editor with the lesson starting code when there is no draft', () => {
    renderEditor();

    expect(mockCm.props.value).toBe('function solution() {}');
  });

  it('prefers a trimmed saved draft over the starting code', () => {
    renderEditor({ savedCode: '  my work in progress  \n' });

    expect(mockCm.props.value).toBe('my work in progress');
  });

  it('ignores a whitespace-only draft and falls back to the starting code', () => {
    renderEditor({ savedCode: '   \n  ' });

    expect(mockCm.props.value).toBe('function solution() {}');
  });

  it('blanks the editor while the viewer lesson details are still loading', () => {
    // Otherwise the starting code flashes in and is immediately replaced by the
    // draft, which reads as the editor wiping the user's work.
    renderEditor({ isFetchingUserLessonDetails: true, savedCode: 'my draft' });

    expect(mockCm.props.value).toBe('');
  });

  it('passes the language-specific tab size and mode through to CodeMirror', () => {
    renderEditor({ tabSize: 4, mode: 'python' });

    expect(mockCm.props.options).toMatchObject({
      tabSize: 4,
      mode: 'python',
      lineNumbers: true,
      autoCloseBrackets: true,
      matchBrackets: true,
    });
  });
});

describe('UserSolution draft saving', () => {
  it('debounces edits into a single save carrying the latest value', () => {
    jest.useFakeTimers();
    renderEditor();

    fireEvent.change(screen.getByTestId('codemirror'), { target: { value: 'a' } });
    fireEvent.change(screen.getByTestId('codemirror'), { target: { value: 'ab' } });
    fireEvent.change(screen.getByTestId('codemirror'), { target: { value: 'abc' } });

    expect(mockSaveCode).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockSaveCode).toHaveBeenCalledTimes(1);
    expect(mockSaveCode).toHaveBeenCalledWith({
      variables: {
        userId: 'user-1',
        lessonId: 'lesson-1',
        language: CodingLanguage.Javascript,
        code: 'abc',
      },
    });
    jest.useRealTimers();
  });

  it('does not save when the editor content matches the untouched starting code', () => {
    jest.useFakeTimers();
    renderEditor();

    fireEvent.change(screen.getByTestId('codemirror'), {
      target: { value: 'function solution() {}' },
    });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockSaveCode).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('does not attempt to save for an anonymous viewer', () => {
    jest.useFakeTimers();
    renderEditor({ userId: '' });

    fireEvent.change(screen.getByTestId('codemirror'), { target: { value: 'anon edit' } });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockSaveCode).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});

describe('UserSolution reset', () => {
  it('restores the starting code and clears the stored draft', () => {
    renderEditor({ savedCode: 'my draft' });
    expect(mockCm.props.value).toBe('my draft');

    fireEvent.click(screen.getByLabelText('reset code'));

    expect(mockCm.props.value).toBe('function solution() {}');
    expect(mockSaveCode).toHaveBeenCalledWith({
      variables: {
        userId: 'user-1',
        lessonId: 'lesson-1',
        language: CodingLanguage.Javascript,
        code: null,
      },
    });
  });

  it('still resets locally when there is no lesson to clear the draft against', () => {
    renderEditor({ savedCode: 'my draft', lessonId: undefined });

    fireEvent.click(screen.getByLabelText('reset code'));

    expect(mockCm.props.value).toBe('function solution() {}');
    expect(mockSaveCode).not.toHaveBeenCalled();
  });
});

describe('UserSolution running code', () => {
  it('submits the live editor buffer, the tests and the language to the runner', async () => {
    const { props } = renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });

    expect(mockApi.post).toHaveBeenCalledTimes(1);
    expect(mockApi.post).toHaveBeenCalledWith('lessons/lesson-1/submissions/code', {
      payload: {
        code: 'code currently in the editor',
        tests: 'expect(solution()).toBe(1)',
        language: CodingLanguage.Javascript,
      },
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
    // the running placeholder is shown and the results tray is revealed
    expect(props.setExecutionResults).toHaveBeenCalledTimes(1);
    expect((props.setExecutionResults as jest.Mock).mock.calls[0][0].type).toBe(Running);
    expect(props.toggleToResults).toHaveBeenCalledTimes(1);
  });

  it('disables the run button and ignores repeat clicks while a run is in flight', async () => {
    renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });

    expect(runButton()).toBeDisabled();
    expect(runButton()).toHaveTextContent('Running...');

    fireEvent.click(runButton());

    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it('starts polling for the submission once the runner hands back a token', async () => {
    renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });

    expect(mockQuery.refetch).toHaveBeenCalledWith({ codeRunnerToken: 'run-token-1' });
    expect(mockQuery.startPolling).toHaveBeenCalledWith(500);
    expect(mockQuery.lastArgs).toMatchObject({
      variables: { codeRunnerToken: 'run-token-1' },
      skip: false,
    });
  });

  it('skips the submission query until there is a token to poll for', () => {
    renderEditor();

    expect(mockQuery.lastArgs).toMatchObject({ skip: true });
    expect(mockQuery.startPolling).not.toHaveBeenCalled();
  });

  it('renders the test results and stops polling when the submission completes', async () => {
    const { props, rerender } = renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });
    (props.setExecutionResults as jest.Mock).mockClear();

    mockQuery.data = {
      code_submissions: [
        {
          results: [{ passed: true, description: 'adds', expected: 1, userAnswer: 1 }],
          logs: 'console output',
          stderrDecoded: null,
        },
      ],
    };

    await act(async () => {
      rerender(
        <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
          <UserSolution {...(props as any)} />
        </ThemeProvider>,
      );
    });

    expect(mockQuery.stopPolling).toHaveBeenCalled();
    const element = (props.setExecutionResults as jest.Mock).mock.calls[0][0];
    expect(element.type).toBe(Results);
    expect(element.props).toMatchObject({ logs: 'console output', err: null });
    // the run button is released for another attempt
    expect(runButton()).not.toBeDisabled();
  });

  it('renders the runtime stderr when the submission produced no results', async () => {
    const { props, rerender } = renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });
    (props.setExecutionResults as jest.Mock).mockClear();

    mockQuery.data = {
      code_submissions: [
        { results: null, logs: null, stderrDecoded: 'SyntaxError: unexpected token' },
      ],
    };

    await act(async () => {
      rerender(
        <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
          <UserSolution {...(props as any)} />
        </ThemeProvider>,
      );
    });

    const element = (props.setExecutionResults as jest.Mock).mock.calls[0][0];
    expect(element.type).toBe(ErrorMessage);
    expect(element.props.message).toBe('SyntaxError: unexpected token');
  });

  it('explains a run that finished with no results, and reports it to Sentry', async () => {
    const { props, rerender } = renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });
    (props.setExecutionResults as jest.Mock).mockClear();

    mockQuery.data = {
      code_submissions: [{ results: null, logs: null, stderrDecoded: null, codeRunnerStatusId: 3 }],
    };

    await act(async () => {
      rerender(
        <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
          <UserSolution {...(props as any)} />
        </ThemeProvider>,
      );
    });

    expect(mockCaptureException).toHaveBeenCalled();
    const element = (props.setExecutionResults as jest.Mock).mock.calls[0][0];
    expect(element.type).toBe(RunProblem);
    expect(element.props.title).toBe('No test results');
    expect(mockQuery.stopPolling).toHaveBeenCalled();
    expect(runButton()).not.toBeDisabled();
  });

  it('surfaces a polling failure as an error message and re-enables the button', async () => {
    const { props, rerender } = renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });
    (props.setExecutionResults as jest.Mock).mockClear();

    mockQuery.error = { message: 'Network error' };

    await act(async () => {
      rerender(
        <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
          <UserSolution {...(props as any)} />
        </ThemeProvider>,
      );
    });

    const element = (props.setExecutionResults as jest.Mock).mock.calls[0][0];
    expect(element.type).toBe(ErrorMessage);
    expect(element.props.message).toBe('Network error');
    expect(runButton()).not.toBeDisabled();
  });

  it("explains a rejected submission with the server's message and frees the run button", async () => {
    mockApi.post.mockRejectedValue({
      message: 'There was an error submitting your code',
      statusCode: 500,
    });
    const { props } = renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });

    expect(mockCaptureException).toHaveBeenCalled();
    const element = (props.setExecutionResults as jest.Mock).mock.calls[1][0];
    expect(element.type).toBe(RunProblem);
    expect(element.props).toMatchObject({
      title: "Your code wasn't submitted",
      detail: 'There was an error submitting your code. Please try again.',
    });
    expect(runButton()).not.toBeDisabled();
    expect(runButton()).toHaveTextContent('Run Code');
  });

  it('says when the learner can run code again after running it a lot', async () => {
    mockApi.post.mockRejectedValue({
      statusCode: 429,
      message: "You've run code 30 times in the last 10 minutes. You can run it again in 3 minutes",
    });
    const { props } = renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });

    const element = (props.setExecutionResults as jest.Mock).mock.calls.slice(-1)[0][0];
    expect(element.type).toBe(RunProblem);
    expect(element.props).toEqual({
      title: 'Taking a short break',
      detail: "You've run code 30 times in the last 10 minutes. You can run it again in 3 minutes.",
    });
    // Not an error to report
    expect(mockCaptureException).not.toHaveBeenCalled();
    expect(runButton()).not.toBeDisabled();
  });

  it('blames the connection, not the code, when the request itself fails', async () => {
    mockApi.post.mockRejectedValue(new TypeError('Failed to fetch'));
    const { props } = renderEditor();

    await act(async () => {
      fireEvent.click(runButton());
    });

    const element = (props.setExecutionResults as jest.Mock).mock.calls[1][0];
    expect(element.props.detail).toBe('Check your connection. Please try again.');
    expect(runButton()).not.toBeDisabled();
  });

  describe('when no result arrives', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('gives up after 45 seconds, stops polling and frees the run button', async () => {
      const { props } = renderEditor();

      await act(async () => {
        fireEvent.click(runButton());
      });
      (props.setExecutionResults as jest.Mock).mockClear();

      act(() => {
        jest.advanceTimersByTime(44999);
      });
      expect(props.setExecutionResults).not.toHaveBeenCalled();
      expect(runButton()).toBeDisabled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      const element = (props.setExecutionResults as jest.Mock).mock.calls[0][0];
      expect(element.type).toBe(RunProblem);
      expect(element.props.title).toBe('No response from the code runner');
      expect(mockQuery.stopPolling).toHaveBeenCalled();
      expect(runButton()).not.toBeDisabled();
    });

    it('does not fire the timeout once the result has arrived', async () => {
      const { props, rerender } = renderEditor();

      await act(async () => {
        fireEvent.click(runButton());
      });

      mockQuery.data = {
        code_submissions: [
          {
            results: [{ passed: true, description: 'adds', expected: 1, userAnswer: 1 }],
            logs: null,
          },
        ],
      };

      await act(async () => {
        rerender(
          <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
            <UserSolution {...(props as any)} />
          </ThemeProvider>,
        );
      });
      (props.setExecutionResults as jest.Mock).mockClear();

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(props.setExecutionResults).not.toHaveBeenCalled();
    });

    describe('from Judge0', () => {
      const env = process.env.CODE_RUNNER;

      beforeEach(() => {
        process.env.CODE_RUNNER = 'judge0';
      });

      afterEach(() => {
        process.env.CODE_RUNNER = env;
      });

      const refreshCalls = () =>
        mockApi.post.mock.calls.filter(([endpoint]) => endpoint === 'judge0/refresh/run-token-1');

      it('asks the server to fetch the result at 10 and 25 seconds, in case the callback was lost', async () => {
        renderEditor();

        await act(async () => {
          fireEvent.click(runButton());
        });

        act(() => {
          jest.advanceTimersByTime(9999);
        });
        expect(refreshCalls()).toHaveLength(0);

        act(() => {
          jest.advanceTimersByTime(1);
        });
        expect(refreshCalls()).toHaveLength(1);

        act(() => {
          jest.advanceTimersByTime(15000);
        });
        expect(refreshCalls()).toHaveLength(2);
      });

      it('stops asking once the result has arrived', async () => {
        const { props, rerender } = renderEditor();

        await act(async () => {
          fireEvent.click(runButton());
        });

        mockQuery.data = {
          code_submissions: [{ results: [{ passed: true, description: 'adds' }], logs: null }],
        };

        await act(async () => {
          rerender(
            <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
              <UserSolution {...(props as any)} />
            </ThemeProvider>,
          );
        });

        act(() => {
          jest.advanceTimersByTime(60000);
        });

        expect(refreshCalls()).toHaveLength(0);
      });
    });

    it('never asks when code runs in Docker, which saves the result before answering', async () => {
      const env = process.env.CODE_RUNNER;
      process.env.CODE_RUNNER = 'docker';

      try {
        renderEditor();

        await act(async () => {
          fireEvent.click(runButton());
        });
        act(() => {
          jest.advanceTimersByTime(60000);
        });

        expect(mockApi.post).toHaveBeenCalledTimes(1);
      } finally {
        process.env.CODE_RUNNER = env;
      }
    });
  });

  it("explains a language the lesson isn't available in, and won't run it", async () => {
    renderEditor({ unavailable: true });

    expect(screen.getByRole('status')).toHaveTextContent(
      "This lesson isn't available in JavaScript yet. Choose another language to run your code.",
    );
    expect(runButton()).toBeDisabled();

    await act(async () => {
      fireEvent.click(runButton());
    });

    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('warns the viewer instead of submitting when the editor never mounted', () => {
    mockCm.skipMount = true;
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    renderEditor();

    fireEvent.click(runButton());

    expect(mockApi.post).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('issue loading the code runner'));
    expect(mockCaptureException).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

describe('UserSolution chrome', () => {
  it('renders the language switcher and full-screen toggle in the inline layout', () => {
    renderEditor();

    expect(screen.getByLabelText('full screen code')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('drops the language switcher and full-screen toggle in full-screen layout', () => {
    renderEditor({ fullScreen: true });

    expect(screen.queryByLabelText('full screen code')).not.toBeInTheDocument();
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    // run + reset are still reachable from the top bar
    expect(screen.getByText('Run Code')).toBeInTheDocument();
    expect(screen.getByLabelText('reset code')).toBeInTheDocument();
  });

  it('opens the full screen editor from the maximize button', () => {
    const { props } = renderEditor();

    fireEvent.click(screen.getByLabelText('full screen code'));

    expect(props.toggleIsOpen).toHaveBeenCalledTimes(1);
  });

  it('refreshes CodeMirror when the tab becomes visible so the gutter lays out', () => {
    const { props, rerender } = renderEditor({ visible: false });
    expect(mockEditor.refresh).not.toHaveBeenCalled();

    rerender(
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <UserSolution {...({ ...props, visible: true } as any)} />
      </ThemeProvider>,
    );

    expect(mockEditor.refresh).toHaveBeenCalled();
  });
});
