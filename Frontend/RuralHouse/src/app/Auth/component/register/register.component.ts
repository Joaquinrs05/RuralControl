// register.component.ts
import { Component, computed, inject, Signal, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface RegisterUser {
  name: string;
  surname1?: string;
  surname2?: string;
  alias?: string;
  birth_date?: string;
  email: string;
  password: string;
  password_confirmation: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  registerForm: Signal<FormGroup> = computed(() =>
    this.formBuilder.group(
      {
        name: ['', Validators.required],
        surname1: [''],
        surname2: [''],
        alias: [''],
        birth_date: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirmation: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    )
  );

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('password_confirmation')?.value;

    if (password !== confirmPassword) {
      form.get('password_confirmation')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit() {
    if (this.registerForm().invalid) {
      this.errorMessage.set(
        'Por favor, corrige los errores y vuelve a intentarlo.'
      );
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const userData: RegisterUser = this.registerForm().value;

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.log(error);
        this.loading.set(false);
        this.errorMessage.set(
          error.error.message || 'Error en el registro. Intente nuevamente.'
        );
      },
    });
  }
}
