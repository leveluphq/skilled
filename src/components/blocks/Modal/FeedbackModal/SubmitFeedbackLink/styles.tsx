import styled from 'styled-components';
import { RawButton } from 'style/elements';

export const Text = styled(RawButton)`
  color: ${({ theme }) => theme.color.textPrimary};
  padding: 0;
  line-height: 1;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  outline: none;

  &:focus,
  &:hover {
    outline: none;
    text-decoration: underline;
  }
`;
