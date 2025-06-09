import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  effect,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { House } from '../../../../shared/models/house.model';
import { HouseService } from '../../../houses/houses.service';

@Component({
  selector: 'app-house-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './house-edit.component.html',
})
export class HouseEditComponent {
  private fb = inject(FormBuilder);
  private houseService = inject(HouseService);
  house = input.required<House>();

  /*  @Input() house = signal<House>({
    id: 0,
    name: '',
    description: '',
    photo_path: '',
    owner_id: 0,
    average_rating: 0,
    visits: 0,
    price_per_night: 0,
    created_at: '',
    updated_at: '',
  }); */

  @Output() close = new EventEmitter<void>();
  @Output() houseUpdated = new EventEmitter<House>();

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price_per_night: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      const h = this.house();
      this.form.patchValue({
        name: h.name,
        description: h.description,
        price_per_night: h.price_per_night,
      });
    });
  }

  submit() {
    if (this.form.invalid) return;

    const updatedHouse: Partial<House> = {
      ...this.house(),
      ...this.form.value,
    };

    this.houseService.updateHouse(updatedHouse).subscribe({
      next: (house) => {
        console.log('✅ Casa actualizada', house);
        this.houseUpdated.emit(house);
        this.close.emit();
      },
      error: (err) => {
        console.error('❌ Error al actualizar la casa', err);
      },
    });
  }

  cancelar() {
    this.close.emit();
  }
}
