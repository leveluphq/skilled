// NOTE: Migrate to new method used for lesson slugs

const fs = require('fs');
const path = require('path');

const GENERATED_SLUG_FILE = 'blogSlugs.gen.ts';
const GENERATED_FILE_LOCATION = '../content/generated';
const BLOG_LOCATION = '../content/blog';

const buildFile = items => {
  return `export default [${items.map((item) => `'${item}'`).join(', ')}];\n`;
};

const generateBlogSlugs = () => {
  console.log('+++++ GENERATING BLOG SLUGS +++++');
  const slugFolder = path.join(__dirname, BLOG_LOCATION);
  const outputFile = path.join(__dirname, GENERATED_FILE_LOCATION, GENERATED_SLUG_FILE);

  const blog = fs.readdirSync(slugFolder);
  // TODO: test that slugs exist. query DB for blog and ensure there is one written.

  const file = buildFile(blog);
  console.log('-- blog', blog, file);

  fs.writeFileSync(outputFile, file);

  console.log('----- BLOG SLUGS WRITTEN -----');
};

generateBlogSlugs();
