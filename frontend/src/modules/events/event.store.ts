import { defineStore } from 'pinia';

import type { EventItem, Seat } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { getEventByIdApi, getEventsApi, getEventSeatsApi } from './event.api';

interface EventState {
  events: EventItem[];
  selectedEvent: EventItem | null;
  seats: Seat[];
  loading: boolean;
  seatsLoading: boolean;
  error: string;
  detailError: string;
  detailErrorStatus: number | null;
  seatsError: string;
}

let eventDetailsRequest = 0;
let eventSeatsRequest = 0;

export const useEventStore = defineStore('events', {
  state: (): EventState => ({
    events: [],
    selectedEvent: null,
    seats: [],
    loading: false,
    seatsLoading: false,
    error: '',
    detailError: '',
    detailErrorStatus: null,
    seatsError: '',
  }),
  actions: {
    async fetchEvents() {
      this.loading = true;
      this.error = '';

      try {
        const response = await getEventsApi();
        this.events = response.data.data.events;
      } catch (error) {
        this.error = getApiErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchEventById(eventId: string) {
      const requestId = ++eventDetailsRequest;
      this.loading = true;
      this.detailError = '';
      this.detailErrorStatus = null;
      this.selectedEvent = null;

      try {
        const response = await getEventByIdApi(eventId);
        if (requestId === eventDetailsRequest) {
          this.selectedEvent = response.data.data.event;
        }
      } catch (error) {
        if (requestId === eventDetailsRequest) {
          const status = typeof error === 'object' && error !== null && 'response' in error
            ? (error as { response?: { status?: number } }).response?.status ?? null
            : null;
          this.detailErrorStatus = status;
          this.detailError = status === 404
            ? 'This event could not be found or is no longer available.'
            : 'We could not load this event right now.';
        }
      } finally {
        if (requestId === eventDetailsRequest) {
          this.loading = false;
        }
      }
    },
    async fetchEventSeats(eventId: string) {
      const requestId = ++eventSeatsRequest;
      this.seatsLoading = true;
      this.seatsError = '';

      try {
        const response = await getEventSeatsApi(eventId);
        if (requestId === eventSeatsRequest) {
          this.seats = response.data.data.seats;
        }
      } catch (error) {
        if (requestId === eventSeatsRequest) {
          this.seatsError = getApiErrorMessage(error);
        }
      } finally {
        if (requestId === eventSeatsRequest) {
          this.seatsLoading = false;
        }
      }
    },
  },
});
