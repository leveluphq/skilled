/**
 * scripts/setup-env.js makes a working .env.local: the example's values, with
 * new JWT_SECRET and ENCRYPTION_KEY values the app accepts, and never replaces
 * a value someone already set.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { validateKey } from 'services/server/encryption/keyManagement';

/* eslint-disable @typescript-eslint/no-var-requires */
const { setupEnv, parseArgs } = require('../../../../scripts/setup-env');
/* eslint-enable @typescript-eslint/no-var-requires */

const ROOT = path.join(__dirname, '../../../..');

const valueOf = (text: string, name: string) => text.match(new RegExp(`^${name}=(.*)$`, 'm'))?.[1];

describe('setup-env', () => {
  let dir: string;
  let logs: string[];

  const run = () => {
    setupEnv({ root: dir, log: (line: string) => logs.push(line) });

    return fs.readFileSync(path.join(dir, '.env.local'), 'utf8');
  };

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'setup-env-'));
    fs.copyFileSync(path.join(ROOT, '.env.example'), path.join(dir, '.env.example'));
    logs = [];
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('copies .env.example and fills in both secrets with values the app accepts', () => {
    const example = fs.readFileSync(path.join(dir, '.env.example'), 'utf8');
    const text = run();

    for (const name of ['JWT_SECRET', 'ENCRYPTION_KEY']) {
      expect(validateKey(valueOf(text, name)!)).toBe(true);
    }
    expect(valueOf(text, 'JWT_SECRET')).not.toBe(valueOf(text, 'ENCRYPTION_KEY'));
    expect(text.split('\n')).toHaveLength(example.split('\n').length);
    expect(valueOf(text, 'HASURA_GRAPHQL_ADMIN_SECRET')).toBe(
      valueOf(example, 'HASURA_GRAPHQL_ADMIN_SECRET'),
    );
    expect(logs[0]).toBe('Made .env.local from .env.example');
  });

  it('keeps secrets that are already set, and says so', () => {
    const first = run();

    logs = [];
    const second = run();

    expect(second).toBe(first);
    expect(logs).toEqual(['JWT_SECRET: kept', 'ENCRYPTION_KEY: kept']);
  });

  it("never replaces a value of someone's own, even one the app would refuse", () => {
    fs.writeFileSync(
      path.join(dir, '.env.local'),
      'GRAPHQL_URL=http://localhost:8091/v1/graphql\nENCRYPTION_KEY=too-short\n',
    );

    const text = run();

    expect(valueOf(text, 'ENCRYPTION_KEY')).toBe('too-short');
    expect(validateKey(valueOf(text, 'JWT_SECRET')!)).toBe(true);
    expect(valueOf(text, 'GRAPHQL_URL')).toBe('http://localhost:8091/v1/graphql');
    expect(logs).toEqual([
      'JWT_SECRET: set to a new random value',
      "ENCRYPTION_KEY: kept, but it isn't 64 bytes of base64, so logging in won't work. Delete its line and run this again for a new one.",
    ]);
  });

  it('points GRAPHQL_URL at a Hasura on another port when asked, changing nothing else', () => {
    const first = run();

    logs = [];
    setupEnv({ root: dir, log: (line: string) => logs.push(line), hasuraPort: 8091 });

    const text = fs.readFileSync(path.join(dir, '.env.local'), 'utf8');

    expect(valueOf(text, 'GRAPHQL_URL')).toBe('http://localhost:8091/v1/graphql');
    expect(text.replace(/^GRAPHQL_URL=.*$/m, '')).toBe(first.replace(/^GRAPHQL_URL=.*$/m, ''));
    expect(logs).toEqual([
      'JWT_SECRET: kept',
      'ENCRYPTION_KEY: kept',
      'GRAPHQL_URL: http://localhost:8091/v1/graphql',
    ]);
    expect(parseArgs(['--hasura-port', '8091'])).toEqual({ hasuraPort: 8091 });
    expect(parseArgs(['--hasura-port=8090'])).toEqual({ hasuraPort: 8090 });
    expect(() => parseArgs(['--hasura-port', 'http://localhost:8091'])).toThrow('Usage');
    expect(() => parseArgs(['--port', '8091'])).toThrow('Usage');
  });

  it('fills in an empty value, and reads quoted ones', () => {
    const secret = Buffer.alloc(64, 7).toString('base64');

    fs.writeFileSync(path.join(dir, '.env.local'), `JWT_SECRET=\nENCRYPTION_KEY="${secret}"`);

    const text = run();

    expect(validateKey(valueOf(text, 'JWT_SECRET')!)).toBe(true);
    expect(valueOf(text, 'ENCRYPTION_KEY')).toBe(`"${secret}"`);
    expect(logs).toEqual(['JWT_SECRET: set to a new random value', 'ENCRYPTION_KEY: kept']);
  });
});
