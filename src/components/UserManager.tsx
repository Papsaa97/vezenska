import React, { useState, useEffect, useCallback, useMemo, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Loader2,
  Mail,
  CalendarDays,
  Award,
  Pencil,
  Trash2,
  Send,
  Megaphone,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Save,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { writeFailure } from '../utils/supabaseWrite';
import { useAuth, useIsAdmin, UserRole } from '../context/AuthContext';
import { getUserRank } from '../utils/gamification';
import { useDialog } from '../hooks/useDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Přesný tvar jednoho řádku v konzoli správy uživatelů (public.profiles + odvozené XP). */
export interface UserProfileItem {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  totalXp: number;
}

/** Přesný tvar záznamu z tabulky public.user_notifications. */
export interface UserNotification {
  id: string;
  user_id: string;
  sender_id: string | null;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

/** Syrový tvar řádku vráceného Supabase pro dotaz nad public.profiles. */
interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

/** Syrový tvar řádku pro odhad XP z historie testů (public.quiz_results). */
interface QuizResultXpRow {
  user_id: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  velitel_tridy: 'Velitel třídy',
  lektor: 'Lektor',
  admin: 'Správce',
};

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  student: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40',
  velitel_tridy: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40',
  lektor: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40',
  admin: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Odhad XP pouze z historie testů uloženej v Supabase (quiz_results).
 * Nepoužívá se sdílená calculateBaseXp() z utils/gamification.ts, protože ta
 * pro bonusové XP (scénáře, střelecké nácviky) čte localStorage AKTUÁLNÍHO
 * prohlížeče – v kontextu admin konzole by tak omylem přičetla data
 * přihlášeného správce ke každému zobrazenému uživateli.
 */
function calculateQuizXpForResult(row: QuizResultXpRow): number {
  let xp = (row.correct_answers || 0) * 15 + 50;
  if (row.accuracy === 100 && row.total_questions >= 5) xp += 100;
  else if (row.accuracy >= 80 && row.total_questions >= 5) xp += 50;
  return xp;
}

// ─── Access guard ─────────────────────────────────────────────────────────────

export default function UserManager() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();

  // Přísný guard: pouze role 'admin' – studenti ani lektoři sem nesmí, bez ohledu na to, odkud je komponenta vykreslena.
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <ShieldAlert className="w-12 h-12 text-amber-500 opacity-60" />
        <div className="text-center">
          <div className="font-bold text-slate-700 dark:text-slate-300">Přístup odepřen</div>
          <div className="text-sm mt-1">Správa uživatelů je dostupná pouze pro správce systému.</div>
        </div>
      </div>
    );
  }

  return <UserManagerInner />;
}

// ─── Main component ───────────────────────────────────────────────────────────

function UserManagerInner() {
  const { user, updateRole } = useAuth();
  const currentUserId = user?.id ?? null;

  const [users, setUsers] = useState<UserProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<UserProfileItem | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserProfileItem | null>(null);
  const [messageTarget, setMessageTarget] = useState<UserProfileItem | 'all' | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data: profileRows, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (profileError || !profileRows) {
        setLoadError(profileError?.message ?? 'Nepodařilo se načíst seznam uživatelů.');
        setUsers([]);
        return;
      }

      // Best-effort: pokud dosud nebyl spuštěn supabase/admin_user_management.sql,
      // dotaz selže na RLS a XP se pro všechny zobrazí jako 0 (neblokuje zbytek konzole).
      const { data: resultRows } = await supabase
        .from('quiz_results')
        .select('user_id, total_questions, correct_answers, accuracy');

      const xpByUser = new Map<string, number>();
      ((resultRows ?? []) as QuizResultXpRow[]).forEach((row) => {
        xpByUser.set(row.user_id, (xpByUser.get(row.user_id) ?? 0) + calculateQuizXpForResult(row));
      });

      const items: UserProfileItem[] = (profileRows as ProfileRow[]).map((row) => ({
        id: row.id,
        email: row.email ?? '',
        full_name: row.full_name,
        role: row.role,
        created_at: row.created_at,
        totalXp: xpByUser.get(row.id) ?? 0,
      }));

      setUsers(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => (u.full_name ?? '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  // Role se mění jedinou cestou v celé aplikaci — přes updateRole() z AuthContextu.
  // Ten zapisuje výhradně do databáze (oprávnění vynucuje RLS) a hlásí i zamítnutí,
  // které se u UPDATE projeví jako nula zasažených řádků, nikoli jako chyba.
  const handleRoleChange = useCallback(async (target: UserProfileItem, newRole: UserRole) => {
    if (newRole === target.role) return;
    setUpdatingRoleId(target.id);
    const { error } = await updateRole(target.id, newRole);
    if (error) {
      alert(error);
    } else {
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role: newRole } : u)));
    }
    setUpdatingRoleId(null);
  }, [updateRole]);

  const handleDeleteUser = useCallback(async (target: UserProfileItem) => {
    setDeletingId(target.id);
    const { error } = await supabase.rpc('admin_delete_user', { target_user_id: target.id });
    setDeletingId(null);
    if (error) {
      alert('Smazání uživatele selhalo: ' + error.message);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== target.id));
    setConfirmDeleteUser(null);
  }, []);

  const handleSendMessage = useCallback(
    async (title: string, body: string): Promise<string | null> => {
      if (!currentUserId) return 'Nejste přihlášeni.';

      const recipients =
        messageTarget === 'all'
          ? users.filter((u) => u.id !== currentUserId)
          : messageTarget
          ? [messageTarget]
          : [];

      if (recipients.length === 0) return 'Nebyl nalezen žádný příjemce.';

      const rows = recipients.map((r) => ({
        user_id: r.id,
        sender_id: currentUserId,
        title,
        body,
      }));

      const { error } = await supabase.from('user_notifications').insert(rows);
      return error?.message ?? null;
    },
    [messageTarget, users, currentUserId]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              Správa uživatelů
              {!loading && (
                <span className="font-normal text-slate-400 text-xs">
                  ({filteredUsers.length} z {users.length})
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Role, profily a hromadné zprávy pro registrované uživatele</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMessageTarget('all')}
          disabled={loading || users.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm shadow-amber-500/25 shrink-0"
        >
          <Megaphone className="w-4 h-4" />
          Hromadná zpráva všem
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Hledat podle jména nebo e-mailu…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
        />
      </div>

      {/* Loading / error / empty states */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-12">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          Načítám uživatele…
        </div>
      )}

      {!loading && loadError && (
        <div className="flex items-center gap-2 p-4 rounded-2xl text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" /> {loadError}
        </div>
      )}

      {!loading && !loadError && filteredUsers.length === 0 && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 space-y-2">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">
            {users.length === 0 ? 'Zatím nejsou registrováni žádní uživatelé' : 'Žádný uživatel neodpovídá hledání'}
          </div>
        </div>
      )}

      {!loading && !loadError && filteredUsers.length > 0 && (
        <>
          {/* Mobile: karty (mobile-first, žádná přetékající tabulka) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredUsers.map((item) => (
              <UserCard
                key={item.id}
                item={item}
                isSelf={item.id === currentUserId}
                busyRole={updatingRoleId === item.id}
                deleting={deletingId === item.id}
                onRoleChange={(role) => handleRoleChange(item, role)}
                onEdit={() => setEditingUser(item)}
                onMessage={() => setMessageTarget(item)}
                onDeleteRequest={() => setConfirmDeleteUser(item)}
              />
            ))}
          </div>

          {/* Desktop: tabulka */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-left text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-bold">Jméno</th>
                  <th className="px-4 py-3 font-bold">E-mail</th>
                  <th className="px-4 py-3 font-bold">Registrace</th>
                  <th className="px-4 py-3 font-bold">Hodnost / XP</th>
                  <th className="px-4 py-3 font-bold">Role</th>
                  <th className="px-4 py-3 font-bold text-right">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 bg-white dark:bg-slate-800/60">
                {filteredUsers.map((item) => (
                  <UserTableRow
                    key={item.id}
                    item={item}
                    isSelf={item.id === currentUserId}
                    busyRole={updatingRoleId === item.id}
                    deleting={deletingId === item.id}
                    onRoleChange={(role) => handleRoleChange(item, role)}
                    onEdit={() => setEditingUser(item)}
                    onMessage={() => setMessageTarget(item)}
                    onDeleteRequest={() => setConfirmDeleteUser(item)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Dialogy */}
      <AnimatePresence>
        {editingUser && (
          <EditNameDialog
            key="edit-name"
            targetUser={editingUser}
            onClose={() => setEditingUser(null)}
            onSaved={(newName) => {
              setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, full_name: newName } : u)));
              setEditingUser(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteUser && (
          <DeleteConfirmDialog
            key="confirm-delete"
            targetUser={confirmDeleteUser}
            deleting={deletingId === confirmDeleteUser.id}
            onCancel={() => setConfirmDeleteUser(null)}
            onConfirm={() => handleDeleteUser(confirmDeleteUser)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {messageTarget !== null && (
          <SendMessageModal
            key="send-message"
            target={messageTarget}
            recipientCount={messageTarget === 'all' ? users.filter((u) => u.id !== currentUserId).length : 1}
            onClose={() => setMessageTarget(null)}
            onSend={handleSendMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Row actions (sdíleno mezi kartou a tabulkou) ─────────────────────────────

interface RoleSelectProps {
  value: UserRole;
  disabled: boolean;
  onChange: (role: UserRole) => void;
}

function RoleSelect({ value, disabled, onChange }: RoleSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as UserRole)}
      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50 cursor-pointer"
    >
      <option value="student">Student</option>
      <option value="velitel_tridy">Velitel třídy</option>
      <option value="lektor">Lektor</option>
      <option value="admin">Správce</option>
    </select>
  );
}

interface RowActionsProps {
  isSelf: boolean;
  deleting: boolean;
  onEdit: () => void;
  onMessage: () => void;
  onDeleteRequest: () => void;
}

function RowActions({ isSelf, deleting, onEdit, onMessage, onDeleteRequest }: RowActionsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onMessage}
        title="Zaslat zprávu"
        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
      >
        <Send className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onEdit}
        title="Upravit jméno"
        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onDeleteRequest}
        disabled={isSelf || deleting}
        title={isSelf ? 'Nelze smazat vlastní účet' : 'Smazat uživatele'}
        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
      >
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

interface UserRowProps {
  item: UserProfileItem;
  isSelf: boolean;
  busyRole: boolean;
  deleting: boolean;
  onRoleChange: (role: UserRole) => void;
  onEdit: () => void;
  onMessage: () => void;
  onDeleteRequest: () => void;
}

function UserTableRow({ item, isSelf, busyRole, deleting, onRoleChange, onEdit, onMessage, onDeleteRequest }: UserRowProps) {
  const { currentRank } = getUserRank(item.totalXp);
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
        {item.full_name || <span className="text-slate-400 italic font-normal">Bez jména</span>}
        {isSelf && <span className="ml-1.5 text-[10px] font-bold text-amber-500">(vy)</span>}
      </td>
      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.email}</td>
      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(item.created_at)}</td>
      <td
        className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap"
        title="Odhad na základě uložené historie testů"
      >
        {currentRank.shortTitle} <span className="text-slate-400">· {item.totalXp.toLocaleString('cs-CZ')} XP</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${ROLE_BADGE_CLASSES[item.role]}`}>
            {ROLE_LABELS[item.role]}
          </span>
          <RoleSelect value={item.role} disabled={busyRole} onChange={onRoleChange} />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end">
          <RowActions isSelf={isSelf} deleting={deleting} onEdit={onEdit} onMessage={onMessage} onDeleteRequest={onDeleteRequest} />
        </div>
      </td>
    </tr>
  );
}

function UserCard({ item, isSelf, busyRole, deleting, onRoleChange, onEdit, onMessage, onDeleteRequest }: UserRowProps) {
  const { currentRank } = getUserRank(item.totalXp);
  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
            {item.full_name || <span className="text-slate-400 italic font-normal">Bez jména</span>}
            {isSelf && <span className="ml-1.5 text-[10px] font-bold text-amber-500">(vy)</span>}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3 shrink-0" /> {item.email}
          </div>
        </div>
        <span className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${ROLE_BADGE_CLASSES[item.role]}`}>
          {ROLE_LABELS[item.role]}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2.5">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> {formatDate(item.created_at)}
        </span>
        <span className="flex items-center gap-1.5" title="Odhad na základě uložené historie testů">
          <Award className="w-3.5 h-3.5" /> {currentRank.shortTitle} · {item.totalXp.toLocaleString('cs-CZ')} XP
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <RoleSelect value={item.role} disabled={busyRole} onChange={onRoleChange} />
        <RowActions isSelf={isSelf} deleting={deleting} onEdit={onEdit} onMessage={onMessage} onDeleteRequest={onDeleteRequest} />
      </div>
    </div>
  );
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────

interface EditNameDialogProps {
  targetUser: UserProfileItem;
  onClose: () => void;
  onSaved: (newName: string) => void;
}

function EditNameDialog({ targetUser, onClose, onSaved }: EditNameDialogProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const [name, setName] = useState(targetUser.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Jméno nesmí být prázdné.');
      return;
    }
    setSaving(true);
    setError(null);
    // .select() je tu nutnost: cizí profil smí přejmenovat jen správce a RLS to
    // zamítne tím, že UPDATE nezasáhne žádný řádek — bez chyby. Bez kontroly se
    // dialog zavřel, jméno se v seznamu přepsalo a v databázi zůstalo staré.
    const res = await supabase
      .from('profiles')
      .update({ full_name: trimmed })
      .eq('id', targetUser.id)
      .select('id');
    setSaving(false);
    const failure = writeFailure('Jméno uživatele', res);
    if (failure) {
      setError(failure);
    } else {
      onSaved(trimmed);
    }
  };

  // Escape (ne během ukládání), past na fokus a jeho návrat — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose, closeOnEscape: !saving });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Úprava uživatele"
      tabIndex={-1}
      className="no-print fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={saving ? undefined : onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-500" />
            Upravit jméno uživatele
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor={`${fieldIds}-0`}>Jméno a příjmení</label>
            <input
              id={`${fieldIds}-0`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div className="text-xs text-slate-400">{targetUser.email}</div>
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-all cursor-pointer disabled:opacity-50"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Uložit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

interface DeleteConfirmDialogProps {
  targetUser: UserProfileItem;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirmDialog({ targetUser, deleting, onCancel, onConfirm }: DeleteConfirmDialogProps) {
  // Escape (ne během mazání), past na fokus a jeho návrat — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose: onCancel, closeOnEscape: !deleting });

  return (
    <div
      ref={dialogRef}
      role="alertdialog"
      aria-modal="true"
      aria-label="Potvrzení smazání uživatele"
      tabIndex={-1}
      className="no-print fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={deleting ? undefined : onCancel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800/60 rounded-2xl shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Trvale smazat uživatele?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Chystáte se nenávratně smazat účet{' '}
              <strong className="text-slate-700 dark:text-slate-200">{targetUser.full_name || targetUser.email}</strong> (
              {targetUser.email}). Dojde ke smazání přihlašovacích údajů, profilu i veškerých souvisejících dat. Tuto akci
              nelze vzít zpět.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-all cursor-pointer disabled:opacity-50"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Trvale smazat
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface SendMessageModalProps {
  target: UserProfileItem | 'all';
  recipientCount: number;
  onClose: () => void;
  onSend: (title: string, body: string) => Promise<string | null>;
}

function SendMessageModal({ target, recipientCount, onClose, onSend }: SendMessageModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isBulk = target === 'all';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setError(null);
    const errMsg = await onSend(title.trim(), body.trim());
    setSending(false);
    if (errMsg) {
      setError(errMsg);
    } else {
      setSuccess(true);
      setTimeout(onClose, 1200);
    }
  };

  // Escape (ne během odesílání), past na fokus a jeho návrat — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose, closeOnEscape: !sending });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={isBulk ? 'Hromadná zpráva všem' : 'Zaslat zprávu uživateli'}
      tabIndex={-1}
      className="no-print fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={sending ? undefined : onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            {isBulk ? <Megaphone className="w-4 h-4 text-amber-500" /> : <Send className="w-4 h-4 text-blue-500" />}
            {isBulk ? 'Hromadná zpráva všem' : 'Zaslat zprávu uživateli'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          {isBulk ? (
            <>
              Zpráva bude doručena všem registrovaným uživatelům (<strong>{recipientCount}</strong>).
            </>
          ) : (
            <>
              Příjemce:{' '}
              <strong className="text-slate-700 dark:text-slate-200">{target.full_name || target.email}</strong> (
              {target.email})
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor={`${fieldIds}-0`}>Předmět / Titulek *</label>
            <input
              id={`${fieldIds}-0`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Např. Důležité oznámení"
              disabled={success}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5" htmlFor={`${fieldIds}-1`}>Text zprávy *</label>
            <textarea
              id={`${fieldIds}-1`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={5}
              maxLength={4000}
              placeholder="Znění zprávy pro uživatele…"
              disabled={success}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Zpráva byla úspěšně odeslána.
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-all cursor-pointer disabled:opacity-50"
            >
              Zavřít
            </button>
            <button
              type="submit"
              disabled={sending || success || !title.trim() || !body.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Odeslat
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
