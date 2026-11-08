import { createHmac } from 'crypto';
import { NextApiRequest } from 'next';
import countCodeSubmissions from 'services/server/graphql/queries/countCodeSubmissions';
import { Code_Submissions_Bool_Exp } from 'types/generated/server';
import { getRunnerBackend } from 'utils/shared/runner/settings';

// How often a learner may run code (docs/README.md), counted from their
// recent rows in code_submissions: by user when logged in, and by a keyed hash
// of their IP address when not.
//
//   RUN_LIMIT_ANONYMOUS  runs per window for a logged-out visitor's IP (30/10m)
//   RUN_LIMIT_USER       runs per window for a logged-in learner (120/10m)
//   RUN_LIMIT_TOTAL      runs per window for everyone together (2000/1h), a
//                        guard on the runner service's bill: many addresses at
//                        once can't run up more than about 2000 runs an hour
//   RUN_LIMITS           "on" or "off" to override where limits apply
//   RUN_LIMIT_SECRET     the key for IP hashes (falls back to JWT_SECRET)
//
// A limit is "<runs>/<number><s|m|h|d>", or "off".

export interface Limit {
  count: number;
  windowMs: number;
  // "10 minutes"
  window: string;
}

const UNITS: Record<string, [number, string]> = {
  s: [1000, 'second'],
  m: [60 * 1000, 'minute'],
  h: [60 * 60 * 1000, 'hour'],
  d: [24 * 60 * 60 * 1000, 'day'],
};

const plural = (amount: number, unit: string) => `${amount} ${unit}${amount === 1 ? '' : 's'}`;

export const parseLimit = (setting: string | undefined, fallback: string): Limit | null => {
  const text = (setting || fallback).trim();

  if (text === 'off') {
    return null;
  }

  const match = /^(\d+)\s*\/\s*(\d+)\s*([smhd])$/.exec(text);

  if (!match || Number(match[1]) < 1 || Number(match[2]) < 1) {
    throw new Error(`Bad run limit "${text}": write it as runs/window, like 30/10m, or off`);
  }

  const [unitMs, unitName] = UNITS[match[3]];
  return {
    count: Number(match[1]),
    windowMs: Number(match[2]) * unitMs,
    window: plural(Number(match[2]), unitName),
  };
};

// Limits apply where code runs on a shared service (the runner service,
// Judge0). Running locally, in Docker or with the system runner, a learner
// would only be limiting themselves.
export const limitsEnabled = () => {
  const setting = process.env.RUN_LIMITS;

  if (setting === 'on' || setting === 'off') {
    return setting === 'on';
  }

  const backend = getRunnerBackend();

  return backend !== 'docker' && backend !== 'system';
};

// The visitor's address: the first in X-Forwarded-For, or the connection's.
// Vercel overwrites X-Forwarded-For with the real address, so it can't be
// forged there. Behind a proxy that appends to the header instead, a visitor
// could forge the first address: have the proxy replace it.
export const clientIp = (req: NextApiRequest) => {
  const forwarded = req.headers['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded || '').split(',')[0].trim();
  const realIp = req.headers['x-real-ip'];

  return first || (typeof realIp === 'string' ? realIp : '') || req.socket?.remoteAddress || '';
};

// Keyed, so the stored hashes can't be turned back into addresses without the
// server's secret
export const ipHash = (ip: string) =>
  ip
    ? createHmac('sha256', process.env.RUN_LIMIT_SECRET || process.env.JWT_SECRET || '')
        .update(ip)
        .digest('hex')
        .slice(0, 32)
    : null;

export interface LimitReached {
  message: string;
  retryAfterSeconds: number;
}

const wait = (seconds: number) =>
  seconds < 60 ? plural(seconds, 'second') : plural(Math.ceil(seconds / 60), 'minute');

// Whether a run would go over a limit, given the learner's recent runs
const check = async (
  limit: Limit,
  where: Code_Submissions_Bool_Exp,
  now: number,
): Promise<number | null> => {
  const { count, startedAt } = await countCodeSubmissions(
    { _and: [where, { createdAt: { _gt: new Date(now - limit.windowMs).toISOString() } }] },
    limit.count - 1,
  );

  if (count < limit.count) {
    return null;
  }

  // Free again when the oldest of the last `limit.count` runs leaves the window
  const freeAt = startedAt ? startedAt.getTime() + limit.windowMs : now + limit.windowMs;
  return Math.max(1, Math.ceil((freeAt - now) / 1000));
};

export const checkRunLimits = async ({
  userId,
  ipHash: hash,
  now = Date.now(),
}: {
  userId?: string | null;
  ipHash: string | null;
  now?: number;
}): Promise<LimitReached | null> => {
  if (!limitsEnabled()) {
    return null;
  }

  const personal = userId
    ? parseLimit(process.env.RUN_LIMIT_USER, '120/10m')
    : parseLimit(process.env.RUN_LIMIT_ANONYMOUS, '30/10m');
  const personalWhere: Code_Submissions_Bool_Exp | null = userId
    ? { userId: { _eq: userId } }
    : hash
      ? { ipHash: { _eq: hash }, userId: { _is_null: true } }
      : null;

  if (personal && personalWhere) {
    const seconds = await check(personal, personalWhere, now);
    if (seconds !== null) {
      return {
        message: `You've run code ${personal.count} times in the last ${personal.window}. You can run it again in ${wait(seconds)}`,
        retryAfterSeconds: seconds,
      };
    }
  }

  const total = parseLimit(process.env.RUN_LIMIT_TOTAL, '2000/1h');

  if (total) {
    const seconds = await check(total, {}, now);
    if (seconds !== null) {
      return {
        message: `Lots of people are running code right now. Please try again in ${wait(seconds)}`,
        retryAfterSeconds: seconds,
      };
    }
  }

  return null;
};
