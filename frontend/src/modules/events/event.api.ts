import api from '@/services/axios';
import type { ApiResponse, EventItem, Seat } from '@/services/apiTypes';

export function getEvents() {
  return api.get<ApiResponse<{ events: EventItem[] }>>('/api/events');
}

export function getEvent(eventId: string) {
  return api.get<ApiResponse<{ event: EventItem }>>(`/api/events/${eventId}`);
}

export function getEventSeats(eventId: string) {
  return api.get<ApiResponse<{ seats: Seat[] }>>(`/api/events/${eventId}/seats`);
}
