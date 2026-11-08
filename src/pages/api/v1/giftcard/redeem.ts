import { NextApiRequest, NextApiResponse } from 'next';
import getEndDate from 'utils/shared/time/getEndDate';
import getViewerById from 'services/server/graphql/queries/getViewerById';
import getGiftCardByCode from 'services/server/graphql/queries/getGiftCardByCode';
import redeemCourseAccessGiftCard from 'services/server/graphql/mutations/redeemCourseAccessGiftCard';
import { UpgradeEventType } from 'utils/constants/upgradeLog';
import { HttpMethods } from 'utils/constants/http';
import { GiftCardStatus } from 'utils/constants/giftCards';
import { createErrorObject } from 'utils/server/http';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  const { method, body } = req;

  if (method !== HttpMethods.Post) {
    res.setHeader('Allow', [HttpMethods.Get]);
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  try {
    const viewer = await getViewerById(req);

    if (!viewer) {
      return res.status(401).send(
        createErrorObject({
          message: 'You must be logged in to apply a gift card',
          statusCode: 401,
        }),
      );
    }

    const giftCard = await getGiftCardByCode(body.code);

    if (!giftCard) {
      return res.status(404).send(
        createErrorObject({
          message: 'Gift card not found',
          statusCode: 404,
        }),
      );
    }

    if (giftCard.status === GiftCardStatus.Unpaid) {
      return res.status(400).send(
        createErrorObject({
          message:
            'This gift card was never issued. If you think this is an issue, email hey@skilled.dev',
          statusCode: 400,
        }),
      );
    }

    if (giftCard.status === GiftCardStatus.Redeemed) {
      return res.status(400).send(
        createErrorObject({
          message:
            'This gift card has already been redeemed. If you think this is an issue, email hey@skilled.dev',
          statusCode: 400,
        }),
      );
    }

    if (giftCard.status === GiftCardStatus.Inactive) {
      return res.status(400).send(
        createErrorObject({
          message:
            'This gift card is no longer active. If you think this is an issue, email hey@skilled.dev',
          statusCode: 400,
        }),
      );
    }

    if (giftCard.status === GiftCardStatus.Issued) {
      if (!giftCard.productAccessDays) {
        throw new Error('Gift card did not specify days');
      }

      const product = giftCard.product;

      const endDate = getEndDate(giftCard.productAccessDays, viewer.fullCourseAccessEndsAt);
      const endsAt = endDate.toISOString();
      const now = new Date().toISOString();

      await redeemCourseAccessGiftCard({
        userId: viewer.id,
        giftCardId: giftCard.id,
        redeemedAt: now,
        fullCourseAccessEndsAt: endsAt,
        fullCourseAccessFirstUpgradedAt: viewer.fullCourseAccessFirstUpgradedAt || now,
        fullCourseAccessLatestUpgradedAt: now,
        upgradeType: UpgradeEventType.Upgrade,
        saleId: giftCard.saleId,
        productType: giftCard.productType,
        productName: giftCard.productName,
        productDescription: giftCard.productDescription,
        productAccessDays: giftCard.productAccessDays,
        detailsObject: product,
        giftCardStatus: GiftCardStatus.Redeemed,
      });

      return res.status(200).json({ sucess: true });
    } else {
      throw new Error('Gift card status not valid');
    }
  } catch (error) {
    console.log('--- ERROR = ', error);
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });

    return res.status(500).send(
      createErrorObject({
        message: 'There was an internal error',
        statusCode: 500,
      }),
    );
  }
};

export default handler;
