import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { getLessonWalkthroughs, walkthroughPath } from 'content/lesson-walkthroughs';
import { programmingLanguageLabel } from 'utils/shared/programmingLanguages';
import { Section } from './styles';

const Links = styled.nav`
  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
    gap: 10px;
    padding: 0;
    list-style: none;
  }
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 12px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 5px;
    font-size: 15px;
    line-height: 1.5;
    text-decoration: none;
  }
  a:hover {
    border-color: ${({ theme }) => theme.color.brand};
  }
`;

export default function LessonReadingLinks({ slug }: { slug: string }) {
  const pages = getLessonWalkthroughs(slug);
  if (!pages.length) return null;
  return (
    <Section className="screen-related">
      <h2>Read this lesson in your programming language</h2>
      <p>
        The written walkthroughs use code examples in the language you choose. The recording is in
        English. Opening a walkthrough keeps your saved editor language unchanged.
      </p>
      <Links aria-label="Video lesson programming-language walkthroughs">
        <ul>
          {pages.map((page) => (
            <li key={page.language}>
              <Link href={walkthroughPath(page)}>
                <a>{programmingLanguageLabel(page.language)} walkthrough</a>
              </Link>
            </li>
          ))}
        </ul>
      </Links>
    </Section>
  );
}
