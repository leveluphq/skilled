import * as React from 'react';
import Link from 'next/link';
import Head from 'components/blocks/Head';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import { absoluteUrl } from 'utils/shared/site';
import { resources, sectionNames, resourcePath } from 'content/resources';
import Layout from './Layout';
import LanguageIndex from './LanguageIndex';
import { Hero, Eyebrow, Section, Grid, Card, Breadcrumbs } from './styles';

const descriptions: Record<string, string> = {
  guides:
    'Worked explanations of interview problems, JavaScript behavior, and algorithm choices. Read the reasoning, inspect the code, and move into practice.',
  topics:
    'Follow a learning path through each part of the curriculum, from arrays and hash tables to graphs and dynamic programming.',
  patterns:
    'Learn to recognize a reusable approach, state its invariant, and understand when it applies. Each guide includes worked code and counterexamples.',
  tools:
    'Build a study plan, practice JavaScript output and algorithm patterns, and explore event timing, complexity growth, graph traversal, and binary tree traversal.',
  'interview-prep':
    'Prepare in a language you can explain clearly. These guides cover data structures, implementation choices, testing, and practice sequences.',
  'study-plans':
    'Choose a preparation schedule that fits your starting point. Each plan specifies exercises, review sessions, and ways to check your understanding.',
  reference:
    'Operation costs and implementation assumptions to use when comparing interview solutions. Keep the reference beside your practice exercises.',
};

const ResourceIndex: React.FC<{ section?: string }> = ({ section }) => {
  if (section === 'interview-prep') return <LanguageIndex />;
  const title = section ? sectionNames[section] : 'Coding interview guides, practice, and tools';
  const description = section
    ? descriptions[section]
    : 'Study data structures, algorithms, and JavaScript with worked guides, interactive visualizers, language preparation, and curated study plans.';
  const path = section ? `/${section}` : '/learn';
  const sections = section
    ? [section]
    : ['tools', 'guides', 'topics', 'patterns', 'interview-prep', 'study-plans', 'reference'];
  return (
    <Layout>
      <Head title={title} description={description} canonicalPath={path} />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          url: absoluteUrl(path),
          hasPart: resources
            .filter((r) => !section || r.section === section)
            .map((r) => ({ '@type': 'WebPage', name: r.title, url: absoluteUrl(resourcePath(r)) })),
        }}
      />
      <Breadcrumbs aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/learn">
              <a>Resources</a>
            </Link>
          </li>
          {section && <li aria-current="page">{title}</li>}
        </ol>
      </Breadcrumbs>
      <Hero>
        <Eyebrow>Learn and practice</Eyebrow>
        <h1>{title}</h1>
        <p>{description}</p>
      </Hero>
      {!section && (
        <p style={{ lineHeight: 1.9, maxWidth: 780 }}>
          Start with a topic you are studying, or choose a study plan if you want a sequence. The{' '}
          <Link href="/course">
            <a style={{ textDecoration: 'underline' }}>full course</a>
          </Link>{' '}
          brings the lessons together with coding exercises. These resources are free to read
          without an account. The{' '}
          <Link href="/watch">
            <a style={{ textDecoration: 'underline' }}>video library</a>
          </Link>{' '}
          has chapter links and written notes for every recorded course lesson.
        </p>
      )}
      {sections.map((key) => (
        <Section key={key}>
          {!section && (
            <h2>
              <Link href={`/${key}`}>
                <a>{sectionNames[key]}</a>
              </Link>
            </h2>
          )}
          <Grid>
            {resources
              .filter((r) => r.section === key)
              .map((r) => (
                <Link href={resourcePath(r)} passHref key={r.slug}>
                  <Card>
                    <small>{sectionNames[key]}</small>
                    <h3>{r.title}</h3>
                    <p>{r.description}</p>
                  </Card>
                </Link>
              ))}
          </Grid>
        </Section>
      ))}
    </Layout>
  );
};
export default ResourceIndex;
