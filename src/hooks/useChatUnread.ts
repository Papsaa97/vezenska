import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CHAT_UNREAD_CHANGED_EVENT, fetchUnreadCount } from '../utils/chat';

/** Jak často se počet nepřečtených načte znovu, když je stránka vidět. */
const REFRESH_MS = 30_000;

/**
 * Počet nepřečtených zpráv v chatu pro odznak v hlavičce. Ztlumené
 * konverzace se nepočítají. Chyba (např. chybějící migrace 052) se tu
 * neukazuje — odznak prostě zůstane prázdný a důvod vysvětlí záložka Chat.
 */
export function useChatUnread(): number {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(0);

  const load = useCallback(async () => {
    const res = await fetchUnreadCount();
    setCount(res.error || typeof res.data !== 'number' ? 0 : res.data);
  }, []);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    void load();
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    const onChanged = () => void load();
    document.addEventListener('visibilitychange', refreshIfVisible);
    window.addEventListener(CHAT_UNREAD_CHANGED_EVENT, onChanged);
    const timer = window.setInterval(refreshIfVisible, REFRESH_MS);
    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.removeEventListener(CHAT_UNREAD_CHANGED_EVENT, onChanged);
      window.clearInterval(timer);
    };
  }, [user, load]);

  return count;
}
