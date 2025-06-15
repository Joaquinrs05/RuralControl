import { Component, effect, Inject, inject, signal } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
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
  imports: [CommonModule, NgForOf, FontAwesomeModule, RouterLink],
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
    // Efecto reactivo: obtiene el id del usuario del token y carga el usuario completo
    effect(() => {
      const token = this.#authService.getToken();
      if (!token) return;
      const decoded: any = this.#authService.getUserFromToken(token);
      if (decoded && decoded.id) {
        this.loading.set(true);
        this.#userService.getProfile().subscribe({
          next: (user) => {
            this.usuarioActual.set(user ?? this.userVacio);
            // Cargar reservas del usuario
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
        // Filtrar reservas válidas
        const reservasValidas = (reservas || []).filter(
          (r) => r && r.id !== undefined && r.id !== null
        );
        this.reservasUsuario.set(reservasValidas);
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

  uploadLogo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('logo', file);
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      };
      this.http
        .post(`${this.apiUrl}/admin/logo`, formData, { headers })
        .subscribe({
          next: (res: any) => {
            console.log('Logo subido con éxito:', res);
          },
          error: (err: any) => {
            console.error('Error al subir el logo:', err);
          },
        });
    }
  }
  /* onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.uploadLogo(file).subscribe({
        next: (res) => {
          console.log('Logo subido con éxito:', res);
        },
        error: (err) => {
          console.error('Error al subir el logo:', err);
        },
      });
    }
  } */
}
