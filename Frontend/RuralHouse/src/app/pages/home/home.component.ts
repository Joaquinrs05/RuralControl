import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HeaderComponent } from '../../component/header/header.component';
import { House } from '../houses/house.model';
import { HouseService } from '../houses/houses.service';
import { HouseListComponent } from '../houses/house-list/house-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, HouseListComponent],
  template: ` <app-house-list [houses]="houses()" />`,
})
export class HomeComponent {
  houseService = inject(HouseService);
  houses = this.houseService.houses;

  housesResource = rxResource({
    loader: () => this.houseService.load(),
  });
}
