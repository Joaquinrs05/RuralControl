import { Component, effect, inject, input, signal } from '@angular/core';
import { UserService } from './user.service';
import { AuthService } from '../../Auth/services/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  editando = false;
  usuarioEditado: User | null = null;
  loading = true;
  errorMsg = '';

  #userService = inject(UserService);
  #authService = inject(AuthService);

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

  activarEdicion() {
    this.editando = true;
    this.usuarioEditado = { ...this.usuarioActual() };
  }

  cancelarEdicion() {
    this.editando = false;
    this.usuarioEditado = null;
  }

  guardarCambios() {
    if (this.usuarioEditado) {
      this.#userService.updateUser(this.usuarioEditado).subscribe({
        next: (userActualizado) => {
          this.usuarioActual.set(userActualizado);
          this.editando = false;
          this.usuarioEditado = null;
        },
        error: () => {
          this.errorMsg = 'Error al guardar los cambios';
        }
      });
    }
  }

  editUser(user: User) {
    this.#userService.getUserById(user.id).subscribe({
      next: () => {
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Error al actualizar el usuario';
        this.loading = false;
      },
    });
  }
}
