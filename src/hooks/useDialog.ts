import { useEffect, useRef } from 'react';

/**
 * Prvky, na které se dá přejít tabulátorem.
 *
 * Vyjmenované ručně, protože :focusable ani :focus-visible se na výběr
 * kandidátů použít nedají — první není standard, druhý popisuje stav.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** Vrátí viditelné prvky uvnitř kontejneru, na které lze přejít tabulátorem. */
function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    // Skryté prvky (display:none, collapsed) nemají žádný obdélník. offsetParent
    // by tu nefungoval — uvnitř position:fixed kontejneru vrací null i pro
    // viditelné potomky.
    .filter((el) => el.getClientRects().length > 0);
}

export interface UseDialogOptions {
  /** Je dialog právě otevřený? Při false hook nic nedělá. */
  isOpen: boolean;
  /** Zavření dialogu — volá se po stisku Escape. */
  onClose: () => void;
  /**
   * Smí Escape dialog zavřít? Nastavte false během ukládání, aby uživatel
   * nepřišel o rozepsaná data uprostřed odesílání.
   */
  closeOnEscape?: boolean;
}

/**
 * Zpřístupní modální dialog klávesnici a odečítačům obrazovky.
 *
 * Řeší tři věci, které v aplikaci chyběly úplně:
 *
 * 1. **Escape zavírá.** Bez toho se uživatel ovládající aplikaci klávesnicí
 *    z dialogu nedostane jinak než trefit se tabulátorem na křížek.
 * 2. **Past na fokus.** Bez ní tabulátor vyjede za dialog do stránky pod ním.
 *    Odečítač obrazovky pak čte obsah, který je vizuálně zakrytý překryvem,
 *    a uživatel netuší, kde se nachází.
 * 3. **Návrat fokusu.** Po zavření se fokus vrátí na prvek, ze kterého se
 *    dialog otevřel. Jinak spadne na začátek dokumentu a uživatel musí
 *    procházet celou stránku znovu.
 *
 * Vrácený ref patří na vnější prvek dialogu, na němž má být i
 * `role="dialog"`, `aria-modal="true"`, `aria-labelledby` a `tabIndex={-1}`
 * (kvůli fokusu, když dialog žádný ovládací prvek neobsahuje).
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  closeOnEscape = true,
}: UseDialogOptions) {
  const ref = useRef<T | null>(null);

  // onClose bývá inline funkce, která se mění při každém překreslení. Přes ref
  // se posluchač nemusí odpojovat a připojovat znovu — a hlavně se tím fokus
  // nevrací uprostřed života dialogu.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closeOnEscapeRef = useRef(closeOnEscape);
  closeOnEscapeRef.current = closeOnEscape;

  useEffect(() => {
    if (!isOpen) return;

    const dialog = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Fokus dovnitř, ať klávesnice začíná v dialogu a ne pod ním.
    if (dialog) {
      const items = focusableWithin(dialog);
      (items[0] ?? dialog).focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!closeOnEscapeRef.current) return;
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const items = focusableWithin(dialog);
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !active || !dialog.contains(active);

      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };

    // Fáze zachycení: dialog dostane klávesu dřív než cokoliv pod ním.
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      // Prvek mezitím mohl zmizet ze stránky — pak není kam fokus vracet.
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  return ref;
}
