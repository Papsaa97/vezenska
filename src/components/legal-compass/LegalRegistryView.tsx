import React from 'react';
import {
  Scale, Search, BookOpen, HelpCircle, Star, ArrowLeft,
  Sparkles, ExternalLink, Download, Upload, Plus,
  Edit3, Trash2, Wifi, Database, FileText, ChevronRight,
  ChevronLeft, Volume2, Copy, Check, Printer, AlertCircle, Lightbulb, X,
} from 'lucide-react';
import { LegalArticle } from '../../data/legalCompasData';
import { VscrRegulation } from '../../data/vscrRegulationsRegistry';
import { isSpeechSupported } from '../../utils/speech';
import { resolveRegulationSource } from '../../utils/esbirka/status';
import PrintHeader from '../common/PrintHeader';
import OfficialSectionPanel, { findArticleSnapshot } from './OfficialSectionPanel';
import { formatIsoDate } from './legalCompassLabels';
import { isRepealed } from '../../utils/regulationDocuments';
import ShareToChatButton from '../chat/ShareToChatButton';
import { shareArticle, shareRegulation } from '../../utils/chatShare';

/** Nadpis bloku v detailu ustanovení — obyčejný nadpis místo verzálkového štítku. */
const BLOCK_HEADING =
  'text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5';

/** Tlačítko s ikonou v pravém horním rohu detailu (44 px na dotyk). */
const DETAIL_ICON_BUTTON =
  'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer';

interface OfflineStatus {
  isDownloaded: boolean;
  downloadedAt?: string | null;
}

interface CategoryItem {
  key: string;
  label: string;
  count: number;
}

interface RegistryTypeItem {
  key: string;
  label: string;
  count: number;
}

interface LegalRegistryViewProps {
  // Shared view mode
  viewMode: 'articles' | 'registry';

  // Articles view state
  filteredArticles: LegalArticle[];
  currentArticle: LegalArticle | null;
  currentIndex: number;
  mobileDetailOpen: boolean;
  setMobileDetailOpen: (v: boolean) => void;
  savedFavorites: string[];
  copiedId: string | null;
  isSpeaking: boolean;
  categoriesList: CategoryItem[];
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleSelectArticle: (id: string) => void;
  toggleFavorite: (id: string) => void;
  handleCopy: (text: string, id: string) => void;
  handleSpeak: (text: string) => void;
  goToPrev: () => void;
  goToNext: () => void;
  detailContainerRef: React.RefObject<HTMLDivElement | null>;
  listContainerRef: React.RefObject<HTMLDivElement | null>;

  // Registry view state
  filteredRegulations: VscrRegulation[];
  offlineStatus: OfflineStatus;
  registryTypesList: RegistryTypeItem[];
  selectedRegistryType: string;
  setSelectedRegistryType: (v: string) => void;
  handleSaveForOffline: () => void;
  /** Běží právě stahování úplných znění do zařízení? */
  offlineBusy: boolean;
  /** Průběh probíhajícího stahování, `null` když se nestahuje. */
  offlineProgress: { hotovo: number; celkem: number } | null;
  /** Kolik znění je v mezipaměti zařízení. `null` = ještě se zjišťuje. */
  cachedSnapshots: { ulozeno: number; celkem: number; zjistitelne: boolean } | null;
  /** Smí uživatel předpisy zakládat, upravovat, mazat a importovat? */
  canEdit: boolean;
  handleOpenNewEditor: () => void;
  handleExportJSON: () => void;
  handleOpenEditModal: (reg: VscrRegulation) => void;
  handleDeleteRegulation: (id: string, code: string) => void;
  setActiveModalRegulation: (reg: VscrRegulation | null) => void;
  setModalSearchQuery: (v: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** Otevře nahraný text předpisu (NGŘ) v prohlížeči souborů. */
  openRegulationDocument: (reg: VscrRegulation) => void;
  /** Zrušené NGŘ, ze kterého vychází otevřený článek výkladu; jinak null. */
  currentArticleRepealed: VscrRegulation | null;
}

export default function LegalRegistryView({
  viewMode,
  filteredArticles,
  currentArticle,
  currentIndex,
  mobileDetailOpen,
  setMobileDetailOpen,
  savedFavorites,
  copiedId,
  isSpeaking,
  categoriesList,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  handleSelectArticle,
  toggleFavorite,
  handleCopy,
  handleSpeak,
  goToPrev,
  goToNext,
  detailContainerRef,
  listContainerRef,
  filteredRegulations,
  offlineStatus,
  registryTypesList,
  selectedRegistryType,
  setSelectedRegistryType,
  handleSaveForOffline,
  offlineBusy,
  offlineProgress,
  cachedSnapshots,
  canEdit,
  handleOpenNewEditor,
  handleExportJSON,
  handleOpenEditModal,
  handleDeleteRegulation,
  setActiveModalRegulation,
  setModalSearchQuery,
  fileInputRef,
  openRegulationDocument,
  currentArticleRepealed,
}: LegalRegistryViewProps) {
  if (viewMode === 'registry') {
    return (
      /* ========================================================================= */
      /* REGISTRY VIEW: COMPLETE LIST OF LAWS, DECREES AND NGR                   */
      /* ========================================================================= */
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">

        {/* Popis katalogu a stav offline. Název modulu je v záhlaví stránky,
            druhý nadpis tu nebyl potřeba. */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-4 flex-col lg:flex-row lg:items-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
              Katalog zákonů, vyhlášek a nařízení GŘ se studijním výběrem ustanovení. U předpisů ze
              Sbírky zákonů je k dispozici i informativní znění stažené z e-Sbírky, ověření aktuálnosti
              a uložení do zařízení pro čtení bez připojení.
            </p>

            {/* Offline Cache Status Badge
                Odznak hlásí, co je OPRAVDU v mezipaměti zařízení, ne jen to, že
                uživatel někdy v minulosti zmáčkl „Stáhnout pro offline“. Dřív
                se řídil jen časovým údajem v localStorage, takže po smazání dat
                webu (nebo dřív i po nasazení nové verze aplikace) tvrdil
                „Uloženo offline“ nad prázdnou mezipamětí. */}
            <div className="flex items-center gap-2 shrink-0" aria-live="polite">
              {cachedSnapshots === null ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <Database className="w-3 h-3" aria-hidden="true" />
                  <span>Zjišťuji offline stav…</span>
                </span>
              ) : !cachedSnapshots.zjistitelne ? (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  title="Prohlížeč nezpřístupňuje mezipaměť (např. anonymní okno v Safari). O uložených zněních to neříká nic."
                >
                  <Database className="w-3 h-3" aria-hidden="true" />
                  <span>Offline stav nelze zjistit</span>
                </span>
              ) : cachedSnapshots.ulozeno === 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <Wifi className="w-3 h-3" aria-hidden="true" />
                  <span>Znění se načítají online</span>
                </span>
              ) : cachedSnapshots.ulozeno < cachedSnapshots.celkem ? (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  title="Zbytek znění se načte ze sítě. Stažení lze spustit znovu."
                >
                  <Database className="w-3 h-3" aria-hidden="true" />
                  <span>
                    Offline částečně: {cachedSnapshots.ulozeno} z {cachedSnapshots.celkem} znění
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Database className="w-3 h-3" aria-hidden="true" />
                  <span>
                    Uloženo offline: {cachedSnapshots.ulozeno} znění
                    {offlineStatus.downloadedAt ? ` (${offlineStatus.downloadedAt})` : ''}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap no-print">
              <button
                type="button"
                onClick={handleSaveForOffline}
                disabled={offlineBusy}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                title="Stáhne informativní znění předpisů z e-Sbírky do zařízení, aby šla číst bez připojení"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                {/* Stahování 1,5 MB zákonů trvá na mobilních datech desítky
                    sekund. Samotné „Stahuji…“ vypadalo zaseknutě, proto se
                    hlásí, kolikáté znění se právě přenáší. */}
                <span>
                  {offlineBusy
                    ? offlineProgress && offlineProgress.celkem > 0
                      ? `Stahuji ${offlineProgress.hotovo} / ${offlineProgress.celkem}…`
                      : 'Stahuji…'
                    : 'Stáhnout pro offline'}
                </span>
              </button>
              {offlineBusy && offlineProgress && offlineProgress.celkem > 0 && (
                <div
                  className="w-32 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
                  role="progressbar"
                  aria-label="Průběh stahování znění z e-Sbírky"
                  aria-valuemin={0}
                  aria-valuemax={offlineProgress.celkem}
                  aria-valuenow={offlineProgress.hotovo}
                >
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{
                      width: `${Math.round((offlineProgress.hotovo / offlineProgress.celkem) * 100)}%`,
                    }}
                  />
                </div>
              )}

              {/* Zakládání, záloha a import předpisů patří lektorovi a správci.
                  Dřív je mohl použít kdokoli — i student si tak mohl přepsat
                  text zákona, který se mu pak zobrazoval jako studijní výběr. */}
              {canEdit && (
                <>
                  <button
                    type="button"
                    onClick={handleOpenNewEditor}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Přidat do databáze nový interní předpis nebo směrnici"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Přidat předpis</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="Zálohovat celou databázi do souboru JSON"
                    aria-label="Zálohovat databázi předpisů do JSON"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="Nahrát databázi předpisů ze záložního souboru JSON"
                    aria-label="Importovat databázi předpisů z JSON"
                  >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </>
              )}
          </div>
        </div>

        {/* Jak udržet NGŘ aktuální — jen pro ty, kdo je smějí měnit. */}
        {canEdit && (
          <p className="no-print text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
            <strong className="text-slate-800 dark:text-slate-200">Aktualizace NGŘ:</strong> nové NGŘ přidejte
            tlačítkem „Přidat předpis“, nahrajte jeho PDF a v poli „Nahrazuje předpis“ vyberte to staré — to se
            označí jako zrušené. Při změně stávajícího NGŘ otevřete „Upravit“ a nahrajte novější znění; to
            předchozí zůstane v historii.
          </p>
        )}

        {/* Search & Filter Bar for Registry */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between no-print">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              aria-label="Hledat v katalogu předpisů"
              placeholder="Hledat zákon, číslo vyhlášky, NGŘ, téma…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Vymazat hledání"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {registryTypesList.map(type => {
              const isActive = selectedRegistryType === type.key;
              return (
                <button
                  type="button"
                  key={type.key}
                  aria-pressed={isActive}
                  onClick={() => setSelectedRegistryType(type.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{type.label}</span>
                  <span className={`text-[0.625rem] px-1.5 py-px rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {type.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredRegulations.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">
            Hledání ani filtru neodpovídá žádný předpis. Zkuste jiný výraz nebo zvolte „Všechny předpisy“.
          </p>
        )}

        {/* Regulations Grid / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRegulations.map(reg => {
            const typeBadgeColor = {
              zakon: 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
              vyhlaska: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
              ngr: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
              instrukce: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
              ustava_mezinarodni: 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            }[reg.type];

            const source = resolveRegulationSource(reg);
            const repealed = isRepealed(reg);
            const hasStudyText = reg.fullLegalText.trim().length > 0;

            return (
              <div
                key={reg.id}
                className={`border rounded-2xl p-4 sm:p-5 transition-all space-y-3.5 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 border-slate-200 dark:border-slate-800 ${
                  repealed ? 'opacity-75' : ''
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-md text-[0.625rem] font-bold border ${typeBadgeColor}`}>
                        {reg.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[0.625rem] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {reg.authority}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[0.625rem] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        {reg.importanceForZOP}
                      </span>
                      {/* Poctivé rozlišení: má aplikace znění z e-Sbírky, nebo jen výběr? */}
                      {repealed && (
                        <span className="px-2 py-0.5 rounded-md text-[0.625rem] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                          Zrušeno{reg.replacedBy ? ` – nahrazeno ${reg.replacedBy}` : ''}
                        </span>
                      )}
                      {reg.document ? (
                        <span
                          className="px-2 py-0.5 rounded-md text-[0.625rem] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          title={`Soubor ${reg.document.fileName}`}
                        >
                          Text nahrán{reg.document.uploadedAt ? ` ${formatIsoDate(reg.document.uploadedAt)}` : ''}
                        </span>
                      ) : source.summary ? (
                        <span
                          className="px-2 py-0.5 rounded-md text-[0.625rem] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          title={`Informativní znění staženo z e-Sbírky ${formatIsoDate(source.summary.stazenoDne)}`}
                        >
                          Informativní znění (e-Sbírka) od {formatIsoDate(source.summary.ucinnostOd)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[0.625rem] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {reg.type === 'ngr' ? 'Text NGŘ zatím nenahrán' : 'Jen studijní výběr'}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                      {reg.shortTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {reg.title}
                    </p>
                  </div>

                  {/* Úprava a odebrání předpisu — jen lektor a správce. */}
                  {canEdit && (
                    <div className="flex items-center gap-1 shrink-0 no-print">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(reg)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Upravit metadata nebo text předpisu"
                        aria-label={`Upravit předpis ${reg.code}`}
                      >
                        <Edit3 className="w-4 h-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRegulation(reg.id, reg.code)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Odebrat vlastní předpis nebo vrátit výchozí znění"
                        aria-label={`Odebrat předpis ${reg.code} nebo vrátit výchozí znění`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Co u záznamu chybí — vidí to všichni, aby nikdo nečetl
                    neúplný záznam jako hotový. */}
                {reg.reviewNote && (
                  <p className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-2 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <strong>K doplnění:</strong> {reg.reviewNote}
                    </span>
                  </p>
                )}

                {/* Scope & Summary */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {reg.scope}
                </p>

                {/* Key Provisions Bullet List */}
                {reg.keyProvisions && reg.keyProvisions.length > 0 && (
                  <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                      <span>Klíčová ustanovení k zapamatování</span>
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {reg.keyProvisions.map((prov, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-indigo-500 font-bold mt-0.5">•</span>
                          <span className="leading-snug">{prov}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Practical Application */}
                {reg.practicalApplication && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    <strong className="text-indigo-900 dark:text-indigo-300">Uplatnění ve službě:</strong> {reg.practicalApplication}
                  </div>
                )}

                {/* Full Legal Text Modal Trigger & External Link */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {reg.document && (
                      <button
                        type="button"
                        onClick={() => openRegulationDocument(reg)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
                        title={`Otevřít nahraný text: ${reg.document.fileName}`}
                      >
                        <FileText className="w-4 h-4" aria-hidden="true" />
                        <span>Otevřít text {reg.type === 'ngr' ? 'NGŘ' : 'předpisu'}</span>
                      </button>
                    )}
                    {(source.summary || hasStudyText) && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalRegulation(reg);
                          setModalSearchQuery('');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                          reg.document
                            ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" aria-hidden="true" />
                        <span>{source.summary ? 'Číst informativní znění' : 'Číst studijní výběr'}</span>
                      </button>
                    )}
                    {canEdit && !reg.document && reg.type === 'ngr' && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(reg)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        <Upload className="w-4 h-4" aria-hidden="true" />
                        <span>Nahrát text NGŘ</span>
                      </button>
                    )}
                    <ShareToChatButton
                      label={`Poslat ${reg.code} do chatu`}
                      className="py-2"
                      getShare={() => shareRegulation(reg)}
                    />
                  </div>

                  {source.portalUrl && (
                    <a
                      href={source.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                      title="Otevřít předpis na portálu e-Sbírka (e-sbirka.gov.cz)"
                    >
                      <span>e-Sbírka.gov.cz</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {reg.tags.map(t => (
                    <span key={t} className="text-[0.625rem] font-medium px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // ARTICLES VIEW: PARAGRAPH COMPASS WITH FULL TEXT AND TIPS
  // =========================================================================
  return (
    <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 sm:gap-6 overflow-hidden relative">

      {/* --------------------------------------------------------------------- */}
      {/* SIDEBAR: SEZNAM PŘEDPISŮ & VYHLEDÁVÁNÍ */}
      {/* --------------------------------------------------------------------- */}
      <aside
        ref={listContainerRef}
        className={`${
          mobileDetailOpen ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm h-[calc(100dvh-8rem)] md:h-auto max-h-[calc(100dvh-8rem)] md:max-h-none no-print`}
      >
        {/* Search Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              aria-label="Hledat v paragrafovém výkladu"
              placeholder="Hledat paragraf, pojem, zákon…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Vymazat hledání"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Categories Pill Slider */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categoriesList.map(cat => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  type="button"
                  key={cat.key}
                  aria-pressed={isActive}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat.key === 'favs' && (
                    <Star className={`w-3 h-3 ${isActive ? 'fill-white' : 'text-amber-500 fill-amber-500'}`} aria-hidden="true" />
                  )}
                  <span>{cat.label}</span>
                  <span className={`text-[0.625rem] px-1.5 py-px rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List of Articles */}
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1 overscroll-contain [touch-action:pan-y]">
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-400" aria-hidden="true" />
              <p>Hledání ani filtru neodpovídá žádné ustanovení. Zkuste jiný výraz nebo zvolte „Vše“.</p>
            </div>
          ) : (
            filteredArticles.map(art => {
              const isSelected = art.id === currentArticle?.id;
              const isFav = savedFavorites.includes(art.id);
              return (
                <button type="button"
                  key={art.id}
                  onClick={() => handleSelectArticle(art.id)}
                  aria-current={isSelected ? 'true' : undefined}
                  className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[0.625rem] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {art.actNumber}
                      </span>
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {art.section}
                      </span>
                      {isFav && <Star className="w-3 h-3 text-amber-500 fill-amber-500" aria-label="Oblíbené" />}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {art.title}
                    </h4>
                    <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {art.explanation}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`} aria-hidden="true" />
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN DETAIL PANEL: TEXT, METODIKA, CHYTÁKY */}
      {/* --------------------------------------------------------------------- */}
      <section
        ref={detailContainerRef}
        className={`${
          mobileDetailOpen ? 'flex' : 'hidden md:flex'
        } flex-1 min-h-0 flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-[100dvh] md:h-auto max-h-[100dvh] md:max-h-none`}
      >
        {currentArticle ? (
          <>
            {/* Mobile Back Button */}
            <div className="md:hidden flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 no-print">
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer min-h-[44px] min-w-[44px] px-1"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Zpět na seznam ustanovení</span>
              </button>
              <div className="text-xs font-semibold text-slate-400">
                {currentArticle.actNumber}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] p-3 sm:p-6 md:p-8 space-y-6">

              {/* Print Header */}
              <PrintHeader
                subject={`Kompas zákonů – ${currentArticle.actTitle}`}
                docTitle={`${currentArticle.section} – ${currentArticle.title} (${currentArticle.actNumber})`}
                subtext="Studijní portál – neoficiální studijní materiál (studijní přepis, ne citace zákona)"
              />

              {/* Header: Title, Tags, Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {currentArticle.section}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 line-clamp-1">
                      {currentArticle.actTitle} ({currentArticle.actNumber})
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {currentArticle.title}
                  </h2>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 no-print">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="min-h-[44px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    aria-label="Tisk nebo uložení do PDF"
                    title="Vytisknout ustanovení s výkladem a chytáky nebo uložit do PDF"
                  >
                    <Printer className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Tisk / PDF</span>
                  </button>

                  <ShareToChatButton
                    compact
                    label="Poslat ustanovení do chatu"
                    className="min-w-[44px] min-h-[44px] justify-center border border-slate-200 dark:border-slate-700"
                    getShare={() => shareArticle(currentArticle)}
                  />

                  <button
                    type="button"
                    onClick={() => toggleFavorite(currentArticle.id)}
                    aria-pressed={savedFavorites.includes(currentArticle.id)}
                    aria-label={savedFavorites.includes(currentArticle.id) ? 'Odebrat z oblíbených' : 'Uložit do oblíbených'}
                    className={`${DETAIL_ICON_BUTTON} ${
                      savedFavorites.includes(currentArticle.id)
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title={savedFavorites.includes(currentArticle.id) ? 'Odebrat z oblíbených' : 'Uložit do oblíbených'}
                  >
                    <Star className={`w-4 h-4 ${savedFavorites.includes(currentArticle.id) ? 'fill-amber-500' : ''}`} aria-hidden="true" />
                  </button>

                  {isSpeechSupported() && (
                    <button
                      type="button"
                      onClick={() => handleSpeak(`${currentArticle.section}. ${currentArticle.title}. ${currentArticle.exactText}. Aplikační výklad: ${currentArticle.explanation}`)}
                      aria-pressed={isSpeaking}
                      aria-label={isSpeaking ? 'Zastavit předčítání' : 'Přečíst ustanovení nahlas'}
                      className={`${DETAIL_ICON_BUTTON} ${
                        isSpeaking
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={isSpeaking ? 'Zastavit předčítání' : 'Přečíst ustanovení nahlas'}
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}

                  {/* Popisek je pod 640 px schovaný (`hidden sm:inline`), a co je
                      display:none, to prohlížeč vyřadí i ze stromu přístupnosti —
                      na telefonu by tak tlačítko zůstalo bez jména. Proto aria-label.
                      Zkopírovaný text nese poznámku, že jde o studijní přepis:
                      vložený do záznamu nebo do práce by se jinak tvářil jako citace. */}
                  <button
                    type="button"
                    onClick={() => handleCopy(`${currentArticle.section} – ${currentArticle.title} (${currentArticle.actNumber})\n(studijní přepis, ne citace)\n\n${currentArticle.exactText}\n\nVýklad:\n${currentArticle.explanation}`, currentArticle.id)}
                    aria-label={copiedId === currentArticle.id ? 'Zkopírováno' : 'Zkopírovat studijní přepis a výklad'}
                    className="min-h-[44px] px-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    {copiedId === currentArticle.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" aria-hidden="true" />
                        <span className="hidden sm:inline">Zkopírováno</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Kopírovat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Výklad vychází z NGŘ, které lektor v katalogu označil jako
                  zrušené — student musí vědět, že může číst zastaralé pravidlo. */}
              {currentArticleRepealed && (
                <p role="note" className="text-xs text-rose-900 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl px-3 py-2 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    {currentArticleRepealed.code} je zrušené
                    {currentArticleRepealed.replacedBy ? ` a nahradilo ho ${currentArticleRepealed.replacedBy}` : ''}.
                    Výklad níže může být zastaralý; ověřte ho v aktuálním znění.
                  </span>
                </p>
              )}

              {/* Blok 1: studijní přepis ustanovení
                  Dřív byl nadpis „Doslovné znění zákona“. Kontrola doslovnosti
                  (npm run check:legal) ale ukazuje, že texty jsou z velké části
                  přepsané vlastními slovy — zkrácené, se zvýrazněním a s důrazem
                  na zkoušku. Jako studijní pomůcka to smysl má, jako citace
                  zákona ne, a tvrdit druhé o prvním je zavádějící. Znění
                  z e-Sbírky je hned pod tím, když ho předpis má. */}
              <div className="space-y-2 print-card">
                <h3 className={BLOCK_HEADING}>
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  Znění ustanovení — studijní přepis
                </h3>
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-text print:bg-white print:border-none print:p-0">
                  {currentArticle.exactText}
                </div>
                <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400">
                  Zkrácený přepis pro přípravu na ZOP, ne doslovná citace.
                  {findArticleSnapshot(currentArticle.actNumber) ? ' Informativní znění z e-Sbírky je níže.' : ''}
                </p>
              </div>

              {/* Blok 1b: informativní znění z e-Sbírky */}
              {/* key: panel si drží stažené znění, a bez něj by po přepnutí článku filtroval text předchozího zákona */}
              <OfficialSectionPanel key={currentArticle.id} article={currentArticle} />

              {/* Block 2: Methodological Explanation */}
              <div className="space-y-2 print-card">
                <h3 className={BLOCK_HEADING}>
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Výklad pro praxi
                </h3>
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 print:bg-white print:border-none print:p-0">
                  <p>{currentArticle.explanation}</p>
                </div>
              </div>

              {/* Block 3: Exam Traps & Key Takeaways */}
              <div className="space-y-2 print-card">
                <h3 className={BLOCK_HEADING}>
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Chytáky u zkoušky a důležité body
                </h3>
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed print:bg-white print:border-none print:p-0">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400 print:hidden" aria-hidden="true" />
                    <div>{currentArticle.examTips}</div>
                  </div>
                </div>
              </div>

              {/* Desktop Stepper (Prev / Next) */}
              <div className="hidden md:flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 no-print">
                <button
                  type="button"
                  disabled={currentIndex <= 0}
                  onClick={goToPrev}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Předchozí{currentIndex > 0 ? ` (${filteredArticles[currentIndex - 1].section})` : ''}</span>
                </button>

                <div className="text-xs text-slate-400 font-semibold">
                  Ustanovení {currentIndex + 1} z {filteredArticles.length}
                </div>

                <button
                  type="button"
                  disabled={currentIndex >= filteredArticles.length - 1}
                  onClick={goToNext}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <span>Další{currentIndex < filteredArticles.length - 1 ? ` (${filteredArticles[currentIndex + 1].section})` : ''}</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

            </div>{/* end scrollable body */}

            {/* Mobile Stepper Footer */}
            <div className="md:hidden flex items-center justify-between gap-2 px-3 py-2 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 no-print">
              <button
                type="button"
                disabled={currentIndex <= 0}
                onClick={goToPrev}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Předchozí</span>
              </button>
              <div className="text-[0.625rem] text-slate-400 font-semibold whitespace-nowrap px-1">
                {currentIndex + 1} / {filteredArticles.length}
              </div>
              <button
                type="button"
                disabled={currentIndex >= filteredArticles.length - 1}
                onClick={goToNext}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span>Další</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center space-y-3">
            <Scale className="w-12 h-12 text-slate-300 dark:text-slate-700" aria-hidden="true" />
            {/* Na telefonu je seznam skrytý, dokud je otevřený detail — bez tlačítka by se
                sem student (např. po odebrání poslední oblíbené) dostal a nevrátil. */}
            {mobileDetailOpen && (
              <button
                type="button"
                onClick={() => setMobileDetailOpen(false)}
                className="md:hidden flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer min-h-[44px] px-2"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Zpět na seznam ustanovení</span>
              </button>
            )}
            {searchQuery.trim() || selectedCategory !== 'all' ? (
              <p>
                Zadanému hledání neodpovídá žádné ustanovení. Zkuste jiný výraz nebo zvolte „Vše“.
              </p>
            ) : (
              <p>Vyberte ustanovení ze seznamu — zobrazí se studijní přepis, výklad a chytáky.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
