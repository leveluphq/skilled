import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Container } from 'style/elements';
import { BasePalette } from 'style/theme';
import { rgba } from 'style/utils/color';
import { languageGuides, resourcePath } from 'content/resources';
import { programmingLanguageLabel } from 'utils/shared/programmingLanguages';
import { languageLogo } from 'utils/client/languageLogos';

const Section = styled.section`
  padding: 88px 0 24px;

  h2 {
    margin: 0;
    font-size: clamp(1.6rem, 3vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  p {
    margin: 12px 0 24px;
    max-width: 600px;
    line-height: 1.65;
    color: ${({ theme }) => theme.color.textSecondary};
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 38px;
    padding: 0 14px 0 10px;
    border-radius: 999px;
    background-color: ${rgba(BasePalette.White, 0.05)};
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.color.textPrimary};
    text-decoration: none;
    transition: background-color 150ms ease;
  }

  a:visited {
    color: ${({ theme }) => theme.color.textPrimary};
  }

  a:hover {
    background-color: ${rgba(BasePalette.White, 0.1)};
  }

  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.brand};
    outline-offset: 2px;
  }

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
    flex: none;
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
                  <a>
                    <img src={languageLogo(guide.slug)} alt="" aria-hidden="true" width={20} height={20} />
                    {programmingLanguageLabel(guide.slug)}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Section>
    </Container>
  );
}
