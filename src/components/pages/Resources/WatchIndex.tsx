import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Head from 'components/blocks/Head';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import videos from 'content/videos/catalog.json';
import course from 'content/resources/course.json';
import { absoluteUrl } from 'utils/shared/site';
import Layout from './Layout';
import { Hero, Section, Grid, Card } from './styles';

const Browse = styled.div`
  label {
    display: block;
    font-size: 16px;
    margin-bottom: 10px;
  }
  input {
    width: 100%;
    max-width: 560px;
    min-height: 48px;
    padding: 12px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 5px;
    background: ${({ theme }) => theme.color.backgroundSecondary};
    color: inherit;
    font: inherit;
  }
  button {
    min-height: 44px;
    padding: 10px 16px;
    margin: 8px 0;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 5px;
    background: ${({ theme }) => theme.color.backgroundSecondary};
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  p {
    margin: 14px 0;
    line-height: 1.7;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
  }
  nav a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 10px 14px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 5px;
    line-height: 1.5;
    text-decoration: none;
  }
  section { scroll-margin-top: 24px; }
`;

const ordered = course.lessons.flatMap((lesson) => {
  const video = videos.find((item) => item.slug === lesson.slug);
  return video ? [{ ...video, lessonTitle: lesson.title, category: lesson.category, type: lesson.type }] : [];
});

export default function WatchIndex() {
  const [query, setQuery] = React.useState('');
  const input = React.useRef<HTMLInputElement>(null);
  const search = query.trim().toLocaleLowerCase();
  const matches = ordered.filter((video) => {
    const category = course.categories.find((item) => item.slug === video.category)!;
    return `${video.title} ${video.description} ${category.title}`.toLocaleLowerCase().includes(search);
  });
  const groups = course.categories
    .map((category) => ({
      ...category,
      videos: matches.filter((video) => video.category === category.slug),
    }))
    .filter((category) => category.videos.length > 0);
  return (
    <Layout>
      <Head
        title="Free coding interview video lessons"
        description={`Watch ${videos.length} free lessons on data structures, algorithms, and JavaScript. Browse by topic, jump to a chapter, and read the accompanying notes.`}
        canonicalPath="/watch"
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Free coding interview video lessons',
          url: absoluteUrl('/watch'),
          hasPart: ordered.map((video) => ({
            '@type': 'WebPage',
            name: video.title,
            url: absoluteUrl(`/watch/${video.slug}`),
          })),
        }}
      />
      <Hero>
        <h1>Free coding interview video lessons</h1>
        <p>
          Watch all {videos.length} course recordings without an account, from data structures and
          algorithms to JavaScript. Each video includes chapters, written notes, and any corrections
          made since recording.
        </p>
      </Hero>
      <Browse>
        <label htmlFor="video-search">Find a video lesson</label>
        <input
          id="video-search"
          ref={input}
          type="search"
          placeholder="Try binary search, graphs, or JavaScript"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-describedby="video-results"
        />
        <p id="video-results" role="status" aria-live="polite">
          {matches.length === videos.length
            ? `${videos.length} video lessons across ${groups.length} topics.`
            : `${matches.length} of ${videos.length} video lessons match your search.`}
        </p>
        {query && (
          <button onClick={() => { setQuery(''); input.current?.focus(); }}>Clear search</button>
        )}
        {!matches.length && <p>Try a shorter search or clear it to browse every topic.</p>}
        <nav aria-label="Video topics">
          {groups.map((category) => (
            <a href={`#${category.slug}`} key={category.slug}>
              {category.title} ({category.videos.length})
            </a>
          ))}
        </nav>
        {groups.map((category) => (
          <Section key={category.slug} id={category.slug}>
            <h2>{category.title}</h2>
            <Grid>
              {category.videos.map((video) => (
                <Link href={`/watch/${video.slug}`} passHref key={video.slug}>
                  <Card>
                    <small>{video.type === 'INSTRUCTIONAL' ? 'Concept lesson' : 'Worked problem'}</small>
                    <h3>{video.lessonTitle}</h3>
                    <p>{video.description}</p>
                    <p>{Math.ceil(video.durationSeconds / 60)} min · Chapters and lesson notes</p>
                  </Card>
                </Link>
              ))}
            </Grid>
          </Section>
        ))}
      </Browse>
      <Section>
        <h2>Continue with the course</h2>
        <p>
          <Link href="/course"><a>Open the full course</a></Link> for coding exercises and lessons
          without recordings, including JavaScript Interview Questions. Watching here does not
          mark an exercise complete or change your saved programming language.
        </p>
      </Section>
    </Layout>
  );
}
