import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';
import { AuthService } from '../../../Auth/services/auth.service';
import { User } from '../../../shared/models/user.model';
import {
  ReservationService,
  Reservation,
} from '../../houses/reservation.service';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { environment } from '../../../../environment/environment';
import { HouseImagePipe } from '../../../shared/pipes/house-image.pipe';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink, HouseImagePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class UsersComponent {
  private apiUrl = `${environment.apiBaseUrlUsers}/api`;
  readonly router = inject(Router);
  loading = signal(true);
  errorMsg = '';

  #userService = inject(UserService);
  #authService = inject(AuthService);
  #reservationService = inject(ReservationService);
  http = inject(HttpClient);

  private userVacio: User = {
    id: 0,
    name: '',
    surname1: '',
    surname2: '',
    alias: '',
    birth_date: '',
    email: '',
    password: '',
    created_at: '',
    updated_at: '',
  };

  usuarioActual = computed(() => this.#authService.currentUser() ?? this.userVacio);
  reservasUsuario = signal<Reservation[]>([]);

  constructor() {
    effect(() => {
      const user = this.#authService.currentUser();
      if (user && user.id) {
        this.cargarReservasUsuario(user.id);
        this.loading.set(false);
      } else {
        // if user is strictly null we might still be loading, but if !token we aren't
        if (!this.#authService.getToken()) {
           this.loading.set(false);
        }
      }
    }, { allowSignalWrites: true });
  }

  private cargarReservasUsuario(userId?: number) {

    if (!userId) return;
    this.#reservationService.getReservationsByUser(userId).subscribe({
      next: (reservas) => {

        this.reservasUsuario.set(reservas);
      },
      error: (error) => {

      },
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get isAdmin(): boolean {
    return this.#authService.isAdmin();
  }
}
