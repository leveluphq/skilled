import * as React from 'react';
import { useRouter } from 'next/router';
import { Container } from 'style/elements';
import { PageRoot } from 'utils/constants/routes';

import {
  SubscriptionSuccessWrapper,
  SuccessText,
  SuccessTitleWrapper,
  CloseButton,
} from '../styles';

const SubscriptionSuccess = () => {
  const router = useRouter();
  const didSubscribeSuccessfully = router.query.subscribed === 'true';

  if (!didSubscribeSuccessfully) {
    return null;
  }

  return (
    <SubscriptionSuccessWrapper>
      <Container>
        <SuccessTitleWrapper>
          <h2>Success! 🎉 🤓</h2>
          <CloseButton
            aria-label="Close banner"
            onClick={() =>
              router.push(`/${PageRoot.Course}`, `/${PageRoot.Course}`, { shallow: true })
            }
          >
            &times;
          </CloseButton>
        </SuccessTitleWrapper>
        <SuccessText>
          You now have full access to the course. Start with the first lesson below and by the time
          you finish, you will be ready to ace your coding interviews. We will track your progress
          and help you focus on the areas that are the most challenging for you so that you are
          ready for anything.
        </SuccessText>
        <SuccessText>
          If you ever need any help,{' '}
          <b style={{ textDecoration: 'underline' }}>email hey@skilled.dev</b>
        </SuccessText>
      </Container>
    </SubscriptionSuccessWrapper>
  );
};

export default SubscriptionSuccess;
