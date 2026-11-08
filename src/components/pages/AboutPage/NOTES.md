import * as React from 'react';
import { NextPage } from 'next';
import PageLayoutDefault from 'components/pages/PageLayout/Default';
import StyledMarkdown from 'components/blocks/StyledMarkdown';
import { Container } from 'style/elements';

import { Title } from './styles';

const AboutPage: NextPage = () => (
  <PageLayoutDefault>
    <Container>
      <StyledMarkdown>
        <Title>About Skilled.dev</Title>
        <p>
          After switching career paths in my mid 20s into software engineering, I've experienced
          first hand how difficult it can be to land the developer job that you've been dreaming of.
        </p>
        <p>
          My name is Trey and over the past 5 years I've worked a frontend and full stack developer
          in top startups in Silicon Valley. I spent countless hours preparing for interviews and
          grinded through all the books and content online. I've personally interviewed with
          companies such as Facebook and Google, and on the job I have had to opportunity to
          interview hundred of candidates. I've experienced the hiring process on both sides and
          have worked through all the concepts you will be tested on. i have distilled all my
          knowledge into building THE BEST resource to master the coding interview and get the job
          you have always wanted, guaranteed.
        </p>
        <p>
          Tell them about gitconnected.com and the publication and how I'm passionate about teaching
          developers. This is my first premium course.
        </p>
        <p>
          Tell them about gitconnected.com and the publication and how I'm passionate about teaching
          developers. This is my first premium course.
        </p>
        <p>
          This course is how I pay all the bills and keep things up and running. I also provide a
          bunch of free tools to help developers grow their careers, this has enabled me to work on
          these full time. I have no funding or employees (although if we get enough traction, I
          would love to hire you one day!). Add something like this to GC too but point to the
          skilled.dev course
        </p>
        <img src="/images/about-image.jpg" />
      </StyledMarkdown>
    </Container>
  </PageLayoutDefault>
);

export default AboutPage;
