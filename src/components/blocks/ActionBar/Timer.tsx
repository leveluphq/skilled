import * as React from 'react';
import { Timer16, View16, ViewOff16 } from '@carbon/icons-react';

import { TimerWrapper, TimerPillButton, EyeToggle } from './styles';

const QUESTION_TIMER = 1000;

const timeToSTring = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return `${minutesString}:${secondsString}`;
};

const Timer = () => {
  const [isTimerVisible, setIsTimerVisible] = React.useState(true);
  const [time, setTime] = React.useState(0);
  const [isTimerActive, setIsTimerActive] = React.useState(false);

  React.useEffect(() => {
    let timer: number | undefined;

    if (isTimerActive) {
      // @ts-ignore mixup between browser and node timer
      timer = setInterval(() => {
        setTime((prevElapsedTime) => prevElapsedTime + 1);
      }, QUESTION_TIMER);
    }

    return () => clearInterval(timer);
  }, [isTimerActive]);

  return (
    <TimerWrapper>
      <EyeToggle onClick={() => setIsTimerVisible(!isTimerVisible)} aria-label="show or hide timer">
        {isTimerVisible ? (
          // @ts-ignore the props are allowed
          <View16 width={14} height={14} />
        ) : (
          // @ts-ignore the props are allowed
          <ViewOff16 width={14} height={14} />
        )}
      </EyeToggle>
      <TimerPillButton
        aria-label="start or stop timer"
        isHidden={!isTimerVisible}
        onClick={() => {
          if (!isTimerActive) {
            setTime(time + 1);
          }
          setIsTimerActive(!isTimerActive);
        }}
      >
        <Timer16 /> <span>{timeToSTring(time)}</span>
      </TimerPillButton>
    </TimerWrapper>
  );
};

export default Timer;
