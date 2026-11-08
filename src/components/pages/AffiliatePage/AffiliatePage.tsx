import * as React from 'react';
import { useRouter } from 'next/router';
import Card from 'components/blocks/Card';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import { GetAffiliateViewerQueryHookResult, Affiliate_Sales } from 'types/generated/client';
import { DEFAULT_REVENUE_SHARE, AffiliateStatus } from 'utils/shared/affiliate/constants';
import mapSaleTypeToName from 'utils/shared/payments/mapSaleTypeToName';
import { SaleType } from 'utils/constants/payments';
import { MONTH_INDEX } from 'utils/constants/time';

import {
  Wrapper,
  Section,
  SectionTitle,
  ListItem,
  Paragraph,
  BoldText,
  ClickTable,
  AllSalesTable,
} from './styles';

export interface Props {
  data?: GetAffiliateViewerQueryHookResult['data'];
  loading: GetAffiliateViewerQueryHookResult['loading'];
  error?: GetAffiliateViewerQueryHookResult['error'];
}

const PAGE_HEADER = 'Affiliate Dashboard';

type AffiliateSalesType = Affiliate_Sales[];
interface AggregatedSaleType {
  formattedDate: string;
  totalSales: number;
  amountEarned: number;
}
type GroupedSalesType = Record<string, AggregatedSaleType>;
const groupSalesByMonthYear = (sales: AffiliateSalesType) => {
  return sales.reduce<GroupedSalesType>((groupedSales, sale) => {
    const soldDate = new Date(sale.createdAt);
    const saleMonth = soldDate.getMonth();
    const saleYear = soldDate.getFullYear();
    const yearMonth = `${saleYear}-${saleMonth}`;

    if (!groupedSales[yearMonth]) {
      groupedSales[yearMonth] = {
        formattedDate: `${MONTH_INDEX[saleMonth]} ${saleYear}`,
        totalSales: 0,
        amountEarned: 0,
      };
    }

    groupedSales[yearMonth].totalSales++;
    groupedSales[yearMonth].amountEarned += sale.affiliateAmountEarned;

    return groupedSales;
  }, {});
};

const PageContent: React.FC = ({ children }) => (
  <PageLayoutDefault isNavbarFixed hideFooter>
    <Wrapper>{children}</Wrapper>
  </PageLayoutDefault>
);

const AffiliatePage: React.FC<Props> = ({ data, loading, error }) => {
  const router = useRouter();
  const user = data?.users_by_pk;
  const shouldRedirect = !(loading || error || user);

  // Since this only runs on the client, it will only redirect after the query has attempted
  React.useEffect(() => {
    if (shouldRedirect) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRedirect]);

  if (loading) {
    return (
      <PageContent>
        <h1>{PAGE_HEADER}</h1>
      </PageContent>
    );
  }

  if (error) {
    return <PageContent>Error: {error.message}</PageContent>;
  }

  if (!user || !user.affiliateId || user.affiliateStatus !== AffiliateStatus.Active) {
    router.push('/');
    return null;
  }

  const revenuShare = (user.affiliateRevenueShare || DEFAULT_REVENUE_SHARE) * 100;
  const affiliateId = user.affiliateId;
  const clicksByUrl = user.affiliateReferralClickCounts || [];
  const totalClicks = user.affiliateLinkClicks_aggregate.aggregate?.count || 0;
  const affiliateSales = user.affiliateSales || [];
  const groupedSales = groupSalesByMonthYear(affiliateSales);

  return (
    <PageContent>
      <h1>{PAGE_HEADER}</h1>
      <Section>
        <p>Affiliate program details:</p>
        <ul>
          <ListItem>Each URL sets a 4 week cookie.</ListItem>
          <ListItem>These URLs can be put behind any URL shortener.</ListItem>
          <ListItem>
            The affiliate code is not case sensitive, so you can capitalize/lower case to fit your
            branding.
          </ListItem>
          <ListItem>
            Sales are updated in real-time though numbers may change if refunds are given or fraud
            is detected.
          </ListItem>
          <ListItem>
            Each sale earns you {revenuShare}% of the profits. Example: a $100 sale costs me 2.9% +
            30 cents in fees. So it's $96.80 in profit. You'll be {revenuShare}% of that.
          </ListItem>
          <ListItem>
            I pay out the previous month's earning in around 30 days. This is to account for any
            credit card fraud or refunds.
          </ListItem>
        </ul>
      </Section>
      <Section>
        <SectionTitle>Your Affiliate Code</SectionTitle>
        <Card>
          <Paragraph>
            Code: <BoldText>{affiliateId}</BoldText>
          </Paragraph>
          <Paragraph>
            You can create a link by appending a query string to any URL{' '}
            <BoldText>?friend={affiliateId}</BoldText>. For example:
          </Paragraph>
          <Paragraph>https://skilled.dev?friend={affiliateId}</Paragraph>
          <Paragraph>https://skilled.dev/pricing?friend={affiliateId}</Paragraph>
        </Card>
      </Section>
      <Section>
        <SectionTitle>Sales Totals</SectionTitle>
        <Card>
          <AllSalesTable>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Sales</th>
                <th>Earned</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(groupedSales).map((aggregatedSale) => {
                return (
                  <tr>
                    <td>{aggregatedSale.formattedDate}</td>
                    <td>{aggregatedSale.totalSales}</td>
                    <td>${aggregatedSale.amountEarned.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </AllSalesTable>
        </Card>
      </Section>
      <Section>
        <SectionTitle>All Sales (Total: {affiliateSales.length})</SectionTitle>
        <Card>
          <AllSalesTable>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sale Amount</th>
                <th>Earned</th>
                <th>Product</th>
              </tr>
            </thead>
            <tbody>
              {affiliateSales.map((sale) => {
                return (
                  <tr>
                    <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td>${sale.amountPaid.toFixed(2)}</td>
                    <td>${sale.affiliateAmountEarned.toFixed(2)}</td>
                    <td>{mapSaleTypeToName(sale.type as SaleType)}</td>
                  </tr>
                );
              })}
            </tbody>
          </AllSalesTable>
        </Card>
      </Section>
      <Section>
        <SectionTitle>Referral Clicks (Total: {totalClicks})</SectionTitle>
        <Card>
          <ClickTable>
            <thead>
              <tr>
                <th>Referral URL</th>
                <th>Count</th>
                <th>Most Recent Click</th>
              </tr>
            </thead>
            <tbody>
              {clicksByUrl.map((click) => {
                return (
                  <tr>
                    <td>{click.referralUrl?.trim() || '(none)'}</td>
                    <td>{click.count}</td>
                    <td>{new Date(click.mostRecentDate).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </ClickTable>
        </Card>
      </Section>
    </PageContent>
  );
};

export default AffiliatePage;
