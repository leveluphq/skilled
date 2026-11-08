import * as React from 'react';
import Link from 'next/link';
import AuthModal from 'components/blocks/Modal/AuthModal';
import Dropdown from 'components/blocks/Dropdown';
import { IS_FULL_COURSE_FREE } from 'utils/constants/payments';
import { PageRoot, AccountPaths } from 'utils/constants/routes';
import { getHasSubscription } from 'utils/client/lesson';
import { codingLanguageList, LanguageName } from 'utils/constants/lesson';
import { runnableLanguages } from 'utils/shared/runner/settings';
import useCodingLanguage from 'components/hooks/useCodingLanguage';
import { AffiliateStatus } from 'utils/shared/affiliate/constants';

import { AuthProps } from './props';

import {
  AuthButton,
  UpgradeButton,
  HideDesktop,
  HideMobile,
  HiddenItem,
  NavItem,
  NavDropdownText,
  DropdownWrapper,
} from './styles';

const SUBSCRIBED_ITEMS = [
  { name: 'Course', href: `/${PageRoot.Course}` },
  { name: 'Resources', href: '/learn' },
  { name: 'Settings', href: `/${PageRoot.My}/${AccountPaths.Settings}` },
  { name: 'Logout', href: `/${PageRoot.Logout}`, external: true },
];
const UNSUBSCRIBED_ITEMS = [
  { name: 'Upgrade to Full Course', href: `/${PageRoot.Pricing}` },
  { name: 'Course', href: `/${PageRoot.Course}` },
  { name: 'Resources', href: '/learn' },
  { name: 'Settings', href: `/${PageRoot.My}/${AccountPaths.Settings}` },
  { name: 'Logout', href: `/${PageRoot.Logout}`, external: true },
];

const AuthSection: React.FC<AuthProps> = ({
  data,
  handleFocus,
  handleBlur,
  isLoadingViewer,
  show,
  isFirstLoad,
}) => {
  let authSection: React.ReactNode = null;
  const { language, setLanguage } = useCodingLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const viewer = data?.users_by_pk;
  const hasSubscription = getHasSubscription(viewer);
  const isAffiliate =
    !!viewer && viewer.affiliateStatus === AffiliateStatus.Active && !!viewer.affiliateId;
  const publicDropdownItems = [
    { name: 'Sign Up / Log In', onClick: () => setIsOpen(true) },
    { name: 'Course', href: `/${PageRoot.Course}` },
    { name: 'Resources', href: '/learn' },
    !IS_FULL_COURSE_FREE ? { name: 'Pricing', href: `/${PageRoot.Pricing}` } : null,
  ].filter(Boolean) as { name: string; href?: string; onClick?: () => void }[];
  let userDropdownItems = hasSubscription ? SUBSCRIBED_ITEMS : UNSUBSCRIBED_ITEMS;

  if (isAffiliate) {
    userDropdownItems = [
      {
        name: 'Affiliate Dashboard',
        href: `/${PageRoot.My}/${AccountPaths.Affiliate}`,
      },
      ...userDropdownItems,
    ];
  }

  if (isLoadingViewer) {
    authSection = null;
  } else if (viewer) {
    authSection = (
      <DropdownWrapper>
        <Dropdown
          triggerText={<NavDropdownText>{viewer.name || 'Settings'}</NavDropdownText>}
          triggerLabel={viewer.name || 'Settings'}
          items={userDropdownItems}
          handleFocus={handleFocus}
          handleBlur={handleBlur}
        />
      </DropdownWrapper>
    );
  } else {
    authSection = (
      <>
        <AuthButton
          onClick={() => setIsOpen(true)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-haspopup={true}
          aria-expanded={isOpen}
        >
          Sign Up / Log In
        </AuthButton>
        <HideDesktop>
          <DropdownWrapper>
            <Dropdown
              triggerText="Settings"
              items={publicDropdownItems}
              handleFocus={handleFocus}
              handleBlur={handleBlur}
            />
          </DropdownWrapper>
        </HideDesktop>
      </>
    );
  }

  return (
    <>
      {!hasSubscription && !isLoadingViewer && !IS_FULL_COURSE_FREE && (
        <HiddenItem show={show} isFirstLoad={isFirstLoad}>
          <Link href={`/${PageRoot.Pricing}?from=go_pro_nav`} passHref>
            <UpgradeButton onFocus={handleFocus} onBlur={handleBlur}>
              Go Pro
            </UpgradeButton>
          </Link>
        </HiddenItem>
      )}
      <HiddenItem show={show} isFirstLoad={isFirstLoad}>
        {isAffiliate && (
          <Link href={`/${PageRoot.My}/${AccountPaths.Affiliate}`} passHref>
            <NavItem>🤑 Affiliate Dashboard</NavItem>
          </Link>
        )}
      </HiddenItem>
      <HiddenItem show={show} isFirstLoad={isFirstLoad}>
        <HideMobile>
          <DropdownWrapper>
            <Dropdown
              triggerText={<NavDropdownText>{LanguageName[language]}</NavDropdownText>}
              triggerLabel={LanguageName[language]}
              items={runnableLanguages(codingLanguageList).map((l) => ({
                name: LanguageName[l],
                onClick: () => setLanguage(l),
              }))}
              handleFocus={handleFocus}
              handleBlur={handleBlur}
            />
          </DropdownWrapper>
        </HideMobile>
      </HiddenItem>
      <HiddenItem show={show} isFirstLoad={isFirstLoad}>
        {authSection}
      </HiddenItem>
      <AuthModal onClose={() => setIsOpen(false)} isOpen={isOpen} />
    </>
  );
};

export default AuthSection;
