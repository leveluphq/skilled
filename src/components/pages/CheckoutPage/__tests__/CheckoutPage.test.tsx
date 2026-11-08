import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import { SaleType } from 'utils/constants/payments';
import api from 'services/client/api';
import useStripe from 'components/hooks/useStripe';
import navigateTo from 'utils/client/navigateTo';
import CheckoutPage from '../CheckoutPage';

jest.mock('services/client/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

jest.mock('components/hooks/useStripe', () => ({
  __esModule: true,
  default: jest.fn(),
}));

let routerQuery: Record<string, any> = {};
jest.mock('next/router', () => ({
  useRouter: () => ({ query: routerQuery, pathname: '/checkout', asPath: '/checkout' }),
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

const PRODUCTS = [FULL];
const VIEWER = { users_by_pk: { id: 'user-1', fullCourseAccessEndsAt: null } } as any;

let locationHref = '';

// jsdom can't navigate, so record where the page sends the browser
jest.mock('utils/client/navigateTo', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const renderCheckoutPage = (props: any = {}) =>
  render(<CheckoutPage loading={false} products={PRODUCTS} {...props} />);

describe('CheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    locationHref = '';
    (navigateTo as jest.Mock).mockImplementation((url: string) => {
      locationHref = url;
    });
    routerQuery = {};
    mockUseStripe.mockReturnValue({ redirectToCheckout });
    mockApiPost.mockResolvedValue({ id: 'cs_test_session' });
    // Real Stripe navigates away, so this promise never settles.
    redirectToCheckout.mockImplementation(() => new Promise(() => {}));
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
  });

  it('sends ONLY the database product id when auto-starting checkout', async () => {
    // Security guard: the ?product= query param is a Stripe *price* id used purely
    // to look the product up locally. The request body must carry the database id
    // and nothing else, so price/entitlement stay server-resolved.
    routerQuery = { product: 'price_full' };

    const { unmount } = renderCheckoutPage({ data: VIEWER });

    await waitFor(() => expect(mockApiPost).toHaveBeenCalled());
    expect(mockApiPost).toHaveBeenCalledWith('payments/stripe/checkout', {
      payload: { productId: 'db-full-course-id' },
    });

    const [, config] = mockApiPost.mock.calls[0];
    expect(Object.keys(config.payload)).toEqual(['productId']);
    expect(JSON.stringify(config.payload)).not.toContain('price_full');

    unmount();
  });

  it('redirects to the Stripe session returned by the server', async () => {
    routerQuery = { product: 'price_full' };

    const { unmount } = renderCheckoutPage({ data: VIEWER });

    await waitFor(() =>
      expect(redirectToCheckout).toHaveBeenCalledWith({ sessionId: 'cs_test_session' }),
    );

    unmount();
  });

  it('bounces to the pricing page when the query names an unknown product', async () => {
    routerQuery = { product: 'price_does_not_exist' };

    renderCheckoutPage({ data: VIEWER });

    await waitFor(() => expect(locationHref).toBe('/pricing'));
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('never starts a checkout without a signed-in viewer', async () => {
    routerQuery = { product: 'price_full' };

    renderCheckoutPage({ data: undefined });

    await waitFor(() => expect(locationHref).toBe('/pricing'));
    expect(mockApiPost).not.toHaveBeenCalled();
    expect(redirectToCheckout).not.toHaveBeenCalled();
  });

  it('never starts a checkout when no product is requested', async () => {
    renderCheckoutPage({ data: VIEWER });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApiPost).not.toHaveBeenCalled();
    expect(locationHref).toBe('');
  });

  it('bounces to the pricing page when the viewer query errored', async () => {
    routerQuery = { product: 'price_full' };

    renderCheckoutPage({ data: VIEWER, error: { message: 'boom' } });

    await waitFor(() => expect(locationHref).toBe('/pricing'));
  });

  it('waits instead of redirecting while the viewer query is still loading', async () => {
    routerQuery = { product: 'price_full' };

    renderCheckoutPage({ loading: true, data: undefined });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(locationHref).toBe('');
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('does not start a checkout before Stripe.js has loaded', async () => {
    routerQuery = { product: 'price_full' };
    mockUseStripe.mockReturnValue(undefined);

    renderCheckoutPage({ data: VIEWER });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApiPost).not.toHaveBeenCalled();
  });

  // BUG: `isCreatingSession` is both the re-entrancy guard and an effect dependency,
  // and the `finally` block resets it to false. When session creation fails the
  // reset re-triggers the effect, which immediately retries - an unbounded loop of
  // checkout-session requests plus a stream of alert() dialogs, with no back-off and
  // no way for the user to stop it short of leaving the page.
  // Expected: latch the attempt (e.g. a ref, or drop isCreatingSession from the deps)
  // so a failed checkout is attempted once.
  // `it.failing` documents the loop without cementing it: asserting the retry count
  // is `> 1` would have to be deleted the day the latch lands, whereas this flips to
  // a reported "failing test passed" instead.
  it.failing('attempts checkout session creation exactly once when it fails', async () => {
    routerQuery = { product: 'price_full' };
    mockApiPost.mockRejectedValue(new Error('stripe is down'));

    const { unmount } = renderCheckoutPage({ data: VIEWER });

    try {
      // Bail out as soon as a second attempt proves the loop, otherwise give a
      // correct implementation a quarter of a second to (not) retry.
      for (let i = 0; i < 25 && mockApiPost.mock.calls.length < 2; i++) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      expect(window.alert).toHaveBeenCalledWith('Error: stripe is down');
      expect(mockApiPost).toHaveBeenCalledTimes(1);
    } finally {
      // Unmount inside `finally`: the failed expectation above throws, and without
      // this the component would keep retrying for the rest of the run.
      unmount();
    }
  });
});
