// What the Worker needs to know about a request, kept free of Cloudflare's
// APIs so it can be tested anywhere (test/routing.test.ts).

// The languages the service runs. Keep in step with scripts/runner-images.js;
// a test checks.
export const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'kotlin',
  'swift',
  'rust',
] as const;

export type Language = (typeof LANGUAGES)[number];

// The Durable Object binding for a language's containers: JAVASCRIPT, CPP...
export const bindingFor = (language: Language) => language.toUpperCase() as Uppercase<Language>;

// The container class for a language: JavascriptRunner, CppRunner...
export const classFor = (language: Language) =>
  `${language.charAt(0).toUpperCase()}${language.slice(1)}Runner`;

// POST /run/{language}
export const languageFromPath = (pathname: string): Language | null => {
  const match = /^\/run\/([a-z]+)$/.exec(pathname);
  return match && (LANGUAGES as readonly string[]).includes(match[1])
    ? (match[1] as Language)
    : null;
};

// "Bearer <secret>", compared in constant time. No secret configured refuses
// everything.
export const authorized = (header: string | null, secret: string | undefined) => {
  if (!secret || !header || !header.startsWith('Bearer ')) {
    return false;
  }

  const given = new TextEncoder().encode(header.slice('Bearer '.length));
  const expected = new TextEncoder().encode(secret);
  let difference = given.length ^ expected.length;
  for (let i = 0; i < expected.length; i++) {
    difference |= expected[i] ^ (given[i] ?? 0);
  }
  return difference === 0;
};
