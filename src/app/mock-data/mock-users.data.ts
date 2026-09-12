import { UserProfile } from '../models/user.model';

/**
 * ============================================================================
 * MOCK DATASET: Utilisateurs & Profils OIDC
 * ============================================================================
 * Vous pouvez modifier librement les données ci-dessous pour vos présentations client.
 * 
 * // TODO: [API OIDC] Pour passer en production :
 * // 1. Remplacer ce fichier par un appel à votre fournisseur OIDC (Keycloak, Okta, Azure AD, etc.)
 * // 2. Récupérer le token réel via le flux Authorization Code + PKCE
 * // 3. Remplir le UserProfile depuis le endpoint userinfo (/oauth/userinfo)
 */
export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr-8921',
    name: 'Alexandre Laurent',
    email: 'alexandre.laurent@aerotech.internal',
    role: 'Expert LSA & Architecture SL',
    department: 'Direction Ingénierie & Support Logistique',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    oidcToken: 'mock_jwt_token_expert_lsa_2026',
    lastLogin: new Date()
  },
  {
    id: 'usr-4412',
    name: 'Sophie Moreau',
    email: 'sophie.moreau@aerotech.internal',
    role: 'Analyste Base de Données SL (BA SL)',
    department: 'Division Maintien en Condition Opérationnelle',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    oidcToken: 'mock_jwt_token_analyste_basl_2026',
    lastLogin: new Date()
  },
  {
    id: 'usr-7019',
    name: 'Julien Mercier',
    email: 'julien.mercier@aerotech.internal',
    role: 'Directeur de Programme Soutien',
    department: 'Management Spécifications S3000L',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    oidcToken: 'mock_jwt_token_directeur_programme_2026',
    lastLogin: new Date()
  }
];

export const MOCK_OIDC_CONFIG = {
  issuer: 'https://darwin-auth.internal/oidc',
  clientId: 'sl-data-engine-app',
  scope: 'openid profile email s3000l_read_write'
};
