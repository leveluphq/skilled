import styled, { css } from 'styled-components';
import { GhostButton } from 'style/elements';
import { mobile } from 'style/breakpoints';
import { SolutionButton as BaseSolutionButton } from '../styles';

export const Wrapper = styled.div`
  text-align: left;
  margin-top: 16px;
`;

const buttonStyles = css`
  width: 200px;
  height: 100%;
  min-height: 40px;
  font-size: 0.9em;

  ${mobile()} {
    width: 100%;
  }
`;

export const Button = styled(GhostButton)`
  ${buttonStyles};
`;

export const SolutionButton = styled(BaseSolutionButton)`
  ${buttonStyles};
  margin-left: 16px;

  ${mobile()} {
    margin-left: 0;
    margin-top: 8px;
  }
`;
