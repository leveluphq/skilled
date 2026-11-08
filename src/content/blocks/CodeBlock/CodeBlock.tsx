import * as React from 'react';
import { CodeSnippetGenerator, CodingLanguage } from 'utils/constants/lesson';
import { Container } from 'style/elements';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
// import LanguageSelect from 'components/blocks/LanguageSelect';

import {
  // LanguageSelector,
  CodeWrapper,
} from './styles';

interface Props {
  code: CodeSnippetGenerator;
  getLanguageUsed: (language: CodingLanguage) => CodingLanguage;
}

const CodeBlock: React.FC<Props> = ({ code }) => {
  const { language } = useCodingLanguage();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Container>
        <CodeWrapper>
          <pre className="language-javascript">
            <code className="language-javascript">&nbsp;</code>
          </pre>
        </CodeWrapper>
      </Container>
    );
  }

  // const languageUsed = getLanguageUsed(language);
  return (
    <Container>
      <CodeWrapper>
        {code(language)}
        {/* <LanguageSelector>
          <LanguageSelect />
        </LanguageSelector> */}
      </CodeWrapper>
    </Container>
  );
};

export default CodeBlock;
