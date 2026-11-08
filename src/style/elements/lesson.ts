import styled, { css } from 'styled-components';
import { mobile } from 'style/breakpoints';
import { Container } from 'style/elements';

const SECTION_PADDING_TOP = 30;
const SECTION_PADDING_BOTTOM = 36;

export const BaseSection = styled.section`
  padding-top: ${SECTION_PADDING_TOP}px;
  padding-bottom: ${SECTION_PADDING_BOTTOM}px;
`;

export const Section = styled(BaseSection)`
  &:first-of-type {
    padding-top: 0;
  }

  &:nth-of-type(2n) {
    background-color: ${(props) => props.theme.color.backgroundSecondary};
  }

  &:nth-of-type(2n - 1) {
    background-color: ${(props) => props.theme.color.backgroundPrimary};
  }
`;

export const videoWrapperStyles = css`
  display: flex;
  justify-content: center;
  position: relative;

  .react-player {
    ${mobile()} {
      position: absolute;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
    }
  }
`;

export const VideoWrapper = styled(Container)`
  ${videoWrapperStyles};
  margin-top: 40px;

  ${mobile()} {
    padding-top: 56.25%; /* Player ratio: 100 / (1280 / 720) */
  }
`;
