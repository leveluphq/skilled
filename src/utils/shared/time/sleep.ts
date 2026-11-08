const sleep = (sleepTimeMilli: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve(sleepTimeMilli);
    }, sleepTimeMilli);
  });
};

export default sleep;
