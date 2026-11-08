import styled, { css } from 'styled-components';
import { mobile } from 'style/breakpoints';
import { SIDEBAR_WIDTH } from 'components/blocks/Sidebar/styles';
import { pageWidthStyles, ButtonLink, GhostButton } from 'style/elements';
import companyStyle from 'style/company';

const SECTION_SPACING = 12;

const sidebarRightStyles = css`
  margin-right: ${SIDEBAR_WIDTH}px;

  ${mobile()} {
    margin-left: 0;
    margin-right: 0;
  }
`;

const sidebarLeftStyles = css`
  margin-left: ${SIDEBAR_WIDTH}px;

  ${mobile()} {
    margin-left: 0;
    margin-right: 0;
  }
`;

export const Wrapper = styled.footer<{ sidebar?: boolean; right?: boolean }>`
  background-color: ${({ theme }) => theme.color.backgroundSecondary};
  color: ${({ theme }) => theme.color.textSecondary};
  font-weight: 400;
  ${({ sidebar, right }) => (sidebar ? (right ? sidebarRightStyles : sidebarLeftStyles) : null)};
  border-top: 1px solid ${({ theme }) => theme.color.border};
`;

export const FooterSection = styled.div`
  color: ${({ theme }) => theme.color.textPrimary};
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  line-height: 1.6;

  &:first-of-type {
    margin-bottom: ${SECTION_SPACING}px;
  }

  ${mobile()} {
    justify-content: center;
  }
`;

export const FooterSectionText = styled(FooterSection)`
  font-size: 12px;
  color: ${({ theme }) => theme.color.textSecondary};
`;

export const Content = styled.div`
  ${pageWidthStyles};
  padding: 32px ${({ theme }) => theme.spacing.gutter}px;
  text-align: center;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 32px 24px;
  > nav {
    grid-column: 1 / -1;
    padding-top: 28px;
    border-top: 1px solid ${({ theme }) => theme.color.border};
  }
  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    > div:nth-child(3) {
      grid-column: 1 / -1;
    }
  }
  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
    padding-left: 18px;
    padding-right: 18px;
    gap: 24px;
  }

  ${mobile()} {
    padding-top: 28px;
  }
`;

export const ContentGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`;

export const TwitterButton = styled(ButtonLink)`
  background-color: ${companyStyle.color[companyStyle.Company.Twitter]};
  transition: background-color 150ms ease;
  padding: 7px 10px;
  border-radius: 3px;
  font-weight: 600;
  line-height: 1em;
  font-size: 0.78571429rem;
  margin-left: 8px;
  text-decoration: none;
  min-height: 44px;

  &:hover {
    background-color: ${companyStyle.hover[companyStyle.Company.Twitter]};
  }
`;

export const FooterLink = styled.a`
  transition: color 200ms ease;
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;

  &:visited {
    color: ${({ theme }) => theme.color.textSecondary};
  }

  &:hover {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  svg {
    fill: ${({ theme }) => theme.color.textSecondary};
    transition: fill 200ms ease;

    &:hover {
      fill: ${({ theme }) => theme.color.textPrimary};
    }
  }
`;

export const FeedbackButton = styled(GhostButton)`
  font-size: 12px;
  padding: 8px 16px;
  min-height: 44px;

  svg {
    margin-left: 8px;
  }
`;

export const SlackInvite = styled.a`
  text-decoration: none;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
`;

export const Divider = styled.span`
  margin-left: 8px;
  margin-right: 8px;
`;

export const ButtonSection = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  min-width: 0;
`;

export const FindJobButton = styled.a`
  background-color: ${({ theme }) => theme.color.cta};
  padding: 12px 32px;
  border-radius: 3px;
  font-weight: 600;
  text-decoration: none;
  min-height: 44px;
`;
