import { resources } from 'content/resources';
import course from 'content/resources/course.json';
import walkthroughs from 'content/lesson-walkthroughs/catalog.json';

type LearningEvent =
  | 'tool_interaction'
  | 'practice_open'
  | 'code_run_requested'
  | 'rehearsal_started'
  | 'rehearsal_completed';
const allowedPaths = new Set([
  ...resources.map((item) => `/${item.section}/${item.slug}`),
  ...course.lessons.map((item) => `/course/${item.slug}`),
  ...walkthroughs.map((item) => `/course/${item.lesson}/${item.language}`),
]);

/** An optional data-layer event, never a network client. Deployments own tags and consent. */
export function learningEvent(event: LearningEvent, path: string, target?: string) {
  if (typeof window === 'undefined' || !process.env.GOOGLE_TAG_MANAGER_ID) return;
  if (!allowedPaths.has(path) || (target !== undefined && !allowedPaths.has(target))) return;
  try {
    const host = window as Window & { dataLayer?: { push: (value: unknown) => unknown } };
    if (!host.dataLayer || typeof host.dataLayer.push !== 'function') return;
    host.dataLayer.push({
      event: `learning_${event}`,
      learning_page: path,
      ...(target ? { learning_target: target } : {}),
    });
  } catch {
    /* Analytics must never interrupt learning. */
  }
}
