import ApiService from 'services/server/ApiService';

const API_HOST = 'judge0-ce.p.rapidapi.com';
const API_URL = `https://${API_HOST}`;

const api = new ApiService({
  baseUrl: API_URL,
  headers: {
    'x-rapidapi-key': process.env.JUDGE0_API_KEY,
    'x-rapidapi-host': API_HOST,
  },
});

export default api;
