import styled, { css } from 'styled-components';
import { BasePalette } from 'style/theme';
import { rgba } from 'style/utils/color';
import { RawButton } from 'style/elements';
import { mobile } from 'style/breakpoints';

/* A quiet prompt under the course header: a line of text and a button, not a boxed banner */

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px 24px;
  padding: 16px 16px 16px 24px;
  border-radius: 14px;
  background-color: ${rgba(BasePalette.Brand, 0.08)};

  ${mobile()} {
    flex-direction: column;
    align-items: stretch;
    padding: 20px;
  }
`;

export const Title = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  color: ${({ theme }) => theme.color.textPrimary};
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex: none;
  gap: 8px;

  ${mobile()} {
    flex-direction: column;
  }
`;

const buttonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 20px;
  border-radius: 9px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  transition: background-color 150ms ease;
`;

export const RegisterButton = styled(RawButton)`
  ${buttonStyles};
  color: #0b0c0e;
  background-color: ${({ theme }) => theme.color.brand};

  &:hover {
    background-color: #f5e266;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.brand};
    outline-offset: 2px;
  }
`;

export const UpgradeButton = styled.a`
  ${buttonStyles};
  color: ${({ theme }) => theme.color.textPrimary};
  background-color: ${rgba(BasePalette.White, 0.08)};

  &:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  &:hover {
    background-color: ${rgba(BasePalette.White, 0.14)};
  }
`;
