import * as React from 'react';
import { useRouter } from 'next/router';
import { ArrowDown16 } from '@carbon/icons-react';
import { SidebarItem, SidebarSubMenu } from 'components/blocks/Sidebar';
import LessonStatusIcon from 'components/blocks/LessonStatusIcon';
import { PageRoot } from 'utils/constants/routes';
import { Props } from './props';

import { NavigateText, ItemText } from './styles';

const CourseSidebarItems: React.FC<Props> = ({ categories, statuses, showScrollToSection }) => {
  const router = useRouter();
  const activeLessonSlug = router.query.slug;

  return (
    <>
      {categories.map(category => {
        const isActiveLessonInCategory =
          !!activeLessonSlug && !!category.lessons.find(lesson => lesson.slug === activeLessonSlug);

        return (
          <SidebarSubMenu
            title={category.title}
            key={category.id}
            isDefaultOpen={isActiveLessonInCategory}
          >
            {showScrollToSection && (
              <SidebarItem href={`#${category.slug}`}>
                <NavigateText>
                  <ArrowDown16 /> Scroll to section
                </NavigateText>
              </SidebarItem>
            )}
            {category.lessons.map(lesson => (
              <SidebarItem
                href={`/${PageRoot.Course}/${lesson.slug}`}
                key={lesson.slug}
                isHighlighted={activeLessonSlug === lesson.slug}
              >
                <ItemText>
                  <span>{lesson.title}</span> <LessonStatusIcon status={statuses[lesson.id]} />
                </ItemText>
              </SidebarItem>
            ))}
          </SidebarSubMenu>
        );
      })}
    </>
  );
};

export default CourseSidebarItems;
