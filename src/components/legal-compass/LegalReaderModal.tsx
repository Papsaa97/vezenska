import React, { useId } from 'react';
import {
  Search, Check, Volume2, FileText, Copy, ExternalLink,
  Edit3, RotateCcw, Sparkles, Type, Printer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VscrRegulation } from '../../data/vscrRegulationsRegistry';
import { saveRegulationToStorage } from '../../utils/regulationsStorage';
import { isSpeechSupported } from '../../utils/speech';
import PrintHeader from '../common/PrintHeader';
import { useDialog } from '../../hooks/useDialog';

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
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  reloadRegulations: () => void;
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
  showToast,
  reloadRegulations,
}: LegalReaderModalProps) {
  const fontSizeClass = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-relaxed',
  }[fontSize];

  const closeReader = () => {
    setActiveModalRegulation(null);
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Escape, past na fokus a jeho návrat — viz hooks/useDialog. Zavírá se přes
  // closeReader, aby Escape zároveň umlčel předčítání jako křížek.
  const titleId = useId();
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen: activeModalRegulation !== null,
    onClose: closeReader,
  });

  return (
    <AnimatePresence>
      {activeModalRegulation && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 print:relative print:inset-auto print:bg-white print:p-0 print:block"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeReader();
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 print:w-full print:max-w-none print:h-auto print:max-h-none print:border-none print:shadow-none print:rounded-none"
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-2 sm:space-y-3 shrink-0 bg-slate-50/70 dark:bg-slate-950/70 print:bg-white print:border-b-2 print:border-slate-900 print:p-0 print:mb-4">
              <PrintHeader
                subject={`Předpis VS ČR: ${activeModalRegulation.shortTitle}`}
                docTitle={`${activeModalRegulation.code} • ${activeModalRegulation.authority} (Účinnost od: ${activeModalRegulation.effectiveFrom || 'neuvedeno'})`}
                subtext="Sbírka předpisů Akademie Vězeňské služby ČR – Plné znění"
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
                      onClick={() => setPdfViewMode('paper')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        pdfViewMode === 'paper'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                      title="Přepnout do oficiálního zobrazení PDF Sbírky zákonů (A4 formát)"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-600" />
                      <span>PDF A4</span>
                    </button>
                    <button
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
                    onClick={() => setFontSize(prev => prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm')}
                    className="hidden sm:flex min-w-[44px] min-h-[44px] items-center justify-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
                    title="Změnit velikost písma textu"
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span className="uppercase text-[10px]">{fontSize}</span>
                  </button>

                  {/* Print Button */}
                  <button
                    onClick={() => window.print()}
                    className="flex min-w-[44px] min-h-[44px] items-center justify-center gap-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    title="Vytisknout znění předpisu nebo uložit jako PDF soubor"
                  >
                    <Printer className="w-4 h-4 text-white" />
                    <span className="inline text-xs">Tisk / PDF</span>
                  </button>

                  {/* Audio TTS */}
                  {isSpeechSupported() && (
                    <button
                      onClick={() => handleSpeak(activeModalRegulation.fullLegalText)}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors cursor-pointer border ${
                        isSpeaking
                          ? 'bg-blue-600 border-blue-600 text-white animate-pulse'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80'
                      }`}
                      title={isSpeaking ? 'Zastavit předčítání' : 'Přečíst celé znění nahlas (TTS)'}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Copy Full Text */}
                  <button
                    onClick={() => handleCopy(activeModalRegulation.fullLegalText, `modal-${activeModalRegulation.id}`)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 px-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    title="Zkopírovat celé doslovné znění do schránky"
                  >
                    {copiedId === `modal-${activeModalRegulation.id}` ? (
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
                    onClick={closeReader}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-0.5 text-lg font-light"
                    title="Zavřít okno (ESC)"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* In-Modal Search Bar & Official Link & Sync */}
              <div className="space-y-2 no-print">
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
                        onClick={() => setModalSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      showToast(`Předpis „${activeModalRegulation.code}" byl ověřen a aktualizován v databázi dle e-Sbírka.gov.cz!`);
                      saveRegulationToStorage(activeModalRegulation);
                      reloadRegulations();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl transition-colors shrink-0 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer shadow-2xs"
                    title="Ověřit a synchronizovat aktuální znění z e-Sbírka.gov.cz do lokální databáze"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ověřit dle e-Sbírky</span>
                  </button>

                  {activeModalRegulation.officialUrl && (
                    <a
                      href={activeModalRegulation.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl transition-colors shrink-0 border border-indigo-200 dark:border-indigo-800/60"
                      title="Otevřít oficiální platné znění a export PDF na e-Sbírka.gov.cz"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      <span>Oficiální PDF / e-Sbírka</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>

                {/* Fast Section Navigation Chips */}
                {(() => {
                  if (!activeModalRegulation.fullLegalText) return null;
                  const text = activeModalRegulation.fullLegalText;
                  const regex = /(§\s*\d+[a-z]?|Článek\s*\d+|Pravidlo\s*\d+)/g;
                  const matches: string[] = [];
                  let m;
                  while ((m = regex.exec(text)) !== null) {
                    const found = m[0].replace(/\s+/g, ' ').trim();
                    if (!matches.includes(found)) {
                      matches.push(found);
                    }
                  }
                  if (matches.length === 0) return null;

                  return (
                    <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                        Rychlý skok:
                      </span>
                      {matches.slice(0, 30).map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setModalSearchQuery(sec)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                            modalSearchQuery.trim() === sec
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Body: Scrollable Legal Text / PDF Sheet */}
            <div className={`flex-1 min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] p-4 sm:p-6 space-y-4 font-sans leading-relaxed print:p-0 print:overflow-visible print:h-auto print:bg-white ${
              pdfViewMode === 'paper' ? 'bg-slate-200/70 dark:bg-slate-950/80' : 'bg-slate-100 dark:bg-slate-900'
            }`}>
              {/* Summary & Application Callout */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700/60 text-xs space-y-1.5 shadow-xs print-avoid-break print:bg-white print:border-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Předmět a rozsah úpravy:</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  {activeModalRegulation.scope}
                </p>
                <p className="text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <strong className="text-indigo-600 dark:text-indigo-400">Praktické uplatnění:</strong> {activeModalRegulation.practicalApplication}
                </p>
              </div>

              {/* PDF Paper Mode View */}
              {pdfViewMode === 'paper' ? (
                <div className="bg-white text-slate-900 border border-slate-300 rounded-sm shadow-2xl p-6 sm:p-12 font-serif max-w-3xl mx-auto my-2 border-t-8 border-t-slate-800 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:border-t-0">
                  {/* Official Sbírka Zákonů PDF Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center space-y-1.5 font-sans">
                    <div className="text-[11px] uppercase tracking-widest font-black text-slate-600">
                      Česká republika • Úřední znění předpisu
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 uppercase font-serif">
                      Sbírka zákonů
                    </h1>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pt-1 border-t border-slate-200">
                      <span>{activeModalRegulation.code}</span>
                      <span>Účinnost od: {activeModalRegulation.effectiveFrom}</span>
                      <span>{activeModalRegulation.authority}</span>
                    </div>
                  </div>

                  {/* Official Document Sub-Header */}
                  <div className="text-center my-6 space-y-2">
                    <div className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      {activeModalRegulation.title}
                    </div>
                    <div className="w-16 h-0.5 bg-slate-400 mx-auto my-3" />
                  </div>

                  {/* Full Verbatim PDF Content */}
                  <div className={`whitespace-pre-wrap leading-relaxed text-slate-900 select-text font-serif text-justify ${
                    fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'
                  }`}>
                    {(() => {
                      if (!activeModalRegulation.fullLegalText) {
                        return (
                          <div className="text-slate-500 py-8 text-center font-sans">
                            Plné znění není v lokální databázi.
                          </div>
                        );
                      }
                      if (!modalSearchQuery.trim()) return activeModalRegulation.fullLegalText;
                      const parts = activeModalRegulation.fullLegalText.split(new RegExp(`(${modalSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
                      return parts.map((part, i) =>
                        part.toLowerCase() === modalSearchQuery.toLowerCase() ? (
                          <mark key={i} className="bg-yellow-300 text-slate-950 font-bold px-0.5 rounded">{part}</mark>
                        ) : (
                          part
                        )
                      );
                    })()}
                  </div>

                  {/* Document Footer */}
                  <div className="mt-12 pt-4 border-t border-slate-300 text-[10px] text-slate-500 flex items-center justify-between font-sans">
                    <span>Zdroj: Oficiální e-Sbírka (e-sbirka.gov.cz)</span>
                    <span>Konsolidované znění k roku {new Date().getFullYear()}</span>
                  </div>
                </div>
              ) : (
                /* Dark Terminal Mode View */
                <div className="p-4 sm:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-inner">
                  <pre className={`whitespace-pre-wrap font-mono select-text text-slate-200 ${fontSizeClass}`}>
                    {(() => {
                      if (!activeModalRegulation.fullLegalText) {
                        return (
                          <div className="text-slate-400 py-6 text-center space-y-2">
                            <p>Plné znění pro tento předpis není lokálně uloženo.</p>
                          </div>
                        );
                      }
                      if (!modalSearchQuery.trim()) return activeModalRegulation.fullLegalText;
                      const parts = activeModalRegulation.fullLegalText.split(new RegExp(`(${modalSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
                      return parts.map((part, i) =>
                        part.toLowerCase() === modalSearchQuery.toLowerCase() ? (
                          <mark key={i} className="bg-yellow-400/80 text-slate-950 font-bold rounded px-0.5">{part}</mark>
                        ) : (
                          part
                        )
                      );
                    })()}
                  </pre>
                </div>
              )}
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
                  onClick={() => {
                    const regToEdit = activeModalRegulation;
                    setActiveModalRegulation(null);
                    handleOpenEditModal(regToEdit);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Upravit znění</span>
                </button>

                <button
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
