import styled from 'styled-components';

export const Wrapper = styled.div`
  margin-top: 40px;
`;

export const TitleText = styled.div`
  font-weight: 400;
  margin-bottom: 16px;
  font-size: 18px;
  max-width: 680px;
  margin: 16px auto;
  line-height: 1.75;
`;

export const CountdownWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const MetaText = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  margin-top: 10px;
  font-size: 13px;
`;

export const StrikeThrough = styled.span`
  text-decoration: line-through;
  color: #727477;
`;

export const HighlightText = styled.span`
  background-color: ${({ theme }) => theme.color.brand};
  color: black;
  padding: 1px 8px;
  border-top-left-radius: 4px;
  border-bottom-right-radius: 4px;
`;
