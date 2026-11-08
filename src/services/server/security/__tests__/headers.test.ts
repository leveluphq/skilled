/**
 * Tests for the security headers middleware.
 *
 * These lock down the exact header set and values that every API route ships,
 * so that loosening any of them (dropping HSTS, widening the CSP, allowing
 * framing) becomes a deliberate, visible change rather than a silent one.
 */

import { ServerResponse } from 'http';
import { NextApiResponse } from 'next';
import { applySecurityHeaders, SECURITY_HEADERS_CONFIG } from '../headers';

interface FakeResponse {
  headers: Record<string, string>;
  setHeader: jest.Mock;
}

const createResponse = (): FakeResponse => {
  const headers: Record<string, string> = {};

  return {
    headers,
    setHeader: jest.fn((name: string, value: string) => {
      headers[name] = value;
    }),
  };
};

/**
 * NODE_ENV is typed read-only, but the module reads it at call time, so the
 * production-only branches can only be exercised by writing to it.
 */
const setNodeEnv = (value: string | undefined) => {
  (process.env as unknown as Record<string, string | undefined>).NODE_ENV = value;
};

const apply = (res: FakeResponse) => applySecurityHeaders((res as unknown) as NextApiResponse);

/**
 * Parses a CSP header into `directive -> [sources]`. Splitting instead of
 * substring-matching means a test cannot be fooled by a source that happens to
 * appear under some *other* directive.
 */
const parseCsp = (csp: string): Record<string, string[]> => {
  return csp.split('; ').reduce<Record<string, string[]>>((acc, directive) => {
    const [name, ...sources] = directive.trim().split(/\s+/);
    acc[name] = sources;
    return acc;
  }, {});
};

const getCsp = (res: FakeResponse) => parseCsp(res.headers['Content-Security-Policy']);

describe('applySecurityHeaders', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
  const ORIGINAL_GRAPHQL_URL = process.env.GRAPHQL_URL;

  beforeEach(() => {
    delete process.env.GRAPHQL_URL;
  });

  afterEach(() => {
    setNodeEnv(ORIGINAL_NODE_ENV);
    if (ORIGINAL_GRAPHQL_URL === undefined) {
      delete process.env.GRAPHQL_URL;
    } else {
      process.env.GRAPHQL_URL = ORIGINAL_GRAPHQL_URL;
    }
  });

  describe('header set', () => {
    it('sets exactly the expected headers outside production (no HSTS)', () => {
      setNodeEnv('test');
      const res = createResponse();

      apply(res);

      expect(Object.keys(res.headers).sort()).toEqual([
        'Content-Security-Policy',
        'Permissions-Policy',
        'Referrer-Policy',
        'X-Content-Type-Options',
        'X-DNS-Prefetch-Control',
        'X-Download-Options',
        'X-Frame-Options',
        'X-Permitted-Cross-Domain-Policies',
        'X-XSS-Protection',
      ]);
      expect(res.headers['Strict-Transport-Security']).toBeUndefined();
      expect(res.setHeader).toHaveBeenCalledTimes(9);
    });

    it('adds HSTS with a one-year preload policy only in production', () => {
      setNodeEnv('production');
      const res = createResponse();

      apply(res);

      expect(res.headers['Strict-Transport-Security']).toBe(
        'max-age=31536000; includeSubDomains; preload',
      );
      expect(res.setHeader).toHaveBeenCalledTimes(10);
    });

    it.each(['development', 'test', 'staging', 'Production', 'prod'])(
      'withholds HSTS and upgrade-insecure-requests when NODE_ENV is "%s"',
      (nodeEnv) => {
        setNodeEnv(nodeEnv);
        const res = createResponse();

        apply(res);

        // The production check is an exact `=== 'production'` match, so any
        // environment spelled differently ships without transport security.
        // Pinned so that is a known property rather than a deploy-time surprise.
        expect(res.headers['Strict-Transport-Security']).toBeUndefined();
        expect(res.headers['Content-Security-Policy']).not.toContain('upgrade-insecure-requests');
      },
    );

    it('pins the anti-clickjacking / anti-sniffing header values', () => {
      const res = createResponse();

      apply(res);

      expect(res.headers['X-Frame-Options']).toBe('DENY');
      expect(res.headers['X-Content-Type-Options']).toBe('nosniff');
      expect(res.headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['X-DNS-Prefetch-Control']).toBe('off');
      expect(res.headers['X-Download-Options']).toBe('noopen');
      expect(res.headers['X-Permitted-Cross-Domain-Policies']).toBe('none');
    });

    it('sends the legacy XSS auditor header in blocking mode', () => {
      const res = createResponse();

      apply(res);

      // BUG (low): `X-XSS-Protection: 1; mode=block` is deprecated. All modern
      // browsers ignore it, and in the browsers that honoured it the blocking
      // auditor was itself exploitable (it could be abused to selectively
      // disable page scripts). Current OWASP guidance is `X-XSS-Protection: 0`
      // plus a strict CSP. Asserting the current value so a change is explicit.
      expect(res.headers['X-XSS-Protection']).toBe('1; mode=block');
    });

    it('restricts browser features via Permissions-Policy', () => {
      const res = createResponse();

      apply(res);

      const policies = res.headers['Permissions-Policy'].split(', ');
      expect(policies).toEqual([
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'interest-cohort=()',
        'payment=(self)',
      ]);
    });

    it('emits every header SECURITY_HEADERS_CONFIG documents, with the documented value', () => {
      setNodeEnv('production');
      const res = createResponse();

      apply(res);

      // Catches documentation drift in both directions: a header described in
      // the exported config summary but no longer emitted, and a header still
      // emitted but with a value the docs no longer describe.
      const documented = Object.entries(SECURITY_HEADERS_CONFIG) as Array<
        [string, { value?: string }]
      >;
      expect(documented).toHaveLength(6);

      documented.forEach(([header, config]) => {
        expect(Object.keys(res.headers)).toContain(header);

        if (config.value) {
          // The HSTS entry annotates its documented value with "(production only)".
          expect(res.headers[header]).toBe(config.value.replace(/ \(production only\)$/, ''));
        }
      });
    });
  });

  describe('content security policy', () => {
    it('emits every directive it claims to, with no duplicates', () => {
      setNodeEnv('test');
      const res = createResponse();

      apply(res);

      const raw = res.headers['Content-Security-Policy'];
      const names = raw.split('; ').map((directive) => directive.trim().split(/\s+/)[0]);

      expect(names).toEqual([
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'font-src',
        'connect-src',
        'frame-src',
        'object-src',
        'base-uri',
        'form-action',
        'frame-ancestors',
      ]);
      expect(new Set(names).size).toBe(names.length);
      // No empty directives / stray separators from the join+filter logic.
      expect(raw).not.toMatch(/;\s*;/);
      expect(raw).not.toMatch(/\s{2,}/);
      expect(raw.endsWith(';')).toBe(false);
    });

    it('locks down the defensive directives', () => {
      const csp = getCsp(createResponseAndApply());

      expect(csp['default-src']).toEqual(["'self'"]);
      expect(csp['object-src']).toEqual(["'none'"]);
      expect(csp['base-uri']).toEqual(["'self'"]);
      expect(csp['form-action']).toEqual(["'self'"]);
      expect(csp['frame-ancestors']).toEqual(["'none'"]);
    });

    it('DOCUMENTED WEAKNESS: script-src permits unsafe-inline and unsafe-eval', () => {
      const csp = getCsp(createResponseAndApply());

      // BUG (medium): `'unsafe-inline'` + `'unsafe-eval'` in script-src means the
      // CSP provides essentially no XSS protection for scripts -- an injected
      // <script> or inline handler executes normally. Next.js needs nonces or
      // hashes rather than unsafe-inline. This test exists so that tightening
      // (or further loosening) the policy is a deliberate, reviewed change.
      expect(csp['script-src']).toContain("'unsafe-inline'");
      expect(csp['script-src']).toContain("'unsafe-eval'");

      // ...and it does not fall back to a wildcard on top of that.
      expect(csp['script-src']).not.toContain('*');
      expect(csp['script-src']).not.toContain('http:');
      expect(csp['script-src']).toEqual([
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://js.stripe.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://*.ingest.sentry.io',
        'https://ce.judge0.com',
      ]);
    });

    it('allows only the expected third parties for styles, fonts, frames and images', () => {
      const csp = getCsp(createResponseAndApply());

      expect(csp['style-src']).toEqual([
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ]);
      expect(csp['font-src']).toEqual(["'self'", 'data:', 'https://fonts.gstatic.com']);
      expect(csp['frame-src']).toEqual([
        "'self'",
        'https://js.stripe.com',
        'https://hooks.stripe.com',
      ]);
      // OAuth avatar hosts must stay whitelisted or profile images break.
      expect(csp['img-src']).toEqual([
        "'self'",
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://avatars.githubusercontent.com',
        'https://lh3.googleusercontent.com',
        'https://graph.facebook.com',
      ]);
    });

    it('adds GRAPHQL_URL to connect-src when configured', () => {
      process.env.GRAPHQL_URL = 'https://hasura.example.com/v1/graphql';

      const csp = getCsp(createResponseAndApply());

      expect(csp['connect-src']).toEqual([
        "'self'",
        'https://api.stripe.com',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://*.ingest.sentry.io',
        'https://ce.judge0.com',
        'https://hasura.example.com/v1/graphql',
      ]);
    });

    it.each([
      ['unset', undefined],
      ['empty string', ''],
    ])('omits GRAPHQL_URL from connect-src when %s, without leaving a gap', (_label, value) => {
      if (value === undefined) {
        delete process.env.GRAPHQL_URL;
      } else {
        process.env.GRAPHQL_URL = value;
      }

      const res = createResponseAndApply();
      const csp = getCsp(res);

      expect(csp['connect-src']).toEqual([
        "'self'",
        'https://api.stripe.com',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://*.ingest.sentry.io',
        'https://ce.judge0.com',
      ]);
      // A trailing empty source would render as "...judge0.com " -> a parse
      // ambiguity; filter(Boolean) must strip it.
      expect(res.headers['Content-Security-Policy']).not.toMatch(/connect-src[^;]*\s;/);
    });

    it('recomputes the policy on every call rather than caching module state', () => {
      process.env.GRAPHQL_URL = 'https://first.example.com/graphql';
      const first = createResponseAndApply();

      process.env.GRAPHQL_URL = 'https://second.example.com/graphql';
      const second = createResponseAndApply();

      expect(getCsp(first)['connect-src']).toContain('https://first.example.com/graphql');
      expect(getCsp(second)['connect-src']).toContain('https://second.example.com/graphql');
      expect(getCsp(second)['connect-src']).not.toContain('https://first.example.com/graphql');
    });

    it('adds upgrade-insecure-requests only in production', () => {
      setNodeEnv('test');
      expect(createResponseAndApply().headers['Content-Security-Policy']).not.toContain(
        'upgrade-insecure-requests',
      );

      setNodeEnv('production');
      const productionCsp = createResponseAndApply().headers['Content-Security-Policy'];
      expect(productionCsp).toContain('upgrade-insecure-requests');
      expect(productionCsp.endsWith('upgrade-insecure-requests')).toBe(true);
    });

    it('DOCUMENTED WEAKNESS: a GRAPHQL_URL containing ";" injects arbitrary CSP directives', () => {
      // Adversarial input: GRAPHQL_URL is interpolated into the policy with no
      // validation. A value with a semicolon terminates connect-src and starts a
      // brand new directive.
      process.env.GRAPHQL_URL = "https://evil.example.com; script-src *; default-src *";

      const raw = createResponseAndApply().headers['Content-Security-Policy'];
      const segments = raw.split(';').map((segment) => segment.trim());

      // BUG (low/medium): the header is structurally corrupted -- connect-src is
      // terminated early and two attacker-controlled directives are appended.
      // Browsers enforce the FIRST occurrence of a directive, so `default-src
      // 'self'` happens to still win; that is ordering luck, not a guard. The
      // value should be parsed as a URL (semicolons and whitespace rejected)
      // before being interpolated.
      expect(segments).toContain(
        "connect-src 'self' https://api.stripe.com https://www.google-analytics.com " +
          "https://www.googletagmanager.com https://*.ingest.sentry.io " +
          'https://ce.judge0.com https://evil.example.com',
      );
      expect(segments).toContain('script-src *');
      expect(segments).toContain('default-src *');
      expect(segments.filter((segment) => segment.startsWith('default-src '))).toHaveLength(2);
      expect(segments.filter((segment) => segment.startsWith('script-src '))).toHaveLength(2);
      expect(segments[0]).toBe("default-src 'self'");
    });
  });

  describe('response interaction', () => {
    it('only calls setHeader -- it never writes a body or a status', () => {
      const res = {
        ...createResponse(),
        status: jest.fn(),
        end: jest.fn(),
        json: jest.fn(),
        send: jest.fn(),
      };

      applySecurityHeaders((res as unknown) as NextApiResponse);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.end).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });

    it('is idempotent: applying twice yields identical header values', () => {
      const res = createResponse();

      apply(res);
      const afterFirst = { ...res.headers };
      apply(res);

      expect(res.headers).toEqual(afterFirst);
    });
  });
});

/**
 * The tests above drive a hand-written response double. These run the same code
 * against a real `http.ServerResponse` so the double cannot be quietly lying
 * about what node accepts (header names, value encoding, CRLF rejection).
 */
describe('applySecurityHeaders against a real node ServerResponse', () => {
  const ORIGINAL_GRAPHQL_URL = process.env.GRAPHQL_URL;

  const createRealResponse = () =>
    (new ServerResponse(({ method: 'GET' } as unknown) as never) as unknown) as NextApiResponse;

  beforeEach(() => {
    delete process.env.GRAPHQL_URL;
  });

  afterEach(() => {
    if (ORIGINAL_GRAPHQL_URL === undefined) {
      delete process.env.GRAPHQL_URL;
    } else {
      process.env.GRAPHQL_URL = ORIGINAL_GRAPHQL_URL;
    }
  });

  it('produces the same headers node-side as the test double asserts', () => {
    const real = createRealResponse();

    applySecurityHeaders(real);

    const actual = ((real as unknown) as ServerResponse).getHeaders();
    const expected = Object.entries(createResponseAndApply().headers).reduce<
      Record<string, string>
    >((acc, [name, value]) => {
      acc[name.toLowerCase()] = value;
      return acc;
    }, {});

    expect(actual).toEqual(expected);
    // Node lower-cases names; the CSP must survive as one unsplit string value.
    expect(typeof actual['content-security-policy']).toBe('string');
    expect(actual['x-frame-options']).toBe('DENY');
  });

  it('cannot be used to split the response: node rejects a CRLF in GRAPHQL_URL', () => {
    // Adversarial input: a GRAPHQL_URL carrying CRLF would otherwise append an
    // attacker-chosen header (or body) to every API response.
    process.env.GRAPHQL_URL = 'https://evil.example.com\r\nX-Injected: 1';
    const real = createRealResponse();

    expect(() => applySecurityHeaders(real)).toThrow(
      expect.objectContaining({ code: 'ERR_INVALID_CHAR' }),
    );

    // Response splitting is prevented, but note the failure mode: CSP is the
    // FIRST header set, so the throw leaves the response with NO security
    // headers at all and the route 500s. Validating the env value at startup
    // would be the better fix.
    expect(((real as unknown) as ServerResponse).getHeaderNames()).toEqual([]);
  });
});

function createResponseAndApply(): FakeResponse {
  const res = createResponse();
  applySecurityHeaders((res as unknown) as NextApiResponse);
  return res;
}
