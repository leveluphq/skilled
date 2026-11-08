import styled from 'styled-components';

export const HightlightFrontPattern = styled.span`
  background-color: ${({ theme }) => theme.color.basePalette.SkyBlue};
  padding: 2px;
  padding-top: 3px;
  padding-bottom: 1px;
`;

export const HightlightBackPattern = styled.span`
  background-color: ${({ theme }) => theme.color.basePalette.Purple};
  padding: 2px;
  padding-top: 3px;
  padding-bottom: 1px;
`;

export const SolutionHighlight = styled.span`
  background-color: ${({ theme }) => theme.color.basePalette.Green};
  padding: 2px;
  padding-top: 3px;
  padding-bottom: 1px;
`;
