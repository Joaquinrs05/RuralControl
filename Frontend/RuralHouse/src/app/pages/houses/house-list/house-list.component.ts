import { Component, inject, input, signal } from '@angular/core';
import { HouseService } from '../houses.service';
import { House } from '../../../shared/models/house.model';
import { HouseCardComponent } from '../house-card/house-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-house-list',
  imports: [HouseCardComponent, CommonModule],
  template: ` <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
  >
    @for (house of houses(); track house.id) {
    <app-house-card
      [house]="house"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 color-red-600 bg-red-600"
    />
    } @empty {
    <h1 aria-hidden="true">There are no Heroes.</h1>
    }
  </div>`,
})
export class HouseListComponent {
  readonly #houseService = inject(HouseService);
  public houses = input.required<House[]>();
}
