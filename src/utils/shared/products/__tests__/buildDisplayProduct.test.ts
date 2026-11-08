import Stripe from 'stripe';
import buildDisplayProduct from 'utils/shared/products/buildDisplayProduct';
import { GetActiveProductsQuery } from 'types/generated/server';
import { SaleType } from 'utils/constants/payments';

type DbProduct = GetActiveProductsQuery['products'][0];

const buildDbProduct = (overrides: Partial<DbProduct> = {}): DbProduct =>
  ({
    id: 'db-product-1',
    createdAt: '2021-01-01T00:00:00.000Z',
    updatedAt: '2021-01-01T00:00:00.000Z',
    status: 'ACTIVE',
    type: SaleType.FullCourse,
    displayTitle: 'Skilled.dev Course',
    displayDescription: 'Everything you need to pass the interview',
    displayLengthDescription: 'Lifetime access',
    productAccessDays: 365,
    stripeProductId: 'prod_real',
    stripePriceId: 'price_real',
    isAdditionalSupportPrice: false,
    ...overrides,
  } as DbProduct);

const buildStripeProduct = (overrides: Partial<Stripe.Product> = {}): Stripe.Product =>
  ({
    id: 'prod_real',
    object: 'product',
    name: 'Stripe Course Name',
    description: 'Stripe description',
    ...overrides,
  } as unknown as Stripe.Product);

const buildStripePrice = (overrides: Partial<Stripe.Price> = {}): Stripe.Price =>
  ({
    id: 'price_real',
    object: 'price',
    unit_amount: 29900,
    currency: 'usd',
    ...overrides,
  } as unknown as Stripe.Price);

describe('buildDisplayProduct cross-check', () => {
  it('throws when the DB row points at a different Stripe product', () => {
    // This is the guard that stops a client-supplied/stale price from being
    // paired with the wrong DB product at checkout.
    expect(() =>
      buildDisplayProduct(
        buildDbProduct({ stripeProductId: 'prod_expensive' }),
        buildStripeProduct({ id: 'prod_cheap' }),
        buildStripePrice(),
      ),
    ).toThrow('Products do not match');
  });

  it('throws when the DB row points at a different Stripe price', () => {
    expect(() =>
      buildDisplayProduct(
        buildDbProduct({ stripePriceId: 'price_299' }),
        buildStripeProduct(),
        buildStripePrice({ id: 'price_1' }),
      ),
    ).toThrow('Prices do not match');
  });

  it('checks the product before the price', () => {
    expect(() =>
      buildDisplayProduct(
        buildDbProduct(),
        buildStripeProduct({ id: 'prod_other' }),
        buildStripePrice({ id: 'price_other' }),
      ),
    ).toThrow('Products do not match');
  });

  it('rejects a near-miss id rather than matching loosely', () => {
    expect(() =>
      buildDisplayProduct(
        buildDbProduct({ stripeProductId: 'prod_real' }),
        buildStripeProduct({ id: 'prod_real ' }),
        buildStripePrice(),
      ),
    ).toThrow('Products do not match');
  });

  it('throws when the DB ids are empty but Stripe ids are present', () => {
    expect(() =>
      buildDisplayProduct(
        buildDbProduct({ stripeProductId: '' }),
        buildStripeProduct(),
        buildStripePrice(),
      ),
    ).toThrow('Products do not match');
  });

  it('throws when only the DB price id is empty', () => {
    expect(() =>
      buildDisplayProduct(
        buildDbProduct({ stripePriceId: '' }),
        buildStripeProduct(),
        buildStripePrice(),
      ),
    ).toThrow('Prices do not match');
  });

  // HOLE IN THE GUARD: the cross-check is a strict `!==`, so two *absent* ids
  // compare equal and the row sails through. A DB row with a null stripePriceId
  // paired with a Stripe object that has no id would be "verified" and then
  // priced from that same empty object. Nothing here throws today; the guard
  // should assert both ids are present before comparing them.
  it('does NOT throw when both sides are missing their ids', () => {
    expect(() =>
      buildDisplayProduct(
        buildDbProduct({ stripeProductId: null, stripePriceId: null } as any),
        buildStripeProduct({ id: null } as any),
        buildStripePrice({ id: null } as any),
      ),
    ).not.toThrow();
  });
});

describe('buildDisplayProduct mapping', () => {
  it('maps every field when the DB row and Stripe objects agree', () => {
    const result = buildDisplayProduct(
      buildDbProduct({
        associatedProduct: { id: 'assoc-1', type: 'FULL_COURSE' } as DbProduct['associatedProduct'],
      }),
      buildStripeProduct(),
      buildStripePrice(),
    );

    expect(result).toEqual({
      id: 'db-product-1',
      associatedProductId: 'assoc-1',
      type: SaleType.FullCourse,
      productType: 'FULL_COURSE',
      productAccessDays: 365,
      stripeProductId: 'prod_real',
      stripePriceId: 'price_real',
      name: 'Skilled.dev Course',
      price: 299,
      planDescription: 'Everything you need to pass the interview',
      lengthDescription: 'Lifetime access',
      isAdditionalSupportPrice: false,
    });
  });

  it('takes the price from the Stripe price object, and ignores any price on the DB row', () => {
    // `price` is not part of the products selection set, but the checkout API
    // hands the whole DisplayProduct to Stripe as session metadata and the
    // webhook records `price` from it, so a stray column must not win.
    const result = buildDisplayProduct(
      buildDbProduct({ price: 1 } as any),
      buildStripeProduct(),
      buildStripePrice({ unit_amount: 4900 }),
    );

    expect(result.price).toBe(49);
  });

  it('returns only the fields the checkout metadata expects, with no DB columns spread in', () => {
    // Everything returned here is serialised into the Stripe session metadata,
    // which handleCompletedCheckout then trusts. Extra columns leaking through
    // (status, timestamps, a stale price) would silently widen that payload.
    const result = buildDisplayProduct(
      buildDbProduct({ secretInternalColumn: 'do-not-leak' } as any),
      buildStripeProduct(),
      buildStripePrice(),
    );

    expect(Object.keys(result).sort()).toEqual([
      'associatedProductId',
      'id',
      'isAdditionalSupportPrice',
      'lengthDescription',
      'name',
      'planDescription',
      'price',
      'productAccessDays',
      'productType',
      'stripePriceId',
      'stripeProductId',
      'type',
    ]);
  });

  it('falls back to the Stripe name/description when the DB display fields are empty', () => {
    const result = buildDisplayProduct(
      buildDbProduct({ displayTitle: '', displayDescription: null }),
      buildStripeProduct(),
      buildStripePrice(),
    );

    expect(result.name).toBe('Stripe Course Name');
    expect(result.planDescription).toBe('Stripe description');
  });

  it('nulls the optional fields when neither source has a value', () => {
    const result = buildDisplayProduct(
      buildDbProduct({ displayDescription: null, displayLengthDescription: null }),
      buildStripeProduct({ description: null }),
      buildStripePrice(),
    );

    expect(result.planDescription).toBeNull();
    expect(result.lengthDescription).toBeNull();
    expect(result.associatedProductId).toBeNull();
    expect(result.productType).toBeNull();
  });

  it('coerces a missing isAdditionalSupportPrice to false', () => {
    expect(
      buildDisplayProduct(
        buildDbProduct({ isAdditionalSupportPrice: undefined }),
        buildStripeProduct(),
        buildStripePrice(),
      ).isAdditionalSupportPrice,
    ).toBe(false);

    expect(
      buildDisplayProduct(
        buildDbProduct({ isAdditionalSupportPrice: null } as any),
        buildStripeProduct(),
        buildStripePrice(),
      ).isAdditionalSupportPrice,
    ).toBe(false);

    expect(
      buildDisplayProduct(
        buildDbProduct({ isAdditionalSupportPrice: true }),
        buildStripeProduct(),
        buildStripePrice(),
      ).isAdditionalSupportPrice,
    ).toBe(true);
  });

  // BUG: a Stripe price with no unit_amount (tiered/metered pricing, or a
  // misconfigured price) silently becomes a $0 product instead of throwing.
  // Server-side checkout would then present/charge a free product.
  it('turns a null Stripe unit_amount into a $0 price instead of throwing', () => {
    const result = buildDisplayProduct(
      buildDbProduct(),
      buildStripeProduct(),
      buildStripePrice({ unit_amount: null }),
    );

    expect(result.price).toBe(0);
  });
});
