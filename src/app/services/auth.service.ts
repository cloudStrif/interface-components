import { Injectable, signal, computed } from '@angular/core';
import { UserProfile } from '../models/user.model';
import { MOCK_USERS } from '../mock-data/mock-users.data';

/**
 * ============================================================================
 * AuthService (Service d'authentification OIDC / SSO)
 * ============================================================================
 * Gère l'état de l'utilisateur connecté sous forme de Signal Angular réactif.
 * 
 * // TODO: [INTÉGRATION BACKEND / OIDC RÉEL]
 * // Pour brancher votre authentification en production :
 * // 1. Injecter HttpClient : private http = inject(HttpClient);
 * // 2. Remplacer loginWithDarwin() par la redirection vers votre serveur OIDC (/oauth/authorize)
 * // 3. Traiter le callback avec le code d'autorisation pour obtenir le jeton (/oauth/token)
 * // 4. Stocker le jeton sécurisé (HttpOnly cookie ou sessionStorage)
 * // 5. Charger le profil utilisateur via GET /api/v1/auth/me
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Angular 21 Signals pour la réactivité fine
  private currentUserSignal = signal<UserProfile | null>(MOCK_USERS[0]);

  // Signaux publics en lecture seule
  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);

  // Liste des profils simulés (modifiable dans src/app/mock-data/mock-users.data.ts)
  public availableMockProfiles: UserProfile[] = MOCK_USERS;

  /**
   * Simulation de la connexion OIDC
   * // TODO: Remplacer par :
   * // return this.http.post<AuthResponse>('/api/v1/auth/login', { code, redirectUri });
   */
  public loginWithDarwin(profileId?: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const target = this.availableMockProfiles.find(p => p.id === profileId) || this.availableMockProfiles[0];
        this.currentUserSignal.set({
          ...target,
          oidcToken: `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.session_${Date.now()}`,
          lastLogin: new Date()
        });
        resolve(true);
      }, 400);
    });
  }

  /**
   * Déconnexion
   * // TODO: Remplacer par :
   * // this.http.post('/api/v1/auth/logout', {}).subscribe(() => this.currentUserSignal.set(null));
   */
  public logout(): void {
    this.currentUserSignal.set(null);
  }
}
