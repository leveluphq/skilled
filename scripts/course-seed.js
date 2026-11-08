// The course's categories and lessons: the rows the app reads from the
// `categories` and `lessons` tables (titles, order, access level, whether a
// lesson is published, video links). hasura/seeds/course.json is the source of
// truth for them, kept in git; the lessons themselves are in
// src/content/lessons. This script keeps a database in step with the file
// (docs/README.md, "Change a Lesson's Title, Order or Access"):
//
//   node scripts/course-seed.js diff     show what apply would change, changing nothing
//   node scripts/course-seed.js apply    insert and update rows to match the file
//   node scripts/course-seed.js export   write a database's rows into the file
//
// It talks to the Hasura at HASURA_GRAPHQL_ENDPOINT (default
// http://localhost:8080) with HASURA_GRAPHQL_ADMIN_SECRET, as the Hasura CLI
// does, or to the one in `--env-file <file>`. Applying to a database that isn't
// on this machine needs `--yes`, after reading the changes.
//
// Rows in the database that the file doesn't have are reported and left alone:
// learners' progress and submissions point at them. To take a lesson down, set
// its status to INACTIVE.
//
// `diff` exits 0 when the database matches the file, 1 when it doesn't, and 2
// on an error.

const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '..', 'hasura', 'seeds', 'course.json');
const DEFAULT_ENDPOINT = 'http://localhost:8080';

// Allowed values. A test keeps them in step with src/utils/constants/lesson.ts.
const ACCESS_LEVELS = ['FREE', 'TRIAL', 'SUBSCRIPTION'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'BETA'];
const TYPES = ['QUESTION', 'INSTRUCTIONAL'];
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

// The columns the file owns, in the order it lists them. The database keeps
// createdAt and updatedAt. In the file a lesson names its category by slug; in
// the database by id.
const CATEGORY_COLUMNS = ['id', 'slug', 'title', 'position', 'description', 'video', 'previewVideo'];
const LESSON_FIELDS = [
  'id',
  'slug',
  'title',
  'category',
  'position',
  'status',
  'accessLevel',
  'type',
  'difficulty',
  'introductionVideoUrl',
  'solutionVideoUrl',
  'metaTitle',
  'metaDescription',
  'description',
];
const LESSON_COLUMNS = LESSON_FIELDS.map((field) => (field === 'category' ? 'categoryId' : field));

const TABLES = [
  { name: 'categories', label: 'category', columns: CATEGORY_COLUMNS },
  { name: 'lessons', label: 'lesson', columns: LESSON_COLUMNS },
];

// Unique in both tables, so rows that trade values must first move out of the
// way. Each gets a value no row has (see planApply).
const UNIQUE_COLUMNS = ['slug', 'position'];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isString = (value) => typeof value === 'string';
const isStringOrNull = (value) => value === null || isString(value);
const isInteger = (value) => Number.isInteger(value);

// --- The file ---------------------------------------------------------------

/** Checks a parsed seed; problems that block applying it are errors. */
const validate = (seed) => {
  const errors = [];
  const warnings = [];

  if (!seed || typeof seed !== 'object' || !Array.isArray(seed.categories) || !Array.isArray(seed.lessons)) {
    return { errors: ['The file must be an object with "categories" and "lessons" lists'], warnings };
  }

  const checkRows = (rows, label, fields, checkRow) => {
    const seen = { id: new Map(), slug: new Map(), position: new Map() };

    rows.forEach((row, index) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        errors.push(`${label} ${index + 1} isn't an object`);
        return;
      }

      const name = isString(row.slug) && row.slug ? row.slug : `${label} ${index + 1}`;
      const fail = (message) => errors.push(`${label} ${name}: ${message}`);
      const missing = fields.filter((field) => !(field in row));
      const unknown = Object.keys(row).filter((key) => !fields.includes(key));

      if (missing.length) fail(`missing ${missing.join(', ')}`);
      if (unknown.length) fail(`unknown ${unknown.length === 1 ? 'field' : 'fields'} ${unknown.join(', ')}`);
      if (!UUID.test(row.id)) fail(`id must be a lowercase UUID, not ${JSON.stringify(row.id)}`);
      if (!isString(row.slug) || !SLUG.test(row.slug)) {
        fail(`slug must be lowercase letters and digits joined by hyphens, not ${JSON.stringify(row.slug)}`);
      }
      if (!isString(row.title) || !row.title.trim()) fail('title is empty');

      for (const key of ['id', 'slug', 'position']) {
        const value = row[key];

        if (value === null || value === undefined) continue;
        if (seen[key].has(value)) {
          fail(`${key} ${JSON.stringify(value)} is used twice, here and by ${seen[key].get(value)}`);
        } else {
          seen[key].set(value, name);
        }
      }

      checkRow(row, fail);
    });
  };

  checkRows(seed.categories, 'category', CATEGORY_COLUMNS, (row, fail) => {
    if (!isInteger(row.position)) fail(`position must be a whole number, not ${JSON.stringify(row.position)}`);
    for (const key of ['description', 'video', 'previewVideo']) {
      if (!isString(row[key])) fail(`${key} must be text (use "" for none)`);
    }
  });

  const categorySlugs = new Set(seed.categories.map((category) => category && category.slug));
  const oneOf = (values) => values.map((value) => JSON.stringify(value)).join(', ');

  checkRows(seed.lessons, 'lesson', LESSON_FIELDS, (row, fail) => {
    if (!categorySlugs.has(row.category)) {
      fail(`category ${JSON.stringify(row.category)} isn't one of the file's categories`);
    }
    if (row.position !== null && !isInteger(row.position)) {
      fail(`position must be a whole number or null, not ${JSON.stringify(row.position)}`);
    }
    if (!STATUSES.includes(row.status)) fail(`status must be one of ${oneOf(STATUSES)}`);
    if (!ACCESS_LEVELS.includes(row.accessLevel)) fail(`accessLevel must be one of ${oneOf(ACCESS_LEVELS)}`);
    if (!TYPES.includes(row.type)) fail(`type must be one of ${oneOf(TYPES)}`);
    if (row.difficulty !== null && !DIFFICULTIES.includes(row.difficulty)) {
      fail(`difficulty must be null or one of ${oneOf(DIFFICULTIES)}`);
    }
    if (!isString(row.description)) fail('description must be text (use "" for none)');
    for (const key of ['metaTitle', 'metaDescription']) {
      if (!isStringOrNull(row[key])) fail(`${key} must be text or null`);
    }
    for (const key of ['introductionVideoUrl', 'solutionVideoUrl']) {
      if (!isStringOrNull(row[key]) || (isString(row[key]) && !/^https:\/\/\S+$/.test(row[key]))) {
        fail(`${key} must be an https:// link or null`);
      }
    }
  });

  // The script this one replaced warned about these: a video used twice is
  // usually a copy-paste mistake.
  const videos = new Map();

  for (const lesson of seed.lessons) {
    for (const key of ['introductionVideoUrl', 'solutionVideoUrl']) {
      const url = lesson && lesson[key];

      if (!isString(url)) continue;
      if (!videos.has(url)) videos.set(url, []);
      videos.get(url).push(`${lesson.slug}'s ${key}`);
    }
  }

  for (const [url, uses] of videos) {
    if (uses.length > 1) warnings.push(`${url} is ${uses.join(' and ')}`);
  }

  return { errors, warnings };
};

const comparePosition = (a, b) =>
  (a.position === null ? Infinity : a.position) - (b.position === null ? Infinity : b.position) ||
  a.slug.localeCompare(b.slug);

const pick = (row, columns) => Object.fromEntries(columns.map((column) => [column, row[column] ?? null]));

/** The file's text for a seed: categories and lessons in course order, fields in a fixed order. */
const serialize = (seed) =>
  `${JSON.stringify(
    {
      categories: seed.categories.map((row) => pick(row, CATEGORY_COLUMNS)).sort(comparePosition),
      lessons: seed.lessons.map((row) => pick(row, LESSON_FIELDS)).sort(comparePosition),
    },
    null,
    2,
  )}\n`;

const readSeed = (file = SEED_FILE) => {
  const text = fs.readFileSync(file, 'utf8');

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${path.relative(process.cwd(), file)} isn't valid JSON: ${error.message}`);
  }
};

// --- Between the file and the database ----------------------------------------

/** The file's rows as database rows: lessons point at their category by id. */
const toDatabase = (seed) => {
  const categoryIds = new Map(seed.categories.map((category) => [category.slug, category.id]));

  return {
    categories: seed.categories.map((row) => pick(row, CATEGORY_COLUMNS)),
    lessons: seed.lessons.map(({ category, ...row }) =>
      pick({ ...row, categoryId: categoryIds.get(category) }, LESSON_COLUMNS),
    ),
  };
};

/** Database rows as the file's rows. */
const fromDatabase = (db) => {
  const categorySlugs = new Map(db.categories.map((category) => [category.id, category.slug]));

  return {
    categories: db.categories.map((row) => pick(row, CATEGORY_COLUMNS)),
    lessons: db.lessons.map(({ categoryId, ...row }) =>
      pick({ ...row, category: categorySlugs.get(categoryId) ?? categoryId }, LESSON_FIELDS),
    ),
  };
};

/** What would make `current` match `target`, matching rows by id. */
const diffRows = (target, current, columns) => {
  const currentById = new Map(current.map((row) => [row.id, row]));
  const targetIds = new Set(target.map((row) => row.id));
  const added = [];
  const changed = [];

  for (const row of target) {
    const before = currentById.get(row.id);

    if (!before) {
      added.push(row);
      continue;
    }

    const changes = columns
      .filter((column) => column !== 'id' && (row[column] ?? null) !== (before[column] ?? null))
      .map((column) => ({ column, from: before[column] ?? null, to: row[column] ?? null }));

    if (changes.length) changed.push({ row, before, changes });
  }

  return { added, changed, extra: current.filter((row) => !targetIds.has(row.id)) };
};

/**
 * What applying the seed to a database does, table by table: the rows to
 * insert or update, the rows to move aside first, and anything that stops it.
 */
const planApply = (seed, db) => {
  const target = toDatabase(seed);
  const errors = [];
  const plan = { errors };

  for (const table of TABLES) {
    const current = db[table.name];
    const diff = diffRows(target[table.name], current, table.columns);
    const extra = new Set(diff.extra);
    const moves = [];

    // A row only in the database still holds its slug and position, so the
    // file can't give them to another row.
    for (const column of UNIQUE_COLUMNS) {
      const heldByExtra = new Map(
        current.filter((row) => extra.has(row) && row[column] !== null).map((row) => [row[column], row]),
      );

      for (const row of [...diff.added, ...diff.changed.map((change) => change.row)]) {
        const holder = heldByExtra.get(row[column]);

        if (holder) {
          errors.push(
            `${table.label} ${row.slug}: its ${column} ${JSON.stringify(row[column])} is taken in the ` +
              `database by ${table.label} ${holder.slug} (id ${holder.id}), which isn't in the file. ` +
              `Give one of them another ${column}.`,
          );
        }
      }
    }

    // Rows whose slug or position changes move to values no row has, so that
    // rows trading places never collide on a unique constraint. The upsert
    // then gives them their final values. Both run in one transaction.
    const lowestPosition = Math.min(0, ...current.map((row) => row.position).filter(isInteger));

    diff.changed
      .filter(({ changes }) => changes.some(({ column, from }) => UNIQUE_COLUMNS.includes(column) && from !== null))
      .forEach(({ row, changes }, index) => {
        const set = {};

        for (const { column, from } of changes) {
          if (column === 'slug') set.slug = `course-seed-moving-${row.id}`;
          if (column === 'position' && from !== null) set.position = lowestPosition - 1 - index;
        }

        moves.push({ id: row.id, set });
      });

    plan[table.name] = { ...diff, moves, upserts: [...diff.added, ...diff.changed.map((change) => change.row)] };
  }

  return plan;
};

const countChanges = (plan) =>
  TABLES.reduce((total, table) => total + plan[table.name].added.length + plan[table.name].changed.length, 0);

/** One mutation, so Hasura runs it in one transaction: moves first, then upserts, categories before lessons. */
const buildMutation = (plan) => {
  const declarations = [];
  const fields = [];
  const variables = {};

  for (const table of TABLES) {
    const { moves, upserts } = plan[table.name];

    moves.forEach(({ id, set }, index) => {
      const name = `move_${table.name}_${index}`;

      declarations.push(`$${name}_id: uuid!`, `$${name}_set: ${table.name}_set_input!`);
      fields.push(`${name}: update_${table.name}_by_pk(pk_columns: {id: $${name}_id}, _set: $${name}_set) { id }`);
      variables[`${name}_id`] = id;
      variables[`${name}_set`] = set;
    });

    if (upserts.length) {
      const updateColumns = table.columns.filter((column) => column !== 'id');

      declarations.push(`$${table.name}: [${table.name}_insert_input!]!`);
      fields.push(
        `${table.name}: insert_${table.name}(objects: $${table.name}, on_conflict: ` +
          `{constraint: ${table.name}_pkey, update_columns: [${updateColumns.join(', ')}]}) { affected_rows }`,
      );
      variables[table.name] = upserts;
    }
  }

  return {
    query: `mutation CourseSeed(${declarations.join(', ')}) {\n  ${fields.join('\n  ')}\n}`,
    variables,
  };
};

// --- Hasura -------------------------------------------------------------------

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0']);

/**
 * Where to connect: the --env-file's values if given (and only those, so a
 * local secret is never sent to another server), otherwise the environment.
 */
const resolveConnection = ({ envFile, env = process.env } = {}) => {
  let values = env;

  if (envFile) {
    // eslint-disable-next-line global-require
    values = require('dotenv').parse(fs.readFileSync(envFile));
  }

  const raw = (values.HASURA_GRAPHQL_ENDPOINT || values.GRAPHQL_URL || DEFAULT_ENDPOINT).trim();
  const endpoint = raw.replace(/\/+$/, '').replace(/\/v1\/graphql$/, '');
  const adminSecret = values.HASURA_GRAPHQL_ADMIN_SECRET || values.HASURA_GRAPHQL_ADMIN_SECRET_PRODUCTION;
  let url;

  try {
    url = new URL(endpoint);
  } catch (error) {
    throw new Error(`HASURA_GRAPHQL_ENDPOINT isn't a URL: ${JSON.stringify(raw)}`);
  }

  if (!adminSecret) {
    throw new Error(
      `No admin secret for ${url.host}: set HASURA_GRAPHQL_ADMIN_SECRET${
        envFile ? ` in ${envFile}` : ', or pass --env-file <file>'
      }`,
    );
  }

  return { endpoint, adminSecret, host: url.host, isLocal: LOCAL_HOSTS.has(url.hostname) };
};

const request = async (connection, query, variables) => {
  let response;

  try {
    response = await fetch(`${connection.endpoint}/v1/graphql`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hasura-admin-secret': connection.adminSecret },
      body: JSON.stringify({ query, variables }),
    });
  } catch (error) {
    const reason = (error.cause && error.cause.code) || error.message;

    throw new Error(
      `Couldn't reach Hasura at ${connection.host} (${reason}). Is it running? See docs/README.md.`,
    );
  }

  const text = await response.text();
  let body;

  try {
    body = JSON.parse(text);
  } catch (error) {
    throw new Error(`Hasura at ${connection.host} answered ${response.status} with something other than JSON`);
  }

  if (body.errors) {
    const message = body.errors.map((error) => error.message).join('; ');
    const denied = body.errors.some((error) => error.extensions && error.extensions.code === 'access-denied');

    throw new Error(`Hasura at ${connection.host}: ${message}${denied ? '. Check the admin secret.' : ''}`);
  }

  return body.data;
};

const fetchRows = (connection) =>
  request(
    connection,
    `query CourseRows {
      categories { ${CATEGORY_COLUMNS.join(' ')} }
      lessons { ${LESSON_COLUMNS.join(' ')} }
    }`,
  );

// --- Output -------------------------------------------------------------------

const show = (value) => {
  const text = JSON.stringify(value);

  return text.length > 80 ? `${text.slice(0, 77)}..."` : text;
};

/** Lines describing a plan; `extraNote` says what happens to rows only in `current`. */
const describe = (plan, { targetName, currentName, extraNote, categorySlugs }) => {
  const lines = [];

  for (const table of TABLES) {
    const { added, changed, extra } = plan[table.name];
    const showValue = (column, value) =>
      column === 'categoryId' ? show(categorySlugs.get(value) ?? value) : show(value);
    const showColumn = (column) => (column === 'categoryId' ? 'category' : column);
    const total = added.length + changed.length;
    const counts = `${plan.targetCounts[table.name]} in ${targetName}, ${plan.currentCounts[table.name]} in ${currentName}`;

    lines.push(`${table.name} (${counts}): ${total ? `${total} to change` : 'no changes'}`);

    for (const row of added) lines.push(`  + ${row.slug}: new ${table.label}`);
    for (const { row, changes } of changed) {
      for (const { column, from, to } of changes) {
        lines.push(`  ~ ${row.slug}: ${showColumn(column)} ${showValue(column, from)} → ${showValue(column, to)}`);
      }
    }
    for (const row of extra) lines.push(`  ? ${row.slug}: ${extraNote}`);
  }

  return lines;
};

// --- Commands -----------------------------------------------------------------

const USAGE = `Usage: node scripts/course-seed.js <diff|apply|export> [--env-file <file>] [--yes]

  diff     Compare hasura/seeds/course.json with a database, changing nothing
  apply    Insert and update the database's rows to match the file
  export   Write the database's categories and lessons into the file

The database is the Hasura at HASURA_GRAPHQL_ENDPOINT (default ${DEFAULT_ENDPOINT})
with HASURA_GRAPHQL_ADMIN_SECRET, or the one in --env-file. Applying to a
database that isn't on this machine needs --yes.`;

const parseArgs = (argv) => {
  const options = { command: null, envFile: null, yes: false };
  const rest = [...argv];

  while (rest.length) {
    const arg = rest.shift();

    if (arg === '--yes') options.yes = true;
    else if (arg === '--env-file' && rest.length) options.envFile = rest.shift();
    else if (arg.startsWith('--env-file=')) options.envFile = arg.slice('--env-file='.length);
    else if (!options.command && !arg.startsWith('-')) options.command = arg;
    else throw new Error(`Unknown argument: ${arg}\n\n${USAGE}`);
  }

  if (!['diff', 'apply', 'export'].includes(options.command)) throw new Error(USAGE);

  return options;
};

/** Runs a command and resolves to the process exit code. */
const run = async (argv, { seedFile = SEED_FILE, env = process.env, log = console.log } = {}) => {
  const options = parseArgs(argv);
  const connection = resolveConnection({ envFile: options.envFile, env });
  const fileName = path.relative(process.cwd(), seedFile);

  if (options.command === 'export') {
    const db = await fetchRows(connection);
    const exported = fromDatabase(db);
    const text = serialize(exported);
    const previous = fs.existsSync(seedFile) ? fs.readFileSync(seedFile, 'utf8') : null;

    fs.writeFileSync(seedFile, text);
    log(
      previous === text
        ? `${fileName} already matches the database at ${connection.host}.`
        : `Wrote the database's ${exported.categories.length} categories and ${exported.lessons.length} lessons from ${connection.host} into ${fileName}. Review it with \`git diff\`.`,
    );

    const { errors, warnings } = validate(exported);

    for (const warning of warnings) log(`Note: ${warning}`);
    if (errors.length) {
      log(`\nThe database has values the file doesn't allow. Correct them in ${fileName}, then apply it:`);
      for (const error of errors) log(`  ${error}`);
    }

    return 0;
  }

  const seed = readSeed(seedFile);
  const { errors, warnings } = validate(seed);

  if (errors.length) {
    throw new Error(`${fileName} has problems, so nothing was compared or changed:\n  ${errors.join('\n  ')}`);
  }

  for (const warning of warnings) log(`Note: ${warning}`);

  const db = await fetchRows(connection);
  const plan = planApply(seed, db);
  const categorySlugs = new Map([...db.categories, ...seed.categories].map((row) => [row.id, row.slug]));

  plan.targetCounts = { categories: seed.categories.length, lessons: seed.lessons.length };
  plan.currentCounts = { categories: db.categories.length, lessons: db.lessons.length };

  log(`${fileName} compared with the database at ${connection.host}`);
  log("(+ only in the file, ~ the database's value → the file's, ? only in the database)\n");
  for (const line of describe(plan, {
    targetName: 'the file',
    currentName: 'the database',
    extraNote: 'in the database only, left as it is',
    categorySlugs,
  })) {
    log(line);
  }

  if (plan.errors.length) {
    throw new Error(`The file can't be applied as it is:\n  ${plan.errors.join('\n  ')}`);
  }

  const changes = countChanges(plan);

  if (!changes) {
    log('\nThe database matches the file.');
    return 0;
  }

  if (options.command === 'diff') {
    log(`\n${changes} ${changes === 1 ? 'row differs' : 'rows differ'}. \`apply\` would change them.`);
    return 1;
  }

  if (!connection.isLocal && !options.yes) {
    log(`\n${connection.host} isn't this machine. Check the changes above, then run again with --yes to apply them.`);
    return 1;
  }

  const { query, variables } = buildMutation(plan);

  await request(connection, query, variables);

  const after = planApply(seed, await fetchRows(connection));
  const remaining = countChanges(after);

  if (remaining) {
    throw new Error(`Applied, but ${remaining} ${remaining === 1 ? 'row still differs' : 'rows still differ'}. Run diff to see them.`);
  }

  const summary = TABLES.map(
    (table) =>
      `${table.name}: ${plan[table.name].added.length} added, ${plan[table.name].changed.length} updated`,
  ).join('; ');

  log(`\nApplied to ${connection.host} (${summary}). The database matches the file.`);
  return 0;
};

module.exports = {
  SEED_FILE,
  ACCESS_LEVELS,
  STATUSES,
  TYPES,
  DIFFICULTIES,
  validate,
  serialize,
  readSeed,
  toDatabase,
  fromDatabase,
  diffRows,
  planApply,
  buildMutation,
  resolveConnection,
  run,
};

if (require.main === module) {
  run(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(error.message);
      process.exit(2);
    },
  );
}
