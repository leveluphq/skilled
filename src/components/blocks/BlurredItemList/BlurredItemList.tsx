import * as React from 'react';

import { Wrapper, List, ListItem, Blur } from './styles';

interface Props {
  items: React.FC[];
  viewedCount: number;
}

const BlurredItemList: React.FC<Props> = ({ items, viewedCount = 0 }) => {
  return (
    <Wrapper>
      <List>
        {items.map((Item, i) => (
          <ListItem key={i}>
            <Blur isActive={i < viewedCount}>
              <Item />
            </Blur>
          </ListItem>
        ))}
      </List>
    </Wrapper>
  );
};

export default BlurredItemList;
