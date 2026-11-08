import styled from 'styled-components';

export const Wrapper = styled.div`
  background-color: ${props => props.theme.color.backgroundPrimary};
  text-align: center;
  padding: 60px 0;
`;

export const Header = styled.h1`
  color: ${props => props.theme.color.brand};
  font-size: 40px;
  line-height: 1;
`;

export const Description = styled.p`
  color: ${props => props.theme.color.textPrimary};
  margin-top: 32px;

  &:first-of-type {
    font-size: 22px;
    font-weight: 600;
    margin-top: 12px;
  }
`;

export const CardWrapper = styled.div`
  font-weight: 300;
  margin-top: 32px;
  text-align: left;
  font-size: 14px;
`;

export const CardSection = styled.div`
  margin-bottom: 16px;
  line-height: 1.5;

  &:last-of-type {
    margin-bottom: 0;
  }
`;
