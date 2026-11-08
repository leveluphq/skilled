export {};

const { resourceLinks } = require('../../../scripts/generateResources');

it('checks actual Markdown links without interpreting C++ lambda syntax in code fences as links', () => {
  const source = [
    '[Preparation](/interview-prep/cpp)',
    '```cpp',
    '[](const Interval& interval, int key) { return interval.start < key; }',
    '[](int key, const Interval& interval) { return key < interval.start; }',
    '// [Example text](/not-an-article-link)',
    '```',
    '[Boundary practice](/patterns/binary-search#test-the-boundary-invariant)',
  ].join('\n');
  expect(resourceLinks(source)).toEqual([
    '/interview-prep/cpp',
    '/patterns/binary-search#test-the-boundary-invariant',
  ]);
});
