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
}

export const useEventStore = defineStore('events', {
  state: (): EventState => ({
    events: [],
    selectedEvent: null,
    seats: [],
    loading: false,
    seatsLoading: false,
    error: '',
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
      this.loading = true;
      this.error = '';

      try {
        const response = await getEventByIdApi(eventId);
        this.selectedEvent = response.data.data.event;
      } catch (error) {
        this.error = getApiErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchEventSeats(eventId: string) {
      this.seatsLoading = true;
      this.error = '';

      try {
        const response = await getEventSeatsApi(eventId);
        this.seats = response.data.data.seats;
      } catch (error) {
        this.error = getApiErrorMessage(error);
      } finally {
        this.seatsLoading = false;
      }
    },
  },
});
