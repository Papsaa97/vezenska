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

/**
 * Vstup pro updateProfile(). Pole `role` zde ZÁMĚRNĚ není: roli smí měnit jen
 * správce, a to přes updateRole(), které zapisuje pouze do databáze a nechává
 * oprávnění vynutit RLS politiku nad public.profiles. Dokud tu `role` bylo, mohl
 * si ji do svého profilu poslat kdokoli a po selhání zápisu mu zůstala v prohlížeči.
 */
export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
  // Třída tu schválně není: od migrace 038 ji mění jen žádost schválená
  // velitelem, přijatá nominace nebo lektor/správce — viz utils/classMembership.ts.
}

export interface ProfileUpdateResult {
  error: string | null;
}
