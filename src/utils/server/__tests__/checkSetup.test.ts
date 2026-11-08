/**
 * scripts/check-setup.js copies a few of the app's rules into plain JavaScript,
 * so it runs before anything is built. These keep the copies in step, and its
 * lesson runnable in every language without an account.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getRunnerBackend, SYSTEM_LANGUAGES } from 'utils/shared/runner/settings';
import { MINIMUM_NODE, MINIMUM_PYTHON } from 'services/server/runner/backends/system';
import { CodingLanguage } from 'utils/constants/lesson';
import lessonLanguages from 'content/lessonLanguages.gen';

/* eslint-disable @typescript-eslint/no-var-requires */
const checkSetup = require('../../../../scripts/check-setup');
const { IMAGES } = require('../../../../scripts/runner-images');
const seed = require('../../../../hasura/seeds/course.json');
/* eslint-enable @typescript-eslint/no-var-requires */

const ROOT = path.join(__dirname, '../../../..');

describe('check-setup', () => {
  it('picks where code runs as the app does', () => {
    const saved = {
      CODE_RUNNER: process.env.CODE_RUNNER,
      JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
    };
    const cases = [
      {},
      { JUDGE0_API_KEY: 'key' },
      { CODE_RUNNER: 'system' },
      { CODE_RUNNER: 'service', JUDGE0_API_KEY: 'key' },
      { CODE_RUNNER: 'docker', JUDGE0_API_KEY: 'key' },
      { CODE_RUNNER: 'judge0' },
      { CODE_RUNNER: 'something-else' },
    ];

    try {
      for (const env of cases) {
        delete process.env.CODE_RUNNER;
        delete process.env.JUDGE0_API_KEY;
        Object.assign(process.env, env);

        expect(checkSetup.runnerBackend(env)).toBe(getRunnerBackend());
      }
    } finally {
      for (const [name, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });

  it("has the system runner's languages and minimum versions", () => {
    expect(checkSetup.SYSTEM_LANGUAGES.map((name: string) => name.toUpperCase())).toEqual(
      SYSTEM_LANGUAGES,
    );
    expect(checkSetup.MINIMUM_NODE).toEqual(MINIMUM_NODE);
    expect(checkSetup.MINIMUM_PYTHON).toEqual(MINIMUM_PYTHON);
  });

  it('runs a free, published lesson with a reference solution in every language', () => {
    const lesson = seed.lessons.find((row: { slug: string }) => row.slug === checkSetup.LESSON);

    expect(lesson).toMatchObject({ accessLevel: 'FREE', status: 'ACTIVE' });
    // The run-code route's name for each language is the image's name in capitals
    expect(Object.keys(IMAGES).map((name) => name.toUpperCase())).toEqual(
      Object.values(CodingLanguage),
    );
    expect(lessonLanguages[checkSetup.LESSON]).toEqual(Object.values(CodingLanguage));

    for (const name of Object.keys(IMAGES)) {
      expect(checkSetup.readCode(checkSetup.solutionFile(ROOT, name)).trim()).not.toBe('');
    }
  });

  it('finds missing settings and malformed secrets, by name', () => {
    const secret = Buffer.alloc(64, 7).toString('base64');
    const complete = Object.fromEntries(
      checkSetup.REQUIRED.map((name: string) => [
        name,
        name.endsWith('_SECRET') || name.endsWith('_KEY') ? secret : 'x',
      ]),
    );

    expect(checkSetup.settingsProblems({})).toEqual({ missing: checkSetup.REQUIRED, invalid: [] });
    expect(checkSetup.settingsProblems(complete)).toEqual({ missing: [], invalid: [] });
    expect(
      checkSetup.settingsProblems({ ...complete, JWT_SECRET: 'too-short', ENCRYPTION_KEY: ' ' }),
    ).toEqual({ missing: ['ENCRYPTION_KEY'], invalid: ['JWT_SECRET'] });
  });

  it('reads languages and --no-app, and refuses anything else', () => {
    expect(checkSetup.parseArgs(['--no-app', 'Java', 'python'])).toEqual({
      app: false,
      languages: ['java', 'python'],
    });
    expect(() => checkSetup.parseArgs(['--fast'])).toThrow('Unknown argument: --fast');
  });

  it('says to install the dependencies before anything else', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-setup-'));
    const logs: string[] = [];

    try {
      fs.copyFileSync(path.join(ROOT, '.nvmrc'), path.join(dir, '.nvmrc'));

      const code = await checkSetup.checkSetup({
        root: dir,
        env: {},
        log: (line: string) => logs.push(line),
      });

      expect(code).toBe(1);
      expect(logs).toContain("✗ The dependencies aren't installed");
      expect(logs).toContain('    npm ci');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
