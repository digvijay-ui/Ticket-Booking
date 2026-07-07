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

export interface BulkCreateSeatsPayload {
  rows: string[];
  seatsPerRow: number;
  priceInPaise: number;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
}

export interface AdminBookingFilters {
  status?: string;
  paymentStatus?: string;
  eventId?: string;
  userId?: string;
}

export interface AdminTransactionFilters {
  type?: string;
  referenceType?: string;
  userId?: string;
}

export function createAdminUser(payload: CreateAdminPayload) {
  return api.post<ApiResponse<{ user: User }>>('/api/auth/admin/users/admins', payload, { headers: adminHeaders });
}

export function createAdminEvent(payload: EventFormPayload) {
  return api.post<ApiResponse<{ event: EventItem }>>('/api/admin/events', payload, { headers: adminHeaders });
}

export const createEventApi = createAdminEvent;

export function updateAdminEvent(eventId: string, payload: Partial<EventFormPayload>) {
  return api.patch<ApiResponse<{ event: EventItem }>>(`/api/admin/events/${eventId}`, payload, { headers: adminHeaders });
}

export const updateEventApi = updateAdminEvent;

export function cancelEventApi(eventId: string) {
  return api.delete<ApiResponse<{ event: EventItem }>>(`/api/admin/events/${eventId}`, { headers: adminHeaders });
}

export function getAdminEvents() {
  return api.get<ApiResponse<{ events: EventItem[] }>>('/api/events', { headers: adminHeaders });
}

export const getAdminEventsApi = getAdminEvents;

export function getAdminEventSeats(eventId: string) {
  return api.get<ApiResponse<{ seats: Seat[] }>>(`/api/admin/events/${eventId}/seats`, { headers: adminHeaders });
}

export const getAdminEventSeatsApi = getAdminEventSeats;

export function bulkCreateSeatsApi(eventId: string, payload: BulkCreateSeatsPayload) {
  return api.post<ApiResponse<{ createdCount: number }>>(`/api/admin/events/${eventId}/seats/bulk`, payload, { headers: adminHeaders });
}

function cleanParams<T extends object>(filters: T) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''));
}

export function getAdminBookings(filters: AdminBookingFilters = {}) {
  return api.get<ApiResponse<{ bookings: Booking[] }>>('/api/admin/bookings', {
    headers: adminHeaders,
    params: cleanParams(filters),
  });
}

export const getAdminBookingsApi = getAdminBookings;

export function cancelBookingApi(bookingId: string) {
  return api.post<ApiResponse<{ booking: Booking }>>(`/api/admin/bookings/${bookingId}/cancel`, undefined, { headers: adminHeaders });
}

export function refundBookingApi(bookingId: string) {
  return api.post<ApiResponse<{ booking: Booking }>>(`/api/admin/bookings/${bookingId}/refund`, undefined, { headers: adminHeaders });
}

export function getAdminTransactions(filters: AdminTransactionFilters = {}) {
  return api.get<ApiResponse<{ transactions: WalletTransaction[] }>>('/api/admin/transactions', {
    headers: adminHeaders,
    params: cleanParams(filters),
  });
}

export const getAdminTransactionsApi = getAdminTransactions;
