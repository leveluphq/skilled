import styled from 'styled-components';
import { DarkPalette } from 'style/theme';
import { RawButton } from 'style/elements';
import { rgba } from 'style/utils/color';

const UNDERLINE_HEIGHT = 4;

export const TriggerButton = styled(RawButton)`
  color: inherit;
  font-weight: inherit;
  background-image: linear-gradient(
    transparent 0%,
    transparent calc(50% - ${UNDERLINE_HEIGHT}px),
    ${({ theme }) => rgba(theme.color.highlight, 0.6)} calc(50% - ${UNDERLINE_HEIGHT}px),
    ${({ theme }) => rgba(theme.color.highlight, 0.6)} 100%
  );
  background-size: 100% 200%;
  transition: background-position 125ms ease-in-out 0s, padding 125ms ease-in-out 0s;
  background-position: 0px 0px;
  padding: 0;
  padding: 2px 0px 3px;

  &:hover,
  &:focus {
    background-position: 0px 100%;
    background-image: linear-gradient(
      transparent 0%,
      transparent calc(50% - ${UNDERLINE_HEIGHT}px),
      ${({ theme }) => theme.color.highlight} calc(50% - ${UNDERLINE_HEIGHT}px),
      ${({ theme }) => theme.color.highlight} 100%
    );
    color: ${DarkPalette.Black2};
    outline: none;
  }
`;
