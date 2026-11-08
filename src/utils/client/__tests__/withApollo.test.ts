/**
 * `withApollo`'s `getInitialProps` runs on the server with the user's full `Cookie`
 * header in hand, and everything it returns is serialized into `__NEXT_DATA__` where
 * any script on the page can read it. The load-bearing property tested here is that
 * the httpOnly session JWT never survives that round trip while the non-httpOnly
 * viewer cookie still does (otherwise the app renders logged-out on first paint).
 *
 * Node environment (the "server" jest project) because that is the branch under test.
 */
import { NextPageContext, NextPage } from 'next';
import * as cookieLib from 'cookie';

const JWT_TOKEN_NAME = 'skilled-test-jwt';
const ORIGINAL_JWT_TOKEN_NAME = process.env.JWT_TOKEN_NAME;

process.env.JWT_TOKEN_NAME = JWT_TOKEN_NAME;

const mockGetDataFromTree = jest.fn();
const mockCacheExtract = jest.fn();
const mockInitApollo = jest.fn();

// Nothing may dial out: the SSR render pass and the Apollo client are both stubbed.
jest.mock('@apollo/react-ssr', () => ({
  __esModule: true,
  getDataFromTree: (...args: any[]) => mockGetDataFromTree(...args),
}));

jest.mock('../initApollo', () => ({
  __esModule: true,
  default: (...args: any[]) => mockInitApollo(...args),
}));

// The provider tree is only used by the rendered component, never by getInitialProps.
// Stubbing it keeps this suite from importing Sentry/axios and from breaking when an
// unrelated provider changes.
jest.mock('components/context/ThemeProvider', () => ({ __esModule: true, default: () => null }));
jest.mock('components/context/ViewerContext', () => ({
  __esModule: true,
  default: { Provider: () => null },
}));
jest.mock('components/context/CodingLanguage/CodingLanguageProvider', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('components/context/AppState/AppStateProvider', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('components/blocks/AffiliateTracker', () => ({ __esModule: true, default: () => null }));

import withApollo from 'utils/client/withApollo';
// Deliberately NOT mocked: the sanitized `cookie` prop is fed straight back into
// `getViewerFromCookie` by the rendered component, so the two have to agree.
import { getViewerFromCookie } from 'utils/client/auth';

const JWT_VALUE = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.s3cr3t-s1gnatur3';
const VIEWER_VALUE = JSON.stringify({ id: 'user-123', exp: Math.floor(Date.now() / 1000) + 3600 });
const SESSION_ID = 'sid-abcdef';

const FULL_COOKIE = [
  cookieLib.serialize(JWT_TOKEN_NAME, JWT_VALUE),
  cookieLib.serialize(`${JWT_TOKEN_NAME}-viewer`, VIEWER_VALUE),
  cookieLib.serialize('videoWidth', '62'),
  cookieLib.serialize('oauth_session', SESSION_ID),
].join('; ');

interface Ctx {
  ctx: NextPageContext & { apolloClient?: any };
  appTree: jest.Mock;
  res: { finished: boolean };
}

const makeCtx = (cookie: string | null = FULL_COOKIE): Ctx => {
  const appTree = jest.fn(() => null);
  const res = { finished: false };

  return {
    appTree,
    res,
    ctx: {
      AppTree: appTree as any,
      req: { headers: cookie === null ? {} : { cookie } } as any,
      res: res as any,
      pathname: '/lessons',
      query: {},
      asPath: '/lessons',
    } as unknown as NextPageContext,
  };
};

const makePage = (getInitialProps?: NextPage['getInitialProps']): NextPage<any, any> => {
  const Page: any = () => null;
  Page.displayName = 'TestPage';
  if (getInitialProps) {
    Page.getInitialProps = getInitialProps;
  }
  return Page;
};

const getInitialPropsOf = (Component: React.FC<any>) =>
  (Component as any).getInitialProps as (ctx: any) => Promise<any>;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_TOKEN_NAME = JWT_TOKEN_NAME;
  mockGetDataFromTree.mockResolvedValue(undefined);
  mockCacheExtract.mockReturnValue({ ROOT_QUERY: { __typename: 'Query' } });
  mockInitApollo.mockImplementation(() => ({ cache: { extract: mockCacheExtract } }));
});

afterAll(() => {
  if (ORIGINAL_JWT_TOKEN_NAME === undefined) {
    delete process.env.JWT_TOKEN_NAME;
  } else {
    process.env.JWT_TOKEN_NAME = ORIGINAL_JWT_TOKEN_NAME;
  }
});

describe('withApollo getInitialProps - cookie sanitization', () => {
  it('never serializes the session JWT or any other httpOnly cookie into props', async () => {
    const props = await getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx);

    const serialized = JSON.stringify(props);
    expect(serialized).not.toContain(JWT_VALUE);
    expect(serialized).not.toContain(SESSION_ID);
    expect(serialized).not.toContain('oauth_session');
    // The live client is request-scoped and not serializable - it belongs on `ctx`,
    // never in the props Next writes into __NEXT_DATA__.
    expect('apolloClient' in props).toBe(false);
  });

  it('returns an empty header set for initApolloOptions rather than the forwarded Cookie header', async () => {
    const props = await getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx);

    expect(props.initApolloOptions).toEqual({ headers: {} });
    expect(props.initApolloOptions.headers.cookie).toBeUndefined();
  });

  it('still forwards the client-readable viewer and videoWidth cookies', async () => {
    const props = await getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx);

    const parsed = cookieLib.parse(props.cookie);
    expect(parsed[`${JWT_TOKEN_NAME}-viewer`]).toBe(VIEWER_VALUE);
    expect(parsed.videoWidth).toBe('62');
    expect(parsed[JWT_TOKEN_NAME]).toBeUndefined();
    expect(Object.keys(parsed)).toHaveLength(2);
  });

  it('leaves the sanitized cookie still readable as a logged-in viewer', async () => {
    // The other half of the sanitization contract: an over-eager filter that dropped
    // or mangled the viewer cookie would keep the JWT out of __NEXT_DATA__ and pass
    // every assertion above, while silently rendering every page logged-out on first
    // paint (and flashing the signed-out navbar until hydration).
    const props = await getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx);

    expect(getViewerFromCookie(props.cookie)).toEqual({ id: 'user-123' });
  });

  it('drops the cookie prop entirely when the request carries only httpOnly cookies', async () => {
    const onlyHttpOnly = [
      cookieLib.serialize(JWT_TOKEN_NAME, JWT_VALUE),
      cookieLib.serialize('oauth_session', SESSION_ID),
    ].join('; ');

    const props = await getInitialPropsOf(withApollo(makePage()))(makeCtx(onlyHttpOnly).ctx);

    expect(props.cookie).toBe('');
    expect(getViewerFromCookie(props.cookie)).toEqual({ id: '' });
    // ...but the server-side client still gets the real header for Hasura.
    expect(mockInitApollo).toHaveBeenCalledWith(undefined, { headers: { cookie: onlyHttpOnly } });
  });

  it('forwards the full Cookie header to the server-side Apollo client so Hasura auth still works', async () => {
    await getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx);

    expect(mockInitApollo).toHaveBeenCalledTimes(1);
    expect(mockInitApollo).toHaveBeenCalledWith(undefined, { headers: { cookie: FULL_COOKIE } });
  });

  it('leaves the headers empty and the cookie prop blank when the request has no cookies', async () => {
    const props = await getInitialPropsOf(withApollo(makePage()))(makeCtx(null).ctx);

    expect(mockInitApollo).toHaveBeenCalledWith(undefined, { headers: {} });
    expect(props.cookie).toBe('');
    expect(props.initApolloOptions).toEqual({ headers: {} });
  });

  it('sanitization wins over anything the wrapped page returns from its own getInitialProps', async () => {
    // The page's props are spread first on purpose; if that order is ever flipped a
    // page could re-introduce the raw header into __NEXT_DATA__.
    const Page = makePage(async () => ({
      cookie: FULL_COOKIE,
      initApolloOptions: { headers: { cookie: FULL_COOKIE } },
      lessonSlug: 'two-sum',
    }));

    const props = await getInitialPropsOf(withApollo(Page))(makeCtx().ctx);

    expect(props.lessonSlug).toBe('two-sum');
    expect(props.cookie).not.toContain(JWT_VALUE);
    expect(props.initApolloOptions).toEqual({ headers: {} });
  });

  it('hands the SSR render tree the filtered cookie, not the raw header', async () => {
    await getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx);

    expect(mockGetDataFromTree).toHaveBeenCalledTimes(1);
    const { pageProps } = mockGetDataFromTree.mock.calls[0][0].props;

    expect(pageProps.cookie).not.toContain(JWT_VALUE);
    expect(cookieLib.parse(pageProps.cookie)[`${JWT_TOKEN_NAME}-viewer`]).toBe(VIEWER_VALUE);
    // NOTE: the same mutated `initApolloOptions` object (which still holds the raw
    // Cookie header) is handed to the SSR tree. That is fine today because AppTree's
    // props are only used for the data-fetching pass and are never serialized - the
    // serialized copy is the fresh object in the return value.
    expect(pageProps.initApolloOptions.headers.cookie).toBe(FULL_COOKIE);
  });
});

describe('withApollo getInitialProps - wiring', () => {
  it('exposes the request-scoped apollo client on ctx before calling the page', async () => {
    const seen: any[] = [];
    const Page = makePage(async (ctx: any) => {
      seen.push(ctx.apolloClient);
      return { ok: true };
    });
    const { ctx } = makeCtx();

    const props = await getInitialPropsOf(withApollo(Page))(ctx);

    expect(seen).toHaveLength(1);
    expect(seen[0]).toBe(ctx.apolloClient);
    expect(seen[0]).toBeDefined();
    expect(props.ok).toBe(true);
  });

  it('returns the extracted apollo cache so the client can rehydrate', async () => {
    mockCacheExtract.mockReturnValue({ 'lesson:1': { __typename: 'lessons', id: '1' } });

    const props = await getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx);

    expect(props.apolloState).toEqual({ 'lesson:1': { __typename: 'lessons', id: '1' } });
  });

  it('stops before the SSR render when the response is already finished (redirect)', async () => {
    const Page = makePage(async () => ({ redirected: true }));
    const { ctx, res } = makeCtx();
    res.finished = true;

    const props = await getInitialPropsOf(withApollo(Page))(ctx);

    expect(mockGetDataFromTree).not.toHaveBeenCalled();
    expect(props).toEqual({ redirected: true });
    expect('cookie' in props).toBe(false);
    expect('apolloState' in props).toBe(false);
  });
});

describe('withApollo getInitialProps - SSR error handling', () => {
  it('rethrows a 404 (ENOENT) so Next can render the not-found page', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const notFound = Object.assign(new Error('Not found'), { code: 'ENOENT' });
    mockGetDataFromTree.mockRejectedValue(notFound);

    try {
      await expect(getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx)).rejects.toBe(notFound);
    } finally {
      consoleError.mockRestore();
    }
  });

  it('swallows an unrelated SSR error and still returns sanitized props', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockGetDataFromTree.mockRejectedValue(new Error('GraphQL exploded'));

    try {
      const props = await getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx);

      expect(props.initApolloOptions).toEqual({ headers: {} });
      expect(JSON.stringify(props)).not.toContain(JWT_VALUE);
      expect(consoleError).toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it.each([
    ['a thrown string', 'boom'],
    ['a thrown null', null],
    ['an error object with a different code', Object.assign(new Error('x'), { code: 'EPIPE' })],
  ])('does not crash on %s from getDataFromTree', async (_label, thrown) => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockGetDataFromTree.mockRejectedValue(thrown);

    try {
      // `'code' in error` would throw a TypeError on a primitive without the
      // `typeof error === 'object'` guard.
      await expect(getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx)).resolves.toMatchObject({
        initApolloOptions: { headers: {} },
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('withApollo getInitialProps - opt-out behaviour', () => {
  it('does not attach getInitialProps at all for a static page (ssr: false, no page getInitialProps)', () => {
    // Attaching it would opt the page out of Next's automatic static optimization.
    const Wrapped = withApollo(makePage(), { ssr: false });

    expect((Wrapped as any).getInitialProps).toBeUndefined();
  });

  it('attaches getInitialProps but skips the SSR data pass when ssr is false', async () => {
    const Page = makePage(async () => ({ fromPage: 1 }));
    const Wrapped = withApollo(Page, { ssr: false });

    const props = await getInitialPropsOf(Wrapped)(makeCtx().ctx);

    expect(mockGetDataFromTree).not.toHaveBeenCalled();
    expect(props.fromPage).toBe(1);
    expect(props.initApolloOptions).toEqual({ headers: {} });
    expect(props.cookie).not.toContain(JWT_VALUE);
  });

  it('skips the SSR data pass on client-side navigation but still sanitizes the cookie', async () => {
    // Simulate the browser: `typeof window === 'undefined'` is what gates the SSR block.
    (global as any).window = {};
    (global as any).document = { cookie: '' };

    try {
      const props = await getInitialPropsOf(withApollo(makePage()))(makeCtx().ctx);

      expect(mockGetDataFromTree).not.toHaveBeenCalled();
      expect(props.initApolloOptions).toEqual({ headers: {} });
      expect(JSON.stringify(props)).not.toContain(JWT_VALUE);
    } finally {
      delete (global as any).window;
      delete (global as any).document;
    }
  });
});
