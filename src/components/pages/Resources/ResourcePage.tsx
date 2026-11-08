import * as React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Head from 'components/blocks/Head';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import { site, absoluteUrl } from 'utils/shared/site';
import { headingId } from 'utils/shared/headings';
import {
  programmingLanguageSubject,
  programmingLanguageLabel,
} from 'utils/shared/programmingLanguages';
import { learningEvent } from 'utils/client/learningEvents';
import {
  getResource,
  getRelatedLessons,
  getRelatedResources,
  sectionNames,
  resourcePath,
} from 'content/resources';
import Layout from './Layout';
import WalkthroughCards from './WalkthroughCards';
import { getLessonWalkthrough, walkthroughPath } from 'content/lesson-walkthroughs';
import {
  Breadcrumbs,
  Hero,
  Eyebrow,
  Metadata,
  ReadingLayout,
  Article,
  Contents,
  TableScroll,
  Section,
  Grid,
  Card,
  PrintActions,
} from './styles';

const textContent = (node: React.ReactNode): string =>
  React.Children.toArray(node)
    .map((child) =>
      React.isValidElement(child) ? textContent(child.props.children) : String(child),
    )
    .join('');
const components = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 id={headingId(textContent(children))}>{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 id={headingId(textContent(children))}>{children}</h3>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <TableScroll>
      <table>{children}</table>
    </TableScroll>
  ),
};

const PracticeCard = styled.div`
  display: flex;
  flex-direction: column;
  > a:first-child {
    flex: 1;
  }
  > a + a {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 12px 0;
    font-size: 14px;
    line-height: 1.6;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

interface Props {
  resourceId: string;
  headings: { title: string; id: string }[];
  minutes: number;
  Tool?: React.ComponentType;
}

const ResourcePage: React.FC<Props> = ({ resourceId, headings, minutes, Tool, children }) => {
  const resource = getResource(resourceId);
  if (!resource) throw new Error(`Unknown resource: ${resourceId}`);
  const path = resourcePath(resource);
  const interacted = React.useRef(false);
  React.useEffect(() => {
    interacted.current = false;
  }, [path]);
  const related = getRelatedResources(resource);
  const practice = getRelatedLessons(resource);
  const languageSubject = programmingLanguageSubject(resource.language);
  const languageSubjects = resource.languages?.map((language) =>
    programmingLanguageSubject(language),
  );
  const type =
    resource.section === 'topics'
      ? 'CollectionPage'
      : resource.section === 'tools'
        ? 'WebPage'
        : 'TechArticle';
  return (
    <Layout>
      <Head
        title={resource.title}
        description={resource.description}
        canonicalPath={path}
        type={type === 'TechArticle' ? 'article' : 'website'}
      />
      <StructuredData
        data={[
          {
            '@context': 'https://schema.org',
            '@type': type,
            '@id': absoluteUrl(path),
            url: absoluteUrl(path),
            name: resource.title,
            headline: resource.title,
            description: resource.description,
            inLanguage: 'en',
            ...(languageSubject
              ? { about: languageSubject }
              : languageSubjects?.length
                ? { about: languageSubjects }
                : {}),
            datePublished: resource.published,
            dateModified: resource.updated,
            ...(type === 'TechArticle'
              ? { author: { '@type': 'Organization', name: site.name, url: absoluteUrl('/') } }
              : {}),
            publisher: { '@id': `${site.origin}/#publisher` },
            isAccessibleForFree: true,
            image: resource.images?.length ? resource.images.map(absoluteUrl) : site.image,
            isPartOf: { '@id': `${site.origin}/#website` },
            ...(resource.section === 'tools' && Tool
              ? {
                  mainEntity: {
                    '@type': 'WebApplication',
                    '@id': `${absoluteUrl(path)}#application`,
                    name: resource.title,
                    description: resource.description,
                    url: absoluteUrl(path),
                    applicationCategory: 'EducationalApplication',
                    operatingSystem: 'Any',
                    browserRequirements: 'Requires JavaScript and a modern browser.',
                    isAccessibleForFree: true,
                    publisher: { '@id': `${site.origin}/#publisher` },
                  },
                }
              : {}),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Resources', item: absoluteUrl('/learn') },
              {
                '@type': 'ListItem',
                position: 2,
                name: sectionNames[resource.section],
                item: absoluteUrl(`/${resource.section}`),
              },
              { '@type': 'ListItem', position: 3, name: resource.title, item: absoluteUrl(path) },
            ],
          },
        ]}
      />
      <Breadcrumbs aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/learn">
              <a>Resources</a>
            </Link>
          </li>
          <li>
            <Link href={`/${resource.section}`}>
              <a>{sectionNames[resource.section]}</a>
            </Link>
          </li>
          <li aria-current="page">{resource.title}</li>
        </ol>
      </Breadcrumbs>
      <Hero>
        <Eyebrow>{sectionNames[resource.section]}</Eyebrow>
        <h1>{resource.title}</h1>
        <p>{resource.description}</p>
        <Metadata>
          Published <time dateTime={resource.published}>{resource.published}</time> · {minutes} min
          read
        </Metadata>
      </Hero>
      {resource.section === 'reference' && (
        <PrintActions className="print-controls">
          <button onClick={() => window.print()}>Print this reference</button>
        </PrintActions>
      )}
      {Tool && (
        <div
          onClick={(event) => {
            if (!interacted.current && (event.target as HTMLElement).closest('button')) {
              learningEvent('tool_interaction', path);
              interacted.current = true;
            }
          }}
        >
          <Tool />
        </div>
      )}
      <ReadingLayout>
        <Article>
          {React.isValidElement(children)
            ? React.cloneElement(
                children as React.ReactElement<{ components?: typeof components }>,
                { components },
              )
            : children}
        </Article>
        {headings.length > 0 && (
          <Contents aria-label="On this page">
            <p>On this page</p>
            <ol>
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>{h.title}</a>
                </li>
              ))}
            </ol>
          </Contents>
        )}
      </ReadingLayout>
      {resource.section === 'interview-prep' && <WalkthroughCards language={resource.slug} />}
      {practice.length > 0 && (
        <Section id="practice" className="screen-related">
          <h2>
            {resource.section === 'topics'
              ? 'A learning path through the course'
              : 'Practice in the course'}
          </h2>
          <p>
            Open a lesson to work through its explanation and examples. Coding exercises include an
            editor; available code languages are shown in each lesson.
          </p>
          <nav aria-label="Course lessons and language walkthroughs">
            <Grid>
              {practice.map((lesson) => {
                const reading = getLessonWalkthrough(lesson.slug, resource.language);
                return (
                  <PracticeCard key={lesson.slug}>
                    <Link href={`/course/${lesson.slug}`} passHref>
                      <Card
                        onClick={() =>
                          learningEvent('practice_open', path, `/course/${lesson.slug}`)
                        }
                      >
                        <small>{lesson.type === 'INSTRUCTIONAL' ? 'Concept' : 'Practice'}</small>
                        <h3>{lesson.title}</h3>
                        <p>{lesson.description}</p>
                      </Card>
                    </Link>
                    {reading && (
                      <Link href={walkthroughPath(reading)}>
                        <a>
                          Read {lesson.title} in {programmingLanguageLabel(reading.language)}
                        </a>
                      </Link>
                    )}
                  </PracticeCard>
                );
              })}
            </Grid>
          </nav>
        </Section>
      )}
      {related.length > 0 && (
        <Section className="screen-related">
          <h2>Continue learning</h2>
          <Grid>
            {related.map((r) => (
              <Link href={resourcePath(r)} passHref key={r.slug}>
                <Card>
                  <small>{sectionNames[r.section]}</small>
                  <h3>{r.title}</h3>
                  <p>{r.description}</p>
                </Card>
              </Link>
            ))}
          </Grid>
        </Section>
      )}
    </Layout>
  );
};
export default ResourcePage;
