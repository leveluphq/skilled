import styled, { css } from 'styled-components';
import { RawButton } from 'style/elements';
import { FOCUS_WIDTH } from 'style/theme';
import { mobile } from 'style/breakpoints';

const RADIUS = 6;

export const Container = styled.div`
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
`;

export const Trigger = styled(RawButton)`
  height: ${(props) => props.theme.spacing.navHeight}px;
  outline-offset: -${FOCUS_WIDTH}px;
  padding-left: 11px;

  svg {
    fill: ${({ theme }) => theme.color.textPrimary};
  }

  ${mobile()} {
    padding: 0;
  }
`;

export const TriggerText = styled.span`
  display: inline-block;
  margin-right: 4px;
`;

export const TriggerDesktop = styled.span`
  display: inline-block;
  display: flex;
  align-items: center;

  ${mobile()} {
    display: none;
  }
`;

export const TriggerMobile = styled.span`
  width: ${({ theme }) => theme.spacing.navHeight}px;
  height: ${({ theme }) => theme.spacing.navHeight}px;
  display: none;

  ${mobile()} {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const DropdownMenu = styled.nav<{
  left?: boolean;
  minWidth: number;
  up?: boolean;
  verticalOffset?: number;
  mobileWidth?: string;
}>`
  position: absolute;
  right: ${({ left }) => (left ? 'auto' : 0)};
  left: ${({ left }) => (left ? 0 : 'auto')};
  top: ${({ theme, up, verticalOffset }) =>
    up ? 'auto' : `${verticalOffset || theme.spacing.navHeight - 6}px`};
  bottom: ${({ theme, up, verticalOffset }) =>
    up ? `${verticalOffset || theme.spacing.navHeight - 6}px` : 'auto'};
  background-color: ${({ theme }) => theme.color.dropdownBackground};
  color: ${({ theme }) => theme.color.textPrimary};
  min-width: ${({ minWidth }) => minWidth}px;
  box-shadow: ${({ theme }) => theme.shadow.stroke}, 0 8px 16px rgba(0, 0, 0, 0.8);
  border: 1px solid ${({ theme }) => theme.color.border};
  z-index: ${({ theme }) => theme.zIndex.z2};
  border-radius: ${RADIUS}px;

  ${mobile()} {
    width: ${({ mobileWidth }) => (mobileWidth ? mobileWidth : '100vw')};
    border: 2px solid ${({ theme }) => theme.color.invertedSecondary};
    top: ${({ theme, up, verticalOffset }) =>
      up ? 'auto' : `${verticalOffset || theme.spacing.navHeight - 2}px`};
    bottom: ${({ theme, up, verticalOffset }) =>
      up ? `${verticalOffset || theme.spacing.navHeight - 2}px` : 'auto'};
  }
`;

const dropdownItemStyles = css`
  display: block;
  transition: background-color 150ms ease;

  &:first-of-type {
    border-top-left-radius: ${RADIUS - 1}px;
    border-top-right-radius: ${RADIUS - 1}px;
  }

  &:last-of-type {
    border-bottom-left-radius: ${RADIUS - 1}px;
    border-bottom-right-radius: ${RADIUS - 1}px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.color.buttonPrimary};
  }

  &:focus {
    outline: none;
    background-color: ${({ theme }) => theme.color.buttonPrimary};
  }
`;

export const DropdownItemContent = styled.div`
  padding: 12px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  height: 40px;

  ${mobile()} {
    font-size: 1.2em;
    padding: 12px 24px;
  }
`;

export const DropdownLink = styled.a`
  ${dropdownItemStyles};
`;

export const DropdownButton = styled(RawButton)`
  ${dropdownItemStyles};
  width: 100%;
  padding: 0;
  text-align: left;
  border-radius: 0;
`;
