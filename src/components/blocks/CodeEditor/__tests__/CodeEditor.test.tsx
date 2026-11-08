/**
 * CodeEditor is the orchestrator around the lesson workspace. Its real work is
 * scraping the starter code / tests / solution out of hidden MDX nodes, deriving
 * the editor config from the viewer's coding language, and owning the results
 * tray. TabSection is stubbed so those wiring decisions can be inspected.
 */
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { CodingLanguage } from 'utils/constants/lesson';
import CodingLanguageContext from 'components/context/CodingLanguage/CodingLanguageContext';

const mockTabSectionProps: any[] = [];

jest.mock('../TabSection', () => {
  const ReactLib = require('react');
  return {
    __esModule: true,
    default: (props: any) => {
      mockTabSectionProps.push(props);
      return ReactLib.createElement('div', { 'data-testid': 'tab-section' });
    },
  };
});

import CodeEditor from '../CodeEditor';
import { Initial } from '../ExecutionResults';

// jsdom has no layout engine and therefore no innerText. CodeEditor reads the
// hidden MDX snippets through it, so approximate it with textContent.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    configurable: true,
    get() {
      return this.textContent;
    },
  });
});

const lastProps = () => mockTabSectionProps[mockTabSectionProps.length - 1];

const snippet = (text: string) => () => text as any;

const defaultProps = () => ({
  userId: 'user-1',
  lessonId: 'lesson-1',
  video: <div data-testid="video" />,
  QuestionStatement: () => null,
  validationItems: [],
  toggleIsOpen: jest.fn(),
  getUserAnswer: jest.fn(snippet('const answer = 1;')),
  getTests: jest.fn(snippet('test("works", () => {})')),
  getSolutionCode: jest.fn(snippet('const solution = 1;')),
  isFetchingUserLessonDetails: false,
});

const renderEditor = (overrides: any = {}, language = CodingLanguage.Javascript) => {
  const props = { ...defaultProps(), ...overrides };
  const ui = (
    <CodingLanguageContext.Provider value={{ language, setLanguage: jest.fn() }}>
      <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
        <CodeEditor {...(props as any)} />
      </ThemeProvider>
    </CodingLanguageContext.Provider>
  );
  const utils = render(ui);
  // CodeEditor defers a state bump by 1ms so the refs into the hidden MDX nodes
  // are populated before it reads them.
  act(() => {
    jest.advanceTimersByTime(5);
  });
  return { ...utils, props };
};

beforeEach(() => {
  mockTabSectionProps.length = 0;
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('CodeEditor', () => {
  it('hands the scraped starter code, tests and solution to the tab section', () => {
    renderEditor();

    expect(lastProps()).toMatchObject({
      userCode: 'const answer = 1;',
      testsCode: 'test("works", () => {})',
      solutionCode: 'const solution = 1;',
    });
  });

  it('derives the editor mode and tab size from the viewer coding language', () => {
    renderEditor({}, CodingLanguage.Python);

    expect(lastProps()).toMatchObject({ mode: 'python', tabSize: 4 });
  });

  it('uses the javascript mode for typescript because codemirror has no ts mode', () => {
    renderEditor({}, CodingLanguage.Typescript);

    expect(lastProps()).toMatchObject({ mode: 'javascript', tabSize: 2 });
  });

  it('requests the snippets for the viewer coding language', () => {
    const { props } = renderEditor({}, CodingLanguage.Python);

    expect(props.getUserAnswer).toHaveBeenCalledWith(CodingLanguage.Python);
    expect(props.getTests).toHaveBeenCalledWith(CodingLanguage.Python);
    expect(props.getSolutionCode).toHaveBeenCalledWith(CodingLanguage.Python);
  });

  it('forwards the saved draft and notes off the viewer lesson records', () => {
    renderEditor({
      draft: { code: 'draft code' },
      status: { notes: 'my notes' },
    });

    expect(lastProps()).toMatchObject({ savedCode: 'draft code', savedNotes: 'my notes' });
  });

  it('leaves the draft and notes undefined when the viewer has no records yet', () => {
    renderEditor();

    expect(lastProps().savedCode).toBeUndefined();
    expect(lastProps().savedNotes).toBeUndefined();
  });

  it('starts on the code tab with the placeholder results', () => {
    renderEditor();

    expect(lastProps().activeTab).toBe('Code');
    expect(lastProps().executionResults.type).toBe(Initial);
    expect(screen.getByText('Run your code and see results here...')).toBeInTheDocument();
  });

  it('lets the tests editor override the scraped tests before a run', () => {
    renderEditor();
    expect(lastProps().testsCode).toBe('test("works", () => {})');

    act(() => {
      lastProps().handleTestsChange(null, null, 'test("edited", () => {})');
    });

    expect(lastProps().testsCode).toBe('test("edited", () => {})');
  });

  it('keeps the results tray closed until a run asks for it, then lets it be dismissed', () => {
    renderEditor();

    // The tray is always mounted - `isOpen` only drives opacity/transform - so
    // asserting it is in the document proves nothing about it being closed.
    const tray = screen.getByLabelText('close your solution results').parentElement!;
    expect(tray).not.toBeVisible();

    act(() => {
      lastProps().toggleToResults();
    });

    expect(tray).toBeVisible();
    expect(screen.getByText('Test Results')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('close your solution results'));

    expect(tray).not.toBeVisible();
  });

  it('renders whatever execution result the editor reports into the tray', () => {
    renderEditor();

    act(() => {
      lastProps().setExecutionResults(<div>3 of 3 tests passed</div>);
    });

    expect(screen.getByText('3 of 3 tests passed')).toBeInTheDocument();
  });
});
