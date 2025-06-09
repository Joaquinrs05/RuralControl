// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Auth/services/auth.service';
import jwtDecode from 'jwt-decode';

export function authGuard(requiredRole?: string): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    if (!token) {
      router.navigate(['/auth/login']);
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        authService.logout();
        router.navigate(['/auth/login']);
        return false;
      }
      // Redirigir según el rol
      if (decoded.role === 'admin') {
        router.navigate(['/admin/home']);
        return false;
      } else {
        router.navigate(['/home']);
        return false;
      }
    } catch (e) {
      console.error('Token inválido:', e);
      authService.logout();
      router.navigate(['/auth/login']);
      return false;
    }

    return true;
  };
}
