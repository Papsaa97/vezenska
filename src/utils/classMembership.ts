import { supabase } from '../lib/supabase';

// ─── Zařazování do tříd (migrace 038) ────────────────────────────────────────
//
// Všechno tu jde přes funkce v databázi, ne přes přímý zápis do profiles.
// Každý čte jen svůj profil (migrace 029), takže velitel ani lektor by cizí
// účet jinak nenašel — a funkce navíc samy ověří roli volajícího a pošlou
// oznámení do zvonku. Klient nic nerozhoduje; jen zobrazí, co server dovolí.

/** Přehled třídy — to jediné, co z cizí třídy vidí nečlen. */
export interface ClassOverview {
  id: string;
  className: string;
  courseStartDate: string | null;
  courseEndDate: string | null;
  /** Jméno skutečného velitele (z profilu s rolí velitel_tridy), nebo null. */
  commanderName: string | null;
  /** Platný dočasný zástupce velitele, nebo null. */
  deputyName: string | null;
  /** Do kdy zástupcování platí; null = do odvolání. */
  deputyUntil: string | null;
  memberCount: number;
  updatedAt: string | null;
}

/** Čekající žádost (student sám) nebo nominace (od velitele). */
export interface PendingAssignment {
  id: string;
  kind: 'zadost' | 'nominace';
  className: string;
  fromName: string | null;
  createdAt: string;
}

/** Stav zařazení přihlášeného uživatele. */
export interface MyMembership {
  userClass: string | null;
  note: string | null;
  unassignedSince: string | null;
  /** Třída, kterou účet právě vede (jako velitel nebo platný zástupce). */
  commandsClass: string | null;
  pending: PendingAssignment[];
}

/** Řádek seznamu pro velitele (jen nezařazení) a lektora/správce (všichni). */
export interface AssignmentRow {
  id: string;
  fullName: string;
  /** Jen pro lektora a správce; velitel e-maily nevidí. */
  email: string | null;
  role: string;
  userClass: string | null;
  note: string | null;
  unassignedSince: string | null;
  requestId: string | null;
  requestClass: string | null;
  /** Třídy, do kterých je uživatel označen a čeká se na jeho potvrzení. */
  nominatedClasses: string | null;
}

export interface RpcResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Chybová hláška pro uživatele.
 *
 * Funkce v databázi hlásí důvod česky (RAISE EXCEPTION), ten se zobrazí tak,
 * jak je. Chybějící funkce (PGRST202 / 42883) znamená, že migrace 038 ještě
 * neběžela — to se řekne srozumitelně, ne technickou hláškou.
 */
function describeError(error: { message: string; code?: string }, feature: MissingFeature): string {
  if (error.code === 'PGRST202' || error.code === '42883' || /could not find the function/i.test(error.message)) {
    return `${feature.label} zatím není na serveru zapnut${feature.ending} (chybí migrace ${feature.migration}). Obraťte se prosím na správce.`;
  }
  return error.message;
}

/** Jak pojmenovat funkci, které na serveru chybí migrace. */
export interface MissingFeature {
  label: string;
  /** Koncovka příčestí podle rodu: „zapnuté“ / „zapnutá“. */
  ending: 'é' | 'á' | 'ý';
  migration: string;
}

const MEMBERSHIP_FEATURE: MissingFeature = { label: 'Zařazování do tříd', ending: 'é', migration: '038' };

export async function call<T>(
  fn: string,
  args?: Record<string, unknown>,
  feature: MissingFeature = MEMBERSHIP_FEATURE
): Promise<RpcResult<T>> {
  try {
    const { data, error } = await supabase.rpc(fn, args);
    if (error) return { data: null, error: describeError(error, feature) };
    return { data: data as T, error: null };
  } catch (err) {
    return { data: null, error: `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).` };
  }
}

interface OverviewRow {
  id: string;
  class_name: string;
  course_start_date: string | null;
  course_end_date: string | null;
  velitel_jmeno: string | null;
  zastupce_jmeno: string | null;
  zastupce_do: string | null;
  pocet_clenu: number | null;
  updated_at: string | null;
}

export async function fetchClassOverview(): Promise<RpcResult<ClassOverview[]>> {
  const res = await call<OverviewRow[]>('trida_prehled');
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    data: res.data.map((r) => ({
      id: r.id,
      className: r.class_name,
      courseStartDate: r.course_start_date,
      courseEndDate: r.course_end_date,
      commanderName: r.velitel_jmeno,
      deputyName: r.zastupce_jmeno,
      deputyUntil: r.zastupce_do,
      memberCount: r.pocet_clenu ?? 0,
      updatedAt: r.updated_at,
    })),
    error: null,
  };
}

interface MembershipRow {
  user_class: string | null;
  trida_poznamka: string | null;
  nezarazen_od: string | null;
  velim_tride: string | null;
  polozka_id: string | null;
  druh: 'zadost' | 'nominace' | null;
  class_name: string | null;
  od_koho: string | null;
  vytvoreno: string | null;
}

export async function fetchMyMembership(): Promise<RpcResult<MyMembership>> {
  const res = await call<MembershipRow[]>('moje_zarazeni');
  if (res.error || !res.data) return { data: null, error: res.error };
  const rows = res.data;
  const first = rows[0];
  return {
    data: {
      userClass: first?.user_class ?? null,
      note: first?.trida_poznamka ?? null,
      unassignedSince: first?.nezarazen_od ?? null,
      commandsClass: first?.velim_tride ?? null,
      pending: rows
        .filter((r): r is MembershipRow & { polozka_id: string; druh: 'zadost' | 'nominace'; class_name: string; vytvoreno: string } =>
          Boolean(r.polozka_id && r.druh && r.class_name && r.vytvoreno)
        )
        .map((r) => ({
          id: r.polozka_id,
          kind: r.druh,
          className: r.class_name,
          fromName: r.od_koho,
          createdAt: r.vytvoreno,
        })),
    },
    error: null,
  };
}

interface AssignmentDbRow {
  id: string;
  full_name: string;
  email: string | null;
  role: string;
  user_class: string | null;
  trida_poznamka: string | null;
  nezarazen_od: string | null;
  zadost_id: string | null;
  zadost_trida: string | null;
  nominace_tridy: string | null;
}

const STAFF_ROLES = new Set<string>(['lektor', 'admin']);

export async function fetchAssignmentList(): Promise<RpcResult<AssignmentRow[]>> {
  const res = await call<AssignmentDbRow[]>('seznam_zarazeni');
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    // Lektoři a správci do tříd nepatří: seznam zařazení je o studentech
    // a velitelích. Server je lektorovi vrací (vidí všechny účty), takže by
    // jinak v seznamu visel každý lektor jako „nezařazený“.
    data: res.data.filter((r) => !STAFF_ROLES.has(r.role)).map((r) => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      role: r.role,
      userClass: r.user_class,
      note: r.trida_poznamka,
      unassignedSince: r.nezarazen_od,
      requestId: r.zadost_id,
      requestClass: r.zadost_trida,
      nominatedClasses: r.nominace_tridy,
    })),
    error: null,
  };
}

export const requestClass = (className: string) =>
  call<string>('pozadat_o_tridu', { p_class: className });

export const declareMissingClass = (note: string) =>
  call<null>('nevidim_svou_tridu', { p_poznamka: note });

export const nominateToMyClass = (userId: string) =>
  call<null>('nominovat_do_tridy', { p_user: userId });

export const cancelNomination = (userId: string) =>
  call<null>('zrusit_nominaci', { p_user: userId });

export const decideNomination = (id: string, accept: boolean) =>
  call<null>('rozhodnout_nominaci', { p_id: id, p_prijmout: accept });

export const decideRequest = (id: string, approve: boolean) =>
  call<null>('rozhodnout_zadost', { p_id: id, p_schvalit: approve });

/** Lektor/správce: `className` null = vrátit mezi nezařazené. */
export const assignClass = (userId: string, className: string | null) =>
  call<null>('priradit_tridu', { p_user: userId, p_class: className });

export const appointCommander = (userId: string, className: string, reason?: string) =>
  call<null>('jmenovat_velitele', { p_user: userId, p_class: className, p_duvod: reason ?? null });

export const dismissCommander = (userId: string, reason?: string) =>
  call<null>('odvolat_velitele', { p_user: userId, p_duvod: reason ?? null });

/** Velitel: dočasný zástupce z členů třídy. `until` null = do odvolání. */
export const appointDeputy = (userId: string, until: string | null) =>
  call<null>('urcit_zastupce', { p_user: userId, p_plati_do: until });

export const cancelDeputy = (className: string) =>
  call<null>('zrusit_zastupce', { p_class: className });

/** Velitel předá funkci členovi třídy. Odůvodnění je povinné (min. 10 znaků). */
export const handOverCommand = (userId: string, reason: string) =>
  call<null>('predat_velitele', { p_user: userId, p_duvod: reason });

export interface ClassMember {
  id: string;
  fullName: string;
  role: string;
  isDeputy: boolean;
  avatarUrl: string | null;
}

interface MemberRow {
  id: string;
  full_name: string;
  role: string;
  je_zastupce: boolean;
  avatar_url: string | null;
}

export async function fetchClassMembers(className: string): Promise<RpcResult<ClassMember[]>> {
  const res = await call<MemberRow[]>('clenove_tridy', { p_class: className });
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    data: res.data.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      role: r.role,
      isDeputy: r.je_zastupce,
      avatarUrl: r.avatar_url,
    })),
    error: null,
  };
}

export type CommandHistoryKind = 'jmenovani' | 'odvolani' | 'predani' | 'zastupce' | 'zastupce_konec';

export interface CommandHistoryEntry {
  id: string;
  className: string;
  kind: CommandHistoryKind;
  before: string | null;
  after: string | null;
  reason: string | null;
  until: string | null;
  by: string | null;
  at: string;
}

interface HistoryRow {
  id: string;
  class_name: string;
  druh: CommandHistoryKind;
  kdo_pred: string | null;
  kdo_po: string | null;
  duvod: string | null;
  plati_do: string | null;
  provedl: string | null;
  kdy: string;
}

/** Historie funkce velitele — jen pro lektory a správce. */
export async function fetchCommandHistory(): Promise<RpcResult<CommandHistoryEntry[]>> {
  const res = await call<HistoryRow[]>('historie_velitelu');
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    data: res.data.map((r) => ({
      id: r.id,
      className: r.class_name,
      kind: r.druh,
      before: r.kdo_pred,
      after: r.kdo_po,
      reason: r.duvod,
      until: r.plati_do,
      by: r.provedl,
      at: r.kdy,
    })),
    error: null,
  };
}

/** „v seznamu 3 dny“ — jak dlouho je účet bez třídy. */
export function formatWaitingTime(sinceIso: string | null, now: Date = new Date()): string {
  if (!sinceIso) return '';
  const since = new Date(sinceIso);
  if (Number.isNaN(since.getTime())) return '';
  const hours = Math.max(0, Math.floor((now.getTime() - since.getTime()) / 3_600_000));
  if (hours < 1) return 'méně než hodinu';
  if (hours < 24) {
    if (hours === 1) return '1 hodinu';
    return hours <= 4 ? `${hours} hodiny` : `${hours} hodin`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 den';
  return days <= 4 ? `${days} dny` : `${days} dní`;
}
