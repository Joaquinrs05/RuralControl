// auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import jwtDecode from 'jwt-decode';
import { environment } from '../../../environment/environment';
import { JwtPayload, TokenUser } from '../../shared/models/jwt-payload.model';
import { AuthResponse, RegisterUser } from '../../shared/models/auth.model';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  //private apiUrl = 'http://127.0.0.1:8000';
  private apiUrl = environment.apiBaseUrlUsers;
  /* private apiUrl = 'http://www.ruralcontrol.com/api/users'; */

  private currentUserSignal = signal<User | null>(null);
  currentUser = computed(() => this.currentUserSignal());

  constructor() {
    // Cargar usuario desde localStorage al iniciar, validando que el token no haya expirado
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
          // Token caducado: limpiar localStorage y no restaurar sesión
          localStorage.removeItem('token');
        } else {
          this.loadUserFromApi(storedToken);
        }
      } catch (e) {
        // Token corrupto o inválido: limpiar
        localStorage.removeItem('token');
      }
    }
  }

  register(userData: RegisterUser): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/api/auth/register`, userData)
      .pipe(
        tap((response) => {
          if (response && response.token) {
            this.storeToken(response.token);
          }
        })
      );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap((response) => {
        if (response && typeof response.token === 'string') {
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
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.role === 'admin';
    } catch (e) {

      return false;
    }
  }

  private storeToken(token: string) {
    localStorage.setItem('token', token);
    this.loadUserFromApi(token);
  }

  private loadUserFromApi(token: string) {
    const userFromToken = this.getUserFromToken(token);
    if (!userFromToken || !userFromToken.id) return;
    // Obtenemos el usuario completo desde la API para el signal centralizado
    // Usamos setTimeout para evitar un ciclo de dependencias en el constructor
    setTimeout(() => {
      this.http.get<User>(`${this.apiUrl}/api/users/${userFromToken.id}`).subscribe({
        next: (user) => {
          user.role = userFromToken.role; // Asignar rol desde el JWT si lo necesitamos
          this.currentUserSignal.set(user);
        },

      });
    }, 0);
  }

  getUserFromToken(token: string): TokenUser {
    const decoded = jwtDecode<JwtPayload>(token);
    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
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
