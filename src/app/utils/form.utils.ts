import { AbstractControl } from '@angular/forms';

export function hasVisibleError(control: AbstractControl, error: string): boolean {
  return control.touched && control.hasError(error);
}
