import * as React from 'react';
import FooterNavigation from 'components/blocks/FooterNavigation/FooterNavigation';
import {
  LogoFacebook16,
  LogoYoutube16,
  LogoTwitter16,
  // @ts-ignore missing instagram in types
  LogoInstagram16,
  LogoLinkedin16,
} from '@carbon/icons-react';
import FeedbackModal from 'components/blocks/Modal/FeedbackModal';
import {
  TREY_TWITTER,
  COMPANY_YOUTUBE,
  COMPANY_TWITTER,
  COMPANY_FACEBOOK_PAGE,
  COMPANY_INSTAGRAM,
  COMPANY_LINKEDIN,
  SLACK_INVITE_LINK,
} from 'utils/constants/internal';

import {
  Wrapper,
  Content,
  ContentGroup,
  TwitterButton,
  FeedbackButton,
  FooterSection,
  FooterSectionText,
  FooterLink,
  SlackInvite,
  Divider,
  FindJobButton,
  ButtonSection,
} from './styles';

interface Props {
  sidebar?: boolean;
  right?: boolean;
}

const Footer: React.FC<Props> = ({ sidebar, right }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  const openFeedbackModal = React.useCallback(() => {
    setIsFeedbackOpen(true);
  }, [setIsFeedbackOpen]);
  const closeFeedbackModal = React.useCallback(() => {
    setIsFeedbackOpen(false);
  }, [setIsFeedbackOpen]);

  return (
    <>
      <Wrapper sidebar={sidebar} right={right}>
        <Content>
          <ContentGroup>
            <FooterSection>
              Skilled.dev by{' '}
              <TwitterButton href={TREY_TWITTER} target="_blank" rel="noopener noreferrer">
                @treyhuffine
              </TwitterButton>
            </FooterSection>
            <FooterSectionText>Skilled.dev && Gitconnected Inc © 2020 - ∞</FooterSectionText>
          </ContentGroup>
          <ButtonSection>
            <div style={{ color: 'gray', fontSize: '14px', marginBottom: '8px' }}>
              Visit the Level Up jobs platform
            </div>
            <FindJobButton
              href="https://jobs.levelup.dev/talent/welcome?referral=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Find a Job
            </FindJobButton>
          </ButtonSection>
          <ContentGroup>
            <FooterSection>
              <span>
                <SlackInvite href={SLACK_INVITE_LINK} target="_blank" rel="noopener noreferrer">
                  Join Slack Group
                </SlackInvite>
              </span>
              <Divider> | </Divider>
              <FeedbackButton onClick={openFeedbackModal}>
                Submit Feedback <span style={{ marginLeft: '8px' }}>🤓</span>
              </FeedbackButton>
            </FooterSection>
            <FooterSection as="nav" aria-label="Social profiles">
              <FooterLink
                href={COMPANY_YOUTUBE}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Coding interview youtube"
              >
                <LogoYoutube16 />
              </FooterLink>
              <FooterLink
                href={COMPANY_TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Skilled.dev Twitter profile"
              >
                <LogoTwitter16 />
              </FooterLink>
              <FooterLink
                href={COMPANY_FACEBOOK_PAGE}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Skilled.dev facebook page"
              >
                <LogoFacebook16 />
              </FooterLink>
              <FooterLink
                href={COMPANY_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Skilled.dev Instagram profile"
              >
                <LogoInstagram16 />
              </FooterLink>
              <FooterLink
                href={COMPANY_LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Skilled.dev LinkedIn page"
              >
                <LogoLinkedin16 />
              </FooterLink>
            </FooterSection>
          </ContentGroup>
          <FooterNavigation />
        </Content>
      </Wrapper>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={closeFeedbackModal} />
    </>
  );
};

export default Footer;
