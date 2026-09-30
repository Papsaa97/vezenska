import { useCallback, useEffect, useState } from 'react';
import {
  PushDruh,
  PushPodpora,
  currentSubscription,
  nacistVypnuteDruhy,
  pushPodpora,
  ulozitVypnuteDruhy,
  vypnoutUpozorneni,
  zapnoutUpozorneni,
} from '../utils/pushNotifications';

/**
 * Stav upozornění do zařízení pro tento prohlížeč:
 * - `nacitam`     zjišťuje se,
 * - `zapnuto`     zařízení je přihlášené k odběru,
 * - `vypnuto`     jde zapnout jedním kliknutím,
 * - `zablokovano` uživatel upozornění v prohlížeči zakázal,
 * - `ios-plocha` / `nepodporovano` viz PushPodpora.
 */
export type PushStav = 'nacitam' | 'zapnuto' | 'vypnuto' | 'zablokovano' | Exclude<PushPodpora, 'ok'>;

export interface PushNotifications {
  stav: PushStav;
  pracuji: boolean;
  chyba: string | null;
  vypnuteDruhy: PushDruh[];
  zapnout: () => Promise<void>;
  vypnout: () => Promise<void>;
  prepnoutDruh: (druh: PushDruh) => Promise<void>;
}

async function zjistitStav(): Promise<PushStav> {
  const podpora = pushPodpora();
  if (podpora !== 'ok') return podpora;
  if (Notification.permission === 'denied') return 'zablokovano';
  const sub = await currentSubscription().catch(() => null);
  return sub && Notification.permission === 'granted' ? 'zapnuto' : 'vypnuto';
}

/** `sDruhy`: načíst i předvolby druhů (jen v profilu, zvonek je nepotřebuje). */
export function usePushNotifications(sDruhy = false): PushNotifications {
  const [stav, setStav] = useState<PushStav>('nacitam');
  const [pracuji, setPracuji] = useState<boolean>(false);
  const [chyba, setChyba] = useState<string | null>(null);
  const [vypnuteDruhy, setVypnuteDruhy] = useState<PushDruh[]>([]);

  useEffect(() => {
    let active = true;
    void zjistitStav().then((s) => {
      if (active) setStav(s);
    });
    if (sDruhy) {
      void nacistVypnuteDruhy().then((d) => {
        if (active) setVypnuteDruhy(d);
      });
    }
    return () => {
      active = false;
    };
  }, [sDruhy]);

  const zapnout = useCallback(async () => {
    setPracuji(true);
    setChyba(null);
    const message = await zapnoutUpozorneni();
    setChyba(message);
    setStav(await zjistitStav());
    setPracuji(false);
  }, []);

  const vypnout = useCallback(async () => {
    setPracuji(true);
    setChyba(null);
    setChyba(await vypnoutUpozorneni());
    setStav(await zjistitStav());
    setPracuji(false);
  }, []);

  const prepnoutDruh = useCallback(
    async (druh: PushDruh) => {
      const next = vypnuteDruhy.includes(druh)
        ? vypnuteDruhy.filter((d) => d !== druh)
        : [...vypnuteDruhy, druh];
      const previous = vypnuteDruhy;
      setVypnuteDruhy(next);
      setChyba(null);
      const message = await ulozitVypnuteDruhy(next);
      if (message) {
        setVypnuteDruhy(previous);
        setChyba(message);
      }
    },
    [vypnuteDruhy]
  );

  return { stav, pracuji, chyba, vypnuteDruhy, zapnout, vypnout, prepnoutDruh };
}
