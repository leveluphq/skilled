const NOW = new Date().toISOString().split('T')[0];

const sitemapGenerator = {
  now: NOW,
  firstLine: '<?xml version="1.0" encoding="UTF-8"?>',
  indexDefinition: {
    openTag: '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    closeTag: '</sitemapindex>',
  },
  indexEntry: {
    openTag: '<sitemap>',
    closeTag: '</sitemap>',
  },
  sitemapDefinition: {
    openTag:
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    closeTag: '</urlset>',
  },
  url: {
    openTag: '<url>',
    closeTag: '</url>',
  },
  loc: {
    openTag: '<loc>',
    closeTag: '</loc>',
  },
  lastmod: {
    openTag: '<lastmod>',
    closeTag: '</lastmod>',
  },
  changefreq: {
    openTag: '<changefreq>',
    closeTag: '</changefreq>',
  },
  imageDef: {
    openTag: '<image:image>',
    closeTag: '</image:image>',
  },
  imageLocation: {
    openTag: '<image:loc>',
    closeTag: '</image:loc>',
  },
  imageCaption: {
    openTag: '<image:caption>',
    closeTag: '</image:caption>',
  },
  priority: {
    openTag: '<priority>',
    closeTag: '</priority>',
  },
  weekly: 'weekly',
  generateIndexEntry: (sitemapName) => {
    return `${sitemapGenerator.indexEntry.openTag}
        ${sitemapGenerator.loc.openTag}
          ${sitemapName}
        ${sitemapGenerator.loc.closeTag}
        ${sitemapGenerator.lastmod.openTag}
          ${sitemapGenerator.now}
        ${sitemapGenerator.lastmod.closeTag}
      ${sitemapGenerator.indexEntry.closeTag}`;
  },
  generateSitemapEntry: ({ url, imageDef = {}, priority }) => {
    let sitemapEntry = `${sitemapGenerator.url.openTag}
        ${sitemapGenerator.loc.openTag}
          ${url}
        ${sitemapGenerator.loc.closeTag}
        ${sitemapGenerator.lastmod.openTag}
          ${sitemapGenerator.now}
        ${sitemapGenerator.lastmod.closeTag}
        ${sitemapGenerator.priority.openTag}
          ${priority}
        ${sitemapGenerator.priority.closeTag}
        ${sitemapGenerator.changefreq.openTag}
          ${sitemapGenerator.weekly}
        ${sitemapGenerator.changefreq.closeTag}`;

    if (Object.keys(imageDef) > 0) {
      sitemapEntry = `${sitemapEntry}
        ${sitemapGenerator.imageDef.openTag}
          ${sitemapGenerator.imageLocation.openTag}
            ${imageDef.url}
          ${sitemapGenerator.imageLocation.closeTag}
          ${sitemapGenerator.imageCaption.openTag}
            ${imageDef.caption}
          ${sitemapGenerator.imageCaption.closeTag}
        ${sitemapGenerator.imageDef.closeTag}`;
    }

    sitemapEntry = `${sitemapEntry}
      ${sitemapGenerator.url.closeTag}`;

    return sitemapEntry;
  },
};

module.exports = sitemapGenerator;
