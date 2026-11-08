/**
 * scripts/course-seed.js against a real Hasura on this machine: the seed
 * applies to it, and a reordered and edited seed applies over it and back.
 * It runs only with COURSE_SEED_HASURA_TEST=1, against HASURA_GRAPHQL_ENDPOINT
 * (default http://localhost:8080) with HASURA_GRAPHQL_ADMIN_SECRET, as CI's
 * build job does after loading the schema. It leaves the database as the seed
 * has it.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

/* eslint-disable @typescript-eslint/no-var-requires */
const courseSeed = require('../../../../../scripts/course-seed');
/* eslint-enable @typescript-eslint/no-var-requires */

type Row = Record<string, any>;

const enabled = process.env.COURSE_SEED_HASURA_TEST === '1';
const ADDED_ID = '00000000-0000-4000-8000-00000000c0de';

(enabled ? describe : describe.skip)('course seed on a real Hasura', () => {
  const connection = enabled ? courseSeed.resolveConnection() : null;
  const original = courseSeed.readSeed();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'course-seed-'));
  const seedFile = path.join(dir, 'course.json');
  let output: string[] = [];

  const run = (command: string, seed: Row) => {
    fs.writeFileSync(seedFile, courseSeed.serialize(seed));
    output = [];

    return courseSeed.run([command], { seedFile, log: (line: string) => output.push(line) });
  };

  const graphql = async (query: string, variables?: Row) => {
    const response = await fetch(`${connection.endpoint}/v1/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hasura-admin-secret': connection.adminSecret },
      body: JSON.stringify({ query, variables }),
    });
    const body = await response.json();

    if (body.errors) throw new Error(JSON.stringify(body.errors));
    return body.data;
  };

  beforeAll(() => {
    if (!connection.isLocal) {
      throw new Error(`This test changes rows; it runs only against this machine, not ${connection.host}`);
    }
  });

  afterAll(async () => {
    await graphql(`mutation { delete_lessons_by_pk(id: "${ADDED_ID}") { id } }`);
    await run('apply', original);
  });

  it('applies the seed, after which the database matches it', async () => {
    await expect(run('apply', original)).resolves.toBe(0);
    await expect(run('diff', original)).resolves.toBe(0);
  });

  it('applies a reordered, renamed and extended seed in one go, and back', async () => {
    const edited = JSON.parse(JSON.stringify(original));
    const [first, second, third] = edited.lessons;
    const [categoryA, categoryB] = edited.categories;

    // Trade positions and slugs, the moves that collide on unique constraints
    [first.position, second.position] = [second.position, first.position];
    [second.slug, third.slug] = [third.slug, second.slug];
    [categoryA.position, categoryB.position] = [categoryB.position, categoryA.position];
    first.title = `${first.title} (edited)`;
    third.category = categoryB.slug;
    edited.lessons.push({
      ...edited.lessons[edited.lessons.length - 1],
      id: ADDED_ID,
      slug: 'course-seed-test-lesson',
      position: Math.max(...edited.lessons.map((row: Row) => row.position ?? 0)) + 1,
      status: 'INACTIVE',
    });

    await expect(run('apply', edited)).resolves.toBe(0);
    expect(output[output.length - 1]).toMatch(/categories: 0 added, 2 updated; lessons: 1 added, 3 updated/);
    await expect(run('diff', edited)).resolves.toBe(0);

    const rows = await graphql(
      `query ($ids: [uuid!]!) { lessons(where: {id: {_in: $ids}}) { id slug position title categoryId } }`,
      { ids: [first.id, second.id, third.id] },
    );
    const byId = new Map(rows.lessons.map((row: Row) => [row.id, row]));

    expect(byId.get(first.id)).toMatchObject({ position: first.position, title: first.title });
    expect(byId.get(second.id)).toMatchObject({ position: second.position, slug: second.slug });
    expect(byId.get(third.id)).toMatchObject({ slug: third.slug, categoryId: categoryB.id });

    // Back to the committed seed; the added lesson stays, as rows only in the
    // database do, until afterAll deletes it
    await expect(run('apply', original)).resolves.toBe(0);
    expect(output).toContain('  ? course-seed-test-lesson: in the database only, left as it is');
    await expect(run('diff', original)).resolves.toBe(0);
  });
});
