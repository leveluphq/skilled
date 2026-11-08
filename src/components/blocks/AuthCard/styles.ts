import styled, { css } from 'styled-components';
import { rgba } from 'style/utils/color';
import { RawButton } from 'style/elements';
import { mobile } from 'style/breakpoints';

export const Container = styled.div`
  border: 2px solid ${({ theme }) => theme.color.basePalette.SkyBlue};
  background-color: ${({ theme }) => rgba(theme.color.basePalette.SkyBlue, 0.1)};
  padding: 1.5rem;
`;

export const Title = styled.h3`
  font-weight: 400;
  font-size: 1.25em;
  text-align: center;
  line-height: 1;

  ${mobile()} {
    line-height: 1.5;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  margin-top: 1.5rem;
  justify-content: center;

  ${mobile()} {
    flex-direction: column;
  }
`;

const buttonStyles = css`
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 200ms ease-in-out, opacity 200ms ease-in-out;
  padding: 0.75rem;
  width: 50%;
  line-height: 1;

  &:first-child {
    margin-right: 0.5rem;

    ${mobile()} {
      margin: 0;
      margin-bottom: 1rem;
    }
  }

  &:last-child {
    margin-left: 0.5rem;

    ${mobile()} {
      margin: 0;
    }
  }

  ${mobile()} {
    width: 100%;
  }
`;

export const RegisterButton = styled(RawButton)`
  ${buttonStyles};
  color: ${(props) => props.theme.color.textPrimary};
  background-color: ${({ theme }) => theme.color.cta};
  font-weight: 600;

  &:hover {
    background-color: ${({ theme }) => rgba(theme.color.cta, 0.85)};
  }
`;

export const UpgradeButton = styled.a`
  ${buttonStyles};
  color: ${(props) => props.theme.color.textPrimary};
  background-color: ${(props) => props.theme.color.alert};
  font-weight: 600;

  &:hover {
    background-color: ${(props) => props.theme.color.alertHover};
  }
`;
