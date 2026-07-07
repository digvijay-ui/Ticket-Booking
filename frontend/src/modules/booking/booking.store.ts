import { defineStore } from 'pinia';

import type { Booking, EventItem, Reservation, Seat } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { createIdempotencyKey } from '@/utils/idempotency';
import { confirmBookingApi, getMyBookingsApi } from './booking.api';

export interface StoredReservationData {
  reservation: Reservation;
  event: EventItem | null;
  seats: Seat[];
}

interface StoredBookingData {
  booking: Booking;
  reservation: StoredReservationData | null;
}

interface BookingState {
  reservation: StoredReservationData | null;
  booking: Booking | null;
  bookings: Booking[];
  confirming: boolean;
  error: string;
  bookingsLoading: boolean;
  bookingsError: string;
}

function reservationStorageKey(reservationId: string) {
  return `reservation:${reservationId}`;
}

function bookingStorageKey(bookingId: string) {
  return `booking:${bookingId}`;
}

function readJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const useBookingStore = defineStore('booking', {
  state: (): BookingState => ({
    reservation: null,
    booking: null,
    bookings: [],
    confirming: false,
    error: '',
    bookingsLoading: false,
    bookingsError: '',
  }),
  actions: {
    setReservation(reservation: StoredReservationData | null) {
      this.reservation = reservation;
    },
    loadReservation(reservationId: string) {
      const storedReservation = readJson<StoredReservationData>(reservationStorageKey(reservationId));
      this.reservation = storedReservation;
      return storedReservation;
    },
    loadBooking(bookingId: string) {
      const storedBooking = readJson<StoredBookingData>(bookingStorageKey(bookingId));

      if (storedBooking) {
        this.booking = storedBooking.booking;
        this.reservation = storedBooking.reservation;
        return storedBooking;
      }

      return null;
    },
    async confirmBooking(reservationId: string) {
      this.confirming = true;
      this.error = '';

      try {
        const response = await confirmBookingApi({
          reservationId,
          idempotencyKey: createIdempotencyKey('confirm-booking'),
        });
        const booking = response.data.data.booking;
        this.booking = booking;

        sessionStorage.setItem(
          bookingStorageKey(booking.id),
          JSON.stringify({
            booking,
            reservation: this.reservation,
          }),
        );
        sessionStorage.removeItem(reservationStorageKey(reservationId));

        return booking;
      } catch (error) {
        this.error = getApiErrorMessage(error);
        throw error;
      } finally {
        this.confirming = false;
      }
    },
    async fetchMyBookings() {
      this.bookingsLoading = true;
      this.bookingsError = '';

      try {
        const response = await getMyBookingsApi();
        this.bookings = response.data.data.bookings;
      } catch (error) {
        this.bookingsError = getApiErrorMessage(error);
        throw error;
      } finally {
        this.bookingsLoading = false;
      }
    },
  },
});
