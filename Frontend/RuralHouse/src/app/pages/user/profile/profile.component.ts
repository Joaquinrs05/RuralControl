import { Component, effect, Inject, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class UsersComponent {
  private apiUrl = 'http://51.38.176.82:8000/api';
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

  usuarioActual = signal<User>(this.userVacio);
  reservasUsuario = signal<Reservation[]>([]);

  constructor() {
    effect(() => {
      const token = this.#authService.getToken();
      if (!token) return;
      const decoded: any = this.#authService.getUserFromToken(token);
      if (decoded && decoded.id) {
        this.loading.set(true);
        this.#userService.getProfile().subscribe({
          next: (user) => {
            this.usuarioActual.set(user ?? this.userVacio);

            this.cargarReservasUsuario(user?.id);
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error al cargar el usuario:', error);
            this.loading.set(false);
          },
        });
      }
    });
  }

  private cargarReservasUsuario(userId?: number) {
    console.log('[Perfil] userId para reservas:', userId);
    if (!userId) return;
    this.#reservationService.getReservationsByUser(userId).subscribe({
      next: (reservas) => {
        console.log('[Perfil] Reservas recibidas:', reservas);
        this.reservasUsuario.set(reservas);
      },
      error: (error) => {
        console.error('[Perfil] Error al cargar reservas:', error);
      },
    });
  }

  formatDate(dateString: string): string {
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
