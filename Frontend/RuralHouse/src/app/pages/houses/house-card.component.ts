import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { House } from './house.model';

@Component({
  selector: 'app-house-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './house-card.component.html',
  styleUrls: ['./house-card.component.scss']
})
export class HouseCardComponent {
  @Input() house!: House;
}