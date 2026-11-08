/**
 * Transactional email (Brevo/Sendinblue). What matters here is that the right
 * template goes to the right address — a swapped id sends a purchase receipt to
 * someone who just signed up — and that callers can see a send failure, because
 * several call sites wrap this in try/catch on the assumption that it throws.
 */
jest.mock('utils/server/fetchJson', () => ({ __esModule: true, default: jest.fn() }));

import fetchJson from 'utils/server/fetchJson';
import {
  sendTransactionalEmailFromTemplate,
  TemplateTag,
  TemplateIds,
} from 'services/server/email/transactional';

const mockSendTransacEmail = fetchJson as unknown as jest.Mock;

const ORIGINAL_ENV = process.env;

const sentEmail = () => mockSendTransacEmail.mock.calls[0][0].body;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, SENDINBLUE_API_KEY: 'sib-key' };
  mockSendTransacEmail.mockReset();
  mockSendTransacEmail.mockResolvedValue({ messageId: 'msg-1' });
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('sendTransactionalEmailFromTemplate', () => {
  it.each([
    [TemplateTag.AccountCreate, 31],
    [TemplateTag.FeedbackReceived, 32],
    [TemplateTag.CheckoutSessionCreated, 33],
    [TemplateTag.CheckoutComplete, 34],
  ])('sends %s as Brevo template %i', async (tag, expectedTemplateId) => {
    await sendTransactionalEmailFromTemplate('buyer@example.com', tag);

    expect(TemplateIds[tag]).toBe(expectedTemplateId);
    expect(mockSendTransacEmail).toHaveBeenCalledTimes(1);
    expect(sentEmail().templateId).toBe(expectedTemplateId);
  });

  it('addresses only the requested recipient', async () => {
    await sendTransactionalEmailFromTemplate('buyer@example.com', TemplateTag.CheckoutComplete, {
      saleId: 'sale-1',
    });

    const email = sentEmail();

    expect(email.to).toEqual([{ email: 'buyer@example.com', name: 'buyer@example.com' }]);
    expect(email.params).toEqual({ saleId: 'sale-1' });
  });

  it('leaves params undefined when the caller passes none', async () => {
    await sendTransactionalEmailFromTemplate('new@example.com', TemplateTag.AccountCreate);

    expect(sentEmail().params).toBeUndefined();
  });

  it("posts to Brevo's transactional email API with SENDINBLUE_API_KEY, as its SDK did", async () => {
    await sendTransactionalEmailFromTemplate('a@example.com', TemplateTag.FeedbackReceived, {
      feedback: 'Nice',
    });

    expect(mockSendTransacEmail).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://api.sendinblue.com/v3/smtp/email',
      headers: { 'api-key': 'sib-key', 'partner-key': 'sib-key' },
      body: {
        to: [{ email: 'a@example.com', name: 'a@example.com' }],
        templateId: 32,
        params: { feedback: 'Nice' },
      },
    });
  });

  it('rejects when the transport fails instead of swallowing it', async () => {
    mockSendTransacEmail.mockRejectedValue(new Error('brevo 401'));

    // Callers depend on this: the OAuth handlers wrap the call in try/catch and
    // report to Sentry. src/services/server/stripe/handleCompletedCheckout.ts
    // does NOT await it, so this rejection escapes its try/catch as an
    // unhandled promise rejection.
    await expect(
      sendTransactionalEmailFromTemplate('buyer@example.com', TemplateTag.CheckoutComplete),
    ).rejects.toThrow('brevo 401');
  });

  it('returns the transport response to the caller', async () => {
    const response = { messageId: 'msg-42' };
    mockSendTransacEmail.mockResolvedValue(response);

    await expect(
      sendTransactionalEmailFromTemplate('a@example.com', TemplateTag.AccountCreate),
    ).resolves.toBe(response);
  });

  /**
   * BUG: an unrecognised tag maps to `undefined` and the send is still
   * attempted with `templateId: undefined`, so the failure surfaces as an opaque
   * Brevo API error (or a blank email) instead of a local validation error. The
   * sibling subscribeToList() guards its id lookup and returns early; this
   * should too. Asserted in the safe direction and marked `.failing`, so adding
   * the guard turns it green rather than looking like a regression.
   */
  it.failing('does not attempt a send for a tag with no template id', async () => {
    await sendTransactionalEmailFromTemplate('a@example.com', 'NOT_A_TEMPLATE' as TemplateTag);

    expect(mockSendTransacEmail).not.toHaveBeenCalled();
  });
});
