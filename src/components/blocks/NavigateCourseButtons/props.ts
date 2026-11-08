import { LinkProps } from 'utils/constants/http';

export interface OwnProps {
  displayText?: boolean;
  displayTitle?: boolean;
  slug: string;
}

export interface WrapperProps extends OwnProps {
  previousLessonUrl: LinkProps;
  nextLessonUrl: LinkProps;
}

export interface ButtonProps extends OwnProps {
  href?: string;
  leftRadius?: boolean;
  rightRadius?: boolean;
}
