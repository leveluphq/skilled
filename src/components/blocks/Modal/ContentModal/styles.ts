import styled from 'styled-components';
import { Content } from 'components/blocks/StyledMarkdown/styles';
import { ModalContent as BaseModalContent } from '../styles';

export const MarkdownContent = styled(Content)`
  text-align: left;
`;

export const ModalContent = styled(BaseModalContent)`
  text-align: left;
  padding: 32px;
`;

export const Title = styled.h3`
  color: ${({ theme }) => theme.color.brand};
  text-align: left;
  font-size: 1.5em;
  margin-bottom: 16px;
`;
