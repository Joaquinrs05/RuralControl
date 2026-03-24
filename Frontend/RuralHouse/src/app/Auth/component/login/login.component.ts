// login.component.ts
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import jwtDecode from 'jwt-decode';
import { JwtPayload } from '../../../shared/models/jwt-payload.model';

interface LoginCredentials {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal('');

  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage.set(
        'Por favor, completa todos los campos correctamente.'
      );
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const credentials: LoginCredentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading.set(true);
        const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }
        const token = this.authService.getToken();
        if (token) {
          try {
            const decoded = jwtDecode<JwtPayload>(token);
            if (decoded.role === 'admin') {
              this.router.navigate(['/admin/home']);
              return;
            }
          } catch (e) {
            console.error('Error al decodificar el token:', e);
          }
        }
        this.router.navigate(['/home']);
      },
      error: (error) => {

        this.loading.set(false);
        this.errorMessage.set(
          error.error.message || 'Credenciales inválidas. Inténtalo de nuevo.'
        );
      },
    });
  }
}
