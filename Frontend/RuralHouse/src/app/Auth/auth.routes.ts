import { Routes } from '@angular/router';

/* import { authtokenGuard } from '../heroes/guards/authtoken.guard'; */

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('../component/home/home.component').then(
        (c) => c.HomeComponent
      ),
   /*  canActivate: [authtokenGuard], */
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./component/login/login.component').then((c) => c.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./component/register/register.component').then(
            (c) => c.RegisterComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/register' },
];
