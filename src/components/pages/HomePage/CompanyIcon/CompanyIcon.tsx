import * as React from 'react';

import { Wrapper, CompanyImage } from './styles';

const CompanyIcon: React.FC<{ name: string }> = ({ name }) => {
  return (
    <Wrapper>
      <CompanyImage src={`/images/companylogos/${name}.svg`} alt={`${name} logo`} />
    </Wrapper>
  );
};

export default CompanyIcon;
