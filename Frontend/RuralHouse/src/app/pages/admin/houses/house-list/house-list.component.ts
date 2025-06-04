import { Component, inject, signal } from '@angular/core';
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
  private houseService = inject(HouseService);
  public houses = signal<House[]>([]);
  private authservice = inject(AuthService);

  constructor() {
    this.loadHouses();
  }

  getUser() {
    const token = this.authservice.getToken() as string;
    if (!token) {
      console.error('No token found');
      return null; // o lanzar un error si prefieres
    }
    const user = this.authservice.getUserFromToken(token);
    console.log('Usuario obtenido del token:', user);
    return user;
  }
  private loadHouses() {
    const user = this.getUser(); // o como lo tengas implementado
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
}
