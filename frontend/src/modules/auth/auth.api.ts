import api from '@/services/axios';
import type { ApiResponse, User } from '@/services/apiTypes';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export function signupApi(payload: SignupPayload) {
  return api.post<ApiResponse<AuthResponse>>('/api/auth/signup', payload);
}

export function loginApi(payload: LoginPayload) {
  return api.post<ApiResponse<AuthResponse>>('/api/auth/login', payload);
}

export function adminLoginApi(payload: LoginPayload) {
  return api.post<ApiResponse<AuthResponse>>('/api/auth/admin-login', payload, {
    headers: { 'X-Admin-Route': 'true' },
  });
}

export function adminSignupApi(payload: SignupPayload) {
  return api.post<ApiResponse<AuthResponse>>('/api/auth/admin-signup', payload, {
    headers: { 'X-Admin-Route': 'true' },
  });
}

export function getCurrentUserApi() {
  return api.get<ApiResponse<AuthResponse>>('/api/auth/me');
}
