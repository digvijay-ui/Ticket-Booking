import api from '@/services/axios';
import type { ApiResponse, Booking, Reservation } from '@/services/apiTypes';

export interface ReserveSeatsPayload {
  eventId: string;
  seatIds: string[];
}

export interface ConfirmBookingPayload {
  reservationId: string;
  idempotencyKey: string;
}

export function reserveSeats(payload: ReserveSeatsPayload) {
  return api.post<ApiResponse<{ reservation: Reservation }>>('/api/bookings/reserve', payload);
}

export function confirmBookingApi(payload: ConfirmBookingPayload) {
  return api.post<ApiResponse<{ booking: Booking }>>('/api/bookings/confirm', payload);
}

export const confirmBooking = confirmBookingApi;

export function getMyBookingsApi() {
  return api.get<ApiResponse<{ bookings: Booking[] }>>('/api/bookings/my-bookings');
}

export const getMyBookings = getMyBookingsApi;
