import styled from 'styled-components';
import { FOCUS_WIDTH } from 'style/theme';
import { RawButton } from 'style/elements';
import { rgba } from 'style/utils/color';

export const Wrapper = styled.div`
  margin-top: 2rem;
`;

export const TitleWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
`;

export const TitleText = styled.h1`
  color: ${(props) => props.theme.color.brand};
`;

export const ContinueSectionTitle = styled.h2`
  font-size: 1.15em;
  font-weight: 400;
  margin-bottom: 4px;
`;

export const SectionTitle = styled.h2`
  font-size: 1.85em;
`;

export const SectionDescription = styled.p`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 15px;
  font-weight: 300;
`;

export const Section = styled.div`
  padding-bottom: 2.5rem;
  padding-top: 2.5rem;

  background-color: ${(props) => props.theme.color.backgroundPrimary};

  &:nth-of-type(2n) {
    background-color: ${(props) => props.theme.color.backgroundSecondary};
  }
`;

export const List = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
`;

export const StyledLink = styled.a`
  display: block;
  width: 100%;
`;

export const Item = styled.li`
  display: inline-flex;
  width: 100%;
  margin-bottom: 1rem;
`;

export const ErrorText = styled.div`
  text-align: center;
  padding-top: 3rem;
`;

export const TabWrapper = styled.div`
  margin-top: 0.2rem;
`;

export const ButtonTab = styled(RawButton)<{ color: string; isActive?: boolean }>`
  border: 2px solid ${({ isActive, color }) => (isActive ? color : '#727272')};
  color: ${({ theme }) => theme.color.textPrimary};
  width: 25%;
  padding: 0.6em;
  background-color: ${({ isActive, color }) => (isActive ? rgba(color, 0.15) : 'transparent')};
  transition: background-color 150ms ease-in-out, border-color 150ms ease-in-out;
  border-radius: 0;

  &:focus {
    border: 2px solid ${({ color }) => color};
    outline-offset: -${FOCUS_WIDTH}px;
  }

  &:hover {
    background-color: ${({ color }) => color};
    border: 2px solid ${({ color }) => color};
  }

  &:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }
  &:last-child {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
`;

export const SubscriptionSuccessWrapper = styled.div`
  background-color: ${({ theme }) => rgba(theme.color.cta, 0.3)};
  border-bottom: 2px solid ${({ theme }) => theme.color.cta};
  padding-top: 2rem;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
`;

export const SuccessText = styled.p`
  margin-top: 1rem;
`;

export const CloseButton = styled(RawButton)`
  color: ${(props) => props.theme.color.textPrimary};
  font-size: 36px;
  padding: 0;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 5px;
`;

export const SuccessTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const SectionSubtitle = styled.div`
  color: ${(props) => props.theme.color.textSecondary};
  font-size: 19px;
  margin-bottom: 12px;
  font-weight: 300;
`;

export const QuestionWrapper = styled.div`
  margin-top: 20px;
`;

export const ShareContainer = styled.div`
  padding: 0 16px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ShareTitle = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.color.textSecondary};
`;

export const CopyButton = styled(RawButton)`
  text-decoration: underline;
  font-size: 14px;
  margin-left: 8px;
`;

export const FollowContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const SocialMediaIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.color.border};
  margin-left: 8px;
  transition: border 300ms ease, background-color 300ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.buttonPrimary};
    background-color: ${({ theme }) => theme.color.buttonPrimary};
  }
`;
