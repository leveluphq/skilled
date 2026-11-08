import * as React from 'react';
import dynamic from 'next/dynamic';
import LoadingLesson from 'content/templates/LoadingDualView';
import { ContentProps } from 'content/props';

import { lessonSlugs } from './generated/lessonSlugs.gen';

export { lessonSlugs };

export const dynamicImportLesson = (slug: string) => {
  const PrivateLesson: React.ComponentType<ContentProps> = dynamic(
    () => import(`./lessons/${slug}`),
    {
      loading: LoadingLesson,
    },
  );
  const PublicLesson: React.ComponentType<ContentProps> = dynamic(
    () => import(`./lessons/${slug}/public`),
    { loading: LoadingLesson },
  );

  return { PrivateLesson, PublicLesson };
};
