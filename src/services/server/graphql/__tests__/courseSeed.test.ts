/**
 * hasura/seeds/course.json is the source of truth for the course's categories
 * and lessons, and scripts/course-seed.js keeps a database in
 * step with it.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { LessonAccessLevel, LessonType, LessonVisibilityStatus } from 'utils/constants/lesson';

/* eslint-disable @typescript-eslint/no-var-requires */
const courseSeed = require('../../../../../scripts/course-seed');
/* eslint-enable @typescript-eslint/no-var-requires */

const ROOT = path.join(__dirname, '../../../../..');

type Row = Record<string, any>;
type Seed = { categories: Row[]; lessons: Row[] };

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const category = (slug: string, position: number, id: string): Row => ({
  id,
  slug,
  title: slug.toUpperCase(),
  position,
  description: '',
  video: '',
  previewVideo: '',
});

const lesson = (slug: string, position: number | null, id: string, fields: Row = {}): Row => ({
  id,
  slug,
  title: slug.toUpperCase(),
  category: 'arrays',
  position,
  status: 'ACTIVE',
  accessLevel: 'SUBSCRIPTION',
  type: 'QUESTION',
  difficulty: null,
  introductionVideoUrl: null,
  solutionVideoUrl: null,
  metaTitle: null,
  metaDescription: null,
  description: '',
  ...fields,
});

const ARRAYS = '00000000-0000-4000-8000-000000000001';
const TREES = '00000000-0000-4000-8000-000000000002';
const ONE = '00000000-0000-4000-8000-0000000000a1';
const TWO = '00000000-0000-4000-8000-0000000000a2';
const THREE = '00000000-0000-4000-8000-0000000000a3';

const SEED: Seed = {
  categories: [category('arrays', 0, ARRAYS), category('trees', 1, TREES)],
  lessons: [
    lesson('one', 100, ONE, { accessLevel: 'FREE', solutionVideoUrl: 'https://youtu.be/one' }),
    lesson('two', 101, TWO),
    lesson('three', 200, THREE, { category: 'trees', difficulty: 'EASY' }),
  ],
};

describe('hasura/seeds/course.json', () => {
  const text = fs.readFileSync(courseSeed.SEED_FILE, 'utf8');
  const seed: Seed = JSON.parse(text);

  it('is valid', () => {
    expect(courseSeed.validate(seed)).toEqual({ errors: [], warnings: [] });
  });

  it('is in the order and layout `export` writes, so exports diff cleanly', () => {
    expect(text).toBe(courseSeed.serialize(seed));
  });

  it('allows the values the app knows', () => {
    expect([...courseSeed.ACCESS_LEVELS].sort()).toEqual(Object.values(LessonAccessLevel).sort());
    expect([...courseSeed.STATUSES].sort()).toEqual(Object.values(LessonVisibilityStatus).sort());
    expect([...courseSeed.TYPES].sort()).toEqual(Object.values(LessonType).sort());
  });

  it('has content and a page for every published lesson', () => {
    const missing = seed.lessons
      .filter((row) => row.status === LessonVisibilityStatus.Active)
      .flatMap((row) => [
        `src/content/lessons/${row.slug}/index.tsx`,
        `src/pages/course/${row.slug}.tsx`,
      ])
      .filter((file) => !fs.existsSync(path.join(ROOT, file)));

    expect(missing).toEqual([]);
  });
});

describe('validate', () => {
  const errorsFor = (change: (seed: Seed) => void) => {
    const seed = clone(SEED);

    change(seed);
    return courseSeed.validate(seed).errors;
  };

  it('accepts a valid seed', () => {
    expect(courseSeed.validate(SEED)).toEqual({ errors: [], warnings: [] });
  });

  it.each([
    ['a repeated id', (s: Seed) => (s.lessons[1].id = ONE), 'lesson two: id "' + ONE + '" is used twice, here and by one'],
    ['a repeated slug', (s: Seed) => (s.lessons[1].slug = 'one'), 'lesson one: slug "one" is used twice, here and by one'],
    ['a repeated position', (s: Seed) => (s.lessons[1].position = 100), 'lesson two: position 100 is used twice, here and by one'],
    ['an unknown category', (s: Seed) => (s.lessons[0].category = 'graphs'), `lesson one: category "graphs" isn't one of the file's categories`],
    ['a bad access level', (s: Seed) => (s.lessons[0].accessLevel = 'free'), 'lesson one: accessLevel must be one of "FREE", "TRIAL", "SUBSCRIPTION"'],
    ['a bad status', (s: Seed) => (s.lessons[0].status = 'PUBLISHED'), 'lesson one: status must be one of "ACTIVE", "INACTIVE", "BETA"'],
    ['a bad type', (s: Seed) => (s.lessons[0].type = 'VIDEO'), 'lesson one: type must be one of "QUESTION", "INSTRUCTIONAL"'],
    ['a misspelled difficulty', (s: Seed) => (s.lessons[0].difficulty = 'MEDUM'), 'lesson one: difficulty must be null or one of "EASY", "MEDIUM", "HARD"'],
    ['a video that is not a link', (s: Seed) => (s.lessons[0].solutionVideoUrl = 'youtu.be/x'), 'lesson one: solutionVideoUrl must be an https:// link or null'],
    ['a missing field', (s: Seed) => delete s.lessons[0].metaTitle, 'lesson one: missing metaTitle'],
    ['an unknown field', (s: Seed) => (s.lessons[0].categoryId = ARRAYS), 'lesson one: unknown field categoryId'],
    ['an empty title', (s: Seed) => (s.categories[0].title = ' '), 'category arrays: title is empty'],
    ['a bad slug', (s: Seed) => (s.categories[1].slug = 'Trees'), 'category Trees: slug must be lowercase letters and digits joined by hyphens, not "Trees"'],
    ['a bad id', (s: Seed) => (s.categories[0].id = 'arrays'), 'category arrays: id must be a lowercase UUID, not "arrays"'],
    ['a category without a position', (s: Seed) => (s.categories[0].position = null), 'category arrays: position must be a whole number, not null'],
    ['a null description', (s: Seed) => (s.lessons[0].description = null), 'lesson one: description must be text (use "" for none)'],
  ])('rejects %s', (_name, change, error) => {
    expect(errorsFor(change)).toContain(error);
  });

  it('allows a lesson without a position, which keeps it out of the course list', () => {
    expect(errorsFor((s) => (s.lessons[0].position = null))).toEqual([]);
  });

  it('rejects a file without both lists', () => {
    expect(courseSeed.validate({ lessons: [] }).errors).toEqual([
      'The file must be an object with "categories" and "lessons" lists',
    ]);
  });

  it('warns about a video used by two lessons', () => {
    const seed = clone(SEED);

    seed.lessons[1].solutionVideoUrl = 'https://youtu.be/one';
    expect(courseSeed.validate(seed)).toEqual({
      errors: [],
      warnings: ["https://youtu.be/one is one's solutionVideoUrl and two's solutionVideoUrl"],
    });
  });
});

describe('serialize', () => {
  it('sorts by position, lessons without one last, and fixes the field order', () => {
    const seed = clone(SEED);

    seed.lessons.reverse();
    seed.lessons[0].position = null;
    seed.lessons[1] = Object.fromEntries(Object.entries(seed.lessons[1]).reverse());

    const written = JSON.parse(courseSeed.serialize(seed));

    expect(written.lessons.map((row: Row) => row.slug)).toEqual(['one', 'two', 'three']);
    expect(Object.keys(written.lessons[1])).toEqual(Object.keys(SEED.lessons[0]));
  });
});

describe('toDatabase and fromDatabase', () => {
  it('turn category slugs into ids and back', () => {
    const db = courseSeed.toDatabase(SEED);

    expect(db.lessons[2]).toMatchObject({ slug: 'three', categoryId: TREES });
    expect(db.lessons[2]).not.toHaveProperty('category');
    expect(courseSeed.fromDatabase(db)).toEqual(SEED);
  });
});

describe('planApply', () => {
  const dbFor = (seed: Seed) => clone(courseSeed.toDatabase(seed));

  it('changes nothing when the database matches', () => {
    const plan = courseSeed.planApply(SEED, dbFor(SEED));

    expect(plan.errors).toEqual([]);
    expect(plan.lessons).toMatchObject({ added: [], changed: [], extra: [], moves: [], upserts: [] });
    expect(plan.categories).toMatchObject({ added: [], changed: [], extra: [], moves: [], upserts: [] });
  });

  it('moves rows that trade positions to unused positions before upserting them', () => {
    const seed = clone(SEED);

    seed.lessons[0].position = 101;
    seed.lessons[1].position = 100;

    const plan = courseSeed.planApply(seed, dbFor(SEED));

    expect(plan.lessons.changed.map((change: Row) => change.changes)).toEqual([
      [{ column: 'position', from: 100, to: 101 }],
      [{ column: 'position', from: 101, to: 100 }],
    ]);
    expect(plan.lessons.moves).toEqual([
      { id: ONE, set: { position: -1 } },
      { id: TWO, set: { position: -2 } },
    ]);
    expect(plan.lessons.upserts.map((row: Row) => [row.slug, row.position])).toEqual([
      ['one', 101],
      ['two', 100],
    ]);
  });

  it('keeps temporary positions below every position in use', () => {
    const seed = clone(SEED);

    seed.lessons[2].position = -5;

    const db = dbFor(seed);

    seed.lessons[0].position = 300;

    expect(courseSeed.planApply(seed, db).lessons.moves).toEqual([{ id: ONE, set: { position: -6 } }]);
  });

  it('moves rows that trade slugs to unused slugs', () => {
    const seed = clone(SEED);

    seed.lessons[0].slug = 'two';
    seed.lessons[1].slug = 'one';

    expect(courseSeed.planApply(seed, dbFor(SEED)).lessons.moves).toEqual([
      { id: ONE, set: { slug: `course-seed-moving-${ONE}` } },
      { id: TWO, set: { slug: `course-seed-moving-${TWO}` } },
    ]);
  });

  it('inserts new rows and updates changed ones, by id', () => {
    const seed = clone(SEED);
    const FOUR = '00000000-0000-4000-8000-0000000000a4';

    seed.lessons.push(lesson('four', 102, FOUR));
    seed.lessons[2].category = 'arrays';
    seed.lessons[2].status = 'INACTIVE';

    const plan = courseSeed.planApply(seed, dbFor(SEED));

    expect(plan.lessons.added.map((row: Row) => row.slug)).toEqual(['four']);
    expect(plan.lessons.changed[0].changes).toEqual([
      { column: 'categoryId', from: TREES, to: ARRAYS },
      { column: 'status', from: 'ACTIVE', to: 'INACTIVE' },
    ]);
    expect(plan.lessons.moves).toEqual([]);
    expect(plan.lessons.upserts.map((row: Row) => row.slug)).toEqual(['four', 'three']);
  });

  it('reports rows only in the database and leaves them alone', () => {
    const seed = clone(SEED);

    seed.lessons.pop();

    const plan = courseSeed.planApply(seed, dbFor(SEED));

    expect(plan.errors).toEqual([]);
    expect(plan.lessons.extra.map((row: Row) => row.slug)).toEqual(['three']);
    expect(plan.lessons.upserts).toEqual([]);
  });

  it("won't give a row's slug or position to another while that row is in the database only", () => {
    const seed = clone(SEED);
    const FOUR = '00000000-0000-4000-8000-0000000000a4';

    seed.lessons.pop();
    seed.lessons.push(lesson('three', 200, FOUR));

    expect(courseSeed.planApply(seed, dbFor(SEED)).errors).toEqual([
      `lesson three: its slug "three" is taken in the database by lesson three (id ${THREE}), which isn't in the file. Give one of them another slug.`,
      `lesson three: its position 200 is taken in the database by lesson three (id ${THREE}), which isn't in the file. Give one of them another position.`,
    ]);
  });
});

describe('buildMutation', () => {
  it('moves rows, then upserts them, categories before lessons, in one mutation', () => {
    const seed = clone(SEED);

    seed.categories[0].position = 1;
    seed.categories[1].position = 0;
    seed.lessons[0].title = 'One, retitled';

    const { query, variables } = courseSeed.buildMutation(
      courseSeed.planApply(seed, courseSeed.toDatabase(SEED)),
    );
    const fields = query
      .split('\n')
      .slice(1, -1)
      .map((line: string) => line.trim().split(':')[0]);

    expect(fields).toEqual(['move_categories_0', 'move_categories_1', 'categories', 'lessons']);
    expect(query).toMatch(/^mutation CourseSeed\(\$move_categories_0_id: uuid!, \$move_categories_0_set: categories_set_input!, /);
    expect(query).toContain(
      'insert_lessons(objects: $lessons, on_conflict: {constraint: lessons_pkey, update_columns: ' +
        '[slug, title, categoryId, position, status, accessLevel, type, difficulty, introductionVideoUrl, ' +
        'solutionVideoUrl, metaTitle, metaDescription, description]}) { affected_rows }',
    );
    expect(variables).toEqual({
      move_categories_0_id: ARRAYS,
      move_categories_0_set: { position: -1 },
      move_categories_1_id: TREES,
      move_categories_1_set: { position: -2 },
      categories: [
        { ...SEED.categories[0], position: 1 },
        { ...SEED.categories[1], position: 0 },
      ],
      lessons: [{ ...courseSeed.toDatabase(SEED).lessons[0], title: 'One, retitled' }],
    });
  });
});

describe('resolveConnection', () => {
  it('defaults to the local Hasura', () => {
    expect(courseSeed.resolveConnection({ env: { HASURA_GRAPHQL_ADMIN_SECRET: 's' } })).toEqual({
      endpoint: 'http://localhost:8080',
      adminSecret: 's',
      host: 'localhost:8080',
      isLocal: true,
    });
  });

  it('accepts the GraphQL URL the app uses', () => {
    expect(
      courseSeed.resolveConnection({
        env: { GRAPHQL_URL: 'https://api.example.com/v1/graphql/', HASURA_GRAPHQL_ADMIN_SECRET: 's' },
      }),
    ).toMatchObject({ endpoint: 'https://api.example.com', host: 'api.example.com', isLocal: false });
  });

  it("takes everything from --env-file, never a secret from the shell's environment", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'course-seed-'));
    const envFile = path.join(dir, '.env.prod.local');

    fs.writeFileSync(envFile, 'HASURA_GRAPHQL_ENDPOINT=https://api.example.com\n');

    expect(() =>
      courseSeed.resolveConnection({ envFile, env: { HASURA_GRAPHQL_ADMIN_SECRET: 'local' } }),
    ).toThrow(`No admin secret for api.example.com: set HASURA_GRAPHQL_ADMIN_SECRET in ${envFile}`);

    fs.appendFileSync(envFile, 'HASURA_GRAPHQL_ADMIN_SECRET_PRODUCTION=prod\n');

    expect(
      courseSeed.resolveConnection({ envFile, env: { HASURA_GRAPHQL_ADMIN_SECRET: 'local' } }),
    ).toMatchObject({ endpoint: 'https://api.example.com', adminSecret: 'prod', isLocal: false });
  });

  it('asks for a secret when there is none', () => {
    expect(() => courseSeed.resolveConnection({ env: {} })).toThrow(
      'No admin secret for localhost:8080: set HASURA_GRAPHQL_ADMIN_SECRET, or pass --env-file <file>',
    );
  });
});

describe('run', () => {
  let db: { categories: Row[]; lessons: Row[] };
  let requests: { query: string; variables?: Row; secret: string }[];
  let output: string[];
  let seedFile: string;

  /** A Hasura that answers the script's query and applies its mutation to `db`. */
  const fakeHasura = async (_url: string, init: RequestInit) => {
    const { query, variables = {} } = JSON.parse(String(init.body));

    requests.push({ query, variables, secret: (init.headers as Row)['x-hasura-admin-secret'] });

    if (query.startsWith('mutation')) {
      for (const [name, value] of Object.entries(variables as Row)) {
        const move = name.match(/^move_(\w+)_\d+_set$/);

        if (move) {
          const id = variables[name.replace(/_set$/, '_id')];

          Object.assign(db[move[1] as 'lessons'].find((row) => row.id === id)!, value);
        } else if (name === 'categories' || name === 'lessons') {
          for (const row of value as Row[]) {
            const index = db[name].findIndex((existing) => existing.id === row.id);

            if (index === -1) db[name].push({ ...row });
            else db[name][index] = { ...row };
          }
        }
      }

      return new Response(JSON.stringify({ data: {} }));
    }

    return new Response(JSON.stringify({ data: clone(db) }));
  };

  const run = (args: string[], env: Row = { HASURA_GRAPHQL_ADMIN_SECRET: 'local-secret' }) =>
    courseSeed.run(args, { seedFile, env, log: (line: string) => output.push(line) });

  const mutations = () => requests.filter((request) => request.query.startsWith('mutation'));

  beforeEach(() => {
    db = clone(courseSeed.toDatabase(SEED));
    requests = [];
    output = [];
    seedFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'course-seed-')), 'course.json');
    fs.writeFileSync(seedFile, courseSeed.serialize(SEED));
    jest.spyOn(global, 'fetch').mockImplementation(fakeHasura as typeof fetch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const editSeed = (change: (seed: Seed) => void) => {
    const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

    change(seed);
    fs.writeFileSync(seedFile, courseSeed.serialize(seed));
  };

  it('diff says so when the database matches, and changes nothing', async () => {
    await expect(run(['diff'])).resolves.toBe(0);
    expect(output.join('\n')).toContain('categories (2 in the file, 2 in the database): no changes');
    expect(output.join('\n')).toContain('The database matches the file.');
    expect(mutations()).toEqual([]);
  });

  it('diff lists the changes and exits 1 without applying them', async () => {
    editSeed((seed) => {
      seed.lessons[2].category = 'arrays';
      seed.lessons[0].metaTitle = 'One';
    });
    db.lessons.push({ ...db.lessons[0], id: '00000000-0000-4000-8000-0000000000ff', slug: 'old', position: 999 });

    await expect(run(['diff'])).resolves.toBe(1);
    expect(output).toEqual(
      expect.arrayContaining([
        'lessons (3 in the file, 4 in the database): 2 to change',
        '  ~ one: metaTitle null → "One"',
        '  ~ three: category "trees" → "arrays"',
        '  ? old: in the database only, left as it is',
        '\n2 rows differ. `apply` would change them.',
      ]),
    );
    expect(mutations()).toEqual([]);
  });

  it('apply updates a local database to match, then checks it does', async () => {
    editSeed((seed) => {
      seed.lessons[0].position = 101;
      seed.lessons[1].position = 100;
      seed.lessons.push(lesson('four', 102, '00000000-0000-4000-8000-0000000000a4'));
    });

    await expect(run(['apply'])).resolves.toBe(0);
    expect(mutations()).toHaveLength(1);
    expect(requests.map((request) => request.query.split(/[ (]/)[0])).toEqual(['query', 'mutation', 'query']);
    expect(requests.every((request) => request.secret === 'local-secret')).toBe(true);
    expect(courseSeed.fromDatabase(db)).toEqual(
      expect.objectContaining({ lessons: expect.arrayContaining([expect.objectContaining({ slug: 'four' })]) }),
    );
    expect(output[output.length - 1]).toBe(
      '\nApplied to localhost:8080 (categories: 0 added, 0 updated; lessons: 1 added, 2 updated). The database matches the file.',
    );
  });

  it('apply needs --yes for a database on another machine', async () => {
    const remote = { HASURA_GRAPHQL_ENDPOINT: 'https://api.example.com', HASURA_GRAPHQL_ADMIN_SECRET: 'prod' };

    editSeed((seed) => (seed.lessons[0].title = 'Changed'));

    await expect(run(['apply'], remote)).resolves.toBe(1);
    expect(mutations()).toEqual([]);
    expect(output[output.length - 1]).toBe(
      "\napi.example.com isn't this machine. Check the changes above, then run again with --yes to apply them.",
    );

    await expect(run(['apply', '--yes'], remote)).resolves.toBe(0);
    expect(mutations()).toHaveLength(1);
    expect(db.lessons[0].title).toBe('Changed');
  });

  it("apply does nothing when the database already matches", async () => {
    await expect(run(['apply'])).resolves.toBe(0);
    expect(mutations()).toEqual([]);
  });

  it('refuses a file with problems before asking the database anything', async () => {
    editSeed((seed) => (seed.lessons[0].category = 'graphs'));

    await expect(run(['apply'])).rejects.toThrow(
      `has problems, so nothing was compared or changed:\n  lesson one: category "graphs" isn't one of the file's categories`,
    );
    expect(requests).toEqual([]);
  });

  it("refuses to apply when a database-only row holds a row's slug or position", async () => {
    editSeed((seed) => (seed.lessons[1].position = 999));
    db.lessons.push({ ...db.lessons[0], id: '00000000-0000-4000-8000-0000000000ff', slug: 'old', position: 999 });

    await expect(run(['apply'])).rejects.toThrow("The file can't be applied as it is");
    expect(mutations()).toEqual([]);
  });

  it("export writes the database's rows into the file and notes values the file doesn't allow", async () => {
    db.lessons[0].title = 'From production';
    db.lessons[1].difficulty = 'MEDUM';

    await expect(run(['export'])).resolves.toBe(0);

    const written = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

    expect(fs.readFileSync(seedFile, 'utf8')).toBe(courseSeed.serialize(written));
    expect(written.lessons[0].title).toBe('From production');
    expect(output).toContain('  lesson two: difficulty must be null or one of "EASY", "MEDIUM", "HARD"');
    expect(mutations()).toEqual([]);
  });

  it('explains how to use it', async () => {
    await expect(run([])).rejects.toThrow('Usage: node scripts/course-seed.js <diff|apply|export>');
    await expect(run(['apply', '--force'])).rejects.toThrow('Unknown argument: --force');
  });

  it('says when Hasura rejects the admin secret', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: 'invalid "x-hasura-admin-secret"', extensions: { code: 'access-denied' } }] }),
      ),
    );

    await expect(run(['diff'])).rejects.toThrow(
      'Hasura at localhost:8080: invalid "x-hasura-admin-secret". Check the admin secret.',
    );
  });

  it("says when Hasura isn't running", async () => {
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED' } }));

    await expect(run(['diff'])).rejects.toThrow(
      "Couldn't reach Hasura at localhost:8080 (ECONNREFUSED). Is it running? See docs/README.md.",
    );
  });
});
