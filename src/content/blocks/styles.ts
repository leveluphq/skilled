import styled from 'styled-components';
import { Container } from 'style/elements';
import { BLOCK_MARGIN } from 'components/blocks/StyledMarkdown/styles';

export const MarginContainer = styled(Container)`
  margin-top: ${BLOCK_MARGIN}px;
`;

export const MarginContainerCenter = styled(MarginContainer)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ItemWithMargin = styled.div`
  margin-top: ${BLOCK_MARGIN}px;
`;
