import { defineStore } from 'pinia';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: ToastMessage[];
}

let nextToastId = 1;

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    toasts: [],
  }),
  actions: {
    show(message: string, type: ToastType = 'info') {
      const id = nextToastId;
      nextToastId += 1;

      this.toasts.push({ id, type, message });
      window.setTimeout(() => this.dismiss(id), 4500);
    },
    success(message: string) {
      this.show(message, 'success');
    },
    error(message: string) {
      this.show(message, 'error');
    },
    warning(message: string) {
      this.show(message, 'warning');
    },
    info(message: string) {
      this.show(message, 'info');
    },
    dismiss(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },
  },
});
