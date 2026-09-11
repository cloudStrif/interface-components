export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl?: string;
  oidcToken?: string;
  lastLogin: Date;
}
