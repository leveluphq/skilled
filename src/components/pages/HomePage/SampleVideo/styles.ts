import styled from 'styled-components';
import { mobile } from 'style/breakpoints';
import { VideoBox } from 'components/blocks/LessonVideo/styles';

export const Wrapper = styled.div`
  display: flex;

  ${mobile()} {
    flex-direction: column;
  }
`;

export const Item = styled.div`
  padding: 0 24px;

  ${mobile()} {
    width: 100%;
  }
`;

export const ItemVideo = styled(Item)`
  width: 60%;
  padding-right: 0;

  ${mobile()} {
    margin-bottom: 1rem;
    width: 100%;
    padding: 0;
  }
`;

export const ItemContents = styled(Item)`
  width: 40%;

  ${mobile()} {
    width: 100%;
    padding: 0;
  }
`;

export const StyledVideoBox = styled(VideoBox)`
  box-shadow: ${({ theme }) => `${theme.shadow.stroke}, ${theme.shadow.high}`};
  border: 6px solid ${({ theme }) => theme.color.brand};
  border-radius: 6px;
`;
