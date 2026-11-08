import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  line-height: 1;
`;

export const Box = styled.div`
  color: ${({ theme }) => theme.color.backgroundPrimary};
  background-color: ${({ theme }) => theme.color.textPrimary};
  padding: 8px;
  font-size: 28px;
  font-weight: 700;
  width: 56px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  border-radius: 2px;
`;

export const Colon = styled.div`
  font-size: 28px;
  margin: 0 6px;
`;
