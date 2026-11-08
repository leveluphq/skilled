import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { CodingLanguage } from 'utils/constants/lesson';
import {
  useGetViewerLazyQuery,
  useUpdatePreferredCodingLanguageMutation,
} from 'types/generated/client';
import useStaticViewerToken from 'components/hooks/useStaticViewerToken';
import CodingLanguageProvider from '../CodingLanguageProvider';
import CodingLanguageContext, { LANGUAGE_KEY } from '../CodingLanguageContext';
import { LANGUAGE_CHOICE_KEY, rememberLanguage } from 'utils/client/programmingLanguagePreference';

jest.mock('types/generated/client', () => ({
  useGetViewerLazyQuery: jest.fn(),
  useUpdatePreferredCodingLanguageMutation: jest.fn(),
}));

jest.mock('components/hooks/useStaticViewerToken', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockUseGetViewerLazyQuery = useGetViewerLazyQuery as unknown as jest.Mock;
const mockUseUpdateMutation = useUpdatePreferredCodingLanguageMutation as unknown as jest.Mock;
const mockUseStaticViewerToken = useStaticViewerToken as unknown as jest.Mock;

const getViewer = jest.fn();
const updatePreferredLanguage = jest.fn();

const setViewer = (token: string, data?: any) => {
  mockUseStaticViewerToken.mockReturnValue(token);
  mockUseGetViewerLazyQuery.mockReturnValue([getViewer, { data }]);
};

const Consumer: React.FC = () => {
  const { language, setLanguage } = React.useContext(CodingLanguageContext);

  return (
    <div>
      <span data-testid="language">{language}</span>
      <button onClick={() => setLanguage(CodingLanguage.Python)}>python</button>
    </div>
  );
};

const renderProvider = () =>
  render(
    <CodingLanguageProvider>
      <Consumer />
    </CodingLanguageProvider>,
  );

describe('CodingLanguageProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockUseUpdateMutation.mockReturnValue([updatePreferredLanguage, {}]);
    setViewer('', undefined);
  });

  it('starts on the JavaScript default for a first-time visitor', () => {
    renderProvider();

    expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Javascript);
  });

  it('restores a language saved after module load when the course mounts', () => {
    window.localStorage.setItem(LANGUAGE_KEY, JSON.stringify(CodingLanguage.Python));

    renderProvider();

    expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Python);
  });

  it('fetches the viewer once a viewer token is available', () => {
    setViewer('viewer-123');

    renderProvider();

    expect(getViewer).toHaveBeenCalledWith({ variables: { id: 'viewer-123' } });
  });

  it('does not fetch the viewer for an anonymous visitor', () => {
    renderProvider();

    expect(getViewer).not.toHaveBeenCalled();
  });

  it('adopts the language stored on the server profile over the local default', () => {
    setViewer('viewer-123', {
      users_by_pk: { id: 'viewer-123', preferredCodingLanguage: CodingLanguage.Python },
    });

    renderProvider();

    expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Python);
  });

  it('persists a language change to the server and to localStorage for a signed-in viewer', () => {
    setViewer('viewer-123', {
      users_by_pk: { id: 'viewer-123', preferredCodingLanguage: CodingLanguage.Javascript },
    });

    renderProvider();
    updatePreferredLanguage.mockClear();

    act(() => {
      screen.getByText('python').click();
    });

    expect(updatePreferredLanguage).toHaveBeenCalledWith({
      variables: { id: 'viewer-123', preferredCodingLanguage: CodingLanguage.Python },
    });
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe(JSON.stringify(CodingLanguage.Python));
  });

  it('never sends a mutation for an anonymous visitor, even when they pick a language', () => {
    renderProvider();

    act(() => {
      screen.getByText('python').click();
    });

    expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Python);
    expect(updatePreferredLanguage).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe(JSON.stringify(CodingLanguage.Python));
    expect(window.sessionStorage.getItem(LANGUAGE_CHOICE_KEY)).toBe(
      JSON.stringify(CodingLanguage.Python),
    );
  });

  it('persists a language change made before the viewer query resolves', async () => {
    setViewer('viewer-123', undefined); // query still in flight

    renderProvider();

    act(() => {
      screen.getByText('python').click();
    });

    expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Python);
    expect(updatePreferredLanguage).toHaveBeenCalledWith({
      variables: { id: 'viewer-123', preferredCodingLanguage: CodingLanguage.Python },
    });
  });

  it('keeps an explicit walkthrough choice when a stale account profile arrives', () => {
    rememberLanguage(CodingLanguage.Python);
    setViewer('viewer-123');
    const { rerender } = renderProvider();
    expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Python);
    setViewer('viewer-123', {
      users_by_pk: { id: 'viewer-123', preferredCodingLanguage: CodingLanguage.Java },
    });
    rerender(
      <CodingLanguageProvider>
        <Consumer />
      </CodingLanguageProvider>,
    );
    expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Python);
    expect(updatePreferredLanguage).toHaveBeenCalledWith({
      variables: { id: 'viewer-123', preferredCodingLanguage: CodingLanguage.Python },
    });
  });

  it('keeps an editor selection when a stale account profile arrives', () => {
    setViewer('viewer-123');
    const { rerender } = renderProvider();
    act(() => {
      screen.getByText('python').click();
    });
    setViewer('viewer-123', {
      users_by_pk: { id: 'viewer-123', preferredCodingLanguage: CodingLanguage.Java },
    });
    rerender(
      <CodingLanguageProvider>
        <Consumer />
      </CodingLanguageProvider>,
    );
    expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Python);
  });

  it('ignores malformed and unsupported stored languages', () => {
    window.localStorage.setItem(LANGUAGE_KEY, '{broken');
    window.sessionStorage.setItem(LANGUAGE_CHOICE_KEY, '"UNKNOWN"');
    renderProvider();
    expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Javascript);
  });

  it('still changes language when browser storage is blocked', () => {
    const read = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const write = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    try {
      renderProvider();
      act(() => {
        screen.getByText('python').click();
      });
      expect(screen.getByTestId('language')).toHaveTextContent(CodingLanguage.Python);
    } finally {
      read.mockRestore();
      write.mockRestore();
    }
  });
});
