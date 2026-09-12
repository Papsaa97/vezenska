import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'velitel_tridy' | 'lektor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  avatar_url?: string | null;
  user_class?: string | null;
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

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<ProfileUpdateResult>;
  updatePassword: (newPassword: string) => Promise<ProfileUpdateResult>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Načte profil uživatele z tabulky public.profiles.
   *
   * Odolné vůči tomu, že migrace `supabase/profiles_avatar.sql` (sloupec avatar_url)
   * ještě nebyla na databázi spuštěna - v takovém případě by dotaz na neexistující
   * sloupec selhal jako celek a smazal by i roli a jméno uživatele z UI. Proto se
   * při chybě zkusí záložní dotaz bez avatar_url, aby role a jméno vždy zůstaly funkční.
   */
  const fetchProfile = useCallback(async (userId: string) => {
    const localRole = typeof window !== 'undefined' ? (localStorage.getItem('vscr_user_role') as UserRole | null) : null;
    const localClass = typeof window !== 'undefined' ? localStorage.getItem('vscr_my_class') : null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, avatar_url')
      .eq('id', userId)
      .single();

    if (!error) {
      const p = data as UserProfile;
      setProfile({
        ...p,
        role: (localRole && (p.role === 'student' || p.role === 'velitel_tridy')) ? localRole : p.role,
        user_class: localClass || p.user_class || null,
      });
      return;
    }

    const { data: fallbackData, error: fallbackError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .eq('id', userId)
      .single();

    if (fallbackError) {
      console.error('[Auth] Nepodařilo se načíst profil:', fallbackError.message);
      setProfile(null);
      return;
    }

    console.warn(
      '[Auth] Sloupec avatar_url se nepodařilo načíst (spusťte prosím supabase/profiles_avatar.sql):',
      error.message
    );
    const p = fallbackData as UserProfile;
    setProfile({
      ...p,
      role: (localRole && (p.role === 'student' || p.role === 'velitel_tridy')) ? localRole : p.role,
      user_class: localClass || null,
      avatar_url: null,
    });
  }, []);

  // Inicializace session + listener na změny
  useEffect(() => {
    let mounted = true;

    // Načtení aktuální session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Odběr změn stavu autentizace
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ── Auth actions ────────────────────────────────────────────────────────────

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (!error && data.user) {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            email,
            full_name: fullName,
            role: 'student',
          },
          { onConflict: 'id' }
        );
      }

      return { error };
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  }, []);

  /** Aktualizuje jméno, avatar, roli a/nebo třídu v profilu uživatele. */
  const updateProfile = useCallback(
    async (data: UpdateProfileInput): Promise<ProfileUpdateResult> => {
      if (!user) {
        return { error: 'Nejste přihlášeni.' };
      }

      if (data.userClass !== undefined && typeof window !== 'undefined') {
        localStorage.setItem('vscr_my_class', data.userClass);
      }
      if (data.role !== undefined && typeof window !== 'undefined') {
        localStorage.setItem('vscr_user_role', data.role);
      }

      const updates: Record<string, string> = {};
      if (data.fullName !== undefined) updates.full_name = data.fullName;
      if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        if (error) {
          return { error: error.message };
        }
      }

      await fetchProfile(user.id);
      return { error: null };
    },
    [user, fetchProfile]
  );

  /** Bezpečně změní heslo přihlášeného uživatele přes Supabase Auth. */
  const updatePassword = useCallback(async (newPassword: string): Promise<ProfileUpdateResult> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signIn, signUp, signOut, updateProfile, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth musí být použit uvnitř <AuthProvider>');
  }
  return ctx;
}
