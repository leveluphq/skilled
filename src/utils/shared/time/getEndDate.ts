import convertDayToMillisecond from 'utils/shared/time/convertDayToMillisecond';

const getEndDate = (accessDays: number, currentEndDate?: string | null) => {
  const baseEnd = currentEndDate ? new Date(currentEndDate).getTime() : Date.now();
  return new Date(baseEnd + convertDayToMillisecond(accessDays));
};

export default getEndDate;
