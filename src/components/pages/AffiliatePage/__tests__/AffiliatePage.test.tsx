import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { AffiliateStatus } from 'utils/shared/affiliate/constants';
import { SaleType } from 'utils/constants/payments';
import AffiliatePage from '../AffiliatePage';

const routerPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: routerPush,
    pathname: '/my/affiliate',
    asPath: '/my/affiliate',
    query: {},
  }),
}));

// The page chrome (navbar/footer) needs Apollo + the Next router provider and is
// covered elsewhere; this suite is about the affiliate dashboard's own behaviour.
jest.mock('components/pages/PageLayout/Default', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const makeUser = (overrides: any = {}) => ({
  id: 'user-1',
  affiliateId: 'ADA',
  affiliateStatus: AffiliateStatus.Active,
  affiliateRevenueShare: null,
  affiliateReferralClickCounts: [],
  affiliateLinkClicks_aggregate: { aggregate: { count: 0 } },
  affiliateSales: [],
  ...overrides,
});

const renderAffiliate = (props: any = {}) =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <AffiliatePage loading={false} {...props} />
    </ThemeProvider>,
  );

describe('AffiliatePage access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows only the heading while the query is in flight and never redirects', () => {
    renderAffiliate({ loading: true });

    expect(screen.getByRole('heading', { name: 'Affiliate Dashboard' })).toBeInTheDocument();
    expect(screen.queryByText('Your Affiliate Code')).not.toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('surfaces the query error instead of redirecting', () => {
    renderAffiliate({ error: { message: 'network exploded' } });

    expect(screen.getByText(/network exploded/)).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('redirects an anonymous visitor home and renders nothing', () => {
    const { container } = renderAffiliate({ data: { users_by_pk: null } });

    expect(routerPush).toHaveBeenCalledWith('/');
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects a signed-in user who is not an affiliate', () => {
    const { container } = renderAffiliate({
      data: { users_by_pk: makeUser({ affiliateId: null }) },
    });

    expect(routerPush).toHaveBeenCalledWith('/');
    expect(container).toBeEmptyDOMElement();
  });

  it.each([AffiliateStatus.Inactive, AffiliateStatus.Ended])(
    'redirects an affiliate whose status is %s and leaks no earnings data',
    (status) => {
      const { container } = renderAffiliate({
        data: {
          users_by_pk: makeUser({
            affiliateStatus: status,
            affiliateSales: [
              {
                createdAt: '2023-03-15T12:00:00Z',
                amountPaid: 149,
                affiliateAmountEarned: 59.6,
                type: SaleType.FullCourse,
              },
            ],
          }),
        },
      });

      expect(routerPush).toHaveBeenCalledWith('/');
      expect(container).toBeEmptyDOMElement();
      expect(container.textContent).not.toContain('59.6');
    },
  );
});

describe('AffiliatePage dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the affiliate code and the referral links built from it', () => {
    renderAffiliate({ data: { users_by_pk: makeUser({ affiliateId: 'ADA' }) } });

    expect(screen.getByText('ADA')).toBeInTheDocument();
    expect(screen.getByText('https://skilled.dev?friend=ADA')).toBeInTheDocument();
    expect(screen.getByText('https://skilled.dev/pricing?friend=ADA')).toBeInTheDocument();
  });

  it('falls back to the default revenue share when the user has no custom rate', () => {
    renderAffiliate({ data: { users_by_pk: makeUser({ affiliateRevenueShare: null }) } });

    expect(screen.getByText(/Each sale earns you 40% of the profits/)).toBeInTheDocument();
  });

  // BUG: the share is rendered as the raw result of `share * 100` with no rounding,
  // so a stored 0.55 is shown to the affiliate as "55.00000000000001%" (in two
  // places, including the earnings example). Expected: format to a fixed number of
  // decimals before display.
  // `it.failing` documents the defect without cementing it - asserting the float
  // noise verbatim would have to be deleted the day the formatting is fixed.
  it.failing('shows the user-specific revenue share as a readable percentage', () => {
    renderAffiliate({ data: { users_by_pk: makeUser({ affiliateRevenueShare: 0.55 }) } });

    expect(screen.getByText(/Each sale earns you 55% of the profits/)).toBeInTheDocument();
  });

  it('does use the user-specific share rather than the default when one is set', () => {
    renderAffiliate({ data: { users_by_pk: makeUser({ affiliateRevenueShare: 0.55 }) } });

    expect(screen.queryByText(/Each sale earns you 40% of the profits/)).not.toBeInTheDocument();
    expect(screen.getByText(/Each sale earns you 55/)).toBeInTheDocument();
  });

  it('groups sales into month/year buckets with per-bucket counts and summed earnings', () => {
    renderAffiliate({
      data: {
        users_by_pk: makeUser({
          affiliateSales: [
            {
              createdAt: '2023-03-15T12:00:00Z',
              amountPaid: 149,
              affiliateAmountEarned: 59.6,
              type: SaleType.FullCourse,
            },
            {
              createdAt: '2023-03-20T12:00:00Z',
              amountPaid: 149,
              affiliateAmountEarned: 59.6,
              type: SaleType.FullCourse,
            },
            {
              createdAt: '2023-04-02T12:00:00Z',
              amountPaid: 99,
              affiliateAmountEarned: 39.6,
              type: SaleType.GiftCard,
            },
          ],
        }),
      },
    });

    const marchRow = screen.getByText('March 2023').closest('tr')!;
    expect(within(marchRow).getByText('2')).toBeInTheDocument();
    expect(within(marchRow).getByText('$119.20')).toBeInTheDocument();

    const aprilRow = screen.getByText('April 2023').closest('tr')!;
    expect(within(aprilRow).getByText('1')).toBeInTheDocument();
    expect(within(aprilRow).getByText('$39.60')).toBeInTheDocument();
  });

  it('lists each individual sale with its product name and formatted amounts', () => {
    renderAffiliate({
      data: {
        users_by_pk: makeUser({
          affiliateSales: [
            {
              createdAt: '2023-03-15T12:00:00Z',
              amountPaid: 149,
              affiliateAmountEarned: 59.6,
              type: SaleType.FullCourse,
            },
            {
              createdAt: '2023-04-02T12:00:00Z',
              amountPaid: 99,
              affiliateAmountEarned: 39.6,
              type: SaleType.GiftCard,
            },
          ],
        }),
      },
    });

    expect(screen.getByText('All Sales (Total: 2)')).toBeInTheDocument();
    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByText('Gift Card')).toBeInTheDocument();
    expect(screen.getByText('$149.00')).toBeInTheDocument();
    expect(screen.getByText('$99.00')).toBeInTheDocument();
  });

  it('renders an empty dashboard for an affiliate with no sales or clicks', () => {
    renderAffiliate({ data: { users_by_pk: makeUser() } });

    expect(screen.getByText('All Sales (Total: 0)')).toBeInTheDocument();
    expect(screen.getByText('Referral Clicks (Total: 0)')).toBeInTheDocument();
  });

  it('shows referral click counts and labels a blank referral URL as (none)', () => {
    renderAffiliate({
      data: {
        users_by_pk: makeUser({
          affiliateLinkClicks_aggregate: { aggregate: { count: 7 } },
          affiliateReferralClickCounts: [
            { referralUrl: '  ', count: 3, mostRecentDate: '2023-03-15T12:00:00Z' },
            { referralUrl: 'https://blog.example.com/post', count: 4, mostRecentDate: '2023-03-16T12:00:00Z' },
          ],
        }),
      },
    });

    expect(screen.getByText('Referral Clicks (Total: 7)')).toBeInTheDocument();

    const blankRow = screen.getByText('(none)').closest('tr')!;
    expect(within(blankRow).getByText('3')).toBeInTheDocument();

    const blogRow = screen.getByText('https://blog.example.com/post').closest('tr')!;
    expect(within(blogRow).getByText('4')).toBeInTheDocument();
  });

  it('tolerates a missing click aggregate rather than crashing', () => {
    renderAffiliate({
      data: {
        users_by_pk: makeUser({ affiliateLinkClicks_aggregate: { aggregate: null } }),
      },
    });

    expect(screen.getByText('Referral Clicks (Total: 0)')).toBeInTheDocument();
  });
});
