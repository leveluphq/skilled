import course from './course.json';
import type { GetCategoryLessonsQuery } from 'types/generated/client';

/** The build's published curriculum, without viewer status or a network dependency. */
export const publicCourse: GetCategoryLessonsQuery = {
  categories: [...course.categories]
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      ...category,
      lessons: course.lessons
        .filter((lesson) => lesson.category === category.slug)
        .sort((a, b) => a.position - b.position),
    })),
};
