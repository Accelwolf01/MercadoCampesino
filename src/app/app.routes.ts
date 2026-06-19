import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'pending', loadComponent: () => import('./pages/pending/pending').then(m => m.Pending) },
  { path: 'mapa', loadComponent: () => import('./pages/mapa/mapa').then(m => m.Mapa) },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin').then(m => m.Admin), canActivate: [adminGuard] },
  { path: 'campesino', loadComponent: () => import('./pages/campesino/campesino').then(m => m.Campesino), canActivate: [authGuard] },
  { path: 'consumidor', loadComponent: () => import('./pages/consumidor/consumidor').then(m => m.Consumidor), canActivate: [authGuard] },
  { path: 'superadmin', loadComponent: () => import('./pages/superadmin/superadmin').then(m => m.Superadmin), canActivate: [adminGuard] },
  { path: 'perfil', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
