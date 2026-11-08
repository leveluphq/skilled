import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { resources, resourcePath, getLanguageGuide } from 'content/resources';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import LessonLanguageLinks from 'components/blocks/LessonLanguageLinks/LessonLanguageLinks';
import LessonOverview from 'components/blocks/LessonOverview/LessonOverview';
import videos from 'content/videos/catalog.json';

const Wrapper = styled.nav`
  padding: 24px;
  margin: 20px 0;
  border-top: 1px solid ${({ theme }) => theme.color.border};
  h2 {
    font-size: 18px;
    margin-bottom: 12px;
  }
  ul {
    padding-left: 18px;
    margin: 0;
  }
  li {
    font-size: 14px;
    line-height: 1.8;
    margin: 8px 0;
  }
  a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export default function RelatedResources({ slug }: { slug: string }) {
  const { language } = useCodingLanguage();
  const [activeLanguage, setActiveLanguage] = React.useState('');
  React.useEffect(
    () => setActiveLanguage(typeof language === 'string' ? language.toLowerCase() : ''),
    [language],
  );
  const guide = getLanguageGuide(activeLanguage);
  const matches = resources.filter(
    (r) =>
      r.lessons.includes(slug) &&
      r.section !== 'interview-prep' &&
      (!activeLanguage ||
        !r.language ||
        r.language === activeLanguage ||
        (activeLanguage === 'typescript' && r.language === 'javascript')),
  );
  const topic = matches.find((r) => r.section === 'topics');
  const focused = matches.filter((r) => r !== topic && r.language === activeLanguage);
  const additional = matches.filter(
    (r) => r !== topic && r.language && r.language !== activeLanguage,
  );
  const general = matches.filter((r) => !r.language && r !== topic);
  const selected = [...(topic ? [topic] : []), ...focused.concat(additional, general).slice(0, 3)];
  return (
    <>
      <LessonOverview slug={slug} />
      <LessonLanguageLinks slug={slug} />
      <Wrapper aria-label="Related guides and tools">
        <h2>Related guides and tools</h2>
        <ul>
          {videos.some((video) => video.slug === slug) && (
            <li>
              <Link href={`/watch/${slug}`}>
                <a>Watch the free video explanation</a>
              </Link>
            </li>
          )}
          <li>
            {guide ? (
              <Link href={resourcePath(guide)}>
                <a>{guide.title}</a>
              </Link>
            ) : (
              <Link href="/interview-prep">
                <a>Preparation guides by programming language</a>
              </Link>
            )}
          </li>
          {selected.map((r) => (
            <li key={r.slug}>
              <Link href={resourcePath(r)}>
                <a>{r.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </Wrapper>
    </>
  );
}
