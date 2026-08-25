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
  page?: number;
  limit?: number;
}

export interface AdminTransactionFilters {
  type?: string;
  referenceType?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type AnalyticsRange = 'daily' | 'weekly' | 'monthly';

export interface AnalyticsSummary {
  totalRevenueInPaise: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  refundedBookings: number;
  refundedAmountInPaise: number;
  totalEvents: number;
  activeEvents: number;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  bookedSeats: number;
}

export interface ChartSeriesData {
  labels: string[];
  values: number[];
}

export interface BookingStatusAnalytics {
  confirmed: number;
  cancelled: number;
  refunded: number;
}

export interface SeatStatusAnalytics {
  available: number;
  reserved: number;
  booked: number;
}

export interface TopEventAnalytics {
  eventId: string;
  title: string;
  totalBookings: number;
  revenueInPaise: number;
  bookedSeats: number;
}

export interface WalletFlowAnalytics {
  creditInPaise: number;
  debitInPaise: number;
  refundInPaise: number;
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
  return api.post<ApiResponse<{ event: EventItem }>>(`/api/admin/events/${eventId}/cancel`, undefined, { headers: adminHeaders });
}

export function deleteEventApi(eventId: string) {
  return api.delete<ApiResponse<{ eventId: string; deletedBookings: number; deletedReservations: number; deletedSeats: number }>>(`/api/admin/events/${eventId}`, {
    headers: adminHeaders,
  });
}

export function getAdminEvents() {
  return api.get<ApiResponse<{ events: EventItem[] }>>('/api/admin/events', { headers: adminHeaders });
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
  return api.get<ApiResponse<{ bookings: Booking[]; pagination?: PaginationMeta }>>('/api/admin/bookings', {
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
  return api.get<ApiResponse<{ transactions: WalletTransaction[]; pagination?: PaginationMeta }>>('/api/admin/transactions', {
    headers: adminHeaders,
    params: cleanParams(filters),
  });
}

export const getAdminTransactionsApi = getAdminTransactions;

export function getAnalyticsSummaryApi() {
  return api.get<ApiResponse<AnalyticsSummary>>('/api/admin/analytics/summary', { headers: adminHeaders });
}

export function getRevenueAnalyticsApi(range: AnalyticsRange = 'daily') {
  return api.get<ApiResponse<ChartSeriesData>>('/api/admin/analytics/revenue', {
    headers: adminHeaders,
    params: { range },
  });
}

export function getBookingStatusAnalyticsApi() {
  return api.get<ApiResponse<BookingStatusAnalytics>>('/api/admin/analytics/booking-status', { headers: adminHeaders });
}

export function getSeatStatusAnalyticsApi() {
  return api.get<ApiResponse<SeatStatusAnalytics>>('/api/admin/analytics/seat-status', { headers: adminHeaders });
}

export function getTopEventsAnalyticsApi() {
  return api.get<ApiResponse<{ events: TopEventAnalytics[] }>>('/api/admin/analytics/top-events', { headers: adminHeaders });
}

export function getWalletFlowAnalyticsApi() {
  return api.get<ApiResponse<WalletFlowAnalytics>>('/api/admin/analytics/wallet-flow', { headers: adminHeaders });
}
