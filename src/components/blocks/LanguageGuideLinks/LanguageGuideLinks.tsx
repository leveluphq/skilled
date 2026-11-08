import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Container } from 'style/elements';
import { languageGuides, resourcePath } from 'content/resources';
import { programmingLanguageLabel } from 'utils/shared/programmingLanguages';

const Section = styled.section`
  padding: 22px;
  margin: 24px 0 32px;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: 8px;
  h2 {
    font-size: 21px;
    line-height: 1.5;
    margin: 0 0 12px;
  }
  p {
    font-size: 14px;
    line-height: 1.8;
    margin: 0 0 16px;
  }
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 22px;
    padding: 0;
    list-style: none;
  }
  a {
    text-decoration: underline;
    line-height: 1.8;
  }
  a:focus-visible {
    outline: 3px solid ${({ theme }) => theme.color.brand};
    outline-offset: 4px;
  }
`;

export default function LanguageGuideLinks() {
  return (
    <Container>
      <Section aria-labelledby="course-language-guides">
        <h2 id="course-language-guides">Programming language preparation</h2>
        <p>
          These free companion guides cover collections, language behavior, and worked algorithms in
          ten programming languages. The language options in each lesson editor depend on the
          exercise and the deployment’s configured runner.
        </p>
        <nav aria-label="Course companion language guides">
          <ul>
            {languageGuides.map((guide) => (
              <li key={guide.slug}>
                <Link href={resourcePath(guide)}>
                  <a>{programmingLanguageLabel(guide.slug)}</a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Section>
    </Container>
  );
}
