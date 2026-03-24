// src/app/shared/interceptors/error.interceptor.ts
import { Injectable, inject, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../Auth/services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private injector = inject(Injector);
  private router = inject(Router);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log para debugging
        console.error('Log Global de Errores:', error);

        // 401 No autorizado
        if (error.status === 401) {
          const authService = this.injector.get(AuthService);
          authService.logout();
          
          Swal.fire({
            title: 'Sesión Expirada',
            text: 'Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            this.router.navigate(['/auth/login']);
          });

          return throwError(() => error);
        }

        // Otros códigos de error a mostrar en notificaciones (salvo 401 y 422 - 422 se suele manejar granularmente en validaciones)
        if (error.status !== 422 && error.status !== 401) {
          const errorMessage = error.error?.message || 'Ha ocurrido un error inesperado, por favor inténtelo más tarde.';
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000
          });
        }

        return throwError(() => error);
      })
    );
  }
}
