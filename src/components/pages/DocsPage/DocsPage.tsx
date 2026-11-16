import * as React from 'react';
import { NextPage } from 'next';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import Head from 'components/blocks/Head';
import StructuredData from 'components/blocks/StructuredData/StructuredData';
import { absoluteUrl, site } from 'utils/shared/site';
import StyledMarkdown from 'components/blocks/StyledMarkdown';
import {
  ContentWrapper,
  DocsContainer,
  Title,
  Description,
  DocsGrid,
  Sidebar,
  SidebarTitle,
  NavList,
  NavItem,
  NavLink,
  Main,
} from './styles';

const sections = [
  { id: 'architecture', title: 'Architecture' },
  { id: 'prerequisites', title: 'Prerequisites' },
  { id: 'install', title: 'Install Dependencies' },
  { id: 'env', title: 'Environment Variables' },
  { id: 'hasura', title: 'Hasura + Postgres' },
  { id: 'migrations', title: 'Migrations + Seeds' },
  { id: 'run-web', title: 'Run Web App' },
  { id: 'run-code', title: 'Run Lesson Code' },
  { id: 'optional', title: 'Optional Integrations' },
  { id: 'checks', title: 'Tests and Checks' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
];

const DocsPage: NextPage = () => {
  return (
    <PageLayoutDefault>
      <Head
        title="Developer Docs"
        description="Set up and run Skilled.dev locally, including Hasura, migrations, env vars, and optional integrations."
        useCurrentUrl
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          '@id': absoluteUrl('/docs'),
          url: absoluteUrl('/docs'),
          name: 'Skilled.dev Developer Docs',
          description:
            'Set up and run the course locally, configure a code runner, and troubleshoot the application.',
          inLanguage: 'en',
          isAccessibleForFree: true,
          publisher: { '@id': `${site.origin}/#publisher` },
          isPartOf: { '@id': `${site.origin}/#website` },
        }}
      />
      <ContentWrapper>
        <DocsContainer>
          <Title>Skilled.dev Developer Docs</Title>
          <Description>
            How to run Skilled.dev on your own computer. The code is{' '}
            <a href={site.sourceUrl} target="_blank" rel="noopener noreferrer">
              open source on GitHub
            </a>
            , and this guide is also in the repository as <code>docs/README.md</code>.
          </Description>

          <DocsGrid>
            <Sidebar aria-label="Docs sections">
              <SidebarTitle>On This Page</SidebarTitle>
              <NavList>
                {sections.map((section) => (
                  <NavItem key={section.id}>
                    <NavLink href={`#${section.id}`}>{section.title}</NavLink>
                  </NavItem>
                ))}
              </NavList>
            </Sidebar>

            <Main>
              <StyledMarkdown>
                <h2 id="architecture">Architecture</h2>
                <p>
                  Skilled.dev runs as a Next.js web app backed by Hasura + Postgres. The web client sends GraphQL
                  calls to <code>/api/graphql</code>, and that route forwards requests to Hasura with role-aware
                  headers.
                </p>
                <ul>
                  <li>
                    <code>src/</code>: Next.js app, API routes, UI, lesson content
                  </li>
                  <li>
                    <code>hasura/</code>: docker config, migrations, metadata, and the course seed
                  </li>
                </ul>

                <h2 id="prerequisites">Prerequisites</h2>
                <ul>
                  <li>
                    Node.js 24 (<code>.nvmrc</code>) + npm
                  </li>
                  <li>Docker + Docker Compose</li>
                  <li>
                    Hasura CLI v2.48.10, the version <code>hasura/docker-compose.yml</code> runs:
                    <pre>
                      <code>{`curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | VERSION=v2.48.10 bash`}</code>
                    </pre>
                  </li>
                  <li>macOS or Linux (on Windows, WSL)</li>
                </ul>

                <h2 id="install">Install Dependencies</h2>
                <pre>
                  <code>{`npm ci`}</code>
                </pre>

                <h2 id="env">Environment Variables</h2>
                <p>Create local app env:</p>
                <pre>
                  <code>{`npm run setup:env`}</code>
                </pre>
                <p>
                  It copies <code>.env.example</code> to <code>.env.local</code> and generates a{' '}
                  <code>JWT_SECRET</code> and an <code>ENCRYPTION_KEY</code>, and never replaces a value you&apos;ve
                  set. By hand, generate each with <code>{`openssl rand -base64 64 | tr -d '\\n'`}</code>.
                </p>
                <p>The variables the app needs:</p>
                <pre>
                  <code>{`APP_STAGE=development
ROOT_DOMAIN=localhost
ROOT_URL=http://localhost:3000
GRAPHQL_URL=http://localhost:8080/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=<the local-only value in hasura/docker-compose.yml>
JWT_TOKEN_NAME=stoken-local
JWT_SECRET=<64-byte base64>
ENCRYPTION_KEY=<64-byte base64>
OPEN_ALL_LESSONS=true`}</code>
                </pre>
                <p>
                  <code>OPEN_ALL_LESSONS=true</code> opens every lesson to everyone, logged in or not, so you can read
                  and run the whole course without setting up login.
                </p>

                <h2 id="hasura">Hasura + Postgres</h2>
                <p>Start local services:</p>
                <pre>
                  <code>{`docker compose -f hasura/docker-compose.yml up -d`}</code>
                </pre>
                <p>Health check:</p>
                <pre>
                  <code>{`curl http://localhost:8080/healthz`}</code>
                </pre>
                <p>
                  If port 8080 is taken, start it with <code>HASURA_PORT=8090</code> in front, and use that port in{' '}
                  <code>GRAPHQL_URL</code> and <code>HASURA_GRAPHQL_ENDPOINT</code>.
                </p>

                <h2 id="migrations">Migrations + Seeds</h2>
                <p>
                  Set CLI env vars first. The admin secret is the local-only one from{' '}
                  <code>hasura/docker-compose.yml</code>:
                </p>
                <pre>
                  <code>{`export HASURA_GRAPHQL_ENDPOINT=http://localhost:8080
export HASURA_GRAPHQL_ADMIN_SECRET=changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme_changeme`}</code>
                </pre>
                <p>Apply the schema and metadata, then load the course&apos;s categories and lessons:</p>
                <pre>
                  <code>{`hasura --project hasura migrate apply --database-name default --skip-update-check
hasura --project hasura metadata apply --skip-update-check
node scripts/course-seed.js apply`}</code>
                </pre>
                <p>
                  <code>hasura/seeds/course.json</code> is the source of truth for those rows: each lesson&apos;s
                  title, order, access level and published status. To change one, edit the file and run{' '}
                  <code>node scripts/course-seed.js apply</code> (<code>diff</code> shows what would change). See
                  &ldquo;Change a Lesson&apos;s Title, Order or Access&rdquo; in <code>docs/README.md</code>.
                </p>

                <h2 id="run-web">Run Web App</h2>
                <pre>
                  <code>{`npm run dev`}</code>
                </pre>
                <ul>
                  <li>
                    Web app: <code>http://localhost:3000/course</code>
                  </li>
                  <li>
                    Hasura console: <code>http://localhost:8080/console</code>
                  </li>
                </ul>
                <p>
                  With the app running, <code>npm run check:setup</code> checks every step on this page and says how to
                  fix the first one that isn&apos;t done, then runs a lesson&apos;s code through the app in each
                  language you have images for.
                </p>

                <h2 id="run-code">Run Lesson Code</h2>
                <p>
                  The code editor in each lesson runs code on your machine, in Docker, in JavaScript, TypeScript,
                  Python, Java, C++, C#, Go, Kotlin, Swift or Rust. Nothing to sign up for. Pull or build the images
                  for the languages you&apos;ll use, once:
                </p>
                <pre>
                  <code>{`npm run runner:images javascript python java   # or with no names, all ten`}</code>
                </pre>
                <p>
                  Each run gets a new container with no network, a read-only filesystem and limits on CPU, memory,
                  processes and output. All ten images take about 13 GB of disk, most of it Swift. If a language&apos;s
                  image is missing, the editor says which command to run.
                </p>
                <p>
                  This is for running your own code on your own machine. To run strangers&apos; code on a public
                  server, use the runner service (<code>docs/runner-service.md</code>) or Judge0. See{' '}
                  <code>docs/README.md</code> for the full table of images, and{' '}
                  <code>docs/adding-a-language.md</code> to add a language.
                </p>
                <p>
                  Without the runner images, JavaScript, TypeScript and Python can run with this machine&apos;s own
                  Node.js and Python: set <code>CODE_RUNNER=system</code> in <code>.env.local</code> and restart{' '}
                  <code>npm run dev</code>. There&apos;s no sandbox (programs run as you, with your files and the
                  network), so it only runs code for a browser on the same machine, with the app at localhost. See
                  &ldquo;Running Code Without Docker&rdquo; in <code>docs/README.md</code>.
                </p>

                <h2 id="optional">Optional Integrations</h2>
                <ul>
                  <li>
                    Logging in: an OAuth app (<code>GITHUB_*</code>, <code>GOOGLE_*</code> or{' '}
                    <code>FACEBOOK_*</code>), plus <code>JWT_SECRET</code> and <code>ENCRYPTION_KEY</code>. GitHub&apos;s
                    is quickest; its callback URL is <code>http://localhost:3000/api/auth/github/callback</code>. Stripe
                    isn&apos;t needed.
                  </li>
                  <li>
                    Stripe: <code>STRIPE_PUBLISHABLE_KEY</code>, <code>STRIPE_SECRET_KEY</code>,{' '}
                    <code>STRIPE_WEBHOOK_SECRET</code>
                  </li>
                  <li>
                    Running code elsewhere than local Docker: the runner service (<code>CODE_RUNNER=service</code>,{' '}
                    <code>RUNNER_SERVICE_URL</code>, <code>RUNNER_SERVICE_SECRET</code>) or Judge0 (
                    <code>JUDGE0_API_KEY</code>, <code>JUDGE0_CALLBACK_SECRET</code>, public callback URL)
                  </li>
                  <li>
                    Email: <code>SENDINBLUE_API_KEY</code>, <code>INTERNAL_NOTIFICATION_EMAIL</code>
                  </li>
                </ul>

                <h2 id="checks">Tests and Checks</h2>
                <p>Before opening a pull request, run what CI runs:</p>
                <pre>
                  <code>{`npm run ts       # typecheck
npm test         # unit tests
npm run build    # needs Hasura with the course seed`}</code>
                </pre>
                <p>
                  <code>npm run conformance</code> runs every lesson&apos;s reference solutions and starting code in
                  every language, in Docker (<code>npm run conformance -- -t count-islands</code> for one lesson).
                  After changing a lesson&apos;s <code>runner.spec.ts</code>, run <code>npm run runner:generate</code>.
                </p>

                <h2 id="troubleshooting">Troubleshooting</h2>
                <p>
                  Start with <code>npm run check:setup</code>, which finds most of these and says what to run.
                </p>
                <h3>Missing GraphQL proxy config</h3>
                <p>
                  Ensure <code>GRAPHQL_URL</code> and <code>HASURA_GRAPHQL_ADMIN_SECRET</code> are set in{' '}
                  <code>.env.local</code>.
                </p>

                <h3>Invalid JWT secret</h3>
                <p>
                  Build/runtime errors requiring a valid <code>JWT_SECRET</code> mean your value is not a 64-byte
                  base64 string, often because <code>openssl rand -base64 64</code> split it over two lines. Delete
                  its line from <code>.env.local</code> and run <code>npm run setup:env</code>, or regenerate with:
                </p>
                <pre>
                  <code>{`openssl rand -base64 64 | tr -d '\\n'`}</code>
                </pre>

                <h3>Hasura auth/connection failures</h3>
                <p>Validate local service and env vars:</p>
                <pre>
                  <code>{`curl http://localhost:8080/healthz
echo "$HASURA_GRAPHQL_ENDPOINT"
echo "$HASURA_GRAPHQL_ADMIN_SECRET"`}</code>
                </pre>
              </StyledMarkdown>
            </Main>
          </DocsGrid>
        </DocsContainer>
      </ContentWrapper>
    </PageLayoutDefault>
  );
};

export default DocsPage;
