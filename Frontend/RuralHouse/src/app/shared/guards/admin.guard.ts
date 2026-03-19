// admin.guard.ts
// Permite el acceso únicamente a usuarios con rol 'admin'.
// Redirige a /home si el usuario está autenticado pero no es admin.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth.service';
import jwtDecode from 'jwt-decode';
import { JwtPayload } from '../../shared/models/jwt-payload.model';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp < now) {
      authService.logout();
      router.navigate(['/auth/login']);
      return false;
    }

    if (decoded.role === 'admin') {
      return true;
    }

    // Usuario normal intentando acceder a rutas de admin → redirigir a home
    router.navigate(['/home']);
    return false;
  } catch (e) {
    console.error('Token inválido:', e);
    authService.logout();
    router.navigate(['/auth/login']);
    return false;
  }
};
