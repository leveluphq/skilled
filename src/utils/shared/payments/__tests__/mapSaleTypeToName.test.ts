import mapSaleTypeToName from 'utils/shared/payments/mapSaleTypeToName';
import { SaleType } from 'utils/constants/payments';

describe('mapSaleTypeToName', () => {
  it('maps every SaleType to its display name', () => {
    expect(mapSaleTypeToName(SaleType.FullCourse)).toBe('Course');
    expect(mapSaleTypeToName(SaleType.GiftCard)).toBe('Gift Card');
    expect(mapSaleTypeToName(SaleType.Cart)).toBe('Cart');
  });

  it('covers the whole SaleType enum (a new member must be added to the map)', () => {
    const unmapped = Object.values(SaleType).filter((type) => !mapSaleTypeToName(type));

    expect(unmapped).toEqual([]);
  });

  // BUG: unknown/legacy sale types stored in the DB render as `undefined`
  // (AffiliatePage renders the result straight into a table cell). A fallback
  // to the raw type or a generic label would be safer.
  it('returns undefined for a value that is not in the map', () => {
    expect(mapSaleTypeToName('SUBSCRIPTION' as SaleType)).toBeUndefined();
    expect(mapSaleTypeToName(null as any)).toBeUndefined();
  });
});
