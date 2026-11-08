const fs = require('fs');
const path = require('path');

/** Read intrinsic raster dimensions without a production image-processing dependency. */
function imageSize(data) {
  if (data.length >= 24 && data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')))
    return [data.readUInt32BE(16), data.readUInt32BE(20)];
  if (data.length >= 10 && /^GIF8[79]a$/.test(data.toString('ascii', 0, 6)))
    return [data.readUInt16LE(6), data.readUInt16LE(8)];
  if (data.length >= 4 && data.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset + 3 < data.length) {
      if (data[offset++] !== 0xff) break;
      while (data[offset] === 0xff) offset++;
      const marker = data[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > data.length) break;
      const length = data.readUInt16BE(offset);
      if (length < 2 || offset + length > data.length) break;
      if (
        [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(
          marker,
        ) &&
        length >= 7
      )
        return [data.readUInt16BE(offset + 5), data.readUInt16BE(offset + 3)];
      offset += length;
    }
  }
  throw new Error('Unsupported or truncated PNG, GIF, or JPEG');
}

function validateLessonImages(root = path.resolve(__dirname, '../..')) {
  const issues = [];
  let images = 0;
  const assets = new Set();
  const directory = path.join(root, 'src/content/lessons');
  function visit(folder) {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        visit(file);
        continue;
      }
      if (!entry.name.endsWith('.mdx')) continue;
      const source = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
      for (const tag of source.matchAll(/<(?:Image|img)\b([^>]*?)\/>/g)) {
        images++;
        const label = `${path.relative(root, file)} image ${images}`;
        const src = tag[1].match(/\bsrc=(?:"([^"]+)"|\{"([^"]+)"\})/);
        const alt = tag[1].match(/\balt="([^"]*)"/);
        const width = tag[1].match(/\bwidth=\{(\d+)\}/);
        const height = tag[1].match(/\bheight=\{(\d+)\}/);
        if (!src) {
          issues.push(`${label}: use a static local image source`);
          continue;
        }
        const relative = src[1] || src[2];
        if (!alt || !alt[1].trim()) issues.push(`${label}: missing explanatory alt text`);
        if (!width || !height || Number(width[1]) <= 0 || Number(height[1]) <= 0)
          issues.push(`${label}: missing positive intrinsic width/height`);
        const asset = path.resolve(root, 'public', relative.replace(/^\//, ''));
        if (
          !relative.startsWith('/images/') ||
          !asset.startsWith(path.join(root, 'public') + path.sep)
        ) {
          issues.push(`${label}: source must stay inside public/images`);
          continue;
        }
        try {
          const size = imageSize(fs.readFileSync(asset));
          assets.add(relative);
          if (width && height && (Number(width[1]) !== size[0] || Number(height[1]) !== size[1]))
            issues.push(`${label}: dimensions differ from ${relative} (${size.join('x')})`);
        } catch (error) {
          issues.push(`${label}: ${error.message}`);
        }
      }
    }
  }
  visit(directory);
  return { issues, images, assets: assets.size };
}

module.exports = { imageSize, validateLessonImages };
