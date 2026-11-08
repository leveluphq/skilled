import styled from 'styled-components';
import { CONTAINER_STYLES } from 'style/elements';

export const Wrapper = styled.div``;

export const List = styled.ol`
  ${CONTAINER_STYLES};
  margin-bottom: 0;
  margin-top: 0;
  padding-left: 16px;
  font-size: 16px;
`;

export const ListItem = styled.li`
  font-size: 14px;
  line-height: 1.5;
  margin-top: 4px;
  padding-left: 6px;
`;

export const Blur = styled.div<{ isActive: boolean }>`
  transition: filter 100ms linear;
  filter: ${({ isActive }) => (isActive ? 'none' : 'blur(4px)')};
`;
