const fs = require('fs');
const path = require('path');
const videos = require('../content/videos/catalog.json');
const { contentInfo, resourceLinks } = require('./generateResources');

function validateVideoInventory(videos, course, seed) {
  const published = new Set(course.lessons.map((lesson) => lesson.slug));
  const slugs = new Set(videos.map((video) => video.slug));
  if (slugs.size !== videos.length) throw new Error('Duplicate public video lesson');
  for (const video of videos)
    if (!published.has(video.slug)) throw new Error(`Unpublished video lesson: ${video.slug}`);
  if (!seed) return;
  const recordings = seed.lessons.filter(
    (lesson) => lesson.status === 'ACTIVE' && lesson.solutionVideoUrl,
  );
  for (const lesson of recordings) {
    const video = videos.find((entry) => entry.slug === lesson.slug);
    if (!video) throw new Error(`Missing published recording: ${lesson.slug}`);
    const source = new URL(lesson.solutionVideoUrl);
    const id = source.hostname === 'youtu.be' ? source.pathname.slice(1) : source.searchParams.get('v');
    if (id !== video.videoId) throw new Error(`Recording source differs: ${lesson.slug}`);
  }
  for (const video of videos)
    if (!recordings.some((lesson) => lesson.slug === video.slug))
      throw new Error(`Video has no active recording: ${video.slug}`);
}

function validateVideos() {
  const { publicPaths } = require('../utils/server/discovery');
  const routes = new Set(publicPaths().map((entry) => entry.path));
  const root = path.resolve(__dirname, '../..');
  const seedFile = path.join(root, 'hasura/seeds/course.json');
  const seed = fs.existsSync(seedFile) ? JSON.parse(fs.readFileSync(seedFile, 'utf8')) : null;
  validateVideoInventory(videos, require('../content/resources/course.json'), seed);
  const seen = new Set();
  for (const video of videos) {
    if (
      seen.has(video.slug) ||
      !/^[a-z0-9-]+$/.test(video.slug) ||
      !/^[\w-]{11}$/.test(video.videoId)
    )
      throw new Error(`Invalid video identity: ${video.slug}`);
    seen.add(video.slug);
    if (
      !video.title ||
      !video.description ||
      !Number.isInteger(video.durationSeconds) ||
      video.durationSeconds < 1 ||
      !/^\d{4}-\d{2}-\d{2}T/.test(video.uploadDate) ||
      !Number.isFinite(Date.parse(video.uploadDate)) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(video.verified)
    )
      throw new Error(`Incomplete verified video metadata: ${video.slug}`);
    const source = fs.readFileSync(
      path.join(root, 'src/content/videos', `${video.slug}.mdx`),
      'utf8',
    );
    const info = contentInfo(source);
    if (
      info.words < 300 ||
      info.headings.length < 3 ||
      /^# /m.test(source.replace(/```[\s\S]*?```/g, ''))
    )
      throw new Error(`Review video lesson notes: ${video.slug}`);
    if (!fs.existsSync(path.join(root, 'public/images/videos', `${video.slug}.jpg`)))
      throw new Error(`Missing video thumbnail: ${video.slug}`);
    let previousEnd = 0;
    for (const chapter of video.chapters) {
      if (
        !chapter.name ||
        !Number.isInteger(chapter.start) ||
        !Number.isInteger(chapter.end) ||
        chapter.start < previousEnd ||
        chapter.end <= chapter.start ||
        chapter.end > video.durationSeconds
      )
        throw new Error(`Invalid video chapter: ${video.slug}`);
      previousEnd = chapter.end;
    }
    if (!video.chapters.length || video.chapters[0].start !== 0)
      throw new Error(`Missing opening chapter: ${video.slug}`);
    for (const href of resourceLinks(source))
      if (href.startsWith('/') && !routes.has(href.split(/[?#]/)[0]))
        throw new Error(`Broken video reading link: ${href}`);
  }
  return videos;
}
module.exports = { validateVideos, validateVideoInventory };
if (require.main === module)
  console.log(`Checked ${validateVideos().length} public videos and reading companions.`);
