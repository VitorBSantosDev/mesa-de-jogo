import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return true;

  return inject(ConfirmDialogService).ask({
    title: 'Alterações por guardar',
    message: 'Se sair desta página, perde o que escreveu. Quer sair mesmo assim?',
    confirmLabel: 'Sair sem guardar',
    cancelLabel: 'Continuar a editar',
  });
};