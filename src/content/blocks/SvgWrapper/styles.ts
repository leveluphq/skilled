import styled, { css } from 'styled-components';
import { Props } from './props';

export const svgStyles = css<Props>`
  svg {
    color: ${({ theme }) => theme.color.textPrimary};
    fill: ${({ fill = 'currentColor' }) => fill};
  }

  path {
    color: ${({ theme }) => theme.color.textPrimary};
    stroke: ${({ stroke = 'currentColor' }) => stroke};
  }
`;

export const SvgColors = styled.div<Props>`
  color: ${({ theme }) => theme.color.textPrimary};
  display: flex;
  justify-content: center;

  ${svgStyles};
`;

export const SvgSimple = styled.div`
  ${svgStyles};

  svg {
    width: 100%;
    height: 100%;
  }
`;
