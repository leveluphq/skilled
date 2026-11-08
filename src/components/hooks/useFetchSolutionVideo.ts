import * as React from 'react';
import api from 'services/client/api';
import Sentry from 'utils/shared/sentry';
import { ReasonForMissing } from 'utils/constants/lesson';

export interface SolutionVideoUrlResponse {
  solutionVideoUrl: string | null;
  note?: string | null;
  reason?: ReasonForMissing;
}

const useFetchSolutionVideo = (id: string | null | undefined) => {
  const [hasFetchedVideo, setHasFetchedVideo] = React.useState(false);
  const [
    solutionVideoUrlResponse,
    setSolutionVideoUrlResponse,
  ] = React.useState<SolutionVideoUrlResponse>({ solutionVideoUrl: null });
  React.useEffect(() => {
    let active = true;
    setSolutionVideoUrlResponse({ solutionVideoUrl: null });
    setHasFetchedVideo(!id);
    if (id) {
      api
        .get(`lessons/${id}/solutionVideoUrl`)
        .then((res: SolutionVideoUrlResponse) => {
          if (active) {
            if (res && res.solutionVideoUrl) {
              setSolutionVideoUrlResponse(res);
            }

            setHasFetchedVideo(true);
          }
        })
        .catch((e) => {
          if (!active) return;
          setHasFetchedVideo(true);
          Sentry.withScope((_scope) => {
            Sentry.captureException(e);
          });
        });
    }
    return () => {
      active = false;
    };
  }, [id]);

  return { hasFetchedVideo, ...solutionVideoUrlResponse };
};

export default useFetchSolutionVideo;
