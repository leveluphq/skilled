// !!! NOTE: This is a generated file (npm run contentgen:lesson:pages). DO NOT ALTER MANUALLY
// !!! NOTE: This is a generated file (npm run contentgen:lesson:pages). DO NOT ALTER MANUALLY
// !!! NOTE: This is a generated file (npm run contentgen:lesson:pages). DO NOT ALTER MANUALLY


import * as React from 'react';
import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import getLessonBySlug from 'services/server/graphql/queries/getLessonBySlug';
import LessonPageContainer from 'components/pages/LessonPage';
import withApollo from 'utils/client/withApollo';
import Component from 'content/lessons/searching-and-binary-search';

const SLUG = 'searching-and-binary-search'

export const getStaticProps: GetStaticProps = async function () {
  const lesson = await getLessonBySlug(SLUG);

  if (!lesson || lesson.status !== 'ACTIVE') {
    return { notFound: true };
  }

  return {
    props: {
      slug: SLUG,
      lesson,
    },
  };
};

export type StaticProps = InferGetStaticPropsType<typeof getStaticProps>;

const LessonPage: NextPage<StaticProps> = (props) => (
  <LessonPageContainer {...props} Component={Component} />
);

export default withApollo(LessonPage, { ssr: false });

