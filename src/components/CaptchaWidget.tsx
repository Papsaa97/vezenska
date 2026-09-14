import React, { useEffect, useRef, useState } from 'react';
import {
  CAPTCHA_GLOBAL_NAME,
  CAPTCHA_SCRIPT_URL,
  currentCaptchaConfig,
  isCaptchaConfigured,
  type CaptchaProvider,
} from '../constants/captcha';


/**
 * Ochrana přihlašovacích formulářů proti robotům (Supabase Auth → CAPTCHA).
 *
 * Když je v Supabase zapnutá ochrana CAPTCHA, server odmítne přihlášení
 * i registraci, ke kterým klient nepošle platný token. Tahle komponenta ten
 * token obstará a předá ho volajícímu.
 *
 * PROČ BEZ KNIHOVNY: Supabase dokumentace nabízí @hcaptcha/react-hcaptcha
 * a @marsidev/react-turnstile. Který balík by byl správný, ale závisí na tom,
 * kterého poskytovatele má projekt nastaveného — a instalovat oba kvůli
 * jednomu použitému je zbytečné. Oba poskytovatelé mají prakticky shodné
 * javascriptové rozhraní (render / reset se stejnými názvy voleb), takže je
 * obslouží jedna komponenta bez jediné nové závislosti.
 *
 * NENÍ-LI NASTAVENO, KOMPONENTA NEDĚLÁ NIC. Bez proměnných prostředí se
 * nevykreslí, nenačte žádný skript a token zůstane prázdný — chování
 * aplikace je pak přesně stejné jako před jejím zavedením.
 */

/** Společný průnik rozhraní hCaptcha a Cloudflare Turnstile. */
interface CaptchaApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove?: (widgetId: string) => void;
}

// Re-export, aby formuláře nemusely importovat ze dvou míst.
export { isCaptchaConfigured };

const loaders = new Map<CaptchaProvider, Promise<CaptchaApi>>();

/** Načte skript poskytovatele, nejvýš jednou za život stránky. */
function loadCaptchaScript(provider: CaptchaProvider): Promise<CaptchaApi> {
  const cached = loaders.get(provider);
  if (cached) return cached;

  const pending = new Promise<CaptchaApi>((resolve, reject) => {
    const globalName = CAPTCHA_GLOBAL_NAME[provider];
    const existing = (window as unknown as Record<string, CaptchaApi | undefined>)[globalName];
    if (existing) {
      resolve(existing);
      return;
    }

    const script = document.createElement('script');
    script.src = CAPTCHA_SCRIPT_URL[provider];
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const api = (window as unknown as Record<string, CaptchaApi | undefined>)[globalName];
      if (api) resolve(api);
      else reject(new Error(`Skript ${provider} se načetl, ale nezpřístupnil rozhraní.`));
    };
    script.onerror = () => reject(new Error(`Skript ${provider} se nepodařilo načíst.`));
    document.head.appendChild(script);
  });

  // Neúspěch se nekešuje — při dalším pokusu má smysl zkusit načtení znovu.
  pending.catch(() => loaders.delete(provider));
  loaders.set(provider, pending);
  return pending;
}

export interface CaptchaWidgetHandle {
  /**
   * Zahodí použitý token a nabídne novou výzvu.
   *
   * Token je jednorázový: po odeslání formuláře ho server spotřebuje, takže
   * bez tohoto volání by druhý pokus o přihlášení skončil chybou.
   */
  reset: () => void;
}

interface CaptchaWidgetProps {
  /** Dostane token po úspěšném ověření, nebo null při vypršení či chybě. */
  onToken: (token: string | null) => void;
  /** Ohlásí, že se ověření nepodařilo vůbec zobrazit. */
  onError?: (message: string) => void;
}

const CaptchaWidget = React.forwardRef<CaptchaWidgetHandle, CaptchaWidgetProps>(
  function CaptchaWidget({ onToken, onError }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const apiRef = useRef<CaptchaApi | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [failed, setFailed] = useState(false);

    // Obsluhy jsou u volajících inline funkce; přes ref se nemění identita,
    // takže se widget nevykresluje znovu při každém překreslení formuláře.
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    React.useImperativeHandle(ref, () => ({
      reset: () => {
        onTokenRef.current(null);
        if (apiRef.current && widgetIdRef.current !== null) {
          try {
            apiRef.current.reset(widgetIdRef.current);
          } catch {
            // Widget mezitím zmizel ze stránky — není co resetovat.
          }
        }
      },
    }));

    const config = currentCaptchaConfig();
    const provider = config?.provider ?? null;
    const siteKey = config?.siteKey ?? '';

    useEffect(() => {
      if (!provider || !siteKey) return;

      let cancelled = false;

      loadCaptchaScript(provider)
        .then((api) => {
          if (cancelled || !containerRef.current) return;
          apiRef.current = api;
          widgetIdRef.current = api.render(containerRef.current, {
            sitekey: siteKey,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            callback: (token: string) => onTokenRef.current(token),
            'expired-callback': () => onTokenRef.current(null),
            'error-callback': () => onTokenRef.current(null),
          });
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          // Bez tohoto hlášení by se uživateli jen nezdařilo přihlášení
          // a nedozvěděl by se proč.
          setFailed(true);
          onErrorRef.current?.(
            `Ověření proti robotům se nepodařilo načíst (${
              error instanceof Error ? error.message : String(error)
            }). Zkontrolujte připojení a zkuste stránku načíst znovu.`
          );
        });

      return () => {
        cancelled = true;
        const api = apiRef.current;
        const id = widgetIdRef.current;
        if (api?.remove && id !== null) {
          try {
            api.remove(id);
          } catch {
            // Widget už odstranil sám poskytovatel.
          }
        }
        widgetIdRef.current = null;
      };
    }, [provider, siteKey]);

    if (!provider || !siteKey) return null;

    return (
      <div className="flex justify-center">
        {failed ? null : <div ref={containerRef} />}
      </div>
    );
  }
);

export default CaptchaWidget;
