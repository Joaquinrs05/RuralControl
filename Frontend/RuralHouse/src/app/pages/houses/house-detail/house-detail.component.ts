import {
  Component,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

import { HouseCardComponent } from '../house-card/house-card.component';
/* import { HeroItemNotFoundComponent } from '../../components/hero-item-not-found/hero-item-not-found.component';*/
import { HouseService } from '../houses.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-house-detail',
  imports: [HouseCardComponent /* HeroItemNotFoundComponent */],
  template: ` @if(house()){
    <app-house-card [house]="house()" [readonly]="true" />
    }<!-- @else{
    <app-hero-item-not-found />
    } -->`,
})
export class HouseDetailComponent {
  id = input(0, { transform: numberAttribute });
  readonly #houseService = inject(HouseService);

  readonly #houseResource = rxResource({
    request: () => this.id(),
    loader: () => this.#houseService.getHouseById(this.id()),
  });
  house = computed(
    () => this.#houseResource.value() ?? this.#houseService.defaultHero
  );
}
