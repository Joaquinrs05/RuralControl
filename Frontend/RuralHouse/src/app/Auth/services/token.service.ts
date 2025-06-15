import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor() {}

  // Guarda el token en localStorage
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Obtiene el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Elimina el token
  deleteToken(): void {
    localStorage.removeItem('token');
  }
}
