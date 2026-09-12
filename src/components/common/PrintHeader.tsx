import React from 'react';

export interface PrintHeaderProps {
  /** Název konkrétního předmětu nebo modulu (např. 'Základy penologie', 'Právní příprava') */
  subject?: string;
  /** Doplňkový podtitul nebo název dokumentu (např. 'Přehled otázek ke zkoušce ZOP A') */
  docTitle?: string;
  /** Volitelná kategorie či kód předpisu */
  category?: string;
  /** Datum tisku (výchozí: aktuální datum formátované dle cs-CZ) */
  date?: string;
  /** Drobný doplňkový text v zápatí hlavičky */
  subtext?: string;
}

/**
 * Jednotná tisková hlavička pro A4 studijní materiály, testové otázky,
 * pracovní listy i úřední vzory.
 *
 * Komponenta je na obrazovce skrytá a zobrazuje se VÝHRADNĚ při tisku (hidden print:flex flex-col).
 */
export default function PrintHeader({
  subject,
  docTitle,
  category,
  date,
  subtext = 'Interní studijní materiál / Určeno pro samostudium'
}: PrintHeaderProps) {
  const currentDate = date || new Date().toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <header className="print-header hidden print:flex flex-col w-full mb-6 pb-2.5 border-b-2 border-slate-900 print-avoid-break text-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5 flex-1">
          <div className="text-[11pt] font-black uppercase tracking-wider text-slate-900">
            Akademie Vězeňské služby ČR – Studijní portál
          </div>
          {subject && (
            <div className="text-[13pt] font-extrabold text-slate-950 leading-tight">
              {subject}
            </div>
          )}
          {docTitle && (
            <div className="text-[10pt] font-semibold text-slate-700">
              {docTitle}
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="text-[9pt] font-semibold text-slate-700">
            Datum: {currentDate}
          </div>
          {category && (
            <div className="text-[8.5pt] font-mono uppercase text-slate-600 font-bold mt-0.5">
              {category}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[8pt] text-slate-600 italic mt-2 pt-1 border-t border-slate-300">
        <span>{subtext}</span>
        <span className="font-semibold not-italic">Vězeňská služba České republiky</span>
      </div>
    </header>
  );
}
