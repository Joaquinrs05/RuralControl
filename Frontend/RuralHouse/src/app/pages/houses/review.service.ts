import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Review } from '../../shared/models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiBaseUrlHouses}/api`;
  private http = inject(HttpClient);

  getReviews(houseId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/houses/${houseId}/reviews`);
  }

  createReview(reviewData: any): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, reviewData);
  }
}
