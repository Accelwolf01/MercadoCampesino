import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLogged) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLogged) {
    router.navigate(['/login']);
    return false;
  }
  if (auth.perfil !== 1 && auth.perfil !== 2) {
    router.navigate(['/']);
    return false;
  }
  return true;
};
