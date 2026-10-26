import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent {
  private formBuilder = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected authService = inject(AuthService);

  isSigningIn = signal(false);
  signInError = signal('');

  form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showError(field: keyof typeof this.form.controls, error: string): boolean {
    const control = this.form.controls[field];
    return control.touched && control.hasError(error);
  }

  signIn(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.isSigningIn.set(true);
    this.signInError.set('');

    this.authService.signIn(email.trim(), password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('voltar') ?? '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.signInError.set('Não foi possível entrar. Confirme que o email e a palavra-passe estão corretos.');
        this.isSigningIn.set(false);
      },
    });
  }
}