import { AxiosError } from 'axios';

function details(error: unknown) {
  if (!(error instanceof AxiosError)) return { status: null, message: '' };
  const message = (error.response?.data as { message?: string } | undefined)?.message?.toLowerCase() ?? '';
  return { status: error.response?.status ?? null, message };
}

export function getAuthErrorMessage(error: unknown, mode: 'login' | 'signup') {
  const { status, message } = details(error);

  if (status === 401 || message.includes('invalid credentials') || message.includes('incorrect')) {
    return 'Incorrect email or password.';
  }
  if (mode === 'signup' && (status === 409 || message.includes('already') || message.includes('duplicate'))) {
    return 'An account already exists with this email.';
  }
  if (!status) return 'We could not reach the box office. Check your connection and try again.';
  return 'We could not complete your request. Please try again.';
}

export function getWalletErrorMessage(error: unknown) {
  const { status } = details(error);
  if (!status) return 'We could not reach your wallet. Check your connection and try again.';
  if (status === 401) return 'Your session expired. Please log in again.';
  return 'We could not update your wallet. Please try again.';
}

export type BookingFailure = 'expired' | 'insufficient' | 'confirmed' | 'conflict' | 'network' | 'auth' | 'processing';

export function getBookingFailure(error: unknown): { kind: BookingFailure; message: string } {
  const { status, message } = details(error);

  if (status === 401) return { kind: 'auth', message: 'Your session expired. Please log in again.' };
  if (!status) return { kind: 'network', message: 'We could not verify the payment. Check your connection and try again with the same confirmation attempt.' };
  if (status === 402 || message.includes('insufficient')) return { kind: 'insufficient', message: 'Your wallet balance is not enough to confirm this booking.' };
  if (message.includes('expired') || message.includes('not active')) return { kind: 'expired', message: 'This reservation has expired. No payment was taken.' };
  if (message.includes('already') || message.includes('duplicate')) return { kind: 'confirmed', message: 'This reservation may already be confirmed. We are checking your bookings.' };
  if (message.includes('seat') || message.includes('valid')) return { kind: 'conflict', message: 'The reserved seats are no longer available. No payment was taken.' };
  return { kind: 'processing', message: 'Payment could not be completed. No success has been recorded; please try again.' };
}
