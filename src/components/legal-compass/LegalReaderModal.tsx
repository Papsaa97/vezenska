import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Search, Check, Volume2, FileText, Copy, ExternalLink,
  Edit3, RotateCcw, Sparkles, Type, Printer, ShieldCheck,
  AlertTriangle, Loader2, BookOpen, Download, MoreHorizontal, Moon, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VscrRegulation } from '../../data/vscrRegulationsRegistry';
import { isSpeechSupported, stopSpeaking } from '../../utils/speech';
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
import { formatIsoDate as formatDate } from './legalCompassLabels';

/**
 * Který text je v okně vidět.
 *  - `oficialni` — informativní znění stažené z e-Sbírky (npm run sync:laws),
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
  /** Smí uživatel studijní výběr upravovat? */
  canEdit: boolean;
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

/** Ikonové tlačítko v hlavičce. Na dotykovém displeji 44 px, jinak menší. */
const TOOL_BUTTON =
  'min-w-[44px] min-h-[44px] sm:min-w-9 sm:min-h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer';

/** Položka nabídky „Další akce“. */
const MENU_ITEM =
  'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait';

/** Tlačítko přepínače zdroje textu. */
const SOURCE_BUTTON =
  'h-7 px-2 text-[0.6875rem] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer';

const FONT_SIZE_LABEL: Record<'sm' | 'base' | 'lg', string> = {
  sm: 'S',
  base: 'M',
  lg: 'L',
};

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
  canEdit,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Nabídka se zavře klikem mimo ni a Escapem. Escape přitom nesmí zavřít
  // celé okno — proto useDialog níže dostane closeOnEscape: !menuOpen.
  useEffect(() => {
    if (!menuOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [menuOpen]);

  // Nový předpis začíná se zavřenou nabídkou.
  useEffect(() => {
    setMenuOpen(false);
  }, [activeModalRegulation]);

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
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  }, [setActiveModalRegulation, isSpeaking, setIsSpeaking]);

  // Escape, past na fokus a jeho návrat — viz hooks/useDialog. Zavírá se přes
  // closeReader, aby Escape zároveň umlčel předčítání jako křížek.
  const titleId = useId();
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen: activeModalRegulation !== null,
    onClose: closeReader,
    closeOnEscape: !menuOpen,
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-3 lg:p-4 print:relative print:inset-auto print:bg-white print:p-0 print:block">
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
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 sm:rounded-2xl shadow-xl w-full max-w-5xl h-[100dvh] sm:h-[calc(100dvh-1.5rem)] lg:h-[calc(100dvh-2rem)] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 print:w-full print:max-w-none print:h-auto print:max-h-none print:border-none print:shadow-none print:rounded-none"
        >
          {/* Hlavička — dva nízké řádky, ať většinu okna zabírá samotný text.
              Dřív měla čtyři až pět řádků (odznaky, dlouhý název, přepínač
              zdroje, hledání s třemi tlačítky, řada paragrafů) a na notebooku
              z okna zbyla pro dokument sotva polovina. Méně častá akce jsou
              v nabídce „Další“. */}
          <div className="border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/80 dark:bg-slate-950/70 print:bg-white print:border-b-2 print:border-slate-900 print:p-0 print:mb-4">
            <PrintHeader
              subject={`Kompas zákonů – ${activeModalRegulation.shortTitle}`}
              docTitle={`${activeModalRegulation.code} • ${activeModalRegulation.authority}`}
              subtext={`Studijní portál – neoficiální studijní materiál. ${sourceCaption}`}
            />

            {/* Řádek 1: název a nástroje */}
            <div className="flex items-center gap-2 pl-3 sm:pl-4 pr-1.5 sm:pr-2 pt-1.5 sm:pt-2 no-print">
              <span className="hidden sm:inline shrink-0 px-2 py-0.5 rounded-md text-[0.625rem] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {activeModalRegulation.code}
              </span>
              <h2
                id={titleId}
                title={activeModalRegulation.title}
                className="min-w-0 flex-1 truncate text-sm sm:text-base font-extrabold text-slate-900 dark:text-white"
              >
                {activeModalRegulation.shortTitle}
              </h2>
              <span className="hidden lg:inline shrink-0 px-2 py-0.5 rounded-md text-[0.625rem] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                {activeModalRegulation.importanceForZOP}
              </span>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPdfViewMode(pdfViewMode === 'paper' ? 'dark' : 'paper')}
                  aria-label={pdfViewMode === 'paper' ? 'Přepnout na tmavé čtení' : 'Přepnout na papír A4'}
                  title={pdfViewMode === 'paper' ? 'Přepnout na tmavé čtení' : 'Přepnout na papír A4'}
                  className={TOOL_BUTTON}
                >
                  {pdfViewMode === 'paper' ? <Moon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setFontSize(prev => prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm')}
                  aria-label={`Velikost písma: ${FONT_SIZE_LABEL[fontSize]}. Změnit`}
                  title="Změnit velikost písma"
                  className={`${TOOL_BUTTON} gap-0.5`}
                >
                  <Type className="w-4 h-4" />
                  <span className="text-[0.625rem] font-bold">{FONT_SIZE_LABEL[fontSize]}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  aria-label="Tisk nebo uložení do PDF"
                  title="Vytisknout zobrazené znění nebo uložit jako PDF soubor"
                  className={`${TOOL_BUTTON} hidden sm:flex`}
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Nabídka dalších akcí */}
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-expanded={menuOpen}
                    aria-controls={menuId}
                    aria-label="Další akce"
                    title="Další akce: předčítání, kopírování, e-Sbírka, PDF z e-Sbírky"
                    className={`${TOOL_BUTTON} ${menuOpen ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {menuOpen && (
                    <div
                      id={menuId}
                      className="absolute right-0 top-full mt-1 z-30 w-72 max-w-[calc(100vw-1.5rem)] p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl text-xs"
                    >
                      {summary && (
                        <p className="px-2.5 pt-1 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800 text-[0.6875rem] text-slate-500 dark:text-slate-400">
                          Znění č. {summary.cisloZneni} účinné od {formatDate(summary.ucinnostOd)}
                          {summary.novely.length > 0 && ` • novely: ${summary.novely.join(', ')}`}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          window.print();
                        }}
                        className={`${MENU_ITEM} sm:hidden`}
                      >
                        <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Tisk / PDF</span>
                      </button>

                      {isSpeechSupported() && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            handleSpeak(activeText);
                          }}
                          className={MENU_ITEM}
                        >
                          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-indigo-600' : 'text-slate-500'}`} aria-hidden="true" />
                          <span>{isSpeaking ? 'Zastavit předčítání' : 'Přečíst nahlas'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopy(activeText, copyKey)}
                        className={MENU_ITEM}
                      >
                        {copiedId === copyKey ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500" />
                        )}
                        <span>{copiedId === copyKey ? 'Zkopírováno' : 'Kopírovat zobrazený text'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          overitAktualnost();
                        }}
                        disabled={esbirka.freshnessState === 'loading'}
                        className={MENU_ITEM}
                        title="Zeptat se e-Sbírky, jaké znění předpisu je právě účinné, a porovnat ho se zněním v aplikaci"
                      >
                        {esbirka.freshnessState === 'loading' ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        ) : (
                          <RotateCcw className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>Ověřit aktuálnost podle e-Sbírky</span>
                      </button>

                      {esbirka.source.portalUrl && (
                        <a
                          href={esbirka.source.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setMenuOpen(false)}
                          className={MENU_ITEM}
                        >
                          <ExternalLink className="w-4 h-4 text-indigo-500" />
                          <span>Otevřít na e-Sbírce</span>
                        </a>
                      )}

                      {summary && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            openOfficialFile(summary.dokumentId);
                          }}
                          disabled={fileState === 'loading'}
                          className={MENU_ITEM}
                          title="Nechat e-Sbírku vygenerovat PDF tohoto znění a otevřít ho"
                        >
                          {fileState === 'loading' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-500" aria-hidden="true" />
                          ) : (
                            <Download className="w-4 h-4 text-slate-500" aria-hidden="true" />
                          )}
                          <span>{fileState === 'loading' ? 'Připravuji PDF z e-Sbírky…' : 'PDF z e-Sbírky'}</span>
                        </button>
                      )}

                      {/* Úprava studijního výběru patří lektorovi a správci. */}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            const regToEdit = activeModalRegulation;
                            setMenuOpen(false);
                            setActiveModalRegulation(null);
                            handleOpenEditModal(regToEdit);
                          }}
                          className={`${MENU_ITEM} mt-1 border-t border-slate-100 dark:border-slate-800 rounded-t-none`}
                          title="Upravit studijní výběr a metadata předpisu v aplikaci"
                        >
                          <Edit3 className="w-4 h-4 text-slate-500" />
                          <span>Upravit studijní výběr</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeReader}
                  aria-label="Zavřít znění"
                  title="Zavřít okno (Esc)"
                  className={TOOL_BUTTON}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Řádek 2: zdroj textu, hledání a skok na paragraf */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-1 pb-2 no-print">
              <div className="flex items-center shrink-0 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSourceMode('oficialni')}
                  disabled={!maUplneZneni}
                  aria-pressed={sourceMode === 'oficialni'}
                  aria-label="Informativní znění (e-Sbírka)"
                  className={`${SOURCE_BUTTON} disabled:opacity-40 disabled:cursor-not-allowed ${
                    sourceMode === 'oficialni'
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title={
                    maUplneZneni
                      ? 'Zobrazit informativní znění stažené z e-Sbírky'
                      : 'Pro tento předpis není znění z e-Sbírky k dispozici (nevyhlašuje se ve Sbírce zákonů)'
                  }
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Znění (e-Sbírka)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('vyber')}
                  aria-pressed={sourceMode === 'vyber'}
                  aria-label="Studijní výběr"
                  className={`${SOURCE_BUTTON} ${
                    sourceMode === 'vyber'
                      ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="Zobrazit studijní výběr ustanovení uložený v aplikaci"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Studijní výběr</span>
                </button>
              </div>

              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  aria-label="Hledat v textu předpisu"
                  placeholder="Hledat v textu…"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 [&::-webkit-search-cancel-button]:hidden"
                />
                {modalSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setModalSearchQuery('')}
                    aria-label="Zrušit hledání"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Skok na paragraf. Dřív řada čipů, která se na jeden řádek
                  nevešla a byla uříznutá na 60 položek — zákon jich má přes
                  sto. Rozbalovací seznam zabere zlomek místa a nabídne všechny,
                  a protože je v hlavičce, je po ruce i hluboko v textu. */}
              {jumpTargets.length > 0 && (
                <select
                  aria-label="Přejít na paragraf"
                  value=""
                  onChange={(e) => {
                    const target = jumpTargets.find((t) => t.key === e.target.value);
                    if (!target) return;
                    if (showingOfficial) jumpToSection(target.key);
                    else setModalSearchQuery(target.label);
                  }}
                  className="h-8 w-[5.5rem] sm:w-32 shrink-0 px-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">§ …</option>
                  {jumpTargets.map((target) => (
                    <option key={target.key} value={target.key}>
                      {target.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {(fileState === 'error' && fileError) || esbirka.freshness ? (
              <div className="px-3 sm:px-4 pb-2 space-y-1.5 no-print">
                {fileState === 'error' && fileError && (
                  <div
                    role="status"
                    className="flex items-start gap-2 px-3 py-1.5 rounded-lg border text-[0.6875rem] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="flex-1">
                      <strong>PDF z e-Sbírky se nepodařilo získat:</strong>{' '}
                      {fileError}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFileState('idle');
                        setFileError(null);
                      }}
                      aria-label="Skrýt hlášení"
                      className="shrink-0 cursor-pointer opacity-70 hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Výsledek ověření proti e-Sbírce */}
                {esbirka.freshness && (
                  <div
                    role="status"
                    className={`flex items-start gap-2 px-3 py-1.5 rounded-lg border text-[0.6875rem] font-semibold ${FRESHNESS_STYLE[esbirka.freshness.stav]}`}
                  >
                    {esbirka.freshness.stav === 'aktualni' ? (
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    )}
                    <span>
                      <strong>{freshnessLabel(esbirka.freshness.stav)}:</strong>{' '}
                      {esbirka.freshness.zprava}
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          {/* Modal Body: Scrollable Legal Text */}
          <div
            ref={bodyRef}
            className={`flex-1 min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] p-2 sm:p-4 space-y-3 font-sans leading-relaxed print:p-0 print:overflow-visible print:h-auto print:bg-white ${
              pdfViewMode === 'paper' ? 'bg-slate-200/70 dark:bg-slate-950/80' : 'bg-slate-100 dark:bg-slate-900'
            }`}
          >
            {/* Summary & Application Callout */}
            <div className="max-w-3xl mx-auto p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700/60 text-xs space-y-1.5 shadow-xs print-avoid-break print:bg-white print:border-slate-300">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                <span>Předmět a rozsah úpravy</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">{activeModalRegulation.scope}</p>
              {activeModalRegulation.practicalApplication.trim() && (
                <p className="text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <strong className="text-indigo-600 dark:text-indigo-400">Praktické uplatnění:</strong>{' '}
                  {activeModalRegulation.practicalApplication}
                </p>
              )}
              {activeModalRegulation.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 no-print">
                  {activeModalRegulation.tags.map(t => (
                    <span key={t} className="text-[0.625rem] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Poctivé označení toho, co je právě vidět */}
            <div
              className={`max-w-3xl mx-auto px-3 py-2 rounded-xl border text-[0.6875rem] font-semibold print:border-slate-300 ${
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
                    Přepnout na informativní znění z e-Sbírky
                  </button>
                </>
              )}
            </div>

            {sourceMode === 'oficialni' && esbirka.snapshotState === 'loading' && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Načítám znění z e-Sbírky…</span>
              </div>
            )}

            {sourceMode === 'oficialni' && esbirka.snapshotState === 'error' && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-2">
                <p className="font-bold">Znění z e-Sbírky se nepodařilo načíst.</p>
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
                <div className="bg-white text-slate-900 border border-slate-300 rounded-sm shadow-md p-5 sm:p-10 font-serif max-w-3xl mx-auto border-t-8 border-t-slate-800 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:border-t-0">
                  {/* Hlavička listu. Nesmí vypadat jako úřední tiskovina:
                      dřív tu stálo „SBÍRKA ZÁKONŮ“ i nad studijním výběrem. */}
                  <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center space-y-1 font-sans">
                    <div className="text-xs font-semibold text-slate-600">
                      {showingOfficial
                        ? 'Znění předpisu stažené z e-Sbírky (e-sbirka.gov.cz)'
                        : 'Studijní portál (neoficiální) – studijní výběr ustanovení'}
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-950">
                      {showingOfficial ? 'Informativní znění (e-Sbírka)' : 'Výběr pro přípravu na ZOP'}
                    </h1>
                    <div className="flex items-center justify-between text-[0.6875rem] font-bold text-slate-600 pt-1 border-t border-slate-200 gap-2 flex-wrap">
                      <span>{summary?.citace ?? activeModalRegulation.code}</span>
                      <span>
                        {showingOfficial && summary
                          ? `Účinnost od: ${formatDate(summary.ucinnostOd)}`
                          : `Účinnost od: ${activeModalRegulation.effectiveFrom || 'neuvedeno'}`}
                      </span>
                      <span>{activeModalRegulation.authority}</span>
                    </div>
                  </div>

                  <div className="text-center my-4 space-y-2">
                    <div className="text-sm font-bold text-slate-700">
                      {summary?.nazev ?? activeModalRegulation.title}
                    </div>
                    <div className="w-16 h-0.5 bg-slate-400 mx-auto my-2" />
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

                  <div className="mt-12 pt-4 border-t border-slate-300 text-[0.625rem] text-slate-500 flex items-center justify-between font-sans gap-3 flex-wrap">
                    <span>
                      {showingOfficial
                        ? 'Zdroj: e-Sbírka (e-sbirka.gov.cz), REST API — informativní znění'
                        : 'Zdroj: studijní portál (neoficiální) — studijní výběr ustanovení'}
                    </span>
                    <span>
                      {showingOfficial && summary
                        ? `Znění č. ${summary.cisloZneni} účinné od ${formatDate(summary.ucinnostOd)}`
                        : 'Není to úplné znění předpisu'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800">
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

        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
