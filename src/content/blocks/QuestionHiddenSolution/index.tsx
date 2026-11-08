import * as React from 'react';
import ViewerContext from 'components/context/ViewerContext';
import { useGetLessonBySlugWithViewerQuery } from 'types/generated/client';
import QuestionHiddenSolution from './QuestionHiddenSolution';
import { OwnProps } from './props';

const QuestionHiddenSolutionContainer: React.FC<OwnProps> = (props) => {
  const viewerToken = React.useContext(ViewerContext);
  const slug = props.slug;

  if (viewerToken && slug) {
    const { data, loading, error } = useGetLessonBySlugWithViewerQuery({
      variables: { slug: slug as string, userId: viewerToken },
    });
    return <QuestionHiddenSolution loading={loading} error={error} data={data} {...props} />;
  } else {
    return <QuestionHiddenSolution loading={false} {...props} />;
  }
};

export default QuestionHiddenSolutionContainer;
