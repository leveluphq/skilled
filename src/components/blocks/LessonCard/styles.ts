import styled from 'styled-components';
import BaseCard from 'components/blocks/Card';

export const Title = styled.h3`
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Description = styled.p`
  color: ${props => props.theme.color.textSecondary};
  font-size: 14px;
  font-weight: 300;
  margin-top: 6px;
`;

export const Card = styled(BaseCard)`
  padding: 1rem 1.5rem;
`;