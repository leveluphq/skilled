/**
 * useStripe loads Stripe.js for the pricing and checkout pages, but only on a
 * site that has a Stripe publishable key: Stripe() throws without one.
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import useStripe from '../useStripe';

const ORIGINAL_ENV = process.env;

const UsesStripe = () => {
  useStripe({});
  return null;
};

const stripeScripts = () =>
  Array.from(document.querySelectorAll('script')).filter(
    (script) => script.src === 'https://js.stripe.com/v3/',
  );

beforeEach(() => {
  document.head.innerHTML = '';
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('useStripe', () => {
  it('loads Stripe.js when the site has a publishable key', () => {
    process.env = { ...ORIGINAL_ENV, STRIPE_PUBLISHABLE_KEY: 'pk_test_not_real' };

    render(<UsesStripe />);

    expect(stripeScripts()).toHaveLength(1);
  });

  it("loads nothing on a site without Stripe, as a fresh copy is", () => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.STRIPE_PUBLISHABLE_KEY;

    render(<UsesStripe />);

    expect(stripeScripts()).toHaveLength(0);
  });
});
