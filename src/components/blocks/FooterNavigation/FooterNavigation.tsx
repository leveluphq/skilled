import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { site } from 'utils/shared/site';

const Navigation = styled.nav`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  min-width: 0;
  text-align: left;
  h2 {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.5;
    margin: 0 0 12px;
    color: ${({ theme }) => theme.color.textPrimary};
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }
  a {
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 8px 0;
    font-size: 14px;
    line-height: 1.5;
    color: ${({ theme }) => theme.color.textSecondary};
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  a:hover {
    color: ${({ theme }) => theme.color.textPrimary};
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  a:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.brand};
    outline-offset: 3px;
  }
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 20px;
  }
`;

const groups = [
  {
    title: 'Learn',
    links: [
      ['Course', '/course'],
      ['All resources', '/learn'],
      ['Guides', '/guides'],
      ['Topics', '/topics'],
      ['Video lessons', '/watch'],
    ],
  },
  {
    title: 'Practice',
    links: [
      ['Languages', '/interview-prep'],
      ['Interactive tools', '/tools'],
      ['Algorithm patterns', '/patterns'],
      ['Study plans', '/study-plans'],
      ['Reference', '/reference'],
    ],
  },
  {
    title: 'Open source',
    links: [
      ['GitHub', site.sourceUrl],
      ['Docs', '/docs'],
      ['Run it locally', '/docs#install'],
      ['Report a security issue', `${site.sourceUrl}/security/policy`],
      ['License', `${site.sourceUrl}/blob/main/LICENSE`],
    ],
  },
  {
    title: 'About',
    links: [
      ['About us', '/about'],
      ['Privacy', '/privacy'],
      ['Terms', '/terms'],
    ],
  },
];

export default function FooterNavigation() {
  return (
    <Navigation aria-label="Footer navigation">
      {groups.map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          <ul>
            {group.links.map(([label, href]) => (
              <li key={href}>
                {/^https?:\/\//.test(href) ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                  </a>
                ) : (
                  <Link href={href}>
                    <a>{label}</a>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Navigation>
  );
}
