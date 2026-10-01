import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { PROGRESS_EVENT, readScoped, writeScoped } from '../utils/userScopedStorage';

/**
 * Viděl už uživatel úvodní zprávu po prvním přihlášení?
 *
 * KDE SE TO PAMATUJE: u účtu (user_metadata v Supabase Auth, stejně jako
 * velikost zobrazení a viděné odznaky), aby se zpráva neukázala znovu na
 * jiném zařízení. Kopie v úložišti vázaném na účet drží stav i bez sítě —
 * kdyby se zápis k účtu nepovedl, v tomto zařízení se zpráva už neukáže.
 *
 * Verze umožní ukázat zprávu znovu všem, kdyby se v ní někdy změnilo něco
 * podstatného (stačí zvýšit číslo).
 */

const LOCAL_KEY = 'vscr_welcome_seen';
const METADATA_KEY = 'welcome_seen';
const WELCOME_VERSION = 1;

function isSeen(value: unknown): boolean {
  return typeof value === 'number' && value >= WELCOME_VERSION;
}

export function useWelcomeSeen(): { seen: boolean; markSeen: () => void } {
  const { user } = useAuth();
  const remote: unknown = user?.user_metadata?.[METADATA_KEY];
  const [local, setLocal] = useState<unknown>(() => readScoped<unknown>(LOCAL_KEY, 0));

  // Po přihlášení jiného účtu se úložiště přepne — načíst znovu.
  useEffect(() => {
    const reload = () => setLocal(readScoped<unknown>(LOCAL_KEY, 0));
    reload();
    window.addEventListener(PROGRESS_EVENT, reload);
    return () => window.removeEventListener(PROGRESS_EVENT, reload);
  }, [user?.id]);

  const markSeen = useCallback(() => {
    setLocal(WELCOME_VERSION);
    writeScoped(LOCAL_KEY, WELCOME_VERSION);
    if (!user) return;
    supabase.auth.updateUser({ data: { [METADATA_KEY]: WELCOME_VERSION } }).then(({ error }) => {
      // Nevadí: v tomto zařízení je označeno, jen se to nepřenese na jiná.
      if (error) console.warn('[useWelcomeSeen] Uložení k účtu se nepodařilo:', error.message);
    });
  }, [user]);

  return { seen: isSeen(remote) || isSeen(local), markSeen };
}
