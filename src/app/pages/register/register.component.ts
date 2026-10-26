import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthError } from '@supabase/supabase-js';
import { AuthService } from '../../services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const { password, confirmPassword } = group.value;
  return password === confirmPassword ? null : { passwordsDiffer: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})

export class RegisterComponent {
  private formBuilder = inject(NonNullableFormBuilder);
  protected authService = inject(AuthService);

  isSigningUp = signal(false);
  signUpError = signal('');
  sentTo = signal('');

  form = this.formBuilder.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  showError(field: keyof typeof this.form.controls, error: string): boolean {
    const control = this.form.controls[field];
    return control.touched && control.hasError(error);
  }

  showPasswordMismatch(): boolean {
    return this.form.controls.confirmPassword.touched && this.form.hasError('passwordsDiffer');
  }

  signUp(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.email.value.trim();
    const password = this.form.controls.password.value;

    this.isSigningUp.set(true);
    this.signUpError.set('');

    this.authService.signUp(email, password).subscribe({
      next: () => {
        this.sentTo.set(email);
        this.isSigningUp.set(false);
      },
      error: (error: AuthError) => {
        this.signUpError.set(this.getSignUpErrorMessage(error));
        this.isSigningUp.set(false);
      },
    });
  }

  private getSignUpErrorMessage(error: AuthError): string {
    if (error.code === 'over_email_send_rate_limit') {
      return 'Foram enviados demasiados emails. Tente novamente daqui a alguns minutos.';
    }
    if (error.code === 'weak_password') {
      return 'Escolha uma palavra-passe mais forte.';
    }
    return 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
  }
}