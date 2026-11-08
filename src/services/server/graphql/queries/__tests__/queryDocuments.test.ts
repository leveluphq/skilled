/**
 * Directory-wide sweep over the query wrappers, mirroring the one in
 * mutations/__tests__. It pins the two properties that are invisible at compile
 * time: the document reaching the client must be a printed *string* (a raw
 * gql DocumentNode is silently JSON-stringified into the request body and only
 * fails against a live Hasura), and caller input must travel in the variables
 * slot rather than being baked into the document.
 */
jest.mock('services/server/graphql/client', () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

jest.mock('utils/server/jwt', () => ({
  __esModule: true,
  getValidViewerId: jest.fn(() => 'viewer-from-jwt'),
}));

import fs from 'fs';
import path from 'path';
import { parse, visit, OperationDefinitionNode } from 'graphql';
import client from 'services/server/graphql/client';

const request = (client as unknown as { request: jest.Mock }).request;

const QUERIES_DIR = path.resolve(__dirname, '..');
const QUERY_FILES = fs.readdirSync(QUERIES_DIR).filter((file) => file.endsWith('.ts'));

const SENTINEL = 'sentinel-value-must-not-be-inlined';

/**
 * Wrappers whose argument is not a plain string. Everything else takes a single
 * string that ends up as a GraphQL variable.
 */
const ARGUMENT_BY_FILE: Record<string, unknown> = {
  'getActiveProducts.ts': undefined,
  'getAffiliateUserAndClick.ts': { affiliateId: SENTINEL, clickId: SENTINEL },
  'getLessonVideoIdById.ts': { query: { id: SENTINEL } },
  'getViewerById.ts': { query: { id: SENTINEL } },
};

// Files whose GraphQL operation is deliberately named differently from the file.
// (getActiveProductById.ts used to send `getActiveProducts`, which also stopped
// server codegen running.)
const KNOWN_OPERATION_NAME_MISMATCHES: Record<string, string> = {};

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue({
    products: [],
    users: [],
    lessons: [],
    gift_cards: [],
    sales: [],
    code_submissions: [],
    lessons_by_pk: null,
    users_by_pk: null,
    affiliate_link_clicks_by_pk: null,
  });
});

describe('every query wrapper', () => {
  it('has the full directory under test', () => {
    // Without this, a failed readdir would make the sweep vacuously pass.
    expect(QUERY_FILES.length).toBeGreaterThanOrEqual(14);
  });

  describe.each(QUERY_FILES)('%s', (file) => {
    const expectedOperationName =
      KNOWN_OPERATION_NAME_MISMATCHES[file] ?? file.replace(/\.ts$/, '');

    it('sends a printed query document with caller input kept out of it', async () => {
      const query = require(path.join(QUERIES_DIR, file)).default as (
        arg?: unknown,
      ) => Promise<unknown>;
      const argument = file in ARGUMENT_BY_FILE ? ARGUMENT_BY_FILE[file] : SENTINEL;

      await query(argument);

      expect(request).toHaveBeenCalledTimes(1);

      const [document] = request.mock.calls[0];

      expect(typeof document).toBe('string');
      expect(document).not.toContain(SENTINEL);

      const operations = parse(document).definitions.filter(
        (definition): definition is OperationDefinitionNode =>
          definition.kind === 'OperationDefinition',
      );

      expect(operations).toHaveLength(1);
      // A wrapper in queries/ must never send a mutation.
      expect(operations[0].operation).toBe('query');
      expect(operations[0].name?.value).toBe(expectedOperationName);
    });

    /**
     * The users table stores the OAuth credentials we hold on a person's behalf
     * — githubAccessToken, googleAccessToken/RefreshToken/IdToken,
     * facebookAccessToken. Nothing on the read path has any business selecting
     * them: the rows these wrappers return are handed to API responses, to
     * Sentry breadcrumbs, and (via getViewerById) into page props, which is
     * exactly how the JWT leaked into __NEXT_DATA__ before commit 03382f36.
     * Adding one of these to a selection set is a one-word change with no type
     * error, so it gets a test.
     */
    it('selects no stored OAuth credential', async () => {
      const query = require(path.join(QUERIES_DIR, file)).default as (
        arg?: unknown,
      ) => Promise<unknown>;
      const argument = file in ARGUMENT_BY_FILE ? ARGUMENT_BY_FILE[file] : SENTINEL;

      await query(argument);

      const [document] = request.mock.calls[0];
      const selected: string[] = [];

      visit(parse(document), {
        Field(node) {
          selected.push(node.name.value);
        },
      });

      // Guards the walk itself: every one of these documents selects something.
      expect(selected.length).toBeGreaterThan(0);

      const credentials = selected.filter((name) =>
        /(accessToken|refreshToken|idToken|clientSecret|password)/i.test(name),
      );

      expect(credentials).toEqual([]);
    });
  });
});
