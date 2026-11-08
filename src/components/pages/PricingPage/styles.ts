import styled from 'styled-components';
import { RawButton, ContainerLarge, ButtonLink } from 'style/elements';
import { BasePalette } from 'style/theme';
import { rgba } from 'style/utils/color';
import CardWrapper from 'components/blocks/Card';
import { mobile } from 'style/breakpoints';

const CONTAINER = `
  margin-left: auto;
  margin-right: auto;
`;

export const Container = styled(ContainerLarge)`
  text-align: center;
  padding-bottom: 4rem;
`;

export const Logo = styled.div`
  margin-top: 52px;
  margin-bottom: 12px;
`;

export const Title = styled.h1`
  ${CONTAINER};
  color: ${({ theme }) => theme.color.brand};
  font-size: 3.5em;
  margin-top: 16px;

  ${mobile()} {
    font-size: 3em;
  }
`;

export const Subtitle = styled.h2`
  font-size: 1em;
  font-weight: 400;
  color: ${({ theme }) => theme.color.textSecondary};
  margin-top: 0.5rem;
`;

export const PurchaseWrapper = styled.div`
  ${CONTAINER};
  margin-top: 40px;
  padding: 0 12px;
`;

export const PurchaseTitle = styled.h2`
  font-size: 1.25em;
  font-weight: 600;
  margin-bottom: 1.5rem;
  background-color: ${({ theme }) => theme.color.buttonPrimary};
`;

export const PriceWrapper = styled.div`
  display: flex;
  justify-content: center;
  line-height: 1;
`;

export const CurrencyName = styled.span`
  font-size: 1.5em;
  padding-top: 4px;
  margin-right: 2px;
`;

export const FullPrice = styled.div`
  text-decoration: line-through;
  color: ${({ theme }) => theme.color.textSecondary};
  text-decoration-color: ${({ theme }) => theme.color.alert};
`;

export const Price = styled.span`
  /* margin-left: 4px; */
  font-size: 4em;
  font-weight: 600;
`;

export const LengthDescription = styled.p`
  font-weight: 300;
`;

export const PlanDescription = styled.p`
  margin-top: 3.25rem;
`;

export const PurchaseButtonWrapper = styled.div`
  margin-top: 2.75rem;
`;

export const PurchaseButton = styled(RawButton)`
  background-color: ${({ theme }) => theme.color.cta};
  color: ${BasePalette.White};
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 80%;
  margin: 0 auto;
  width: 100%;
  padding: 1.1rem 0.75rem;
  font-size: 1.1em;
  border-radius: 2px;
  font-weight: 600;
  transition: background-color 250ms ease-in-out, opacity 250ms ease-in-out;
  box-shadow: ${({ theme }) => theme.shadow.stroke}, ${({ theme }) => theme.shadow.high};

  &:hover {
    background-color: ${({ theme }) => rgba(theme.color.cta, 0.85)};
  }

  &:disabled {
    opacity: 0.5;
    background-color: ${({ theme }) => theme.color.cta};
    cursor: default;
  }

  ${mobile()} {
    max-width: 100%;
  }
`;

export const DescriptionText = styled.p`
  color: ${({ theme }) => theme.color.textSecondary};
  margin-top: 0.5rem;
  line-height: 1.2;
  font-weight: 400;
  font-size: 0.9em;
  text-align: center;
`;

export const PricingDescriptionText = styled.p`
  margin: 2rem 0;
  line-height: 1.5;
  font-weight: 300;
  font-size: 14px;
`;

export const Card = styled(CardWrapper)`
  box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.25);
`;

export const CardContent = styled.div`
  padding: 1.5rem;
`;

export const LinkButton = styled(ButtonLink)`
  width: 100%;
`;

export const StripeImage = styled.img`
  width: 120px;
  position: fixed;
  bottom: 16px;
  left: 16px;

  ${mobile()} {
    position: static;
    display: block;
    margin: 24px auto;
  }
`;

export const ExistingSubBanner = styled.div`
  background-color: ${({ theme }) => theme.color.buttonPrimary};
  padding: 8px 0;
  padding-left: 12px;
  position: relative;

  ${mobile()} {
    padding: 8px 12px;
  }
`;

export const TitleBorder = styled.div`
  margin-bottom: 3em;
  background: ${({ theme }) => theme.color.paper};
`;

export const FeaturesWrapper = styled.div`
  margin-top: 1.9rem;
`;

export const FeaturesTitle = styled.div`
  font-size: 1em;
  font-weight: 600;
  text-transform: uppercase;
`;

export const FeaturesList = styled.ul`
  margin-bottom: 0;
  margin-top: 8px;
  list-style-type: none;
  padding: 0;
`;

export const FeaturesItem = styled.li`
  font-weight: 300;
  font-size: 14px;
  margin-top: 12px;
`;

export const GiftCardWrapper = styled.div`
  ${CONTAINER};
  margin-top: 6em;
  padding: 0 12px;
  padding-bottom: 64px;
`;

export const GiftCardTitle = styled.h2`
  font-weight: 700;
  font-size: 3.5em;

  ${mobile()} {
    font-size: 3em;
  }
`;

export const GiftCardDescription = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 1.5em;
  line-height: 1.425;
  font-weight: 300;
  max-width: 640px;
  margin: 1em auto;
`;

export const BuyGiftCardWrapper = styled.div`
  margin-top: 3em;
`;

export const BuyGiftCardContent = styled.div`
  display: flex;

  ${mobile()} {
    flex-direction: column;
  }
`;

export const GiftCardWhyToBuy = styled.div`
  text-align: left;
  padding-left: 40px;
  border-left: 1px solid ${({ theme }) => theme.color.border};

  ${mobile()} {
    border-left: none;
    padding-left: 0;
  }
`;

export const GiftCardPriceContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 40px;

  ${mobile()} {
    margin-right: 0;
    margin-bottom: 32px;
    justify-content: center;
  }
`;

export const GiftCardWhyToBuyTitle = styled.div``;

export const GiftCardWhyToBuyDescription = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  margin-top: 8px;
`;

export const GiftCardPurchaseButtonWrapper = styled.div`
  margin-top: 1.5em;
`;

export const GiftCardPurchaseButton = styled(PurchaseButton)`
  width: auto;
  padding: 0.75rem 1.5rem;
  font-size: 1em;
  margin-left: 0;
  margin-right: auto;

  ${mobile()} {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
`;

export const CardColumnWrapper = styled.div`
  display: flex;
  justify-content: center;

  > * {
    max-width: 496px;
    margin-left: 1rem;
    margin-right: 1rem;

    ${mobile()} {
      margin: 0;
      margin-bottom: 1rem;
    }
  }

  ${mobile()} {
    flex-direction: column;
    align-items: center;
  }
`;

export const ParityText = styled.div`
  margin-top: 2rem;
  margin-left: auto;
  margin-right: auto;
  max-width: 640px;
  line-height: 1.7;
  font-size: 0.9em;
  border: 1px solid white;
  border-radius: 8px;
  padding: 32px;
`;

export const ConfidenceWrapper = styled.div`
  max-width: 640px;
  margin: 0 auto;
`;

export const ConfidenceSubtitle = styled.p`
  color: ${({ theme }) => theme.color.textSecondary};
  margin-top: 0.2rem;
`;

export const ConfidenceDescription = styled.p`
  text-align: left;
  font-size: 0.9em;
  margin-top: 1rem;
  line-height: 1.6;
`;

export const ConfidenceList = styled.ul`
  text-align: left;
  font-size: 0.9em;
  margin-top: 0.25rem;

  li {
    margin-bottom: 0.2rem;
  }
`;
