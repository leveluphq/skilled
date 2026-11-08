export {};

it('uses the configured publisher and origin rather than inheriting the official host', () => {
  const previous = {
    ROOT_URL: process.env.ROOT_URL,
    SITE_NAME: process.env.SITE_NAME,
    SITE_DESCRIPTION: process.env.SITE_DESCRIPTION,
  };
  try {
    process.env.ROOT_URL = 'https://academy.example';
    process.env.SITE_NAME = 'Example Academy';
    process.env.SITE_DESCRIPTION = 'An independently hosted curriculum.';
    jest.isolateModules(() => {
      const { buildManifest } = require('../siteManifest');
      const manifest = buildManifest();
      expect(manifest.name).toBe('Example Academy');
      expect(manifest.description).toBe('An independently hosted curriculum.');
      expect(manifest.start_url).toBe('/');
      expect(manifest.icons).toHaveLength(6);
      for (const icon of manifest.icons)
        expect(new URL(icon.src).origin).toBe('https://academy.example');
    });
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
