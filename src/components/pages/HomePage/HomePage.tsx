import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowDown16,
  ArrowRight16,
  ArrowRight20,
  Book24,
  Code24,
  LogoGithub20,
  LogoLinkedin16,
  LogoTwitter16,
  LogoYoutube16,
  Video24,
} from '@carbon/icons-react';
import { IS_FULL_COURSE_FREE } from 'utils/constants/payments';
import { CodingLanguage } from 'utils/constants/lesson';
import { languageGuides, resourcePath } from 'content/resources';
import videos from 'content/videos/catalog.json';
import { programmingLanguageLabel } from 'utils/shared/programmingLanguages';
import { site } from 'utils/shared/site';
import { GIFT_CARD_ID } from 'components/pages/PricingPage/PricingPage';
import { PageRoot } from 'utils/constants/routes';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import AuthModal from 'components/blocks/Modal/AuthModal';
import useSmoothScrollLinks from 'components/hooks/useSmoothScrollLinks';
import { TREY_TWITTER, TREY_LINKEDIN, TREY_YOUTUBE, JOBS_LINK } from 'utils/constants/internal';
import SampleVideo from './SampleVideo';
import SampleArticle from './SampleArticle';
import { Props } from './props';

import {
  Page,
  Container,
  Hero,
  HeroEyebrow,
  HeroTitle,
  HeroLead,
  ButtonRow,
  PrimaryButton,
  SecondaryButton,
  TextLink,
  Terminal,
  TerminalBar,
  TerminalBody,
  TerminalLine,
  HighlightText,
  HeroLanguages,
  FollowRow,
  JobLink,
  Section,
  SectionHeader,
  Eyebrow,
  SectionTitle,
  SectionLead,
  Stats,
  LogoCloud,
  Features,
  Feature,
  Demo,
  DemoFrame,
  Outline,
  Teacher,
  Closing,
  GiftCard,
} from './styles';

const DEVS_HELPED = '12k+';

const SampleEditor = dynamic(() => import('./SampleEditor'), {
  ssr: false,
});

const VIDEO_ID = 'video-section';
const CODE_ID = 'code-section';
const ARTICLE_ID = 'article-section';

const CATEGORIES = [
  { name: 'Big O', link: 'essential-concepts' },
  { name: 'Arrays', link: 'arrays' },
  { name: 'Hash Tables', link: 'hashtables' },
  { name: 'Strings', link: 'strings' },
  { name: 'Recursion', link: 'recursion' },
  { name: 'Searching and Sorting', link: 'searching-and-sorting' },
  { name: 'Linked Lists', link: 'linked-lists' },
  { name: 'Stacks and Queues', link: 'stacks-and-queues' },
  { name: 'Trees', link: 'trees' },
  { name: 'Graphs', link: 'graphs' },
  { name: 'Dynamic Programming', link: 'dynamic-programming' },
  { name: 'JavaScript', link: 'javascript' },
];

// Companies where learners have received offers, shown as one quiet row of marks
// (logos that stay legible as a one-color silhouette; Microsoft's is the Windows mark)
const COMPANIES = [
  ['google', 'Google'],
  ['amazon', 'Amazon'],
  ['apple', 'Apple'],
  ['windows', 'Microsoft'],
  ['netflix', 'Netflix'],
  ['linkedin', 'LinkedIn'],
  ['stripe', 'Stripe'],
  ['uber', 'Uber'],
  ['lyft', 'Lyft'],
  ['slack', 'Slack'],
];

const TERMINAL_LINES = [
  <>
    Walk into your coding interviews feeling like you{' '}
    <HighlightText delaySeconds={2}>own the room</HighlightText>.
  </>,
  <>
    Feel empowered to <HighlightText delaySeconds={4}>land your dream job</HighlightText>.
  </>,
  <>
    Confidently <HighlightText delaySeconds={6}>answer any technical question</HighlightText>.
  </>,
  <>Never bomb an interview again.</>,
];

// A logo for each language the code editor runs
const LOGOS = 'https://gitconnected.com/public/images/tutorials/svg';
const LANGUAGE_LOGOS: Record<CodingLanguage, string> = {
  [CodingLanguage.Javascript]: `${LOGOS}/javascript.svg`,
  [CodingLanguage.Typescript]: `${LOGOS}/typescript.svg`,
  [CodingLanguage.Python]: `${LOGOS}/python.svg`,
  [CodingLanguage.Java]: `${LOGOS}/java.svg`,
  [CodingLanguage.Cpp]: `${LOGOS}/c-plus-plus.svg`,
  [CodingLanguage.Csharp]: `${LOGOS}/c-sharp.svg`,
  [CodingLanguage.Go]: `${LOGOS}/golang.svg`,
  [CodingLanguage.Kotlin]: `${LOGOS}/kotlin.svg`,
  [CodingLanguage.Swift]: `${LOGOS}/ios-swift.svg`,
  // Rust's logo is black, so this copy is white for the dark background
  [CodingLanguage.Rust]: '/images/languages/rust.svg',
};

const HomePage: React.FC<Props> = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const openSignUp = () => setIsOpen(true);
  const signUpLabel = IS_FULL_COURSE_FREE ? 'Create a free account' : 'Create an account';

  useSmoothScrollLinks();

  return (
    <>
      <PageLayoutDefault>
        <Page>
          <Hero>
            <Container>
              <HeroEyebrow>Free and open-source coding interview prep</HeroEyebrow>
              <HeroTitle>
                Ace your coding <span>interviews</span>
              </HeroTitle>
              <HeroLead>
                Learn data structures and algorithms with video walkthroughs, step-by-step
                explanations, and exercises you can run in {languageGuides.length} languages.
              </HeroLead>
              <ButtonRow centered>
                <PrimaryButton type="button" onClick={openSignUp}>
                  {signUpLabel} <ArrowRight20 />
                </PrimaryButton>
                <SecondaryButton href={site.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <LogoGithub20 /> Star on GitHub
                </SecondaryButton>
              </ButtonRow>
              <Terminal>
                <TerminalBar aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <span>~/skilled.dev</span>
                </TerminalBar>
                <TerminalBody>
                  {TERMINAL_LINES.map((line, i) => (
                    <TerminalLine key={i} delay={0.3 + i * 0.6}>
                      <span>{line}</span>
                    </TerminalLine>
                  ))}
                </TerminalBody>
              </Terminal>
              <HeroLanguages>
                <p>Practice in {languageGuides.length} languages</p>
                <ul aria-label="Programming language guides">
                  {languageGuides.map((guide) => {
                    const language = guide.slug.toUpperCase() as CodingLanguage;
                    return (
                      <li key={guide.slug}>
                        <Link href={resourcePath(guide)} passHref>
                          <a>
                            <img
                              src={LANGUAGE_LOGOS[language]}
                              alt=""
                              aria-hidden="true"
                              width={20}
                              height={20}
                            />
                            {programmingLanguageLabel(guide.slug)}
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </HeroLanguages>
              <FollowRow aria-label="Follow your teacher">
                <span>Follow your teacher</span>
                <a href={TREY_TWITTER} target="_blank" rel="noopener noreferrer">
                  <LogoTwitter16 /> @treyhuffine
                </a>
                <a href={TREY_LINKEDIN} target="_blank" rel="noopener noreferrer">
                  <LogoLinkedin16 /> LinkedIn
                </a>
                <a href={TREY_YOUTUBE} target="_blank" rel="noopener noreferrer">
                  <LogoYoutube16 /> YouTube
                </a>
                <JobLink href={JOBS_LINK} target="_blank" rel="noopener noreferrer">
                  When you're ready, find a job <ArrowRight16 />
                </JobLink>
              </FollowRow>
            </Container>
          </Hero>

          <Section aria-label="Skilled.dev by the numbers">
            <Container>
              <Stats>
                <div>
                  <dt>developers have prepared with Skilled.dev</dt>
                  <dd>{DEVS_HELPED}</dd>
                </div>
                <div>
                  <dt>lessons across 12 core topics</dt>
                  <dd>60+</dd>
                </div>
                <div>
                  <dt>video walkthroughs, all free</dt>
                  <dd>{videos.length}</dd>
                </div>
                <div>
                  <dt>free and open source</dt>
                  <dd>100%</dd>
                </div>
              </Stats>
              <LogoCloud>
                <p>Learners have gone on to receive offers from</p>
                <ul>
                  {COMPANIES.map(([logo, name]) => (
                    <li key={logo}>
                      <img
                        src={`/images/companylogos/${logo}.svg`}
                        alt={name}
                        title={name}
                        loading="lazy"
                      />
                    </li>
                  ))}
                </ul>
              </LogoCloud>
            </Container>
          </Section>

          <Section>
            <Container>
              <SectionHeader>
                <Eyebrow>How it works</Eyebrow>
                <SectionTitle>Everything you need to prepare, in one place</SectionTitle>
                <SectionLead>
                  Each lesson teaches a pattern, walks through a real interview question, and lets
                  you write and test your own answer before you look at the solution.
                </SectionLead>
              </SectionHeader>
              <Features>
                <Feature>
                  <Video24 aria-hidden="true" />
                  <h3>Video walkthroughs</h3>
                  <p>
                    Every solution has a video, split into chapters so you can jump straight to the
                    part you're stuck on.
                  </p>
                  <TextLink href={`#${VIDEO_ID}`}>
                    Watch a sample <ArrowDown16 />
                  </TextLink>
                </Feature>
                <Feature>
                  <Code24 aria-hidden="true" />
                  <h3>Run code in your language</h3>
                  <p>
                    Write and test your solution in the browser, in JavaScript, Python, Java, Go and
                    six more languages.
                  </p>
                  <TextLink href={`#${CODE_ID}`}>
                    Try the editor <ArrowDown16 />
                  </TextLink>
                </Feature>
                <Feature>
                  <Book24 aria-hidden="true" />
                  <h3>Guided explanations</h3>
                  <p>
                    Step-by-step articles show how to reason from a brute-force answer to the
                    optimal one, with hints along the way.
                  </p>
                  <TextLink href={`#${ARTICLE_ID}`}>
                    Read an example <ArrowDown16 />
                  </TextLink>
                </Feature>
              </Features>
            </Container>
          </Section>

          <Demo id={VIDEO_ID}>
            <Container>
              <SectionHeader>
                <Eyebrow>Video walkthroughs</Eyebrow>
                <SectionTitle>Watch the solution, one chapter at a time</SectionTitle>
                <SectionLead>
                  From the question to the brute force to the optimal answer and its Big O. Pick a
                  chapter to jump to it.
                </SectionLead>
              </SectionHeader>
              <SampleVideo />
            </Container>
          </Demo>

          <Demo id={CODE_ID}>
            <Container>
              <SectionHeader>
                <Eyebrow>In-browser editor</Eyebrow>
                <SectionTitle>Write the code and run the tests yourself</SectionTitle>
                <SectionLead>
                  This is the real editor. Pick a language, write a solution and run it against the
                  lesson's tests.
                </SectionLead>
              </SectionHeader>
              <DemoFrame>
                <SampleEditor userId="" />
              </DemoFrame>
            </Container>
          </Demo>

          <Demo id={ARTICLE_ID}>
            <Container>
              <SectionHeader>
                <Eyebrow>Guided articles</Eyebrow>
                <SectionTitle>Learn how to think, not just what to type</SectionTitle>
                <SectionLead>
                  Break each question down step by step and solve it at your own pace.
                </SectionLead>
              </SectionHeader>
              <SampleArticle />
            </Container>
          </Demo>

          <Section>
            <Container>
              <SectionHeader>
                <Eyebrow>The course</Eyebrow>
                <SectionTitle>Twelve topics, from Big O to dynamic programming</SectionTitle>
                <SectionLead>
                  Carefully ordered to cover everything you need for a coding interview, in one
                  place.
                </SectionLead>
              </SectionHeader>
              <Outline>
                {CATEGORIES.map((c) => (
                  <li key={c.name}>
                    <Link href={`/${PageRoot.Course}#${c.link}`} passHref>
                      <a>{c.name}</a>
                    </Link>
                  </li>
                ))}
              </Outline>
              <ButtonRow>
                <Link href={`/${PageRoot.Course}`} passHref>
                  <TextLink>
                    View the full course <ArrowRight16 />
                  </TextLink>
                </Link>
                <Link href="/learn" passHref>
                  <TextLink>
                    Free guides, study plans and tools <ArrowRight16 />
                  </TextLink>
                </Link>
              </ButtonRow>
              {!IS_FULL_COURSE_FREE && (
                <GiftCard>
                  <SectionLead>
                    Not ready to start? Lock in today's price with a gift card for yourself and
                    activate it when you are, for example if you're:
                  </SectionLead>
                  <ul>
                    <li>waiting for your language to be added</li>
                    <li>not on the job hunt yet</li>
                    <li>short on time for a full course right now</li>
                  </ul>
                  <Link href={`/${PageRoot.Pricing}#${GIFT_CARD_ID}`} passHref>
                    <SecondaryButton>
                      Buy a gift card <ArrowRight20 />
                    </SecondaryButton>
                  </Link>
                  <small>
                    Gift cards are added to your account automatically and can be redeemed from
                    the settings page at any time.
                  </small>
                </GiftCard>
              )}
            </Container>
          </Section>

          <Section>
            <Container>
              <Teacher>
                <div>
                  <Eyebrow>Your teacher</Eyebrow>
                  <SectionTitle>Learn from someone who's hired engineers</SectionTitle>
                </div>
                <div>
                  <SectionLead>
                    I'm Trey Huffine. I received a Google offer after my first year as a software
                    engineer, then spent years in Silicon Valley startups interviewing candidates
                    and helping shape how they were hired. Skilled.dev is what I learned from both
                    sides of the table.
                  </SectionLead>
                  <Link href={`/${PageRoot.About}`} passHref>
                    <TextLink>
                      More about me <ArrowRight16 />
                    </TextLink>
                  </Link>
                </div>
              </Teacher>
            </Container>
          </Section>

          <Closing>
            <Container>
              <SectionTitle>Land your dream job.</SectionTitle>
              <SectionLead>
                Walk into your next coding interview feeling like you own the room.
              </SectionLead>
              <ButtonRow centered>
                <PrimaryButton type="button" onClick={openSignUp}>
                  {signUpLabel} <ArrowRight20 />
                </PrimaryButton>
                <Link href={`/${PageRoot.Course}`} passHref>
                  <SecondaryButton>Browse the course</SecondaryButton>
                </Link>
              </ButtonRow>
            </Container>
          </Closing>
        </Page>
      </PageLayoutDefault>
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default HomePage;
