import * as React from 'react';
import Ticker from 'react-ticker';
import CompanyIcon from '../CompanyIcon';

import { Wrapper, CompanyWrapper, Spacer, CompanyItem } from './styles';

const companies = [
  'airbnb',
  'amazon',
  'apple',
  'coinbase',
  'discord',
  'facebook',
  'github',
  'google',
  'linkedin',
  'lyft',
  'microsoft',
  'netflix',
  'paypal',
  'postmates',
  'reddit',
  'robinhood',
  'slack',
  'snapchat',
  'spacex',
  'stripe',
  'tesla',
  'twitch',
  'twitter',
  'uber',
];
const half = Math.ceil(companies.length / 2);

const topCompanyNames = companies.slice(0, half);
const bottomCompanyNames = companies.slice(half);

const mapCompanyToComponent = (company: string) => (
  <CompanyItem key={company}>
    <CompanyIcon name={company} />
    <Spacer>&nbsp;</Spacer>
  </CompanyItem>
);

const topCompanies = topCompanyNames.map(mapCompanyToComponent);
const bottomCompanies = bottomCompanyNames.map(mapCompanyToComponent);

const CompaniesSection: React.FC = () => {
  return (
    <Wrapper>
      <Ticker>{() => <CompanyWrapper>{topCompanies}</CompanyWrapper>}</Ticker>
      <Ticker direction="toRight">
        {() => <CompanyWrapper>{bottomCompanies}</CompanyWrapper>}
      </Ticker>
    </Wrapper>
  );
};

export default CompaniesSection;
