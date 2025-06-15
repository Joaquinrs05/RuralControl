import { Component, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Logo } from '../../shared/models/logo.model';

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
  logo = signal<Logo | null>(null);

  // Nombre de la empresa
  companyName: string = 'RuralControl';

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
  get buttonText(): string {
    if (this.isAdminRoute) {
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
