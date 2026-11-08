import styled from 'styled-components';
import { rgba } from 'style/utils/color';
import { BasePalette } from 'style/theme';
import { CheckmarkOutline20, Timer20, ArrowRight16 } from '@carbon/icons-react';
import { Input as BaseInput, Button as BaseButton, Label as BaseLabel } from 'style/elements';
import { mobile } from 'style/breakpoints';

export const Wrapper = styled.div`
  padding: 1rem;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
`;

export const Section = styled.div`
  margin-top: 2rem;
`;

export const SectionTitle = styled.h2`
  font-weight: 400;
  margin-bottom: 0.5rem;
`;

export const Item = styled.p`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;

  svg {
    margin-left: 4px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const AlertItem = styled.p`
  color: ${BasePalette.Orange};
  margin-top: 0.5rem;
`;

export const SecondaryItem = styled.p`
  color: ${({ theme }) => theme.color.textSecondary};
  margin-top: 0.5rem;
`;

export const CTAButton = styled.a`
  color: ${(props) => props.theme.color.textPrimary};
  background-color: ${(props) => props.theme.color.cta};
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  font-size: 0.9em;
  font-weight: 600;
  padding: 4px 10px;
  margin-right: 16px;

  &:hover {
    background-color: ${({ theme }) => rgba(theme.color.cta, 0.8)};
  }
`;

export const CheckIcon = styled(CheckmarkOutline20)`
  margin-left: 4px;
  fill: ${({ theme }) => theme.color.cta};
`;

export const TimerIcon = styled(Timer20)`
  margin-left: 4px;
  fill: ${({ theme }) => theme.color.brand};
`;

export const ArrowIcon = styled(ArrowRight16)`
  fill: ${({ theme }) => theme.color.textPrimary};
  margin-left: 8px !important;
`;

export const StyledLink = styled.a`
  display: inline-flex;
  align-items: center;
`;

export const Input = styled(BaseInput)``;

export const RedeemButton = styled(BaseButton)`
  ${mobile()} {
    width: 100%;
    margin-bottom: 16px;
  }
`;

export const Label = styled(BaseLabel)``;

export const ErrorText = styled.div`
  color: ${({ theme }) => theme.color.alert};
  border: 1px solid ${({ theme }) => theme.color.alert};
  text-align: left;
  margin-top: 16px;
  padding: 16px;
  border-radius: 4px;
  line-height: 1;
`;

export const RedeemFormWrapper = styled.div`
  padding-bottom: 80px;
  margin-top: 40px;
`;

export const RedeemFormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;

  ${mobile()} {
    flex-direction: column-reverse;
  }
`;

export const Subheader = styled.h3`
  font-size: 14px;
`;

export const GiftCardList = styled.ul`
  padding: 0;
  margin: 0;
`;

export const GiftCardItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 8px;
  border-top: 1px solid ${({ theme }) => theme.color.border};

  &:first-of-type {
    border-top: none;
  }
  &:last-of-type {
    padding-bottom: 0;
  }
`;

export const RedeemButtonSmall = styled(BaseButton)`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 400;
  border-radius: 2px;
`;

export const GiftCardName = styled.div`
  max-width: 100%;
  padding-right: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
`;

export const GiftCardAction = styled.div`
  flex-shrink: 0;
  font-size: 14px;
`;

export const GiftCardSection = styled.div`
  margin-bottom: 24px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;
