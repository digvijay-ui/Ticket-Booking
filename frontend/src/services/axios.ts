import axios from 'axios';

const USER_TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'adminToken';
const USER_KEY = 'user';
const ADMIN_USER_KEY = 'adminUser';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const requestUrl = config.url ?? '';
  const isCurrentAdminRoute = window.location.pathname.startsWith('/admin');
  const isAdminRequest =
    requestUrl.startsWith('/api/admin') ||
    requestUrl.includes('/admin-login') ||
    config.headers?.['X-Admin-Route'] === 'true' ||
    isCurrentAdminRoute;
  const tokenKey = isAdminRequest ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY;
  const token = localStorage.getItem(tokenKey);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = error.config?.url ?? '';
    const currentPath = window.location.pathname;
    const isAdminRequest =
      requestUrl.startsWith('/api/admin') ||
      requestUrl.includes('/admin-login') ||
      currentPath.startsWith('/admin') ||
      error.config?.headers?.['X-Admin-Route'] === 'true';

    if (isAdminRequest) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);

      if (currentPath !== '/admin/login') {
        window.location.assign('/admin/login');
      }
    } else {
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default api;
