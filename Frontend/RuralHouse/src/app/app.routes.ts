// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { HouseListComponent } from './pages/houses/house-list/house-list.component';
import { houseIdMatcher } from './shared/matcher/house-id.matcher';
export const routes: Routes = [
  //Rutas de inicio
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./Auth/component/login/login.component').then(
            (c) => c.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./Auth/component/register/register.component').then(
            (c) => c.RegisterComponent
          ),
      },
    ],
  },

  //Rutas de la casa
  {
    path: 'house',
    children: [
      {
        loadComponent: () =>
          import('./pages/houses/house-detail/house-detail.component').then(
            (c) => c.HouseDetailComponent
          ),
        matcher: houseIdMatcher,
        canActivate: [authGuard],
      },
    ],
  },

  //otras rutas
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'reservas',
    loadComponent: () => import('./pages/reservas/reservas.component').then(m => m.ReservasComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((c) => c.UsersComponent),
    canActivate: [authGuard],
  },

  { path: '**', redirectTo: 'auth/login' },
];
