import styled, { css, keyframes } from 'styled-components';
import { BasePalette } from 'style/theme';
import {
  Container,
  ActionButtonLink,
  ButtonLink,
  GhostButtonLink,
  GhostButton,
  Button,
  CONTAINER_PAD,
} from 'style/elements';
import { mobile, tablet } from 'style/breakpoints';
import { rgba } from 'style/utils/color';
import companyStyle from 'style/company';
import CardWrapper from 'components/blocks/Card';

const homeButtonBaseStyles = css`
  min-width: 200px;
  height: 50px;
  padding: 0px 24px;
  display: inline-flex;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  font-size: 1em;
  font-weight: 400;
  border-radius: 5px;

  &:first-of-type {
    margin-bottom: 24px;
  }
`;

const highlight = keyframes`
  0%, 25% {
    color: white;
    background-color: transparent;
  }

  40% {
    background-color: #fff300;
    color: black;
  }

  70% {
    background-color: #fff300;
    color: black;
  }

  80%, 100% {
    color: white;
    background-color: transparent;
  }
`;

const reveal = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

export const HighlightText = styled.span<{ delaySeconds: number }>`
  padding: 4px 3px;
  animation: ${highlight} 15s linear infinite;
  animation-delay: ${({ delaySeconds }) => delaySeconds}s;
  border-top-left-radius: 6px;
  border-bottom-right-radius: 6px;
`;

export const Header = styled.h3`
  color: ${(props) => props.theme.color.brand};
  font-size: 1.5em;
  line-height: 1;
  text-align: center;
  margin-top: 4rem;
  margin-bottom: 0.5rem;
  font-weight: 400;
`;

export const Subheader = styled.h1`
  text-align: center;
  font-size: 3em;
  margin-bottom: 3rem;
  font-weight: 700;
`;

export const DescriptionText = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  max-width: 720px;
  text-align: center;
  font-size: 1.1em;
  margin: 0 auto;
  margin-top: 2rem;
  line-height: 1.7;
`;

export const SectionSecondary = styled.div`
  background-color: ${(props) => props.theme.color.backgroundSecondary};
`;

export const SectionDistinct = styled.div`
  background-color: ${(props) => props.theme.color.navBackground};
`;

export const SectionTitle = styled.div`
  font-weight: 700;
  font-size: 3.5em;
  text-align: center;

  ${tablet()} {
    font-size: 3em;
  }

  ${mobile()} {
    font-size: 2.5em;
  }
`;

export const CompanySection = styled(SectionSecondary)`
  padding-top: 4rem;
  padding-bottom: 4rem;
`;

export const SectionSubtitle = styled.h2`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 1.25em;
  line-height: 1.425;
  font-weight: 300;
  max-width: 640px;
  margin: 1rem auto;
  margin-bottom: 3rem;
  text-align: center;
`;

export const FlexItems = styled.div`
  display: flex;
  align-items: center;

  ${tablet()} {
    flex-direction: column;
    text-align: center;
  }
`;

export const FlexColumns = styled.div`
  width: 50%;
  padding: 0 16px;
`;

export const FlexStretch = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-grow: 1;
  flex-shrink: 0;
`;

export const CalloutTitle = styled.h2`
  font-size: 3.5em;
  letter-spacing: -1px;

  ${mobile()} {
    font-size: 2em;
    margin-bottom: 2rem;
  }
`;

export const CalloutSection = styled.div`
  background-color: ${({ theme }) => theme.color.buttonPrimary};
  padding: 4rem 0;
`;

export const ButtonSection = styled(FlexStretch)`
  flex-grow: 0;
  margin-left: 48px;
  min-width: 1px;
  max-width: 100%;

  ${tablet()} {
    margin-top: 48px;
    margin-left: auto;
    margin-right: auto;
    max-width: 360px;
    width: 100%;
  }
`;

export const CalloutDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.25em;
`;

export const ContainerFull = styled(Container)`
  max-width: 1440px;
`;

export const ContainerWidest = styled(Container)`
  max-width: 1200px;
`;

export const ContainerWide = styled(Container)`
  max-width: 1048px;
`;

export const ActionButton = styled(ActionButtonLink)`
  ${homeButtonBaseStyles};
`;

export const BlackButton = styled(GhostButton).attrs(() => ({
  hoverable: true,
  solid: true,
  color: '#000',
  textColor: '#FFF',
}))`
  ${homeButtonBaseStyles};
`;

export const WhiteButton = styled(GhostButtonLink).attrs(() => ({
  hoverable: true,
  solid: true,
  color: '#FFF',
  textColor: '#666',
}))`
  ${homeButtonBaseStyles};
  margin-bottom: 0 !important;

  svg {
    fill: #666;
    margin-left: 12px;
  }
`;

export const CenterButtonWrapper = styled.div`
  text-align: center;
  margin-top: 4rem;

  ${mobile()} {
    margin-top: 2rem;
  }
`;

export const CourseTools = styled.div`
  display: flex;
  width: 100%;

  ${mobile()} {
    flex-direction: column;
  }
`;

export const CourseToolItem = styled.div`
  width: ${100 / 3}%;
  padding-left: 2rem;
  padding-right: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${mobile()} {
    width: 100%;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
`;

export const CourseToolImg = styled.img`
  width: 144px;
  height: 144px;
  transition: all 0.25s ease-out;

  &:hover {
    transform: scale(1.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const CourseToolText = styled.div`
  font-size: 1.75em;
  font-weight: 600;
  margin-top: 1.5rem;

  ${mobile()} {
    margin-top: 0.5rem;
  }
`;

export const GradientTitle = styled.div`
  background-color: ${(props) => props.theme.color.backgroundSecondary};
  margin-bottom: 5rem;
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
  text-align: center;
  padding: 0 24px;
`;

export const Card = styled(CardWrapper)`
  background-color: ${({ theme }) => theme.color.backgroundPrimary};
  box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.25);
  max-width: 560px;
  margin: 0 auto;
`;

export const CardContent = styled.div`
  padding: 1.5rem;

  ${mobile()} {
    padding: 0.75rem;
  }
`;

export const BrandText = styled.span`
  color: ${({ theme }) => theme.color.brand};
  font-weight: 400;
`;

export const IconList = styled.div`
  max-width: 72%;
  margin: 48px auto;

  ${mobile()} {
    max-width: 100%;
  }
`;

export const IconListItem = styled.div`
  display: flex;
  margin: 24px 0;
`;

export const IconListItemText = styled.div`
  margin-left: 24px;
`;

export const PurchaseButton = styled(Button)`
  background-color: ${({ theme }) => theme.color.cta};
  color: ${BasePalette.White};
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 360px;

  width: 100%;
  padding: 0.8rem 0.5rem;
  font-size: 1em;
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

export const PurchaseButtonCenter = styled(PurchaseButton)`
  margin: 0 auto;
  max-width: 240px;
  padding: 1.1rem 0.75rem;
  font-size: 1.1em;
`;

export const FinePrint = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 0.9em;
  text-align: center;
  margin-top: 0.75rem;
  line-height: 1.75;
  font-weight: 300;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;

  ${mobile()} {
    max-width: 100%;
  }
`;

export const LanguageContentWrapper = styled.div`
  margin-top: 2rem;
`;

export const BaseLanguageImage = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 8px;
`;

export const PrimaryLanguageImage = styled(BaseLanguageImage)`
  margin-right: 1.5rem;
`;

export const LanguageImage = styled(PrimaryLanguageImage)`
  margin-right: 3rem;

  &:last-of-type {
    margin-right: 0;
  }
`;

// Every language, five to a row
export const LanguageGrid = styled.nav`
  display: grid;
  grid-template-columns: repeat(5, minmax(90px, 110px));
  gap: 2rem 1rem;
  justify-content: center;
  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    line-height: 1.6;
    text-align: center;
  }
  a:hover {
    text-decoration: underline;
  }
  a:focus-visible {
    outline: 3px solid ${({ theme }) => theme.color.brand};
    outline-offset: 5px;
  }

  ${mobile()} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem 1rem;
    a {
      font-size: 13px;
      overflow-wrap: anywhere;
    }
  }
`;

export const LanguageLogo = styled(BaseLanguageImage)`
  display: block;
  object-fit: contain;

  ${mobile()} {
    width: 44px;
    height: 44px;
  }
`;

export const LanguageSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  text-align: center;
  flex-wrap: wrap;

  &:nth-of-type(even) {
    margin-bottom: 1.5rem;
  }

  ${mobile()} {
    ${LanguageImage} {
      width: 50%;
      margin: 0;
      margin-bottom: 3rem;
    }
  }
`;

export const LanguageText = styled.div`
  font-size: 1.5em;
`;

export const PaddedSection = styled.div`
  padding-top: 6rem;
  padding-bottom: 8rem;

  ${mobile()} {
    padding-top: 3.5rem;
    padding-bottom: 4rem;
  }
`;

export const BorderBottom = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
`;

export const TerminalWrapper = styled.div`
  max-width: 816px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 16px;
  /* border: 1px solid ${({ theme }) => theme.color.border}; */
  box-shadow: ${({ theme }) => `${theme.shadow.stroke}, ${theme.shadow.medium}`};
`;

export const TerminalTopBar = styled.div`
  padding: 0.9rem;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background-color: ${({ theme }) => theme.color.blackPalette.Black0};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  width: 100%;
`;

const buttonColors = ['#EE6A5D', '#F6BF4F', '#61C554'];

export const TerminalButton = styled.div<{ idx: number }>`
  cursor: pointer;
  margin-right: 0.5rem;
  box-shadow: ${({ theme }) => `${theme.shadow.stroke}, ${theme.shadow.medium}`};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  transition: all 0.25s ease-out;
  background-color: ${({ idx }) => buttonColors[idx]};

  &:hover {
    box-shadow: ${({ theme }) => `${theme.shadow.stroke}, ${theme.shadow.high}`};
    transform: scale(1.2);
  }

  &:active {
    box-shadow: ${({ theme }) => `${theme.shadow.stroke}, ${theme.shadow.low}`};
    transform: scale(0.8);
  }
`;

export const TerminalWindow = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.color.blackPalette.Black0};
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  padding: 2rem 1.5rem;
  padding-right: 2.6rem;
  width: 100%;

  ${mobile()} {
    padding: 1rem 0.5rem;
    padding-right: 1.6rem;
    padding-bottom: 1.5rem;
  }
`;

export const TerminalChevronWrapper = styled.div`
  flex-shrink: 0;
  margin-right: 1.5rem;

  ${mobile()} {
    margin-right: 0.5rem;
  }
`;

export const TerminalChevron = styled.div`
  width: 36px;
  height: 36px;
  line-height: 1;

  svg {
    width: 36px;
    height: 36px;
  }
`;

export const TerminalTextWrapper = styled.div`
  width: 100%;
  padding-top: 8px;
`;

export const TerminalText = styled.div<{ delay: number }>`
  font-size: 1.2em;
  line-height: 1.3;
  margin-bottom: 1.5rem;
  font-family: consolas, monospace;
  opacity: 0;
  animation: ${reveal} 150ms ease-in-out forwards;
  animation-delay: ${({ delay }) => delay}s;
  animation-iteration-count: 1;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const TerminalButtonWrapper = styled.div`
  margin-top: 3rem;
`;

/** The secondary call to action under the terminal's main button: an outline on the black terminal. */
export const GithubButton = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 360px;
  width: 100%;
  margin-top: 12px;
  padding: 0.8rem 0.5rem;
  font-size: 1em;
  font-weight: 600;
  border-radius: 2px;
  border: 1px solid ${rgba(BasePalette.White, 0.5)};
  color: ${BasePalette.White};
  transition: background-color 250ms ease-in-out, border-color 250ms ease-in-out;

  &:visited {
    color: ${BasePalette.White};
  }

  &:hover {
    background-color: ${rgba(BasePalette.White, 0.08)};
    border-color: ${BasePalette.White};
  }
`;

export const LinkSimple = styled.a`
  color: inherit;
  text-decoration: underline;

  &:hover {
    text-decoration: underline;
  }

  &:visited {
    color: inherit;
  }
`;

export const GutterWrapper = styled.div`
  padding: 0 ${CONTAINER_PAD}px;
`;

export const HeaderDescription = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  max-width: 600px;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
`;

export const SocialContainer = styled.div`
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
`;

export const SocialButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;

  ${mobile()} {
    flex-direction: column;

    a {
      margin-bottom: 8px;
    }
  }
`;

export const TwitterButton = styled(ButtonLink)`
  background-color: ${companyStyle.color[companyStyle.Company.Twitter]};
  transition: background-color 150ms ease;
  padding: 8px 16px;
  border-radius: 3px;
  font-weight: 600;
  line-height: 1em;
  font-size: 14px;
  margin-left: 8px;
  margin-right: 8px;

  &:hover {
    background-color: ${companyStyle.hover[companyStyle.Company.Twitter]};
  }

  ${mobile()} {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
`;

export const LinkedInButton = styled(ButtonLink)`
  background-color: ${companyStyle.color[companyStyle.Company.Linkedin]};
  transition: background-color 150ms ease;
  padding: 8px 16px;
  border-radius: 3px;
  font-weight: 600;
  line-height: 1em;
  font-size: 14px;
  margin-left: 8px;
  margin-right: 8px;

  &:hover {
    background-color: ${companyStyle.hover[companyStyle.Company.Linkedin]};
  }

  ${mobile()} {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
`;

export const YoutubeButton = styled(ButtonLink)`
  background-color: ${companyStyle.color[companyStyle.Company.Google]};
  transition: background-color 150ms ease;
  padding: 8px 16px;
  border-radius: 3px;
  font-weight: 600;
  line-height: 1em;
  font-size: 14px;
  margin-left: 8px;
  margin-right: 8px;

  &:hover {
    background-color: ${companyStyle.hover[companyStyle.Company.Google]};
  }

  ${mobile()} {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
`;

export const FindJobButton = styled(ButtonLink)`
  background-color: ${({ theme }) => theme.color.buttonPrimary};
  color: ${BasePalette.White};
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 412px;
  margin: 0 auto;

  width: 100%;
  padding: 0.8rem 0.5rem;
  font-size: 14px;
  border-radius: 4px;
  font-weight: 600;
  transition: background-color 250ms ease-in-out, opacity 250ms ease-in-out;
  box-shadow: ${({ theme }) => theme.shadow.stroke}, ${({ theme }) => theme.shadow.high};

  &:hover {
    background-color: ${({ theme }) => theme.color.buttonHover};
  }

  &:disabled {
    opacity: 0.5;
    background-color: ${({ theme }) => theme.color.buttonHover};
    cursor: default;
  }

  ${mobile()} {
    max-width: 100%;
  }
`;

export const StatText = styled.div`
  color: ${({ theme }) => theme.color.brand};
  font-size: 5em;
  font-weight: 700;
`;
