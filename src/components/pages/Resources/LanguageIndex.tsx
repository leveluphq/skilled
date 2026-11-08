import * as React from 'react';
import Link from 'next/link';
import Head from 'components/blocks/Head';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import { absoluteUrl, site } from 'utils/shared/site';
import {
  programmingLanguageLabel,
  programmingLanguageSubjects,
} from 'utils/shared/programmingLanguages';
import {
  getLanguageResources,
  languageGuides,
  resourcePath,
  sectionNames,
} from 'content/resources';
import Layout from './Layout';
import WalkthroughCards from './WalkthroughCards';
import { lessonWalkthroughs, walkthroughPath } from 'content/lesson-walkthroughs';
import { Hero, Eyebrow, Section, Grid, Card, Breadcrumbs } from './styles';

export default function LanguageIndex() {
  const membership = Array.from(
    new Map(
      languageGuides
        .flatMap((guide) => getLanguageResources(guide.slug))
        .map((resource) => [resourcePath(resource), resource] as const),
    ).values(),
  );
  const title = 'Coding interview preparation by programming language';
  const description =
    'Prepare for coding interviews in ten languages with collection guides, worked algorithms, runtime pitfalls, and linked practice exercises.';
  return (
    <Layout>
      <Head title={title} description={description} canonicalPath="/interview-prep" />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          url: absoluteUrl('/interview-prep'),
          inLanguage: 'en',
          isPartOf: { '@id': `${site.origin}/#website` },
          about: programmingLanguageSubjects,
          hasPart: [
            ...membership.map((resource) => ({
              '@type': 'WebPage',
              name: resource.title,
              url: absoluteUrl(resourcePath(resource)),
            })),
            ...lessonWalkthroughs.map((page) => ({
              '@type': 'LearningResource',
              name: page.title,
              url: absoluteUrl(walkthroughPath(page)),
            })),
          ],
        }}
      />
      <Breadcrumbs aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/learn">
              <a>Resources</a>
            </Link>
          </li>
          <li aria-current="page">Language preparation</li>
        </ol>
      </Breadcrumbs>
      <Hero>
        <Eyebrow>Language preparation</Eyebrow>
        <h1>{title}</h1>
        <p>{description}</p>
      </Hero>
      <p style={{ lineHeight: 1.9, maxWidth: 800 }}>
        Start with the preparation guide for a language you can use comfortably, then practice its
        collections and implementation details. Each guide links to relevant exercises. A lesson’s
        editor shows which languages are available for that exercise. Use the{' '}
        <Link href="/tools/study-plan-builder">
          <a style={{ textDecoration: 'underline' }}>study-plan builder</a>
        </Link>{' '}
        to reserve learning and review time.
      </p>
      <nav
        aria-label="Choose a programming language"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 26 }}
      >
        {languageGuides.map((guide) => (
          <a
            key={guide.slug}
            href={`#language-${guide.slug}`}
            style={{ textDecoration: 'underline' }}
          >
            {programmingLanguageLabel(guide.slug)}
          </a>
        ))}
      </nav>
      {languageGuides.map((guide) => (
        <Section key={guide.slug} id={`language-${guide.slug}`}>
          <h2>{programmingLanguageLabel(guide.slug)}</h2>
          <Grid>
            {getLanguageResources(guide.slug).map((resource) => (
              <Link
                key={`${resource.section}/${resource.slug}`}
                href={resourcePath(resource)}
                passHref
              >
                <Card>
                  <small>
                    {resource.section === 'interview-prep'
                      ? 'Start here'
                      : sectionNames[resource.section]}
                  </small>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                </Card>
              </Link>
            ))}
          </Grid>
          <WalkthroughCards language={guide.slug} nested preview />
        </Section>
      ))}
    </Layout>
  );
}
