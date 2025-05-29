import {
  Component,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

import { HouseCardComponent } from '../house-card/house-card.component';
/* import { HeroItemNotFoundComponent } from '../../components/hero-item-not-found/hero-item-not-found.component';*/
import { HouseService } from '../houses.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HouseFormComponent } from '../house-form/house-form.component';
import { UserService } from '../../user/profile/user.service';
import { AuthService } from '../../../Auth/services/auth.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-house-detail',
  imports: [
    /*   HouseCardComponent, HeroItemNotFoundComponent ,
    RouterLink, */
    HouseFormComponent,
  ],
  /* template: ` @if(house()){
    <!--  <app-house-card [house]="house()" [readonly]="true" /> -->
    }<!-- @else{
    <app-hero-item-not-found />
    } -->`, */
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
    () => this.#houseResource.value() ?? this.#houseService.defaultHero
  );

  // Signal para el usuario actual
  private userVacio: User = {
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
  };

  usuarioActual = signal<User>(this.userVacio);

  constructor() {
    // Efecto reactivo: obtiene el id del usuario del token y carga el usuario completo
    effect(() => {
      const token = this.#authService.getToken();
      if (!token) return;
      const decoded: any = this.#authService.getUserFromToken(token);
      if (decoded && decoded.id) {
        this.#userService.getUserById(decoded.id).subscribe((user) => {
          this.usuarioActual.set(user ?? this.userVacio);
        });
      }
    });
  }

  mostrarFormularioAlquiler() {
    this.showRentalForm = true;
  }

  cerrarFormularioAlquiler() {
    this.showRentalForm = false;
  }
}
