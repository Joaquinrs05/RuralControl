// formulario-crear-casa.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-house-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './house-form.component.html',
  styleUrl: './house-form.component.scss',
})
export class HouseFormComponent {
  casaForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.casaForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      owner_id: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      average_rating: [''],
    });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.casaForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.casaForm.get('name')?.value);
    formData.append('description', this.casaForm.get('description')?.value);
    formData.append('owner_id', this.casaForm.get('owner_id')?.value);
    if (this.casaForm.get('average_rating')?.value) {
      formData.append(
        'average_rating',
        this.casaForm.get('average_rating')?.value
      );
    }
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.http.post('http://localhost:8001/api/houses', formData).subscribe({
      next: (res) => alert('Casa creada correctamente'),
      error: (err) => alert('Error al crear la casa'),
    });
  }
}
