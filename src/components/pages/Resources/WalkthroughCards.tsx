import * as React from 'react';
import Link from 'next/link';
import { getLanguageWalkthroughs, walkthroughPath } from 'content/lesson-walkthroughs';
import { Section, Grid, Card } from './styles';

export default function WalkthroughCards({
  language,
  nested = false,
  preview = false,
}: {
  language: string;
  nested?: boolean;
  preview?: boolean;
}) {
  const pages = getLanguageWalkthroughs(language);
  if (!pages.length) return null;
  const Heading = nested ? 'h3' : 'h2';
  const GroupHeading = nested ? 'h4' : 'h3';
  const CardHeading = preview ? (nested ? 'h4' : 'h3') : nested ? 'h5' : 'h4';
  const groups = preview
    ? [{ key: 'preview', title: '', pages: pages.slice(0, 3) }]
    : [
        {
          key: 'concept',
          title: 'Concepts',
          pages: pages.filter((page) => page.kind === 'concept'),
        },
        {
          key: 'implementation',
          title: 'Data structure implementations',
          pages: pages.filter((page) => page.kind === 'implementation'),
        },
        { key: 'exercise', title: 'Practice problems', pages: pages.filter((page) => !page.kind) },
        {
          key: 'javascript',
          title: 'Language behavior and callbacks',
          pages: pages.filter((page) => page.kind === 'javascript'),
        },
      ].filter((group) => group.pages.length);
  return (
    <Section id={preview ? undefined : 'lesson-walkthroughs'}>
      <Heading>Worked lesson walkthroughs</Heading>
      <p>{pages.length} reading lessons with code examples in this language.</p>
      {!preview && (
        <nav
          aria-label="Walkthrough categories"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 20, margin: '20px 0' }}
        >
          {groups.map((group) => (
            <a
              key={group.key}
              href={`#walkthroughs-${group.key}`}
              style={{ textDecoration: 'underline' }}
            >
              {group.title} ({group.pages.length})
            </a>
          ))}
        </nav>
      )}
      {groups.map((group) => (
        <div key={group.key}>
          {!preview && (
            <GroupHeading id={`walkthroughs-${group.key}`} style={{ margin: '32px 0 20px' }}>
              {group.title}
            </GroupHeading>
          )}
          <Grid>
            {group.pages.map((page) => (
              <Link href={walkthroughPath(page)} passHref key={page.lesson}>
                <Card>
                  <small>
                    {page.kind === 'concept'
                      ? 'Concept lesson'
                      : page.kind === 'implementation'
                      ? 'Implementation tutorial'
                      : page.kind === 'javascript'
                      ? 'Language behavior'
                      : 'Practice walkthrough'}
                  </small>
                  <CardHeading>{page.title}</CardHeading>
                  <p>{page.description}</p>
                </Card>
              </Link>
            ))}
          </Grid>
        </div>
      ))}
      {preview && (
        <p style={{ marginTop: 20 }}>
          <Link href={`/interview-prep/${language}#lesson-walkthroughs`}>
            <a style={{ textDecoration: 'underline' }}>
              Browse all {pages.length} lessons in this language
            </a>
          </Link>
        </p>
      )}
    </Section>
  );
}
