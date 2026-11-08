import * as React from 'react';
import { createGlobalStyle } from 'styled-components';
import Link from 'next/link';
import ThemeProvider from 'components/context/ThemeProvider';
import { site } from 'utils/shared/site';
import { Shell, Topbar, Main, Bottom, SkipLink } from './styles';
import FooterNavigation from 'components/blocks/FooterNavigation/FooterNavigation';

const PrintStyle = createGlobalStyle`
  @page { margin: 15mm; }
`;

const Layout: React.FC = ({ children }) => (
  <ThemeProvider>
    <PrintStyle />
    <Shell>
      <SkipLink href="#resource-main">Skip to content</SkipLink>
      <Topbar>
        <Link href="/" passHref>
          <a>{site.name}</a>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/course">
            <a>Course</a>
          </Link>
          <Link href="/guides">
            <a>Guides</a>
          </Link>
          <Link href="/topics">
            <a>Topics</a>
          </Link>
          <Link href="/interview-prep">
            <a>Languages</a>
          </Link>
          <Link href="/tools">
            <a>Tools</a>
          </Link>
          <Link href="/study-plans">
            <a>Study plans</a>
          </Link>
        </nav>
      </Topbar>
      <Main id="resource-main" tabIndex={-1}>
        {children}
      </Main>
      <Bottom>
        <div>
          <Link href="/">
            <a className="footer-brand">{site.name}</a>
          </Link>
          <p>
            Work through interview problems, understand the algorithms, and practice in your
            language.
          </p>
        </div>
        <FooterNavigation />
      </Bottom>
    </Shell>
  </ThemeProvider>
);
export default Layout;
