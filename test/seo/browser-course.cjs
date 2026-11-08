// Read-only course discovery/layout checks against a built public server.
const { chromium } = require(process.env.BROWSER_QA_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const course = require('../../src/content/resources/course.json');
const base = process.env.BROWSER_QA_ORIGIN || 'http://localhost:3000';
const out = process.env.BROWSER_QA_OUTPUT || '/tmp/skilled-course-browser';

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const errors = [];
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled });
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
    for (const width of [320, 375, 768, 1024, 1060, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal((await page.goto(base + '/course', { waitUntil: 'networkidle' })).status(), 200);
      for (const lesson of course.lessons)
        assert(await page.locator(`a[href="/course/${lesson.slug}"]`).count(), lesson.slug);
      for (const category of course.categories)
        assert.equal(await page.locator(`[id="${category.slug}"]`).count(), 1, category.slug);
      if (javaScriptEnabled && width < 1060) {
        const header = page.locator('header').first();
        const resources = header.getByRole('link', { name: 'Resources', exact: true });
        const trigger = header.getByRole('button', { name: 'Settings', exact: true });
        const resourceBox = await resources.boundingBox();
        const triggerBox = await trigger.boundingBox();
        assert(resourceBox.x + resourceBox.width <= triggerBox.x, 'Mobile navigation overlaps');
        await trigger.click();
        const menu = page.getByRole('menu', { name: 'User Navigation', exact: true });
        assert.equal(
          await menu.getByRole('menuitem', { name: 'Resources', exact: true }).getAttribute('href'),
          '/learn',
        );
        const menuBox = await menu.boundingBox();
        assert(menuBox.x >= -1 && menuBox.x + menuBox.width <= width + 1, 'Mobile menu clipped');
        await trigger.click();
      }
      if (javaScriptEnabled) {
        const header = page.locator('header').first();
        const bounds = await header.boundingBox();
        const controls = await header.locator('a:visible, button:visible').evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = node.getBoundingClientRect();
            return {
              label: node.getAttribute('aria-label') || node.textContent,
              x: box.x,
              right: box.right,
            };
          }),
        );
        controls.sort((a, b) => a.x - b.x);
        for (let i = 0; i < controls.length; i++) {
          assert(
            controls[i].x >= bounds.x - 1 && controls[i].right <= bounds.x + bounds.width + 1,
            `Header control outside bounds at ${width}: ${JSON.stringify(controls[i])}`,
          );
          if (i)
            assert(
              controls[i - 1].right <= controls[i].x + 1,
              `Header controls overlap at ${width}: ${JSON.stringify(
                controls.slice(i - 1, i + 1),
              )}`,
            );
        }
      }
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert(scrollWidth <= width + 1, `Course overflow at ${width}: ${scrollWidth}`);
      for (const name of ['Twitter', 'LinkedIn', 'YouTube'])
        assert.equal(
          await page.getByRole('link', { name: 'Teacher on ' + name, exact: true }).count(),
          1,
        );
      await page.screenshot({
        path: path.join(out, `course-${width}-${javaScriptEnabled ? 'js' : 'html'}.png`),
      });
      results.push({
        path: '/course',
        width,
        javaScriptEnabled,
        lessonLinks: course.lessons.length,
        categoryTargets: course.categories.length,
        overflow: false,
      });
    }
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('a[href="/course#graphs"]').first().click();
    await page.waitForURL('**/course#graphs');
    await page.waitForFunction(
      () => Math.abs(document.querySelector('#graphs').getBoundingClientRect().top) < 150,
    );
    results.push({
      action: 'homepage category navigation',
      javaScriptEnabled,
      reached: '/course#graphs',
    });
    if (javaScriptEnabled) {
      const sidebar = page.getByRole('menu', { name: 'Course', exact: true });
      await sidebar.getByRole('button', { name: 'Graphs', exact: true }).click();
      for (const lesson of course.lessons.filter((lesson) => lesson.category === 'graphs'))
        assert(await sidebar.locator(`a[href="/course/${lesson.slug}"]`).isVisible(), lesson.slug);
      await sidebar.locator('a[href$="#graphs"]').click();
      await page.waitForFunction(
        () => Math.abs(document.querySelector('#graphs').getBoundingClientRect().top) < 150,
      );
      results.push({ action: 'course sidebar category links', category: 'graphs', expanded: true });
    }
    await context.close();
  }
  await browser.close();
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    path.join(out, 'browser.json'),
    JSON.stringify({ results, errors }, null, 2) + '\n',
  );
  console.log(JSON.stringify({ checks: results.length, errors }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
