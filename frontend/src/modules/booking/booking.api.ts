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

export function confirmBooking(payload: ConfirmBookingPayload) {
  return api.post<ApiResponse<{ booking: Booking }>>('/api/bookings/confirm', payload);
}

export function getMyBookings() {
  return api.get<ApiResponse<{ bookings: Booking[] }>>('/api/bookings/my-bookings');
}
