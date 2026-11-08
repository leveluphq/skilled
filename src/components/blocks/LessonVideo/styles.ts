import styled from 'styled-components';
import { RawButton } from 'style/elements';

export const VideoBox = styled.div``;

export const VideoWrapper = styled.div<{ videoWidth: number; videoHeight: number }>`
  position: relative;
  padding-bottom: ${({ videoWidth, videoHeight }) => 100 / (videoWidth / videoHeight)}%;
  height: 0;
  flex-shrink: 0;

  .react-player {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

export const VideoChanges = styled.aside`
  margin: 16px 16px 0;
  padding: 12px 16px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.color.backgroundSecondary};
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 14px;

  p {
    margin: 0;
  }

  p:first-child {
    color: ${({ theme }) => theme.color.textPrimary};
    font-weight: 600;
  }

  p + p {
    margin-top: 4px;
  }

  ul {
    margin: 8px 0 0;
    padding-left: 20px;
  }

  li + li {
    margin-top: 4px;
  }

  code {
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 90%;
    padding: 0.1em 0.35em;
    border-radius: 2px;
    background-color: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.color.textPrimary};
  }
`;

export const TableOfContents = styled.div`
  flex-shrink: 1;
  overflow: auto;
  padding-bottom: 24px;
`;

export const TimeTableTitle = styled.p`
  margin: 16px 0;
  margin-bottom: 8px;
  padding: 0 16px;
  flex-shrink: 0;
`;

export const VideoTimeTable = styled.ul`
  list-style: none;
  padding: 4px 16px;
  margin: 0;
`;

export const VideoTime = styled.li`
  background-color: ${({ theme }) => theme.color.backgroundSecondary};
  color: ${({ theme }) => theme.color.textSecondary};
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 14px;
`;

export const TimeButton = styled(RawButton)`
  text-decoration: none;
  color: ${({ theme }) => theme.color.textSecondary};
  box-shadow: ${({ theme }) => `${theme.shadow.stroke}, ${theme.shadow.low}`};
  padding: 16px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  transition: all 300ms ease 0s;
  text-align: left;

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.color.textPrimary};
    box-shadow: ${({ theme }) => `${theme.shadow.stroke}, ${theme.shadow.high}`};
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

export const EmptyMessageWrapper = styled.div`
  width: 100%;
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export const ShareContainer = styled.div`
  padding: 0 16px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

export const SocialMediaIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.color.border};
  margin-left: 8px;
  transition: border 300ms ease, background-color 300ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.buttonPrimary};
    background-color: ${({ theme }) => theme.color.buttonPrimary};
  }
`;
