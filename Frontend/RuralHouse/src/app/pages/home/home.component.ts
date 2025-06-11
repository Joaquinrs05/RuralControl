import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HeaderComponent } from '../../component/header/header.component';
import { House } from '../../shared/models/house.model';
import { HouseService } from '../houses/houses.service';
import { HouseListComponent } from '../houses/house-list/house-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, HouseListComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  houseService = inject(HouseService);
  houses = this.houseService.houses;
  provinciaFilter = signal<string>('');

  filteredHouses = computed(() => {
    const filter = this.provinciaFilter().toLowerCase().trim();
    const allHouses = this.houses();

    if (!filter) {
      return allHouses;
    }

    return allHouses.filter((house) =>
      house.province?.toLowerCase().includes(filter)
    );
  });

  onProvinciaFilterChange(value: string) {
    this.provinciaFilter.set(value);
  }
  housesResource = rxResource({
    loader: () => this.houseService.load(),
  });
}
