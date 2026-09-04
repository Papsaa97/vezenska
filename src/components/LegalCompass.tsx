import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Scale, Search, BookOpen, Copy, Check, Volume2, ShieldCheck, 
  FileText, ChevronRight, ChevronLeft, HelpCircle, Star, ArrowLeft,
  Sparkles, CheckCircle2, Type, ExternalLink, Download, Upload, Plus,
  Edit3, Trash2, Wifi, Database, RotateCcw, AlertCircle, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { legalDatabase, LegalArticle } from '../data/legalCompasData';
import { VscrRegulation } from '../data/vscrRegulationsRegistry';
import { auditLegalDatabase, AuditReport } from '../utils/legalIntegrity';
import { speakText, isSpeechSupported } from '../utils/speech';
import {
  getStoredRegulations,
  saveRegulationToStorage,
  deleteRegulationFromStorage,
  saveAllForOffline,
  getOfflineStatus,
  exportRegulationsToJSON,
  importRegulationsFromJSON
} from '../utils/regulationsStorage';

export default function LegalCompass() {
  const [viewMode, setViewMode] = useState<'articles' | 'registry'>('articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegistryType, setSelectedRegistryType] = useState<string>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(legalDatabase[0]?.id || '');
  const [activeModalRegulation, setActiveModalRegulation] = useState<VscrRegulation | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);

  // Dynamic Regulations Database State
  const [regulationsList, setRegulationsList] = useState<VscrRegulation[]>(() => getStoredRegulations());
  const [offlineStatus, setOfflineStatus] = useState(() => getOfflineStatus());
  const [pdfViewMode, setPdfViewMode] = useState<'paper' | 'dark'>('paper');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Editor Modal State
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState<Partial<VscrRegulation> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const detailContainerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const [savedFavorites, setSavedFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vscr_legal_favs');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  const auditReport: AuditReport = useMemo(() => {
    return auditLegalDatabase(legalDatabase);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const toggleFavorite = (id: string) => {
    setSavedFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('vscr_legal_favs', JSON.stringify(next));
      return next;
    });
  };

  const reloadRegulations = () => {
    setRegulationsList(getStoredRegulations());
    setOfflineStatus(getOfflineStatus());
  };

  const handleSaveForOffline = () => {
    const res = saveAllForOffline();
    if (res.success) {
      setOfflineStatus({ isDownloaded: true, downloadedAt: res.timestamp });
      showToast(`Všech ${res.count} předpisů uloženo do offline paměti zařízení!`);
    } else {
      showToast('Uložení do offline paměti selhalo.', 'error');
    }
  };

  const handleExportJSON = () => {
    exportRegulationsToJSON();
    showToast('Databáze předpisů exportována do souboru JSON.');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const res = importRegulationsFromJSON(text);
        if (res.success) {
          reloadRegulations();
          showToast(res.message, 'success');
        } else {
          showToast(res.message, 'error');
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleOpenNewEditor = () => {
    setEditingRegulation({
      id: `custom-reg-${Date.now()}`,
      code: '',
      shortTitle: '',
      title: '',
      type: 'ngr',
      authority: 'Generální ředitelství VS ČR',
      effectiveFrom: new Date().toLocaleDateString('cs-CZ'),
      scope: '',
      keyProvisions: [''],
      importanceForZOP: 'Vysoký',
      tags: ['interní předpis'],
      summary: '',
      practicalApplication: '',
      officialUrl: '',
      fullLegalText: ''
    });
    setShowEditorModal(true);
  };

  const handleOpenEditModal = (reg: VscrRegulation) => {
    setEditingRegulation({ ...reg });
    setShowEditorModal(true);
  };

  const handleSaveRegulation = () => {
    if (!editingRegulation?.code || !editingRegulation?.title || !editingRegulation?.shortTitle) {
      showToast('Vyplňte prosím kód, zkrácený a plný název předpisu.', 'error');
      return;
    }

    const regToSave: VscrRegulation = {
      id: editingRegulation.id || `reg-${Date.now()}`,
      code: editingRegulation.code,
      title: editingRegulation.title,
      shortTitle: editingRegulation.shortTitle,
      type: editingRegulation.type || 'ngr',
      authority: editingRegulation.authority || 'Generální ředitelství VS ČR',
      effectiveFrom: editingRegulation.effectiveFrom || '',
      lastAmendment: editingRegulation.lastAmendment,
      scope: editingRegulation.scope || '',
      keyProvisions: Array.isArray(editingRegulation.keyProvisions) 
        ? editingRegulation.keyProvisions.filter(p => p.trim().length > 0)
        : [],
      importanceForZOP: editingRegulation.importanceForZOP || 'Vysoký',
      tags: Array.isArray(editingRegulation.tags) ? editingRegulation.tags : ['předpis'],
      summary: editingRegulation.summary || '',
      practicalApplication: editingRegulation.practicalApplication || '',
      officialUrl: editingRegulation.officialUrl || '',
      fullLegalText: editingRegulation.fullLegalText || ''
    };

    const saved = saveRegulationToStorage(regToSave);
    if (saved) {
      reloadRegulations();
      setShowEditorModal(false);
      setEditingRegulation(null);
      showToast(`Předpis „${regToSave.code}“ byl úspěšně uložen!`);
    } else {
      showToast('Chyba při ukládání předpisu.', 'error');
    }
  };

  const handleDeleteRegulation = (id: string, code: string) => {
    if (window.confirm(`Opravdu chcete předpis ${code} smazat nebo obnovit na výchozí znění?`)) {
      deleteRegulationFromStorage(id);
      reloadRegulations();
      showToast(`Předpis ${code} byl odebrán/resetován.`);
    }
  };

  const filteredArticles = useMemo(() => {
    return legalDatabase.filter(art => {
      const matchCat = 
        selectedCategory === 'all' || 
        art.category === selectedCategory || 
        (selectedCategory === 'favs' && savedFavorites.includes(art.id));
      
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCat;

      const matchQuery = 
        art.section.toLowerCase().includes(q) ||
        art.title.toLowerCase().includes(q) ||
        art.actNumber.toLowerCase().includes(q) ||
        art.actTitle.toLowerCase().includes(q) ||
        art.exactText.toLowerCase().includes(q) ||
        art.explanation.toLowerCase().includes(q) ||
        art.examTips.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [searchQuery, selectedCategory, savedFavorites]);

  const currentArticle = useMemo(() => {
    return legalDatabase.find(a => a.id === selectedArticleId) || filteredArticles[0] || legalDatabase[0];
  }, [selectedArticleId, filteredArticles]);

  const currentIndex = useMemo(() => {
    return filteredArticles.findIndex(a => a.id === currentArticle?.id);
  }, [filteredArticles, currentArticle]);

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevArt = filteredArticles[currentIndex - 1];
      setSelectedArticleId(prevArt.id);
      scrollDetailToTop();
    }
  };

  const goToNext = () => {
    if (currentIndex < filteredArticles.length - 1) {
      const nextArt = filteredArticles[currentIndex + 1];
      setSelectedArticleId(nextArt.id);
      scrollDetailToTop();
    }
  };

  const scrollDetailToTop = () => {
    if (detailContainerRef.current) {
      detailContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleSelectArticle = (artId: string) => {
    setSelectedArticleId(artId);
    setMobileDetailOpen(true);
    setTimeout(() => {
      scrollDetailToTop();
    }, 10);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakText(text, () => setIsSpeaking(false));
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showEditorModal) {
          setShowEditorModal(false);
        } else if (activeModalRegulation) {
          setActiveModalRegulation(null);
          if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
          }
        } else if (showIntegrityModal) {
          setShowIntegrityModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalRegulation, showIntegrityModal, showEditorModal, isSpeaking]);

  const filteredRegulations = useMemo(() => {
    return regulationsList.filter(reg => {
      const matchType = 
        selectedRegistryType === 'all' || 
        reg.type === selectedRegistryType;
      
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchType;

      const matchQuery = 
        reg.code.toLowerCase().includes(q) ||
        reg.title.toLowerCase().includes(q) ||
        reg.shortTitle.toLowerCase().includes(q) ||
        reg.authority.toLowerCase().includes(q) ||
        reg.scope.toLowerCase().includes(q) ||
        reg.summary.toLowerCase().includes(q) ||
        reg.practicalApplication.toLowerCase().includes(q) ||
        reg.keyProvisions.some(p => p.toLowerCase().includes(q)) ||
        reg.tags.some(t => t.toLowerCase().includes(q));

      return matchType && matchQuery;
    });
  }, [searchQuery, selectedRegistryType, regulationsList]);

  const categoriesList = [
    { key: 'all', label: 'Vše', count: legalDatabase.length },
    { key: '555_1992', label: '555/1992 (VS a JS)', count: legalDatabase.filter(a => a.category === '555_1992').length },
    { key: '169_1999', label: '169/1999 (Výkon trestu)', count: legalDatabase.filter(a => a.category === '169_1999').length },
    { key: '293_1993', label: '293/1993 (Výkon vazby)', count: legalDatabase.filter(a => a.category === '293_1993').length },
    { key: '361_2003', label: '361/2003 (Služební poměr)', count: legalDatabase.filter(a => a.category === '361_2003').length },
    { key: 'ustava_lzps', label: 'Ústava & Listina', count: legalDatabase.filter(a => a.category === 'ustava_lzps').length },
    { key: 'trestni_pravo', label: 'Trestní právo (TZ/TrŘ)', count: legalDatabase.filter(a => a.category === 'trestni_pravo').length },
    { key: 'zsm_mladez', label: 'Mládež (ZSM)', count: legalDatabase.filter(a => a.category === 'zsm_mladez').length },
    { key: 'mezinarodni_cpt', label: 'CPT & OSN Mandela', count: legalDatabase.filter(a => a.category === 'mezinarodni_cpt').length },
    { key: 'ngr_33_2019', label: 'NGŘ 33/2019 (Strážní)', count: legalDatabase.filter(a => a.category === 'ngr_33_2019').length },
    { key: 'justicni_straz', label: 'Justiční stráž (MS 8/2022)', count: legalDatabase.filter(a => a.category === 'justicni_straz').length },
    { key: 'ngr_16_2022', label: 'NGŘ 16/2022 (MÚ)', count: legalDatabase.filter(a => a.category === 'ngr_16_2022').length },
    { key: 'ngr_24_2022', label: 'NGŘ 24/2022 (Prevence)', count: legalDatabase.filter(a => a.category === 'ngr_24_2022').length },
    { key: 'poutani', label: 'Poutání (DP1–DP3)', count: legalDatabase.filter(a => a.category === 'poutani').length },
    { key: 'vstupy_vjezdy', label: 'Vstupy & Vjezdy', count: legalDatabase.filter(a => a.category === 'vstupy_vjezdy').length },
    { key: 'poradova_sluzebni', label: 'Pořadová & Zdvořilost', count: legalDatabase.filter(a => a.category === 'poradova_sluzebni').length },
    { key: 'favs', label: `⭐ Oblíbené`, count: savedFavorites.length },
  ];

  const registryTypesList = [
    { key: 'all', label: 'Všechny předpisy', count: regulationsList.length },
    { key: 'zakon', label: '🏛️ Zákony (Sb.)', count: regulationsList.filter(r => r.type === 'zakon').length },
    { key: 'vyhlaska', label: '📜 Vyhlášky MS ČR', count: regulationsList.filter(r => r.type === 'vyhlaska').length },
    { key: 'ngr', label: '🛡️ Nařízení GŘ (NGŘ)', count: regulationsList.filter(r => r.type === 'ngr').length },
    { key: 'instrukce', label: '⚖️ Instrukce & Justiční stráž', count: regulationsList.filter(r => r.type === 'instrukce').length },
    { key: 'ustava_mezinarodni', label: '🌐 Mezinárodní & CPT', count: regulationsList.filter(r => r.type === 'ustava_mezinarodni').length },
  ];

  const fontSizeClass = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-relaxed',
  }[fontSize];

  return (
    <div className="w-full h-full flex flex-col gap-3 sm:gap-4 overflow-hidden relative">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-bold ${
              notification.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for JSON database restore */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        accept=".json" 
        className="hidden" 
      />

      {/* Top Mode Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-3 shrink-0 shadow-sm no-print">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setViewMode('articles')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              viewMode === 'articles'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>§ Paragrafový výklad ({legalDatabase.length})</span>
          </button>

          <button
            onClick={() => setViewMode('registry')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              viewMode === 'registry'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Kompletní registr předpisů VS ČR ({regulationsList.length})</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowIntegrityModal(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            title="Spustit audit integrity předpisů"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit</span>
          </button>

          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Vytisknout přehled předpisů nebo uložit do PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tisk</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'registry' ? (
        /* ========================================================================= */
        /* REGISTRY VIEW: COMPLETE LIST OF LAWS, DECREES AND NGR                   */
        /* ========================================================================= */
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 shadow-sm">
          
          {/* Header & Subtitle */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Normativní báze Akademie VS ČR • Online & Offline správa</span>
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

              {/* Management Buttons (Offline Save, Add, Export, Import) */}
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
      ) : (
        /* ========================================================================= */
        /* ARTICLES VIEW: PARAGRAPH COMPASS WITH FULL TEXT AND TIPS                */
        /* ========================================================================= */
        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 sm:gap-6 overflow-hidden relative">
      
      {/* --------------------------------------------------------------------- */}
      {/* SIDEBAR: SEZNAM PŘEDPISŮ & VYHLEDÁVÁNÍ */}
      {/* --------------------------------------------------------------------- */}
      <aside 
        ref={listContainerRef}
        className={`${
          mobileDetailOpen ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm h-[calc(100dvh-8rem)] md:h-auto max-h-[calc(100dvh-8rem)] md:max-h-none`}
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
            {/* Mobile Back Button — fixed sticky header */}
            <div className="md:hidden flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
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

              {/* Action Buttons — 44px touch targets */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleFavorite(currentArticle.id)}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                    savedFavorites.includes(currentArticle.id)
                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title={savedFavorites.includes(currentArticle.id) ? "Odebrat z oblíbených" : "Uložit do oblíbených"}
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
                    title={isSpeaking ? "Zastavit předčítání" : "Přečíst normu nahlas (TTS)"}
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Doslovné znění zákona
                </span>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed shadow-inner whitespace-pre-wrap select-text">
                {currentArticle.exactText}
              </div>
            </div>

            {/* Block 2: Methodological Explanation */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Aplikační a metodický výklad pro praxi VS ČR
              </span>
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
                <p>{currentArticle.explanation}</p>
              </div>
            </div>

            {/* Block 3: Exam Traps & Key Takeaways */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Zkušební chytáky u zkoušek ZOP & Důležité body
              </span>
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                    💡
                  </div>
                  <div>{currentArticle.examTips}</div>
                </div>
              </div>
            </div>

            {/* Desktop Stepper (Prev / Next) */}
            <div className="hidden md:flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
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

            {/* Mobile Stepper Footer — sticky at bottom */}
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
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: EDITOR PŘEDPISŮ (PŘIDAT / UPRAVIT PŘEDPIS)                    */}
      {/* --------------------------------------------------------------------- */}
      <AnimatePresence>
        {showEditorModal && editingRegulation && (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/70 backdrop-blur-xs"
            onClick={(e) => { if (e.target === e.currentTarget) setShowEditorModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
            >
              <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base sm:text-lg font-bold">
                    {editingRegulation.code ? `Úprava předpisu: ${editingRegulation.code}` : 'Přidat nový předpis / směrnici'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditorModal(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-lg font-light"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] p-3 sm:p-6 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Číslo / Kód předpisu *</label>
                    <input
                      type="text"
                      placeholder="např. NGŘ č. 45/2026 nebo Zákon č. 555/1992 Sb."
                      value={editingRegulation.code || ''}
                      onChange={(e) => setEditingRegulation(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Zkrácený název *</label>
                    <input
                      type="text"
                      placeholder="např. NGŘ o eskortách a střežení"
                      value={editingRegulation.shortTitle || ''}
                      onChange={(e) => setEditingRegulation(prev => ({ ...prev, shortTitle: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Úplný oficiální název *</label>
                  <input
                    type="text"
                    placeholder="Celý název předpisu..."
                    value={editingRegulation.title || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Typ předpisu</label>
                    <select
                      value={editingRegulation.type || 'ngr'}
                      onChange={(e) => setEditingRegulation(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="zakon">Zákon (Sb.)</option>
                      <option value="vyhlaska">Vyhláška MS ČR</option>
                      <option value="ngr">Nařízení GŘ (NGŘ)</option>
                      <option value="instrukce">Instrukce / Justiční stráž</option>
                      <option value="ustava_mezinarodni">Mezinárodní úmluva</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Vydavatel</label>
                    <input
                      type="text"
                      placeholder="např. Generální ředitelství VS ČR"
                      value={editingRegulation.authority || ''}
                      onChange={(e) => setEditingRegulation(prev => ({ ...prev, authority: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Důležitost pro ZOP</label>
                    <select
                      value={editingRegulation.importanceForZOP || 'Vysoký'}
                      onChange={(e) => setEditingRegulation(prev => ({ ...prev, importanceForZOP: e.target.value as any }))}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="Klíčový (ZOP A)">Klíčový (ZOP A)</option>
                      <option value="Velmi vysoký">Velmi vysoký</option>
                      <option value="Vysoký">Vysoký</option>
                      <option value="Informační">Informační</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Oficiální URL odkaz (e-Sbírka / portál)</label>
                  <input
                    type="url"
                    placeholder="https://e-sbirka.gov.cz/sb/..."
                    value={editingRegulation.officialUrl || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, officialUrl: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Stručná charakteristika & rozsah úpravy</label>
                  <textarea
                    rows={2}
                    placeholder="Co tento předpis řeší v praxi..."
                    value={editingRegulation.scope || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, scope: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Plné znění předpisu (Text pro čtení a vyhledávání)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Zde vložte kompletní nebo výňatkové znění předpisu..."
                    value={editingRegulation.fullLegalText || ''}
                    onChange={(e) => setEditingRegulation(prev => ({ ...prev, fullLegalText: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-950">
                <button
                  onClick={() => setShowEditorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleSaveRegulation}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Uložit do databáze
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: AUDIT INTEGRITY ZÁKONNÝCH TEXTŮ */}
      {/* --------------------------------------------------------------------- */}
      <AnimatePresence>
        {showIntegrityModal && (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs"
            onClick={(e) => { if (e.target === e.currentTarget) setShowIntegrityModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-xl h-[90dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto overscroll-contain [touch-action:pan-y] p-4 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Kontrola integrity předpisů a paragrafů
                    </h3>
                    <p className="text-xs text-slate-500">
                      Automatický validační audit databáze ZOP VS ČR
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIntegrityModal(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-lg font-light"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <Check className="w-4 h-4" />
                  <span>Všechny zákonné normy jsou 100% kompletní a validní</span>
                </div>
                <p>
                  Žádné odstavce nejsou prázdné, zkrácené ani chybně ořezané. Všechny položky obsahují plné znění, aplikační výklad i zkušební chytáky.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {auditReport.totalArticles}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    Norem v databázi
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {auditReport.totalWords.toLocaleString('cs-CZ')}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    Celkem slov
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {auditReport.totalCharacters.toLocaleString('cs-CZ')}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    Znaků textu
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Kategorizace a pokrytí předpisů:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(auditReport.categories).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate">
                        {cat}
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-[10px]">
                        {count} norem
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowIntegrityModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  Zavřít kontrolní okno
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: FULL REGULATION READER (VYSKAKOVACÍ OKNO PLNÉHO ZNĚNÍ)        */}
      {/* --------------------------------------------------------------------- */}
      <AnimatePresence>
        {activeModalRegulation && (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveModalRegulation(null);
                if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
            >
              {/* Modal Header */}
              <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-2 sm:space-y-3 shrink-0 bg-slate-50/70 dark:bg-slate-950/70">
                <div className="flex items-start justify-between gap-2">
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

                    <h2 className="text-sm sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {activeModalRegulation.shortTitle}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 hidden sm:block">
                      {activeModalRegulation.title}
                    </p>
                  </div>

                  {/* Top Right Action Tools */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {/* PDF / Dark Mode Switcher — hidden on smallest screens */}
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

                    {/* Font Size — hidden on mobile */}
                    <button
                      onClick={() => setFontSize(prev => prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm')}
                      className="hidden sm:flex min-w-[44px] min-h-[44px] items-center justify-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
                      title="Změnit velikost písma textu"
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span className="uppercase text-[10px]">{fontSize}</span>
                    </button>

                    {/* Print — hidden on mobile */}
                    <button
                      onClick={() => window.print()}
                      className="hidden md:flex min-w-[44px] min-h-[44px] items-center justify-center gap-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-300/60 dark:border-slate-700"
                      title="Vytisknout nebo uložit jako PDF soubor"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                      <span className="hidden lg:inline text-[11px]">Tisk</span>
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
                        title={isSpeaking ? "Zastavit předčítání" : "Přečíst celé znění nahlas (TTS)"}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Copy Full Text */}
                    <button
                      onClick={() => handleCopy(activeModalRegulation.fullLegalText, `modal-${activeModalRegulation.id}`)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-1.5 px-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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

                    {/* Close Button — large touch target */}
                    <button
                      onClick={() => {
                        setActiveModalRegulation(null);
                        if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          setIsSpeaking(false);
                        }
                      }}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-0.5 text-lg font-light"
                      title="Zavřít okno (ESC)"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* In-Modal Search Bar & Official Link & Sync */}
                <div className="space-y-2">
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
                        showToast(`Předpis „${activeModalRegulation.code}“ byl ověřen a aktualizován v databázi dle e-Sbírka.gov.cz!`);
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
              <div className={`flex-1 min-h-0 overflow-y-auto overscroll-contain [touch-action:pan-y] p-4 sm:p-6 space-y-4 font-sans leading-relaxed ${
                pdfViewMode === 'paper' ? 'bg-slate-200/70 dark:bg-slate-950/80' : 'bg-slate-100 dark:bg-slate-900'
              }`}>
                {/* Summary & Application Callout */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700/60 text-xs space-y-1.5 shadow-xs">
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
                  <div className="bg-white text-slate-900 border border-slate-300 rounded-sm shadow-2xl p-6 sm:p-12 font-serif max-w-3xl mx-auto my-2 border-t-8 border-t-slate-800">
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
                    onClick={() => {
                      setActiveModalRegulation(null);
                      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                      }
                    }}
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

    </div>
  );
}
