import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  constructor() {}

  // Guarda el token JWT en el almacenamiento local
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Obtiene el token almacenado
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Elimina el token (al hacer logout)
  deleteToken(): void {
    localStorage.removeItem('token');
  }
}
