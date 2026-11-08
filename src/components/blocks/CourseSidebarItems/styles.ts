import styled from 'styled-components';

export const NavigateText = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  display: flex;
  align-items: center;
  margin-left: -1rem;

  svg {
    fill: ${({ theme }) => theme.color.textSecondary};
    width: 0.8em;
    height: 0.8em;
    margin-right: 6px;
  }
`;

export const ItemText = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  svg {
    width: 0.8em;
    height: 0.8em;
    flex-shrink: 0;
  }
`;
