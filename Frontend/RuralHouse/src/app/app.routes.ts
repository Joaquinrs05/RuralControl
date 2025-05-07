// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './Auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(
        (c) => c.HomeComponent
      ),
    canActivate: [authGuard], 
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./Auth/component/login/login.component').then((c) => c.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./Auth/component/register/register.component').then((c) => c.RegisterComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/register' },
];