import styled from 'styled-components';
import { rawButtonStyles } from 'style/elements';

export const Header = styled.h2`
  font-weight: 600;
`;

export const Description = styled.p`
  margin-top: 10px;
`;

export const ButtonWrapper = styled.div`
  margin-top: 20px;
  width: 100%;
`;

export const CTAButton = styled.a`
  ${rawButtonStyles};
  color: ${(props) => props.theme.color.textPrimary};
  background-color: ${(props) => props.theme.color.cta};
  width: 100%;
  font-weight: 600;
  padding: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  font-size: 1em;

  &:hover {
    background-color: ${(props) => props.theme.color.ctaHover};
  }
`;
