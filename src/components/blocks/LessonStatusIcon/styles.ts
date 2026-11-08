import styled from 'styled-components';
import { Help16, CheckmarkOutline16 } from '@carbon/icons-react';

export const ReviewIcon = styled(Help16)`
  fill: ${({ theme }) => theme.color.error};
  flex-shrink: 0;
`;

export const CompleteIcon = styled(CheckmarkOutline16)`
  fill: ${({ theme }) => theme.color.cta};
  flex-shrink: 0;
`;
