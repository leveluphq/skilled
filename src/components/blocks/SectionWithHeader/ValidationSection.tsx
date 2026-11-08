import * as React from 'react';
import { VALIDATE_TITLE } from 'utils/constants/lesson';
import SectionWithHeader from './SectionWithHeader';

const ValidationSection: React.FC = ({ children }) => (
  <SectionWithHeader header={VALIDATE_TITLE}>{children}</SectionWithHeader>
);

export default ValidationSection;
