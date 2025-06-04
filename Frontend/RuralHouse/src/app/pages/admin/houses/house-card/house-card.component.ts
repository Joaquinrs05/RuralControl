import { Component, inject, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { House } from '../../../../shared/models/house.model';
@Component({
  selector: 'app-house-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './house-card.component.html',
  styleUrl: './house-card.component.scss',
})
export class HouseCardComponent {
  house = input.required<House>();

  readonly = input<boolean>(false);
}
