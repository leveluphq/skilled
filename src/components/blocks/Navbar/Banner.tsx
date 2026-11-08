import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Close32 } from '@carbon/icons-react';
// import { SIDEBAR_WIDTH } from 'components/blocks/Sidebar/styles';
import useBrowserStorage from 'components/hooks/useBrowserStorage';
import { mobile } from 'style/breakpoints';
import { RawButton, pageWidthStyles } from 'style/elements';

import { wrapperStyles, contentStyles } from './styles';

const BANNER_KEY = '@@skilled/disable-banner';

interface Props {
  right?: boolean;
  sidebar?: boolean;
}

const BannerWrapper = styled.div<{ sidebar?: boolean; right?: boolean }>`
  ${wrapperStyles};
  background-color: ${({ theme }) => theme.color.textPrimary};
  color: ${({ theme }) => theme.color.backgroundPrimary};
  padding: 8px 0;
  padding-left: 12px;
  position: relative;

  ${mobile()} {
    padding: 8px 12px;
  }
`;

const BannerContent = styled.div`
  ${pageWidthStyles};
  ${contentStyles};
`;

const CourseStatus = styled.div`
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  font-weight: 400;

  ${mobile()} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LinkText = styled.a`
  padding: 8px 14px;
  border: 1px solid ${({ theme }) => theme.color.backgroundPrimary};
  color: ${({ theme }) => theme.color.backgroundPrimary};
  margin-right: 16px;
  border-radius: 2px;

  &:visited {
    color: ${({ theme }) => theme.color.backgroundPrimary};
  }

  ${mobile()} {
    margin-bottom: 8px;
  }
`;

const CloseButton = styled(RawButton)`
  line-height: 0;
  height: 100%;
  color: ${({ theme }) => theme.color.backgroundPrimary};

  svg {
    fill: ${({ theme }) => theme.color.backgroundPrimary};
  }
`;

const Banner: React.FC<Props> = ({ right, sidebar }) => {
  const [storedBannerState, setStoredBannerState] = useBrowserStorage(BANNER_KEY, 0);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!storedBannerState) {
      setIsOpen(true);
    }
  }, [storedBannerState]);

  if (!isOpen) {
    return null;
  }

  return (
    <BannerWrapper right={right} sidebar={sidebar}>
      <BannerContent>
        <CourseStatus>
          <Link href="/pricing" passHref>
            <LinkText>Claim Your Black Friday Discount</LinkText>
          </Link>{' '}
          <span>We have lift off! Skilled.dev has officially launched 🚀</span>
        </CourseStatus>
        <CloseButton
          aria-label="Close banner"
          onClick={() => {
            setIsOpen(false);
            setStoredBannerState(Date.now());
          }}
        >
          <Close32 />
        </CloseButton>
      </BannerContent>
    </BannerWrapper>
  );
};

export default Banner;
