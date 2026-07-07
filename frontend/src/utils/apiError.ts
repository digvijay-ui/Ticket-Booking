import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    return message || 'Something went wrong';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}
