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
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      num_personas: ['', Validators.required],
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
      ...this.reservaForm.value,
      user_id: this.user().id,
      house_id: this.house().id,
    };
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
}
