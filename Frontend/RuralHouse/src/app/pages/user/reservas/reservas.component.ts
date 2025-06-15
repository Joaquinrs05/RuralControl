import { Component, inject, signal, effect, input } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import {
  ReservationService,
  Reservation,
} from '../../houses/reservation.service';
import { User } from '../../../shared/models/user.model';
import { AuthService } from '../../../Auth/services/auth.service';
import { House } from '../../../shared/models/house.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss',
})
export class ReservasComponent {
  constructor() {
    if (this.user?.id) {
      this.cargarReservasUsuario(this.user.id);
    }
  }

  errorMsg = '';
  reservasUsuario = signal<Reservation[]>([]);

  house = input.required<House>();
  #authService = inject(AuthService);
  #reservationService = inject(ReservationService);
  user = this.#authService.getUserFromToken(this.#authService.getToken()!);
  private cargarReservasUsuario(userId?: number) {
    console.log('[Perfil] userId para reservas:', userId);
    if (!userId) return;
    this.#reservationService.getReservationsByUser(userId).subscribe({
      next: (reservas) => {
        console.log('[Perfil] Reservas recibidas:', reservas);
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
}
