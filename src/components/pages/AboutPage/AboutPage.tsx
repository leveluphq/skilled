import * as React from 'react';
import { NextPage } from 'next';
// import ReactPlayer from 'react-player';
// import { videoProps } from 'utils/constants/lesson';
// import { VideoWrapper } from 'style/elements/lesson';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import StyledMarkdown from 'components/blocks/StyledMarkdown';

import { Title, ContentWrapper } from './styles';
import { TREY_LINKEDIN } from 'utils/constants/internal';
import { site } from 'utils/shared/site';

const AboutPage: NextPage = () => (
  <PageLayoutDefault>
    <ContentWrapper>
      <StyledMarkdown>
        <Title>About Skilled.dev</Title>
        {/* <VideoWrapper>
          <ReactPlayer {...videoProps} url="https://vimeo.com/414601831" />
        </VideoWrapper> */}
        <p>
          My name is Trey Huffine (
          <a href="https://x.com/treyhuffine" target="_blank" rel="noopener noreferrer">
            @treyhuffine
          </a>
          ), and I'll be your teacher. My passion is to help people begin and level up their careers
          as software engineers. I have been a professional developer since 2015 and have seen all
          aspects of what's needed to ace your coding interviews, stand out in the hiring process,
          and increase your salary.
        </p>
        <p>
          Whether you are looking for your first job or trying to move up to your dream role, I will
          teach you how to win the coding interview.
        </p>
        <p>My mini-CV and experience/knowledge I'll be sharing with you:</p>
        <ul>
          <li>
            <strong>Now:</strong> Teaching coding interviews on{' '}
            <a href="https://skilled.dev">Skilled.dev</a> and building free career growth tools at{' '}
            <a href="https://gitconnected.com" rel="noopener noreferrer" target="_blank">
              gitconnected.com
            </a>
            . I'm also an active startup founder, see my <a href={TREY_LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn</a>.
          </li>
          <li>
            <strong>2016-2019:</strong> Software engineer at Postmates (a large startup in Silicon
            Valley, acquired by Uber). I interviewed hundreds of candidates, worked hand-in-hand
            with hiring managers and the recruiting team, and contributed extensively to improving
            the hiring process.
          </li>
          <li>
            <strong>2016 job search:</strong> Interviewed with numerous startups and tech giants
            (including Google and Facebook). I knew this step would lay the foundation for the rest
            of my career growth, and I committed myself to fully understanding how to land
            interviews and master the techniques to successfully answer the programming questions
            they asked.
          </li>
          <li>
            <strong>2015-2016:</strong> I worked at GrubMarket an early-stage but rapidly growing
            startup in San Francisco. During my time there, the company received a Series A and B
            funding rounds, and I worked my way up to lead engineer and manager, and I built out the
            entire hiring/interview process. GrubMarket is now a unicorn ($1B+ valuation) and on the
            path to an IPO.
          </li>
          <li>
            <strong>2015 job search:</strong> Fresh out of a bootcamp, I went through the grind of
            finding that first job as a software engineer.
          </li>
          <li>
            <strong>2014-2015:</strong> I began teaching myself web development and found my
            passion. I knew that's what I wanted to do for my job and eventually went to a coding
            bootcamp to propel me into a career as a software engineer.
          </li>
          <li>
            <strong>Earlier:</strong> I studied nuclear engineering in college where I first learned
            basic programming when I was 20 years old but had no idea the direction I wanted to go.
            I received a masters in quantitative finance before I found my passion for writing
            software and building startups.
          </li>
        </ul>
        {/* <p>
          My career in software engineering began as a self-taught web developer. I know from
          firsthand experience that anyone can learn how to do well in coding interviews if you know
          what to study and are ready to work hard. I've interviewed with numerous companies,
          including Google and Facebook. I received an offer from Google, but I did not pass the
          Facebook on-site. I will teach you what I learned from my successes and failures and show
          you how to stand out in the job search to the companies you want to work for. I ultimately
          accepted a job at a large startup (
          <a href="https://postmates.com" rel="noopener noreferrer" target="_blank">
            Postmates
          </a>
          , acquired by Uber) to be part of a team to re-build their web application using
          React/TypeScript/Golang, and it was an opportunity to take on a lot of responsibility,
          make a big impact, and learn by building a product from scratch used by millions of
          people.
        </p>
        <p>
          During my entire professional career, I've been heavily involved in the job process, both
          extensively understanding it as a candidate and as the hiring company. My first role in a
          small startup allowed me to move up to the lead engineer in less than a year. I built out
          our entire interviewing structure and was the hiring manager for all engineers. At
          Postmates, I worked closely with recruiters and hiring managers to understand and also
          improve on the process. I have interviewed hundreds of candidates over the past 5 years.
        </p>
        <p>
          I have sat on both sides of the table at small and large companies, and I can teach you
          what they are looking for when they decide who to interview and ultimately hire. If you
          purchase this course and don't think I provide this value, you can have a full refund for
          any reason, no questions asked.
        </p>
        <p>
          My guarantee to you is that this will be the best course to train you to ace your coding
          interview and help you stand out in the hiring process.
        </p> */}
        <p>
          I have put thousands of hours into research, writing content, and building the platform. I
          am incredibly excited to teach you everything that I know.
        </p>
        <p>
          Skilled.dev is open source. The lessons, their tests, and the code runner are all{' '}
          <a href={site.sourceUrl} target="_blank" rel="noopener noreferrer">
            on GitHub
          </a>
          , so you can run the whole course on your own computer, fix a mistake you spot, or add a
          language. The <a href="/docs">developer docs</a> show how to set it up.
        </p>
        <p>
          I have also built a bunch of tools on gitconnected.com to help you grow your career as a
          developer that will be free forever:{' '}
          <a
            href="https://gitconnected.com/resume-builder"
            target="_blank"
            rel="noreferrer noopener"
          >
            resume builder
          </a>
          ,{' '}
          <a
            href="https://gitconnected.com/portfolio-api"
            target="_blank"
            rel="noreferrer noopener"
          >
            portfolio API
          </a>
          , and{' '}
          <a href="https://gitconnected.com/learn" target="_blank" rel="noreferrer noopener">
            coding tutorials
          </a>{' '}
          ranked by developers.
        </p>
      </StyledMarkdown>
    </ContentWrapper>
  </PageLayoutDefault>
);

export default AboutPage;
