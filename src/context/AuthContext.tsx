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

export const ADMIN_EMAILS = [
  'miichalpapi@gmail.com',
  'papsaa97@gmail.com',
];

/** Rozpozná správce systému podle e-mailu (vlastník projektu miichalpapi). */
export function isKnownAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (ADMIN_EMAILS.includes(normalized)) return true;
  if (normalized.startsWith('miichalpapi')) return true;
  return false;
}

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
   * Robustní a samoopravné řešení:
   * 1. Podporuje avatar_url s fallbackem na query bez avatar_url.
   * 2. Pokud profil v tabulce profiles dosud neexistuje (např. nebyl spuštěn trigger),
   *    nezpůsobí pád do null – automaticky jej vytvoří/upsertne a inicializuje profil v paměti.
   * 3. Pro účet miichalpapi vždy garantuje roli 'admin' a synchronizuje ji.
   */
  const fetchProfile = useCallback(async (userId: string, overrideUser?: User | null) => {
    const localRole = typeof window !== 'undefined' ? (localStorage.getItem('vscr_user_role') as UserRole | null) : null;
    const localClass = typeof window !== 'undefined' ? localStorage.getItem('vscr_my_class') : null;
    const localName = typeof window !== 'undefined' ? localStorage.getItem('vscr_user_full_name') : null;
    const localAvatar = typeof window !== 'undefined' ? localStorage.getItem('vscr_user_avatar') : null;

    const effectiveUser = overrideUser || user;
    const userEmail = effectiveUser?.email || '';

    let profileData: Partial<UserProfile> | null = null;

    // 1. Zkusíme načíst kompletní profil z tabulky profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, avatar_url')
      .eq('id', userId)
      .single();

    if (!error && data) {
      profileData = data as UserProfile;
    } else {
      // 2. Záložní dotaz bez avatar_url (pokud chybí sloupec na Supabase)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .eq('id', userId)
        .single();

      if (!fallbackError && fallbackData) {
        profileData = { ...fallbackData, avatar_url: null };
      }
    }

    // Určení efektivní role a údajů
    const isAdmin = isKnownAdmin(userEmail) || localRole === 'admin' || profileData?.role === 'admin';
    const effectiveRole: UserRole = isAdmin
      ? 'admin'
      : (localRole && (profileData?.role === 'student' || profileData?.role === 'velitel_tridy'))
      ? localRole
      : (profileData?.role || 'student');

    if (effectiveRole === 'admin' && typeof window !== 'undefined') {
      localStorage.setItem('vscr_user_role', 'admin');
    }

    const effectiveFullName =
      profileData?.full_name ||
      localName ||
      effectiveUser?.user_metadata?.full_name ||
      (userEmail ? userEmail.split('@')[0] : 'Uživatel');

    const resolvedProfile: UserProfile = {
      id: userId,
      email: userEmail || profileData?.email || '',
      full_name: effectiveFullName,
      role: effectiveRole,
      created_at: profileData?.created_at || effectiveUser?.created_at || new Date().toISOString(),
      avatar_url: profileData?.avatar_url || localAvatar || null,
      user_class: localClass || profileData?.user_class || 'ZOP A11',
    };

    setProfile(resolvedProfile);

    // Pokud v databázi řádek chyběl nebo role byla student pro admina, pokusíme se tiše synchronizovat
    if (!profileData || (isAdmin && profileData.role !== 'admin')) {
      try {
        await supabase.from('profiles').upsert(
          {
            id: userId,
            email: userEmail,
            full_name: effectiveFullName,
            role: effectiveRole,
          },
          { onConflict: 'id' }
        );
      } catch (upsertErr) {
        console.warn('[Auth] Automatická synchronizace profilu do Supabase selhala:', upsertErr);
      }
    }
  }, [user]);

  // Inicializace session + listener na změny
  useEffect(() => {
    let mounted = true;

    // Načtení aktuální session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // Okamžitá předběžná inicializace profilu, aby UI nikdy nebylo zablokováno
        const localRole = typeof window !== 'undefined' ? (localStorage.getItem('vscr_user_role') as UserRole | null) : null;
        const localClass = typeof window !== 'undefined' ? localStorage.getItem('vscr_my_class') : null;
        const localName = typeof window !== 'undefined' ? localStorage.getItem('vscr_user_full_name') : null;
        const localAvatar = typeof window !== 'undefined' ? localStorage.getItem('vscr_user_avatar') : null;
        const isAdmin = isKnownAdmin(currentUser.email) || localRole === 'admin';

        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: localName || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Uživatel',
          role: isAdmin ? 'admin' : (localRole || 'student'),
          created_at: currentUser.created_at,
          avatar_url: localAvatar || null,
          user_class: localClass || 'ZOP A11',
        });

        fetchProfile(currentUser.id, currentUser).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    }).catch((err) => {
      console.error('[Auth] Chyba při načítání relace:', err);
      if (mounted) setLoading(false);
    });

    // Odběr změn stavu autentizace
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const currentUser = newSession?.user ?? null;
      setSession(newSession);
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser);
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
      if (data.fullName !== undefined && typeof window !== 'undefined') {
        localStorage.setItem('vscr_user_full_name', data.fullName);
      }
      if (data.avatarUrl !== undefined && typeof window !== 'undefined') {
        localStorage.setItem('vscr_user_avatar', data.avatarUrl);
      }

      const isAdmin = isKnownAdmin(user.email) || data.role === 'admin' || profile?.role === 'admin';
      const effectiveRole: UserRole = data.role !== undefined
        ? data.role
        : (isAdmin ? 'admin' : (profile?.role || 'student'));

      const effectiveFullName =
        data.fullName !== undefined
          ? data.fullName
          : (profile?.full_name || user.email?.split('@')[0] || 'Uživatel');

      const effectiveAvatar =
        data.avatarUrl !== undefined
          ? data.avatarUrl
          : (profile?.avatar_url || null);

      const effectiveClass =
        data.userClass !== undefined
          ? data.userClass
          : (profile?.user_class || 'ZOP A11');

      // Okamžitá aktualizace lokálního profilu pro okamžitý efekt v UI
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: effectiveFullName,
        role: effectiveRole,
        created_at: profile?.created_at || user.created_at || new Date().toISOString(),
        avatar_url: effectiveAvatar,
        user_class: effectiveClass,
      });

      // Příprava dat pro Supabase
      const updates: Record<string, string> = {
        full_name: effectiveFullName,
        role: effectiveRole,
      };
      if (effectiveAvatar) {
        updates.avatar_url = effectiveAvatar;
      }

      try {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (updateErr) {
          console.warn('[Auth] Update profiles v Supabase selhal, zkouším upsert:', updateErr.message);
          const { error: upsertErr } = await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                email: user.email,
                full_name: effectiveFullName,
                role: effectiveRole,
                ...(effectiveAvatar ? { avatar_url: effectiveAvatar } : {}),
              },
              { onConflict: 'id' }
            );

          if (upsertErr && updates.avatar_url) {
            delete updates.avatar_url;
            await supabase.from('profiles').upsert(
              {
                id: user.id,
                email: user.email,
                full_name: effectiveFullName,
                role: effectiveRole,
              },
              { onConflict: 'id' }
            );
          }
        }
      } catch (err) {
        console.warn('[Auth] Výjimka při ukládání profilu do Supabase:', err);
      }

      return { error: null };
    },
    [user, profile]
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
