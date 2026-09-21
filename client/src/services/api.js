import axios from 'axios';

const TOKEN_KEY = 'taskcollab_token';

/** "Remember me" keeps the token in localStorage; otherwise it lives only for the browser session. */
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY),
  set(token, remember = true) {
    this.clear();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

/** Every failed request is turned into one of these, so UI code never digs through axios internals. */
export class ApiError extends Error {
  constructor({ status = 0, message, isNetwork = false, details }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetwork = isNetwork;
    this.details = details;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isCancel(err)) return Promise.reject(err);
    if (!err.response) {
      return Promise.reject(new ApiError({ isNetwork: true, message: "Can't reach the TaskCollab server. Check your connection and try again." }));
    }
    const { status, data } = err.response;
    const url = err.config?.url || '';
    // An expired session anywhere except the login/register calls signs the user out.
    if (status === 401 && !url.startsWith('/auth/login') && !url.startsWith('/auth/register') && tokenStore.get()) {
      tokenStore.clear();
      window.dispatchEvent(new Event('taskcollab:session-expired'));
    }
    return Promise.reject(new ApiError({ status, message: data?.message || 'Something went wrong. Try again.', details: data?.details }));
  }
);

export default api;
