import styled from 'styled-components';
import { RawButton } from 'style/elements';

export const ToggleButton = styled(RawButton)`
  font-size: 11px;
  font-weight: 300;
  display: flex;
  align-items: center;

  svg {
    will-change: transform;
    transition: transform 80ms linear;
    color: ${({ theme }) => theme.color.textSecondary};
    fill: currentColor;
    width: 14px;
    height: 14px;
    padding-top: 2px;
    margin-left: 2px;
  }
`;

export const LanguageSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  select {
    color: ${({ theme }) => theme.color.textSecondary};
    margin-left: 3px;
    font-size: 11px;
    font-weight: 300;
    background: transparent;
    border: none;
    cursor: pointer;
    appearance: none;
    position: relative;
  }

  select::-ms-expand {
    display: none;
  }
`;
