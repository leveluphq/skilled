const fs = require('fs');
const path = require('path');

const GENERATED_FILE_LOCATION = '../pages/course';
const LESSON_LOCATION = '../content/lessons';
const IGNORE_FILES = ['.DS_Store'];

const FILE_NOTE =
  '// !!! NOTE: This is a generated file (npm run contentgen:lesson:pages). DO NOT ALTER MANUALLY';
const FILE_IMPORTS = `
import * as React from 'react';
import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import getLessonBySlug from 'services/server/graphql/queries/getLessonBySlug';
import LessonPageContainer from 'components/pages/LessonPage';
import withApollo from 'utils/client/withApollo';`;

const FOOTER = `export type StaticProps = InferGetStaticPropsType<typeof getStaticProps>;

const LessonPage: NextPage<StaticProps> = (props) => (
  <LessonPageContainer {...props} Component={Component} />
);

export default withApollo(LessonPage, { ssr: false });
`;

const generateFileContent = (slug) => {
  return `${FILE_NOTE}
${FILE_NOTE}
${FILE_NOTE}

${FILE_IMPORTS}
import Component from 'content/lessons/${slug}';

const SLUG = '${slug}'

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

${FOOTER}
`;
};

const FILE_HEADER = `${FILE_NOTE}
${FILE_NOTE}
${FILE_NOTE}
${FILE_NOTE}

${FILE_IMPORTS}`;

const ignoreFileFilter = (file) => {
  return !IGNORE_FILES.includes(file);
};

const buildLine = (slug, isPublic) => {
  return `'${slug}': dynamic(() => import('../lessons/${slug}${
    isPublic ? `/public` : ''
  }'), { loading: LoadingLesson }),`;
};

const buildFile = (slugs) => {
  const lessons = `export const lessonImports: LessonImport = {
  ${slugs
    .filter(ignoreFileFilter)
    .map((slug) => buildLine(slug))
    .join('\n  ')}
}`;
  const public = `export const publicLessonImports: LessonImport = {
  ${slugs
    .filter(ignoreFileFilter)
    .map((slug) => buildLine(slug, true))
    .join('\n  ')}
}`;

  // NOTE: Leaving out all rhe dynamic imports
  const file = `
export const lessonSlugs = [
  ${slugs
    .filter(ignoreFileFilter)
    .map((s) => `'${s}',`)
    .join('\n  ')}
];`;

  return file;
};

const generateStaticLessonPage = () => {
  console.log('+++++ GENERATING LESSON SLUGS +++++');
  const slugFolder = path.join(__dirname, LESSON_LOCATION);
  const lessons = fs.readdirSync(slugFolder).filter(ignoreFileFilter);

  fs.mkdirSync(path.join(__dirname, GENERATED_FILE_LOCATION), { recursive: true });

  lessons.forEach((slug) => {
    const outputFile = path.join(__dirname, GENERATED_FILE_LOCATION, `${slug}.tsx`);
    const file = generateFileContent(slug);
    fs.writeFileSync(outputFile, file);
  });

  console.log('----- LESSON SLUGS WRITTEN -----');
};

generateStaticLessonPage();
