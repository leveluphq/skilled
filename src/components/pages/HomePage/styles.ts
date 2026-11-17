import styled, { css, keyframes } from 'styled-components';
import { BasePalette } from 'style/theme';
import { mobile, tablet } from 'style/breakpoints';
import { rgba } from 'style/utils/color';

/*
 * The home page. One type scale, one accent (the brand yellow) and whitespace
 * instead of cards and borders: sections are separated by space, and surfaces
 * are only used where something is a real window (the terminal, the editor).
 */

const CONTENT_WIDTH = 1180;
const INK = '#0B0C0E';
const MONO = "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace";

export const Container = styled.div`
  width: 100%;
  max-width: ${CONTENT_WIDTH}px;
  margin: 0 auto;
  padding: 0 32px;

  ${mobile()} {
    padding: 0 20px;
  }
`;

export const Page = styled.div`
  overflow-x: hidden;
`;

/* Type */

export const Eyebrow = styled.p`
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.brand};
`;

export const SectionTitle = styled.h2`
  margin: 0;
  max-width: 720px;
  font-size: clamp(2rem, 3.6vw, 2.9rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: ${({ theme }) => theme.color.textPrimary};
`;

export const SectionLead = styled.p`
  margin: 18px 0 0;
  max-width: 620px;
  font-size: 1.125rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.color.textSecondary};
`;

export const SectionHeader = styled.header<{ centered?: boolean }>`
  margin-bottom: 56px;

  ${({ centered }) =>
    centered &&
    css`
      text-align: center;

      ${SectionTitle}, ${SectionLead} {
        margin-left: auto;
        margin-right: auto;
      }
    `}

  ${mobile()} {
    margin-bottom: 36px;
  }
`;

export const Section = styled.section`
  padding: 128px 0;

  ${mobile()} {
    padding: 80px 0;
  }
`;

/* Buttons and links */

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  padding: 0 26px;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, transform 150ms ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.brand};
    outline-offset: 3px;
  }

  svg {
    flex: none;
    fill: currentColor;
  }

  ${mobile()} {
    width: 100%;
  }
`;

export const PrimaryButton = styled.button`
  ${buttonBase};
  background-color: ${({ theme }) => theme.color.brand};
  color: ${INK};

  &:hover {
    background-color: #f5e266;
  }
`;

export const SecondaryButton = styled.a`
  ${buttonBase};
  background-color: ${rgba(BasePalette.White, 0.07)};
  color: ${({ theme }) => theme.color.textPrimary};

  &:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  &:hover {
    background-color: ${rgba(BasePalette.White, 0.12)};
  }
`;

export const ButtonRow = styled.div<{ centered?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: ${({ centered }) => (centered ? 'center' : 'flex-start')};

  ${mobile()} {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TextLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.textPrimary};
  text-decoration: none;

  &:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  svg {
    flex: none;
    fill: currentColor;
    transition: transform 150ms ease;
  }

  &:hover {
    color: ${({ theme }) => theme.color.brand};

    svg {
      transform: translateX(2px);
    }
  }
`;

/* Hero */

export const Hero = styled.section`
  position: relative;
  padding: 112px 0 0;
  text-align: center;

  /* A soft light behind the headline instead of a box around it */
  &::before {
    content: '';
    position: absolute;
    z-index: 0;
    top: -260px;
    left: 50%;
    width: 1100px;
    height: 760px;
    transform: translateX(-50%);
    background: radial-gradient(
      closest-side,
      ${rgba(BasePalette.Brand, 0.13)},
      ${rgba(BasePalette.Brand, 0)}
    );
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  ${mobile()} {
    padding-top: 64px;
  }
`;

export const HeroEyebrow = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 28px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.textSecondary};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.color.brand};
    box-shadow: 0 0 0 4px ${rgba(BasePalette.Brand, 0.18)};
  }
`;

export const HeroTitle = styled.h1`
  margin: 0 auto;
  max-width: 900px;
  font-size: clamp(2.75rem, 7vw, 5rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: ${({ theme }) => theme.color.textPrimary};

  span {
    color: ${({ theme }) => theme.color.brand};
  }
`;

export const HeroLead = styled.p`
  margin: 28px auto 40px;
  max-width: 640px;
  font-size: clamp(1.075rem, 1.6vw, 1.25rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.color.textSecondary};

  ${mobile()} {
    margin: 20px auto 32px;
  }
`;

/* The terminal under the hero: the one framed object above the fold */

const reveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: none;
  }
`;

const highlight = keyframes`
  0%, 25% {
    color: inherit;
    background-color: transparent;
  }

  40%, 70% {
    color: ${INK};
    background-color: ${BasePalette.Brand};
    box-shadow: 0 0 0 3px ${BasePalette.Brand};
  }

  80%, 100% {
    color: inherit;
    background-color: transparent;
  }
`;

export const Terminal = styled.div`
  max-width: 860px;
  margin: 72px auto 0;
  border-radius: 16px;
  background-color: ${INK};
  box-shadow: 0 0 0 1px ${rgba(BasePalette.White, 0.06)}, 0 40px 120px -20px rgba(0, 0, 0, 0.7);
  text-align: left;
  overflow: hidden;

  ${mobile()} {
    margin-top: 48px;
    border-radius: 12px;
  }
`;

export const TerminalBar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 18px;

  i {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background-color: ${rgba(BasePalette.White, 0.14)};
  }

  span {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-family: ${MONO};
    font-size: 13px;
    color: ${({ theme }) => theme.color.textLight};
    white-space: nowrap;
  }
`;

export const TerminalBody = styled.div`
  padding: 24px 40px 40px;
  font-family: ${MONO};
  font-size: 1.15rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.color.textPrimary};

  ${mobile()} {
    padding: 16px 20px 28px;
    font-size: 0.95rem;
  }
`;

export const TerminalLine = styled.p<{ delay: number }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 14px;
  margin: 0 0 14px;
  opacity: 0;
  animation: ${reveal} 300ms ease-out forwards;
  animation-delay: ${({ delay }) => delay}s;

  &::before {
    content: '$';
    color: ${({ theme }) => theme.color.brand};
  }

  &:last-child {
    margin-bottom: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    animation: none;
  }
`;

export const HighlightText = styled.span<{ delaySeconds: number }>`
  border-radius: 3px;
  animation: ${highlight} 15s linear infinite;
  animation-delay: ${({ delaySeconds }) => delaySeconds}s;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    color: ${INK};
    background-color: ${BasePalette.Brand};
    box-shadow: 0 0 0 3px ${BasePalette.Brand};
  }
`;

/* Under the terminal: the languages, then the teacher's links and the job board */

export const HeroLanguages = styled.div`
  margin-top: 64px;

  p {
    margin: 0 0 18px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.textLight};
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin: 0 auto;
    padding: 0;
    list-style: none;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 38px;
    padding: 0 14px 0 10px;
    border-radius: 999px;
    background-color: ${rgba(BasePalette.White, 0.05)};
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.color.textPrimary};
    text-decoration: none;
    transition: background-color 150ms ease;
  }

  a:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  a:hover {
    background-color: ${rgba(BasePalette.White, 0.1)};
  }

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
    flex: none;
  }

  ${mobile()} {
    margin-top: 48px;

    a {
      height: 34px;
      font-size: 13px;
    }

    img {
      width: 18px;
      height: 18px;
    }
  }
`;

export const FollowRow = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px 24px;
  margin-top: 36px;
  font-size: 15px;
  color: ${({ theme }) => theme.color.textLight};

  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: ${({ theme }) => theme.color.textSecondary};
    text-decoration: none;
    transition: color 150ms ease;
  }

  a:visited {
    color: ${({ theme }) => theme.color.textSecondary};
  }

  a:hover {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  svg {
    flex: none;
    fill: currentColor;
  }

  ${mobile()} {
    gap: 12px 18px;
    font-size: 14px;

    > span {
      flex-basis: 100%;
    }
  }
`;

export const JobLink = styled.a`
  && {
    color: ${({ theme }) => theme.color.brand};
  }

  &&:hover {
    color: #f5e266;
  }

  svg {
    transition: transform 150ms ease;
  }

  &:hover svg {
    transform: translateX(2px);
  }
`;

/* Proof: numbers and the companies learners went on to */

export const Stats = styled.dl`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
  margin: 0;

  div {
    display: flex;
    flex-direction: column;
  }

  dt {
    font-size: 15px;
    line-height: 1.5;
    color: ${({ theme }) => theme.color.textSecondary};
  }

  dd {
    order: -1;
    margin: 0 0 8px;
    font-size: clamp(2.25rem, 4vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    color: ${({ theme }) => theme.color.textPrimary};
  }

  ${mobile()} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px 20px;
  }
`;

export const LogoCloud = styled.div`
  margin-top: 96px;
  text-align: center;

  p {
    margin: 0 0 28px;
    font-size: 14px;
    color: ${({ theme }) => theme.color.textLight};
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 28px 52px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: center;
    height: 32px;
  }

  img {
    display: block;
    width: auto;
    height: 30px;
    max-width: 104px;
    /* Every logo as the same quiet white silhouette */
    filter: brightness(0) invert(1);
    opacity: 0.45;
    transition: opacity 150ms ease;
  }

  li:hover img {
    opacity: 0.85;
  }

  ${mobile()} {
    margin-top: 64px;

    ul {
      gap: 24px 32px;
    }

    img {
      height: 24px;
    }
  }
`;

/* What's in the course */

export const Features = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 56px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${tablet()} {
    gap: 40px;
  }

  ${mobile()} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Feature = styled.li`
  > svg {
    display: block;
    margin-bottom: 20px;
    fill: ${({ theme }) => theme.color.brand};
  }

  h3 {
    margin: 0 0 10px;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: ${({ theme }) => theme.color.textPrimary};
  }

  p {
    margin: 0 0 16px;
    line-height: 1.65;
    color: ${({ theme }) => theme.color.textSecondary};
  }
`;

/* The three live demos */

export const Demo = styled(Section)`
  scroll-margin-top: 24px;
`;

export const DemoFrame = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background-color: ${INK};
  box-shadow: 0 0 0 1px ${rgba(BasePalette.White, 0.06)}, 0 30px 80px -30px rgba(0, 0, 0, 0.6);

  ${mobile()} {
    border-radius: 12px;
  }
`;

/* Course outline: a numbered list, not a wall of cards */

export const Outline = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 48px;
  margin: 0 0 48px;
  padding: 0;
  list-style: none;
  counter-reset: topic;

  li {
    counter-increment: topic;
  }

  a {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding: 18px 0;
    font-size: 1.075rem;
    font-weight: 600;
    color: ${({ theme }) => theme.color.textPrimary};
    text-decoration: none;
    box-shadow: inset 0 -1px 0 ${rgba(BasePalette.White, 0.07)};
    transition: color 150ms ease;
  }

  a:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  a::before {
    content: counter(topic, decimal-leading-zero);
    font-family: ${MONO};
    font-size: 0.85rem;
    font-weight: 400;
    color: ${({ theme }) => theme.color.textLight};
  }

  a:hover {
    color: ${({ theme }) => theme.color.brand};
  }

  ${tablet()} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mobile()} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/* The teacher: a title on the left, the bio on the right */

export const Teacher = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 72px;

  ${SectionLead} {
    margin: 0 0 24px;
  }

  ${tablet()} {
    gap: 48px;
  }

  ${mobile()} {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
`;

/* Closing call to action */

export const Closing = styled.section`
  position: relative;
  padding: 144px 0 152px;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    z-index: 0;
    left: 50%;
    bottom: -200px;
    width: 1000px;
    height: 640px;
    transform: translateX(-50%);
    background: radial-gradient(
      closest-side,
      ${rgba(BasePalette.Brand, 0.1)},
      ${rgba(BasePalette.Brand, 0)}
    );
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  ${SectionTitle} {
    margin: 0 auto;
    font-size: clamp(2.5rem, 5.5vw, 4rem);
    letter-spacing: -0.035em;
  }

  ${SectionLead} {
    margin: 20px auto 40px;
  }

  ${mobile()} {
    padding: 96px 0 104px;
  }
`;

/* Only when the course isn't free: buy a gift card now, start later */

export const GiftCard = styled.div`
  margin-top: 64px;
  max-width: 620px;

  ul {
    margin: 16px 0 24px;
    padding-left: 20px;
    line-height: 1.8;
    color: ${({ theme }) => theme.color.textSecondary};
  }

  small {
    display: block;
    margin-top: 16px;
    color: ${({ theme }) => theme.color.textLight};
  }
`;
