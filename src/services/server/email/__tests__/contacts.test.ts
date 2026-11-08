/**
 * Marketing list subscription (Brevo/Sendinblue). The list ids are hardcoded, so
 * the tests pin the tag -> id mapping and the "also add to ALL_USERS" branch:
 * getting either wrong silently mails the wrong audience.
 */
jest.mock('utils/server/fetchJson', () => ({ __esModule: true, default: jest.fn() }));

import fetchJson from 'utils/server/fetchJson';
import { subscribeToList, ListTag, ListIds } from 'services/server/email/contacts';

const mockCreateContact = fetchJson as unknown as jest.Mock;

const ORIGINAL_ENV = process.env;

const createdContact = () => mockCreateContact.mock.calls[0][0].body;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, SENDINBLUE_API_KEY: 'sib-key' };
  mockCreateContact.mockReset();
  mockCreateContact.mockResolvedValue({ id: 1 });
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('subscribeToList', () => {
  it.each([
    [ListTag.AllUsers, 3],
    [ListTag.RegisteredUsers, 5],
    [ListTag.PayingUsers, 11],
  ])('subscribes %s to list %i', async (tag, expectedListId) => {
    await subscribeToList('user@example.com', tag);

    expect(ListIds[tag]).toBe(expectedListId);
    expect(createdContact().email).toBe('user@example.com');
    expect(createdContact().listIds).toEqual([expectedListId]);
  });

  it('adds the ALL_USERS list alongside the requested one when asked', async () => {
    await subscribeToList('user@example.com', ListTag.PayingUsers, true);

    expect(createdContact().listIds).toEqual([11, 3]);
  });

  it('does not duplicate ALL_USERS when that is already the requested list', async () => {
    await subscribeToList('user@example.com', ListTag.AllUsers, true);

    expect(createdContact().listIds).toEqual([3]);
  });

  it('never touches the API for a list tag it does not know', async () => {
    await expect(subscribeToList('user@example.com', '' as ListTag)).resolves.toBeUndefined();
    await expect(subscribeToList('user@example.com', 'VIPS' as ListTag)).resolves.toBeUndefined();
    await expect(
      subscribeToList('user@example.com', undefined as unknown as ListTag),
    ).resolves.toBeUndefined();

    // Falling through would create the contact with `listIds: [undefined]`.
    expect(mockCreateContact).not.toHaveBeenCalled();
  });

  it('upserts rather than failing on an address that is already a contact', async () => {
    await subscribeToList('user@example.com', ListTag.RegisteredUsers);

    // Signup runs this for addresses that may already exist on another list.
    expect(createdContact().updateEnabled).toBe(true);
  });

  /**
   * BUG: every subscribe sends `emailBlacklisted: false` / `smsBlacklisted: false`
   * together with `updateEnabled: true`, so re-registering (or buying again with)
   * an address that previously unsubscribed silently un-blacklists it and resumes
   * marketing email — a CAN-SPAM/GDPR problem, not just a UX one. The flags
   * should be left off the payload on update. Note the fix is not a one-line
   * deletion: the payload has to leave the flags off only when updating.
   *
   * Asserted in the safe direction and marked `.failing` so that dropping the
   * flags turns it green; remove `.failing` then.
   */
  it.failing('leaves an existing contact\'s unsubscribe flags untouched', async () => {
    await subscribeToList('unsubscribed@example.com', ListTag.PayingUsers);

    expect(createdContact().emailBlacklisted).toBeUndefined();
    expect(createdContact().smsBlacklisted).toBeUndefined();
  });

  it('rejects when the provider fails so the caller can report it', async () => {
    mockCreateContact.mockRejectedValue(new Error('brevo 400'));

    // Both call sites (the OAuth handlers and handleCompletedCheckout) wrap this
    // in try/catch + Sentry; swallowing it here would hide list-sync outages.
    await expect(subscribeToList('user@example.com', ListTag.PayingUsers)).rejects.toThrow(
      'brevo 400',
    );
  });

  it("posts the contact to Brevo's contacts API with SENDINBLUE_API_KEY, as its SDK did", async () => {
    await subscribeToList('user@example.com', ListTag.RegisteredUsers, true);

    expect(mockCreateContact).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.sendinblue.com/v3/contacts',
      headers: { 'api-key': 'sib-key', 'partner-key': 'sib-key' },
      body: {
        email: 'user@example.com',
        listIds: [5, 3],
        updateEnabled: true,
        emailBlacklisted: false,
        smsBlacklisted: false,
        attributes: {},
        smtpBlacklistSender: [],
      },
    });
  });
});
