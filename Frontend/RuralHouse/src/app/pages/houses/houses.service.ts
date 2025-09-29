import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { House } from '../../shared/models/house.model';
import { environment } from '../../../environment/environment';
@Injectable({
  providedIn: 'root',
})
export class HouseService {
  //private apiUrl = 'http://127.0.0.1:8001/api/houses';
  private apiUrl =
    'https://sound-overall-sites-doors.trycloudflare.com /api/houses';
  /* private apiUrl = 'http://51.38.176.82/api/houses'; */

  private apiUrlReservation = 'http://92.112.127.238:8001/api/reservations';

  readonly #httpClient = inject(HttpClient);

  #housesSignal = signal<House[]>([]);
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

  readonly defaulHouse: House = {
    id: Math.floor(Math.random() * 10000) + 1000,
    name: 'Mientras carga',
    description: 'esto es una prueba',
    photo_path: 'dhjsad',
    owner_id: 1,
    visits: 1,
    price_per_night: 1,
    province: 'Madrid',
    latitude: 1.0,
    longitude: 1.0,
    address: 'Calle Falsa 123',
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

  createReservation(reservation: any) {
    return this.#httpClient.post(this.apiUrlReservation, reservation);
  }

  deleteHouse(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.#httpClient.delete<void>(url).pipe(
      tap(() => {
        // Actualizar el estado de las casas después de eliminar una
        this.#housesSignal.set(
          this.#housesSignal().filter((house) => house.id !== id)
        );
      }),
      catchError(this.handleError<void>(`deleteHouse id=${id}`))
    );
  }

  updateHouse(house: Partial<House>): Observable<House> {
    const url = `${this.apiUrl}/${house.id}`;
    return this.#httpClient.put<House>(url, house).pipe(
      tap((updatedHouse) => {
        // Actualizar el estado de las casas después de actualizar una
        const currentHouses = this.#housesSignal();
        const index = currentHouses.findIndex((h) => h.id === updatedHouse.id);
        if (index !== -1) {
          currentHouses[index] = updatedHouse;
          this.#housesSignal.set([...currentHouses]);
        }
      }),
      catchError(this.handleError<House>(`updateHouse id=${house.id}`))
    );
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
