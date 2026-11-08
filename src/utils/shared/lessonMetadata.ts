import metadata from 'content/resources/lesson-metadata.json';

interface LessonMetadataInput {
  slug: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  category?: { title: string };
}

export const lessonMetadata = (lesson?: LessonMetadataInput | null) => {
  const editorial = lesson
    ? (metadata as Record<string, { title: string; description: string }>)[lesson.slug]
    : undefined;
  return {
    title: editorial?.title || lesson?.metaTitle || lesson?.title || 'Course lesson',
    description:
      editorial?.description ||
      lesson?.metaDescription ||
      `Study ${
        lesson?.category?.title.toLowerCase() || 'coding interview concepts'
      } with explanations and practice.`,
  };
};
