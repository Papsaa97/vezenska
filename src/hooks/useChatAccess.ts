import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchChatAccess } from '../utils/chat';

/**
 * Smí přihlášený uživatel používat chat? Tlačítka „Poslat do chatu“ se
 * ukazují jen tehdy. Odpověď se drží pro účet, ať se server neptá každé
 * tlačítko zvlášť; chyba (např. chybějící migrace) = chat nenabízet.
 */
const cache = new Map<string, Promise<boolean>>();

export function useChatAccess(): boolean {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) {
      setAllowed(false);
      return;
    }
    let active = true;
    let pending = cache.get(userId);
    if (!pending) {
      const key = userId;
      pending = fetchChatAccess().then((res) => {
        // Výpadek sítě nesmí chat schovat do konce relace: příště se zeptat znovu.
        if (res.error) cache.delete(key);
        return !res.error && res.data === true;
      });
      cache.set(userId, pending);
    }
    void pending.then((ok) => {
      if (active) setAllowed(ok);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  return allowed;
}
