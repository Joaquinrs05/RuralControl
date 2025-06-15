import {
  Component,
  EventEmitter,
  inject,
  input,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { House } from '../../../../shared/models/house.model';
import { HouseService } from '../../../houses/houses.service';
import { HouseEditComponent } from '../house-edit/house-edit.component';
import { User } from '../../../../shared/models/user.model';
@Component({
  selector: 'app-house-card',
  imports: [CommonModule, RouterModule, HouseEditComponent],
  templateUrl: './house-card.component.html',
  styleUrl: './house-card.component.scss',
})
export class HouseCardComponent {
  house = input.required<House>();
  showRentalForm = false;

  @Output() houseDeleted = new EventEmitter<number>();
  @Output() houseEdited = new EventEmitter<House>();

  readonly = input<boolean>(false);

  private router = inject(Router);
  private houseService = inject(HouseService);

  usuarioSActual = signal<User>({
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
  deleteHouse(id: number) {
    this.houseService.deleteHouse(id).subscribe({
      next: () => {
        console.log('🏠 Casa eliminada correctamente');
        this.router.navigate(['/admin/houses']);
      },
      error: (error) => {
        console.error('❌ Error al eliminar la casa:', error);
      },
    });
  }
  emitDelete(id: number) {
    this.houseDeleted.emit(id);
  }
  actualizarCasa(casaEditada: House) {
    this.houseEdited.emit(casaEditada);
    this.ocultarFormularioEditar();
  }

  mostrarFormularioEditar() {
    this.showRentalForm = true;
  }
  ocultarFormularioEditar() {
    this.showRentalForm = false;
  }
}
