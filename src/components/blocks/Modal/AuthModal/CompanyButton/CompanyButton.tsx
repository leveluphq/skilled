import * as React from 'react';
import { useRouter } from 'next/router';
import companyStyle from 'style/company';
import { CompanyButtonProps } from './props';

import { CompanyButtonWrapper, CompanyIcon } from './styles';

const CompanyButton: React.FC<CompanyButtonProps> = ({ company, children, product }) => {
  const router = useRouter();
  const next = router.pathname;
  const Icon = companyStyle.icon[company];

  let queryString = `next=${next}`;

  if (product) {
    queryString += `&product=${product}`;
  }

  return (
    <CompanyButtonWrapper href={`/api/auth/${company}?${queryString}`} company={company}>
      <CompanyIcon>
        <Icon />
      </CompanyIcon>
      <div>{children}</div>
    </CompanyButtonWrapper>
  );
};

export default CompanyButton;
