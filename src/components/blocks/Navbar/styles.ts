import styled, { css } from 'styled-components';
import BaseHeadroom from 'react-headroom';
import { FOCUS_WIDTH } from 'style/theme';
import { RawButton, rawButtonStyles, ActionButtonLink } from 'style/elements';
import { SIDEBAR_WIDTH } from 'components/blocks/Sidebar/styles';
import { mobile, tablet, xl } from 'style/breakpoints';
import {
  Trigger as DropdownTrigger,
  TriggerDesktop,
  TriggerMobile,
  DropdownMenu,
} from 'components/blocks/Dropdown/styles';
import { pageWidthStyles } from 'style/elements';
import { rgba } from 'style/utils/color';

export const FADE_TIMER_MS = 200;
const FONT_SIZE_EM = 0.9;

const sidebarRightStyles = css`
  ${xl()} {
    margin-right: auto;
  }
`;

const sidebarLeftStyles = css`
  ${xl()} {
    margin-left: auto;
  }
`;

export const wrapperStyles = css<{ sidebar?: boolean; right?: boolean }>`
  ${({ sidebar, right }) => (sidebar ? (right ? sidebarRightStyles : sidebarLeftStyles) : null)};
  width: ${({ sidebar }) => (sidebar ? `calc(100vw - ${SIDEBAR_WIDTH}px)` : '100vw')};

  ${mobile()} {
    width: 100vw;
  }
`;

export const contentStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 ${({ theme }) => theme.spacing.gutter}px;

  ${tablet()} {
    padding: 0;
  }
`;

export const Header = styled.header<{
  isFixed?: boolean;
  sidebar?: boolean;
  right?: boolean;
}>`
  ${wrapperStyles};
  background: ${({ theme }) => theme.color.backgroundPrimary};
  box-shadow: inset 0 -1px 0 0 hsla(0, 0%, 100%, 0.1);
  color: ${(props) => props.theme.color.textPrimary};
  z-index: ${(props) => props.theme.zIndex.z8};
  top: 0;
  left: 0;

  --navbar-width: ${({ sidebar }) => (sidebar ? `calc(100vw - ${SIDEBAR_WIDTH}px)` : '100vw')};

  ${mobile()} {
    --navbar-width: 100vw;
  }

  ${tablet()} {
    ${DropdownTrigger} {
      padding: 0;
    }

    ${TriggerDesktop} {
      display: none;
    }

    ${TriggerMobile} {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    ${DropdownMenu} {
      width: var(--navbar-width);
      top: ${({ theme }) => theme.spacing.navHeight - 2}px;
    }
  }
`;

export const Content = styled.nav`
  background: transparent;
  ${pageWidthStyles};
  ${contentStyles};
`;

export const Section = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  flex: 0 0 auto;
  width: auto;

  &:first-child {
    justify-content: flex-start;
    flex: 1 1 auto;
    min-width: 0;
  }

  &:last-child {
    justify-content: flex-end;
  }
`;

export const Logo = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  margin-right: 12px;
  height: ${(props) => props.theme.spacing.navHeight}px;

  ${tablet()} {
    margin-right: 0;
    flex-shrink: 0;
  }

  a {
    display: flex;
    height: 100%;
    align-items: center;
    padding-left: 12px;
    padding-right: 12px;
    color: ${({ theme }) => theme.color.brand};
    transition: color 150ms ease, background 150ms ease;

    ${tablet()} {
      padding-left: 8px;
      padding-right: 8px;
    }

    &:visited {
      color: ${({ theme }) => theme.color.brand};
    }

    &:focus {
      outline-offset: -${FOCUS_WIDTH}px;
    }
  }
`;

export const CTAButton = styled(RawButton)`
  color: ${(props) => props.theme.color.textPrimary};
  border: 2px solid ${(props) => props.theme.color.cta};
  border-radius: 2px;
  width: 200px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  font-size: 0.9em;

  &:hover {
    background-color: ${(props) => props.theme.color.cta};
  }

  &:focus {
    background-color: ${(props) => props.theme.color.cta};
  }
`;

/** The navbar's call to star the open-source repository: a button, not a plain nav link. */
export const StarButton = styled.a`
  display: inline-flex;
  align-items: center;
  flex: none;
  gap: 8px;
  height: 34px;
  margin-right: 16px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => rgba(theme.color.textPrimary, 0.28)};
  border-radius: 6px;
  background-color: ${({ theme }) => rgba(theme.color.textPrimary, 0.06)};
  color: ${({ theme }) => theme.color.textPrimary};
  font-size: ${FONT_SIZE_EM - 0.05}em;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition: color 150ms ease, border-color 150ms ease, background-color 150ms ease;

  &:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  svg {
    flex: none;
    fill: currentColor;
  }

  &:hover,
  &:focus-visible {
    outline: none;
    color: ${({ theme }) => theme.color.brand};
    border-color: ${({ theme }) => theme.color.brand};
    background-color: ${({ theme }) => rgba(theme.color.brand, 0.1)};
  }

  ${tablet()} {
    width: 34px;
    margin-right: 4px;
    padding: 0;
    justify-content: center;
  }
`;

/** Hidden on small screens, but still read by screen readers, so the icon-only button keeps its name. */
export const StarButtonText = styled.span`
  ${tablet()} {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;

export const UpgradeButton = styled(ActionButtonLink)`
  margin-right: 16px;
  font-size: ${FONT_SIZE_EM - 0.05}em;

  ${tablet()} {
    display: none;
  }
`;

export const NavDropdownText = styled.span`
  font-size: ${FONT_SIZE_EM}em;
`;

export const navItem = css`
  height: ${(props) => props.theme.spacing.navHeight}px;
  display: flex;
  align-items: center;
  margin: 0 8px;
  padding: 0 12px;
  position: relative;
  line-height: 1;
  transition: color 175ms ease-in-out, box-shadow 175ms ease-in-out;
  box-shadow: inset 0 0 0 ${({ theme }) => theme.color.brand};
  font-size: ${FONT_SIZE_EM}em;

  svg {
    margin-left: 4px;
    transition: fill 175ms ease;
  }

  &:hover,
  &:focus {
    outline: none;
    color: ${({ theme }) => theme.color.brand};
    box-shadow: inset 0 -3px 0 ${({ theme }) => theme.color.brand};

    svg {
      fill: ${({ theme }) => theme.color.brand};
    }
  }
`;

export const NavItem = styled.a<{ displayMobile?: boolean }>`
  ${navItem};

  ${tablet()} {
    display: ${({ displayMobile }) => (displayMobile ? 'flex' : 'none')};
    margin: 0;
    padding-left: 6px;
    padding-right: 6px;
    white-space: nowrap;
  }
`;

export const AuthButton = styled(RawButton)`
  ${rawButtonStyles};
  ${navItem};
  border-radius: 0;
  font-size: ${FONT_SIZE_EM}em;
  color: ${({ theme }) => theme.color.textPrimary};

  ${tablet()} {
    display: none;
  }
`;

export const Headroom = styled(BaseHeadroom)<{ isFocused: boolean; isFixed?: boolean }>`
  .headroom {
    z-index: ${({ theme }) => theme.zIndex.z2}!important;

    ${({ isFocused, isFixed }) =>
      isFocused || isFixed
        ? `
        transform: translateY(0) !important;
        position: fixed !important;
      `
        : ''}
  }
`;

export const HideDesktop = styled.div`
  display: none;

  ${tablet()} {
    display: flex;
    align-items: center;
  }
`;
export const HideMobile = styled.div`
  display: block;

  ${tablet()} {
    display: none;
  }
`;

export const LogoLink = styled.a`
  justify-content: center;
`;

export const HiddenItem = styled.div<{ show: boolean; isFirstLoad: boolean }>`
  opacity: ${({ show }) => (show ? 1 : 0)};
  ${({ isFirstLoad }) =>
    isFirstLoad ? `transition: opacity ${FADE_TIMER_MS}ms ease-in-out 0s` : ''};
`;

export const DropdownWrapper = styled.div`
  margin: 0 8px;

  ${tablet()} {
    margin: 0;
  }
`;
