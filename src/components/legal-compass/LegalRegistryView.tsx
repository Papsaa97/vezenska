import React from 'react';
import {
  Scale, Search, BookOpen, HelpCircle, Star, ArrowLeft,
  Sparkles, CheckCircle2, ExternalLink, Download, Upload, Plus,
  Edit3, Trash2, Wifi, Database, ShieldCheck, FileText, ChevronRight,
  ChevronLeft, Volume2, Copy, Check, Printer, AlertCircle,
} from 'lucide-react';
import { LegalArticle } from '../../data/legalCompasData';
import { VscrRegulation } from '../../data/vscrRegulationsRegistry';
import { isSpeechSupported } from '../../utils/speech';
import PrintHeader from '../common/PrintHeader';

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
  currentArticle: LegalArticle | undefined;
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
  regulationsList: VscrRegulation[];
  handleSaveForOffline: () => void;
  handleOpenNewEditor: () => void;
  handleExportJSON: () => void;
  handleOpenEditModal: (reg: VscrRegulation) => void;
  handleDeleteRegulation: (id: string, code: string) => void;
  setActiveModalRegulation: (reg: VscrRegulation | null) => void;
  setModalSearchQuery: (v: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
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
  regulationsList,
  handleSaveForOffline,
  handleOpenNewEditor,
  handleExportJSON,
  handleOpenEditModal,
  handleDeleteRegulation,
  setActiveModalRegulation,
  setModalSearchQuery,
  fileInputRef,
}: LegalRegistryViewProps) {
  if (viewMode === 'registry') {
    return (
      /* ========================================================================= */
      /* REGISTRY VIEW: COMPLETE LIST OF LAWS, DECREES AND NGR                   */
      /* ========================================================================= */
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 shadow-sm">

        {/* Header & Subtitle */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Normativní báze Akademie VS ČR • Online &amp; Offline správa</span>
            </div>

            {/* Offline Cache Status Badge */}
            <div className="flex items-center gap-2">
              {offlineStatus.isDownloaded ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>Uloženo offline ({offlineStatus.downloadedAt})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Wifi className="w-3 h-3 text-amber-600" />
                  <span>Čerpá se online</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 flex-col lg:flex-row lg:items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Registr zákonů, vyhlášek a nařízení GŘ (NGŘ)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
                Kompletní katalog předpisů s možností offline uložení do telefonu/PC, přímých odkazů na portál e-Sbírka i vlastního přidávání nových směrnic.
              </p>
            </div>

            {/* Management Buttons */}
            <div className="flex items-center gap-2 flex-wrap shrink-0 no-print">
              <button
                onClick={handleSaveForOffline}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Stáhne a uloží všechny předpisy pro plnohodnotné studium bez internetu"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Stáhnout pro offline</span>
              </button>

              <button
                onClick={handleOpenNewEditor}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Přidat do databáze nový interní předpis nebo směrnici"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Přidat předpis</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Zálohovat celou databázi do souboru JSON"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Nahrát databázi předpisů ze záložního souboru JSON"
              >
                <Upload className="w-3.5 h-3.5 text-amber-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar for Registry */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between no-print">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Hledat zákon, číslo vyhlášky, NGŘ, téma..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {registryTypesList.map(type => {
              const isActive = selectedRegistryType === type.key;
              return (
                <button
                  key={type.key}
                  onClick={() => setSelectedRegistryType(type.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{type.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {type.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

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

            return (
              <div
                key={reg.id}
                className="border rounded-2xl p-4 sm:p-5 transition-all space-y-3.5 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 border-slate-200 dark:border-slate-800"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${typeBadgeColor}`}>
                        {reg.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {reg.authority}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        {reg.importanceForZOP}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                      {reg.shortTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {reg.title}
                    </p>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0 no-print">
                    <button
                      onClick={() => handleOpenEditModal(reg)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Upravit metadata nebo text předpisu"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteRegulation(reg.id, reg.code)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Smazat nebo resetovat na výchozí znění"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scope & Summary */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {reg.scope}
                </p>

                {/* Key Provisions Bullet List */}
                {reg.keyProvisions && reg.keyProvisions.length > 0 && (
                  <div className="bg-white dark:bg-slate-900/80 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Klíčová ustanovení k zapamatování (ZOP A):</span>
                    </div>
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
                  <button
                    onClick={() => {
                      setActiveModalRegulation(reg);
                      setModalSearchQuery('');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-xs hover:shadow active:scale-95"
                  >
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span>📜 Číst celé znění v okně</span>
                  </button>

                  {reg.officialUrl && (
                    <a
                      href={reg.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                      title="Otevřít oficiální znění na státním portálu e-Sbírka (e-sbirka.gov.cz)"
                    >
                      <span>e-Sbírka.gov.cz</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    </a>
                  )}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {reg.tags.map(t => (
                    <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Hledat paragraf, pojem, zákon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories Pill Slider */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categoriesList.map(cat => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
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
              <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
              <p>Nebyly nalezeny žádné právní normy odpovídající filtru.</p>
            </div>
          ) : (
            filteredArticles.map(art => {
              const isSelected = art.id === currentArticle?.id;
              const isFav = savedFavorites.includes(art.id);
              return (
                <div
                  key={art.id}
                  onClick={() => handleSelectArticle(art.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {art.actNumber}
                      </span>
                      <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                        {art.section}
                      </span>
                      {isFav && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {art.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {art.explanation}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`} />
                </div>
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
        } flex-1 min-h-0 flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-[100dvh] md:h-auto max-h-[100dvh] md:max-h-none`}
      >
        {currentArticle ? (
          <>
            {/* Mobile Back Button */}
            <div className="md:hidden flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 no-print">
              <button
                onClick={() => setMobileDetailOpen(false)}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer min-h-[44px] min-w-[44px] px-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Zpět na přehled předpisů</span>
              </button>
              <div className="text-xs font-semibold text-slate-400">
                {currentArticle.actNumber}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] p-3 sm:p-6 md:p-8 space-y-6">

              {/* Print Header */}
              <PrintHeader
                subject={`Právní kompas VS ČR – ${currentArticle.actTitle}`}
                docTitle={`${currentArticle.section} – ${currentArticle.title} (${currentArticle.actNumber})`}
                subtext="Aplikační metodika a zkušební chytáky pro příslušníky VS ČR"
              />

              {/* Header: Title, Tags, Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {currentArticle.section}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 line-clamp-1">
                      {currentArticle.actTitle} ({currentArticle.actNumber})
                    </span>
                  </div>
                  <h1 className="text-base sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {currentArticle.title}
                  </h1>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 no-print">
                  <button
                    onClick={() => window.print()}
                    className="min-h-[44px] px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
                    title="Vytisknout text normy s výkladem a chytáky nebo uložit do PDF"
                  >
                    <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="hidden sm:inline">Tisk / PDF</span>
                  </button>

                  <button
                    onClick={() => toggleFavorite(currentArticle.id)}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                      savedFavorites.includes(currentArticle.id)
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title={savedFavorites.includes(currentArticle.id) ? 'Odebrat z oblíbených' : 'Uložit do oblíbených'}
                  >
                    <Star className={`w-4 h-4 ${savedFavorites.includes(currentArticle.id) ? 'fill-amber-500' : ''}`} />
                  </button>

                  {isSpeechSupported() && (
                    <button
                      onClick={() => handleSpeak(`${currentArticle.section}. ${currentArticle.title}. ${currentArticle.exactText}. Aplikační výklad: ${currentArticle.explanation}`)}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                        isSpeaking
                          ? 'bg-blue-600 border-blue-600 text-white animate-pulse'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={isSpeaking ? 'Zastavit předčítání' : 'Přečíst normu nahlas (TTS)'}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(`${currentArticle.section} – ${currentArticle.title}\n\n${currentArticle.exactText}\n\nVýklad:\n${currentArticle.explanation}`, currentArticle.id)}
                    className="min-h-[44px] px-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    {copiedId === currentArticle.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                        <span className="hidden sm:inline">Zkopírováno</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Kopírovat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Block 1: Exact Legal Text */}
              <div className="space-y-2 print-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Doslovné znění zákona
                  </span>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed shadow-inner whitespace-pre-wrap select-text print:bg-white print:border-none print:p-0">
                  {currentArticle.exactText}
                </div>
              </div>

              {/* Block 2: Methodological Explanation */}
              <div className="space-y-2 print-card">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Aplikační a metodický výklad pro praxi VS ČR
                </span>
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 print:bg-white print:border-none print:p-0">
                  <p>{currentArticle.explanation}</p>
                </div>
              </div>

              {/* Block 3: Exam Traps & Key Takeaways */}
              <div className="space-y-2 print-card">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Zkušební chytáky u zkoušek ZOP &amp; Důležité body
                </span>
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed print:bg-white print:border-none print:p-0">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 print:hidden">
                      💡
                    </div>
                    <div>{currentArticle.examTips}</div>
                  </div>
                </div>
              </div>

              {/* Desktop Stepper (Prev / Next) */}
              <div className="hidden md:flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 no-print">
                <button
                  disabled={currentIndex <= 0}
                  onClick={goToPrev}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Předchozí norma ({currentIndex > 0 ? filteredArticles[currentIndex - 1].section : ''})</span>
                </button>

                <div className="text-xs text-slate-400 font-semibold">
                  Norma {currentIndex + 1} z {filteredArticles.length}
                </div>

                <button
                  disabled={currentIndex >= filteredArticles.length - 1}
                  onClick={goToNext}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <span>Další norma ({currentIndex < filteredArticles.length - 1 ? filteredArticles[currentIndex + 1].section : ''})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>{/* end scrollable body */}

            {/* Mobile Stepper Footer */}
            <div className="md:hidden flex items-center justify-between gap-2 px-3 py-2 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <button
                disabled={currentIndex <= 0}
                onClick={goToPrev}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Předchozí</span>
              </button>
              <div className="text-[10px] text-slate-400 font-semibold whitespace-nowrap px-1">
                {currentIndex + 1} / {filteredArticles.length}
              </div>
              <button
                disabled={currentIndex >= filteredArticles.length - 1}
                onClick={goToNext}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <span>Další</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center space-y-3">
            <Scale className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p>Vyberte zákonnou normu ze seznamu pro zobrazení přesného textu a metodického výkladu.</p>
          </div>
        )}
      </section>
    </div>
  );
}
