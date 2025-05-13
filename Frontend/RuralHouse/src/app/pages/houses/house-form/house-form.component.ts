import { Component, inject, input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { House } from '../../../shared/models/house.model';
import { User } from '../../../shared/models/user.model';
import { CommonModule } from '@angular/common';

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

  private fb = inject(FormBuilder);
  reservaForm: FormGroup;

  constructor() {
    this.reservaForm = this.fb.group({
      fecha: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.reservaForm.invalid) {
      return;
    }

    const datosReserva = {
      ...this.reservaForm.value,
      user: this.user,
      house: this.house,
    };
    console.log('Reserva enviada:', datosReserva);
  }
}
