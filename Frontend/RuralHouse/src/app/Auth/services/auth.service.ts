// auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import jwt_decode from 'jwt-decode';
import jwtDecode from 'jwt-decode';


interface User {
  token: string;
  name?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';
  
  private currentUserSignal = signal<User | null>(null);
  currentUser = computed(() => this.currentUserSignal());
  
  constructor() { 
    // Cargar usuario desde localStorage al iniciar
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      const user = this.getUserFromToken(storedToken);
      this.currentUserSignal.set(user);
    }
  }
  
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.storeToken(response.token);
          }
        })
      );
  }
  

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, credentials).pipe(
      tap((response: any) => {
        const token = response.token;
        if (token) {
          this.storeToken(token);
          const decoded = jwtDecode(token);
          console.log('Usuario decodificado:', decoded);
        }
      })
    );
  }
  private storeToken(token: string) {
    localStorage.setItem('auth_token', token);
    const user = this.getUserFromToken(token);
    this.currentUserSignal.set(user);
  }
  
  private getUserFromToken(token: string): User {
    const decoded: any = jwt_decode(token);
    return { token, name: decoded.name, email: decoded.email };
  }
  
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  logout() {
    localStorage.removeItem('auth_token');
    this.currentUserSignal.set(null);
  }
}