// auth.guard.ts
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import jwtDecode from 'jwt-decode';

export const authGuard: CanActivateFn = () => {
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
  } catch (e) {
    console.error('Token inválido:', e);
    authService.logout();
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};
