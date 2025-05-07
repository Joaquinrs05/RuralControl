import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HeaderComponent } from '../../component/header/header.component';
import { HouseCardComponent } from "../houses/house-card.component";

@Component({
  selector: 'app-home',
  imports: [ HouseCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  
}
