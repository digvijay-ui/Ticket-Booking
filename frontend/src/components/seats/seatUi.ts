import type { Seat } from '@/services/apiTypes';

export type SeatUiStatus = Seat['status'] | 'TEMPORARILY_UNAVAILABLE';

export function seatStatusLabel(status: SeatUiStatus) {
  const labels: Record<SeatUiStatus, string> = {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    BOOKED: 'booked',
    TEMPORARILY_UNAVAILABLE: 'temporarily unavailable',
  };

  return labels[status];
}
