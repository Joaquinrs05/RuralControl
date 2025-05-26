import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/api/users'; // Ajusta la URL según tu backend

  readonly #httpClient = inject(HttpClient);

  #usersSignal = signal<User[]>([]);
  users = computed(() => this.#usersSignal());

  load(): Observable<User[]> {
    return this.#httpClient.get<User[]>(this.apiUrl).pipe(
      tap((result) => {
        this.#usersSignal.set(result);
      }),
      catchError((error) => {
        console.error('Failed to load users', error);
        return throwError(() => error);
      })
    );
  }

  getUserById(id: number): Observable<User | undefined> {
    const url = `${this.apiUrl}/${id}`;
    return this.#httpClient
      .get<User>(url)
      .pipe(catchError(this.handleError<User>(`getUser id=${id}`)));
  }

  // Para pruebas, si aún no tienes el backend listo
  readonly defaultUser: User = {
    id: Math.floor(Math.random() * 10000) + 1000,
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    surname1: 'Perez',
    surname2: 'Perez',
    alias: 'Juan',
    birth_date: '2000-01-01',
    password: '123456',
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    // ...otros campos si tienes en tu modelo User
  };

  updateUser(user: User): Observable<User> {
    const url = `${this.apiUrl}/${user.id}`;
    return this.#httpClient
      .put<User>(url, user)
      .pipe(catchError(this.handleError<User>('updateUser')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Devuelve un resultado vacío para seguir ejecutando la aplicación
      return of(result as T);
    };
  }
}
