/**
 * Modèle utilisateur SLICwave
 */
export type UserRole = 'administrateur' | 'contributeur' | 'lecteur' | string;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  oidcToken?: string;
  lastLogin?: Date;
}
