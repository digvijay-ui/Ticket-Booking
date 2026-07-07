import api from '@/services/axios';
import type { ApiResponse, Booking, EventItem, Seat, User, WalletTransaction } from '@/services/apiTypes';

const adminHeaders = { 'X-Admin-Route': 'true' };

export interface EventFormPayload {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  seatPriceInPaise: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
}

export function createAdminUser(payload: CreateAdminPayload) {
  return api.post<ApiResponse<{ user: User }>>('/api/auth/admin/users/admins', payload, { headers: adminHeaders });
}

export function createAdminEvent(payload: EventFormPayload) {
  return api.post<ApiResponse<{ event: EventItem }>>('/api/admin/events', payload, { headers: adminHeaders });
}

export function updateAdminEvent(eventId: string, payload: Partial<EventFormPayload>) {
  return api.patch<ApiResponse<{ event: EventItem }>>(`/api/admin/events/${eventId}`, payload, { headers: adminHeaders });
}

export function getAdminEvents() {
  return api.get<ApiResponse<{ events: EventItem[] }>>('/api/events', { headers: adminHeaders });
}

export function getAdminEventSeats(eventId: string) {
  return api.get<ApiResponse<{ seats: Seat[] }>>(`/api/admin/events/${eventId}/seats`, { headers: adminHeaders });
}

export function getAdminBookings() {
  return api.get<ApiResponse<{ bookings: Booking[] }>>('/api/admin/bookings', { headers: adminHeaders });
}

export function getAdminTransactions() {
  return api.get<ApiResponse<{ transactions: WalletTransaction[] }>>('/api/admin/transactions', { headers: adminHeaders });
}
