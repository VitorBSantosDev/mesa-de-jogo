import { Service, signal } from '@angular/core';
import { Observable, Subject, take } from 'rxjs';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

@Service()

export class ConfirmDialogService {
  readonly request = signal<ConfirmRequest | null>(null);
  private answers = new Subject<boolean>();

  ask(request: ConfirmRequest): Observable<boolean> {
    this.request.set(request);
    return this.answers.pipe(take(1));
  }

  answer(confirmed: boolean): void {
    this.request.set(null);
    this.answers.next(confirmed);
  }
}