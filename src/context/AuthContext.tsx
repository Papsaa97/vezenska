import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
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

/** Předvolba třídy v prohlížeči a účet, kterému patří. */
const LOCAL_CLASS_KEY = 'vscr_my_class';
const LOCAL_CLASS_OWNER_KEY = 'vscr_my_class_owner';

/**
 * Uklidí předvolby v prohlížeči, aby nepřetekly mezi účty.
 *
 * localStorage přežije odhlášení i zavření prohlížeče. Dřív se z něj braly jako
 * fallback i jméno a fotka, takže na sdíleném počítači viděl druhý uživatel ve
 * svém profilu podobiznu a jméno toho předchozího — a kdyby mu ještě neexistoval
 * řádek v profiles, upsert níže by mu je rovnou zapsal do databáze.
 *
 * Jméno a fotka se proto v prohlížeči nedrží vůbec; zdrojem pravdy je databáze.
 * Předvolba třídy zůstává, protože je to jen předvyplnění formuláře, ale je
 * svázaná s účtem: patří-li někomu jinému, zahodí se.
 */
function pruneLocalPrefs(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('vscr_user_full_name');
  localStorage.removeItem('vscr_user_avatar');
  if (localStorage.getItem(LOCAL_CLASS_OWNER_KEY) !== userId) {
    localStorage.removeItem(LOCAL_CLASS_KEY);
    localStorage.removeItem(LOCAL_CLASS_OWNER_KEY);
  }
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

/**
 * Sestaví vysvětlení, proč databáze odmítne zápisy — nebo `null`, je-li vše
 * v pořádku.
 *
 * Oprávnění vynucuje RLS podle `public.profiles.role`, ne rozhraní. Rozejde-li
 * se role, kterou ukazuje aplikace, s rolí v databázi, tlačítka zůstanou
 * viditelná, ale žádné uložení neprojde. Zamítnutý UPDATE navíc není chyba —
 * jen nula zasažených řádků — takže se to bez téhle hlášky nijak neprojeví.
 */
function describeRoleMismatch(input: {
  isSystemAdmin: boolean;
  /** Role, kterou má účet v databázi. `null`, když se ji nepodařilo zjistit. */
  dbRole: UserRole | null;
  loadFailure: string | null;
}): string | null {
  const { isSystemAdmin, dbRole, loadFailure } = input;

  if (!dbRole) {
    const detail = loadFailure ? ` Databáze hlásí: ${loadFailure}` : '';
    return (
      'Váš profil se nepodařilo načíst z tabulky public.profiles ani ho tam ' +
      'založit, takže vás aplikace považuje za studenta a databáze odmítne ' +
      `každý pokus o uložení otázek, uživatelů i nástěnky.${detail} ` +
      'Diagnostiku i opravu má supabase/016_diagnostika_zapisu.sql.'
    );
  }

  if (isSystemAdmin && dbRole !== 'admin') {
    return (
      'Správcovské rozhraní vidíte jen díky VITE_ADMIN_EMAILS — v databázi má ' +
      `váš účet roli „${dbRole}“. O oprávnění rozhoduje výhradně sloupec ` +
      'public.profiles.role, takže uložení otázek, uživatelů ani nástěnky ' +
      'neprojde. Spusťte supabase/016_diagnostika_zapisu.sql, který roli ' +
      'správce v databázi doplní.'
    );
  }

  return null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  /** Proč databáze odmítne zápisy, nebo `null`, je-li role v pořádku. */
  roleSyncWarning: string | null;
  /**
   * Role, pod kterou si správce právě prohlíží rozhraní, nebo `null`.
   *
   * Je to VÝHRADNĚ náhled: do databáze se nezapisuje nic, `profiles.role`
   * zůstává beze změny a RLS dál pouští jen to, na co má účet doopravdy právo.
   * Rozhraní se tedy chová jako u zvolené role, ale data vidí pořád podle té
   * skutečné — proto se náhled hlásí pruhem přes celou šířku.
   */
  previewRole: UserRole | null;
  /** Role, kterou má účet doopravdy. Náhled ji nikdy nepřepisuje. */
  realRole: UserRole | null;
  /** Zapne náhled zvolené role, `null` ho vypne. Smí ho zapnout jen správce. */
  setPreviewRole: (role: UserRole | null) => void;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error: AuthError | null; signedIn: boolean }>;
  signUp: (email: string, password: string, fullName: string, captchaToken?: string) => Promise<{ error: AuthError | null }>;
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
  const [roleSyncWarning, setRoleSyncWarning] = useState<string | null>(null);

  // Náhled cizí role. Schválně jen ve stavu komponenty, ne v localStorage:
  // načtení stránky ho tím pádem vždycky vypne, takže se v něm nejde zaseknout.
  const [previewRole, setPreviewRoleState] = useState<UserRole | null>(null);

  const realRole: UserRole | null = profile?.role ?? null;

  /**
   * Náhled smí zapnout jen ten, kdo je správcem doopravdy.
   *
   * Není to bezpečnostní opatření — o tom rozhoduje RLS, ne prohlížeč — ale
   * brání tomu, aby se někdo dostal do matoucího stavu, kdy mu rozhraní slibuje
   * víc, než mu databáze dovolí.
   */
  const setPreviewRole = useCallback(
    (role: UserRole | null) => {
      // Vypnout náhled smí kdokoli a kdykoli — je to únikový východ.
      if (role !== null && realRole !== 'admin') return;
      setPreviewRoleState(role);
    },
    [realRole]
  );

  // Profil, který dostanou komponenty. Liší se od `profile` jen tehdy, když
  // běží náhled — a to pouze v poli `role`. Nikam se neukládá.
  const profileForConsumers: UserProfile | null = useMemo(() => {
    if (!profile) return null;
    if (!previewRole || previewRole === profile.role) return profile;
    return { ...profile, role: previewRole };
  }, [profile, previewRole]);

  /**
   * Načte profil uživatele z tabulky public.profiles.
   *
   * 1. Volitelné sloupce (avatar_url, user_class) umí postupně vypustit, takže
   *    neproběhlá migrace 010 nebo profiles_avatar.sql dotaz neshodí.
   * 2. Pokud profil v tabulce profiles dosud neexistuje (např. nebyl spuštěn trigger),
   *    nezpůsobí pád do null – automaticky jej založí a inicializuje profil v paměti.
   * 3. Role se bere výhradně z databáze. Nepodaří-li se profil načíst, zůstává
   *    'student' — nikdy se nedoplňuje z localStorage.
   * 4. Rozejde-li se role v rozhraní s rolí v databázi, nastaví `roleSyncWarning`.
   *    Bez něj se rozpor projeví jen tak, že žádné uložení neprojde a nikdo neví proč.
   *
   * `authUser` je povinný a musí pocházet z právě obsloužené session, ne ze stavu
   * komponenty. Dřív byl volitelný a chybějící hodnota se brala z `user` z uzávěry —
   * jenže useCallback má prázdné pole závislostí, takže `user` v něm navždy zůstával
   * `null` z prvního renderu. Doplnit `user` mezi závislosti nejde: efekt níže má
   * v závislostech `fetchProfile` a sám volá `setUser()`, takže by se odběr
   * onAuthStateChange rušil a zakládal dokola. Parametr je proto povinný — TypeScript
   * teď ohlídá, že se sem uživatel opravdu vždy předá.
   */
  const fetchProfile = useCallback(async (userId: string, authUser: User) => {
    pruneLocalPrefs(userId);
    const localClass = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_CLASS_KEY) : null;

    const userEmail = authUser.email || '';

    let profileData: ProfileDatabaseRow | null = null;
    let loadFailure: string | null = null;

    // Postupně ubíráme volitelné sloupce, dokud dotaz neprojde.
    //
    // Dřív tu byly dvě varianty a ta „záložní“ vypouštěla jen avatar_url —
    // user_class si nechávala. Jenže chybějící user_class (neproběhlá migrace
    // 010) je přesně ten případ, na který byla záloha myšlená: shodil oba
    // dotazy, profileData zůstalo null a KAŽDÝ uživatel se načetl jako
    // 'student', tedy i lektoři a správci. Poslední stupeň proto vystačí se
    // sloupci, které zakládá samotný profiles.sql.
    const COLUMN_SETS = [
      'id, email, full_name, role, created_at, avatar_url, user_class',
      'id, email, full_name, role, created_at, user_class',
      'id, email, full_name, role, created_at, avatar_url',
      'id, email, full_name, role, created_at',
    ];

    for (const columns of COLUMN_SETS) {
      // maybeSingle(), ne single(): chybějící řádek je pro nás legitimní stav
      // (profil se pak založí níže), ne chyba, kterou bychom měli hlásit.
      const { data, error } = await supabase
        .from('profiles')
        .select(columns)
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        profileData = {
          avatar_url: null,
          user_class: null,
          ...(data as unknown as Partial<ProfileDatabaseRow>),
        } as ProfileDatabaseRow;
        loadFailure = null;
        break;
      }

      loadFailure = error
        ? `${error.message}${error.code ? ` (${error.code})` : ''}`
        : 'Účet nemá v tabulce public.profiles žádný řádek.';

      // Užší výběr sloupců má smysl zkusit jen u chybějícího sloupce (42703).
      // Zamítnutí RLS ani výpadek sítě se vypuštěním sloupce nespraví.
      if (error?.code !== '42703') break;
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
      localStorage.setItem(LOCAL_CLASS_KEY, effectiveClass);
      localStorage.setItem(LOCAL_CLASS_OWNER_KEY, userId);
      // Zbytek po dřívějším ukládání role do prohlížeče — odstraníme, ať se na něj
      // nemůže nic omylem navázat a ať starým instalacím nezůstane v úložišti.
      localStorage.removeItem('vscr_user_role');
    }

    const effectiveFullName =
      profileData?.full_name?.trim() ||
      authUser.user_metadata?.full_name ||
      (userEmail ? userEmail.split('@')[0] : 'Uživatel');

    const resolvedProfile: UserProfile = {
      id: userId,
      email: userEmail || profileData?.email || '',
      full_name: effectiveFullName,
      role: effectiveRole,
      created_at: profileData?.created_at || authUser.created_at || new Date().toISOString(),
      avatar_url: profileData?.avatar_url || null,
      user_class: effectiveClass,
    };

    setProfile(resolvedProfile);

    // Chybí-li řádek v databázi, založíme ho.
    //
    // `role` se sem ZÁMĚRNĚ neposílá. RLS politiky nad public.profiles dovolují
    // vložit jen roli 'student' (tu doplní výchozí hodnota sloupce) a upravit
    // vlastní řádek jen beze změny role. Upsert s `role: 'admin'` proto vždy
    // skončil na 42501 — a protože klient Supabase chyby nevyhazuje, ale vrací
    // je v `error`, spolkl ji try/catch, který se nikdy nespustil. Padl s ním
    // i zápis jména a třídy, přestože ten projít mohl.
    let createdRole: UserRole | null = null;
    if (!profileData) {
      const { error: upsertError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          email: userEmail,
          full_name: effectiveFullName,
          user_class: resolvedProfile.user_class || 'ZOP A11',
          ...(resolvedProfile.avatar_url ? { avatar_url: resolvedProfile.avatar_url } : {}),
        },
        { onConflict: 'id' }
      );
      if (upsertError) {
        console.warn('[Auth] Založení profilu v Supabase selhalo:', upsertError.message);
      } else {
        // Politika „Povolit vytvoření vlastního profilu“ pustí jen roli
        // 'student' a tu doplní výchozí hodnota sloupce. Nově založený profil
        // je tedy vždy student — pro účet z VITE_ADMIN_EMAILS to znamená, že
        // upozornění níže platí dál, dokud roli nenastaví správce v databázi.
        createdRole = 'student';
      }
    }

    // Diagnostika pro případ, kdy rozhraní ukazuje víc, než databáze dovolí.
    //
    // O oprávnění rozhoduje výhradně public.profiles.role. Ukazuje-li rozhraní
    // správcovské nástroje na základě VITE_ADMIN_EMAILS, ale databáze má u účtu
    // jinou roli, odmítne RLS každý zápis — a to bez jediné chybové hlášky,
    // protože zamítnutý UPDATE není chyba, jen nula zasažených řádků. Přesně
    // tak vypadá „nejde mi aktualizovat nic z databáze“. Řekneme to nahlas.
    setRoleSyncWarning(
      describeRoleMismatch({ isSystemAdmin, dbRole: profileData?.role ?? createdRole, loadFailure })
    );
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
        pruneLocalPrefs(currentUser.id);
        const localClass = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_CLASS_KEY) : null;
        const initialRole: UserRole = isKnownAdmin(currentUser.email) ? 'admin' : 'student';
        const initialClass = localClass?.trim() || 'ZOP A11';

        // Jméno a fotka se do doběhnutí dotazu na profiles neberou z prohlížeče,
        // ze stejného důvodu jako role: cizí hodnota by na okamžik vypadala jako
        // vlastní. Jméno se odvodí z podepsané session, fotka zůstane prázdná
        // a ukážou se iniciály.
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Uživatel',
          role: initialRole,
          created_at: currentUser.created_at,
          avatar_url: null,
          user_class: initialClass,
        });

        fetchProfile(currentUser.id, currentUser).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setProfile(null);
        setRoleSyncWarning(null);
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
        setRoleSyncWarning(null);
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
    async (email: string, password: string, captchaToken?: string) => {
      // captchaToken se posílá jen tehdy, když ho formulář má. Je-li v Supabase
      // zapnutá ochrana CAPTCHA a token chybí, server přihlášení odmítne.
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });
      // Session se vrací spolu s chybou schválně. U slabého hesla může Supabase
      // přihlášení povolit a chybu vrátit jen jako upozornění; bez session by
      // volající nepoznal, jestli se uživatel dostal dovnitř, nebo ne.
      return { error, signedIn: data?.session != null };
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, captchaToken?: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          ...(captchaToken ? { captchaToken } : {}),
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
      setRoleSyncWarning(null);
      setPreviewRoleState(null);
      // Předvolby patří odhlášenému účtu — na sdíleném počítači nemají čekat
      // na dalšího uživatele.
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_CLASS_KEY);
        localStorage.removeItem(LOCAL_CLASS_OWNER_KEY);
        localStorage.removeItem('vscr_user_full_name');
        localStorage.removeItem('vscr_user_avatar');
      }
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
      // v prohlížeči nedrží hodnoty, které na serveru nikdy neskončily. Ukládá se
      // jedině předvolba třídy, a to spolu s účtem, kterému patří — jméno ani
      // fotka v prohlížeči nemají co dělat, viz pruneLocalPrefs().
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem(LOCAL_CLASS_KEY, effectiveClass);
        localStorage.setItem(LOCAL_CLASS_OWNER_KEY, user.id);
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
      value={{
        session,
        user,
        profile: profileForConsumers,
        loading,
        roleSyncWarning,
        previewRole,
        realRole,
        setPreviewRole,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateRole,
        updatePassword,
      }}
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
