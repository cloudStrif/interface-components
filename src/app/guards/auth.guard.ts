import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard : redirige vers / si l'utilisateur n'est pas connecté
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};

/**
 * Guard : redirige vers / si le rôle ne correspond pas
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.currentRole();
    if (!role || !allowedRoles.includes(role)) {
      router.navigate(['/']);
      return false;
    }
    return true;
  };
};
