import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  id: number;
  name: string;
  description: string;
  photo_path: string;
  owner_id: number;
  average_rating: number;
  province: string;
  price_per_night: number;
  start_date: Date;
  end_date: Date;
  num_people: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = 'http://127.0.0.1:8001/api/users';
  //private apiUrl = 'http://51.38.176.82:8001/api/users';

  constructor(private http: HttpClient) {}

  getReservationsByUser(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/${userId}/houses`);
  }
}
