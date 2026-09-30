import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown) {
  if (!(error instanceof AxiosError)) {
    return 'Something went wrong. Please try again.';
  }

  const status = error.response?.status;
  if (!status) return 'We could not reach the service. Check your connection and try again.';
  if (status === 400 || status === 422) return 'Some information was not accepted. Review the fields and try again.';
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested item could not be found.';
  if (status === 409) return 'This item changed while you were working. Refresh and try again.';
  if (status === 429) return 'Too many requests were made. Wait a moment and try again.';
  return 'The service could not complete this request. Please try again.';
}
