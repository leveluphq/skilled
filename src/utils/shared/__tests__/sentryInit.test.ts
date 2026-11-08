/**
 * utils/shared/sentry loads with every page and API route, so a malformed DSN
 * (such as a placeholder copied from an example env file) must turn Sentry off
 * rather than throw. Uses the real @sentry/node, which checks the DSN even
 * when it's disabled, as it is under test, and reports a malformed one itself.
 */
export {};

const ORIGINAL_ENV = process.env;

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

const load = (dsn: string | undefined) => {
  process.env = { ...ORIGINAL_ENV, SENTRY_DSN: dsn };
  if (dsn === undefined) delete process.env.SENTRY_DSN;

  let sentry: typeof import('utils/shared/sentry') | undefined;

  jest.isolateModules(() => {
    sentry = require('utils/shared/sentry');
  });
  return sentry!;
};

describe('Sentry setup', () => {
  it('turns Sentry off, and says so, when the DSN is malformed', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const sentry = load('https://your-sentry-dsn@sentry.io/project-id');

    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Invalid Sentry Dsn'));
    // Reporting still works as a no-op
    expect(() => sentry.default.captureException(new Error('after a bad DSN'))).not.toThrow();
    expect(() => sentry.configureReq({ url: '/api', headers: {} } as any)).not.toThrow();
  });

  it('starts quietly without a DSN, as a fresh copy has none', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    load(undefined);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('starts quietly with a well-formed DSN', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    load('https://0123456789abcdef@o123.ingest.sentry.io/4567');
    expect(consoleError).not.toHaveBeenCalled();
  });
});
