import { getAffiliateId, getAffiliateRevenueEarned } from 'utils/shared/affiliate';

describe('getAffiliateId', () => {
  it('returns a single query value unchanged', () => {
    expect(getAffiliateId('trey')).toBe('trey');
  });

  it('returns an empty string when no value is supplied', () => {
    expect(getAffiliateId()).toBe('');
    expect(getAffiliateId(undefined)).toBe('');
  });

  it('collapses a repeated query param (?friend=a&friend=b) to the FIRST value', () => {
    // Next.js hands back an array when the param repeats. Taking the first value
    // (not the last) is what decides which affiliate gets credited/cookied.
    expect(getAffiliateId(['first', 'second', 'third'])).toBe('first');
  });

  it('preserves the raw value rather than sanitising it', () => {
    // Documents the trust boundary: callers (cookie writer, DB lookup) are
    // responsible for encoding/validating, this helper does not.
    expect(getAffiliateId(' ../../evil ')).toBe(' ../../evil ');
    expect(getAffiliateId('')).toBe('');
  });

  // BUG: an empty array (possible from a malformed `?friend=` query) returns
  // `undefined` even though the signature promises a string. Callers such as
  // src/pages/friend/[affiliateId].ts pass the result straight into
  // setAffiliateCookie()/getUserByAffiliateId(). It should fall back to ''.
  it('returns undefined (not "") for an empty array', () => {
    expect(getAffiliateId([])).toBeUndefined();
  });
});

describe('getAffiliateRevenueEarned', () => {
  it('pays the default 40% share of the post-Stripe-fee profit', () => {
    // $100 sale -> $100 - 2.9% - $0.30 = $96.80 profit -> 40% = $38.72
    expect(getAffiliateRevenueEarned(100)).toBeCloseTo(38.72, 10);
  });

  it('honours a custom revenue share', () => {
    expect(getAffiliateRevenueEarned(100, 0.5)).toBeCloseTo(48.4, 10);
    expect(getAffiliateRevenueEarned(100, 1)).toBeCloseTo(96.8, 10);
  });

  it('takes fees out before applying the share, and applies them only once', () => {
    // $199 - 2.9% ($5.771) - $0.30 = $192.929 profit -> 40% = $77.1716.
    // Expectations are hardcoded rather than recomputed with stripeProfitAfterFees,
    // so a change to the fee constants fails here instead of moving both sides.
    expect(getAffiliateRevenueEarned(199, 0.4)).toBeCloseTo(77.1716, 10);
    // Charging the fees on the affiliate's cut instead (share first, then fees)
    // would pay $76.9916 — nearly $0.18 more per sale.
    expect(getAffiliateRevenueEarned(199, 0.4)).not.toBeCloseTo(76.9916, 6);
  });

  it('does not round to whole cents', () => {
    // Stored straight in the DB payout column, so sub-cent precision leaks through.
    // $29.99 -> $28.82029 profit -> 40% = $11.528116, not $11.53.
    const earned = getAffiliateRevenueEarned(29.99);
    expect(earned).toBeCloseTo(11.528116, 9);
    expect(earned).not.toBeCloseTo(11.53, 4);
  });

  // BUG: a 0% revenue share is indistinguishable from "unset" because of
  // `revenueShare || DEFAULT_REVENUE_SHARE`, so an affiliate explicitly set to
  // 0 is silently paid the full default 40%. It should use `??` instead.
  it('treats an explicit 0 revenue share as the default 40%', () => {
    expect(getAffiliateRevenueEarned(100, 0)).toBeCloseTo(38.72, 10);
  });

  // BUG: null/NaN shares also fall back to 40% rather than failing loudly.
  it('falls back to the default share for null and NaN', () => {
    expect(getAffiliateRevenueEarned(100, null as any)).toBeCloseTo(38.72, 10);
    expect(getAffiliateRevenueEarned(100, NaN)).toBeCloseTo(38.72, 10);
  });

  // BUG: a $0 sale (100% off coupon, free product, $0 gift card) produces a
  // NEGATIVE payout because the $0.30 flat fee is still subtracted. This value
  // is written to sales.affiliateAmountEarned. It should clamp at 0.
  it('returns a negative payout for a $0 sale', () => {
    expect(getAffiliateRevenueEarned(0)).toBeCloseTo(-0.12, 10);
    expect(getAffiliateRevenueEarned(0)).toBeLessThan(0);
  });

  // BUG: same clamp problem for any sale under the break-even point (~$0.31).
  it('returns a negative payout for a sale smaller than the Stripe fees', () => {
    expect(getAffiliateRevenueEarned(0.25)).toBeLessThan(0);
  });

  it('propagates a negative revenue share instead of rejecting it', () => {
    // BUG: a corrupted/negative affiliateRevenueShare produces a negative payout
    // rather than throwing or clamping.
    expect(getAffiliateRevenueEarned(100, -0.5)).toBeCloseTo(-48.4, 10);
  });

  it('scales linearly for large sales', () => {
    // $10,000 - $290 - $0.30 = $9,709.70 profit -> 40% = $3,883.88
    expect(getAffiliateRevenueEarned(10000)).toBeCloseTo(3883.88, 6);
  });
});
