import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useAuth } from '../context/AuthContext';

interface FeedbackButtonProps {
  /** Popisek aktuální obrazovky (např. název aktivní záložky) pro dohledání kontextu zprávy */
  screenLabel: string;
}

export default function FeedbackButton({ screenLabel }: FeedbackButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Zpětnou vazbu může odeslat pouze přihlášený uživatel (kvůli RLS politice INSERT)
  if (!user) return null;

  const screenContext =
    typeof window !== 'undefined' ? `${screenLabel} (${window.location.href})` : screenLabel;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Odeslat zpětnou vazbu"
        className="hidden md:flex fixed md:bottom-6 md:left-6 z-30 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 items-center justify-center transition-all cursor-pointer hover:scale-105 no-print"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {isOpen && <FeedbackModal onClose={() => setIsOpen(false)} screenContext={screenContext} />}
    </>
  );
}
