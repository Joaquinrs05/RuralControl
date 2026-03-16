import { Component, computed, effect, inject, signal } from '@angular/core';

import { HouseCardComponent } from '../house-card/house-card.component';
import { HouseService } from '../houses.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HouseFormComponent } from '../house-form/house-form.component';
import { UserService } from '../../user/profile/user.service';
import { AuthService } from '../../../Auth/services/auth.service';
import { User } from '../../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { HouseImagePipe } from '../../../shared/pipes/house-image.pipe';

@Component({
  selector: 'app-house-detail',
  imports: [RouterLink, HouseFormComponent, CommonModule, HouseImagePipe],
  templateUrl: './house-detail.component.html',
})
export class HouseDetailComponent {
  private route = inject(ActivatedRoute);
  showRentalForm = false;

  id = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  readonly #houseService = inject(HouseService);
  readonly #userService = inject(UserService);
  readonly #authService = inject(AuthService);

  readonly #houseResource = rxResource({
    request: () => this.id(),
    loader: () => this.#houseService.getHouseById(this.id()),
  });

  house = computed(
    () => this.#houseResource.value() ?? this.#houseService.defaulHouse
  );

  // Usuario actual
  usuarioActual = signal<User>({
    id: 0,
    name: '',
    surname1: '',
    surname2: '',
    alias: '',
    birth_date: '',
    email: '',
    password: '',
    created_at: '',
    updated_at: '',
  });

  private map: L.Map | null = null;

  constructor() {
    effect(() => {
      const token = this.#authService.getToken();
      if (!token) return;
      const decoded: any = this.#authService.getUserFromToken(token);
      if (decoded?.id) {
        this.#userService.getUserById(decoded.id).subscribe((user) => {
          this.usuarioActual.set(user ?? this.usuarioActual());
        });
      }
    });

    // Mostrar mapa cuando haya coordenadas
    effect(() => {
      const h = this.house();

      if (h.latitude && h.longitude && !this.map) {
        const mapDiv = document.getElementById('map');
        if (mapDiv) {
          this.initMap(h.latitude, h.longitude, h.name);
        }
      }
    });
  }

  private initMap(lat: number, lng: number, name: string): void {
    this.map = L.map('map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map).bindPopup(name).openPopup();

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  mostrarFormularioAlquiler() {
    this.showRentalForm = true;
  }

  cerrarFormularioAlquiler() {
    this.showRentalForm = false;
  }
}
