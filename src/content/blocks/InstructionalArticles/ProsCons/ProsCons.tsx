import React from 'react';
import { Props, Item } from './props';
import { Container } from 'style/elements';

import {
  Wrapper,
  Column,
  SectionTitle,
  List,
  ListItem,
  ItemTitle,
  ItemDescription,
} from './styles';

const ProCon: React.FC<{ item: Item }> = ({ item }) => {
  return (
    <ListItem>
      <ItemTitle>{item.title}</ItemTitle>
      {!!item.description && <ItemDescription>{item.description}</ItemDescription>}
    </ListItem>
  );
};

const ProsCons: React.FC<Props> = ({ pros, cons }) => {
  return (
    <Container>
      <Wrapper>
        <Column>
          <SectionTitle>Pros 🔥</SectionTitle>
          <List>
            {pros.map(item => (
              <ProCon item={item} key={item.title} />
            ))}
          </List>
        </Column>
        <Column>
          <SectionTitle>Cons 🤕</SectionTitle>
          <List>
            {cons.map(item => (
              <ProCon item={item} key={item.title} />
            ))}
          </List>
        </Column>
      </Wrapper>
    </Container>
  );
};

export default ProsCons;
