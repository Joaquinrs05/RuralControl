import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth.service';

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

  // Nombre de la empresa
  companyName: string = 'RuralControl';

  // Ruta al logo
  logoPath: string = 'assets/images/logo.png';
  // Texto del botón de perfil/home
  get buttonText(): string {
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
