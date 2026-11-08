import * as React from 'react';
import { CodingLanguage } from 'utils/constants/lesson';
import useStaticViewerToken from 'components/hooks/useStaticViewerToken';
import { useGetViewerLazyQuery } from 'types/generated/client';
import { useUpdatePreferredCodingLanguageMutation } from 'types/generated/client';
import {
  LANGUAGE_KEY,
  LANGUAGE_CHOICE_KEY,
  isCodingLanguage,
  readLanguage,
  rememberLanguage,
} from 'utils/client/programmingLanguagePreference';
import CodingLanguageContext from './CodingLanguageContext';

const CodingLanguageProvider: React.FC = ({ children }) => {
  // The first render matches static HTML. Restore browser choices after hydration.
  const [language, setLanguageState] = React.useState(CodingLanguage.Javascript);
  const [choice, setChoice] = React.useState<CodingLanguage | null>(null);
  const hasExplicitChoice = React.useRef(false);
  const viewerToken = useStaticViewerToken();
  const [getViewer, { data }] = useGetViewerLazyQuery();
  const [updatePreferredLanguage] = useUpdatePreferredCodingLanguageMutation();
  const storedLanguage = data?.users_by_pk?.preferredCodingLanguage;
  const setLanguage = React.useCallback((next: CodingLanguage) => {
    if (!isCodingLanguage(next)) return;
    hasExplicitChoice.current = true;
    rememberLanguage(next);
    setLanguageState(next);
    setChoice(next);
  }, []);

  React.useEffect(() => {
    const explicit = readLanguage('sessionStorage', LANGUAGE_CHOICE_KEY);
    const saved = explicit || readLanguage('localStorage', LANGUAGE_KEY);
    if (explicit) hasExplicitChoice.current = true;
    if (saved) setLanguageState(saved);
    if (explicit) setChoice(explicit);
  }, []);

  React.useEffect(() => {
    if (viewerToken) {
      getViewer({
        variables: {
          id: viewerToken,
        },
      });
    }
  }, [viewerToken]);

  React.useEffect(() => {
    if (choice && viewerToken) {
      Promise.resolve(
        updatePreferredLanguage({
          variables: {
            id: viewerToken,
            preferredCodingLanguage: choice,
          },
        }),
      ).catch(() => {
        // Keep the local choice when the account service is unavailable.
      });
    }
  }, [choice, viewerToken, updatePreferredLanguage]);

  React.useEffect(() => {
    if (isCodingLanguage(storedLanguage) && !hasExplicitChoice.current) {
      setLanguageState(storedLanguage);
      try {
        window.localStorage.setItem(LANGUAGE_KEY, JSON.stringify(storedLanguage));
      } catch {
        // The server preference still applies when browser storage is blocked.
      }
    }
  }, [storedLanguage]);

  return (
    <CodingLanguageContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >
      {children}
    </CodingLanguageContext.Provider>
  );
};

export default CodingLanguageProvider;
