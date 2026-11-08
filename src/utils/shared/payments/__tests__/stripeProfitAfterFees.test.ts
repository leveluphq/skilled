import stripeProfitAfterFees from 'utils/shared/payments/stripeProfitAfterFees';

describe('stripeProfitAfterFees', () => {
  it('subtracts the 2.9% + $0.30 Stripe fee', () => {
    expect(stripeProfitAfterFees(100)).toBeCloseTo(96.8, 10);
    expect(stripeProfitAfterFees(10)).toBeCloseTo(10 - 0.29 - 0.3, 10);
  });

  it('applies the variable fee to the gross amount, not the net', () => {
    // net-based fee math would give 100 - (100 - 0.3) * 0.029 - 0.3 = 96.8087
    expect(stripeProfitAfterFees(100)).not.toBeCloseTo(96.8087, 4);
  });

  // BUG: the $0.30 flat fee is charged even when nothing was collected, so a
  // $0 sale reports a loss. Downstream (getAffiliateRevenueEarned) this becomes
  // a negative affiliate payout.
  it('reports -$0.30 profit for a $0 sale', () => {
    expect(stripeProfitAfterFees(0)).toBeCloseTo(-0.3, 10);
  });

  it('breaks even just above $0.30', () => {
    expect(stripeProfitAfterFees(0.3)).toBeLessThan(0);
    expect(stripeProfitAfterFees(0.32)).toBeGreaterThan(0);
  });

  it('does not round to cents', () => {
    expect(stripeProfitAfterFees(29.99)).toBeCloseTo(28.82029, 9);
  });
});
