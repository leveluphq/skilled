import postToBrevo from './brevo';

export enum TemplateTag {
  AccountCreate = 'ACCOUNT_CREATE',
  FeedbackReceived = 'FEEDBACK_RECEIVED',
  CheckoutSessionCreated = 'CHECKOUT_SESSION_CREATED',
  CheckoutComplete = 'CHECKOUT_COMPLETE',
}

export const TemplateIds = {
  [TemplateTag.AccountCreate]: 31,
  [TemplateTag.FeedbackReceived]: 32,
  [TemplateTag.CheckoutSessionCreated]: 33,
  [TemplateTag.CheckoutComplete]: 34,
};

export const sendTransactionalEmailFromTemplate = async (
  email: string,
  templateId: TemplateTag,
  params?: object,
) => {
  return postToBrevo('/smtp/email', {
    to: [{ email, name: email }],
    templateId: TemplateIds[templateId],
    params,
  });
};
