import { absoluteUrl } from './site';

/** Chapter links accept whole seconds inside the recording; malformed input starts at zero. */
export function videoStart(value: string | string[] | undefined, duration: number): number {
  if (typeof value !== 'string' || !/^\d{1,9}$/.test(value)) return 0;
  const seconds = Number(value);
  return seconds >= 0 && seconds < duration ? seconds : 0;
}

export const chapterPath = (slug: string, start: number) => `/watch/${slug}?t=${start}`;

export function videoClips(video: {
  slug: string;
  chapters: { name: string; start: number; end: number }[];
}) {
  return video.chapters.map((chapter) => ({
    '@type': 'Clip',
    name: chapter.name,
    startOffset: chapter.start,
    endOffset: chapter.end,
    url: `${absoluteUrl(`/watch/${video.slug}`)}?t=${chapter.start}`,
  }));
}
