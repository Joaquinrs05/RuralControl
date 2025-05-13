import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { House } from '../../shared/models/house.model';

@Injectable({
  providedIn: 'root',
})
export class HouseService {
  private apiUrl = 'http://127.0.0.1:8001/api/houses'; // Ajusta la URL según tu backend

  readonly #httpClient = inject(HttpClient);

  #housesSignal = signal<House[]>([]); // It is the state of the heroes
  houses = computed(() => this.#housesSignal());

  load(): Observable<House[]> {
    return this.#httpClient.get<House[]>(this.apiUrl).pipe(
      tap((result) => {
        this.#housesSignal.set(result);
      }),
      catchError((error) => {
        console.error('Failed to load houses', error);
        return throwError(() => error);
      })
    );
  }

  getHouseById(id: number): Observable<House | undefined> {
    const url = `${this.apiUrl}/${id}`;
    return this.#httpClient
      .get<House>(url)
      .pipe(catchError(this.handleError<House>(`getHouse id=${id}`)));
  }

  // Para pruebas, si aún no tienes el backend listo
  readonly defaultHero: House = {
    id: Math.floor(Math.random() * 10000) + 1000,
    name: 'Joker',
    description: 'esto es una prueba',
    photo_path: 'dhjsad',
    owner_id: 1,
    average_rating: 1,
    created_at: '23',
    updated_at: 'ewq',
  };

  showHouseRentalForm(id: number) {
    this.#httpClient
      .get(`${this.apiUrl}/${id}/rental-form`)
      .subscribe((result) => {
        console.log('Mostrar formulario de alquiler', result);
      });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Devuelve un resultado vacío para seguir ejecutando la aplicación
      return of(result as T);
    };
  }
}
