import { useState, useEffect } from 'react';
import noop from 'utils/shared/noop';

interface UseStripeParams {
  onLoad?: (stripe?: stripe.Stripe) => void;
  onError?: () => void;
}

const useStripe = ({ onLoad = noop, onError = noop }: UseStripeParams) => {
  const [stripe, setStripe] = useState<stripe.Stripe>();

  useEffect(() => {
    // A site without Stripe has nothing for sale, and Stripe() throws without
    // a key, so there's nothing to load
    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    document.getElementsByTagName('head')[0].appendChild(script);

    script.onload = () => {
      setStripe(Stripe(process.env.STRIPE_PUBLISHABLE_KEY!, {}));
      onLoad(stripe);
    };
    script.onerror = onError;
  }, []);

  return stripe;
};

export default useStripe;
