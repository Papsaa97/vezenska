import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Search, Check, Volume2, FileText, Copy, ExternalLink,
  Edit3, RotateCcw, Sparkles, Type, Printer, ShieldCheck,
  AlertTriangle, Loader2, BookOpen, Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VscrRegulation } from '../../data/vscrRegulationsRegistry';
import { isSpeechSupported } from '../../utils/speech';
import { useEsbirkaRegulation } from '../../hooks/useEsbirkaRegulation';
import {
  sectionAnchorId,
  splitByQuery,
  splitIntoSectionBlocks,
  type TextBlock,
} from '../../utils/esbirka/reader';
import { freshnessLabel, type FreshnessState } from '../../utils/esbirka/status';
import { fetchOfficialFileUrl } from '../../utils/esbirka/officialFile';
import PrintHeader from '../common/PrintHeader';
import { useDialog } from '../../hooks/useDialog';

/**
 * Který text je v okně vidět.
 *  - `oficialni` — úplné znění stažené z e-Sbírky (npm run sync:laws),
 *  - `vyber`     — výběr ustanovení sestavený pro výuku, uložený v aplikaci.
 *
 * Rozlišení není kosmetické: výběr je zlomek předpisu a dřív se zobrazoval pod
 * hlavičkou „Sbírka zákonů — úřední znění předpisu“ s patičkou „Zdroj:
 * oficiální e-Sbírka“. Čtenář tak u dvaceti z osmdesáti paragrafů neměl šanci
 * poznat, že zbytek zákona chybí.
 */
type SourceMode = 'oficialni' | 'vyber';

interface LegalReaderModalProps {
  activeModalRegulation: VscrRegulation | null;
  setActiveModalRegulation: (v: VscrRegulation | null) => void;
  isSpeaking: boolean;
  setIsSpeaking: (v: boolean) => void;
  pdfViewMode: 'paper' | 'dark';
  setPdfViewMode: (v: 'paper' | 'dark') => void;
  fontSize: 'sm' | 'base' | 'lg';
  setFontSize: React.Dispatch<React.SetStateAction<'sm' | 'base' | 'lg'>>;
  modalSearchQuery: string;
  setModalSearchQuery: (v: string) => void;
  copiedId: string | null;
  handleCopy: (text: string, id: string) => void;
  handleSpeak: (text: string) => void;
  handleOpenEditModal: (reg: VscrRegulation) => void;
}

/** Barvy odznaku podle výsledku ověření. */
const FRESHNESS_STYLE: Record<FreshnessState, string> = {
  aktualni:
    'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  zastarale:
    'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  'bez-zneni':
    'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'mimo-sbirku':
    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  nedostupne:
    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

/** Datum `RRRR-MM-DD` v české podobě. */
function formatDate(iso: string): string {
  const [rok, mesic, den] = iso.split('-');
  if (!rok || !mesic || !den) return iso;
  return `${Number(den)}. ${Number(mesic)}. ${rok}`;
}

/** Text se zvýrazněnými shodami hledaného výrazu. */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  return (
    <>
      {splitByQuery(text, query).map((part, index) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={index} className="bg-yellow-300 text-slate-950 font-bold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

export default function LegalReaderModal({
  activeModalRegulation,
  setActiveModalRegulation,
  isSpeaking,
  setIsSpeaking,
  pdfViewMode,
  setPdfViewMode,
  fontSize,
  setFontSize,
  modalSearchQuery,
  setModalSearchQuery,
  copiedId,
  handleCopy,
  handleSpeak,
  handleOpenEditModal,
}: LegalReaderModalProps) {
  const fontSizeClass = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-relaxed',
  }[fontSize];

  const esbirka = useEsbirkaRegulation(activeModalRegulation);
  const { maUplneZneni, nacistUplneZneni, overitAktualnost } = esbirka;
  const [sourceMode, setSourceMode] = useState<SourceMode>('vyber');
  const [fileState, setFileState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [fileError, setFileError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Po otevření předpisu se úplné znění vyžádá rovnou: je to ten text, kvůli
  // kterému čtenář okno otevírá. Když k předpisu není, zůstane studijní výběr.
  useEffect(() => {
    if (!activeModalRegulation) return;
    if (maUplneZneni) {
      setSourceMode('oficialni');
      nacistUplneZneni();
    } else {
      setSourceMode('vyber');
    }
  }, [activeModalRegulation, maUplneZneni, nacistUplneZneni]);

  const closeReader = useCallback(() => {
    setActiveModalRegulation(null);
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [setActiveModalRegulation, isSpeaking, setIsSpeaking]);

  // Escape, past na fokus a jeho návrat — viz hooks/useDialog. Zavírá se přes
  // closeReader, aby Escape zároveň umlčel předčítání jako křížek.
  const titleId = useId();
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen: activeModalRegulation !== null,
    onClose: closeReader,
  });

  const showingOfficial = sourceMode === 'oficialni' && esbirka.snapshotState === 'ready';
  const activeText = showingOfficial
    ? esbirka.snapshot?.text ?? ''
    : activeModalRegulation?.fullLegalText ?? '';

  const blocks: TextBlock[] = useMemo(
    () => (showingOfficial ? splitIntoSectionBlocks(activeText) : []),
    [showingOfficial, activeText]
  );

  /** Paragrafy pro tlačítka rychlého skoku. */
  const jumpTargets = useMemo(() => {
    if (showingOfficial) {
      return blocks.filter((b) => b.label).map((b) => ({ label: b.label as string, key: b.key }));
    }
    const found: Array<{ label: string; key: string }> = [];
    const seen = new Set<string>();
    for (const match of activeText.matchAll(/(§\s*\d+[a-z]?|Článek\s*\d+|Pravidlo\s*\d+)/g)) {
      const label = match[0].replace(/\s+/g, ' ').trim();
      if (seen.has(label)) continue;
      seen.add(label);
      found.push({ label, key: sectionAnchorId(label) });
    }
    return found;
  }, [showingOfficial, blocks, activeText]);

  /**
   * Otevře úřední PDF daného znění.
   *
   * Nejde to udělat prostým odkazem: e-Sbírka soubor nejdřív vygeneruje
   * a vrátí jen jeho id. Dřív tu odkaz mířil rovnou na adresu pro požádání,
   * takže se čtenáři místo zákona otevřel JSON.
   */
  const openOfficialFile = useCallback(async (dokumentId: number) => {
    setFileState('loading');
    setFileError(null);
    try {
      const url = await fetchOfficialFileUrl(dokumentId, 'PDF');
      setFileState('idle');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setFileState('error');
      setFileError((error as Error).message);
    }
  }, []);

  const jumpToSection = useCallback((key: string) => {
    const target = bodyRef.current?.querySelector(`#${CSS.escape(key)}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const summary = esbirka.source.summary;
  const copyKey = `modal-${activeModalRegulation?.id ?? 'zadny'}`;

  /** Popis zdroje textu pod hlavičkou i v patičce tištěné stránky. */
  const sourceCaption = showingOfficial && summary
    ? `Informativní znění z e-Sbírky, znění č. ${summary.cisloZneni} účinné od ${formatDate(summary.ucinnostOd)} ` +
      `(staženo ${formatDate(summary.stazenoDne.slice(0, 10))}). Právně závazná je částka Sbírky zákonů.`
    : 'Studijní výběr ustanovení sestavený pro přípravu na ZOP. Není to úplné znění předpisu.';

  return (
    <AnimatePresence>
      {activeModalRegulation && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 md:p-6 animate-in fade-in duration-200 print:relative print:inset-auto print:bg-white print:p-0 print:block">
        {/* Ztmavené pozadí je dekorace: klik na něj dialog zavře, ale pro
            odečítač obrazovky neexistuje a klávesnice má Escape (useDialog).
            Proto je oddělené od samotného dialogu a označené aria-hidden. */}
        <div
          aria-hidden="true"
          onClick={() => closeReader()}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm print:hidden"
        />
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          initial={{ scale: 0.96, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 print:w-full print:max-w-none print:h-auto print:max-h-none print:border-none print:shadow-none print:rounded-none"
        >
          {/* Modal Header */}
          <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-2 sm:space-y-3 shrink-0 bg-slate-50/70 dark:bg-slate-950/70 print:bg-white print:border-b-2 print:border-slate-900 print:p-0 print:mb-4">
            <PrintHeader
              subject={`Předpis VS ČR: ${activeModalRegulation.shortTitle}`}
              docTitle={`${activeModalRegulation.code} • ${activeModalRegulation.authority}`}
              subtext={sourceCaption}
            />

            <div className="flex items-start justify-between gap-2 no-print">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                    {activeModalRegulation.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hidden sm:inline">
                    {activeModalRegulation.authority}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                    {activeModalRegulation.importanceForZOP}
                  </span>
                </div>

                <h2 id={titleId} className="text-sm sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {activeModalRegulation.shortTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 hidden sm:block">
                  {activeModalRegulation.title}
                </p>
              </div>

              {/* Top Right Action Tools */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* PDF / Dark Mode Switcher */}
                <div className="hidden sm:flex items-center bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300/60 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('paper')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      pdfViewMode === 'paper'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                    title="Přepnout do zobrazení na papíře formátu A4"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>Papír A4</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfViewMode('dark')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      pdfViewMode === 'dark'
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-200'
                    }`}
                    title="Přepnout do tmavého čtecího režimu"
                  >
                    <span>🌙 Tmavý</span>
                  </button>
                </div>

                {/* Font Size */}
                <button
                  type="button"
                  onClick={() => setFontSize(prev => prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm')}
                  className="hidden sm:flex min-w-[44px] min-h-[44px] items-center justify-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
                  title="Změnit velikost písma textu"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span className="uppercase text-[10px]">{fontSize}</span>
                </button>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex min-w-[44px] min-h-[44px] items-center justify-center gap-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  title="Vytisknout zobrazené znění nebo uložit jako PDF soubor"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span className="inline text-xs">Tisk / PDF</span>
                </button>

                {/* Audio TTS */}
                {isSpeechSupported() && (
                  <button
                    type="button"
                    onClick={() => handleSpeak(activeText)}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors cursor-pointer border ${
                      isSpeaking
                        ? 'bg-blue-600 border-blue-600 text-white animate-pulse'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80'
                    }`}
                    title={isSpeaking ? 'Zastavit předčítání' : 'Přečíst zobrazené znění nahlas (TTS)'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}

                {/* Copy Full Text */}
                <button
                  type="button"
                  onClick={() => handleCopy(activeText, copyKey)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 px-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  title="Zkopírovat zobrazené znění do schránky"
                >
                  {copiedId === copyKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden sm:inline text-[11px]">Zkopírováno</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Kopírovat</span>
                    </>
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={closeReader}
                  aria-label="Zavřít znění"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-0.5 text-lg font-light"
                  title="Zavřít okno (ESC)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Přepínač zdroje textu, hledání a ověření proti e-Sbírce */}
            <div className="space-y-2 no-print">
              {/* Zdroj textu */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300/60 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSourceMode('oficialni')}
                    disabled={!maUplneZneni}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      sourceMode === 'oficialni'
                        ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title={
                      maUplneZneni
                        ? 'Zobrazit úplné znění stažené z e-Sbírky'
                        : 'Pro tento předpis není úplné znění k dispozici (není ve Sbírce zákonů nebo nebyl spuštěn npm run sync:laws)'
                    }
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Úplné znění (e-Sbírka)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceMode('vyber')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      sourceMode === 'vyber'
                        ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title="Zobrazit studijní výběr ustanovení uložený v aplikaci"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Studijní výběr</span>
                  </button>
                </div>

                {summary && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    znění č. {summary.cisloZneni} od {formatDate(summary.ucinnostOd)}
                    {summary.novely.length > 0 && ` • novely: ${summary.novely.join(', ')}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Hledat v textu (např. § 17, donucovací prostředky, pouta)..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {modalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setModalSearchQuery('')}
                      aria-label="Zrušit hledání"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={overitAktualnost}
                  disabled={esbirka.freshnessState === 'loading'}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl transition-colors shrink-0 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-wait"
                  title="Zeptat se e-Sbírky, jaké znění předpisu je právě účinné, a porovnat ho se zněním v aplikaci"
                >
                  {esbirka.freshnessState === 'loading' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>Ověřit podle e-Sbírky</span>
                </button>

                {esbirka.source.portalUrl && (
                  <a
                    href={esbirka.source.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl transition-colors shrink-0 border border-indigo-200 dark:border-indigo-800/60"
                    title="Otevřít předpis na portálu e-Sbírka.gov.cz"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Na e-Sbírce</span>
                  </a>
                )}

                {summary && (
                  <button
                    type="button"
                    onClick={() => openOfficialFile(summary.dokumentId)}
                    disabled={fileState === 'loading'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                    title="Nechat e-Sbírku vygenerovat úřední PDF tohoto znění a otevřít ho"
                  >
                    {fileState === 'loading' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span className="hidden sm:inline">
                      {fileState === 'loading' ? 'Připravuji…' : 'Úřední PDF'}
                    </span>
                  </button>
                )}
              </div>

              {fileState === 'error' && fileError && (
                <div
                  role="status"
                  className="flex items-start gap-2 px-3 py-2 rounded-xl border text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    <strong className="uppercase tracking-wide">Úřední PDF se nepodařilo získat:</strong>{' '}
                    {fileError}
                  </span>
                </div>
              )}

              {/* Výsledek ověření proti e-Sbírce */}
              {esbirka.freshness && (
                <div
                  role="status"
                  className={`flex items-start gap-2 px-3 py-2 rounded-xl border text-[11px] font-semibold ${FRESHNESS_STYLE[esbirka.freshness.stav]}`}
                >
                  {esbirka.freshness.stav === 'aktualni' ? (
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  )}
                  <span>
                    <strong className="uppercase tracking-wide">
                      {freshnessLabel(esbirka.freshness.stav)}:
                    </strong>{' '}
                    {esbirka.freshness.zprava}
                  </span>
                </div>
              )}

              {/* Fast Section Navigation Chips */}
              {jumpTargets.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                    Rychlý skok:
                  </span>
                  {jumpTargets.slice(0, 60).map((target) => (
                    <button
                      type="button"
                      key={target.key}
                      onClick={() =>
                        showingOfficial ? jumpToSection(target.key) : setModalSearchQuery(target.label)
                      }
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shrink-0 cursor-pointer bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-300"
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Body: Scrollable Legal Text */}
          <div
            ref={bodyRef}
            className={`flex-1 min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] p-4 sm:p-6 space-y-4 font-sans leading-relaxed print:p-0 print:overflow-visible print:h-auto print:bg-white ${
              pdfViewMode === 'paper' ? 'bg-slate-200/70 dark:bg-slate-950/80' : 'bg-slate-100 dark:bg-slate-900'
            }`}
          >
            {/* Summary & Application Callout */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700/60 text-xs space-y-1.5 shadow-xs print-avoid-break print:bg-white print:border-slate-300">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Předmět a rozsah úpravy:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">{activeModalRegulation.scope}</p>
              <p className="text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <strong className="text-indigo-600 dark:text-indigo-400">Praktické uplatnění:</strong>{' '}
                {activeModalRegulation.practicalApplication}
              </p>
            </div>

            {/* Poctivé označení toho, co je právě vidět */}
            <div
              className={`px-3.5 py-2.5 rounded-xl border text-[11px] font-semibold print:border-slate-300 ${
                showingOfficial
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              {sourceCaption}
              {!showingOfficial && maUplneZneni && esbirka.snapshotState !== 'error' && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={() => {
                      setSourceMode('oficialni');
                      nacistUplneZneni();
                    }}
                    className="underline font-bold cursor-pointer"
                  >
                    Přepnout na úplné znění
                  </button>
                </>
              )}
            </div>

            {sourceMode === 'oficialni' && esbirka.snapshotState === 'loading' && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Načítám úplné znění z e-Sbírky…</span>
              </div>
            )}

            {sourceMode === 'oficialni' && esbirka.snapshotState === 'error' && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-2">
                <p className="font-bold">Úplné znění se nepodařilo načíst.</p>
                <p>{esbirka.snapshotError}</p>
                <button
                  type="button"
                  onClick={() => setSourceMode('vyber')}
                  className="underline font-bold cursor-pointer"
                >
                  Zobrazit studijní výběr
                </button>
              </div>
            )}

            {(showingOfficial || sourceMode === 'vyber') &&
              (pdfViewMode === 'paper' ? (
                <div className="bg-white text-slate-900 border border-slate-300 rounded-sm shadow-2xl p-6 sm:p-12 font-serif max-w-3xl mx-auto my-2 border-t-8 border-t-slate-800 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:border-t-0">
                  {/* Hlavička listu */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center space-y-1.5 font-sans">
                    <div className="text-[11px] uppercase tracking-widest font-black text-slate-600">
                      {showingOfficial
                        ? 'Česká republika • Informativní znění předpisu (e-Sbírka)'
                        : 'Akademie VS ČR • Studijní výběr ustanovení'}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase font-serif">
                      {showingOfficial ? 'Sbírka zákonů' : 'Výběr pro přípravu na ZOP'}
                    </h1>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pt-1 border-t border-slate-200 gap-2 flex-wrap">
                      <span>{summary?.citace ?? activeModalRegulation.code}</span>
                      <span>
                        {showingOfficial && summary
                          ? `Účinnost od: ${formatDate(summary.ucinnostOd)}`
                          : `Účinnost od: ${activeModalRegulation.effectiveFrom || 'neuvedeno'}`}
                      </span>
                      <span>{activeModalRegulation.authority}</span>
                    </div>
                  </div>

                  <div className="text-center my-6 space-y-2">
                    <div className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      {summary?.nazev ?? activeModalRegulation.title}
                    </div>
                    <div className="w-16 h-0.5 bg-slate-400 mx-auto my-3" />
                  </div>

                  <div
                    className={`leading-relaxed text-slate-900 select-text font-serif text-justify ${
                      fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'
                    }`}
                  >
                    {showingOfficial ? (
                      blocks.map((block) => (
                        <section key={block.key} id={block.key} className="scroll-mt-4 print-avoid-break">
                          {block.label && (
                            <h2 className="text-center font-bold mt-6 mb-1 text-base">{block.label}</h2>
                          )}
                          {block.heading && (
                            <h3 className="text-center font-semibold italic mb-2">{block.heading}</h3>
                          )}
                          <div className="whitespace-pre-wrap">
                            <HighlightedText text={block.body} query={modalSearchQuery} />
                          </div>
                        </section>
                      ))
                    ) : activeText ? (
                      <div className="whitespace-pre-wrap">
                        <HighlightedText text={activeText} query={modalSearchQuery} />
                      </div>
                    ) : (
                      <div className="text-slate-500 py-8 text-center font-sans">
                        Pro tento předpis není v aplikaci uložený žádný text.
                      </div>
                    )}
                  </div>

                  <div className="mt-12 pt-4 border-t border-slate-300 text-[10px] text-slate-500 flex items-center justify-between font-sans gap-3 flex-wrap">
                    <span>
                      {showingOfficial
                        ? 'Zdroj: e-Sbírka (e-sbirka.gov.cz), REST API — informativní znění'
                        : 'Zdroj: studijní databáze Akademie VS ČR — výběr ustanovení'}
                    </span>
                    <span>
                      {showingOfficial && summary
                        ? `Znění č. ${summary.cisloZneni} účinné od ${formatDate(summary.ucinnostOd)}`
                        : 'Není to úplné znění předpisu'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-inner">
                  {showingOfficial ? (
                    <div className={`font-mono select-text text-slate-200 ${fontSizeClass}`}>
                      {blocks.map((block) => (
                        <section key={block.key} id={block.key} className="scroll-mt-4">
                          {block.label && (
                            <h2 className="font-bold text-emerald-300 mt-5 mb-1">{block.label}</h2>
                          )}
                          {block.heading && (
                            <h3 className="font-semibold text-slate-400 mb-1">{block.heading}</h3>
                          )}
                          <pre className="whitespace-pre-wrap font-mono">
                            <HighlightedText text={block.body} query={modalSearchQuery} />
                          </pre>
                        </section>
                      ))}
                    </div>
                  ) : (
                    <pre className={`whitespace-pre-wrap font-mono select-text text-slate-200 ${fontSizeClass}`}>
                      {activeText ? (
                        <HighlightedText text={activeText} query={modalSearchQuery} />
                      ) : (
                        'Pro tento předpis není v aplikaci uložený žádný text.'
                      )}
                    </pre>
                  )}
                </div>
              ))}
          </div>

          {/* Modal Footer */}
          <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeModalRegulation.tags.map(t => (
                <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  #{t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const regToEdit = activeModalRegulation;
                  setActiveModalRegulation(null);
                  handleOpenEditModal(regToEdit);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Upravit studijní výběr a metadata předpisu v aplikaci"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Upravit výběr</span>
              </button>

              <button
                type="button"
                onClick={closeReader}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                Zavřít znění
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
