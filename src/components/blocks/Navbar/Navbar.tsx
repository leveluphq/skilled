import * as React from 'react';
import Link from 'next/link';
import { Login16 } from '@carbon/icons-react';
import { PageRoot } from 'utils/constants/routes';
import getActiveLessonSlug from 'utils/client/getActiveLessonSlug';
import { getHasSubscription } from 'utils/client/lesson';
import { IS_FULL_COURSE_FREE } from 'utils/constants/payments';
import LogoSvg from 'svg/Logo';
import Banner from './Banner';
import AuthSection from './AuthSection';
import { Props } from './props';

import {
  Headroom,
  Logo,
  Header,
  Content,
  Section,
  NavItem,
  LogoLink,
  HiddenItem,
  FADE_TIMER_MS,
} from './styles';

const IS_BANNER_ACTIVE = false;

// NOTE: This feels like an anti-pattern, but using simply using a closure was the easiest way I could get this to work.
let isFirstLoad = true;

const Navbar: React.FC<Props> = (props) => {
  const [isFocused, setIsfocused] = React.useState(false);
  const handleNavbarFocus = React.useCallback(() => {
    setIsfocused(true);
  }, [isFocused]);
  const handleNavbarBlur = React.useCallback(() => {
    setIsfocused(false);
  }, [isFocused]);
  const { data, hideContinue } = props;
  const viewer = data?.users_by_pk;
  const isLoadingViewer = !viewer && !props.error && props.loading;
  const { href } = getActiveLessonSlug(viewer);
  const [handleLoaded, setHandleLoaded] = React.useState(false);
  const hasSubscription = getHasSubscription(viewer);

  React.useEffect(() => {
    if (!isLoadingViewer) {
      setHandleLoaded(true);

      setTimeout(() => {
        isFirstLoad = false;
      }, FADE_TIMER_MS * 2);
    }
  }, [isLoadingViewer]);

  return (
    <>
      <Headroom isFocused={isFocused} isFixed={props.isFixed} disable={props.disableHeadroom}>
        <Header right={props.right} sidebar={props.sidebar}>
          <Content>
            <Section>
              <Logo>
                <Link href="/" passHref>
                  <LogoLink onFocus={handleNavbarFocus} onBlur={handleNavbarBlur}>
                    <LogoSvg />
                  </LogoLink>
                </Link>
              </Logo>
              <Link href={`/${PageRoot.Course}`} passHref>
                <NavItem displayMobile onFocus={handleNavbarFocus} onBlur={handleNavbarBlur}>
                  Course
                </NavItem>
              </Link>
              <Link href="/learn" passHref>
                <NavItem displayMobile onFocus={handleNavbarFocus} onBlur={handleNavbarBlur}>Resources</NavItem>
              </Link>
              {!hasSubscription && !isLoadingViewer && !IS_FULL_COURSE_FREE && (
                <HiddenItem show={handleLoaded} isFirstLoad={isFirstLoad}>
                  <Link href={`/${PageRoot.Pricing}?from=pricing_nav`} passHref>
                    <NavItem onFocus={handleNavbarFocus} onBlur={handleNavbarBlur}>
                      Pricing
                    </NavItem>
                  </Link>
                </HiddenItem>
              )}
              {/* {!hasSubscription && !isLoadingViewer && !IS_FULL_COURSE_FREE && (
                <Link href={`/${PageRoot.Course}`} passHref>
                  <NavItem onFocus={handleNavbarFocus} onBlur={handleNavbarBlur}>
                    Try a Free Question (add url)
                  </NavItem>
                </Link>
              )} */}
              {href && !hideContinue && (
                <HiddenItem show={handleLoaded} isFirstLoad={isFirstLoad}>
                  <Link href={href} passHref>
                    <NavItem onFocus={handleNavbarFocus} onBlur={handleNavbarBlur}>
                      Continue <Login16 />
                    </NavItem>
                  </Link>
                </HiddenItem>
              )}
              <NavItem
                href="https://jobs.levelup.dev/talent/welcome?referral=true"
                target="_blank"
                rel="noopener noreferrer"
                onFocus={handleNavbarFocus}
                onBlur={handleNavbarBlur}
              >
                Find a Job
              </NavItem>
            </Section>
            <Section>
              <AuthSection
                {...props}
                show={handleLoaded}
                isLoadingViewer={isLoadingViewer}
                isFirstLoad={isFirstLoad}
                handleFocus={handleNavbarFocus}
                handleBlur={handleNavbarBlur}
              />
            </Section>
          </Content>
        </Header>
      </Headroom>
      {IS_BANNER_ACTIVE && <Banner right={props.right} sidebar={props.sidebar} />}
    </>
  );
};

export default Navbar;
