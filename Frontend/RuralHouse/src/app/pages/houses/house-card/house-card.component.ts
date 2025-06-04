import { Component, inject, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { House } from '../../../shared/models/house.model';
import { HouseService } from '../houses.service';

@Component({
  selector: 'app-house-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './house-card.component.html',
  styleUrls: ['./house-card.component.scss'],
})
export class HouseCardComponent {
  house = input.required<House>();

  readonly = input<boolean>(false);
  //TODO Tengo que poner un boton al lao del de alquilar para volver al home en la vista del usuario
}
