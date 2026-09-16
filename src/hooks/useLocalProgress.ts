import { useCallback, useEffect, useState } from 'react';
import {
  DRILL_XP,
  SCENARIO_XP,
  StreakInfo,
  loadCompletedDrills,
  loadCompletedScenarios,
  loadStreakInfo,
} from '../utils/gamification';
import { PROGRESS_EVENT } from '../utils/userScopedStorage';

export interface LocalProgress {
  streakInfo: StreakInfo;
  /** Počet splněných taktických scénářů. */
  completedScenarios: number;
  /** Počet splněných zbraňových drilů. */
  completedDrills: number;
  /** XP za scénáře a drily dohromady — vstup do calculateBaseXp. */
  extraXp: number;
}

/**
 * Postup, který žije v localStorage, přinesený do Reactu jako stav.
 *
 * PROČ TO NENÍ `useMemo(..., [revision])`: taková memoizace revizi uvnitř
 * nepoužívá, takže `react-hooks/exhaustive-deps` ji právem hlásí jako
 * nadbytečnou závislost — a umlčet pravidlo komentářem `eslint-disable`
 * AGENTS.md zakazuje. Hodnoty se proto drží ve stavu a odběr je přepíše;
 * závislosti u volajícího jsou pak obyčejná čísla, která React uhlídá sám.
 */
export function useLocalProgress(): LocalProgress {
  const read = useCallback((): LocalProgress => {
    const scenarios = loadCompletedScenarios().length;
    const drills = loadCompletedDrills().length;
    return {
      streakInfo: loadStreakInfo(),
      completedScenarios: scenarios,
      completedDrills: drills,
      extraXp: scenarios * SCENARIO_XP + drills * DRILL_XP,
    };
  }, []);

  const [progress, setProgress] = useState<LocalProgress>(read);

  useEffect(() => {
    const refresh = () => setProgress(read());
    // Hned po připojení: vlastník klíče se mohl změnit přihlášením dřív, než
    // se komponenta poprvé vykreslila.
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [read]);

  return progress;
}
