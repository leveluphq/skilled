import { GetCategoryLessonsQuery } from 'types/generated/client';
import { Statuses } from 'utils/constants/lesson';

export interface OwnProps {
  showScrollToSection?: boolean;
}

export interface Props extends OwnProps {
  categories: GetCategoryLessonsQuery['categories'];
  statuses: Statuses;
}
