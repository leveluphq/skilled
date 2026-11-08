import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from 'services/client/api';
import { IS_FULL_COURSE_FREE, IS_LIFETIME_ACCESS } from 'utils/constants/payments';
import { SaleType, redirectUrls } from 'utils/constants/payments';
import { PageRoot } from 'utils/constants/routes';
import Card from 'components/blocks/Card';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import CompanyMap from 'style/company';
import { Company } from 'utils/constants/auth';
import { GetUserSettingsQueryHookResult } from 'types/generated/client';
import { ErrorObject } from 'utils/constants/http';
import { isInsideDateRange } from 'utils/client/lesson';
import getActiveLessonSlug from 'utils/client/getActiveLessonSlug';
import Sentry from 'utils/shared/sentry';
import navigateTo from 'utils/client/navigateTo';

import {
  Wrapper,
  Section,
  SectionTitle,
  Item,
  AlertItem,
  SecondaryItem,
  CTAButton,
  CheckIcon,
  TimerIcon,
  ArrowIcon,
  StyledLink,
  RedeemButtonSmall,
  Input,
  RedeemButton,
  ErrorText,
  RedeemFormWrapper,
  RedeemFormActions,
  Subheader,
  GiftCardList,
  GiftCardItem,
  GiftCardName,
  GiftCardAction,
  GiftCardSection,
} from './styles';

export interface Props {
  data?: GetUserSettingsQueryHookResult['data'];
  loading: GetUserSettingsQueryHookResult['loading'];
  error?: GetUserSettingsQueryHookResult['error'];
}

const PageContent: React.FC = ({ children }) => (
  <PageLayoutDefault isNavbarFixed hideFooter>
    <Wrapper>{children}</Wrapper>
  </PageLayoutDefault>
);

const redeemGiftCardRequest = async (code: string) => {
  const redemptionResponse = await api.post('giftcard/redeem', { payload: { code } });
  return redemptionResponse;
};

const SettingsPage: React.FC<Props> = ({ data, loading, error }) => {
  const router = useRouter();
  const [giftCardCode, setGiftCardCode] = React.useState('');
  const [isRedeemingGiftCard, setIsRedeemingGiftCard] = React.useState(false);
  const [redeemError, setRedeemError] = React.useState<ErrorObject | null>(null);
  const user = data?.users_by_pk;
  const shouldRedirect = !(loading || error || user);

  // Since this only runs on the client, it will only redirect after the query has attempted
  React.useEffect(() => {
    if (shouldRedirect) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRedirect]);

  const redeemGiftCard = React.useCallback(
    async (code: string) => {
      if (isRedeemingGiftCard) {
        return;
      }

      setIsRedeemingGiftCard(true);

      try {
        await redeemGiftCardRequest(code);
        setGiftCardCode('');
        navigateTo(redirectUrls[SaleType.FullCourse].success_url);
      } catch (error) {
        Sentry.withScope((_scope) => {
          Sentry.captureException(error);
        });

        setIsRedeemingGiftCard(false);
        setRedeemError(error as ErrorObject);
      }
    },
    [isRedeemingGiftCard],
  );

  if (loading) {
    return (
      <PageContent>
        <h1>Settings</h1>
      </PageContent>
    );
  }

  if (error) {
    return <PageContent>Error: {error.message}</PageContent>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  const { href } = getActiveLessonSlug(user);
  const registrationSourceName = CompanyMap.name[user.registrationSource as Company];
  const CompanyIcon = CompanyMap.icon[user.registrationSource as Company];
  const hasSentGiftCards = !!user.sentGiftCards && user.sentGiftCards.length > 0;
  const hasReceivedGiftCards = !!user.receivedGiftCards && user.receivedGiftCards.length > 0;
  const hasRedeemedGiftCards = !!user.redeemedGiftCards && user.redeemedGiftCards.length > 0;
  const hasAnyGiftCards = hasSentGiftCards || hasReceivedGiftCards || hasRedeemedGiftCards;

  return (
    <PageContent>
      <h1>Settings</h1>
      {!IS_FULL_COURSE_FREE && (
        <Section>
          <SectionTitle>Membership</SectionTitle>
          {user.fullCourseAccessEndsAt &&
          (IS_LIFETIME_ACCESS || isInsideDateRange(user.fullCourseAccessEndsAt)) ? (
            <Card>
              <Item>
                You have full access to the Skilled.dev platform! <CheckIcon />
              </Item>
              {!IS_LIFETIME_ACCESS && (
                <Item>
                  Access ends: {user.fullCourseAccessEndsAt.split('T')[0]} <TimerIcon />
                </Item>
              )}
              <Item style={{ marginTop: '24px' }}>
                <Link href={href ? href : `/${PageRoot.Course}`} passHref>
                  <StyledLink style={{ textDecoration: 'underline' }}>
                    Continue where you left off <ArrowIcon />
                  </StyledLink>
                </Link>
              </Item>
            </Card>
          ) : (
            <Card>
              <Item>
                <span style={{ marginRight: '8px' }}>You don't have a subscription</span>
                <CTAButton href={`/${PageRoot.Pricing}`}>🔥 Get Full Access</CTAButton>
              </Item>
            </Card>
          )}
        </Section>
      )}
      <Section>
        <SectionTitle>User Details</SectionTitle>
        <Card>
          <Item>{user.name}</Item>
          <Item>{user.email}</Item>
          <Item>
            OAuth Registration Source: {registrationSourceName} <CompanyIcon />
          </Item>
          <AlertItem>
            Always use {registrationSourceName} when logging in to prevent issues
          </AlertItem>
        </Card>
        <SecondaryItem>
          None of your data is public - if you do need anything changed, please email us at
          hey@skilled.dev
        </SecondaryItem>
      </Section>
      <Section>
        <SectionTitle>Gift Cards</SectionTitle>
        <SecondaryItem style={{ marginBottom: '8px' }}>
          Redeeming a gift card will immediately give you access to the full course, and the credit
          will be used. Only redeem when you are ready to begin studying for interviews.
        </SecondaryItem>
        {hasAnyGiftCards && (
          <Card>
            {hasReceivedGiftCards && (
              <GiftCardSection>
                <Subheader>RECEIVED</Subheader>
                <GiftCardList>
                  {user.receivedGiftCards.map((gc) => (
                    <GiftCardItem key={gc.id}>
                      <GiftCardName>{gc.productName}</GiftCardName>
                      <RedeemButtonSmall
                        onClick={() => redeemGiftCard(gc.code)}
                        disabled={isRedeemingGiftCard}
                      >
                        REDEEM
                      </RedeemButtonSmall>
                    </GiftCardItem>
                  ))}
                </GiftCardList>
              </GiftCardSection>
            )}
            {hasSentGiftCards && (
              <GiftCardSection>
                <Subheader>PURCHASED</Subheader>
                <GiftCardList>
                  {user.sentGiftCards.map((gc) => (
                    <GiftCardItem key={gc.id}>
                      <GiftCardName>{gc.productName}</GiftCardName>
                      <RedeemButtonSmall
                        onClick={() => redeemGiftCard(gc.code)}
                        disabled={isRedeemingGiftCard}
                      >
                        REDEEM
                      </RedeemButtonSmall>
                    </GiftCardItem>
                  ))}
                </GiftCardList>
              </GiftCardSection>
            )}
            {hasRedeemedGiftCards && (
              <GiftCardSection>
                <Subheader>REDEEMED</Subheader>
                <GiftCardList>
                  {user.redeemedGiftCards.map((gc) => (
                    <GiftCardItem key={gc.id}>
                      <GiftCardName>{gc.productName}</GiftCardName>
                      <GiftCardAction>{gc.redeemedAt.split('T')[0]}</GiftCardAction>
                    </GiftCardItem>
                  ))}
                </GiftCardList>
              </GiftCardSection>
            )}
          </Card>
        )}
        {!hasAnyGiftCards && (
          <Card style={{ textAlign: 'center' }}>You have not sent or redeemed any gift cards</Card>
        )}
        {!!redeemError && <ErrorText>{redeemError.message}</ErrorText>}
        <RedeemFormWrapper>
          <Subheader>REDEEM A GIFT CARD</Subheader>
          <form
            style={{ marginTop: '8px' }}
            onSubmit={(e) => {
              e.preventDefault();

              if (isRedeemingGiftCard) {
                return;
              }

              redeemGiftCard(giftCardCode);
            }}
          >
            <Input
              name="gift-card-code"
              placeholder="Gift card code..."
              value={giftCardCode}
              onChange={(e) => setGiftCardCode(e.target.value)}
            />
            <RedeemFormActions>
              {!IS_FULL_COURSE_FREE && (
                <a href={`/${PageRoot.Pricing}`} style={{ textDecoration: 'underline' }}>
                  Buy a gift card for yourself or a friend
                </a>
              )}
              <RedeemButton type="submit" disabled={isRedeemingGiftCard}>
                Redeem Gift Card
              </RedeemButton>
            </RedeemFormActions>
          </form>
        </RedeemFormWrapper>
      </Section>
      {/* <Section>
        <SectionTitle>Course Status</SectionTitle>
        <div>Status of all questions and link to each one</div>
      </Section> */}
      {/* <div>Ability to link accounts?</div> */}
    </PageContent>
  );
};

export default SettingsPage;
