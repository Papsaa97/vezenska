import { MissingFeature, RpcResult, call } from './classMembership';

// ─── Interní chat (migrace 052) ──────────────────────────────────────────────
//
// Přímé zprávy a skupinové konverzace. Tabulky jsou klientům zavřené; kdo
// smí psát (zařazení studenti a velitelé, lektoři, správci), kdo co vidí
// (jen své konverzace) a kdo moderuje (lektoři a správci jen nahlášené
// zprávy), rozhoduje server.

const CHAT_FEATURE: MissingFeature = { label: 'Chat', ending: 'ý', migration: '052' };

/** Událost: změnil se počet nepřečtených (hlavička si ho načte znovu). */
export const CHAT_UNREAD_CHANGED_EVENT = 'vscr-chat-neprectene';

export function announceUnreadChanged(): void {
  window.dispatchEvent(new Event(CHAT_UNREAD_CHANGED_EVENT));
}

export const CHAT_MAX_TEXT = 2000;
export const CHAT_MAX_GROUP_NAME = 80;
export const CHAT_MAX_GROUP_MEMBERS = 50;

export const CHAT_ROLE_LABEL: Record<string, string> = {
  student: 'Student',
  velitel_tridy: 'Velitel',
  lektor: 'Lektor',
  admin: 'Správce',
};

export interface ChatPerson {
  id: string;
  name: string;
  role: string | null;
  className: string | null;
}

export interface ChatConversation {
  id: string;
  isGroup: boolean;
  /** Název skupiny, u přímé konverzace jméno druhého člověka. */
  title: string;
  otherUserId: string | null;
  otherUserRole: string | null;
  memberCount: number;
  lastText: string | null;
  lastAuthor: string | null;
  lastIsMine: boolean;
  lastAt: string;
  unread: number;
  muted: boolean;
  /** Volající skupinu založil (nebo správu převzal) a smí ji upravovat. */
  canManage: boolean;
}

export interface ChatMessage {
  id: string;
  authorId: string | null;
  authorName: string;
  authorRole: string | null;
  text: string;
  createdAt: string;
  deleted: boolean;
  mine: boolean;
  reportedByMe: boolean;
}

export interface ChatMember {
  id: string;
  name: string;
  role: string | null;
  className: string | null;
  founder: boolean;
}

export interface ChatReport {
  id: string;
  messageId: string;
  text: string;
  authorName: string;
  messageAt: string;
  messageDeleted: boolean;
  conversation: string;
  reporterName: string;
  reason: string;
  createdAt: string;
  resolvedAt: string | null;
  resolverName: string | null;
  messageHidden: boolean;
}

interface PersonRow {
  id: string;
  jmeno: string | null;
  role: string | null;
  trida: string | null;
}

interface ConversationRow {
  id: string;
  je_skupina: boolean;
  nazev: string | null;
  protistrana_id: string | null;
  protistrana_role: string | null;
  pocet_clenu: number | null;
  posledni_text: string | null;
  posledni_autor: string | null;
  posledni_moje: boolean | null;
  posledni_cas: string;
  neprectene: number | null;
  ztlumeno: boolean;
  spravuji: boolean;
}

interface MessageRow {
  id: string;
  autor_id: string | null;
  autor_jmeno: string;
  autor_role: string | null;
  text: string;
  vytvoreno: string;
  smazano: boolean;
  moje: boolean;
  nahlasil_jsem: boolean;
}

interface MemberRow {
  id: string;
  jmeno: string;
  role: string | null;
  trida: string | null;
  zakladatel: boolean;
}

interface ReportRow {
  id: string;
  zprava_id: string;
  text: string;
  autor_jmeno: string;
  zprava_cas: string;
  zprava_smazana: boolean;
  konverzace: string;
  nahlasil_jmeno: string;
  duvod: string;
  vytvoreno: string;
  vyrizeno: string | null;
  vyridil_jmeno: string | null;
  zprava_skryta: boolean;
}

export const fetchChatAccess = () => call<boolean>('chat_pristup', undefined, CHAT_FEATURE);

export const fetchUnreadCount = () => call<number>('chat_neprectene', undefined, CHAT_FEATURE);

export async function fetchPeople(search: string): Promise<RpcResult<ChatPerson[]>> {
  const res = await call<PersonRow[]>('chat_lide', { p_hledat: search.trim() || null }, CHAT_FEATURE);
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    data: res.data.map((r) => ({ id: r.id, name: r.jmeno ?? 'Uživatel', role: r.role, className: r.trida })),
    error: null,
  };
}

export async function fetchConversations(): Promise<RpcResult<ChatConversation[]>> {
  const res = await call<ConversationRow[]>('chat_konverzace_seznam', undefined, CHAT_FEATURE);
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    data: res.data.map((r) => ({
      id: r.id,
      isGroup: r.je_skupina,
      title: r.nazev ?? 'Konverzace',
      otherUserId: r.protistrana_id,
      otherUserRole: r.protistrana_role,
      memberCount: r.pocet_clenu ?? 0,
      lastText: r.posledni_text,
      lastAuthor: r.posledni_autor,
      lastIsMine: r.posledni_moje === true,
      lastAt: r.posledni_cas,
      unread: r.neprectene ?? 0,
      muted: r.ztlumeno,
      canManage: r.spravuji,
    })),
    error: null,
  };
}

/** Zprávy od nejstarší po nejnovější. `before` = načíst starší než tento čas. */
export async function fetchMessages(conversationId: string, before?: string): Promise<RpcResult<ChatMessage[]>> {
  const res = await call<MessageRow[]>(
    'chat_zpravy_konverzace',
    { p_konv: conversationId, p_pred: before ?? null },
    CHAT_FEATURE
  );
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    data: res.data
      .map((r) => ({
        id: r.id,
        authorId: r.autor_id,
        authorName: r.autor_jmeno,
        authorRole: r.autor_role,
        text: r.text,
        createdAt: r.vytvoreno,
        deleted: r.smazano,
        mine: r.moje,
        reportedByMe: r.nahlasil_jsem,
      }))
      .reverse(),
    error: null,
  };
}

export async function fetchMembers(conversationId: string): Promise<RpcResult<ChatMember[]>> {
  const res = await call<MemberRow[]>('chat_clenove_konverzace', { p_konv: conversationId }, CHAT_FEATURE);
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    data: res.data.map((r) => ({
      id: r.id,
      name: r.jmeno,
      role: r.role,
      className: r.trida,
      founder: r.zakladatel,
    })),
    error: null,
  };
}

export async function fetchReports(includeResolved: boolean): Promise<RpcResult<ChatReport[]>> {
  const res = await call<ReportRow[]>('chat_nahlaseni_seznam', { p_vcetne_vyrizenych: includeResolved }, CHAT_FEATURE);
  if (res.error || !res.data) return { data: null, error: res.error };
  return {
    data: res.data.map((r) => ({
      id: r.id,
      messageId: r.zprava_id,
      text: r.text,
      authorName: r.autor_jmeno,
      messageAt: r.zprava_cas,
      messageDeleted: r.zprava_smazana,
      conversation: r.konverzace,
      reporterName: r.nahlasil_jmeno,
      reason: r.duvod,
      createdAt: r.vytvoreno,
      resolvedAt: r.vyrizeno,
      resolverName: r.vyridil_jmeno,
      messageHidden: r.zprava_skryta,
    })),
    error: null,
  };
}

export const openDirectConversation = (userId: string) =>
  call<string>('chat_zalozit_primou', { p_user: userId }, CHAT_FEATURE);

export const createGroup = (name: string, memberIds: string[]) =>
  call<string>('chat_zalozit_skupinu', { p_nazev: name, p_clenove: memberIds }, CHAT_FEATURE);

export const sendMessage = (conversationId: string, text: string) =>
  call<string>('chat_odeslat', { p_konv: conversationId, p_text: text }, CHAT_FEATURE);

export const markRead = (conversationId: string) =>
  call<null>('chat_precteno', { p_konv: conversationId }, CHAT_FEATURE);

export const deleteMessage = (messageId: string) =>
  call<null>('chat_smazat_zpravu', { p_zprava: messageId }, CHAT_FEATURE);

export const reportMessage = (messageId: string, reason: string) =>
  call<null>('chat_nahlasit', { p_zprava: messageId, p_duvod: reason }, CHAT_FEATURE);

export const resolveReport = (reportId: string, hideMessage: boolean) =>
  call<null>('chat_vyridit_nahlaseni', { p_nahlaseni: reportId, p_skryt: hideMessage }, CHAT_FEATURE);

/** Správa skupiny zakladatelem; `null` = beze změny. */
export const updateGroup = (
  conversationId: string,
  changes: { name?: string | null; add?: string[] | null; remove?: string[] | null }
) =>
  call<null>(
    'chat_upravit_skupinu',
    {
      p_konv: conversationId,
      p_nazev: changes.name ?? null,
      p_pridat: changes.add ?? null,
      p_odebrat: changes.remove ?? null,
    },
    CHAT_FEATURE
  );

export const leaveGroup = (conversationId: string) =>
  call<null>('chat_opustit_skupinu', { p_konv: conversationId }, CHAT_FEATURE);

export const setMuted = (conversationId: string, muted: boolean) =>
  call<null>('chat_ztlumit', { p_konv: conversationId, p_ztlumit: muted }, CHAT_FEATURE);

/** Id konverzace z adresy `#chat/<id>` (odkaz z upozornění), jinak null. */
export function conversationIdFromHash(hash: string): string | null {
  const [tab, id] = hash.replace(/^#/, '').split('/');
  if (tab !== 'chat' || !id) return null;
  return /^[0-9a-f-]{36}$/i.test(id) ? id : null;
}

export function formatChatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
  });
}
