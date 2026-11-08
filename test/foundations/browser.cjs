// Read-only browser QA against a production build. Supply an existing Playwright installation.
const { chromium } = require(process.env.BROWSER_QA_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const manifest = require('../../src/content/lesson-walkthroughs/foundations/manifest.json');
const base = process.env.BROWSER_QA_ORIGIN || 'http://localhost:3000';
const out = process.env.BROWSER_QA_OUTPUT || '/tmp/skilled-foundations-browser';
const routes = manifest.flatMap((entry) =>
  entry.languages.map((language) => ({
    path: `/course/${entry.lesson}/${language}`,
    lesson: entry.lesson,
    language,
    count: entry.languages.length,
  })),
);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const results = [];
  const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
  await context.route('**/*', (route) =>
    route.request().url().startsWith(base) ? route.continue() : route.abort(),
  );
  await context.addInitScript(() =>
    localStorage.setItem('@@skilled/preferred-language', JSON.stringify('JAVA')),
  );
  async function inspect(page, entry, width) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(base + entry.path, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, entry.path);
    assert.equal(await page.locator('h1').count(), 1, entry.path);
    const sizes = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert(sizes.scroll <= width + 1, entry.path + ' ' + JSON.stringify(sizes));
    assert.equal(
      await page
        .getByRole('navigation', { name: 'Walkthrough programming language', exact: true })
        .locator('a')
        .count(),
      entry.count,
      entry.path,
    );
    assert((await page.locator('article pre').innerText()).length > 50, entry.path + ' code');
    assert((await page.locator('article').innerText()).length > 2500, entry.path + ' body');
    const action = page.getByRole('link', { name: 'Open the course lesson', exact: true }).first();
    assert.equal(await action.getAttribute('href'), '/course/' + entry.lesson);
    assert.equal(await action.evaluate((el) => getComputedStyle(el).textDecorationLine), 'none');
    assert((await action.boundingBox()).height >= 44);
    assert.equal(
      await page.evaluate(() => localStorage.getItem('@@skilled/preferred-language')),
      JSON.stringify('JAVA'),
    );
    for (const href of await page
      .getByRole('navigation', { name: 'On this page', exact: true })
      .locator('a')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))))
      assert.equal(await page.locator(href).count(), 1, entry.path + ' ' + href);
    results.push({ path: entry.path, width, languageOptions: entry.count, overflow: false });
  }
  const pages = await Promise.all([context.newPage(), context.newPage(), context.newPage()]);
  for (const page of pages) {
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /hydration|did not match|validateDOMNesting|unhandled/i.test(message.text())
      )
        errors.push(message.text());
    });
  }
  let cursor = 0;
  await Promise.all(
    pages.map(async (page) => {
      while (cursor < routes.length) {
        const entry = routes[cursor++];
        await inspect(page, entry, 320);
      }
    }),
  );
  const samples = manifest.map((entry, index) =>
    routes.find(
      (route) =>
        route.lesson === entry.lesson &&
        route.language === entry.languages[index % entry.languages.length],
    ),
  );
  for (const entry of samples) await inspect(pages[0], entry, 1440);
  for (const entry of [
    routes.find((e) => e.lesson === 'implement-a-linked-list' && e.language === 'rust'),
    routes.find((e) => e.lesson === 'debounce' && e.language === 'typescript'),
  ]) {
    await inspect(pages[0], entry, 375);
    await pages[0].screenshot({
      path: path.join(out, entry.lesson + '-mobile.png'),
      fullPage: true,
    });
  }
  for (const width of [320, 768, 1440])
    for (const slug of ['python', 'typescript']) {
      const page = pages[0];
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/interview-prep/' + slug, { waitUntil: 'networkidle' });
      const expected = slug === 'typescript' ? 66 : 58;
      assert.equal(
        await page.locator('#lesson-walkthroughs a[href^="/course/"]').count(),
        expected,
      );
      assert.equal(
        await page.getByRole('navigation', { name: 'Walkthrough categories' }).locator('a').count(),
        slug === 'typescript' ? 4 : 3,
      );
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
  await pages[0].setViewportSize({ width: 375, height: 900 });
  await pages[0].goto(base + '/interview-prep', { waitUntil: 'networkidle' });
  assert.equal(
    await pages[0].getByRole('link', { name: /Browse all \d+ lessons in this language/ }).count(),
    10,
  );
  await pages[0].screenshot({ path: path.join(out, 'language-index-mobile.png'), fullPage: true });
  await pages[0].goto(base + '/course/arrays/python', { waitUntil: 'networkidle' });
  const sibling = pages[0]
    .getByRole('navigation', { name: 'Walkthrough programming language', exact: true })
    .getByRole('link', { name: 'Rust', exact: true });
  await sibling.focus();
  assert(await sibling.evaluate((el) => el === document.activeElement));
  await pages[0].keyboard.press('Enter');
  await pages[0].waitForURL(base + '/course/arrays/rust');
  assert.equal(
    await pages[0].evaluate(() => localStorage.getItem('@@skilled/preferred-language')),
    JSON.stringify('JAVA'),
  );
  await pages[0].getByRole('link', { name: 'Open the course lesson', exact: true }).first().click();
  await pages[0].waitForURL(base + '/course/arrays');
  assert.equal(
    await pages[0].evaluate(() => localStorage.getItem('@@skilled/preferred-language')),
    JSON.stringify('JAVA'),
  );
  assert.equal(
    await pages[0]
      .getByRole('navigation', { name: 'Language walkthroughs', exact: true })
      .locator('a')
      .count(),
    10,
  );
  await pages[0].goto(base + '/course/javascript-interview-questions', {
    waitUntil: 'networkidle',
  });
  assert.equal(
    await pages[0]
      .getByRole('navigation', { name: 'Language walkthroughs', exact: true })
      .locator('a')
      .count(),
    2,
  );
  const nojs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  await nojs.route('**/*', (route) =>
    route.request().url().startsWith(base) ? route.continue() : route.abort(),
  );
  const read = await nojs.newPage();
  for (const entry of samples) {
    const response = await read.goto(base + entry.path, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    assert((await read.locator('article').innerText()).length > 2500);
    assert((await read.locator('article pre').innerText()).length > 50);
    assert(await read.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
  await nojs.close();
  await context.close();
  await browser.close();
  assert.deepEqual(errors, []);
  const report = {
    mobileReadingPages: routes.length,
    desktopReadingPages: samples.length,
    additionalPhoneLayouts: 2,
    languageLibraryLayouts: 6,
    noJavaScriptReadingPages: samples.length,
    keyboard: 'Enter follows a sibling anchor; passive reading preserves preference',
    courseHandoff: 'Original article URL; preference preserved; complete sibling links',
    errors,
    results,
  };
  fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...report, results: undefined }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
