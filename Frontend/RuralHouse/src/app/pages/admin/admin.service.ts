import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AdminStats } from '../../shared/interfaces/adminStats.interface';
import {
  HouseTop,
  RecentReservation,
  ReservationsByMonthItem,
} from '../../shared/interfaces/reservation.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private baseUrl = 'http://localhost:8000/api/admin';

  constructor(private http: HttpClient) {}

  getAdminStats(
    adminId: number
  ): Observable<{ success: boolean; data: AdminStats }> {
    return this.http.get<{ success: boolean; data: AdminStats }>(
      `${this.baseUrl}/${adminId}/stats`
    );
  }

  getReservationsByMonth(
    adminId: number
  ): Observable<{ success: boolean; data: ReservationsByMonthItem[] }> {
    return this.http.get<{ success: boolean; data: ReservationsByMonthItem[] }>(
      `${this.baseUrl}/${adminId}/reservations-by-month`
    );
  }

  getTopHouses(
    adminId: number
  ): Observable<{ success: boolean; data: HouseTop[] }> {
    return this.http.get<{ success: boolean; data: HouseTop[] }>(
      `${this.baseUrl}/${adminId}/top-houses`
    );
  }

  getRecentReservations(
    adminId: number,
    limit: number = 10
  ): Observable<{ success: boolean; data: RecentReservation[] }> {
    return this.http.get<{ success: boolean; data: RecentReservation[] }>(
      `${this.baseUrl}/${adminId}/recent-reservations`
    );
  }
}
