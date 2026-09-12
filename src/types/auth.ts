export type UserRole = 'student' | 'velitel_tridy' | 'lektor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  avatar_url?: string | null;
  user_class?: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
  role?: UserRole;
  userClass?: string;
}

export interface ProfileUpdateResult {
  error: string | null;
}
