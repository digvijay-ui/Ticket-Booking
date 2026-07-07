import { defineStore } from 'pinia';

import type { User } from '@/services/apiTypes';
import {
  adminLoginApi,
  adminSignupApi,
  getCurrentUserApi,
  loginApi,
  signupApi,
  type LoginPayload,
  type SignupPayload,
} from './auth.api';

interface AuthState {
  token: string | null;
  adminToken: string | null;
  user: User | null;
  adminUser: User | null;
  loading: boolean;
}

const USER_TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'adminToken';
const USER_KEY = 'user';
const ADMIN_USER_KEY = 'adminUser';

function readJson<T>(key: string): T | null {
  const value = localStorage.getItem(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem(USER_TOKEN_KEY),
    adminToken: localStorage.getItem(ADMIN_TOKEN_KEY),
    user: readJson<User>(USER_KEY),
    adminUser: readJson<User>(ADMIN_USER_KEY),
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isAdminAuthenticated: (state) => Boolean(state.adminToken),
    isAdmin: (state) => state.adminUser?.role === 'ADMIN' || state.user?.role === 'ADMIN',
  },
  actions: {
    setToken(token: string, user: User) {
      this.token = token;
      this.user = user;
      localStorage.setItem(USER_TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    setAdminToken(token: string, user: User) {
      this.adminToken = token;
      this.adminUser = user;
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    },
    loadFromStorage() {
      this.token = localStorage.getItem(USER_TOKEN_KEY);
      this.adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      this.user = readJson<User>(USER_KEY);
      this.adminUser = readJson<User>(ADMIN_USER_KEY);
    },
    async signup(payload: SignupPayload) {
      this.loading = true;
      try {
        const response = await signupApi(payload);
        const token = response.data.data.token;

        if (!token) {
          throw new Error('Token missing from signup response');
        }

        this.setToken(token, response.data.data.user);
        return response.data.data.user;
      } finally {
        this.loading = false;
      }
    },
    async login(payload: LoginPayload) {
      this.loading = true;
      try {
        const response = await loginApi(payload);
        const token = response.data.data.token;

        if (!token) {
          throw new Error('Token missing from login response');
        }

        this.setToken(token, response.data.data.user);
        return response.data.data.user;
      } finally {
        this.loading = false;
      }
    },
    async adminLogin(payload: LoginPayload) {
      this.loading = true;
      try {
        const response = await adminLoginApi(payload);
        const token = response.data.data.token;

        if (!token) {
          throw new Error('Token missing from admin login response');
        }

        this.setAdminToken(token, response.data.data.user);
        return response.data.data.user;
      } finally {
        this.loading = false;
      }
    },
    async adminSignup(payload: SignupPayload) {
      this.loading = true;
      try {
        const response = await adminSignupApi(payload);
        const token = response.data.data.token;

        if (!token) {
          throw new Error('Token missing from admin signup response');
        }

        this.setAdminToken(token, response.data.data.user);
        return response.data.data.user;
      } finally {
        this.loading = false;
      }
    },
    async fetchMe() {
      this.loading = true;
      try {
        const response = await getCurrentUserApi();
        this.user = response.data.data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
        return response.data.data.user;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    adminLogout() {
      this.adminToken = null;
      this.adminUser = null;
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    },
  },
});
