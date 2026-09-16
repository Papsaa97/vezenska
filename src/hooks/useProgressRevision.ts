import { useEffect, useState } from 'react';
import { PROGRESS_EVENT } from '../utils/userScopedStorage';

/**
 * Číslo, které se zvýší po každé změně postupu v úložišti.
 *
 * Slouží jako závislost pro memoizace, které postup čtou z localStorage —
 * tedy `calculateBaseXp` a `evaluateBadges`. React o zápisu do localStorage
 * neví, takže hlavička dřív držela staré XP celou session: po splněném
 * scénáři slíbila „+80 XP“, a v liště se nezměnilo nic, kdežto záložka
 * Odznaky se při každém otevření připojila znovu a XP viděla. Hlavička
 * a Odznaky tak ukazovaly dvě různá čísla.
 */
export function useProgressRevision(): number {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const bump = () => setRevision((value) => value + 1);
    window.addEventListener(PROGRESS_EVENT, bump);
    // `storage` chodí z jiných karet téhož prohlížeče.
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  return revision;
}
