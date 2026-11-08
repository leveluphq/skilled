import * as React from 'react';
import { ContentForLanguage } from 'utils/constants/lesson';
import useCodingLanguage from 'components/hooks/useCodingLanguage';

interface Props {
  content: ContentForLanguage;
}

const ContentByLanguage: React.FC<Props> = ({ content }) => {
  const { language } = useCodingLanguage();
  return <>{content(language)}</>;
};

export default ContentByLanguage;
