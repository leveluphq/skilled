import styled from 'styled-components';

export const CodeWrapper = styled.div`
  position: relative;
`;

export const LanguageSelector = styled.div`
  position: absolute;
  right: 6px;
  top: 4px;
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.textSecondary};
`;
