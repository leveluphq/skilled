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
  width: 62%;
  padding: 0;

  ${mobile()} {
    margin-bottom: 1rem;
    width: 100%;
    padding: 0;
  }
`;

/* The chapters as a plain list beside the video, not a stack of boxes */
export const ItemContents = styled(Item)`
  width: 38%;
  padding: 0 0 0 48px;

  li {
    margin: 0;
    border-radius: 0;
    background: transparent;
    font-size: 15px;
  }

  button,
  button:hover,
  button:focus {
    padding: 16px 0;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.07);
  }

  button:hover,
  button:focus {
    color: ${({ theme }) => theme.color.brand};
  }

  button span:last-child {
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 13px;
    color: ${({ theme }) => theme.color.textLight};
  }

  ${mobile()} {
    width: 100%;
    padding: 0;
  }
`;

export const ChaptersTitle = styled.p`
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.textLight};
`;

export const StyledVideoBox = styled(VideoBox)`
  border-radius: 16px;
  overflow: hidden;
  background-color: #0b0c0e;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 30px 80px -30px rgba(0, 0, 0, 0.6);
`;
