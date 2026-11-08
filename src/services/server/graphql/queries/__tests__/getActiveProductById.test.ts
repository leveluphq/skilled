/**
 * getActiveProductById is the entitlement gate on the checkout path: the row it
 * returns decides which Stripe price is charged and how many days of access the
 * buyer gets. The important properties are that a retired product can never be
 * resolved by id, and that "no such product" is a clean null rather than a crash
 * or a silently-succeeding lookup.
 */
jest.mock('services/server/graphql/client', () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

import client from 'services/server/graphql/client';
import getActiveProductById from 'services/server/graphql/queries/getActiveProductById';

const request = (client as unknown as { request: jest.Mock }).request;

const PRODUCT = {
  id: 'product-1',
  status: 'ACTIVE',
  stripePriceId: 'price_123',
  productAccessDays: 365,
};

beforeEach(() => {
  request.mockReset();
});

describe('getActiveProductById', () => {
  it('filters on both the id and status ACTIVE so a retired product cannot be bought by id', async () => {
    request.mockResolvedValue({ products: [PRODUCT] });

    await getActiveProductById('product-1');

    const [document, variables] = request.mock.calls[0];

    expect(typeof document).toBe('string');
    expect(document).toMatch(/id:\s*\{\s*_eq:\s*\$id\s*\}/);
    expect(document).toMatch(/status:\s*\{\s*_eq:\s*"ACTIVE"\s*\}/);
    expect(document).toMatch(/limit:\s*1/);
    expect(variables).toEqual({ id: 'product-1' });
  });

  it('passes the id as a GraphQL variable and never interpolates it into the document', async () => {
    request.mockResolvedValue({ products: [] });

    const hostile = '"}}) { id } } mutation { delete_products(where: {}) { affected_rows } } #';

    await getActiveProductById(hostile);

    const [document, variables] = request.mock.calls[0];

    expect(document).not.toContain(hostile);
    expect(document).not.toContain('delete_products');
    expect(variables).toEqual({ id: hostile });
  });

  /**
   * Commit 03382f36 moved checkout from "trust the product object in the request
   * body" to "rebuild it from this row". The route now charges
   * `product.stripePriceId` and mints entitlement from `productAccessDays` using
   * whatever this selection set returns, so a field dropped here silently
   * reintroduces the tampering flaw (an undefined price id / access window) —
   * with no type error, because the generated query type follows the document.
   */
  it('selects the fields checkout rebuilds the purchase from', async () => {
    request.mockResolvedValue({ products: [PRODUCT] });

    await getActiveProductById('product-1');

    const [document] = request.mock.calls[0];

    expect(document).toContain('stripePriceId');
    expect(document).toContain('stripeProductId');
    expect(document).toContain('productAccessDays');
    expect(document).toContain('type');
    expect(document).toContain('isAdditionalSupportPrice');
  });

  it('returns the matching product row', async () => {
    request.mockResolvedValue({ products: [PRODUCT] });

    await expect(getActiveProductById('product-1')).resolves.toBe(PRODUCT);
  });

  it('returns null (not undefined) when nothing matches — e.g. the product is no longer ACTIVE', async () => {
    request.mockResolvedValue({ products: [] });

    await expect(getActiveProductById('retired-product')).resolves.toBeNull();
  });

  it('returns null when the response carries no products field at all', async () => {
    request.mockResolvedValue({});

    await expect(getActiveProductById('product-1')).resolves.toBeNull();
  });

  it('returns null when the response itself is null', async () => {
    request.mockResolvedValue(null);

    await expect(getActiveProductById('product-1')).resolves.toBeNull();
  });

  it('propagates transport failures instead of reporting them as "product not found"', async () => {
    request.mockRejectedValue(new Error('hasura unreachable'));

    // Swallowing this would turn an outage into a 404 on checkout, which reads
    // to the caller exactly like a deliberately retired product.
    await expect(getActiveProductById('product-1')).rejects.toThrow('hasura unreachable');
  });
});
