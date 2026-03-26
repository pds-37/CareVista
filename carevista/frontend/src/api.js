import axios from 'axios';

const configuredBaseUrl = process.env.REACT_APP_API_URL?.trim().replace(/\/+$/, '');
const baseURL = configuredBaseUrl
  ? configuredBaseUrl.endsWith('/api')
    ? configuredBaseUrl
    : `${configuredBaseUrl}/api`
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
