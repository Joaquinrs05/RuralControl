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

  // El control de visibilidad del modal se gestiona desde el componente padre (house-detail)
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
    console.log('📤 Datos que se envían a la API:', datosReserva); // <-- AQUÍ
    this.houseService.createReservation(datosReserva).subscribe({
      next: () => {
        // TODO: Mostrar un mensaje de éxito con libreria estilo SweetAlert
        alert('Reserva realizada con éxito');
        this.reservaForm.reset();
        this.cerrarModal();
        this.router.navigate(['/home']);
      },
      error: () => {
        console.error('Error al realizar la reserva', datosReserva);
        alert('Error al realizar la reserva');
      },
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
