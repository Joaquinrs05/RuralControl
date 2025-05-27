import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Ajusta el modelo según tu backend
export interface Reservation {
  id: number;
  name: string;
  description: string;
  photo_path: string;
  owner_id: number;
  average_rating: number;

  createdAt?: string;
  updatedAt?: string;
  // añade aquí más campos si los necesitas
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = 'http://127.0.0.1:8001/api/users'; // Ajusta la URL base según tu backend

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las reservas de un usuario
   */
  getReservationsByUser(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/${userId}/houses`);
  }

  // Aquí puedes añadir más métodos para crear, editar o cancelar reservas
}
