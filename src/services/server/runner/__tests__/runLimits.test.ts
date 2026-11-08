/**
 * Rate limits on running code, counted from recent runs in
 * Postgres. The count query is mocked; the route test covers the 429.
 */
jest.mock('services/server/graphql/queries/countCodeSubmissions', () => jest.fn());

import { NextApiRequest } from 'next';
import countCodeSubmissions from 'services/server/graphql/queries/countCodeSubmissions';
import {
  checkRunLimits,
  clientIp,
  ipHash,
  limitsEnabled,
  parseLimit,
} from 'services/server/runner/runLimits';

const mockCount = countCodeSubmissions as unknown as jest.Mock;
const ENV = process.env;
const NOW = Date.parse('2026-10-15T12:00:00Z');

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...ENV, CODE_RUNNER: 'service', JWT_SECRET: 'jwt', RUN_LIMITS: undefined };
  delete process.env.RUN_LIMIT_ANONYMOUS;
  delete process.env.RUN_LIMIT_USER;
  delete process.env.RUN_LIMIT_TOTAL;
  delete process.env.RUN_LIMIT_SECRET;
  mockCount.mockResolvedValue({ count: 0, startedAt: null });
});

afterAll(() => {
  process.env = ENV;
});

describe('parseLimit', () => {
  it('reads runs per window', () => {
    expect(parseLimit('30/10m', 'off')).toEqual({
      count: 30,
      windowMs: 600000,
      window: '10 minutes',
    });
    expect(parseLimit(undefined, '20000/1d')).toEqual({
      count: 20000,
      windowMs: 86400000,
      window: '1 day',
    });
    expect(parseLimit('off', '30/10m')).toBeNull();
  });

  it('refuses a limit it can’t read', () => {
    expect(() => parseLimit('30 per minute', 'off')).toThrow(/runs\/window/);
    expect(() => parseLimit('0/10m', 'off')).toThrow();
  });
});

describe('limitsEnabled', () => {
  it('limits runs on shared services, not on your own machine', () => {
    expect(limitsEnabled()).toBe(true);
    process.env.CODE_RUNNER = 'judge0';
    expect(limitsEnabled()).toBe(true);
    process.env.CODE_RUNNER = 'docker';
    expect(limitsEnabled()).toBe(false);
    process.env.CODE_RUNNER = 'system';
    expect(limitsEnabled()).toBe(false);
  });

  it('follows RUN_LIMITS when it’s set', () => {
    process.env.CODE_RUNNER = 'docker';
    process.env.RUN_LIMITS = 'on';
    expect(limitsEnabled()).toBe(true);
    process.env.CODE_RUNNER = 'service';
    process.env.RUN_LIMITS = 'off';
    expect(limitsEnabled()).toBe(false);
  });
});

describe('clientIp and ipHash', () => {
  const request = (headers: Record<string, string>) =>
    ({ headers, socket: { remoteAddress: '10.0.0.9' } }) as unknown as NextApiRequest;

  it('takes the first forwarded address, then the connection’s', () => {
    expect(clientIp(request({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
    expect(clientIp(request({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(clientIp(request({}))).toBe('10.0.0.9');
  });

  it('hashes with the server’s secret, so the same address always matches', () => {
    const hash = ipHash('203.0.113.7');
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
    expect(ipHash('203.0.113.7')).toBe(hash);
    expect(ipHash('203.0.113.8')).not.toBe(hash);
    process.env.RUN_LIMIT_SECRET = 'other';
    expect(ipHash('203.0.113.7')).not.toBe(hash);
    expect(ipHash('')).toBeNull();
  });
});

describe('checkRunLimits', () => {
  it('lets a run under the limit through', async () => {
    mockCount.mockResolvedValue({ count: 29, startedAt: null });

    expect(await checkRunLimits({ userId: null, ipHash: 'abc', now: NOW })).toBeNull();
    expect(mockCount).toHaveBeenCalledWith(
      {
        _and: [
          { ipHash: { _eq: 'abc' }, userId: { _is_null: true } },
          { createdAt: { _gt: '2026-10-15T11:50:00.000Z' } },
        ],
      },
      29,
    );
  });

  it('says when a logged-out visitor can run again', async () => {
    // The oldest of their last 30 runs was 7 minutes ago, so 3 minutes to wait
    mockCount.mockResolvedValue({ count: 30, startedAt: new Date(NOW - 7 * 60 * 1000) });

    expect(await checkRunLimits({ userId: null, ipHash: 'abc', now: NOW })).toEqual({
      message: "You've run code 30 times in the last 10 minutes. You can run it again in 3 minutes",
      retryAfterSeconds: 180,
    });
  });

  it('gives logged-in learners their own, larger limit', async () => {
    mockCount.mockResolvedValue({ count: 120, startedAt: new Date(NOW - 600000 + 20000) });

    const reached = await checkRunLimits({ userId: 'user-1', ipHash: 'abc', now: NOW });

    expect(mockCount.mock.calls[0][0]._and[0]).toEqual({ userId: { _eq: 'user-1' } });
    expect(reached).toEqual({
      message:
        "You've run code 120 times in the last 10 minutes. You can run it again in 20 seconds",
      retryAfterSeconds: 20,
    });
  });

  it('caps everyone together when RUN_LIMIT_TOTAL is set', async () => {
    process.env.RUN_LIMIT_TOTAL = '1000/1d';
    mockCount
      .mockResolvedValueOnce({ count: 3, startedAt: null })
      .mockResolvedValueOnce({ count: 1000, startedAt: new Date(NOW - 86400000 + 3600000) });

    const reached = await checkRunLimits({ userId: 'user-1', ipHash: 'abc', now: NOW });

    expect(reached).toEqual({
      message: 'Lots of people are running code right now. Please try again in 60 minutes',
      retryAfterSeconds: 3600,
    });
  });

  it('caps everyone together at 2000 runs an hour by default', async () => {
    mockCount
      .mockResolvedValueOnce({ count: 0, startedAt: null })
      .mockResolvedValueOnce({ count: 2000, startedAt: new Date(NOW - 3600000 + 600000) });

    const reached = await checkRunLimits({ userId: null, ipHash: 'abc', now: NOW });

    expect(mockCount.mock.calls[1]).toEqual([
      { _and: [{}, { createdAt: { _gt: '2026-10-15T11:00:00.000Z' } }] },
      1999,
    ]);
    expect(reached).toEqual({
      message: 'Lots of people are running code right now. Please try again in 10 minutes',
      retryAfterSeconds: 600,
    });
  });

  it('has no total cap with RUN_LIMIT_TOTAL=off', async () => {
    process.env.RUN_LIMIT_TOTAL = 'off';
    mockCount.mockResolvedValue({ count: 0, startedAt: null });

    expect(await checkRunLimits({ userId: null, ipHash: 'abc', now: NOW })).toBeNull();
    expect(mockCount).toHaveBeenCalledTimes(1);
  });

  it('checks nothing where limits are off', async () => {
    process.env.CODE_RUNNER = 'docker';

    expect(await checkRunLimits({ userId: null, ipHash: 'abc', now: NOW })).toBeNull();
    expect(mockCount).not.toHaveBeenCalled();
  });
});
