import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  get hideMenu(): boolean {
    return (
      this.router.url.startsWith('/auth/login') ||
      this.router.url.startsWith('/auth/register')
    );
  }
  showMenu = false;
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  http = inject(HttpClient);

  // Nombre de la empresa
  companyName: string = 'RuralControl';

  // Ruta al logo
  logoPath = signal('assets/images/logo.png');
  // Texto del botón de perfil/home

  constructor() {
    effect(() => {
      this.http
        .get<{ url: string }>('http://51.38.176.82:8000/api/logo')
        .subscribe({
          next: (res) => {
            if (res.url) {
              this.logoPath.set(res.url);
            }
          },
          error: (err) => {
            console.error('Error al cargar el logo:', err);
          },
        });
    });
  }
  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
  get buttonText(): string {
    if (this.isAdminRoute) {
      // Puedes personalizar el texto según la subruta de admin si lo necesitas
      return this.router.url === '/admin/profile' ? 'Panel' : 'Perfil Admin';
    }
    return this.router.url === '/profile' ? 'Home' : 'Perfil';
  }

  profile() {
    if (this.router.url === '/profile') {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/profile']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
