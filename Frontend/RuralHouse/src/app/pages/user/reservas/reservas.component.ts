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
import { HouseImagePipe } from '../../../shared/pipes/house-image.pipe';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink, HouseImagePipe],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss',
})
export class ReservasComponent {
  errorMsg = '';
  reservasUsuario = signal<Reservation[]>([]);

  house = input.required<House>();
  #authService = inject(AuthService);
  #reservationService = inject(ReservationService);

  constructor() {
    effect(() => {
      const user = this.#authService.currentUser();
      if (user?.id) {
        this.cargarReservasUsuario(user.id);
      }
    });
  }
  private cargarReservasUsuario(userId?: number) {

    if (!userId) return;
    this.#reservationService.getReservationsByUser(userId).subscribe({
      next: (reservas) => {

        const reservasValidas = (reservas || []).filter(
          (r) => r && r.id !== undefined && r.id !== null
        );
        this.reservasUsuario.set(reservasValidas);
      },
      error: (error) => {

      },
    });
  }
}
