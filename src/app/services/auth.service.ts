import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, UserRole } from '../models/user.model';

/**
 * ============================================================================
 * AuthService — Gestion de session SLICwave
 * ============================================================================
 * Simule une authentification par profil (Admin / Contributeur / Lecteur).
 * Pour la production : remplacer loginAs() par un flux OIDC réel.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSignal = signal<UserProfile | null>(null);

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public readonly currentRole = computed(() => this.currentUserSignal()?.role ?? null);

  /**
   * Connexion simulée par rôle (bouton Login mockup)
   * TODO [PROD]: Remplacer par un redirect OIDC selon le rôle
   */
  public loginAs(role: UserRole): void {
    const profiles: Record<string, UserProfile> = {
      administrateur: {
        id: 'usr-admin-01',
        name: 'Alexandre Laurent',
        email: 'alexandre.laurent@aerotech.internal',
        role: 'administrateur',
        department: 'Direction Ingénierie & Support Logistique',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
      },
      contributeur: {
        id: 'usr-contrib-01',
        name: 'Jean Dupont',
        email: 'jean.dupont@slicwave.internal',
        role: 'contributeur',
        department: 'Ingénierie LSA',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150'
      },
      lecteur: {
        id: 'usr-reader-01',
        name: 'Marie Martin',
        email: 'marie.martin@slicwave.internal',
        role: 'lecteur',
        department: 'Direction Programme',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
      }
    };
    this.currentUserSignal.set(profiles[role] || profiles['administrateur']);
  }

  /**
   * Déconnexion — remet le signal à null
   * TODO [PROD]: POST /api/auth/logout + révocation du jeton OIDC
   */
  public logout(): void {
    this.currentUserSignal.set(null);
  }
}
