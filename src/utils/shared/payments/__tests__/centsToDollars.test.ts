import centsToDollars from 'utils/shared/payments/centsToDollars';

describe('centsToDollars', () => {
  it('converts cents to dollars', () => {
    expect(centsToDollars(2999)).toBe(29.99);
    expect(centsToDollars(1)).toBe(0.01);
    expect(centsToDollars(100)).toBe(1);
  });

  it('returns 0 for zero and for null', () => {
    // Stripe types amount_total / unit_amount as `number | null`.
    expect(centsToDollars(0)).toBe(0);
    expect(centsToDollars(null)).toBe(0);
  });

  it('handles refunds (negative amounts) without clamping', () => {
    expect(centsToDollars(-2599)).toBe(-25.99);
  });

  it('keeps precision for large amounts', () => {
    expect(centsToDollars(999999999)).toBe(9999999.99);
    expect(centsToDollars(123456789)).toBe(1234567.89);
  });

  it('does not round fractional cents', () => {
    // Stripe can send fractional cents on prorations; the value is passed through.
    expect(centsToDollars(12345.6)).toBeCloseTo(123.456, 10);
  });

  // BUG: only `null` is guarded, so `undefined` (an absent field, e.g. a Stripe
  // object built without unit_amount) yields NaN instead of 0. NaN then flows
  // into displayed prices and stored sale amounts. The guard should be `== null`.
  it('returns NaN for undefined', () => {
    expect(centsToDollars(undefined as any)).toBeNaN();
  });
});
