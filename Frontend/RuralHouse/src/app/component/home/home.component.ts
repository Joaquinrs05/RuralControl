import { Component, inject } from '@angular/core';
import { RegisterComponent } from '../../Auth/component/register/register.component';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [RegisterComponent],
  /* template: ` @if(heroes()){
    <app-hero-list [heroes]="heroes()" />
    }`, */
    template: `
    <h1>Home</h1>
    <p>Welcome to the home page!</p>
    <p>Here you can find some information about our application.</p> `
})
export class HomeComponent {
  //readonly #heroService = inject(HeroService);
  /* TODO 740: Create the heroesResource property from rxResource using the loader this.#heroService.load()
  readonly heroes = this.#heroService.heroes;
  heroesResource = rxResource({
    loader: () => this.#heroService.load(),
  }); */
}
