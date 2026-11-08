import styled from 'styled-components';

export const Line = styled.hr`
  background-color: ${({ theme }) => theme.color.border};
`;

export const BlurredContentWrapper = styled.div`
  padding-bottom: 34px;
`;
