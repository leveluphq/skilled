import styled from 'styled-components';
import { mobile } from 'style/breakpoints';
import { RawButton, CONTAINER_STYLES } from 'style/elements';
import { SIDEBAR_WIDTH } from 'components/blocks/Sidebar/styles';

export const Title = styled.h1`
  color: ${({ theme }) => theme.color.brand};
  font-weight: bold;
  font-size: 2em;
  line-height: 1;

  ${mobile()} {
    font-size: 2em;
  }
`;

export const HeaderWrapper = styled.div`
  ${CONTAINER_STYLES};
`;

export const AuthWrapper = styled.div`
  margin-top: 40px;
  margin-bottom: 40px;

  ${mobile()} {
    display: none;
  }
`;

export const StyledLink = styled.a`
  display: inline-flex;
  align-items: center;
  line-height: 1;

  svg {
    margin-right: 4px;
  }
`;

export const CategoryLink = styled.a`
  display: inline-flex;
  align-items: center;
  line-height: 1;
  font-size: 1.2em;
  color: ${({ theme }) => theme.color.textSecondary};

  &:visited {
    color: ${({ theme }) => theme.color.textSecondary};
  }

  svg {
    margin-right: 4px;
  }
`;

export const CourseContentsLinkWrapper = styled.div`
  margin-bottom: 2rem;
`;

export const Description = styled.p`
  margin-top: 1rem;
  font-weight: 300;
`;

export const TitleContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const TitleText = styled.div`
  flex-grow: 1;
`;

export const TitleButtonWrapper = styled.div`
  flex-shrink: 0;
  position: absolute;
  right: ${SIDEBAR_WIDTH + 24}px;
  z-index: ${({ theme }) => theme.zIndex.z1};

  @media (max-width: 1200px) {
    position: static;
  }
`;

export const TitleButtons = styled.div`
  padding: 16px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export const FeedbackWrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

export const PreTitle = styled.div`
  text-transform: uppercase;
  font-weight: 600;
`;

const RADIUS = 3;
const HEIGHT = 44;
export const SummaryButton = styled(RawButton)`
  height: ${HEIGHT}px;
  padding: 8px 24px;
  border: 1px solid ${({ theme }) => theme.color.textPrimary};
  display: inline-flex;
  align-items: center;
  line-height: 1;
  transition: border 150ms ease, background-color 150ms ease;
  border-radius: ${RADIUS}px;
  font-size: 12px;
  flex-shrink: 0;
  font-weight: 600;

  svg {
    margin-left: 10px;
  }

  &:hover,
  &:focus {
    border: 1px solid ${({ theme }) => theme.color.buttonPrimary};
    background-color: ${({ theme }) => theme.color.buttonPrimary};
    color: ${({ theme }) => theme.color.textPrimary};

    svg {
      fill: ${({ theme }) => theme.color.textPrimary};
    }
  }
`;

export const PreTitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const ShareTitle = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.color.textSecondary};
`;

export const CopyButton = styled(RawButton)`
  text-decoration: underline;
  font-size: 14px;
  margin-left: 8px;
`;

export const FollowContainer = styled.div`
  display: flex;
  align-items: center;
`;
