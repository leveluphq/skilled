import * as React from 'react';
import { NextPage } from 'next';
import { ApolloError } from '@apollo/client';
import {
  useGetLessonBySlugWithViewerQuery,
  useInsertLessonStatusMutation,
  useSetActiveLessonMutation,
} from 'types/generated/client';
import Head from 'components/blocks/Head';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import ViewerContext from 'components/context/ViewerContext';
import { lessonMetadata } from 'utils/shared/lessonMetadata';
import { lessonStructuredData } from 'utils/shared/lessonStructuredData';
import LessonPage from './LessonPage';
import { OwnProps } from './props';

// TODO: Should migrate this data out into a hook like in the coding problem buttons. (look for other cases of creating WithViewer components)

const ErrorResponse: React.FC<{ error: ApolloError }> = ({ error }) => {
  return (
    <>
      <Head title="Error loading lesson" />

      <div>{`Error: ${error.message}`}</div>
    </>
  );
};

const LessonPageContainer: NextPage<OwnProps> = ({ slug, lesson, Component }) => {
  const structuredData = lesson && lessonStructuredData(slug);
  const viewerToken = React.useContext(ViewerContext);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = React.useState(false);
  const toggleCodeEditor = React.useCallback(() => {
    setIsCodeEditorOpen(!isCodeEditorOpen);
  }, [isCodeEditorOpen, setIsCodeEditorOpen]);
  const [insertLessonStatus] = useInsertLessonStatusMutation();
  const [setActiveLesson] = useSetActiveLessonMutation();

  if (viewerToken) {
    const { data, error, loading, called } = useGetLessonBySlugWithViewerQuery({
      variables: { slug, userId: viewerToken },
    });

    if (error) {
      return <ErrorResponse error={error} />;
    }

    return (
      <>
        <Head
          useCurrentUrl
          title={lessonMetadata(lesson).title}
          description={lessonMetadata(lesson).description}
        />
        {structuredData && <StructuredData data={structuredData} />}

        <LessonPage
          data={data}
          slug={slug}
          lesson={lesson}
          isFetchingUserLessonDetails={!called || loading}
          Component={Component}
          insertLessonStatus={insertLessonStatus}
          setActiveLesson={setActiveLesson}
          toggleCodeEditor={toggleCodeEditor}
          isCodeEditorOpen={isCodeEditorOpen}
        />
      </>
    );
  } else {
    return (
      <>
        <Head
          useCurrentUrl
          title={lessonMetadata(lesson).title}
          description={lessonMetadata(lesson).description}
        />
        {structuredData && <StructuredData data={structuredData} />}

        <LessonPage
          slug={slug}
          lesson={lesson}
          isFetchingUserLessonDetails={false}
          Component={Component}
          insertLessonStatus={insertLessonStatus}
          setActiveLesson={setActiveLesson}
          toggleCodeEditor={toggleCodeEditor}
          isCodeEditorOpen={isCodeEditorOpen}
        />
      </>
    );
  }
};

export default LessonPageContainer;
