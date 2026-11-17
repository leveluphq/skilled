import styled from 'styled-components';
import { BasePalette } from 'style/theme';
import { RawButton } from 'style/elements';
import { mobile } from 'style/breakpoints';
import { rgba } from 'style/utils/color';

/*
 * The course index, in the home page's style: whitespace between topics instead of
 * alternating bands, and lessons as rows with hairlines instead of bordered cards.
 */

const MONO = "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace";
const HAIRLINE = rgba(BasePalette.White, 0.07);

export const Wrapper = styled.div`
  padding-bottom: 32px;
`;

/* Header */

export const Header = styled.header`
  padding: 72px 0 8px;

  ${mobile()} {
    padding-top: 40px;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.brand};
`;

export const TitleText = styled.h1`
  margin: 0;
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: ${({ theme }) => theme.color.textPrimary};
`;

export const Lead = styled.p`
  margin: 18px 0 28px;
  max-width: 600px;
  font-size: 1.1rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.color.textSecondary};
`;

/* Viewer progress filter: a quiet segmented control */

export const TabWrapper = styled.div`
  display: inline-flex;
  gap: 4px;
  max-width: 100%;
  margin-top: 40px;
  padding: 4px;
  overflow-x: auto;
  border-radius: 12px;
  background-color: ${rgba(BasePalette.White, 0.05)};

  ${mobile()} {
    gap: 2px;
  }
`;

export const ButtonTab = styled(RawButton)<{ color: string; isActive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px;
  border-radius: 9px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme, isActive }) => (isActive ? theme.color.textPrimary : theme.color.textSecondary)};
  background-color: ${({ isActive }) => (isActive ? rgba(BasePalette.White, 0.12) : 'transparent')};
  transition: background-color 150ms ease, color 150ms ease;

  /* Each filter keeps its color as a small dot */
  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: ${({ color }) => color};
  }

  &:hover {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.brand};
    outline-offset: 1px;
  }

  ${mobile()} {
    gap: 6px;
    padding: 0 10px;
    font-size: 13px;
    white-space: nowrap;
  }
`;

/* Continue where you left off */

export const Continue = styled.div`
  margin-top: 40px;
`;

export const ContinueLink = styled.a`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 14px;
  background-color: ${rgba(BasePalette.Brand, 0.08)};
  color: ${({ theme }) => theme.color.textPrimary};
  text-decoration: none;
  transition: background-color 150ms ease;

  &:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  &:hover {
    background-color: ${rgba(BasePalette.Brand, 0.14)};
  }

  > div {
    flex: 1;
    min-width: 0;
  }

  > svg {
    flex: none;
    fill: ${({ theme }) => theme.color.brand};
  }
`;

export const ContinueSectionTitle = styled.p`
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.brand};
`;

export const ContinueTitle = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
`;

export const ContinueDescription = styled.p`
  margin: 4px 0 0;
  font-size: 15px;
  color: ${({ theme }) => theme.color.textSecondary};
`;

/* Topics */

export const Section = styled.section`
  padding-top: 72px;
  scroll-margin-top: 16px;

  ${mobile()} {
    padding-top: 56px;
  }
`;

export const SectionTitle = styled.h2`
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: ${({ theme }) => theme.color.textPrimary};
`;

export const SectionNumber = styled.span`
  font-family: ${MONO};
  font-size: 0.95rem;
  font-weight: 400;
  letter-spacing: 0;
  color: ${({ theme }) => theme.color.textLight};
`;

export const SectionDescription = styled.p`
  margin: 10px 0 0;
  max-width: 600px;
  line-height: 1.65;
  color: ${({ theme }) => theme.color.textSecondary};
`;

export const QuestionWrapper = styled.div`
  margin-top: 28px;
`;

export const SectionSubtitle = styled.p`
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.textLight};
`;

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

/* A lesson row. The link names the lesson; its ::after stretches over the whole row. */
export const Item = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 4px;
  box-shadow: inset 0 -1px 0 ${HAIRLINE};

  > svg.row-arrow {
    flex: none;
    fill: ${({ theme }) => theme.color.textLight};
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity 150ms ease, transform 150ms ease, fill 150ms ease;
  }

  &:hover > svg.row-arrow,
  &:focus-within > svg.row-arrow {
    opacity: 1;
    transform: none;
    fill: ${({ theme }) => theme.color.brand};
  }
`;

export const ItemText = styled.div`
  flex: 1;
  min-width: 0;
`;

export const StyledLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.textPrimary};
  text-decoration: none;
  transition: color 150ms ease;

  &:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  ${Item}:hover & {
    color: ${({ theme }) => theme.color.brand};
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible::after {
    border-radius: 8px;
    outline: 2px solid ${({ theme }) => theme.color.brand};
  }
`;

export const ItemDescription = styled.p`
  margin: 4px 0 0;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.color.textSecondary};
  white-space: nowrap;
  text-overflow: ellipsis;

  ${mobile()} {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
`;

export const ErrorText = styled.div`
  text-align: center;
  padding-top: 3rem;
`;

/* Shown once after a purchase */

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
