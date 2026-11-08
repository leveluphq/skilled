import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import lessonLanguages from 'content/lessonLanguages.gen';
import {
  getLessonWalkthroughs,
  walkthroughPath,
  walkthroughLanguage,
} from 'content/lesson-walkthroughs';
import { LanguageName } from 'utils/constants/lesson';

const Wrapper = styled.section`
  padding: 24px;
  margin: 20px 0;
  border-top: 1px solid ${({ theme }) => theme.color.border};
  h2 {
    font-size: 18px;
    margin-bottom: 12px;
  }
  p {
    font-size: 14px;
    line-height: 1.8;
    margin: 10px 0;
  }
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;
    padding: 0;
    list-style: none;
  }
  li {
    font-size: 14px;
    line-height: 1.8;
  }
  a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export default function LessonLanguageLinks({ slug }: { slug: string }) {
  const walkthroughs = getLessonWalkthroughs(slug);
  const isExercise = !!lessonLanguages[slug]?.length;
  const languages = lessonLanguages[slug] || walkthroughs.map(walkthroughLanguage);
  if (!languages.length) return null;
  return (
    <Wrapper aria-label="Lesson programming languages">
      <h2>Programming languages for this lesson</h2>
      <p>
        {isExercise
          ? 'Starter code and reference implementations are available in:'
          : 'Read the explanation and code examples in:'}
      </p>
      <ul aria-label="Code languages">
        {languages.map((language) => (
          <li key={language}>
            <Link href={`/interview-prep/${language.toLowerCase()}`}>
              <a>{LanguageName[language]}</a>
            </Link>
          </li>
        ))}
      </ul>
      {isExercise && <p>The editor shows which of these languages can run on this deployment.</p>}
      {walkthroughs.length > 0 && (
        <nav aria-label="Language walkthroughs">
          <p>Read a worked explanation:</p>
          <ul>
            {walkthroughs.map((page) => (
              <li key={page.language}>
                <Link href={walkthroughPath(page)}>
                  <a>
                    {LanguageName[page.language.toUpperCase() as keyof typeof LanguageName]}{' '}
                    walkthrough
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </Wrapper>
  );
}
