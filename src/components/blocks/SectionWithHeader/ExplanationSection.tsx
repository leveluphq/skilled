import * as React from 'react';
import SectionWithHeader from './SectionWithHeader';

const ExplanationSection: React.FC = ({ children }) => (
  <SectionWithHeader header="Breakdown">{children}</SectionWithHeader>
);

export default ExplanationSection;
