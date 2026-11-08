import * as React from 'react';

import { Container, Img, Credit } from './styles';

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit?: React.ReactNode;
  isVisuAlgo?: boolean;
  maxWidth?: string;
}

const VisuAlgo = () => (
  <span>
    Credit:{' '}
    <a href="https://visualgo.net/" target="_blank" rel="noopener noreferrer">
      VisuAlgo
    </a>
  </span>
);

const Image: React.FC<Props> = ({ src, alt, width, height, credit, isVisuAlgo, maxWidth }) => {
  return (
    <Container>
      <Img maxWidth={maxWidth} src={src} alt={alt} width={width} height={height} decoding="async" />
      {!!credit && <Credit>{credit}</Credit>}
      {!!isVisuAlgo && (
        <Credit>
          <VisuAlgo />
        </Credit>
      )}
    </Container>
  );
};

export default Image;
