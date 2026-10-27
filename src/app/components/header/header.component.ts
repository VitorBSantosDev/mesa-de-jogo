import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);
  private toastService = inject(ToastService);

  links = [
    { path: '/', label: 'Classificação' },
    { path: '/jogos', label: 'Jogos' },
    { path: '/jogadores', label: 'Jogadores' },
    { path: '/partidas', label: 'Partidas' },
  ];

  isMenuOpen = signal(false);
  isSigningOut = signal(false);

  toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  signOut(): void {
    this.isSigningOut.set(true);

    this.authService.signOut().subscribe({
      next: () => {
        this.toastService.show('Sessão terminada.');
        this.isSigningOut.set(false);
        this.closeMenu();
        this.router.navigateByUrl('/');
      },
      error: () => this.isSigningOut.set(false),
    });
  }
}