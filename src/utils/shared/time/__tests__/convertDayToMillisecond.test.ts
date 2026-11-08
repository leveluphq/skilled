import convertDayToMillisecond from 'utils/shared/time/convertDayToMillisecond';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe('convertDayToMillisecond', () => {
  it('converts whole days', () => {
    expect(convertDayToMillisecond(1)).toBe(ONE_DAY_MS);
    expect(convertDayToMillisecond(365)).toBe(365 * ONE_DAY_MS);
  });

  it('returns 0 for 0 days', () => {
    expect(convertDayToMillisecond(0)).toBe(0);
  });

  it('supports fractional and negative day counts', () => {
    expect(convertDayToMillisecond(0.5)).toBe(ONE_DAY_MS / 2);
    expect(convertDayToMillisecond(-1)).toBe(-ONE_DAY_MS);
  });

  it('stays exact for a lifetime-sized access window', () => {
    // PRODUCT_ACCESS_LIFETIME_DAYS-scale input must not lose precision.
    const lifetimeDays = 365 * 100;
    expect(convertDayToMillisecond(lifetimeDays)).toBe(lifetimeDays * ONE_DAY_MS);
    expect(Number.isSafeInteger(convertDayToMillisecond(lifetimeDays))).toBe(true);
  });
});
