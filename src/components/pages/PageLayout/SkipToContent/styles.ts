import styled from 'styled-components';
import { FOCUS_WIDTH } from 'style/theme';
import { Button } from 'style/elements';

export const SkipButton = styled(Button)`
  position: fixed;
  top: -80px;
  left: 0;
  z-index: ${props => props.theme.zIndex.z8};
  height: ${props => props.theme.spacing.navHeight}px;
  padding: 0 2rem;
  font-weight: 400;

  &:focus {
    top: 0;
    outline-offset: -${FOCUS_WIDTH}px;
  }
`;
