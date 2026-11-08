import { NextApiRequest, NextApiResponse } from 'next';
import stripe from 'services/server/stripe/instance';
import buildDisplayProduct, { DisplayProduct } from 'utils/shared/products/buildDisplayProduct';
import { SaleType, SaleStatus, PaymentProcessor, redirectUrls } from 'utils/constants/payments';
import { GiftCardStatus, GiftCardSource } from 'utils/constants/giftCards';
import getViewerById from 'services/server/graphql/queries/getViewerById';
import getActiveProductById from 'services/server/graphql/queries/getActiveProductById';
import getAffiliateUserAndClick from 'services/server/graphql/queries/getAffiliateUserAndClick';
import insertUnpaidSale from 'services/server/graphql/mutations/insertUnpaidSale';
import insertUnpaidSaleWithGiftCard from 'services/server/graphql/mutations/insertUnpaidSaleWithGiftCard';
import updateStripeCustomerId from 'services/server/graphql/mutations/updateStripeCustomerId';
import { HttpMethods } from 'utils/constants/http';
import {
  createErrorObject,
  getAffiliateCookie,
  getAffiliateReferralIdCookie,
} from 'utils/server/http';
import {
  sendTransactionalEmailFromTemplate,
  TemplateTag,
} from 'services/server/email/transactional';
import { getAffiliateRevenueEarned } from 'utils/shared/affiliate';
import { GetViewerByIdQuery } from 'types/generated/server';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

/**
 * Rebuild the product from authoritative sources given only its id.
 *
 * The caller supplies an id and nothing else. Every field that determines what is
 * charged (`stripePriceId`), what is recorded (`price`, `purchasedProductId`), and
 * what is granted (`productAccessDays`, `type`) is read from the database and
 * Stripe here. `buildDisplayProduct` additionally cross-checks that the DB row and
 * the Stripe objects refer to each other, and throws if they disagree.
 */
const resolveProduct = async (productId: string): Promise<DisplayProduct | null> => {
  const dbProduct = await getActiveProductById(productId);

  if (!dbProduct) {
    return null;
  }

  const [stripeProduct, stripePrice] = await Promise.all([
    stripe.products.retrieve(dbProduct.stripeProductId),
    stripe.prices.retrieve(dbProduct.stripePriceId),
  ]);

  return buildDisplayProduct(dbProduct, stripeProduct, stripePrice);
};

const createCheckoutSession = async (
  viewer: GetViewerByIdQuery['users_by_pk'],
  product: DisplayProduct,
) => {
  if (!viewer) {
    return null;
  }

  const customerDetails = viewer.stripeCustomerId
    ? { customer: viewer.stripeCustomerId }
    : { customer_email: viewer.email };

  const session = await stripe.checkout.sessions.create({
    ...customerDetails,
    payment_method_types: ['card'],
    line_items: [{ quantity: 1, price: product.stripePriceId }],
    payment_intent_data: {
      capture_method: 'automatic',
    },
    mode: 'payment',
    allow_promotion_codes: true,
    ...redirectUrls[product.type],
    metadata: { ...product, isAdditionalSupportPrice: String(product.isAdditionalSupportPrice) },
  });

  return session;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  switch (req.method) {
    case HttpMethods.Post: {
      try {
        const viewer = await getViewerById(req);

        if (!viewer) {
          return res.status(401).send(
            createErrorObject({
              message: 'Could not find valid user from session',
              statusCode: 401,
            }),
          );
        }

        // Only the id is taken from the request. Older clients post the whole
        // product object; its id is read and the rest of it is discarded.
        const productId: unknown = req.body.productId ?? req.body.product?.id;

        if (typeof productId !== 'string' || !productId) {
          return res.status(400).send(
            createErrorObject({
              message: 'Did not receive a valid product',
              statusCode: 400,
            }),
          );
        }

        const product = await resolveProduct(productId);

        if (!product) {
          return res.status(400).send(
            createErrorObject({
              message: 'Did not receive a valid product',
              statusCode: 400,
            }),
          );
        }

        const session = await createCheckoutSession(viewer, product);

        if (!session) {
          return res.status(401).send(
            createErrorObject({
              message: 'Could not create checkout session',
              statusCode: 401,
            }),
          );
        }

        let customerId = viewer.stripeCustomerId || '';
        if (!viewer.stripeCustomerId) {
          if (typeof session.customer === 'string') {
            customerId = session.customer;
          } else {
            customerId = session.customer?.id || '';
          }

          try {
            await updateStripeCustomerId({ id: viewer.id, stripeCustomerId: customerId });
          } catch (error) {
            Sentry.withScope((_scope) => {
              Sentry.captureException(error);
            });
          }
        }

        const affiliateId = getAffiliateCookie(req);
        const affiliateReferralId = getAffiliateReferralIdCookie(req);
        let affiliateDetails:
          | {
              affiliateLinkClickId: string;
              affiliateUserId: string;
              affiliatePayoutStatus: string;
              affiliateAmountEarned: number;
            }
          | undefined;

        try {
          if (affiliateId && affiliateReferralId) {
            const affiliateResponse = await getAffiliateUserAndClick({
              affiliateId,
              clickId: affiliateReferralId,
            });
            const affiliateUser = affiliateResponse.users[0];
            const affiliateLinkClickId = affiliateResponse.affiliate_link_clicks_by_pk?.id;

            if (affiliateUser && affiliateUser?.id && affiliateLinkClickId) {
              const affiliateUserId = affiliateUser?.id;
              const affiliateAmountEarned = getAffiliateRevenueEarned(
                product.price,
                affiliateUser?.affiliateRevenueShare,
              );
              affiliateDetails = {
                affiliateLinkClickId,
                affiliateUserId,
                affiliateAmountEarned,
                affiliatePayoutStatus: SaleStatus.Unpaid,
              };
            } else {
              throw new Error('Could not find all affiliate details');
            }
          }
        } catch (error) {
          // Some issue with affiliate...
          // Still allow transaction to complete
          Sentry.withScope((_scope) => {
            Sentry.captureException(error);
          });
        }

        try {
          sendTransactionalEmailFromTemplate(
            process.env.INTERNAL_NOTIFICATION_EMAIL!,
            TemplateTag.CheckoutSessionCreated,
            {
              userId: viewer.id,
              email: viewer.email,
              price: product.price,
              affiliateId,
              affiliateReferralId,
            },
          );
        } catch (error) {
          // Silently fail...
          Sentry.withScope((_scope) => {
            Sentry.captureException(error);
          });
        }

        // SET THESE ID'S BASED ON THE RESULT OR NULL

        if (product.type === SaleType.FullCourse) {
          await insertUnpaidSale({
            type: product.type,
            stripeSessionId: session.id,
            status: SaleStatus.Unpaid,
            paymentProcessor: PaymentProcessor.Stripe,
            payingUserId: viewer.id,
            originalPrice: product.price,
            stripePaymentStatus: session.payment_status,
            stripeCustomerId: customerId,
            stripeProductId: product.stripeProductId,
            stripePriceId: product.stripePriceId,
            purchasedProductId: product.id,
            ...affiliateDetails,
          });
        } else if (product.type === SaleType.GiftCard) {
          await insertUnpaidSaleWithGiftCard({
            saleType: product.type,
            stripeSessionId: session.id,
            saleStatus: SaleStatus.Unpaid,
            paymentProcessor: PaymentProcessor.Stripe,
            payingUserId: viewer.id,
            originalPrice: product.price,
            stripePaymentStatus: session.payment_status,
            stripeCustomerId: customerId,
            stripeProductId: product.stripeProductId,
            stripePriceId: product.stripePriceId,
            giftCardStatus: GiftCardStatus.Unpaid,
            productAccessDays: product.productAccessDays,
            productDescription: product.planDescription,
            productName: product.name,
            productType: product.productType || '',
            senderEmail: viewer.email,
            giftCardType: product.productType || '',
            giftCardSource: GiftCardSource.Sale,
            purchasedProductId: product.id,
            ...affiliateDetails,
          });
        }

        return res.status(200).json(session);
      } catch (error) {
        Sentry.withScope((_scope) => {
          Sentry.captureException(error);
        });

        return res.status(500).send(
          createErrorObject({
            message: 'There was an error communicating with Stripe',
            statusCode: 500,
          }),
        );
      }
    }
    default:
      res.setHeader('Allow', [HttpMethods.Post]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
