import { Service, signal } from '@angular/core';

export type ToastKind = 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const TOAST_DURATION = 3500;

@Service()

export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, kind: ToastKind = 'success'): void {
    const id = ++this.nextId;
    this.toasts.update((toasts) => [...toasts, { id, message, kind }]);
    setTimeout(() => this.dismiss(id), TOAST_DURATION);
  }

  dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}