import * as React from 'react';
import styled from 'styled-components';

interface Props {
  startColor?: string;
  endColor?: string;
  borderWidth?: string;
  radius?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: number;
}

// background-image: linear-gradient(90deg,#FF4D4D,#F9CB28);

const DEFAULT_START_COLOR = '#00DFD8';
const DEFAULT_END_COLOR = '#007CF0';
const DEFAULT_BORDER_WIDTH = '2px';
const DEFAULT_PADDING = '12px';
const DEFAULT_RADIUS = '32px';
const DEFAULT_FONT_SIZE = '0.9em';
const DEFAULT_FONT_WEIGHT = '600';

export const GradientWrapper = styled.div`
  position: relative;
  width: 100%;
  background: inherit;
`;

export const GradientForeground = styled.div<Props>`
  padding: ${({ padding = DEFAULT_PADDING }) => padding};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: auto;

  position: relative;

  color: ${({ theme }) => theme.color.textPrimary};
  background: inherit;
  background-clip: padding-box;
  border: ${({ borderWidth = DEFAULT_BORDER_WIDTH }) => `solid ${borderWidth} transparent`};
  border-radius: ${({ radius = DEFAULT_RADIUS }) => radius};
  z-index: 1;

  padding: ${({ padding = DEFAULT_PADDING }) => padding};
  font-size: ${({ fontSize = DEFAULT_FONT_SIZE }) => fontSize};
  font-weight: ${({ fontWeight = DEFAULT_FONT_WEIGHT }) => fontWeight};
`;

export const GradientBackground = styled.div<Props>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  border-radius: ${({ radius = DEFAULT_RADIUS }) => radius};
  background: ${({ startColor = DEFAULT_START_COLOR, endColor = DEFAULT_END_COLOR }) =>
    `linear-gradient(90deg, ${startColor}, ${endColor})`};
`;

const GradientBorder: React.FC<Props> = ({ children, ...props }) => {
  return (
    <GradientWrapper>
      <GradientForeground {...props}>{children}</GradientForeground>
      <GradientBackground {...props} />
    </GradientWrapper>
  );
};

export default GradientBorder;
