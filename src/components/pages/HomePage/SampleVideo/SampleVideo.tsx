import * as React from 'react';
import ReactPlayer from 'react-player';
import { videoProps } from 'utils/constants/lesson';
import { toMinutes } from 'components/blocks/LessonVideo/LessonVideo';
import sampleLesson from '../sampleLesson';

import {
  VideoWrapper,
  TableOfContents,
  VideoTimeTable,
  VideoTime,
  TimeButton,
} from 'components/blocks/LessonVideo/styles';
import { Wrapper, ItemVideo, ItemContents, StyledVideoBox } from './styles';

const DEFAULT_WIDTH = 426;
const DEFAULT_HEIGHT = 232;

const SampleVideo: React.FC = () => {
  const [videoWidth, setVideoWidth] = React.useState(DEFAULT_WIDTH);
  const [videoHeight, setVideoHeight] = React.useState(DEFAULT_HEIGHT);
  const ref = React.useRef<ReactPlayer>(null);

  return (
    <Wrapper>
      <ItemVideo style={{ paddingRight: 0, paddingTop: '2px' }}>
        <StyledVideoBox>
          <VideoWrapper videoWidth={videoWidth} videoHeight={videoHeight}>
            <ReactPlayer
              {...videoProps}
              url={sampleLesson.solutionVideoUrl!}
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
        </StyledVideoBox>
      </ItemVideo>
      <ItemContents>
        <TableOfContents>
          <VideoTimeTable style={{ padding: 0 }}>
            {sampleLesson.video.segments.map((s) => (
              <VideoTime key={s.name}>
                <TimeButton
                  onClick={() => {
                    if (ref.current) {
                      ref.current.seekTo(s.startTimeSeconds, 'seconds');
                    }
                  }}
                >
                  <span>{s.name}</span>
                  <span>
                    {toMinutes(s.startTimeSeconds)} - {toMinutes(s.endTimeSeconds)}
                  </span>
                </TimeButton>
              </VideoTime>
            ))}
          </VideoTimeTable>
        </TableOfContents>
      </ItemContents>
    </Wrapper>
  );
};

export default SampleVideo;
