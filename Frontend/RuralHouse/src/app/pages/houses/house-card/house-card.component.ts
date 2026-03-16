import { Component, inject, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { House } from '../../../shared/models/house.model';
import { HouseService } from '../houses.service';
import { HouseImagePipe } from '../../../shared/pipes/house-image.pipe';

@Component({
  selector: 'app-house-card',
  standalone: true,
  imports: [CommonModule, RouterModule, HouseImagePipe],
  templateUrl: './house-card.component.html',
  styleUrls: ['./house-card.component.scss'],
})
export class HouseCardComponent {
  house = input.required<House>();

  readonly = input<boolean>(false);
}
