import getEndDate from 'utils/shared/time/getEndDate';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
// 2022-06-15T12:00:00.000Z — all assertions are epoch-based so they are
// timezone independent.
const NOW = Date.UTC(2022, 5, 15, 12, 0, 0);

describe('getEndDate', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts from now when the user has no existing access', () => {
    expect(getEndDate(30).getTime()).toBe(NOW + 30 * ONE_DAY_MS);
    expect(getEndDate(30).toISOString()).toBe('2022-07-15T12:00:00.000Z');
  });

  it('treats null / undefined / empty-string end dates as "no existing access"', () => {
    expect(getEndDate(7, null).getTime()).toBe(NOW + 7 * ONE_DAY_MS);
    expect(getEndDate(7, undefined).getTime()).toBe(NOW + 7 * ONE_DAY_MS);
    expect(getEndDate(7, '').getTime()).toBe(NOW + 7 * ONE_DAY_MS);
  });

  it('stacks on top of an existing future end date rather than restarting from now', () => {
    // Renewing while 10 days remain must add to the remaining time.
    const currentEnd = new Date(NOW + 10 * ONE_DAY_MS).toISOString();
    expect(getEndDate(30, currentEnd).getTime()).toBe(NOW + 40 * ONE_DAY_MS);
  });

  it('is timezone independent: a Z timestamp and its offset form give the same result', () => {
    const utc = '2022-07-01T00:00:00.000Z';
    const offset = '2022-06-30T20:00:00.000-04:00';
    expect(getEndDate(30, utc).getTime()).toBe(getEndDate(30, offset).getTime());
  });

  it('returns the base date unchanged for 0 access days', () => {
    expect(getEndDate(0).getTime()).toBe(NOW);
    const currentEnd = new Date(NOW + ONE_DAY_MS).toISOString();
    expect(getEndDate(0, currentEnd).getTime()).toBe(NOW + ONE_DAY_MS);
  });

  it('supports fractional access days', () => {
    expect(getEndDate(0.5).getTime()).toBe(NOW + ONE_DAY_MS / 2);
  });

  // BUG: there is no `Math.max(Date.now(), baseEnd)` clamp. When a user's
  // previous access has ALREADY EXPIRED, the new window is measured from the
  // expired date instead of from now, so the customer gets less access than
  // they paid for — and if the expiry is older than the purchased window, the
  // new end date is still in the past and they get nothing at all.
  // Callers: handleCompletedCheckout.ts (paid upgrade) and
  // src/pages/api/v1/giftcard/redeem.ts (gift card redemption).
  it('measures from an ALREADY EXPIRED end date instead of clamping to now', () => {
    const expiredAYearAgo = new Date(NOW - 365 * ONE_DAY_MS).toISOString();

    const result = getEndDate(30, expiredAYearAgo);

    // Current behaviour: 30 days after the year-old expiry, i.e. still expired.
    // When the clamp is added this expectation becomes NOW + 30 days.
    expect(result.getTime()).toBe(NOW - 335 * ONE_DAY_MS);
    expect(result.getTime()).toBeLessThan(NOW);
  });

  it('shortchanges a user whose access expired yesterday', () => {
    // BUG (same clamp): buying 30 days one day after expiry yields 29 days.
    const expiredYesterday = new Date(NOW - ONE_DAY_MS).toISOString();

    const result = getEndDate(30, expiredYesterday);

    expect(result.getTime()).toBe(NOW + 29 * ONE_DAY_MS);
  });

  // BUG: an unparseable stored date produces an Invalid Date instead of falling
  // back to now. Callers immediately call `.toISOString()` on the result, which
  // throws RangeError and fails the checkout webhook / gift card redemption.
  it('returns an Invalid Date for an unparseable current end date', () => {
    const result = getEndDate(30, 'not-a-date');

    expect(Number.isNaN(result.getTime())).toBe(true);
    expect(() => result.toISOString()).toThrow(RangeError);
  });

  // BUG: NaN access days (e.g. a missing productAccessDays column) has the same
  // Invalid Date consequence.
  it('returns an Invalid Date for NaN access days', () => {
    expect(Number.isNaN(getEndDate(NaN).getTime())).toBe(true);
  });

  it('does not mutate the Date.now clock or share state between calls', () => {
    const first = getEndDate(30);
    const second = getEndDate(30);

    expect(first).not.toBe(second);
    expect(second.getTime()).toBe(first.getTime());
    expect(Date.now()).toBe(NOW);
  });
});
