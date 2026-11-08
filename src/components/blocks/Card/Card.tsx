import styled from 'styled-components';

const Card = styled.div<{ hoverable?: boolean }>`
  border: 1px solid ${props => props.theme.color.border};
  background-color: ${({ theme }) => theme.color.paper};
  box-shadow: ${({ theme }) => theme.shadow.low};
  border-radius: 4px;
  transition: border 0.2s ease;
  padding: 1rem;

  &:hover {
    ${props => props.hoverable && `border: 1px solid ${props.theme.color.brand};`}
  }
`;

export default Card;
