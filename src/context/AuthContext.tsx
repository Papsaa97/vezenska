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

export type UserRole = 'student' | 'lektor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  avatar_url?: string | null;
}

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string;
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

  /** Načte profil uživatele z tabulky public.profiles */
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Auth] Nepodařilo se načíst profil:', error.message);
      setProfile(null);
      return;
    }
    setProfile(data as UserProfile);
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
        fetchProfile(currentSession.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('[Auth] Chyba při načítání relace:', err);
      if (mounted) setLoading(false);
    });

    // Reagujeme na přihlášení / odhlášení
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
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

  /** Aktualizuje jméno a/nebo avatar v public.profiles a okamžitě promítne změnu do lokálního stavu. */
  const updateProfile = useCallback(
    async (data: UpdateProfileInput): Promise<ProfileUpdateResult> => {
      if (!user) {
        return { error: 'Nejste přihlášeni.' };
      }

      const updates: { full_name?: string; avatar_url?: string } = {};
      if (data.fullName !== undefined) updates.full_name = data.fullName;
      if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl;

      if (Object.keys(updates).length === 0) {
        return { error: null };
      }

      const { data: updated, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select('id, email, full_name, role, created_at, avatar_url')
        .single();

      if (error) {
        return { error: error.message };
      }

      setProfile(updated as UserProfile);
      return { error: null };
    },
    [user]
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
