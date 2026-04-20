import axios from 'axios';

/**
 * Shared Axios instance for all API calls from your pages
 * (Pledges, Escrow, Transactions, etc.)
 *
 * baseURL is '/api' — the Vite dev proxy forwards this to http://localhost:8080.
 * In production, configure your reverse-proxy (nginx / backend) to serve /api/* accordingly.
 * Override at build time via VITE_API_BASE_URL if needed.
 */
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT from localStorage to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
