// Contextual navigation QA against a production build. Blocks external requests.
const { chromium } = require(process.env.BROWSER_QA_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const readings = require('../../src/content/lesson-walkthroughs/catalog.json');
const base = process.env.BROWSER_QA_ORIGIN || 'http://localhost:3000';
const isLocalOrigin = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname);
const out = process.env.BROWSER_QA_OUTPUT || '/tmp/skilled-reading-browser';
const languageKey = '@@skilled/preferred-language';

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const errors = [];
  const monitor = (page) => {
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /hydration|did not match|validateDOMNesting|unhandled/i.test(message.text())
      )
        errors.push(message.text());
    });
  };
  const noOverflow = async (page, label) => {
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      label,
    );
  };
  const preference = async (page) => {
    assert.equal(
      await page.evaluate((key) => localStorage.getItem(key), languageKey),
      JSON.stringify('RUST'),
    );
  };
  const enterLink = async (page, link, destination) => {
    await link.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(base + destination, { waitUntil: 'networkidle' });
    assert.equal(
      await page.locator('link[rel="canonical"]').getAttribute('href'),
      base + destination,
    );
  };
  try {
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ javaScriptEnabled });
      await context.route('**/*', (route) =>
        new URL(route.request().url()).origin === base ? route.continue() : route.abort(),
      );
      // Init scripts also run in blocked third-party frames, which have opaque origins.
      await context.addInitScript(
        ({ key, origin }) => {
          if (location.origin === origin) localStorage.setItem(key, JSON.stringify('RUST'));
        },
        { key: languageKey, origin: base },
      );
      const page = await context.newPage();
      monitor(page);
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          (
            await page.goto(base + '/guides/count-islands-python', { waitUntil: 'networkidle' })
          ).status(),
          200,
        );
        const practice = page.getByRole('navigation', {
          name: 'Course lessons and language walkthroughs',
        });
        assert(await practice.locator('a[href="/course/count-islands"]').count());
        await noOverflow(page, 'Guide at ' + width);
        await enterLink(
          page,
          practice.locator('a[href="/course/count-islands/python"]'),
          '/course/count-islands/python',
        );
        const trail = page.getByRole('navigation', { name: 'Python reading sequence' });
        assert(await trail.locator('a[rel="prev"]').count());
        const previous = await trail.locator('a[rel="prev"]').getAttribute('href');
        assert(previous.endsWith('/python'));
        for (const link of await trail.locator('a').all()) {
          assert((await link.boundingBox()).height >= 44);
          assert.equal(
            await link.evaluate((node) => getComputedStyle(node).textDecorationLine),
            'none',
          );
        }
        await noOverflow(page, 'Python reading at ' + width);
        if (javaScriptEnabled) await preference(page);
        if (javaScriptEnabled)
          await trail
            .locator('..')
            .screenshot({ path: path.join(out, `reading-trail-${width}.png`) });
        await enterLink(page, trail.locator('a[rel="prev"]'), previous);
        if (javaScriptEnabled) await preference(page);

        await page.goto(base + '/watch/debounce', { waitUntil: 'networkidle' });
        const videoReadings = page.getByRole('navigation', {
          name: 'Video lesson programming-language walkthroughs',
        });
        assert.equal(await videoReadings.locator('a').count(), 2);
        await noOverflow(page, 'Watch at ' + width);
        if (javaScriptEnabled)
          await videoReadings
            .locator('..')
            .screenshot({ path: path.join(out, `video-readings-${width}.png`) });
        await enterLink(
          page,
          videoReadings.getByRole('link', { name: 'TypeScript walkthrough' }),
          '/course/debounce/typescript',
        );
        const next = page
          .getByRole('navigation', { name: 'TypeScript reading sequence' })
          .locator('a[rel="next"]');
        assert.equal(await next.getAttribute('href'), '/course/throttle/typescript');
        await enterLink(page, next, '/course/throttle/typescript');
        if (javaScriptEnabled) await preference(page);
        results.push({
          width,
          javaScriptEnabled,
          guideToReading: true,
          sameLanguageContinuation: true,
          videoToReading: true,
          keyboard: true,
          overflow: false,
        });
      }
      if (javaScriptEnabled) {
        await page.setViewportSize({ width: 320, height: 900 });
        for (const language of [...new Set(readings.map((item) => item.language))]) {
          for (const lesson of ['arrays', 'implement-an-array', 'walk-a-matrix']) {
            const destination = `/course/${lesson}/${language}`;
            await page.goto(base + destination, { waitUntil: 'networkidle' });
            const trail = page.locator('nav[aria-label$=" reading sequence"]');
            assert.equal(await trail.count(), 1, destination);
            for (const link of await trail.locator('a').all()) {
              assert((await link.getAttribute('href')).endsWith('/' + language), destination);
              assert((await link.boundingBox()).height >= 44, destination);
            }
            await preference(page);
            await noOverflow(page, destination);
            results.push({
              path: destination,
              width: 320,
              languagePreserved: true,
              overflow: false,
            });
          }
        }
        // Artificial API failures belong only in a local browser review.
        for (const lesson of isLocalOrigin ? ['arrays', 'target-two-sum'] : []) {
          await page.route('**/api/v1/lessons/*/solutionVideoUrl', (route) =>
            route.fulfill({
              status: 503,
              contentType: 'application/json',
              body: '{"error":"Video service unavailable"}',
            }),
          );
          await page.goto(base + '/course/' + lesson, { waitUntil: 'networkidle' });
          if (lesson === 'target-two-sum')
            await page.getByRole('button', { name: 'Solution Video', exact: true }).click();
          const fallback = page
            .getByRole('link', { name: 'Watch the free lesson video', exact: true })
            .filter({ visible: true });
          await fallback.first().waitFor({ state: 'visible' });
          assert.equal(await fallback.first().getAttribute('href'), '/watch/' + lesson);
          const duplicateIds = await page.evaluate(() => {
            const ids = Array.from(document.querySelectorAll('[id]'), (node) => node.id);
            return ids.filter((id, index) => ids.indexOf(id) !== index);
          });
          assert.deepEqual(duplicateIds, []);
          if (lesson === 'target-two-sum') {
            const question = page.getByRole('button', { name: 'Question Breakdown', exact: true });
            assert((await question.boundingBox()).height >= 44);
            await question.click();
            assert.equal(await question.getAttribute('aria-pressed'), 'true');
            await noOverflow(page, 'Mobile exercise tabs');
            await page.getByRole('button', { name: 'Solution Video', exact: true }).click();
            await page.screenshot({ path: path.join(out, 'course-video-fallback-mobile.png') });
          }
          let destination = '/watch/' + lesson;
          if (lesson === 'target-two-sum') {
            const chapter = page.locator(`a[href^="/watch/${lesson}?t="]:visible`).last();
            destination = await chapter.getAttribute('href');
            await chapter.click();
          } else await fallback.first().click();
          await page.waitForURL(base + destination, { waitUntil: 'networkidle' });
          await preference(page);
          results.push({
            path: '/course/' + lesson,
            videoApiStatus: 503,
            publicWatchFallback: true,
            chapterFallback: lesson === 'target-two-sum',
            uniqueIds: true,
          });
        }
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      path.join(out, 'report.json'),
      JSON.stringify({ results, errors, apiFailureChecks: isLocalOrigin ? 2 : 0 }, null, 2) + '\n',
    );
    process.stdout.write(
      JSON.stringify({ checks: results.length, errors: errors.length, out }) + '\n',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  process.stderr.write(String(error.stack || error) + '\n');
  process.exitCode = 1;
});
