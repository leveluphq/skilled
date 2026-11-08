import { NextPage } from 'next';
import Router from 'next/router';
import withApollo from 'utils/client/withApollo';
import { getAffiliateId } from 'utils/shared/affiliate';
import {
  getDestinationPagePath,
  getIpAddress,
  getReferralUrl,
  setAffiliateCookie,
} from 'utils/server/http';
import getUserByAffiliateId from 'services/server/graphql/queries/getUserByAffiliateId';
import insertAffiliateLinkClick from 'services/server/graphql/mutations/insertAffiliateLinkClick';

const AffiliateRedirect: NextPage = () => {
  return null;
};

AffiliateRedirect.getInitialProps = async ({ req, res, query }) => {
  if (res && req) {
    const { affiliateId, dest } = query;
    const destinationPagePath = getDestinationPagePath(dest);

    if (!affiliateId) {
      // TODO: do something and leave this early
      res.writeHead(302, {
        Location: destinationPagePath,
      });

      res.end();

      return;
    }

    const affiliateIdUsed = getAffiliateId(affiliateId);

    setAffiliateCookie(res, affiliateIdUsed);

    try {
      let affiliateUserId = null;
      const ip = getIpAddress(req);
      const referralUrl = getReferralUrl(req);
      const user = await getUserByAffiliateId(affiliateIdUsed);

      if (user) {
        affiliateUserId = user.id;
      }

      await insertAffiliateLinkClick({
        affiliateIdUsed,
        ip,
        referralUrl,
        affiliateUserId,
        destinationPagePath,
      });
    } catch (error) {
      // TODO: Log error in sentry with information we do know
      console.log('--- ERROR = ', error);
    } finally {
      res.writeHead(302, {
        Location: destinationPagePath,
      });

      res.end();

      return;
    }
  } else {
    Router.push('/');
  }
  return {};
};

export default withApollo(AffiliateRedirect);
