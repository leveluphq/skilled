import fetchJson from 'utils/server/fetchJson';
import { GithubEmail } from 'utils/constants/github';

const getGithubEmails = (accessToken: string) => {
  return fetchJson<GithubEmail[]>({
    method: 'GET',
    url: 'https://api.github.com/user/emails',
    headers: {
      Authorization: `token ${accessToken}`,
      'User-Agent': 'Skilled-dev',
    },
  });
};

export default getGithubEmails;
