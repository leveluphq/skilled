import fs from 'fs';
import os from 'os';
import path from 'path';
const { imageSize, validateLessonImages } = require('../../../scripts/checkLessonImages');

it('checks the actual authored image descriptions and exact dimensions, including gated and draft explanations', () => {
  expect(validateLessonImages()).toEqual({ issues: [], images: 155, assets: 147 });
});

it('rejects missing alternatives, wrong dimensions, missing files, and escaping asset paths', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skilled-image-check-'));
  try {
    fs.mkdirSync(path.join(root, 'src/content/lessons'), { recursive: true });
    fs.mkdirSync(path.join(root, 'public/images'), { recursive: true });
    const asset = fs.readFileSync(path.join(process.cwd(), 'public/images/big-o-simple.png'));
    fs.writeFileSync(path.join(root, 'public/images/example.png'), asset);
    const [width, height] = imageSize(asset);
    const file = path.join(root, 'src/content/lessons/example.mdx');
    fs.writeFileSync(
      file,
      `<Image src="/images/example.png" alt="Curves compare growth rates" width={${width}} height={${height}} />`,
    );
    expect(validateLessonImages(root).issues).toEqual([]);
    fs.writeFileSync(
      file,
      `<Image src="/images/example.png" width={1} height={1} />\n<img src="/images/missing.png" />\n<Image src="/images/../../secret.png" />`,
    );
    const issues = validateLessonImages(root).issues.join('\n');
    expect(issues).toContain('missing explanatory alt text');
    expect(issues).toContain('dimensions differ');
    expect(issues).toContain('missing positive intrinsic');
    expect(issues).toContain('ENOENT');
    expect(issues).toContain('source must stay inside');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

it('reads GIF, PNG, and JPEG dimensions and rejects truncated data', () => {
  for (const asset of ['big-o-simple.png', 'recursion-demo.gif', 'bst-vs-not-bst.jpg']) {
    const dimensions = imageSize(fs.readFileSync(path.join(process.cwd(), 'public/images', asset)));
    expect(dimensions.every((value: number) => value > 0)).toBe(true);
  }
  expect(() => imageSize(Buffer.from('GIF89a'))).toThrow('truncated');
  expect(() => imageSize(Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0, 8]))).toThrow('truncated');
});
