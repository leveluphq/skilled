import * as React from 'react';
import { ArrowRight20 } from '@carbon/icons-react';
import LogoSvg from 'svg/Logo';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import Head from 'components/blocks/Head';
import GradientBorder from 'components/blocks/GradientBorder';
import AuthModal from 'components/blocks/Modal/AuthModal';
import useStripe from 'components/hooks/useStripe';
import { SaleType } from 'utils/constants/payments';
import { getHasSubscription } from 'utils/client/lesson';
import { IS_LIFETIME_ACCESS } from 'utils/constants/payments';
import Sentry from 'utils/shared/sentry';
import { getStripeSession } from 'services/client/stripe';
// import DiscountTimer from './DiscountTimer';
import { Props, CardProps } from './props';

import {
  ExistingSubBanner,
  Container,
  Logo,
  Title,
  // Subtitle,
  PurchaseWrapper,
  Card,
  CardContent,
  PriceWrapper,
  CurrencyName,
  Price,
  PurchaseButtonWrapper,
  PurchaseButton,
  DescriptionText,
  StripeImage,
  TitleBorder,
  FeaturesWrapper,
  FeaturesTitle,
  FeaturesList,
  FeaturesItem,
  GiftCardWrapper,
  GiftCardTitle,
  GiftCardDescription,
  BuyGiftCardWrapper,
  BuyGiftCardContent,
  GiftCardWhyToBuy,
  GiftCardWhyToBuyTitle,
  GiftCardWhyToBuyDescription,
  GiftCardPurchaseButtonWrapper,
  GiftCardPurchaseButton,
  GiftCardPriceContainer,
  CardColumnWrapper,
  ParityText,
  ConfidenceWrapper,
  ConfidenceSubtitle,
  ConfidenceDescription,
  ConfidenceList,
} from './styles';

export const GIFT_CARD_ID = 'gift-card-checkout';

const CheckoutCard: React.FC<CardProps> = ({ price, isDisabled, onClickBuy }) => {
  return (
    <Card>
      <CardContent>
        <TitleBorder>
          <GradientBorder>
            {IS_LIFETIME_ACCESS ? 'LIFETIME FULL COURSE ACCESS' : '1 YEAR FULL COURSE ACCESS'}
          </GradientBorder>
        </TitleBorder>
        <PriceWrapper>
          <CurrencyName>$</CurrencyName>
          <Price>{price}</Price>
        </PriceWrapper>
        <DescriptionText>
          {IS_LIFETIME_ACCESS ? 'Lifetime' : '1 year'} access, no subscription to cancel
        </DescriptionText>
        <PurchaseButtonWrapper>
          <PurchaseButton disabled={isDisabled} onClick={onClickBuy}>
            <span style={{ marginRight: '12px' }}>Upgrade Now</span> <ArrowRight20 />
          </PurchaseButton>
        </PurchaseButtonWrapper>
        <FeaturesWrapper>
          <FeaturesTitle>Pro Features</FeaturesTitle>
          <FeaturesList>
            <FeaturesItem>Full access to every lesson</FeaturesItem>
            <FeaturesItem>In-depth video walkthroughs for each lesson</FeaturesItem>
            <FeaturesItem>Guided articles for each lesson</FeaturesItem>
            <FeaturesItem>Code environment to test your solutions</FeaturesItem>
            <FeaturesItem>Detailed Big O complexity analysis</FeaturesItem>
            <FeaturesItem>Learn the core data structures and algorithms</FeaturesItem>
            <FeaturesItem>No annoying subscriptions to cancel</FeaturesItem>
            <FeaturesItem>Ongoing access to all updates and new interview questions</FeaturesItem>
          </FeaturesList>
        </FeaturesWrapper>
      </CardContent>
    </Card>
  );
};

const PricingPage: React.FC<Props> = ({ data, loading, products }) => {
  const full = products.find((p) => p.type === SaleType.FullCourse && !p.isAdditionalSupportPrice);
  const additionalSupport = products.find(
    (p) => p.type === SaleType.FullCourse && p.isAdditionalSupportPrice,
  );
  const giftCard = products.find((p) => p.type === SaleType.GiftCard);
  const viewer = data?.users_by_pk;
  const hasSubscription = getHasSubscription(viewer);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = React.useState(false);
  const [activeProduct, setActiveProduct] = React.useState('');
  const stripe = useStripe({});
  const stripeRedirect = React.useCallback(
    async (product: Props['products'][0]) => {
      if (stripe && viewer) {
        setIsCreatingCheckout(true);

        try {
          // TODO: This contains the error if it doesn't redirect
          const stripeSession = await getStripeSession(product);

          await stripe.redirectToCheckout({
            sessionId: stripeSession.id,
          });
        } catch (error) {
          Sentry.withScope((_scope) => {
            Sentry.captureException(error);
          });

          // @ts-ignore
          alert(`Error: ${error.message}`);
        } finally {
          setIsCreatingCheckout(false);
        }
      } else if (!viewer) {
        setActiveProduct(product.stripePriceId);
        setIsModalOpen(true);
      }
    },
    [stripe, viewer],
  );

  // A site without its Stripe products, like a fresh local setup, has nothing to sell
  if (!full || !additionalSupport || !giftCard) {
    return (
      <PageLayoutDefault hideNav hideFooter hideSkipToContent>
        <Head title="Pricing" />
        <Container>
          <Logo>
            <LogoSvg />
          </Logo>
          <Title>Nothing for sale here</Title>
          <GiftCardDescription>
            This site has no products set up, so there's nothing to buy here.
          </GiftCardDescription>
        </Container>
      </PageLayoutDefault>
    );
  }

  return (
    <>
      <PageLayoutDefault hideNav hideFooter hideSkipToContent>
        <Head title="Pricing - Get the full course to the master coding interview" />

        {hasSubscription && (
          <ExistingSubBanner>
            <Container style={{ padding: '16px' }}>
              <div style={{ marginBottom: '6px', fontSize: '20px' }}>
                <strong>You already have a subscription! 🙌</strong>
              </div>
              <div>
                If you purchase again, it will add to your current end date and increase your access
                time.
              </div>
            </Container>
          </ExistingSubBanner>
        )}
        <Container>
          <Logo>
            <LogoSvg />
          </Logo>
          <Title>Land the job, or get a full refund</Title>
          <GiftCardDescription>
            Risk-free satisfaction guarantee or get your money back. I'm that confident you'll get
            the job.
          </GiftCardDescription>
          {/* <DiscountTimer /> */}
          <PurchaseWrapper>
            <CardColumnWrapper>
              <div>
                <CheckoutCard
                  price={full.price}
                  onClickBuy={() => stripeRedirect(full)}
                  isDisabled={!stripe || loading || isCreatingCheckout}
                />
              </div>
              <div>
                <CheckoutCard
                  price={additionalSupport.price}
                  onClickBuy={() => stripeRedirect(additionalSupport)}
                  isDisabled={!stripe || loading || isCreatingCheckout}
                />
              </div>
            </CardColumnWrapper>
            <ParityText>
              Note that both options provide the exact same course access and satisfaction
              guarantees. Several members asked how they could give more to support a resource that
              they have found a ton of value in and empowered them to be successful at coding
              interviews, so this is an easy way to do that. We also wanted to keep the course
              affordable for everyone, so instead of raising prices, we've added an additional
              option.
            </ParityText>
          </PurchaseWrapper>
          <GiftCardWrapper id={GIFT_CARD_ID}>
            <GiftCardTitle>Lock in your price</GiftCardTitle>
            <GiftCardDescription>
              Buy a gift card now to lock in the current price and activate it anytime you're ready
              to start studying
            </GiftCardDescription>
            <BuyGiftCardWrapper>
              <Card>
                <CardContent>
                  <TitleBorder style={{ marginBottom: '2.5em' }}>
                    <GradientBorder>
                      GIFT CARD FOR {IS_LIFETIME_ACCESS ? 'LIFETIME' : '1 YEAR'} FULL COURSE ACCESS
                      (REDEEMABLE ANYTIME)
                    </GradientBorder>
                  </TitleBorder>
                  <BuyGiftCardContent>
                    <GiftCardPriceContainer>
                      <PriceWrapper>
                        <CurrencyName>$</CurrencyName>
                        <Price>{giftCard.price}</Price>
                      </PriceWrapper>
                    </GiftCardPriceContainer>
                    <GiftCardWhyToBuy>
                      <GiftCardWhyToBuyTitle>
                        <strong>
                          Activating a gift card provides full course access from the day it is
                          redeemed
                        </strong>
                      </GiftCardWhyToBuyTitle>
                      <GiftCardWhyToBuyDescription>
                        You will have access to the entire course, all new lesssons, and every
                        platform update — all included in the same price you pay today. Redeem
                        anytime you're ready to start studying.
                      </GiftCardWhyToBuyDescription>
                      <GiftCardPurchaseButtonWrapper>
                        <GiftCardPurchaseButton
                          disabled={!stripe || loading || isCreatingCheckout}
                          onClick={() => stripeRedirect(giftCard)}
                        >
                          <span style={{ marginRight: '12px' }}>Buy Gift Card</span>{' '}
                          <ArrowRight20 />
                        </GiftCardPurchaseButton>
                      </GiftCardPurchaseButtonWrapper>
                    </GiftCardWhyToBuy>
                  </BuyGiftCardContent>
                </CardContent>
              </Card>
            </BuyGiftCardWrapper>
          </GiftCardWrapper>
          <ConfidenceWrapper>
            <h2>The Skilled.dev risk-free money-back guarantee</h2>
            <ConfidenceSubtitle>
              We believe we should only earn your money if you get the job.
            </ConfidenceSubtitle>
            <ConfidenceDescription>
              I learned the hard way what it takes to build a career as a software engineer, and
              it's my passion to help others land the jobs they want. I have complete confidence in
              the course, and I believe we only deserve your hard-earned money if you find value in
              what we're teaching.
            </ConfidenceDescription>
            <ConfidenceDescription>
              You can have a full refund for <b>any reason</b>, including:
            </ConfidenceDescription>
            <ConfidenceList>
              <li>You don't get the job</li>
              <li>You decide to use other interview resources</li>
              <li>You forget about the course and get a job anyway</li>
            </ConfidenceList>
            <ConfidenceDescription>
              <a href="mailto:hey@skilled.dev" style={{ textDecoration: 'underline' }}>
                Send us an email
              </a>{' '}
              within 3 months, and you can get a full refund for any reason. Once refunded, your
              account will be set to the free tier.
            </ConfidenceDescription>
          </ConfidenceWrapper>
        </Container>
        <StripeImage src="/images/stripe.png" alt="Powered by Stripe" />
      </PageLayoutDefault>
      <AuthModal
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        product={activeProduct}
      />
    </>
  );
};

export default PricingPage;
