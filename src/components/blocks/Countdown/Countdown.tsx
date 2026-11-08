import * as React from 'react';

import { Wrapper, Box, Colon } from './styles';

interface Props {
  endTimeMilliseconds?: number;
}

const DEFAULT_END_TIME = new Date('2020-12-08T13:00:00-0800').getTime();

const toTime = (time: number) => (time < 10 ? `0${time}` : time);
const calculateTimeLeft = (endDate: number) => {
  const difference = endDate - Date.now();

  let timeLeft = {
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  };

  if (difference > 0) {
    timeLeft = {
      day: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hour: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minute: Math.floor((difference / 1000 / 60) % 60),
      second: Math.floor((difference / 1000) % 60),
      millisecond: Math.floor((difference / 10) % 100),
    };
  }

  return timeLeft;
};

const Countdown: React.FC<Props> = ({ endTimeMilliseconds = DEFAULT_END_TIME }) => {
  const [time, setTime] = React.useState(calculateTimeLeft(endTimeMilliseconds));

  React.useEffect(() => {
    setTimeout(() => {
      setTime(calculateTimeLeft(endTimeMilliseconds));
    }, 10);
  }, [time]);

  return (
    <Wrapper>
      <Box>{toTime(time.day)}</Box>
      <Colon>:</Colon>
      <Box>{toTime(time.hour)}</Box>
      <Colon>:</Colon>
      <Box>{toTime(time.minute)}</Box>
      <Colon>:</Colon>
      <Box>{toTime(time.second)}</Box>
      {/* <Colon>:</Colon>
      <Box>{toTime(time.millisecond)}</Box> */}
    </Wrapper>
  );
};

export default Countdown;
