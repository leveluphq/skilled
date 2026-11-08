import * as React from 'react';
import { MarginContainer } from 'content/blocks/styles';
import { Props } from './props';

import { SvgColors } from './styles';

const SvgWrapper: React.FC<Props> = ({
  fill = 'currentColor',
  stroke = 'currentColor',
  children,
}) => {
  return (
    <MarginContainer>
      <SvgColors stroke={stroke} fill={fill}>
        {children}
      </SvgColors>
    </MarginContainer>
  );
};

export default SvgWrapper;
