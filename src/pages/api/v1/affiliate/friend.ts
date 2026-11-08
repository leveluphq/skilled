import { NextApiRequest, NextApiResponse } from 'next';
// import { getValidViewerId } from 'utils/server/jwt';
import { getIpAddress, setAffiliateCookie, setAffiliateReferralIdCookie } from 'utils/server/http';
import getUserByAffiliateId from 'services/server/graphql/queries/getUserByAffiliateId';
import insertAffiliateLinkClick from 'services/server/graphql/mutations/insertAffiliateLinkClick';
import { HttpMethods } from 'utils/constants/http';
import { createErrorObject } from 'utils/server/http';
import Sentry, { configureReq } from 'utils/shared/sentry';
import { applySecurityHeaders } from 'services/server/security/headers';

interface Body {
  affiliateId: string;
  destinationPagePath: string;
  referralUrl: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  applySecurityHeaders(res);
  configureReq(req);

  const { method } = req;
  const body = req.body as Body;

  if (method !== HttpMethods.Post) {
    res.setHeader('Allow', [HttpMethods.Post]);
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  if (!body || !body.affiliateId) {
    res.status(400).end('Did not receive an affiliate ID');
    return;
  }

  try {
    let affiliateUserId = null;
    const { affiliateId, destinationPagePath = '', referralUrl = '' } = body;
    const ip = getIpAddress(req);
    const affiliateUser = await getUserByAffiliateId(affiliateId);

    // TODO: Should I also track an affiliate click if the user is logged in?
    // Presumably it's for new users
    // const currentUser = getValidViewerId(req);

    if (affiliateUser) {
      affiliateUserId = affiliateUser.id;
    }

    const referralClick = await insertAffiliateLinkClick({
      affiliateIdUsed: affiliateId,
      ip,
      referralUrl,
      affiliateUserId,
      destinationPagePath,
    });
    const clickId = referralClick.insert_affiliate_link_clicks_one?.id;

    setAffiliateCookie(res, affiliateId);
    setAffiliateReferralIdCookie(res, clickId);

    return res.status(200).json({ success: true });
  } catch (error) {
    // TODO: Log error in sentry with information we do know
    console.log('--- ERROR = ', error);
    Sentry.withScope((_scope) => {
      Sentry.captureException(error);
    });

    return res
      .status(500)
      .send(createErrorObject({ message: 'There was an internal error', statusCode: 500 }));
  }
};

export default handler;
