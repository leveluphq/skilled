import * as React from 'react';
import { useRouter } from 'next/router';
import { PageRoot } from 'utils/constants/routes';
import useStripe from 'components/hooks/useStripe';
import { getStripeSession } from 'services/client/stripe';
import Sentry from 'utils/shared/sentry';
import navigateTo from 'utils/client/navigateTo';
import { Props } from './props';

const redirectToPricingPage = () => {
  if (typeof window !== 'undefined') {
    navigateTo(`/${PageRoot.Pricing}`);
  }
};

const CheckoutPage: React.FC<Props> = ({ loading, data, error, products }) => {
  const [isCreatingSession, setIsCreatingSession] = React.useState(false);
  const router = useRouter();
  const stripe = useStripe({});
  const query = router.query;
  const productId = query.product;
  React.useEffect(() => {
    const createSession = async () => {
      if (!isCreatingSession && data && productId && stripe) {
        setIsCreatingSession(true);
        const product = products.find((p) => p.stripePriceId === productId);

        if (!product) {
          redirectToPricingPage();
          return;
        }

        try {
          const stripeSession = await getStripeSession(product);

          await stripe.redirectToCheckout({
            sessionId: stripeSession.id,
          });
        } catch (error) {
          Sentry.withScope((_scope) => {
            Sentry.captureException(error);
          });

          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          alert(`Error: ${errorMessage}`);
        } finally {
          setIsCreatingSession(false);
        }
      }
    };
    createSession();
  }, [loading, data, error, productId, isCreatingSession, stripe]);

  if ((!loading && !data) || error) {
    redirectToPricingPage();
    return <div></div>;
  }

  return <div></div>;
};

export default CheckoutPage;
