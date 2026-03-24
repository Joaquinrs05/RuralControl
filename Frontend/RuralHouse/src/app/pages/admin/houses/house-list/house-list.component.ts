import { Component, effect, inject, signal } from '@angular/core';
import { HouseService } from '../../../houses/houses.service';
import { House } from '../../../../shared/models/house.model';
import { HouseCardComponent } from '../house-card/house-card.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../Auth/services/auth.service';

@Component({
  selector: 'app-house-list',
  standalone: true,
  imports: [HouseCardComponent, CommonModule],
  template: `
    <div class="w-full max-w-7xl mx-auto px-4 py-8">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center"
      >
        @for (house of houses(); track house.id) {
        <app-house-card
          [house]="house"
          (houseDeleted)="onHouseDeleted($event)"
          (houseEdited)="onHouseEdit($event)"
        />
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
  private houseService = inject(HouseService);
  private authService = inject(AuthService);
  public houses = signal<House[]>([]);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.id) {
        this.loadHouses(Number(user.id));
      }
    });
  }

  private loadHouses(adminId: number) {
    this.houseService.load().subscribe({
      next: (data) => {
        this.houses.set(data.filter(house => house.owner_id === adminId));
      },
      error: (err) => {

        this.houses.set([]);
      },
    });
  }

  onHouseDeleted(id: number) {
    this.houseService.deleteHouse(id).subscribe({
      next: () => {
        this.houses.update((current) =>
          current.filter((housefilter) => housefilter.id !== id)
        );
      },
      error: (err) => {

      },
    });
  }
  onHouseEdit(houseEditada: House) {
    this.houses.update((current) =>
      current.map((h) => (h.id === houseEditada.id ? houseEditada : h))
    );
  }
}
