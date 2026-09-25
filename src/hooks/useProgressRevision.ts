import { useEffect, useState } from 'react';
import { PROGRESS_EVENT, getStorageOwner } from '../utils/userScopedStorage';

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

/**
 * Čí postup se právě čte a zapisuje (id účtu, nebo `anon`).
 *
 * Na rozdíl od `useProgressRevision()` se mění jen přihlášením a odhlášením,
 * ne každým zápisem. Efekt, který na změnu reaguje ZÁPISEM do úložiště, se
 * proto musí vázat na tohle, ne na revizi: zápis vyvolá PROGRESS_EVENT, ten
 * zvýší revizi a efekt se spustí znovu — nekonečná smyčka překreslování.
 * Přesně ta v App.tsx (oblíbené otázky) překreslovala celou aplikaci desítkykrát
 * za sekundu a ve Statistikách ji shazovala na „Maximum update depth exceeded“.
 */
export function useStorageOwner(): string {
  const [owner, setOwner] = useState<string>(getStorageOwner);

  useEffect(() => {
    // Stejná hodnota překreslení nevyvolá, takže běžný zápis postupu tu nic nestojí.
    const sync = () => setOwner(getStorageOwner());
    // Vlastník se mohl změnit dřív, než se odběr připojil.
    sync();
    window.addEventListener(PROGRESS_EVENT, sync);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, sync);
    };
  }, []);

  return owner;
}
