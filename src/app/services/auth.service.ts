import { Injectable, signal, computed } from '@angular/core';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Angular Signal for state management
  private currentUserSignal = signal<UserProfile | null>({
    id: 'usr-8921',
    name: 'Alexandre Laurent',
    email: 'alexandre.laurent@aerotech.internal',
    role: 'Expert LSA & Architecture SL',
    department: 'Direction Ingénierie & Support Logistique',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    oidcToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImRhcndpbi1vaWRjLXNlY3VyaXR5LTIwMjYifQ.mocked_token',
    lastLogin: new Date()
  });

  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);

  public availableMockProfiles: UserProfile[] = [
    {
      id: 'usr-8921',
      name: 'Alexandre Laurent',
      email: 'alexandre.laurent@aerotech.internal',
      role: 'Expert LSA & Architecture SL',
      department: 'Direction Ingénierie & Support Logistique',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      lastLogin: new Date()
    },
    {
      id: 'usr-4412',
      name: 'Sophie Moreau',
      email: 'sophie.moreau@aerotech.internal',
      role: 'Analyste Base de Données SL (BA SL)',
      department: 'Division Maintien en Condition Opérationnelle',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
      lastLogin: new Date()
    },
    {
      id: 'usr-7019',
      name: 'Julien Mercier',
      email: 'julien.mercier@aerotech.internal',
      role: 'Directeur de Programme Soutien',
      department: 'Management Spécifications S3000L',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      lastLogin: new Date()
    }
  ];

  public loginWithDarwin(profileId?: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const target = this.availableMockProfiles.find(p => p.id === profileId) || this.availableMockProfiles[0];
        this.currentUserSignal.set({
          ...target,
          oidcToken: `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.darwin_oidc_session_${Date.now()}`,
          lastLogin: new Date()
        });
        resolve(true);
      }, 600);
    });
  }

  public logout(): void {
    this.currentUserSignal.set(null);
  }
}
