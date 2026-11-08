function validateCoverage(catalog, course, policy) {
  const supported = require('../content/resources/catalog.json')
    .filter((entry) => entry.section === 'interview-prep')
    .map((entry) => entry.slug)
    .sort();
  const published = new Set(course.lessons.map((lesson) => lesson.slug));
  const assigned = new Set();
  const expected = new Set();
  for (const entry of policy) {
    if (!published.has(entry.lesson) || assigned.has(entry.lesson))
      throw new Error(`Invalid or duplicate language policy: ${entry.lesson}`);
    assigned.add(entry.lesson);
    if (
      !['exercise', 'implementation', 'concept', 'javascript'].includes(entry.kind) ||
      !entry.languages.length
    )
      throw new Error(`Missing lesson language policy: ${entry.lesson}`);
    const required = entry.kind === 'javascript' ? ['javascript', 'typescript'] : supported;
    if (JSON.stringify([...entry.languages].sort()) !== JSON.stringify(required))
      throw new Error(`Incomplete language policy: ${entry.lesson}`);
    for (const language of entry.languages) {
      const key = `${entry.lesson}/${language}`;
      if (expected.has(key)) throw new Error(`Duplicate required language page: ${key}`);
      expected.add(key);
    }
  }
  for (const slug of published)
    if (!assigned.has(slug)) throw new Error(`Published lesson has no language policy: ${slug}`);
  const actual = new Set();
  for (const page of catalog) {
    const key = `${page.lesson}/${page.language}`;
    const rule = policy.find((entry) => entry.lesson === page.lesson);
    if (!expected.has(key) || actual.has(key) || (page.kind || 'exercise') !== rule.kind)
      throw new Error(`Unexpected language page or kind: ${key}`);
    actual.add(key);
  }
  for (const key of expected)
    if (!actual.has(key)) throw new Error(`Missing required language page: ${key}`);
  return expected.size;
}
module.exports = { validateCoverage };
