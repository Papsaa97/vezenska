import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCheck, Check, Loader2, Inbox, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserNotification } from './UserManager';

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationBell() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  /** Chyba načtení nebo zápisu. Bez ní se selhání projeví jen tím, že se „nic nestane". */
  const [notice, setNotice] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_notifications')
      .select('id, user_id, sender_id, title, body, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      // Bez tohohle hlášení vypadá nedostupný server stejně jako „žádné zprávy" —
      // uživatel by o zprávě od správce nevěděl a neměl by jak zjistit proč.
      setNotice(`Zprávy se nepodařilo načíst (${error.message}).`);
    } else if (data) {
      setNotice(null);
      setNotifications(data as UserNotification[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications(user.id);
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user, loadNotifications]);

  // Zavření po kliknutí mimo panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const markAsRead = async (notification: UserNotification) => {
    if (notification.is_read || markingId) return;
    setMarkingId(notification.id);
    const { error } = await supabase.from('user_notifications').update({ is_read: true }).eq('id', notification.id);
    if (error) {
      setNotice(`Zprávu se nepodařilo označit jako přečtenou (${error.message}).`);
    } else {
      setNotice(null);
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
    }
    setMarkingId(null);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Zobrazí se hned, ale při neúspěchu se to musí vrátit zpět. Dřív se výsledek
    // zápisu vůbec nečetl: odznak zmizel, v databázi zůstaly zprávy nepřečtené
    // a při dalším otevření aplikace se objevily znovu bez vysvětlení.
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    const { error } = await supabase.from('user_notifications').update({ is_read: true }).in('id', unreadIds);
    if (error) {
      setNotifications(previous);
      setNotice(`Zprávy se nepodařilo označit jako přečtené (${error.message}).`);
    } else {
      setNotice(null);
    }
  };

  if (!user) return null;

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700"
        title="Zprávy od správce"
        aria-label="Oznámení"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm border border-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] max-h-[70vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-3 space-y-2 z-50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800">
              <span className="font-bold text-sm text-white">Zprávy</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Označit vše jako přečtené
                </button>
              )}
            </div>

            {notice && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2 bg-red-950/50 border border-red-800/70 rounded-xl px-2.5 py-2 text-[11px] text-red-200 leading-snug"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                <span>{notice}</span>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs py-8">
                <Loader2 className="w-4 h-4 animate-spin" /> Načítám…
              </div>
            )}

            {!loading && !notice && notifications.length === 0 && (
              <div className="flex flex-col items-center gap-2 text-slate-500 text-xs py-8">
                <Inbox className="w-8 h-8 opacity-50" />
                Zatím žádné zprávy
              </div>
            )}

            {!loading &&
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    n.is_read ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-blue-950/30 border-blue-800/50 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate">{n.title}</div>
                      <div className="text-[11px] mt-1 whitespace-pre-wrap break-words opacity-90">{n.body}</div>
                      <div className="text-[10px] mt-1.5 opacity-60">{formatDateTime(n.created_at)}</div>
                    </div>
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(n)}
                        disabled={markingId === n.id}
                        title="Označit jako přečtené"
                        className="shrink-0 p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-blue-800/50 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {markingId === n.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
