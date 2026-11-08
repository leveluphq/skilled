import styled from 'styled-components';
import { BLOCK_MARGIN } from 'components/blocks/StyledMarkdown/styles';

export const Wrapper = styled.div`
  margin-top: ${BLOCK_MARGIN}px;
`;

export const QuestionText = styled.div`
  color: ${({ theme }) => theme.color.textSecondary};
  font-weight: 300;
  text-transform: uppercase;
  font-size: 14px;
`;
