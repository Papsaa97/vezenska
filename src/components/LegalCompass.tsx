import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Scale, Search, BookOpen, ShieldCheck, 
  FileText, CheckCircle2,
  Download, Upload,
  Edit3, Wifi, Database, AlertCircle, Printer
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
import LegalEditorModal from './legal-compass/LegalEditorModal';
import LegalAuditModal from './legal-compass/LegalAuditModal';
import LegalReaderModal from './legal-compass/LegalReaderModal';
import LegalRegistryView from './legal-compass/LegalRegistryView';

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
      showToast(`Předpis „${regToSave.code}" byl úspěšně uložen!`);
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
      <LegalRegistryView
        viewMode={viewMode}
        filteredArticles={filteredArticles}
        currentArticle={currentArticle}
        currentIndex={currentIndex}
        mobileDetailOpen={mobileDetailOpen}
        setMobileDetailOpen={setMobileDetailOpen}
        savedFavorites={savedFavorites}
        copiedId={copiedId}
        isSpeaking={isSpeaking}
        categoriesList={categoriesList}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSelectArticle={handleSelectArticle}
        toggleFavorite={toggleFavorite}
        handleCopy={handleCopy}
        handleSpeak={handleSpeak}
        goToPrev={goToPrev}
        goToNext={goToNext}
        detailContainerRef={detailContainerRef}
        listContainerRef={listContainerRef}
        filteredRegulations={filteredRegulations}
        offlineStatus={offlineStatus}
        registryTypesList={registryTypesList}
        selectedRegistryType={selectedRegistryType}
        setSelectedRegistryType={setSelectedRegistryType}
        regulationsList={regulationsList}
        handleSaveForOffline={handleSaveForOffline}
        handleOpenNewEditor={handleOpenNewEditor}
        handleExportJSON={handleExportJSON}
        handleOpenEditModal={handleOpenEditModal}
        handleDeleteRegulation={handleDeleteRegulation}
        setActiveModalRegulation={setActiveModalRegulation}
        setModalSearchQuery={setModalSearchQuery}
        fileInputRef={fileInputRef}
      />

      {/* Modal: Editor předpisů */}
      <LegalEditorModal
        showEditorModal={showEditorModal}
        editingRegulation={editingRegulation}
        setShowEditorModal={setShowEditorModal}
        setEditingRegulation={setEditingRegulation}
        handleSaveRegulation={handleSaveRegulation}
      />

      {/* Modal: Audit integrity */}
      <LegalAuditModal
        showIntegrityModal={showIntegrityModal}
        setShowIntegrityModal={setShowIntegrityModal}
        auditReport={auditReport}
      />

      {/* Modal: Full regulation reader */}
      <LegalReaderModal
        activeModalRegulation={activeModalRegulation}
        setActiveModalRegulation={setActiveModalRegulation}
        isSpeaking={isSpeaking}
        setIsSpeaking={setIsSpeaking}
        pdfViewMode={pdfViewMode}
        setPdfViewMode={setPdfViewMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        modalSearchQuery={modalSearchQuery}
        setModalSearchQuery={setModalSearchQuery}
        copiedId={copiedId}
        handleCopy={handleCopy}
        handleSpeak={handleSpeak}
        handleOpenEditModal={handleOpenEditModal}
        showToast={showToast}
        reloadRegulations={reloadRegulations}
      />

    </div>
  );
}
