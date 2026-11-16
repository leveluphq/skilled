import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight16, Help20, ArrowRight20, ChevronRight32 } from '@carbon/icons-react';
import { IS_FULL_COURSE_FREE } from 'utils/constants/payments';
import { CodingLanguage } from 'utils/constants/lesson';
import { languageGuides, resourcePath } from 'content/resources';
import { programmingLanguageLabel } from 'utils/shared/programmingLanguages';
import { GIFT_CARD_ID } from 'components/pages/PricingPage/PricingPage';
import GradientBorder from 'components/blocks/GradientBorder';
import { PageRoot } from 'utils/constants/routes';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import AuthModal from 'components/blocks/Modal/AuthModal';
import useSmoothScrollLinks from 'components/hooks/useSmoothScrollLinks';
import { TREY_TWITTER, TREY_LINKEDIN, TREY_YOUTUBE, JOBS_LINK } from 'utils/constants/internal';
import { LogoGithub20, LogoLinkedin20, LogoTwitter20, LogoYoutube20 } from '@carbon/icons-react';
import { site } from 'utils/shared/site';
import SampleVideo from './SampleVideo';
import SampleArticle from './SampleArticle';
import LessonCard from './LessonCard';
import CompaniesSection from './CompaniesSection';
import { Props } from './props';

import {
  Header,
  HeaderDescription,
  Subheader,
  DescriptionText,
  SectionSecondary,
  PaddedSection,
  ContainerWide,
  ContainerWidest,
  ContainerFull,
  SectionTitle,
  SectionSubtitle,
  FlexItems,
  FlexStretch,
  CalloutSection,
  CalloutTitle,
  CalloutDescription,
  ButtonSection,
  BlackButton,
  WhiteButton,
  CenterButtonWrapper,
  CourseTools,
  CourseToolItem,
  CourseToolImg,
  CourseToolText,
  CompanySection,
  GradientTitle,
  LanguageContentWrapper,
  LanguageSection,
  LanguageGrid,
  LanguageLogo,
  BorderBottom,
  TerminalWrapper,
  TerminalTopBar,
  TerminalButton,
  TerminalWindow,
  TerminalChevronWrapper,
  TerminalChevron,
  TerminalTextWrapper,
  TerminalText,
  TerminalButtonWrapper,
  LinkSimple,
  HighlightText,
  GutterWrapper,
  BrandText,
  PurchaseButton,
  GithubButton,
  Card,
  CardContent,
  IconList,
  IconListItem,
  IconListItemText,
  PurchaseButtonCenter,
  FinePrint,
  SocialContainer,
  SocialButtonWrapper,
  TwitterButton,
  LinkedInButton,
  YoutubeButton,
  FindJobButton,
  StatText,
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

const TERMINAL_VALUE_PROPS = [
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

const Underscore = () => <BrandText>_</BrandText>;
const Period = () => <BrandText>.</BrandText>;

const HomePage: React.FC<Props> = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  useSmoothScrollLinks();

  return (
    <>
      <PageLayoutDefault>
        <ContainerWidest>
          <Header>
            Skilled.dev{IS_FULL_COURSE_FREE ? ' - Free coding interview practice' : ''}
          </Header>
          <HeaderDescription>
            Study data structures and algorithms with explanations and coding exercises in ten
            languages. {IS_FULL_COURSE_FREE ? 'Free and open source.' : 'Open source.'}
          </HeaderDescription>
          <Subheader>Ace Your Coding Interviews</Subheader>
          <TerminalWrapper>
            <GradientBorder
              fontSize="1em"
              padding="0"
              radius="16px"
              borderWidth="2px"
              fontWeight={400}
            >
              <TerminalTopBar>
                <TerminalButton idx={0} />
                <TerminalButton idx={1} />
                <TerminalButton idx={2} />
              </TerminalTopBar>
              <TerminalWindow>
                <TerminalChevronWrapper>
                  <TerminalChevron>
                    <ChevronRight32 />
                  </TerminalChevron>
                </TerminalChevronWrapper>
                <TerminalTextWrapper>
                  {TERMINAL_VALUE_PROPS.map((text, i) => (
                    <TerminalText key={i} delay={i + 1.5}>
                      {text}
                    </TerminalText>
                  ))}
                  <TerminalButtonWrapper>
                    <PurchaseButton onClick={() => setIsOpen(true)}>
                      <span style={{ marginRight: '12px' }}>
                        Create {IS_FULL_COURSE_FREE ? 'a Free' : ''} Account for Full Access
                      </span>{' '}
                      <ArrowRight20 />
                    </PurchaseButton>
                    <GithubButton href={site.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <LogoGithub20 />
                      <span style={{ marginLeft: '12px' }}>Star on GitHub</span>
                    </GithubButton>
                  </TerminalButtonWrapper>
                </TerminalTextWrapper>
              </TerminalWindow>
            </GradientBorder>
          </TerminalWrapper>
          <SocialContainer>
            <div style={{ marginTop: '64px', marginBottom: '12px', fontWeight: 600 }}>
              Follow your teacher
            </div>
            <SocialButtonWrapper>
              <TwitterButton href={TREY_TWITTER} target="_blank" rel="noopener noreferrer">
                <LogoTwitter20 /> <span style={{ marginLeft: '4px' }}>@treyhuffine</span>
              </TwitterButton>
              <LinkedInButton href={TREY_LINKEDIN} target="_blank" rel="noopener noreferrer">
                <LogoLinkedin20 /> <span style={{ marginLeft: '4px' }}>LinkedIn</span>
              </LinkedInButton>
              <YoutubeButton href={TREY_YOUTUBE} target="_blank" rel="noopener noreferrer">
                <LogoYoutube20 /> <span style={{ marginLeft: '4px' }}>YouTube</span>
              </YoutubeButton>
            </SocialButtonWrapper>
            <div style={{ marginTop: '24px', marginBottom: '12px', fontWeight: 600 }}>
              When you're ready
            </div>
            <div style={{ width: '100%', textAlign: 'center', marginBottom: '1.75rem' }}>
              <FindJobButton href={JOBS_LINK} target="_blank" rel="noopener noreferrer">
                Find a Job
              </FindJobButton>
            </div>
          </SocialContainer>
          <DescriptionText>
            Work through data structures, algorithms, and JavaScript with explanations, video
            walkthroughs, and coding exercises. For extra practice, explore the{' '}
            <Link href="/learn" passHref>
              <LinkSimple>free guides, study plans, and interactive tools</LinkSimple>
            </Link>
            .
          </DescriptionText>
          <DescriptionText>
            My name is Trey, and I'll be your teacher. Get to know me better on the{' '}
            <Link href={`/${PageRoot.About}`} passHref>
              <LinkSimple>about page</LinkSimple>
            </Link>{' '}
            and my journey as a software engineer where I received a Google offer after my first
            year of experience and deeply immersed myself in the interview process while working in
            Silicon Valley startups, both as a candidate and interviewer. Or keep scrolling if you
            want to learn more about the course.
          </DescriptionText>
          <div style={{ textAlign: 'center', marginTop: '64px' }}>
            <StatText>{DEVS_HELPED}</StatText>
            <div
              style={{
                marginTop: '12',
                maxWidth: '360px',
                margin: '0 auto',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              Developers used the Skilled.dev course to pass their interviews
            </div>
          </div>
        </ContainerWidest>
        <PaddedSection>
          <ContainerWidest>
            <CourseTools>
              <CourseToolItem>
                <a href={`#${VIDEO_ID}`}>
                  <CourseToolImg src="/images/valueprops/video.svg" alt="Solution videos" />
                </a>
                <CourseToolText>Solution Videos</CourseToolText>
              </CourseToolItem>
              <CourseToolItem>
                <a href={`#${CODE_ID}`}>
                  <CourseToolImg src="/images/valueprops/terminal.svg" alt="Code execution" />
                </a>
                <CourseToolText>Code Execution</CourseToolText>
              </CourseToolItem>
              <CourseToolItem>
                <a href={`#${ARTICLE_ID}`}>
                  <CourseToolImg src="/images/valueprops/cognitive.svg" alt="Guided articles" />
                </a>
                <CourseToolText>Guided Articles</CourseToolText>
              </CourseToolItem>
            </CourseTools>
          </ContainerWidest>
        </PaddedSection>
        <SectionSecondary>
          <PaddedSection>
            <ContainerWidest>
              <SectionTitle>
                <Underscore />
                Programming language guides
                <Period />
              </SectionTitle>
              {!IS_FULL_COURSE_FREE && (
                <>
                  <SectionSubtitle>
                    Lock in your price by buying a gift card and activate it when you're ready to
                    start studying to land your next job
                  </SectionSubtitle>
                  <Card>
                    <CardContent>
                      <div style={{ lineHeight: 1.65, textAlign: 'center' }}>
                        If you're not ready to start the course now, you can still lock in the
                        current price by buying a gift card for yourself.
                      </div>
                      <IconList>
                        <IconListItem>
                          <Help20 />
                          <IconListItemText>Waiting for your language to be added</IconListItemText>
                        </IconListItem>
                        <IconListItem>
                          <Help20 />
                          <IconListItemText>Not on the job hunt</IconListItemText>
                        </IconListItem>
                        <IconListItem>
                          <Help20 />
                          <IconListItemText>Don't have time for a full course</IconListItemText>
                        </IconListItem>
                      </IconList>
                      <div>
                        <Link href={`/${PageRoot.Pricing}#${GIFT_CARD_ID}`} passHref>
                          <PurchaseButtonCenter>
                            <span style={{ marginRight: '12px' }}>Buy a Gift Card</span>{' '}
                            <ArrowRight20 />
                          </PurchaseButtonCenter>
                        </Link>
                      </div>
                      <FinePrint>
                        Gift cards are automatically added to your account and can be redeemed
                        anytime from the settings page for full access.
                      </FinePrint>
                    </CardContent>
                  </Card>
                </>
              )}
              <LanguageContentWrapper>
                <LanguageSection>
                  <p style={{ width: '100%', lineHeight: 1.8, marginTop: 16 }}>
                    Free guides cover collections, language behavior, and worked algorithms. Each
                    lesson editor shows its available languages for this deployment.
                  </p>
                </LanguageSection>
                <LanguageGrid aria-label="Programming language guides">
                  {languageGuides.map((guide) => {
                    const language = guide.slug.toUpperCase() as CodingLanguage;
                    return (
                      <Link key={guide.slug} href={resourcePath(guide)} passHref>
                        <a>
                          <LanguageLogo
                            src={LANGUAGE_LOGOS[language]}
                            alt=""
                            aria-hidden="true"
                            width={56}
                            height={56}
                            loading="lazy"
                          />
                          <span>{programmingLanguageLabel(guide.slug)}</span>
                        </a>
                      </Link>
                    );
                  })}
                </LanguageGrid>
              </LanguageContentWrapper>
            </ContainerWidest>
          </PaddedSection>
        </SectionSecondary>
        <BorderBottom>
          <ContainerWidest id={VIDEO_ID}>
            <PaddedSection>
              <SectionTitle>
                <Underscore />
                Solution Videos
                <Period />
              </SectionTitle>
              <SectionSubtitle>
                Detailed video walkthroughs for every interview solution
              </SectionSubtitle>
              <SampleVideo />
            </PaddedSection>
          </ContainerWidest>
        </BorderBottom>
        <BorderBottom>
          <ContainerFull style={{ paddingLeft: 0, paddingRight: 0 }} id={CODE_ID}>
            <PaddedSection>
              <SectionTitle>
                <Underscore />
                Code Execution
                <Period />
              </SectionTitle>
              <SectionSubtitle>
                The best way to learn anything in programming is by writing code
              </SectionSubtitle>
              <SampleEditor userId="" />
            </PaddedSection>
          </ContainerFull>
        </BorderBottom>
        <ContainerFull style={{ paddingLeft: 0, paddingRight: 0 }} id={ARTICLE_ID}>
          <PaddedSection>
            <GutterWrapper>
              <SectionTitle>
                <Underscore />
                Guided Articles
                <Period />
              </SectionTitle>
              <SectionSubtitle style={{ marginBottom: 0 }}>
                Break down how to think through each question step-by-step and solve the problem at
                your own pace
              </SectionSubtitle>
            </GutterWrapper>
            <SampleArticle />
          </PaddedSection>
        </ContainerFull>
        <SectionSecondary>
          <ContainerWidest>
            <PaddedSection>
              <SectionTitle>
                <Underscore />
                Course Outline
                <Period />
              </SectionTitle>
              <SectionSubtitle>
                Carefully curated to contain everything you need to know in a single platform to ace
                your coding interviews
              </SectionSubtitle>
              {CATEGORIES.map((c) => (
                <Link key={c.name} href={`/${PageRoot.Course}#${c.link}`} passHref>
                  <a>
                    <LessonCard name={c.name} />
                  </a>
                </Link>
              ))}
              <CenterButtonWrapper>
                <Link href={`/${PageRoot.Course}`} passHref>
                  <WhiteButton style={{ marginBottom: 0 }}>
                    View Full Course <ArrowRight16 />
                  </WhiteButton>
                </Link>
              </CenterButtonWrapper>
            </PaddedSection>
          </ContainerWidest>
        </SectionSecondary>
        <CompanySection>
          <ContainerFull style={{ paddingLeft: 0, paddingRight: 0 }}>
            <GradientTitle>
              <GradientBorder
                startColor="#FF4D4D"
                fontSize="1.2em"
                padding="16px"
                radius="64px"
                borderWidth="3px"
              >
                Our Students Have Received Offers from Awesome Companies
              </GradientBorder>
            </GradientTitle>
            <CompaniesSection />
          </ContainerFull>
        </CompanySection>
        <CalloutSection>
          <ContainerWide>
            <FlexItems>
              <FlexStretch>
                <CalloutTitle>Land your dream job.</CalloutTitle>
                <CalloutDescription>
                  Walk into your coding interviews feeling like you own the room.
                </CalloutDescription>
              </FlexStretch>
              <ButtonSection>
                <BlackButton onClick={() => setIsOpen(true)}>Create Free Account</BlackButton>
                <Link href={`/${PageRoot.Course}`} passHref>
                  <WhiteButton>View Course</WhiteButton>
                </Link>
              </ButtonSection>
            </FlexItems>
          </ContainerWide>
        </CalloutSection>
      </PageLayoutDefault>
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default HomePage;
