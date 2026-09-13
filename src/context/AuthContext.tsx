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

export type { UserRole, UserProfile, UpdateProfileInput, ProfileUpdateResult } from '../types/auth';
import type { UserRole, UserProfile, UpdateProfileInput, ProfileUpdateResult } from '../types/auth';

/**
 * Seznam e-mailových adres garantovaných správců systému — bootstrap pro případ,
 * že se vlastník aplikace ještě nemá v databázi nastavenou roli 'admin'.
 *
 * Čte se výhradně z VITE_ADMIN_EMAILS. Dřívější záložní hodnota obsahovala dvě
 * osobní adresy zapsané natvrdo, a protože jakákoli proměnná s prefixem VITE_ se
 * vkládá do veřejného bundlu, daly se tyto adresy vyčíst z produkčního JavaScriptu.
 * Není-li proměnná nastavená, seznam je prázdný a o rolích rozhoduje jen databáze
 * (viz supabase/set_admin_miichalpapi.sql pro prvotní nastavení správce).
 */
function resolveAdminEmails(): string[] {
  const envEmails = import.meta.env?.VITE_ADMIN_EMAILS as string | undefined;
  if (!envEmails || !envEmails.trim()) {
    return [];
  }
  return envEmails.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export const ADMIN_EMAILS: string[] = resolveAdminEmails();

/** Rozpozná správce systému podle e-mailu. */
export function isKnownAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
}

/** Tvar řádku vráceného z tabulky public.profiles v Supabase. */
interface ProfileDatabaseRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  avatar_url: string | null;
  user_class: string | null;
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
  updateRole: (targetUserId: string, role: UserRole) => Promise<ProfileUpdateResult>;
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
   * 1. Podporuje avatar_url s fallbackem na query bez avatar_url.
   * 2. Pokud profil v tabulce profiles dosud neexistuje (např. nebyl spuštěn trigger),
   *    nezpůsobí pád do null – automaticky jej upsertne a inicializuje profil v paměti.
   * 3. Role se bere výhradně z databáze. Nepodaří-li se profil načíst, zůstává
   *    'student' — nikdy se nedoplňuje z localStorage.
   *
   * POZOR: vyžaduje sloupec profiles.user_class (migrace 010). Bez něj selže dotaz
   * i jeho záložní varianta a každý uživatel skončí jako 'student'.
   */
  const fetchProfile = useCallback(async (userId: string, overrideUser?: User | null) => {
    const localClass = typeof window !== 'undefined' ? localStorage.getItem('vscr_my_class') : null;
    const localName = typeof window !== 'undefined' ? localStorage.getItem('vscr_user_full_name') : null;
    const localAvatar = typeof window !== 'undefined' ? localStorage.getItem('vscr_user_avatar') : null;

    const effectiveUser = overrideUser || user;
    const userEmail = effectiveUser?.email || '';

    let profileData: ProfileDatabaseRow | null = null;

    // 1. Zkusíme načíst kompletní profil z tabulky profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, avatar_url, user_class')
      .eq('id', userId)
      .single();

    if (!error && data) {
      profileData = data as ProfileDatabaseRow;
    } else {
      // 2. Záložní dotaz bez avatar_url (pokud chybí sloupec na Supabase)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at, user_class')
        .eq('id', userId)
        .single();

      if (!fallbackError && fallbackData) {
        profileData = { ...(fallbackData as Omit<ProfileDatabaseRow, 'avatar_url'>), avatar_url: null };
      }
    }

    // Role pochází VÝHRADNĚ z databáze.
    //
    // Dřív se sem jako fallback brala hodnota z localStorage, což z prohlížeče dělalo
    // autoritativní zdroj oprávnění: když dotaz nad profiles selhal (a selhával vždy,
    // dokud neexistoval sloupec user_class), stala se efektivní rolí hodnota, kterou si
    // uživatel mohl sám přepsat. Nepodaří-li se profil načíst, zůstává 'student'.
    //
    // isKnownAdmin() je naopak bezpečný bootstrap: e-mail pochází z podepsané Supabase
    // session, klient ho nemůže podvrhnout. Slouží k tomu, aby se vlastník aplikace
    // nezamkl venku, než se v databázi nastaví jeho role.
    const isSystemAdmin = isKnownAdmin(userEmail);
    const effectiveRole: UserRole = isSystemAdmin ? 'admin' : (profileData?.role ?? 'student');

    // Zařazení do třídy je předvolba, nikoli oprávnění — lokální fallback je tu v pořádku.
    // Oprávnění velitele třídy se ověřuje v RLS politikách přes public.my_class().
    const effectiveClass = profileData?.user_class?.trim() || localClass?.trim() || 'ZOP A11';

    if (typeof window !== 'undefined') {
      localStorage.setItem('vscr_my_class', effectiveClass);
      // Zbytek po dřívějším ukládání role do prohlížeče — odstraníme, ať se na něj
      // nemůže nic omylem navázat a ať starým instalacím nezůstane v úložišti.
      localStorage.removeItem('vscr_user_role');
    }

    const effectiveFullName =
      profileData?.full_name?.trim() ||
      localName?.trim() ||
      effectiveUser?.user_metadata?.full_name ||
      (userEmail ? userEmail.split('@')[0] : 'Uživatel');

    const resolvedProfile: UserProfile = {
      id: userId,
      email: userEmail || profileData?.email || '',
      full_name: effectiveFullName,
      role: effectiveRole,
      created_at: profileData?.created_at || effectiveUser?.created_at || new Date().toISOString(),
      avatar_url: profileData?.avatar_url || localAvatar || null,
      user_class: effectiveClass,
    };

    setProfile(resolvedProfile);

    // Pokud v databázi řádek chyběl nebo role byla student pro admina, pokusíme se tiše synchronizovat
    if (!profileData || (isSystemAdmin && profileData.role !== 'admin')) {
      try {
        await supabase.from('profiles').upsert(
          {
            id: userId,
            email: userEmail,
            full_name: effectiveFullName,
            role: effectiveRole,
            user_class: resolvedProfile.user_class || 'ZOP A11',
            ...(resolvedProfile.avatar_url ? { avatar_url: resolvedProfile.avatar_url } : {}),
          },
          { onConflict: 'id' }
        );
      } catch (upsertErr) {
        console.warn('[Auth] Automatická synchronizace profilu do Supabase selhala:', upsertErr);
      }
    }
  }, []);

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
        // Okamžitá předběžná inicializace profilu, aby UI nikdy nebylo zablokováno.
        // Role je do dokončení dotazu na profiles vždy 'student' — nikdy se nepřebírá
        // z localStorage, aby ani na okamžik nebylo vidět vyšší oprávnění, než jaké
        // uživatel skutečně má v databázi.
        const localClass = typeof window !== 'undefined' ? localStorage.getItem('vscr_my_class') : null;
        const localName = typeof window !== 'undefined' ? localStorage.getItem('vscr_user_full_name') : null;
        const localAvatar = typeof window !== 'undefined' ? localStorage.getItem('vscr_user_avatar') : null;
        const initialRole: UserRole = isKnownAdmin(currentUser.email) ? 'admin' : 'student';
        const initialClass = localClass?.trim() || 'ZOP A11';

        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: localName || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Uživatel',
          role: initialRole,
          created_at: currentUser.created_at,
          avatar_url: localAvatar || null,
          user_class: initialClass,
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
            user_class: 'ZOP A11',
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

  /**
   * Aktualizuje jméno, avatar a/nebo zařazení do třídy přihlášeného uživatele.
   *
   * Roli tato funkce ZÁMĚRNĚ neumí změnit. Dřív pole `role` přijímala a rovnou ji
   * zapsala do lokálního stavu i do localStorage — a protože selhání zápisu do
   * databáze jen zalogovala a vrátila úspěch, mohl si kdokoli nastavit vyšší
   * oprávnění, která mu pak vydržela i přes obnovení stránky. Role se mění výhradně
   * přes updateRole(), které píše jen do databáze a spoléhá na RLS.
   *
   * Zápis do databáze má přednost před lokálním stavem: při chybě se stav v UI
   * vrátí na předchozí hodnotu a volající dostane skutečnou chybovou zprávu.
   */
  const updateProfile = useCallback(
    async (data: UpdateProfileInput): Promise<ProfileUpdateResult> => {
      if (!user) {
        return { error: 'Nejste přihlášeni.' };
      }

      const previousProfile = profile;

      const effectiveFullName =
        data.fullName !== undefined
          ? data.fullName
          : (profile?.full_name || user.email?.split('@')[0] || 'Uživatel');

      const effectiveAvatar =
        data.avatarUrl !== undefined ? data.avatarUrl : (profile?.avatar_url || null);

      const effectiveClass =
        data.userClass !== undefined ? data.userClass : (profile?.user_class || 'ZOP A11');

      // Optimistická aktualizace pro okamžitý efekt v UI; při chybě ji vrátíme zpět.
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: effectiveFullName,
        role: profile?.role ?? 'student',
        created_at: profile?.created_at || user.created_at || new Date().toISOString(),
        avatar_url: effectiveAvatar,
        user_class: effectiveClass,
      });

      const updates: Record<string, string | null> = {
        full_name: effectiveFullName,
        user_class: effectiveClass,
      };
      if (data.avatarUrl !== undefined) {
        updates.avatar_url = effectiveAvatar;
      }

      // .select() je tu schválně: bez něj Supabase u UPDATE, který neovlivní žádný
      // řádek (chybějící profil nebo zamítnutí RLS), nevrátí chybu — a my bychom
      // uživateli ohlásili úspěch, přitom se nic neuložilo.
      const { data: updated, error: updateErr } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select('id');

      if (updateErr) {
        console.error('[Auth] Uložení profilu do Supabase selhalo:', updateErr.message);
        setProfile(previousProfile);
        return { error: `Profil se nepodařilo uložit: ${updateErr.message}` };
      }

      if (!updated || updated.length === 0) {
        console.error('[Auth] Uložení profilu neovlivnilo žádný řádek (chybí profil nebo zamítla RLS).');
        setProfile(previousProfile);
        return {
          error: 'Profil se nepodařilo uložit — server změnu nepřijal. Zkuste se odhlásit a znovu přihlásit.',
        };
      }

      // Do localStorage zapisujeme teprve po úspěšném zápisu do databáze, ať se
      // v prohlížeči nedrží hodnoty, které na serveru nikdy neskončily.
      if (typeof window !== 'undefined') {
        localStorage.setItem('vscr_my_class', effectiveClass);
        localStorage.setItem('vscr_user_full_name', effectiveFullName);
        if (effectiveAvatar) {
          localStorage.setItem('vscr_user_avatar', effectiveAvatar);
        }
      }

      return { error: null };
    },
    [user, profile]
  );

  /**
   * Změní roli uživatele. Zapisuje POUZE do databáze — žádný optimistický stav,
   * žádný localStorage. Oprávnění vynucuje RLS politika "Pouze administrátor může
   * měnit role" nad public.profiles, takže běžnému uživateli se volání nezdaří
   * a dozví se o tom. Po úspěchu se profil znovu načte z databáze.
   */
  const updateRole = useCallback(
    async (targetUserId: string, role: UserRole): Promise<ProfileUpdateResult> => {
      if (!user) {
        return { error: 'Nejste přihlášeni.' };
      }

      const { data: updated, error: roleErr } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', targetUserId)
        .select('id');

      if (roleErr) {
        console.error('[Auth] Změna role selhala:', roleErr.message);
        return { error: `Změna role se nezdařila: ${roleErr.message}` };
      }

      // Zamítnutí RLS se projeví jako UPDATE bez zasažených řádků, ne jako chyba.
      if (!updated || updated.length === 0) {
        return { error: 'Změna role se nezdařila — role smí měnit jen správce systému.' };
      }

      if (targetUserId === user.id) {
        await fetchProfile(user.id, user);
      }

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
      value={{ session, user, profile, loading, signIn, signUp, signOut, updateProfile, updateRole, updatePassword }}
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

/**
 * Vrátí true pokud je aktuálně přihlášený uživatel správce systému.
 * Autoritativní zdroj je vždy `profile.role` (nastaveno z Supabase DB).
 * Používejte tento hook místo přímého volání isKnownAdmin() v komponentách.
 */
export function useIsAdmin(): boolean {
  const { profile } = useAuth();
  return profile?.role === 'admin';
}
