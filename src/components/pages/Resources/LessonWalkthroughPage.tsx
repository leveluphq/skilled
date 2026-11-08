import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Head from 'components/blocks/Head';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import { lessons } from 'content/resources';
import videos from 'content/videos/catalog.json';
import {
  LessonWalkthrough,
  getLessonWalkthroughs,
  walkthroughLanguage,
  walkthroughPath,
} from 'content/lesson-walkthroughs';
import { LanguageName, codingLanguageList } from 'utils/constants/lesson';
import { rememberLanguage } from 'utils/client/programmingLanguagePreference';
import { learningEvent } from 'utils/client/learningEvents';
import { runnableLanguages } from 'utils/shared/runner/settings';
import { programmingLanguageSubject } from 'utils/shared/programmingLanguages';
import { absoluteUrl, site } from 'utils/shared/site';
import { headingId } from 'utils/shared/headings';
import Layout from './Layout';
import ReadingTrail from './ReadingTrail';
import {
  Article,
  Breadcrumbs,
  Contents,
  Eyebrow,
  Hero,
  Metadata,
  ReadingLayout,
  Section,
} from './styles';

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 12px 18px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 5px;
    text-decoration: none;
    text-align: center;
    line-height: 1.5;
    font-size: 15px;
  }
  a:hover {
    border-color: ${({ theme }) => theme.color.brand};
    text-decoration: none;
  }
  a:first-child {
    background: ${({ theme }) => theme.color.brand};
    color: #17191b;
    border-color: ${({ theme }) => theme.color.brand};
  }
  @media (max-width: 480px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
`;
const Languages = styled.nav`
  margin: 0 0 32px;
  p {
    font-size: 14px;
    margin-bottom: 12px;
  }
  ul {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
    padding: 0;
    list-style: none;
  }
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    border: 1px solid ${({ theme }) => theme.color.border};
    padding: 9px 16px;
    border-radius: 5px;
    font-size: 14px;
    text-decoration: none;
  }
  @media (max-width: 600px) {
    ul {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  a[aria-current='page'] {
    border-color: ${({ theme }) => theme.color.brand};
    font-weight: 700;
  }
  a:hover {
    text-decoration: none;
    border-color: ${({ theme }) => theme.color.brand};
  }
`;

const headingText = (node: React.ReactNode): string =>
  React.Children.toArray(node)
    .map((child) =>
      React.isValidElement(child) ? headingText(child.props.children) : String(child),
    )
    .join('');
const components = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 id={headingId(headingText(children))}>{children}</h2>
  ),
};

interface Props {
  walkthrough: LessonWalkthrough;
  headings: { title: string; id: string }[];
  minutes: number;
}

const LessonWalkthroughPage: React.FC<Props> = ({ walkthrough, headings, minutes, children }) => {
  const lesson = lessons.find((item) => item.slug === walkthrough.lesson)!;
  const language = walkthroughLanguage(walkthrough);
  const label = LanguageName[language];
  const path = walkthroughPath(walkthrough);
  const url = absoluteUrl(path);
  const exercise = `/course/${lesson.slug}`;
  const isExercise = !walkthrough.kind;
  const canRun = isExercise && runnableLanguages([language]).length > 0;
  const practice = (
    <Link href={exercise}>
      <a
        onClick={() => {
          if (isExercise) learningEvent('practice_open', path, exercise);
          if (canRun) rememberLanguage(language);
        }}
      >
        {!isExercise
          ? 'Open the course lesson'
          : canRun
          ? `Practice in ${label}`
          : 'Open the exercise'}
      </a>
    </Link>
  );
  return (
    <Layout>
      <Head
        title={walkthrough.title}
        description={walkthrough.description}
        canonicalPath={path}
        type="article"
      />
      <StructuredData
        data={[
          {
            '@context': 'https://schema.org',
            '@type': ['TechArticle', 'LearningResource'],
            '@id': url,
            url,
            name: walkthrough.title,
            headline: walkthrough.title,
            description: walkthrough.description,
            inLanguage: 'en',
            learningResourceType:
              walkthrough.kind === 'concept'
                ? 'Concept lesson'
                : walkthrough.kind === 'implementation'
                ? 'Implementation tutorial'
                : 'Worked example',
            isAccessibleForFree: true,
            about: programmingLanguageSubject(walkthrough.language),
            isPartOf: { '@id': `${absoluteUrl(exercise)}#lesson` },
            author: { '@type': 'Organization', name: site.name, url: absoluteUrl('/') },
            publisher: { '@id': `${site.origin}/#publisher` },
            image: site.image,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Course', item: absoluteUrl('/course') },
              { '@type': 'ListItem', position: 2, name: lesson.title, item: absoluteUrl(exercise) },
              { '@type': 'ListItem', position: 3, name: `${label} walkthrough`, item: url },
            ],
          },
        ]}
      />
      <Breadcrumbs aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/course">
              <a>Course</a>
            </Link>
          </li>
          <li>
            <Link href={exercise}>
              <a>{lesson.title}</a>
            </Link>
          </li>
          <li aria-current="page">{label} walkthrough</li>
        </ol>
      </Breadcrumbs>
      <Hero>
        <Eyebrow>Free lesson walkthrough · {label}</Eyebrow>
        <h1>{walkthrough.title}</h1>
        <p>{walkthrough.description}</p>
        <Metadata>{minutes} min read · Worked code, edge cases, and complexity</Metadata>
        <Actions>
          {practice}
          <Link href={`/interview-prep/${walkthrough.language}`}>
            <a>{label} preparation guide</a>
          </Link>
        </Actions>
        {isExercise && !canRun && (
          <p style={{ fontSize: 15 }}>
            Read the {label} implementation below. The online editor currently runs{' '}
            {runnableLanguages(codingLanguageList)
              .map((item) => LanguageName[item])
              .join(', ')}
            .
          </p>
        )}
      </Hero>
      <Languages aria-label="Walkthrough programming language">
        <p>Read a walkthrough in your programming language:</p>
        <ul>
          {getLessonWalkthroughs(lesson.slug).map((page) => (
            <li key={page.language}>
              <Link href={walkthroughPath(page)}>
                <a aria-current={page.language === walkthrough.language ? 'page' : undefined}>
                  {LanguageName[walkthroughLanguage(page)]}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </Languages>
      <ReadingLayout>
        <Article>
          {React.isValidElement(children)
            ? React.cloneElement(
                children as React.ReactElement<{ components?: typeof components }>,
                { components },
              )
            : children}
        </Article>
        <Contents aria-label="On this page">
          <p>On this page</p>
          <ol>
            {headings.map((heading) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`}>{heading.title}</a>
              </li>
            ))}
          </ol>
        </Contents>
      </ReadingLayout>
      <Section>
        <h2>{isExercise ? 'Try the exercise' : 'Continue with the lesson'}</h2>
        <p>
          {isExercise
            ? 'Write your own implementation in the course editor. This walkthrough belongs to the same lesson; your course progress stays with that exercise. Exercise access follows the course’s access settings.'
            : 'Open the original lesson to explore its full explanation and examples. Your saved programming-language choice stays unchanged. This reading page belongs to that lesson and does not create a separate progress record.'}
        </p>
        <Actions>
          {practice}
          {videos.some((video) => video.slug === lesson.slug) && (
            <Link href={`/watch/${lesson.slug}`}>
              <a>Watch the video explanation</a>
            </Link>
          )}
        </Actions>
      </Section>
      <ReadingTrail page={walkthrough} />
    </Layout>
  );
};
export default LessonWalkthroughPage;
