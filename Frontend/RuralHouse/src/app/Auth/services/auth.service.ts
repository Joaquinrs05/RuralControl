// auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import jwtDecode from 'jwt-decode';
import { environment } from '../../../environment/environment';
interface User {
  token: string;
  name?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  //private apiUrl = 'http://127.0.0.1:8000';
  private apiUrl =
    'https://describe-agreements-alice-clearly.trycloudflare.com/';
  /* private apiUrl = 'http://www.ruralcontrol.com/api/users'; */

  private currentUserSignal = signal<User | null>(null);
  currentUser = computed(() => this.currentUserSignal());

  constructor() {
    // Cargar usuario desde localStorage al iniciar
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const user = this.getUserFromToken(storedToken);
      this.currentUserSignal.set(user);
    }
  }

  register(userData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/api/auth/register`, userData)
      .pipe(
        tap((response) => {
          if (response && response.token) {
            this.storeToken(response.token);
          }
        })
      );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response && typeof response.token === 'string') {
          console.log(
            '[AuthService] Token recibido del backend:',
            response.token
          );
          try {
            const decoded = jwtDecode(response.token);
          } catch (e) {
            console.error('Error al decodificar el token:', e);
          }
          this.storeToken(response.token);
        } else {
          console.warn('No se recibió un token válido del backend.');
        }
      })
    );
  }

  isAdmin() {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role === 'admin';
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return false;
    }
  }

  private storeToken(token: string) {
    localStorage.setItem('token', token);
    const user = this.getUserFromToken(token);
    this.currentUserSignal.set(user);
  }

  getUserFromToken(token: string): any {
    const decoded: any = jwtDecode(token);

    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
    };
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSignal.set(null);
  }
}
