import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { ReservationService, Reservation } from '../houses/reservation.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, NgForOf],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss',
})
export class ReservasComponent {
  loading = signal(true);
  errorMsg = '';
  reservasUsuario = signal<Reservation[]>([]);

  #reservationService = inject(ReservationService);

  constructor(private userId: number) {
    effect(() => {
      this.loading.set(true);
      this.#reservationService.getReservationsByUser(this.userId).subscribe({
        next: (reservas) => {
          this.reservasUsuario.set(reservas || []);
          this.loading.set(false);
        },
        error: (error) => {
          this.errorMsg = 'Error al cargar reservas';
          this.loading.set(false);
        },
      });
    });
  }
}
