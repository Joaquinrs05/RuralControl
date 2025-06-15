import { Component, inject, signal } from '@angular/core';
import { HouseService } from '../../../houses/houses.service';
import { House } from '../../../../shared/models/house.model';
import { HouseCardComponent } from '../house-card/house-card.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../Auth/services/auth.service';
import { HouseEditComponent } from '../house-edit/house-edit.component';

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
  public houses = signal<House[]>([]);
  private authservice = inject(AuthService);

  constructor() {
    this.loadHouses();
  }

  getUser() {
    const token = this.authservice.getToken() as string;
    if (!token) {
      return null;
    }
    const user = this.authservice.getUserFromToken(token);
    return user;
  }
  private loadHouses() {
    const user = this.getUser();
    if (!user) {
      console.error('⚠️ No se pudo obtener el usuario autenticado');
      return;
    }

    this.houseService.load().subscribe({
      next: (data) => {
        const filtered = data.filter(
          (house) => house.owner_id === parseInt(user.id)
        );
        this.houses.set(filtered);
      },
      error: (err) => {
        console.error('❌ Error al cargar las casas:', err);
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
        console.error('❌ Error al eliminar la casa:', err);
      },
    });
  }
  onHouseEdit(houseEditada: House) {
    this.houses.update((current) =>
      current.map((h) => (h.id === houseEditada.id ? houseEditada : h))
    );
  }
}
