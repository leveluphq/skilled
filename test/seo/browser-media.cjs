// Read-only public media QA. Reuse an installed Playwright; no credentials or saved progress.
const { chromium } = require(process.env.BROWSER_QA_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const videos = require('../../src/content/videos/catalog.json');
const course = require('../../src/content/resources/course.json');
const base = process.env.BROWSER_QA_ORIGIN || 'http://localhost:3000';
const out = process.env.BROWSER_QA_OUTPUT || '/tmp/skilled-media-browser';

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
    await context.route('**/*', (route) =>
      new URL(route.request().url()).origin === base ? route.continue() : route.abort(),
    );
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /hydration|did not match|validateDOMNesting/i.test(message.text())
      )
        errors.push(message.text());
    });
    for (const video of videos) {
      const first = video.chapters[1];
      const finalChapter = video.chapters[video.chapters.length - 1];
      const last = finalChapter.start === first.start ? video.chapters[0] : finalChapter;
      const clean = '/watch/' + video.slug;
      const deep = clean + '?t=' + first.start;
      assert.equal((await page.goto(base + deep, { waitUntil: 'networkidle' })).status(), 200);
      const frame = page.getByTitle(video.title);
      await page.waitForFunction(
        (seconds) =>
          document.querySelector('iframe[title]')?.src.includes('start=' + seconds + '&'),
        first.start,
      );
      assert(!(await frame.getAttribute('src')).includes('autoplay=1'));
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), base + clean);
      const chapters = page.getByRole('region', { name: 'Video chapters' });
      assert.equal(await chapters.locator('a').count(), video.chapters.length);
      const link = chapters.locator(`a[href="${clean}?t=${last.start}"]`);
      assert((await link.boundingBox()).height >= 44);
      await link.click();
      await page.waitForURL(base + clean + '?t=' + last.start);
      await page.waitForFunction(
        (seconds) =>
          document.querySelector('iframe[title]')?.src.includes('start=' + seconds + '&'),
        last.start,
      );
      assert.equal(
        await page.getByRole('link', { name: 'Watch on YouTube' }).getAttribute('href'),
        `https://www.youtube.com/watch?v=${video.videoId}${last.start ? `&t=${last.start}s` : ''}`,
      );
      await page.evaluate(() => history.back());
      await page.waitForURL(base + deep, { waitUntil: 'commit' });
      await page.waitForFunction(
        (seconds) =>
          document.querySelector('iframe[title]')?.src.includes('start=' + seconds + '&'),
        first.start,
      );
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      results.push({
        path: clean,
        directStart: first.start,
        selectedStart: last.start,
        backRestores: true,
        width: 320,
      });
    }
    for (const lesson of course.lessons) {
      await page.goto(base + '/course/' + lesson.slug, { waitUntil: 'networkidle' });
      await page
        .locator('img[src^="/images/"]')
        .evaluateAll((nodes) => Promise.all(nodes.map((node) => node.decode())));
      const images = await page.locator('img[src^="/images/"]').evaluateAll((nodes) =>
        nodes.map((node) => ({
          src: node.getAttribute('src'),
          alt: node.getAttribute('alt'),
          width: node.naturalWidth,
          height: node.naturalHeight,
          renderedWidth: node.getBoundingClientRect().width,
          renderedHeight: node.getBoundingClientRect().height,
          declaredWidth: Number(node.getAttribute('width')),
          declaredHeight: Number(node.getAttribute('height')),
        })),
      );
      for (const image of images) {
        assert(image.alt && image.alt.trim(), JSON.stringify(image));
        assert(image.width > 0 && image.height > 0, JSON.stringify(image));
        assert.equal(image.declaredWidth, image.width, JSON.stringify(image));
        assert.equal(image.declaredHeight, image.height, JSON.stringify(image));
        assert(image.renderedWidth <= 320, JSON.stringify(image));
        assert(
          Math.abs(image.renderedHeight - (image.renderedWidth * image.height) / image.width) < 2,
          JSON.stringify(image),
        );
      }
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        lesson.slug,
      );
      if (images.length)
        results.push({
          path: '/course/' + lesson.slug,
          images: images.length,
          intrinsicDimensions: true,
          scaledProportionally: true,
          width: 320,
        });
    }
    await page.goto(base + '/course/arrays/python', { waitUntil: 'networkidle' });
    assert(await page.getByText(/Your saved programming-language choice stays unchanged/).count());
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/course/binary-search-trees', { waitUntil: 'networkidle' });
      const diagram = page.locator('img[src="/images/bst-nodes.png"]');
      await diagram.evaluate((node) => node.decode());
      await diagram.scrollIntoViewIfNeeded();
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      await page.screenshot({ path: path.join(out, 'tree-images-' + width + '.png') });
      await page.goto(base + '/watch/debounce?t=176', { waitUntil: 'networkidle' });
      await page
        .getByRole('heading', { name: 'Chapters', exact: true })
        .evaluate((node) => node.scrollIntoView({ block: 'start' }));
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      await page.screenshot({ path: path.join(out, 'chapters-' + width + '.png') });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    const html = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 320, height: 900 },
    });
    await html.route('**/*', (route) =>
      new URL(route.request().url()).origin === base ? route.continue() : route.abort(),
    );
    const nojs = await html.newPage();
    await nojs.goto(base + '/watch/debounce?t=176', { waitUntil: 'networkidle' });
    assert.equal(await nojs.locator('h1').count(), 1);
    assert((await nojs.locator('article').innerText()).length > 2000);
    assert.equal(
      await nojs.locator('link[rel="canonical"]').getAttribute('href'),
      base + '/watch/debounce',
    );
    assert(await nojs.locator('a[href="/watch/debounce?t=176"]').count());
    results.push({
      action: 'no-JavaScript watch document',
      readable: true,
      canonical: '/watch/debounce',
    });
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(out, 'browser.json'),
      JSON.stringify({ results, errors }, null, 2) + '\n',
    );
    console.log(
      JSON.stringify({
        watchPages: videos.length,
        lessonImagePages: results.filter((r) => r.images).length,
        images: results.reduce((sum, r) => sum + (r.images || 0), 0),
        errors,
      }),
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
