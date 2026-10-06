import { supabase } from '../lib/supabase';
import { MissingFeature, RpcResult, call } from './classMembership';
import { ChatShare, parseChatShare } from './chatShare';
import type { StudyMaterial } from './materials';

// ─── Interní chat (migrace 052) ──────────────────────────────────────────────
//
// Přímé zprávy a skupinové konverzace. Tabulky jsou klientům zavřené; kdo
// smí psát (zařazení studenti a velitelé, lektoři, správci), kdo co vidí
// (jen své konverzace) a kdo moderuje (lektoři a správci jen nahlášené
// zprávy), rozhoduje server.

const CHAT_FEATURE: MissingFeature = { label: 'Chat', ending: 'ý', migration: '052' };
const ATTACH_FEATURE: MissingFeature = { label: 'Posílání příloh v chatu', ending: 'é', migration: '054' };

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

// ─── Přílohy (migrace 054) ───────────────────────────────────────────────────

export const CHAT_ATTACHMENT_BUCKET = 'chat-prilohy';
export const CHAT_MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Přípona → MIME. Kbelík přijme jen tyto typy (viz migrace 054). */
const ATTACHMENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  txt: 'text/plain',
  csv: 'text/csv',
};

/** Hodnota pro `accept` u výběru souboru. */
export const CHAT_ATTACHMENT_ACCEPT = Object.keys(ATTACHMENT_TYPES)
  .map((ext) => `.${ext}`)
  .join(',');

export const CHAT_ATTACHMENT_HINT = 'PDF, Word, Excel, PowerPoint, obrázek nebo text do 10 MB';

export interface ChatAttachment {
  path: string;
  name: string;
  type: string;
  size: number;
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot + 1).toLowerCase();
}

/** Ověří soubor před nahráním; vrací chybu pro uživatele, nebo null. */
export function checkAttachment(file: File): string | null {
  if (!ATTACHMENT_TYPES[extensionOf(file.name)]) {
    return `Tento typ souboru nejde poslat. Povoleno: ${CHAT_ATTACHMENT_HINT}.`;
  }
  if (file.size > CHAT_MAX_FILE_BYTES) return 'Soubor je větší než 10 MB.';
  if (file.size === 0) return 'Soubor je prázdný.';
  return null;
}

/**
 * Nahraje přílohu do složky konverzace. Jméno souboru v úložišti je náhodné;
 * původní název se posílá se zprávou. Typ se určuje podle přípony, protože
 * telefony ho u některých souborů (HEIC) neposílají.
 */
export async function uploadAttachment(
  conversationId: string,
  file: File
): Promise<RpcResult<{ path: string; name: string }>> {
  const invalid = checkAttachment(file);
  if (invalid) return { data: null, error: invalid };
  const ext = extensionOf(file.name);
  const path = `${conversationId}/${crypto.randomUUID()}.${ext}`;
  // Supabase u souboru (Blob) volbu `contentType` nepoužije a pošle typ, který
  // má soubor sám. Chromebook ani Windows u HEIC žádný nemají, kbelík pak
  // dostal application/octet-stream a nahrání odmítl. Proto se soubor přebalí
  // do Blobu s typem podle přípony.
  const body = file.slice(0, file.size, ATTACHMENT_TYPES[ext]);
  const { error } = await supabase.storage.from(CHAT_ATTACHMENT_BUCKET).upload(path, body, {
    contentType: ATTACHMENT_TYPES[ext],
    upsert: false,
  });
  if (error) {
    if (/bucket not found/i.test(error.message)) {
      return {
        data: null,
        error: `${ATTACH_FEATURE.label} zatím není na serveru zapnuté (chybí migrace ${ATTACH_FEATURE.migration}). Obraťte se prosím na správce.`,
      };
    }
    if (/row-level security|unauthorized|403/i.test(error.message)) {
      return { data: null, error: 'Soubor se nepodařilo nahrát. Za posledních 24 hodin jste možná poslali příliš mnoho příloh (nejvýš 40).' };
    }
    if (/mime type/i.test(error.message)) {
      return { data: null, error: `Tento typ souboru server nepřijal. Povoleno: ${CHAT_ATTACHMENT_HINT}.` };
    }
    return { data: null, error: `Soubor se nepodařilo nahrát: ${error.message}` };
  }
  return { data: { path, name: file.name }, error: null };
}

/** Úklid nahraného souboru, když se zpráva nakonec neodeslala nebo byla smazána. */
export async function removeAttachment(path: string): Promise<void> {
  await supabase.storage.from(CHAT_ATTACHMENT_BUCKET).remove([path]);
}

const signedUrlCache = new Map<string, { url: string; expires: number }>();
const SIGNED_URL_SECONDS = 3600;

/** Podepsaná adresa pro náhled obrázku (hodinu platná, drží se v paměti). */
export async function attachmentUrl(path: string): Promise<string | null> {
  const cached = signedUrlCache.get(path);
  if (cached && cached.expires > Date.now()) return cached.url;
  const { data, error } = await supabase.storage
    .from(CHAT_ATTACHMENT_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error || !data?.signedUrl) return null;
  signedUrlCache.set(path, { url: data.signedUrl, expires: Date.now() + (SIGNED_URL_SECONDS - 300) * 1000 });
  return data.signedUrl;
}

/** Příloha ve tvaru, který umí otevřít prohlížeč souborů z Knihovny. */
export function attachmentAsMaterial(a: ChatAttachment): StudyMaterial {
  return {
    name: a.path,
    displayName: a.name.replace(/\.[^.]+$/, ''),
    folderSubject: '',
    size: a.size,
    createdAt: '',
    mimeType: a.type,
  };
}

function attachmentFrom(row: {
  priloha_cesta?: string | null;
  priloha_nazev?: string | null;
  priloha_typ?: string | null;
  priloha_velikost?: number | null;
}): ChatAttachment | null {
  if (!row.priloha_cesta) return null;
  return {
    path: row.priloha_cesta,
    name: row.priloha_nazev || 'Příloha',
    type: row.priloha_typ ?? '',
    size: row.priloha_velikost ?? 0,
  };
}

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
  attachment: ChatAttachment | null;
  share: ChatShare | null;
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
  attachment: ChatAttachment | null;
  share: ChatShare | null;
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
  // Sloupce z migrace 054; na starší databázi chybí.
  priloha_cesta?: string | null;
  priloha_nazev?: string | null;
  priloha_typ?: string | null;
  priloha_velikost?: number | null;
  sdileni?: unknown;
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
  priloha_cesta?: string | null;
  priloha_nazev?: string | null;
  priloha_typ?: string | null;
  priloha_velikost?: number | null;
  sdileni?: unknown;
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
        attachment: attachmentFrom(r),
        share: parseChatShare(r.sdileni),
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
      attachment: attachmentFrom(r),
      share: parseChatShare(r.sdileni),
    })),
    error: null,
  };
}

export const openDirectConversation = (userId: string) =>
  call<string>('chat_zalozit_primou', { p_user: userId }, CHAT_FEATURE);

export const createGroup = (name: string, memberIds: string[]) =>
  call<string>('chat_zalozit_skupinu', { p_nazev: name, p_clenove: memberIds }, CHAT_FEATURE);

/**
 * Odeslání zprávy. Samotný text jde se dvěma parametry jako dřív, takže
 * funguje i na databázi bez migrace 054; příloha nebo sdílená věc ji vyžadují.
 */
export function sendMessage(
  conversationId: string,
  text: string,
  extra?: { attachment?: { path: string; name: string }; share?: ChatShare }
): Promise<RpcResult<string>> {
  if (!extra?.attachment && !extra?.share) {
    return call<string>('chat_odeslat', { p_konv: conversationId, p_text: text }, CHAT_FEATURE);
  }
  return call<string>(
    'chat_odeslat',
    {
      p_konv: conversationId,
      p_text: text,
      p_priloha: extra.attachment?.path ?? null,
      p_priloha_nazev: extra.attachment?.name ?? null,
      p_sdileni: extra.share ?? null,
    },
    ATTACH_FEATURE
  );
}

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
