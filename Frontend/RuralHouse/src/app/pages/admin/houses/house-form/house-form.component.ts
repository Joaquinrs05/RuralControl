// formulario-crear-casa.component.ts
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../Auth/services/auth.service';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-house-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './house-form.component.html',
  styleUrl: './house-form.component.scss',
})
export class HouseFormComponent {
  casaForm: FormGroup;
  selectedFile: File | null = null;
  private router = inject(Router);
  private authservice = inject(AuthService);

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.casaForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      average_rating: [''],
      photo: [null, Validators.required],
    });
  }

  getUser() {
    const token = this.authservice.getToken() as string;
    if (!token) {
      console.error('No token found');
      return null; // o lanzar un error si prefieres
    }
    const user = this.authservice.getUserFromToken(token);
    console.log('Usuario obtenido del token:', user);
    return user;
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.casaForm.invalid) {
      return;
    }
    const user = this.getUser();
    if (!user || !user.id) {
      alert('No se ha podido obtener el usuario del token');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.casaForm.value.name);
    formData.append('description', this.casaForm.value.description);
    formData.append('owner_id', user.id);

    if (this.casaForm.value.average_rating) {
      formData.append('average_rating', this.casaForm.value.average_rating);
    }

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    console.log(
      '📤 Datos que se envían a la API:',
      Object.fromEntries(formData.entries())
    ); // <-- OPCIONAL PARA DEBUG

    this.http.post('http://localhost:8001/api/houses', formData).subscribe({
      next: () => {
        // TODO: Mostrar un mensaje de éxito con librería tipo SweetAlert
        alert('Casa creada correctamente');
        this.casaForm.reset();
        this.selectedFile = null;
        this.router.navigate(['/admin/home']); // o la ruta que toque
      },
      error: (err) => {
        console.error('Error al crear la casa:', err);
        alert('Error al crear la casa');
      },
    });
  }
}
