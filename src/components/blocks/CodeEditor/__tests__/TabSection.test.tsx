/**
 * TabSection decides which lesson panel is mounted. The important detail is that
 * the code editor is never unmounted - it is hidden with a `visible` prop so the
 * viewer's in-progress code survives a trip to the Solution or Tests tab.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';

const mockUserSolutionProps: any[] = [];
const mockCodeMirrorProps: any[] = [];
const mockUserNotesProps: any[] = [];

const stub = (sink: any[], testId: string) => {
  const ReactLib = require('react');
  return {
    __esModule: true,
    default: (props: any) => {
      sink.push(props);
      return ReactLib.createElement('div', { 'data-testid': testId });
    },
  };
};

jest.mock('../UserSolution', () => stub(mockUserSolutionProps, 'user-solution'));
jest.mock('../CodeMirrorWrapper', () => stub(mockCodeMirrorProps, 'code-mirror'));
jest.mock('../UserNotes', () => stub(mockUserNotesProps, 'user-notes'));

import TabSection from '../TabSection';
import { Tabs } from '../CodeEditor';

const ValidationOne = () => <span>check the edge cases</span>;
const ValidationTwo = () => <span>check the complexity</span>;

const baseProps = () => ({
  userId: 'user-1',
  lessonId: 'lesson-1',
  video: <div data-testid="video">the video</div>,
  savedCode: 'saved code',
  savedNotes: 'saved notes',
  QuestionStatement: () => null,
  validationItems: [ValidationOne, ValidationTwo],
  testsCode: 'the tests',
  handleTestsChange: jest.fn(),
  solutionCode: 'the solution',
  mode: 'javascript',
  activeTab: Tabs.UserSolution,
  setActiveTab: jest.fn(),
  toggleIsOpen: jest.fn(),
  executionResults: <div />,
  userCode: 'the starter code',
  tabSize: 2,
  toggleToResults: jest.fn(),
  setExecutionResults: jest.fn(),
  isFetchingUserLessonDetails: false,
});

const renderTabs = async (overrides: any = {}) => {
  const props = { ...baseProps(), ...overrides };
  let utils: any;
  await act(async () => {
    utils = render(
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <TabSection {...(props as any)} />
      </ThemeProvider>,
    );
  });
  return { ...utils, props };
};

const lastOf = (sink: any[]) => sink[sink.length - 1];

beforeEach(() => {
  mockUserSolutionProps.length = 0;
  mockCodeMirrorProps.length = 0;
  mockUserNotesProps.length = 0;
});

describe('TabSection', () => {
  it('renders every lesson tab', async () => {
    await renderTabs();

    ['Code', 'Video', 'Validate', 'Solution', 'Tests', 'Notes'].forEach((tab) => {
      expect(screen.getByRole('button', { name: tab })).toBeInTheDocument();
    });
  });

  it('reports the clicked tab back to the parent', async () => {
    const { props } = await renderTabs();

    fireEvent.click(screen.getByRole('button', { name: 'Solution' }));

    expect(props.setActiveTab).toHaveBeenCalledWith(Tabs.Solution);
  });

  it('keeps the code editor mounted but hidden on other tabs', async () => {
    // Unmounting it would throw away whatever the viewer had typed.
    await renderTabs({ activeTab: Tabs.Solution });

    expect(screen.getByTestId('user-solution')).toBeInTheDocument();
    expect(lastOf(mockUserSolutionProps).visible).toBe(false);
  });

  it('marks the code editor visible on the code tab', async () => {
    await renderTabs({ activeTab: Tabs.UserSolution });

    expect(lastOf(mockUserSolutionProps).visible).toBe(true);
  });

  it('gives the code editor the lesson identity and editor config', async () => {
    await renderTabs();

    expect(lastOf(mockUserSolutionProps)).toMatchObject({
      userId: 'user-1',
      lessonId: 'lesson-1',
      mode: 'javascript',
      tabSize: 2,
      userCode: 'the starter code',
      savedCode: 'saved code',
      testsCode: 'the tests',
      isFetchingUserLessonDetails: false,
    });
  });

  it('keeps the video mounted on every tab so playback position is not lost', async () => {
    await renderTabs({ activeTab: Tabs.Tests });

    expect(screen.getByTestId('video')).toBeInTheDocument();
  });

  it('lists the validation steps only on the validate tab', async () => {
    await renderTabs({ activeTab: Tabs.UserSolution });
    expect(screen.queryByText('check the edge cases')).not.toBeInTheDocument();

    await renderTabs({ activeTab: Tabs.Validate });
    expect(screen.getByText('check the edge cases')).toBeInTheDocument();
    expect(screen.getByText('check the complexity')).toBeInTheDocument();
  });

  it('shows the solution read-only, with no change handler wired up', async () => {
    await renderTabs({ activeTab: Tabs.Solution });

    expect(lastOf(mockCodeMirrorProps)).toMatchObject({
      value: 'the solution',
      mode: 'javascript',
    });
    expect(lastOf(mockCodeMirrorProps).onChange).toBeUndefined();
  });

  it('lets the viewer edit the tests and reports the edits upward', async () => {
    const { props } = await renderTabs({ activeTab: Tabs.Tests });

    expect(lastOf(mockCodeMirrorProps)).toMatchObject({ value: 'the tests' });
    expect(lastOf(mockCodeMirrorProps).onChange).toBe(props.handleTestsChange);
  });

  it("shows the server's tests in place of the test code when the lesson has them", async () => {
    await renderTabs({ activeTab: Tabs.Tests, testsView: <div>the server tests</div> });

    expect(screen.getByText('the server tests')).toBeInTheDocument();
    expect(screen.queryByTestId('code-mirror')).not.toBeInTheDocument();
  });

  it('hands the notes editor the saved notes and lesson identity', async () => {
    await renderTabs({ activeTab: Tabs.Notes });

    expect(lastOf(mockUserNotesProps)).toMatchObject({
      userId: 'user-1',
      lessonId: 'lesson-1',
      savedNotes: 'saved notes',
    });
  });
});
