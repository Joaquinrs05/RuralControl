import { Component, inject, input, signal } from '@angular/core';
import { HouseService } from '../houses.service';
import { House } from '../house.model';
import { HouseCardComponent } from '../house-card/house-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-house-list',
  imports: [HouseCardComponent, CommonModule],
  template: ` <div class="flex flex-wrap justify-center gap-4 ">
    @for (house of houses(); track house.id) {
    <app-house-card [house]="house" />
    } @empty {
    <h1 aria-hidden="true">There are no Heroes.</h1>
    }
  </div>`,
})
export class HouseListComponent {
  readonly #houseService = inject(HouseService);
  public houses = input.required<House[]>();
}
