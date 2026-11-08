import postToBrevo from './brevo';

export enum ListTag {
  AllUsers = 'ALL_USERS',
  RegisteredUsers = 'REGISTERED_USERS',
  PayingUsers = 'PAYING_USERS',
}

export const ListIds = {
  [ListTag.AllUsers]: 3,
  [ListTag.RegisteredUsers]: 5,
  [ListTag.PayingUsers]: 11,
};

export const subscribeToList = async (
  email: string,
  listId: ListTag,
  includeAllUsers: boolean = false,
) => {
  if (!listId || !ListIds[listId]) {
    return;
  }

  const listIds = [ListIds[listId]];

  if (includeAllUsers && listId !== ListTag.AllUsers) {
    listIds.push(ListIds[ListTag.AllUsers]);
  }

  await postToBrevo('/contacts', {
    email: email,
    listIds,
    updateEnabled: true,
    emailBlacklisted: false,
    smsBlacklisted: false,
    attributes: {},
    smtpBlacklistSender: [],
  });

  return;
};
