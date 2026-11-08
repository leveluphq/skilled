import * as React from 'react';
import Link from 'next/link';
import copy from 'copy-to-clipboard';
import ReactPlayer from 'react-player';
import { ThemeContext } from 'styled-components';
import { videoProps } from 'utils/constants/lesson';
import ContentLoader from 'react-content-loader';
import videos from 'content/videos/catalog.json';
import { chapterPath } from 'utils/shared/videoChapters';
import { IS_FULL_COURSE_FREE } from 'utils/constants/payments';
import { TREY_TWITTER, TREY_LINKEDIN, TREY_YOUTUBE } from 'utils/constants/internal';
import { LogoLinkedin16, LogoTwitter16, LogoYoutube16 } from '@carbon/icons-react';
import { Props } from './props';

export interface VideoSegment {
  name: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
}

export interface LessonVideo {
  url: string;
  segments: VideoSegment[];
}

import {
  VideoBox,
  VideoWrapper,
  TableOfContents,
  TimeTableTitle,
  VideoTimeTable,
  VideoTime,
  TimeButton,
  EmptyMessageWrapper,
  ShareContainer,
  CopyButton,
  FollowContainer,
  SocialMediaIcon,
  ShareTitle,
  VideoChanges,
} from './styles';

const DEFAULT_WIDTH = 426;
const VIDEO_CHANGES_TITLE = 'The written lesson is newer than this video';
const VIDEO_CHANGES_INTRO =
  'We corrected the following after recording. Where the video differs, follow the written lesson:';
const DEFAULT_HEIGHT = 232;

// Notes are plain strings in each lesson's data.ts. As in the lesson text,
// `backticks` mark code.
const withInlineCode = (text: string) =>
  text
    .split(/`([^`]+)`/)
    .map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));

const remainingSeconds = (time: number) => {
  const seconds = `${time % 60}`;
  return seconds.length === 1 ? `0${seconds}` : seconds;
};

export const toMinutes = (time: number) => `${Math.floor(time / 60)}:${remainingSeconds(time)}`;

const DefaultEmptyMessage = ({ slug }: { slug?: string }) => {
  return videos.some((video) => video.slug === slug) ? (
    <Link href={`/watch/${slug}`}>
      <a style={{ textDecoration: 'underline' }}>Watch the free lesson video</a>
    </Link>
  ) : IS_FULL_COURSE_FREE ? (
    <span>Log in to watch videos</span>
  ) : (
    <span>
      This lesson requires a subscription{' >> '}
      <Link href="/pricing?from=video_required" passHref>
        <a style={{ textDecoration: 'underline' }}>Upgrade</a>
      </Link>
    </span>
  );
};

const Loader = ({ uniqueKey }: { uniqueKey: string }) => {
  const theme = React.useContext(ThemeContext);

  return (
    <ContentLoader
      animate
      style={{ display: 'block' }}
      uniqueKey={uniqueKey}
      viewBox={`0 0 ${DEFAULT_WIDTH} ${DEFAULT_HEIGHT}`}
      speed={1}
      width="100%"
      height="100%"
      backgroundColor={theme.color.backgroundSecondary}
      foregroundColor={theme.color.navBackground}
    >
      <rect x="0" y="0" width="426" height="232" />
    </ContentLoader>
  );
};

const LessonVideo: React.FC<Props> = ({
  isLoading = false,
  emptyMessage,
  hideTableOfContents,
  segments,
  changesSinceRecording = [],
  url,
  uniqueKey,
  slug,
}) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const [videoWidth, setVideoWidth] = React.useState(DEFAULT_WIDTH);
  const [videoHeight, setVideoHeight] = React.useState(DEFAULT_HEIGHT);
  const ref = React.useRef<ReactPlayer>(null);
  const publicVideo = videos.find((video) => video.slug === slug);
  // Inside the table of contents, the part that scrolls under the video, so it
  // scrolls away rather than staying pinned below the player
  const videoChanges = !isLoading && url && changesSinceRecording.length > 0 && (
    <VideoChanges aria-label={VIDEO_CHANGES_TITLE}>
      <p>{VIDEO_CHANGES_TITLE}</p>
      <p>{VIDEO_CHANGES_INTRO}</p>
      <ul>
        {changesSinceRecording.map((change) => (
          <li key={change}>{withInlineCode(change)}</li>
        ))}
      </ul>
    </VideoChanges>
  );

  return (
    <>
      <VideoBox>
        {isLoading ? (
          <Loader uniqueKey={uniqueKey} />
        ) : !url ? (
          <EmptyMessageWrapper>
            {emptyMessage === undefined ? <DefaultEmptyMessage slug={slug} /> : emptyMessage}
          </EmptyMessageWrapper>
        ) : (
          <VideoWrapper videoWidth={videoWidth} videoHeight={videoHeight}>
            <ReactPlayer
              {...videoProps}
              url={url}
              ref={ref}
              onReady={(player) => {
                const internalPlayer: any = player.getInternalPlayer();
                const element = internalPlayer.element;

                if (element) {
                  setVideoWidth(parseFloat(element.width));
                  setVideoHeight(parseFloat(element.height));
                }
              }}
              width="100%"
              height="100%"
            />
          </VideoWrapper>
        )}
      </VideoBox>
      {hideTableOfContents && videoChanges}
      {!hideTableOfContents && (
        <TableOfContents>
          {videoChanges}
          <ShareContainer>
            <FollowContainer>
              <ShareTitle>Follow teacher</ShareTitle>{' '}
              <SocialMediaIcon href={TREY_TWITTER} rel="nooper noreferrer">
                <LogoTwitter16 />
              </SocialMediaIcon>{' '}
              <SocialMediaIcon href={TREY_LINKEDIN} rel="nooper noreferrer">
                <LogoLinkedin16 />
              </SocialMediaIcon>{' '}
              <SocialMediaIcon href={TREY_YOUTUBE} rel="nooper noreferrer">
                <LogoYoutube16 />
              </SocialMediaIcon>
            </FollowContainer>
            <FollowContainer>
              <ShareTitle>Share:</ShareTitle>{' '}
              <CopyButton
                onClick={() => {
                  try {
                    copy(window.location.href);
                  } catch (e) {
                    alert('Could not copy link. Please try again later.');
                  }
                  setIsCopied(true);
                }}
              >
                {isCopied ? 'Copied!' : 'Copy Link'}
              </CopyButton>
            </FollowContainer>
          </ShareContainer>
          <TimeTableTitle>Table of Contents</TimeTableTitle>
          <VideoTimeTable>
            {segments.map((s) => {
              const chapter =
                !isLoading &&
                !url &&
                publicVideo?.chapters.find((item) => item.start === s.startTimeSeconds);
              const label = (
                <>
                  <span>{s.name}</span>
                  <span>
                    {toMinutes(s.startTimeSeconds)} - {toMinutes(s.endTimeSeconds)}
                  </span>
                </>
              );
              return (
                <VideoTime key={s.name}>
                  {chapter && publicVideo ? (
                    <Link href={chapterPath(publicVideo.slug, chapter.start)} passHref>
                      <TimeButton as="a">{label}</TimeButton>
                    </Link>
                  ) : (
                    <TimeButton
                      disabled={isLoading || !url}
                      onClick={() => ref.current?.seekTo(s.startTimeSeconds, 'seconds')}
                    >
                      {label}
                    </TimeButton>
                  )}
                </VideoTime>
              );
            })}
          </VideoTimeTable>
        </TableOfContents>
      )}
    </>
  );
};

export default LessonVideo;
