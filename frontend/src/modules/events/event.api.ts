import api from '@/services/axios';
import type { ApiResponse, EventItem, Seat } from '@/services/apiTypes';

export function getEventsApi() {
  return api.get<ApiResponse<{ events: EventItem[] }>>('/api/events');
}

export function getEventByIdApi(eventId: string) {
  return api.get<ApiResponse<{ event: EventItem }>>(`/api/events/${eventId}`);
}

export function getEventSeatsApi(eventId: string) {
  return api.get<ApiResponse<{ seats: Seat[] }>>(`/api/events/${eventId}/seats`);
}

export const getEvents = getEventsApi;
export const getEvent = getEventByIdApi;
export const getEventSeats = getEventSeatsApi;
