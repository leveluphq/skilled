import * as React from 'react';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import { CodingLanguage } from 'utils/constants/lesson';

interface Props {
  nodes: Partial<Record<CodingLanguage, React.ReactElement>>;
}

const OptionalNode: React.FC<Props> = ({ nodes }) => {
  const { language } = useCodingLanguage();
  const node = nodes[language];

  if (!node) {
    return null;
  }

  return node;
};

export default OptionalNode;
