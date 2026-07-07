export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  walletBalanceInPaise: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  seatPriceInPaise: number;
  createdBy: string;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  reservedSeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface Seat {
  id: string;
  eventId: string;
  seatNumber: string;
  row: string;
  priceInPaise: number;
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED';
  reservedBy?: string | null;
  reservationExpiresAt?: string | null;
  bookedBy?: string | null;
  bookingId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  eventId: string;
  seatIds: string[];
  status: 'ACTIVE' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  totalAmountInPaise: number;
  expiresAt: string;
}

export interface Booking {
  id: string;
  userId?: string;
  eventId?: string;
  event?: Pick<EventItem, 'id' | 'title'>;
  seatIds?: string[];
  seats?: Array<Pick<Seat, 'id' | 'seatNumber' | 'row'>>;
  reservationId?: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PAID' | 'REFUNDED';
  totalAmountInPaise: number;
  walletTransactionId?: string;
  idempotencyKey?: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'REFUND';
  amountInPaise: number;
  balanceAfterInPaise: number;
  description: string;
  referenceType: string;
  referenceId?: string;
  idempotencyKey?: string;
  createdAt: string;
}
