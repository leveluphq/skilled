/**
 * Every mutation wrapper in this directory is the same three lines: print a gql
 * document and hand it to the shared client with a variables object. The sweep
 * below walks the directory so a newly added wrapper is covered automatically,
 * and it pins the two things that silently break a wrapper:
 *
 *  1. the document must be a *printed string* — the client JSON-stringifies
 *     whatever it is given, so passing the gql DocumentNode straight through
 *     produces a request body with an object in the `query` field that Hasura
 *     rejects at runtime with no type error at build time;
 *  2. the variables must travel in the variables slot, never interpolated.
 *
 * The targeted tests after it cover the multi-root-field mutations on the
 * payment / entitlement path, where the shape of the document is the thing that
 * keeps money and access in sync.
 */
jest.mock('services/server/graphql/client', () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

import fs from 'fs';
import path from 'path';
import { parse, visit, Kind, OperationDefinitionNode } from 'graphql';
import client from 'services/server/graphql/client';
import insertUserFromGithub from 'services/server/graphql/mutations/insertUserFromGithub';
import insertUserFromFacebook from 'services/server/graphql/mutations/insertUserFromFacebook';
import insertUserFromGoogle from 'services/server/graphql/mutations/insertUserFromGoogle';
import updateUserGithubDetails from 'services/server/graphql/mutations/updateUserGithubDetails';
import updateUserGoogleDetails from 'services/server/graphql/mutations/updateUserGoogleDetails';
import updateUserFacebookDetails from 'services/server/graphql/mutations/updateUserFacebookDetails';
import updateUserFullCourseAccess from 'services/server/graphql/mutations/updateUserFullCourseAccess';
import redeemCourseAccessGiftCard from 'services/server/graphql/mutations/redeemCourseAccessGiftCard';
import updateCompletedSaleCourse from 'services/server/graphql/mutations/updateCompletedSaleCourse';
import insertUserFeedback from 'services/server/graphql/mutations/insertUserFeedback';
import setSubmissionToken from 'services/server/graphql/mutations/setSubmissionToken';

const request = (client as unknown as { request: jest.Mock }).request;

const MUTATIONS_DIR = path.resolve(__dirname, '..');
const MUTATION_FILES = fs.readdirSync(MUTATIONS_DIR).filter((file) => file.endsWith('.ts'));

const SENTINEL = 'sentinel-value-must-not-be-inlined';

/**
 * Column names inside an object-valued argument, e.g. the `_set` of an update or
 * the `objects` of an insert. Read off the AST rather than by slicing the
 * printed string, so a reordered/reformatted document cannot make the
 * allowlist assertions below silently stop looking at anything.
 */
const objectArgumentColumns = (document: string, rootField: string, argument: string): string[] => {
  const columns: string[] = [];

  visit(parse(document), {
    Field(node) {
      if (node.name.value !== rootField) {
        return;
      }

      const arg = node.arguments?.find((candidate) => candidate.name.value === argument);

      if (arg?.value.kind === Kind.OBJECT) {
        arg.value.fields.forEach((field) => columns.push(field.name.value));
      }
    },
  });

  return columns;
};

beforeEach(() => {
  request.mockReset();
  request.mockResolvedValue({});
});

describe('every mutation wrapper', () => {
  it('has at least the full directory under test', () => {
    // Guards the sweep itself: an empty/failed readdir would make every
    // describe.each below vacuously pass.
    expect(MUTATION_FILES.length).toBeGreaterThanOrEqual(23);
  });

  describe.each(MUTATION_FILES)('%s', (file) => {
    const operationName = file.replace(/\.ts$/, '');

    it('sends a printed mutation document and forwards its variables untouched', async () => {
      const mutate = require(path.join(MUTATIONS_DIR, file)).default as (
        variables: object,
      ) => Promise<unknown>;
      const variables = { sentinel: SENTINEL };

      await mutate(variables);

      expect(request).toHaveBeenCalledTimes(1);

      const [document, sentVariables] = request.mock.calls[0];

      expect(typeof document).toBe('string');
      expect(sentVariables).toBe(variables);
      expect(document).not.toContain(SENTINEL);

      const parsed = parse(document);
      const operations = parsed.definitions.filter(
        (definition): definition is OperationDefinitionNode =>
          definition.kind === 'OperationDefinition',
      );

      expect(operations).toHaveLength(1);
      expect(operations[0].operation).toBe('mutation');
      // A copy-pasted wrapper that kept the original document is the realistic
      // failure here (e.g. updateCompletedSaleGiftCard shipping the plain
      // updateCompletedSale document and never touching the gift card).
      expect(operations[0].name?.value).toBe(operationName);
    });
  });
});

describe('insertUserFromGithub / insertUserFromGoogle', () => {
  it.each([
    ['insertUserFromGithub', insertUserFromGithub],
    ['insertUserFromGoogle', insertUserFromGoogle],
  ])('%s returns the raw client response for the handler to unwrap', async (_name, insert) => {
    const response = { insert_users: { returning: [{ id: 'u1', role: 'user', email: 'a@b.c' }] } };
    request.mockResolvedValue(response);

    await expect(insert({} as any)).resolves.toBe(response);
  });

  it.each([
    ['insertUserFromGithub', insertUserFromGithub],
    ['insertUserFromGoogle', insertUserFromGoogle],
  ])('%s returns the id, role and email the session cookie is built from', async (_name, insert) => {
    await insert({} as any);

    const [document] = request.mock.calls[0];
    const returning = document.slice(document.indexOf('returning'));

    // The OAuth handlers read insert_users.returning[0] and pass it straight to
    // setAuthToken; a missing `role` there would mint a token with an undefined
    // Hasura role.
    expect(returning).toContain('id');
    expect(returning).toContain('role');
    expect(returning).toContain('email');
  });

  it('propagates an insert failure so the OAuth handler cannot continue with no user', async () => {
    request.mockRejectedValue(new Error('duplicate key value violates unique constraint'));

    await expect(insertUserFromGithub({} as any)).rejects.toThrow('duplicate key');
  });
});

/**
 * Every variable these four mutations receive is built from an OAuth provider
 * profile (`auth.result.info`), which is data the person logging in controls.
 * The explicit column lists in the documents are the allowlist that stops a
 * signup or an account re-link from touching privilege or entitlement columns —
 * the same account-takeover class commit 03382f36 fixed at the handler level.
 * If someone widens one of these lists, that protection is gone with no type
 * error, because the generated `*MutationVariables` types are derived from the
 * document itself.
 */
describe('OAuth user mutations', () => {
  const PRIVILEGED_COLUMNS = [
    'role',
    'fullCourseAccessEndsAt',
    'fullCourseAccessFirstUpgradedAt',
    'fullCourseAccessLatestUpgradedAt',
    'fullCourseAccessTerminatedAt',
    'affiliateId',
    'affiliateRevenueShare',
    'stripeCustomerId',
  ];

  it.each([
    ['insertUserFromGithub', insertUserFromGithub],
    ['insertUserFromGoogle', insertUserFromGoogle],
    ['insertUserFromFacebook', insertUserFromFacebook],
  ])('%s inserts no privileged column', async (_name, insert) => {
    await insert({} as any);

    const columns = objectArgumentColumns(request.mock.calls[0][0], 'insert_users', 'objects');

    // Sanity-check the extraction itself, so a rename cannot make the negative
    // assertions below vacuous.
    expect(columns).toContain('email');
    expect(columns).toContain('registrationSource');

    PRIVILEGED_COLUMNS.forEach((column) => expect(columns).not.toContain(column));
  });

  it.each([
    ['updateUserGithubDetails', updateUserGithubDetails, 'githubProfile'],
    ['updateUserGoogleDetails', updateUserGoogleDetails, 'googleProfile'],
    ['updateUserFacebookDetails', updateUserFacebookDetails, 'facebookProfile'],
  ])('%s re-links provider fields only, never the email or a privileged column', async (
    _name,
    update,
    profileColumn,
  ) => {
    await update({ id: 'user-1' } as any);

    const columns = objectArgumentColumns(request.mock.calls[0][0], 'update_users', '_set');

    expect(columns).toContain(profileColumn);
    // These run against an account that already exists and was matched by
    // email; letting the provider payload rewrite `email` would hand the
    // attacker the victim's address (and every future password-less login).
    expect(columns).not.toContain('email');

    PRIVILEGED_COLUMNS.forEach((column) => expect(columns).not.toContain(column));
  });

  it.each([
    ['updateUserGithubDetails', updateUserGithubDetails],
    ['updateUserGoogleDetails', updateUserGoogleDetails],
    ['updateUserFacebookDetails', updateUserFacebookDetails],
  ])('%s scopes its bulk update to a single id', async (_name, update) => {
    await update({ id: 'user-1' } as any);

    const [document] = request.mock.calls[0];

    // These use `update_users(where: ...)` rather than `_by_pk`. A loosened or
    // missing `where` would rewrite the provider details of every row in the
    // table in one request.
    expect(document).toMatch(/update_users\(where:\s*\{\s*id:\s*\{\s*_eq:\s*\$id\s*\}\s*\}/);
  });
});

describe('updateUserFullCourseAccess', () => {
  it('updates the access window and writes the audit log row in one document', async () => {
    await updateUserFullCourseAccess({ id: 'user-1' } as any);

    const [document] = request.mock.calls[0];

    // Hasura runs all root fields of a single mutation in one transaction, so
    // splitting these into two requests would let access be granted with no
    // upgrade_event_log row (or vice versa).
    expect(document).toContain('update_users_by_pk');
    expect(document).toContain('insert_upgrade_event_log_one');
  });

  it('attributes the audit row to the same user whose access it changes', async () => {
    await updateUserFullCourseAccess({ id: 'user-1' } as any);

    const [document] = request.mock.calls[0];

    expect(document).toMatch(/pk_columns:\s*\{\s*id:\s*\$id\s*\}/);
    expect(document).toMatch(/userId:\s*\$id/);
  });

  it('only ever writes the three fullCourseAccess columns', async () => {
    await updateUserFullCourseAccess({ id: 'user-1' } as any);

    const [document] = request.mock.calls[0];
    const setBlock = document.slice(document.indexOf('_set'), document.indexOf('insert_upgrade'));

    expect(setBlock).toContain('fullCourseAccessEndsAt');
    expect(setBlock).toContain('fullCourseAccessFirstUpgradedAt');
    expect(setBlock).toContain('fullCourseAccessLatestUpgradedAt');
    // An entitlement mutation must not be able to flip privilege columns.
    expect(setBlock).not.toContain('role');
    expect(setBlock).not.toContain('email');
  });
});

describe('redeemCourseAccessGiftCard', () => {
  it('grants access, burns the card and logs the upgrade atomically', async () => {
    await redeemCourseAccessGiftCard({ userId: 'user-1', giftCardId: 'gc-1' } as any);

    const [document] = request.mock.calls[0];

    // If the card update were a separate request, a failure between the two
    // would leave an ISSUED card that has already granted access — infinitely
    // redeemable.
    expect(document).toContain('update_users_by_pk');
    expect(document).toContain('update_gift_cards_by_pk');
    expect(document).toContain('insert_upgrade_event_log_one');
    expect(document).toMatch(/redeemerId:\s*\$userId/);
    expect(document).toMatch(/status:\s*\$giftCardStatus/);
    expect(document).toMatch(/redeemedAt:\s*\$redeemedAt/);
  });

  it('propagates a failure so the caller cannot report a successful redemption', async () => {
    request.mockRejectedValue(new Error('constraint violation'));

    await expect(
      redeemCourseAccessGiftCard({ userId: 'user-1', giftCardId: 'gc-1' } as any),
    ).rejects.toThrow('constraint violation');
  });
});

describe('updateCompletedSaleCourse', () => {
  it('marks the sale paid, extends access and logs the upgrade in one transaction', async () => {
    await updateCompletedSaleCourse({ saleId: 'sale-1', userId: 'user-1' } as any);

    const [document] = request.mock.calls[0];

    expect(document).toContain('update_sales_by_pk');
    expect(document).toContain('update_users_by_pk');
    expect(document).toContain('insert_upgrade_event_log_one');
    expect(document).toMatch(/pk_columns:\s*\{\s*id:\s*\$saleId\s*\}/);
    expect(document).toMatch(/pk_columns:\s*\{\s*id:\s*\$userId\s*\}/);
    // The webhook records what Stripe actually charged; losing this would let a
    // sale be marked paid with no amount.
    expect(document).toMatch(/amountPaid:\s*\$amountPaid/);
  });
});

describe('setSubmissionToken', () => {
  it('scopes the token write to a single submission by primary key', async () => {
    await setSubmissionToken({ id: 'submission-1', codeRunnerToken: 'judge0-token' } as any);

    const [document, variables] = request.mock.calls[0];

    // A `where` clause instead of pk_columns here could stamp one Judge0 token
    // across multiple submissions.
    expect(document).toContain('update_code_submissions_by_pk');
    expect(document).toMatch(/pk_columns:\s*\{\s*id:\s*\$id\s*\}/);
    expect(document).not.toContain('judge0-token');
    expect(variables).toEqual({ id: 'submission-1', codeRunnerToken: 'judge0-token' });
  });
});

describe('insertUserFeedback', () => {
  it('reuses one printed document across calls', async () => {
    await insertUserFeedback({ feedback: 'hi', ip: '1.2.3.4', url: '/x' } as any);
    await insertUserFeedback({ feedback: 'again', ip: '1.2.3.4', url: '/x' } as any);

    // This wrapper prints at module scope rather than per call; the two calls
    // must still send the identical document.
    expect(request.mock.calls[0][0]).toBe(request.mock.calls[1][0]);
    expect(request.mock.calls[0][0]).not.toContain('hi');
  });
});
