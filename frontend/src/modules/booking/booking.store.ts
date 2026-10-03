import { defineStore } from 'pinia';

import type { Booking, EventItem, Reservation, Seat } from '@/services/apiTypes';
import { createIdempotencyKey } from '@/utils/idempotency';
import { getBookingFailure, type BookingFailure } from '@/utils/userFacingError';
import { useAuthStore } from '@/modules/auth/auth.store';
import { confirmBookingApi, getMyBookingsApi, reserveSeats as reserveSeatsApi } from './booking.api';

export interface StoredReservationData { reservation: Reservation; event: EventItem | null; seats: Seat[]; userId?: string; }
interface StoredBookingData { booking: Booking; reservation: StoredReservationData | null; }
interface BookingState {
  reservation: StoredReservationData | null;
  booking: Booking | null;
  bookings: Booking[];
  confirming: boolean;
  reserving: boolean;
  reservationError: string;
  error: string;
  confirmationFailure: BookingFailure | null;
  bookingLoading: boolean;
  bookingsLoading: boolean;
  bookingsError: string;
}

const reservationStorageKey = (id: string) => `reservation:${id}`;
const bookingStorageKey = (id: string) => `booking:${id}`;
const confirmationKeyStorageKey = (id: string) => `confirmation-key:${id}`;
let bookingsRequestId = 0;
let bookingDetailRequestId = 0;

export function listStoredReservations(userId: string): StoredReservationData[] {
  const reservations: StoredReservationData[] = [];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (!key?.startsWith('reservation:')) continue;
    const data = readJson<StoredReservationData>(key);
    if (data?.userId !== userId || !data.reservation?.id || !Number.isFinite(Date.parse(data.reservation.expiresAt)) || !Array.isArray(data.seats)) continue;
    if (data.reservation.status === 'ACTIVE' || data.reservation.status === 'EXPIRED') reservations.push(data);
  }
  return reservations.sort((a, b) => Date.parse(b.reservation.expiresAt) - Date.parse(a.reservation.expiresAt));
}

function readJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function stableConfirmationKey(reservationId: string) {
  const storageKey = confirmationKeyStorageKey(reservationId);
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const created = createIdempotencyKey('confirm-booking');
  sessionStorage.setItem(storageKey, created);
  return created;
}

export const useBookingStore = defineStore('booking', {
  state: (): BookingState => ({
    reservation: null, booking: null, bookings: [], confirming: false, reserving: false,
    reservationError: '', error: '', confirmationFailure: null, bookingLoading: false,
    bookingsLoading: false, bookingsError: '',
  }),
  actions: {
    setReservation(reservation: StoredReservationData | null) { this.reservation = reservation; },
    loadReservation(reservationId: string) { const stored = readJson<StoredReservationData>(reservationStorageKey(reservationId)); this.reservation = stored; return stored; },
    loadBooking(bookingId: string) {
      const stored = readJson<StoredBookingData>(bookingStorageKey(bookingId));
      if (!stored) return null;
      this.booking = stored.booking; this.reservation = stored.reservation; return stored;
    },
    markReservationExpired(reservationId: string) {
      if (!this.reservation || this.reservation.reservation.id !== reservationId) return;
      this.reservation = { ...this.reservation, reservation: { ...this.reservation.reservation, status: 'EXPIRED' } };
      sessionStorage.setItem(reservationStorageKey(reservationId), JSON.stringify(this.reservation));
    },
    async reserveSeats(eventId: string, seats: Seat[], event: EventItem | null) {
      if (this.reserving) return null;
      this.reserving = true; this.reservationError = '';
      try {
        const response = await reserveSeatsApi({ eventId, seatIds: seats.map((seat) => seat.id) });
        const data: StoredReservationData = { reservation: response.data.data.reservation, event, seats, userId: useAuthStore().user?.id };
        this.setReservation(data);
        sessionStorage.setItem(reservationStorageKey(data.reservation.id), JSON.stringify(data));
        return data.reservation;
      } catch (error) {
        const failure = getBookingFailure(error);
        this.reservationError = failure.kind === 'conflict' ? 'Some selected seats were just taken. We refreshed the map so you can review the remaining seats.' : failure.message;
        throw error;
      } finally { this.reserving = false; }
    },
    async confirmBooking(reservationId: string) {
      if (this.confirming) return null;
      this.confirming = true; this.error = ''; this.confirmationFailure = null;
      try {
        const response = await confirmBookingApi({ reservationId, idempotencyKey: stableConfirmationKey(reservationId) });
        const booking = response.data.data.booking;
        this.booking = booking;
        if (this.reservation?.reservation.id === reservationId) {
          this.reservation = {
            ...this.reservation,
            reservation: { ...this.reservation.reservation, status: 'CONFIRMED' },
          };
        }
        sessionStorage.setItem(bookingStorageKey(booking.id), JSON.stringify({ booking, reservation: this.reservation }));
        sessionStorage.removeItem(reservationStorageKey(reservationId));
        return booking;
      } catch (error) {
        const failure = getBookingFailure(error);

        if (failure.kind === 'confirmed' || failure.kind === 'expired') {
          try {
            const latestBookings = await this.fetchMyBookings();
            const confirmed = latestBookings.find((booking) => booking.reservationId === reservationId && booking.status === 'CONFIRMED');
            if (confirmed) {
              this.booking = confirmed;
              if (this.reservation?.reservation.id === reservationId) {
                this.reservation = {
                  ...this.reservation,
                  reservation: { ...this.reservation.reservation, status: 'CONFIRMED' },
                };
              }
              this.confirmationFailure = 'confirmed';
              this.error = '';
              sessionStorage.setItem(bookingStorageKey(confirmed.id), JSON.stringify({ booking: confirmed, reservation: this.reservation }));
              sessionStorage.removeItem(reservationStorageKey(reservationId));
              return confirmed;
            }
          } catch {
            // Preserve the original, safely mapped confirmation error.
          }
        }

        this.confirmationFailure = failure.kind;
        this.error = failure.message;
        throw error;
      } finally { this.confirming = false; }
    },
    async fetchMyBookings() {
      const requestId = ++bookingsRequestId;
      this.bookingsLoading = true; this.bookingsError = '';
      try { const response = await getMyBookingsApi(); if (requestId === bookingsRequestId) this.bookings = response.data.data.bookings; return response.data.data.bookings; }
      catch { if (requestId === bookingsRequestId) this.bookingsError = 'We could not load your bookings. Please try again.'; throw new Error('We could not load your bookings. Please try again.'); }
      finally { if (requestId === bookingsRequestId) this.bookingsLoading = false; }
    },
    async fetchBookingById(bookingId: string) {
      const requestId = ++bookingsRequestId;
      const detailRequestId = ++bookingDetailRequestId;
      this.bookingLoading = true; this.bookingsError = '';
      try {
        const response = await getMyBookingsApi();
        if (requestId === bookingsRequestId) this.bookings = response.data.data.bookings;
        const found = response.data.data.bookings.find((booking) => booking.id === bookingId) ?? null;
        if (requestId === bookingsRequestId && detailRequestId === bookingDetailRequestId) {
          if (found) this.booking = found;
          else this.bookingsError = 'This confirmed booking could not be found.';
        }
        return found;
      } catch {
        if (requestId === bookingsRequestId && detailRequestId === bookingDetailRequestId && (!this.booking || this.booking.id !== bookingId)) this.bookingsError = 'We could not load this ticket. Check your connection and try again.';
        return this.booking?.id === bookingId ? this.booking : null;
      } finally { if (detailRequestId === bookingDetailRequestId) this.bookingLoading = false; }
    },
  },
});
