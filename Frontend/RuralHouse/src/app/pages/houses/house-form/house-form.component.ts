import { Component, inject, input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { House } from '../../../shared/models/house.model';
import { User } from '../../../shared/models/user.model';
import { Reservation } from '../../../shared/models/reservation.model';
import { CommonModule } from '@angular/common';
import { HouseService } from '../houses.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-house-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './house-form.component.html',
  styleUrls: ['./house-form.component.scss'],
})
export class HouseFormComponent {
  user = input.required<User>();
  house = input.required<House>();

  private formBuilder = inject(FormBuilder);
  private houseService = inject(HouseService);
  private router = inject(Router);
  reservaForm: FormGroup;

  @Output() close = new EventEmitter<void>();

  constructor() {
    this.reservaForm = this.formBuilder.group({
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      num_people: ['', Validators.required],
    });
  }

  cerrarModal() {
    this.close.emit();
  }

  onSubmit() {
    if (this.reservaForm.invalid) {
      return;
    }

    const datosReserva = {
      start_date: this.reservaForm.value.start_date,
      end_date: this.reservaForm.value.end_date,
      num_people: this.reservaForm.value.num_people,
      user_id: this.user().id,
      house_id: this.house().id,
    };

    Swal.fire({
      title: '¿Confirmar reserva?',
      text: `Estás a punto de reservar esta casa rural por ${
        this.totalNights
      } noches por un total de ${this.estimatedTotal.toFixed(2)} €.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reservar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Paso 2: Enviar la reserva
        this.houseService.createReservation(datosReserva).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Reserva confirmada!',
              text: 'Tu casa rural ha sido alquilada con éxito.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              this.reservaForm.reset();
              this.cerrarModal();
              this.router.navigate(['/home']);
            });
          },
          error: (err) => {
            if (err.status === 422 && err.error && err.error.message === 'La casa ya está reservada en esas fechas') {
              Swal.fire({
                title: 'Casa no disponible',
                text: 'La casa ya está reservada en esas fechas. Por favor, elige otras fechas.',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: 'No se pudo completar la reserva. Inténtalo más tarde.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
              });
            }
          },
        });
      }
    });
  }

  get totalNights(): number {
    const start = new Date(this.reservaForm.get('start_date')?.value);
    const end = new Date(this.reservaForm.get('end_date')?.value);
    const diff = end.getTime() - start.getTime();
    return diff > 0 ? diff / (1000 * 60 * 60 * 24) : 0;
  }

  get estimatedTotal(): number {
    return (
      this.totalNights *
      this.house().price_per_night *
      this.reservaForm.get('num_people')?.value
    );
  }
}
