export const TEST_SHOW_ALL_CONTENT = false;
export const IS_FULL_COURSE_FREE = true;
export const IS_LIFETIME_ACCESS = true;
// OPEN_ALL_LESSONS=true opens every lesson to everyone, logged in or not, so a
// copy of the app needs no OAuth app to read the course. .env.example turns it
// on; the website leaves it off, so its lessons still need an account.
export const OPEN_ALL_LESSONS = process.env.OPEN_ALL_LESSONS === 'true';

export enum SaleStatus {
  Unpaid = 'UNPAID',
  Paid = 'PAID',
  Refund = 'REFUND',
}

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Fail = 'FAIL',
  Refund = 'REFUND',
}

export enum PaymentProcessor {
  Stripe = 'STRIPE',
  Paypal = 'PAYPAL',
  Credit = 'CREDIT',
}

export enum DiscountType {
  Percent = 'PERCENT',
  Dollar = 'DOLLAR',
  FixedPrice = 'FIXED_PRICE',
}

export enum SaleType {
  FullCourse = 'FULL_COURSE',
  GiftCard = 'GIFT_CARD',
  Cart = 'CART',
}

export enum ProductStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Archived = 'ARCHIVED',
  DELETED = 'DELETED',
}

export const redirectUrls: Record<SaleType, { success_url: string; cancel_url: string }> = {
  [SaleType.FullCourse]: {
    success_url: `${process.env.ROOT_URL}/course?subscribed=true`,
    cancel_url: `${process.env.ROOT_URL}/pricing?subscribed=false`,
  },
  [SaleType.GiftCard]: {
    success_url: `${process.env.ROOT_URL}/my/settings`,
    cancel_url: `${process.env.ROOT_URL}/pricing?subscribed=false`,
  },
  [SaleType.Cart]: {
    success_url: `${process.env.ROOT_URL}/course?subscribed=true`,
    cancel_url: `${process.env.ROOT_URL}/pricing?subscribed=false`,
  },
};
