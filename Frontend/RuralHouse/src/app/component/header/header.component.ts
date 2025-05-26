import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  readonly router = inject(Router);
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
}
