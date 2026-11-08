import * as React from 'react';
import { TREY_TWITTER, TREY_LINKEDIN, TREY_YOUTUBE } from 'utils/constants/internal';
import { LogoLinkedin16, LogoTwitter16, LogoYoutube16 } from '@carbon/icons-react';

import { TitleWrapper, TitleText, FollowContainer, SocialMediaIcon, ShareTitle } from '../styles';

const Title = () => {
  return (
    <TitleWrapper>
      <TitleText>Coding interview course</TitleText>
      <FollowContainer>
        <ShareTitle>Follow teacher</ShareTitle>{' '}
        <SocialMediaIcon
          href={TREY_TWITTER}
          aria-label="Teacher on Twitter"
          rel="noopener noreferrer"
        >
          <LogoTwitter16 />
        </SocialMediaIcon>{' '}
        <SocialMediaIcon
          href={TREY_LINKEDIN}
          aria-label="Teacher on LinkedIn"
          rel="noopener noreferrer"
        >
          <LogoLinkedin16 />
        </SocialMediaIcon>{' '}
        <SocialMediaIcon
          href={TREY_YOUTUBE}
          aria-label="Teacher on YouTube"
          rel="noopener noreferrer"
        >
          <LogoYoutube16 />
        </SocialMediaIcon>
      </FollowContainer>
    </TitleWrapper>
  );
};

export default Title;
