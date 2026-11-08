import * as React from 'react';
import AppStateContext from './AppStateContext';

export const useAppState = () => {
  return React.useContext(AppStateContext);
};

export const useLessonDimensions = () => {
  const { appState } = useAppState();
  const { videoWidth } = appState;
  const textWidth = 100 - videoWidth;

  return { videoWidth, textWidth };
};
