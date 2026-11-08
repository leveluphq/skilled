import Stripe from 'stripe';
import { GiftCardStatus } from 'utils/constants/giftCards';
import stripe from 'services/server/stripe/instance';
import { UpgradeEventType } from 'utils/constants/upgradeLog';
import updateCompletedSaleCourse from 'services/server/graphql/mutations/updateCompletedSaleCourse';
import updateCompletedSaleGiftCard from 'services/server/graphql/mutations/updateCompletedSaleGiftCard';
import getSaleByStripeSessionId from 'services/server/graphql/queries/getSaleByStripeSessionId';
import centsToDollars from 'utils/shared/payments/centsToDollars';
import { SaleStatus, SaleType, IS_LIFETIME_ACCESS } from 'utils/constants/payments';
import getEndDate from 'utils/shared/time/getEndDate';
import { subscribeToList, ListTag } from 'services/server/email/contacts';
import Sentry from 'utils/shared/sentry';
import { getAffiliateRevenueEarned } from 'utils/shared/affiliate';
import {
  sendTransactionalEmailFromTemplate,
  TemplateTag,
} from 'services/server/email/transactional';

const PRODUCT_ACCESS_LIFETIME_DAYS = 365 * 100;

const handleCompletedCheckout = async (event: Stripe.Event) => {
  const session = event.data.object as Stripe.Checkout.Session;

  if (!session) {
    throw new Error('Not a valid checkout session');
  }

  const sale = await getSaleByStripeSessionId(session.id);

  if (!sale) {
    throw new Error('Could not find sale that matched session');
  }

  try {
    sendTransactionalEmailFromTemplate(process.env.INTERNAL_NOTIFICATION_EMAIL!, TemplateTag.CheckoutComplete, {
      userId: sale.payingUser.id,
      email: sale.payingUser.email,
      type: sale.type,
      saleId: sale.id,
      amountPaid: centsToDollars(session.amount_total),
    });
  } catch (error) {
    // Silently fail...
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });
  }

  const amountPaid = centsToDollars(session.amount_total);
  const storedAffiliatePayout = sale.affiliateAmountEarned;
  let affiliateAmountEarned = storedAffiliatePayout;

  if (sale.affiliateUser) {
    const finalAmountEarned = getAffiliateRevenueEarned(
      amountPaid,
      sale.affiliateUser.affiliateRevenueShare,
    );
    affiliateAmountEarned = finalAmountEarned;
  }

  if (sale.type === SaleType.FullCourse) {
    // TODO: Make this more robust. Store products in the database so I'm not finding in hardcoded values.
    const product = sale.product;

    if (!product) {
      throw new Error('Could not find matching product');
    }

    const stripeProduct = await stripe.products.retrieve(product.stripeProductId);

    const endDate = getEndDate(
      IS_LIFETIME_ACCESS ? PRODUCT_ACCESS_LIFETIME_DAYS : product.productAccessDays,
      sale.payingUser.fullCourseAccessEndsAt,
    );
    const endsAt = endDate.toISOString();
    const now = new Date().toISOString();

    await updateCompletedSaleCourse({
      userId: sale.payingUser.id,
      fullCourseAccessEndsAt: endsAt,
      fullCourseAccessFirstUpgradedAt: sale.payingUser.fullCourseAccessFirstUpgradedAt || now,
      fullCourseAccessLatestUpgradedAt: now,
      upgradeType: UpgradeEventType.Upgrade,
      saleId: sale.id,
      productType: product.type,
      productName: product.displayTitle || stripeProduct.name,
      productDescription: product.displayLengthDescription || stripeProduct.description || '',
      productAccessDays: product.productAccessDays,
      upgradeDetailsObject: product,
      amountPaid,
      saleStatus: SaleStatus.Paid,
      stripeCustomerId: (session.customer as string) || sale.stripeCustomerId,
      stripeCustomerEmail: session.customer_email || sale.stripeCustomerEmail,
      stripePaymentStatus: session.payment_status,
      transactionObject: event,
      affiliateAmountEarned,
    });
  } else if (sale.type === SaleType.GiftCard) {
    await updateCompletedSaleGiftCard({
      saleId: sale.id,
      amountPaid,
      saleStatus: SaleStatus.Paid,
      stripeCustomerId: (session.customer as string) || sale.stripeCustomerId,
      stripeCustomerEmail: session.customer_email || sale.stripeCustomerEmail,
      stripePaymentStatus: session.payment_status,
      transactionObject: event,
      giftCardStatus: GiftCardStatus.Issued,
      affiliateAmountEarned,
    });
  } else {
    throw new Error('Type of sale not matched');
  }

  try {
    const INCLUDE_IN_ALL_USERS_LIST = true;
    await subscribeToList(sale.payingUser.email, ListTag.PayingUsers, INCLUDE_IN_ALL_USERS_LIST);
  } catch (error) {
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });
  }

  return;
};

export default handleCompletedCheckout;
