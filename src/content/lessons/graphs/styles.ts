import styled from 'styled-components';

export const CustomSvg = styled.div`
  svg {
    width: 100%;
    height: 100%;
  }

  circle {
    stroke: currentColor;
    fill: ${({ theme }) => theme.color.backgroundSecondary};
  }
`;
