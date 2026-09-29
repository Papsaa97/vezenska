import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { PROGRESS_EVENT, readScoped, writeScoped } from '../utils/userScopedStorage';

/**
 * Upozornění na nové odznaky („1“ u Odznaků a tečka u „Další“).
 *
 * PROČ: hlavička dřív ukazovala počet všech získaných odznaků, takže jakmile
 * student získal první, upozornění už nikdy nezmizelo. Teď ukazuje jen odznaky,
 * které student ještě neviděl; otevřením záložky Odznaky se označí za viděné.
 *
 * KDE SE TO PAMATUJE: u účtu (user_metadata v Supabase Auth, stejně jako
 * velikost zobrazení), aby se upozornění neukázalo znovu na jiném zařízení.
 * Kopie v úložišti vázaném na účet drží stav i bez sítě a pro hosta.
 */

const SEEN_KEY = 'vscr_seen_badges';
const METADATA_KEY = 'seen_badges';

function toIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function readLocalSeen(): string[] {
  return toIds(readScoped<unknown>(SEEN_KEY, []));
}

/** Vrátí počet získaných, ale dosud neviděných odznaků. */
export function useSeenBadges(unlockedIds: readonly string[], badgesTabOpen: boolean): number {
  const { user } = useAuth();
  const remoteSeen: unknown = user?.user_metadata?.[METADATA_KEY];
  const [localSeen, setLocalSeen] = useState<string[]>(readLocalSeen);

  // Po přihlášení jiného účtu (nebo zápisu z jiné komponenty) načíst znovu.
  useEffect(() => {
    const reload = () => setLocalSeen(readLocalSeen());
    window.addEventListener(PROGRESS_EVENT, reload);
    return () => window.removeEventListener(PROGRESS_EVENT, reload);
  }, []);

  const seen = useMemo(() => new Set([...localSeen, ...toIds(remoteSeen)]), [localSeen, remoteSeen]);
  const unseen = useMemo(() => unlockedIds.filter((id) => !seen.has(id)), [unlockedIds, seen]);

  useEffect(() => {
    if (!badgesTabOpen || unseen.length === 0) return;
    const next = Array.from(new Set([...seen, ...unseen])).sort();
    setLocalSeen(next);
    writeScoped(SEEN_KEY, next);
    if (user) {
      supabase.auth.updateUser({ data: { [METADATA_KEY]: next } }).then(({ error }) => {
        // Nevadí: v tomto zařízení je označeno, jen se to nepřenese na jiná.
        if (error) console.warn('[useSeenBadges] Uložení k účtu se nepodařilo:', error.message);
      });
    }
  }, [badgesTabOpen, unseen, seen, user]);

  return unseen.length;
}
