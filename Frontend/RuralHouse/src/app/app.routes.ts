// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { adminGuard } from './shared/guards/admin.guard';
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
      },
    ],
  },

  //otras rutas
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'reservas',
    loadComponent: () =>
      import('./pages/user/reservas/reservas.component').then(
        (m) => m.ReservasComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/user/profile/profile.component').then(
        (c) => c.UsersComponent
      ),
    canActivate: [authGuard],
  },
  //Rutas de admin (solo accesibles con rol 'admin')
  {
    path: 'admin/home',
    loadComponent: () =>
      import('./pages/admin/home/admin-dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/house-form',
    loadComponent: () =>
      import('./pages/admin/houses/house-form/house-form.component').then(
        (c) => c.HouseFormComponent
      ),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/houses',
    loadComponent: () =>
      import('./pages/admin/houses/house-list/house-list.component').then(
        (c) => c.HouseListComponent
      ),
    canActivate: [adminGuard],
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
