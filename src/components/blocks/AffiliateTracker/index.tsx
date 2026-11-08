import * as React from 'react';
import { useRouter } from 'next/router';
import { getAffiliateId } from 'utils/shared/affiliate';
import api from 'services/client/api';

const AffiliateTracker: React.FC = ({ children }) => {
  const [hasCheckedAffiliate, setHasCheckedAffiliate] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (router.query.friend && !hasCheckedAffiliate) {
      setHasCheckedAffiliate(true);

      const { friend } = router.query;
      const affiliateId = getAffiliateId(friend);
      const destinationPagePath = router.pathname;
      const referralUrl = document.referrer;

      if (affiliateId) {
        try {
          api.post('affiliate/friend', {
            payload: { destinationPagePath, affiliateId, referralUrl },
          });
        } catch (_error) {
          // Error should have been reported on the server...
        }
      }
    }
  }, [router.query.friend, hasCheckedAffiliate]);

  return <>{children}</>;
};

export default AffiliateTracker;
