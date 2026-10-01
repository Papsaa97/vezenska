import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessagesSquare } from 'lucide-react';
import ShareToChatDialog from './ShareToChatDialog';
import { useChatAccess } from '../../hooks/useChatAccess';
import type { ChatShare } from '../../utils/chatShare';

interface ShareToChatButtonProps {
  /** Co se pošle; volá se až po kliknutí, ať se nic nepočítá zbytečně. */
  getShare: () => ChatShare;
  /** Ikonové tlačítko (bez textu) pro těsná místa, jako v Knihovně. */
  compact?: boolean;
  /** Přístupné jméno, např. „Poslat Rozvrh.pdf do chatu“. */
  label?: string;
  className?: string;
}

/**
 * „Poslat do chatu“. Komu chat nepatří (nový účet bez třídy), tomu se
 * tlačítko vůbec neukáže.
 */
export default function ShareToChatButton({
  getShare,
  compact = false,
  label = 'Poslat do chatu',
  className = '',
}: ShareToChatButtonProps) {
  const allowed = useChatAccess();
  const [share, setShare] = useState<ChatShare | null>(null);

  if (!allowed) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // Tlačítko bývá uvnitř klikací karty (např. kartička k otočení).
          e.stopPropagation();
          setShare(getShare());
        }}
        aria-label={label}
        title="Poslat do chatu"
        className={`no-print inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
          compact
            ? 'p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            : 'px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        } ${className}`}
      >
        <MessagesSquare className="w-4 h-4" aria-hidden="true" />
        {!compact && <span>Poslat do chatu</span>}
      </button>
      {/* Portál: rodič může mít transform (animace), pod kterým by se
          dialog s position: fixed neukázal přes celou obrazovku. */}
      {share && createPortal(<ShareToChatDialog share={share} onClose={() => setShare(null)} />, document.body)}
    </>
  );
}
