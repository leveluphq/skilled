import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft16, Home16, ArrowRight16 } from '@carbon/icons-react';
import { PageRoot } from 'utils/constants/routes';
import { WrapperProps, ButtonProps } from './props';

import {
  Wrapper,
  Title,
  ButtonWrapper,
  ButtonSection,
  ButtonText,
  Button,
  ButtonDisabled,
  Popover,
  LessonName,
  JobButtonSection,
  FindJobButton,
} from './styles';

const ButtonOrDisabled: React.FC<ButtonProps> = ({
  href,
  displayText = false,
  leftRadius,
  rightRadius,
  children,
}) =>
  href ? (
    <Link href={href} passHref>
      <Button rounded={displayText} leftRadius={leftRadius} rightRadius={rightRadius}>
        {children}
      </Button>
    </Link>
  ) : (
    <ButtonDisabled rounded={displayText} leftRadius={leftRadius} rightRadius={rightRadius}>
      {children}
    </ButtonDisabled>
  );

const NavigateCourseButtons: React.FC<WrapperProps> = ({
  previousLessonUrl,
  nextLessonUrl,
  displayText = false,
  displayTitle = true,
  slug,
}) => {
  // NOTE: Dynamic component seems to not be handling ref correctly the first time navigating to this page from another.
  // To test, hit /course and then navigate to any lesson and hover the arrow
  // HACK: Envforcing a setState after mount seems to be fixing it.
  const [mounted, setMounted] = React.useState(false);
  const prevRef = React.useRef<HTMLDivElement>(null);
  const prevOffset = !!prevRef.current ? prevRef.current.offsetWidth / 2 : undefined;
  const nextRef = React.useRef<HTMLDivElement>(null);
  const nextOffset = !!nextRef.current ? nextRef.current.offsetWidth / 2 : undefined;

  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);
    }
  }, [mounted]);

  return (
    <Wrapper>
      {!displayText && displayTitle && <Title>Navigate Course</Title>}
      <ButtonWrapper spread={displayText}>
        <ButtonSection>
          <ButtonOrDisabled
            leftRadius
            slug={slug}
            href={previousLessonUrl.href}
            displayText={displayText}
          >
            <ArrowLeft16 />{' '}
            {displayText && !!previousLessonUrl.text && <ButtonText>Prev</ButtonText>}
            {!!previousLessonUrl.text && !displayText && (
              <Popover ref={prevRef} left={prevOffset}>
                {previousLessonUrl.text}
              </Popover>
            )}
          </ButtonOrDisabled>
          {displayText && <LessonName>{previousLessonUrl.text}</LessonName>}
        </ButtonSection>
        {!displayText && (
          <Link href={`/${PageRoot.Course}`} passHref>
            <Button rounded={false}>
              <Home16 />
            </Button>
          </Link>
        )}
        <ButtonSection right>
          <ButtonOrDisabled
            rightRadius
            slug={slug}
            href={nextLessonUrl.href}
            displayText={displayText}
          >
            {displayText && !!nextLessonUrl.text && <ButtonText>Next</ButtonText>} <ArrowRight16 />
            {!!nextLessonUrl.text && !displayText && (
              <Popover ref={nextRef} left={nextOffset}>
                {nextLessonUrl.text}
              </Popover>
            )}
          </ButtonOrDisabled>
          {displayText && <LessonName>{nextLessonUrl.text}</LessonName>}
        </ButtonSection>
      </ButtonWrapper>
      {!!displayText && (
        <JobButtonSection>
          <div style={{ color: 'gray', fontSize: '14px', marginBottom: '8px' }}>
            Ready for the next step?
          </div>
          <FindJobButton
            href="https://jobs.levelup.dev/talent/welcome?referral=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Find a Job
          </FindJobButton>
        </JobButtonSection>
      )}
    </Wrapper>
  );
};

export default NavigateCourseButtons;
