import course from 'content/resources/course.json';
import { lessonMetadata } from '../lessonMetadata';
import { lessonStructuredData } from '../lessonStructuredData';
import { absoluteUrl, site } from '../site';
import coverage from 'content/lesson-walkthroughs/coverage.json';
import { getLessonWalkthroughs, walkthroughPath } from 'content/lesson-walkthroughs';
import { LanguageName } from 'utils/constants/lesson';

it('describes every published lesson with matching metadata, course membership, and a navigable breadcrumb', () => {
  for (const lesson of course.lessons) {
    const [resource, breadcrumbs] = lessonStructuredData(lesson.slug)!;
    const metadata = lessonMetadata({ slug: lesson.slug, title: lesson.title });
    const url = absoluteUrl(`/course/${lesson.slug}`);
    expect(resource).toMatchObject({
      '@type': ['WebPage', 'LearningResource'],
      '@id': `${url}#lesson`,
      url,
      name: metadata.title,
      description: metadata.description,
      isPartOf: { '@id': `${absoluteUrl('/course')}#course` },
      publisher: { '@id': `${site.origin}/#publisher` },
      learningResourceType: lesson.type === 'INSTRUCTIONAL' ? 'Lesson' : 'Practice question',
    });
    expect(resource.isAccessibleForFree).toBeUndefined();
    expect(resource.offers).toBeUndefined();
    expect(resource.text).toBeUndefined();
    const policy = coverage.find((entry) => entry.lesson === lesson.slug)!;
    expect((resource.about as any[]).map((item) => item.name)).toEqual(
      policy.languages.map(
        (language) => LanguageName[language.toUpperCase() as keyof typeof LanguageName],
      ),
    );
    expect((resource.hasPart as any[]).map((item) => item.url)).toEqual(
      getLessonWalkthroughs(lesson.slug).map((page) => absoluteUrl(walkthroughPath(page))),
    );
    expect(breadcrumbs.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Course', item: absoluteUrl('/course') },
      { '@type': 'ListItem', position: 2, name: lesson.title, item: url },
    ]);
  }
});

it('does not manufacture learning-resource metadata for unpublished or unknown lesson routes', () => {
  for (const slug of ['knapsack', 'system-design', 'backtracking', 'detect-a-loop', 'unknown'])
    expect(lessonStructuredData(slug)).toBeNull();
});
