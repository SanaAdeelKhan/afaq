const isDev = import.meta.env.DEV;
export const PROXY_URL = isDev
  ? 'http://localhost:3001'
  : 'https://afaq-nrx6.onrender.com';
