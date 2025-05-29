import { Component, inject, input, signal } from '@angular/core';
import { HouseService } from '../houses.service';
import { House } from '../../../shared/models/house.model';
import { HouseCardComponent } from '../house-card/house-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-house-list',
  imports: [HouseCardComponent, CommonModule],
  template: `
    <div class="w-full max-w-7xl mx-auto px-4 py-8">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center"
      >
        @for (house of houses(); track house.id) {
        <app-house-card [house]="house" />
        } @empty {
        <h1
          aria-hidden="true"
          class="col-span-full text-center text-gray-500 text-xl"
        >
          No hay casas disponibles.
        </h1>
        }
      </div>
    </div>
  `,
})
export class HouseListComponent {
  readonly #houseService = inject(HouseService);
  public houses = input.required<House[]>();
}
