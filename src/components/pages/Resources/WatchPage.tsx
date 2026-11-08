import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Head from 'components/blocks/Head';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import videos from 'content/videos/catalog.json';
import course from 'content/resources/course.json';
import { absoluteUrl, site } from 'utils/shared/site';
import { videoStart, chapterPath, videoClips } from 'utils/shared/videoChapters';
import Layout from './Layout';
import LessonReadingLinks from './LessonReadingLinks';
import { Article, Breadcrumbs, Hero, Metadata, Section } from './styles';

const Player = styled.div`
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  background: #111;
  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
  @media print {
    display: none;
  }
`;
const Chapters = styled.ol`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  padding: 0;
  gap: 8px;
  list-style: none;
  a {
    display: block;
    min-height: 44px;
    padding: 12px;
    line-height: 1.5;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 4px;
    text-decoration: none;
  }
  a[aria-current='true'] {
    border-color: ${({ theme }) => theme.color.brand};
  }
`;
const Related = styled.nav`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 14px;
  margin-top: 24px;
  a {
    display: block;
    min-height: 44px;
    padding: 16px;
    line-height: 1.7;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 5px;
    text-decoration: none;
    overflow-wrap: anywhere;
  }
`;
export const timestamp = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function WatchPage({ slug, children }: { slug: string; children: React.ReactNode }) {
  const video = videos.find((item) => item.slug === slug)!;
  const router = useRouter();
  const [start, setStart] = React.useState(0);
  const requestedStart = videoStart(router.query.t, video.durationSeconds);
  React.useEffect(() => {
    if (router.isReady) setStart(requestedStart);
  }, [router.isReady, requestedStart, slug]);
  const path = `/watch/${slug}`;
  const url = absoluteUrl(path);
  const embed = `https://www.youtube-nocookie.com/embed/${video.videoId}`;
  const lesson = course.lessons.find((item) => item.slug === slug)!;
  const category = course.categories.find((item) => item.slug === lesson.category)!;
  const related = videos.filter(
    (item) =>
      item.slug !== slug &&
      course.lessons.some(
        (candidate) => candidate.slug === item.slug && candidate.category === lesson.category,
      ),
  );
  return (
    <Layout>
      <Head
        title={video.title}
        description={video.description}
        canonicalPath={path}
        type="video.other"
        ogImage={absoluteUrl(`/images/videos/${slug}.jpg`)}
        ogImageWidth={480}
        ogImageHeight={360}
      />
      <StructuredData
        data={[
          {
            '@context': 'https://schema.org',
            '@type': ['VideoObject', 'LearningResource'],
            '@id': `${url}#video`,
            url,
            name: video.title,
            description: video.description,
            thumbnailUrl: absoluteUrl(`/images/videos/${slug}.jpg`),
            uploadDate: video.uploadDate,
            duration: `PT${video.durationSeconds}S`,
            embedUrl: embed,
            inLanguage: 'en',
            isAccessibleForFree: true,
            learningResourceType: 'Video lesson',
            author: {
              '@type': 'Person',
              name: 'Trey Huffine',
              url: 'https://www.youtube.com/@levelupdev',
            },
            publisher: { '@id': `${site.origin}/#publisher` },
            mainEntityOfPage: { '@id': url },
            isPartOf: { '@id': `${absoluteUrl(`/course/${slug}`)}#lesson` },
            hasPart: videoClips(video),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Watch', item: absoluteUrl('/watch') },
              { '@type': 'ListItem', position: 2, name: video.title, item: url },
            ],
          },
        ]}
      />
      <Breadcrumbs aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/watch">
              <a>Video lessons</a>
            </Link>
          </li>
          <li aria-current="page">{video.title}</li>
        </ol>
      </Breadcrumbs>
      <Hero>
        <h1>{video.title}</h1>
        <p>{video.description}</p>
        <Metadata>
          {timestamp(video.durationSeconds)} · Trey Huffine · Published{' '}
          {video.uploadDate.slice(0, 10)}
        </Metadata>
      </Hero>
      <Player>
        <iframe
          key={`${slug}:${start}`}
          title={video.title}
          src={`${embed}?start=${start}&rel=0`}
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </Player>
      <p>
        <a href={`https://www.youtube.com/watch?v=${video.videoId}${start ? `&t=${start}s` : ''}`}>
          Watch on YouTube
        </a>{' '}
        · <a href="#lesson-notes">Read lesson notes</a> ·{' '}
        <Link href={`/course/${slug}`}>
          <a>Open the current lesson</a>
        </Link>
      </p>
      <Section aria-label="Video chapters">
        <h2>Chapters</h2>
        <Chapters>
          {video.chapters.map((chapter) => (
            <li key={chapter.start}>
              <a
                href={chapterPath(slug, chapter.start)}
                aria-current={start >= chapter.start && start < chapter.end ? 'true' : undefined}
                onClick={(event) => {
                  if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
                    event.preventDefault();
                    setStart(chapter.start);
                    // Playback remains usable if a rapid second navigation cancels this one.
                    void router
                      .push(chapterPath(slug, chapter.start), undefined, {
                        shallow: true,
                        scroll: false,
                      })
                      .catch(() => {});
                  }
                }}
              >
                {timestamp(chapter.start)} {chapter.name}
              </a>
            </li>
          ))}
        </Chapters>
        <p aria-live="polite">
          Selected start: {timestamp(start)}. Press play in the video to watch.
        </p>
        <p>Chapter links can be bookmarked or shared.</p>
      </Section>
      {video.corrections.length > 0 && (
        <Section>
          <h2>Changes since recording</h2>
          <ul>
            {video.corrections.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <p>Use the current lesson code when checking behavior.</p>
        </Section>
      )}
      <Article id="lesson-notes">
        <h2>Lesson notes</h2>
        <p>
          These notes explain the problem and current implementation. They are a reading companion,
          not a verbatim transcript of the recording.
        </p>
        {children}
      </Article>
      <LessonReadingLinks slug={slug} />
      {related.length > 0 && (
        <Section>
          <h2>More in {category.title}</h2>
          <Related aria-label="Related video lessons">
            {related.map((item) => (
              <Link href={`/watch/${item.slug}`} passHref key={item.slug}>
                <a>{item.title}</a>
              </Link>
            ))}
          </Related>
        </Section>
      )}
    </Layout>
  );
}
