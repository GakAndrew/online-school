import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valid = /^\+?[1-9]\d{1,14}$/.test(control.value);
    return valid ? null : { invalidPhone: true };
  };
}
