import * as React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { themeMap, ThemeNames } from 'style/theme';
import { SaleType } from 'utils/constants/payments';
import api from 'services/client/api';
import useStripe from 'components/hooks/useStripe';
import PricingPage from '../PricingPage';

jest.mock('services/client/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

jest.mock('components/hooks/useStripe', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/pricing', asPath: '/pricing', query: {}, push: jest.fn() }),
}));

const mockApiPost = (api as unknown as { post: jest.Mock }).post;
const mockUseStripe = useStripe as unknown as jest.Mock;
const redirectToCheckout = jest.fn();

const FULL = {
  id: 'db-full-course-id',
  associatedProductId: null,
  type: SaleType.FullCourse,
  productType: null,
  productAccessDays: 365,
  stripeProductId: 'prod_full',
  stripePriceId: 'price_full',
  name: 'Full Course',
  price: 149,
  planDescription: 'Everything',
  lengthDescription: null,
  isAdditionalSupportPrice: false,
};

const SUPPORT = {
  ...FULL,
  id: 'db-support-id',
  stripeProductId: 'prod_support',
  stripePriceId: 'price_support',
  name: 'Full Course + Support',
  price: 249,
  isAdditionalSupportPrice: true,
};

const GIFT = {
  ...FULL,
  id: 'db-gift-id',
  type: SaleType.GiftCard,
  stripeProductId: 'prod_gift',
  stripePriceId: 'price_gift',
  name: 'Gift Card',
  price: 99,
  isAdditionalSupportPrice: false,
};

const PRODUCTS = [FULL, SUPPORT, GIFT];

const VIEWER = {
  users_by_pk: { id: 'user-1', fullCourseAccessEndsAt: null },
} as any;

const renderPricingPage = (props: any = {}) =>
  render(
    <ThemeProvider theme={themeMap[ThemeNames.Dark]}>
      <PricingPage loading={false} products={PRODUCTS} {...props} />
    </ThemeProvider>,
  );

describe('PricingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStripe.mockReturnValue({ redirectToCheckout });
    mockApiPost.mockResolvedValue({ id: 'cs_test_session' });
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
  });

  it('renders the price of every product it is handed', () => {
    renderPricingPage();

    expect(screen.getByText('149')).toBeInTheDocument();
    expect(screen.getByText('249')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('sends ONLY the database product id to the checkout endpoint', async () => {
    // Security guard: price, stripePriceId and access length must be resolved
    // server-side. If any of them ever end up in this payload, a caller could
    // choose what they pay for.
    renderPricingPage({ data: VIEWER });

    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);

    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));

    expect(mockApiPost).toHaveBeenCalledWith('payments/stripe/checkout', {
      payload: { productId: 'db-full-course-id' },
    });

    const [, config] = mockApiPost.mock.calls[0];
    expect(Object.keys(config.payload)).toEqual(['productId']);
    expect(JSON.stringify(config.payload)).not.toContain('price');
    expect(JSON.stringify(config.payload)).not.toContain('149');
  });

  it('sends the id of the specific product whose button was clicked', async () => {
    renderPricingPage({ data: VIEWER });

    fireEvent.click(screen.getAllByText('Upgrade Now')[1]);
    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(1));
    expect(mockApiPost).toHaveBeenLastCalledWith('payments/stripe/checkout', {
      payload: { productId: 'db-support-id' },
    });

    fireEvent.click(screen.getByText('Buy Gift Card'));
    await waitFor(() => expect(mockApiPost).toHaveBeenCalledTimes(2));
    expect(mockApiPost).toHaveBeenLastCalledWith('payments/stripe/checkout', {
      payload: { productId: 'db-gift-id' },
    });
  });

  it('redirects to the Stripe session returned by the server', async () => {
    renderPricingPage({ data: VIEWER });

    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);

    await waitFor(() =>
      expect(redirectToCheckout).toHaveBeenCalledWith({ sessionId: 'cs_test_session' }),
    );
  });

  it('does not create a checkout session for an anonymous visitor - it prompts auth instead', async () => {
    renderPricingPage();

    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);

    await waitFor(() => expect(screen.getByText('Sign Up or Log In')).toBeInTheDocument());
    expect(mockApiPost).not.toHaveBeenCalled();
    expect(redirectToCheckout).not.toHaveBeenCalled();

    // The modal's focus trap activates on a setTimeout. Let it run while the modal
    // is still mounted, or it fires after cleanup and fails whichever test is next.
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  });

  it('carries the selected product through the OAuth round trip so checkout resumes after sign in', async () => {
    renderPricingPage();

    fireEvent.click(screen.getByText('Buy Gift Card'));

    await waitFor(() => expect(screen.getByText('GitHub')).toBeInTheDocument());
    expect(screen.getByText('GitHub').closest('a')).toHaveAttribute(
      'href',
      '/api/auth/github?next=/pricing&product=price_gift',
    );

    // As in the anonymous-checkout test, finish deferred focus activation while
    // the modal exists so its callback cannot leak into the next test's cleanup.
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  });

  it('does nothing when Stripe.js has not loaded yet', () => {
    mockUseStripe.mockReturnValue(undefined);

    renderPricingPage({ data: VIEWER });

    const buyButton = screen.getAllByText('Upgrade Now')[0].closest('button');
    expect(buyButton).toBeDisabled();

    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('disables the purchase buttons while the viewer query is still loading', () => {
    renderPricingPage({ loading: true });

    screen.getAllByText('Upgrade Now').forEach((label) => {
      expect(label.closest('button')).toBeDisabled();
    });
    expect(screen.getByText('Buy Gift Card').closest('button')).toBeDisabled();
  });

  it('locks every purchase button while a checkout session is in flight', async () => {
    // Without this guard an impatient double-click creates two Stripe sessions for
    // the same viewer (and the gift-card button could start a second, different
    // purchase mid-flight).
    let resolveSession: (value: any) => void = () => {};
    mockApiPost.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSession = resolve;
        }),
    );

    renderPricingPage({ data: VIEWER });

    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);

    await waitFor(() =>
      expect(screen.getAllByText('Upgrade Now')[0].closest('button')).toBeDisabled(),
    );
    expect(screen.getAllByText('Upgrade Now')[1].closest('button')).toBeDisabled();
    expect(screen.getByText('Buy Gift Card').closest('button')).toBeDisabled();

    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);
    fireEvent.click(screen.getByText('Buy Gift Card'));
    expect(mockApiPost).toHaveBeenCalledTimes(1);

    resolveSession({ id: 'cs_test_session' });
    await waitFor(() => expect(redirectToCheckout).toHaveBeenCalledTimes(1));
  });

  it('re-enables the buttons and alerts when session creation fails', async () => {
    mockApiPost.mockRejectedValue(new Error('card declined'));

    renderPricingPage({ data: VIEWER });

    fireEvent.click(screen.getAllByText('Upgrade Now')[0]);

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error: card declined'));
    expect(redirectToCheckout).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getAllByText('Upgrade Now')[0].closest('button')).not.toBeDisabled(),
    );
  });

  it('warns an existing subscriber that buying again extends their access', () => {
    renderPricingPage({ data: VIEWER });

    expect(screen.getByText(/You already have a subscription/)).toBeInTheDocument();
  });

  it('does not show the existing-subscription banner to anonymous visitors', () => {
    renderPricingPage();

    expect(screen.queryByText(/You already have a subscription/)).not.toBeInTheDocument();
  });

  it('says there is nothing to buy on a site without its products, like a fresh local setup', () => {
    renderPricingPage({ products: [] });

    expect(screen.getByText('Nothing for sale here')).toBeInTheDocument();
    expect(screen.queryByText('Upgrade Now')).not.toBeInTheDocument();
  });

  it('says there is nothing to buy when one of the three products is missing', () => {
    renderPricingPage({ products: [FULL, SUPPORT] });

    expect(screen.getByText('Nothing for sale here')).toBeInTheDocument();
  });
});
