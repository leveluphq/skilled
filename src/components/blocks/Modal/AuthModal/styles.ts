import styled from 'styled-components';

export const Header = styled.h2`
  font-weight: 600;
`;

export const Description = styled.p`
  margin-top: 10px;
`;

export const Disclaimer = styled.p`
  color: ${props => props.theme.color.textSecondary};
  font-weight: 300;
  font-size: 12px;
  margin-top: 24px;
`;

export const ButtonWrapper = styled.div`
  margin-top: 20px;
  width: 100%;
`;
