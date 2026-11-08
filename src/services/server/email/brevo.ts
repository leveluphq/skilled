import fetchJson from 'utils/server/fetchJson';

// The host Brevo's old SDK (sib-api-v3-typescript) used; Brevo was Sendinblue.
const BASE_URL = 'https://api.sendinblue.com/v3';

/**
 * POST to Brevo's API as its old SDK did: JSON, with SENDINBLUE_API_KEY as both
 * `api-key` and `partner-key`. A failure rejects with fetchJson's HttpError,
 * which, unlike the SDK's rejection, doesn't carry the request and its key.
 */
const postToBrevo = <T = unknown>(path: string, body: object) => {
  return fetchJson<T>({
    method: 'POST',
    url: `${BASE_URL}${path}`,
    headers: {
      'api-key': process.env.SENDINBLUE_API_KEY!,
      'partner-key': process.env.SENDINBLUE_API_KEY!,
    },
    body,
  });
};

export default postToBrevo;
