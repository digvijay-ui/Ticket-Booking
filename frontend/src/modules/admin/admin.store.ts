import { defineStore } from 'pinia';

import type { Booking, EventItem, Seat, WalletTransaction } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  bulkCreateSeatsApi,
  cancelEventApi,
  createEventApi,
  getAdminBookingsApi,
  getAdminEventSeatsApi,
  getAdminEventsApi,
  getAdminTransactionsApi,
  updateEventApi,
  type BulkCreateSeatsPayload,
  type EventFormPayload,
} from './admin.api';

interface AdminState {
  events: EventItem[];
  selectedEvent: EventItem | null;
  adminSeats: Seat[];
  bookings: Booking[];
  transactions: WalletTransaction[];
  loading: boolean;
  error: string;
  eventsLoading: boolean;
  eventSaving: boolean;
  eventsError: string;
  seatsLoading: boolean;
  seatsError: string;
  bulkCreating: boolean;
}

function sumTransactions(transactions: WalletTransaction[], type: WalletTransaction['type']) {
  return transactions.filter((transaction) => transaction.type === type).reduce((total, transaction) => total + transaction.amountInPaise, 0);
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    events: [],
    selectedEvent: null,
    adminSeats: [],
    bookings: [],
    transactions: [],
    loading: false,
    error: '',
    eventsLoading: false,
    eventSaving: false,
    eventsError: '',
    seatsLoading: false,
    seatsError: '',
    bulkCreating: false,
  }),
  getters: {
    totalEvents: (state) => state.events.length,
    totalBookings: (state) => state.bookings.length,
    confirmedBookings: (state) => state.bookings.filter((booking) => booking.status === 'CONFIRMED').length,
    cancelledBookings: (state) => state.bookings.filter((booking) => booking.status === 'CANCELLED').length,
    totalRevenueInPaise: (state) => {
      const debitTotal = sumTransactions(state.transactions, 'DEBIT');

      if (debitTotal > 0) {
        return debitTotal;
      }

      return state.bookings
        .filter((booking) => booking.status === 'CONFIRMED' && booking.paymentStatus === 'PAID')
        .reduce((total, booking) => total + booking.totalAmountInPaise, 0);
    },
    refundedAmountInPaise: (state) => sumTransactions(state.transactions, 'REFUND'),
    walletCreditAmountInPaise: (state) => sumTransactions(state.transactions, 'CREDIT'),
    walletDebitAmountInPaise: (state) => sumTransactions(state.transactions, 'DEBIT'),
    walletRefundAmountInPaise: (state) => sumTransactions(state.transactions, 'REFUND'),
  },
  actions: {
    async fetchDashboardData() {
      this.loading = true;
      this.error = '';

      const [eventsResult, bookingsResult, transactionsResult] = await Promise.allSettled([
        getAdminEventsApi(),
        getAdminBookingsApi(),
        getAdminTransactionsApi(),
      ]);

      const errors: string[] = [];

      if (eventsResult.status === 'fulfilled') {
        this.events = eventsResult.value.data.data.events;
      } else {
        this.events = [];
        errors.push(getApiErrorMessage(eventsResult.reason));
      }

      if (bookingsResult.status === 'fulfilled') {
        this.bookings = bookingsResult.value.data.data.bookings;
      } else {
        this.bookings = [];
        errors.push(getApiErrorMessage(bookingsResult.reason));
      }

      if (transactionsResult.status === 'fulfilled') {
        this.transactions = transactionsResult.value.data.data.transactions;
      } else {
        this.transactions = [];
        errors.push(getApiErrorMessage(transactionsResult.reason));
      }

      this.error = Array.from(new Set(errors)).join(' | ');
      this.loading = false;
    },
    async fetchEvents() {
      this.eventsLoading = true;
      this.eventsError = '';

      try {
        const response = await getAdminEventsApi();
        this.events = response.data.data.events;
        return this.events;
      } catch (error) {
        this.events = [];
        this.eventsError = getApiErrorMessage(error);
        throw error;
      } finally {
        this.eventsLoading = false;
      }
    },
    async createEvent(payload: EventFormPayload) {
      this.eventSaving = true;
      this.eventsError = '';

      try {
        const response = await createEventApi(payload);
        const event = response.data.data.event;
        this.selectedEvent = event;
        this.events = [event, ...this.events.filter((item) => item.id !== event.id)];
        return event;
      } catch (error) {
        this.eventsError = getApiErrorMessage(error);
        throw error;
      } finally {
        this.eventSaving = false;
      }
    },
    async updateEvent(eventId: string, payload: Partial<EventFormPayload>) {
      this.eventSaving = true;
      this.eventsError = '';

      try {
        const response = await updateEventApi(eventId, payload);
        const event = response.data.data.event;
        this.selectedEvent = event;
        this.events = this.events.map((item) => (item.id === event.id ? event : item));
        return event;
      } catch (error) {
        this.eventsError = getApiErrorMessage(error);
        throw error;
      } finally {
        this.eventSaving = false;
      }
    },
    async cancelEvent(eventId: string) {
      this.eventSaving = true;
      this.eventsError = '';

      try {
        const response = await cancelEventApi(eventId);
        const event = response.data.data.event;
        this.selectedEvent = event;
        this.events = this.events.map((item) => (item.id === event.id ? event : item));
        return event;
      } catch (error) {
        this.eventsError = getApiErrorMessage(error);
        throw error;
      } finally {
        this.eventSaving = false;
      }
    },
    async fetchAdminEventSeats(eventId: string) {
      this.seatsLoading = true;
      this.seatsError = '';

      try {
        const response = await getAdminEventSeatsApi(eventId);
        this.adminSeats = response.data.data.seats;
        return this.adminSeats;
      } catch (error) {
        this.adminSeats = [];
        this.seatsError = getApiErrorMessage(error);
        throw error;
      } finally {
        this.seatsLoading = false;
      }
    },
    async bulkCreateSeats(eventId: string, payload: BulkCreateSeatsPayload) {
      this.bulkCreating = true;
      this.seatsError = '';

      try {
        const response = await bulkCreateSeatsApi(eventId, payload);
        await this.fetchAdminEventSeats(eventId);
        return response.data.data;
      } catch (error) {
        this.seatsError = getApiErrorMessage(error);
        throw error;
      } finally {
        this.bulkCreating = false;
      }
    },
  },
});
