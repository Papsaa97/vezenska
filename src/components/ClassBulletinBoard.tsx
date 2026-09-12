import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Printer,
  X,
  AlertCircle,
  Loader2,
  UploadCloud,
  FileText,
  CheckCircle2,
  RefreshCw,
  Search,
  School,
  ExternalLink,
  Shield,
  Shirt,
  Building2,
  Users,
  Eye,
  EyeOff,
  Bell,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookOpen,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Radio,
  MapPin,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  ClassBoardItem,
  ClassBoardInput,
  DutyRosterItem,
  UniformGuidance,
  DayUniformItem,
  LinkedMaterialItem,
  ClassSection,
  GlobalAnnouncement,
  DutyType,
  CourseCountdownInfo,
  getCourseCountdown,
  fetchClassBoards,
  saveClassBoard,
  deleteClassBoard,
  uploadScheduleImage,
  fetchGlobalAnnouncements,
  saveGlobalAnnouncement,
  deleteGlobalAnnouncement,
  getMyClass,
  setMyClass,
  getHiddenClassIds,
  toggleHideClass,
  normalizeUniformDays,
  getTodayCzechName,
  getUpcomingUniformInfo,
} from '../utils/classBoardService';
import PrintHeader from './common/PrintHeader';

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClassBulletinBoard() {
  const { profile, user, updateProfile } = useAuth();
  const isPrivileged = profile?.role === 'lektor' || profile?.role === 'admin';

  // Data
  const [classes, setClasses] = useState<ClassBoardItem[]>([]);
  const [globalAnnouncements, setGlobalAnnouncements] = useState<GlobalAnnouncement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Preference zobrazení
  const [selectedMyClass, setSelectedMyClassState] = useState<string>(getMyClass);
  const [hiddenClassIds, setHiddenClassIds] = useState<string[]>(getHiddenClassIds);
  const [viewMode, setViewMode] = useState<'expanded' | 'grid'>('expanded');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState<boolean>(false);
  const classDropdownRef = useRef<HTMLDivElement>(null);

  // Modál pro novou / editovanou třídu
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ClassBoardItem | null>(null);

  // Modál pro ústrojovou kázeň (pro velitele třídy i lektory)
  const [uniformModalItem, setUniformModalItem] = useState<ClassBoardItem | null>(null);

  // Modál pro novou službu (Pankrác / Recepce / Střelby)
  const [dutyModalItem, setDutyModalItem] = useState<ClassBoardItem | null>(null);

  // Modál pro novou modulární sekci
  const [sectionModalItem, setSectionModalItem] = useState<ClassBoardItem | null>(null);

  // Modál pro celoškolní hlášení
  const [isGlobalAnnouncementModalOpen, setIsGlobalAnnouncementModalOpen] = useState<boolean>(false);
  const [editingGlobalAnnouncement, setEditingGlobalAnnouncement] = useState<GlobalAnnouncement | null>(null);

  // Potvrzení smazání
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ClassBoardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Lightbox pro rozvrh
  const [lightboxItem, setLightboxItem] = useState<ClassBoardItem | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  // Tisk
  const [printingItem, setPrintingItem] = useState<ClassBoardItem | null>(null);

  // Načtení dat
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [classData, announcementData] = await Promise.all([
        fetchClassBoards(),
        fetchGlobalAnnouncements(),
      ]);
      setClasses(classData);
      setGlobalAnnouncements(announcementData);
    } catch (err) {
      console.error('[ClassBulletinBoard] Chyba při načítání dat:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronizace Moje třída s profilem
  useEffect(() => {
    if (profile?.user_class && profile.user_class !== selectedMyClass) {
      setSelectedMyClassState(profile.user_class);
      setMyClass(profile.user_class);
    }
  }, [profile?.user_class, selectedMyClass]);

  // Výběr třídy uživatele
  const handleSelectMyClass = (className: string) => {
    setSelectedMyClassState(className);
    setMyClass(className);
    setIsClassDropdownOpen(false);
    if (user) {
      updateProfile({ userClass: className });
    }
  };

  // Skrývání / zobrazování třídy
  const handleToggleHideClass = (classId: string) => {
    const updated = toggleHideClass(classId);
    setHiddenClassIds(updated);
  };

  // Click outside listener pro dropdown výběru třídy
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target as Node)) {
        setIsClassDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrované třídy pro mřížku
  const filteredClasses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return classes.filter((c) => {
      const matchesSearch =
        !q ||
        c.className.toLowerCase().includes(q) ||
        c.infoText.toLowerCase().includes(q) ||
        c.dutyRoster?.some((d) => d.title.toLowerCase().includes(q) || d.attendees?.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [classes, searchQuery]);

  // Nalezení objektu "Moje třída"
  const myClassItem = useMemo(() => {
    return (
      classes.find((c) => c.className.toLowerCase() === selectedMyClass.toLowerCase()) ||
      classes[0] ||
      null
    );
  }, [classes, selectedMyClass]);

  // Kontrola, zda uživatel velí dané třídě
  const checkCanManageClass = useCallback(
    (item: ClassBoardItem) => {
      if (isPrivileged) return true;
      if (profile?.role === 'velitel_tridy') {
        const myCls = (profile.user_class || selectedMyClass).toLowerCase();
        return item.className.toLowerCase() === myCls;
      }
      return false;
    },
    [isPrivileged, profile, selectedMyClass]
  );

  // Formátování dnešního data v češtině
  const todayFormatted = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const formatUpdateTime = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Uložení třídy
  const handleSaveItem = async (input: ClassBoardInput) => {
    try {
      const saved = await saveClassBoard(input, user?.email);
      setClasses((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('[ClassBulletinBoard] Uložení třídy selhalo:', err);
      throw err;
    }
  };

  // Smazání třídy
  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);
    try {
      await deleteClassBoard(deleteConfirmItem.id);
      setClasses((prev) => prev.filter((c) => c.id !== deleteConfirmItem.id));
      setDeleteConfirmItem(null);
    } catch (err) {
      console.error('[ClassBulletinBoard] Smazání třídy selhalo:', err);
      alert('Smazání se nezdařilo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Uložení ústrojové kázně
  const handleSaveUniform = async (classItem: ClassBoardItem, guidance: UniformGuidance) => {
    const updated: ClassBoardItem = {
      ...classItem,
      uniformGuidance: guidance,
      updatedAt: new Date().toISOString(),
    };
    await saveClassBoard(updated, user?.email);
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setUniformModalItem(null);
  };

  // Uložení nové / upravené služby (Pankrác, Recepce...)
  const handleSaveDuty = async (classItem: ClassBoardItem, duty: DutyRosterItem) => {
    const existing = classItem.dutyRoster ?? [];
    const idx = existing.findIndex((d) => d.id === duty.id);
    let nextDuties: DutyRosterItem[];
    if (idx !== -1) {
      nextDuties = [...existing];
      nextDuties[idx] = duty;
    } else {
      nextDuties = [duty, ...existing];
    }

    const updated: ClassBoardItem = {
      ...classItem,
      dutyRoster: nextDuties,
      updatedAt: new Date().toISOString(),
    };
    await saveClassBoard(updated, user?.email);
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setDutyModalItem(null);
  };

  const handleDeleteDuty = async (classItem: ClassBoardItem, dutyId: string) => {
    const nextDuties = (classItem.dutyRoster ?? []).filter((d) => d.id !== dutyId);
    const updated: ClassBoardItem = {
      ...classItem,
      dutyRoster: nextDuties,
      updatedAt: new Date().toISOString(),
    };
    await saveClassBoard(updated, user?.email);
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Uložení modulární sekce
  const handleSaveSection = async (classItem: ClassBoardItem, section: ClassSection) => {
    const existing = classItem.sections ?? [];
    const idx = existing.findIndex((s) => s.id === section.id);
    let nextSections: ClassSection[];
    if (idx !== -1) {
      nextSections = [...existing];
      nextSections[idx] = section;
    } else {
      nextSections = [...existing, section];
    }

    const updated: ClassBoardItem = {
      ...classItem,
      sections: nextSections,
      updatedAt: new Date().toISOString(),
    };
    await saveClassBoard(updated, user?.email);
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSectionModalItem(null);
  };

  const handleDeleteSection = async (classItem: ClassBoardItem, sectionId: string) => {
    const nextSections = (classItem.sections ?? []).filter((s) => s.id !== sectionId);
    const updated: ClassBoardItem = {
      ...classItem,
      sections: nextSections,
      updatedAt: new Date().toISOString(),
    };
    await saveClassBoard(updated, user?.email);
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Celoškolní hlášení – uložení
  const handleSaveGlobalAnnouncement = async (item: Omit<GlobalAnnouncement, 'id' | 'updatedAt'> & { id?: string }) => {
    const saved = await saveGlobalAnnouncement(item);
    setGlobalAnnouncements((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setIsGlobalAnnouncementModalOpen(false);
    setEditingGlobalAnnouncement(null);
  };

  const handleDeleteGlobalAnnouncement = async (id: string) => {
    if (!confirm('Opravdu chcete smazat toto celoškolní hlášení?')) return;
    await deleteGlobalAnnouncement(id);
    setGlobalAnnouncements((prev) => prev.filter((x) => x.id !== id));
  };

  // Tisk rozvrhu
  const handlePrintSchedule = (item: ClassBoardItem) => {
    setPrintingItem(item);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Klávesa Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxItem) setLightboxItem(null);
        if (isEditModalOpen) setIsEditModalOpen(false);
        if (deleteConfirmItem) setDeleteConfirmItem(null);
        if (uniformModalItem) setUniformModalItem(null);
        if (dutyModalItem) setDutyModalItem(null);
        if (sectionModalItem) setSectionModalItem(null);
        if (isGlobalAnnouncementModalOpen) setIsGlobalAnnouncementModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    lightboxItem,
    isEditModalOpen,
    deleteConfirmItem,
    uniformModalItem,
    dutyModalItem,
    sectionModalItem,
    isGlobalAnnouncementModalOpen,
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 print:p-0 print:m-0 print:space-y-0">
      {/* ─── Tisková hlavička ─────────────────────────────────────────────── */}
      <PrintHeader
        subject={printingItem ? `Rozvrh hodin třídy ${printingItem.className}` : 'Informační tabule tříd ZOP'}
        docTitle="Akademie Vězeňské služby ČR – Přehled a rozvrh výuky"
        category="ZOP A"
        subtext="Interní studijní a výcvikový materiál / Určeno pro posluchače Akademie VS ČR"
      />

      {/* ─── Tiskový obsah vybraného rozvrhu ─────────────────────────────── */}
      {printingItem && (
        <div className="hidden print:block w-full text-center space-y-4 pt-2">
          <div className="border border-slate-400 p-2 rounded-lg inline-block w-full">
            {printingItem.scheduleUrl ? (
              <img
                src={printingItem.scheduleUrl}
                alt={`Rozvrh ${printingItem.className}`}
                className="w-full max-h-[240mm] object-contain mx-auto"
              />
            ) : (
              <div className="py-20 text-slate-500 font-semibold">
                Rozvrh pro třídu {printingItem.className} není nahrán.
              </div>
            )}
          </div>
          {printingItem.infoText && (
            <div className="text-left text-xs text-slate-800 border-t border-slate-300 pt-3 mt-4">
              <div className="font-bold mb-1">Doplňující informace a změny:</div>
              <div className="whitespace-pre-line leading-relaxed">{printingItem.infoText}</div>
            </div>
          )}
        </div>
      )}

      {/* ─── Záhlaví nástěnky s volbou „Moje třída” ───────────────────────── */}
      <header className="no-print bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            {/* Horní řádek: Pill ZOP + Volič „Moje třída” */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <School className="w-3.5 h-3.5" />
                <span>Základní odborná příprava (ZOP)</span>
              </div>

              {/* Výběr a propsání „Moje třída” */}
              <div className="relative" ref={classDropdownRef}>
                <button
                  onClick={() => setIsClassDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-400/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer shadow-sm"
                  title="Zvolit moji třídu"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Moje třída:</span>
                  <span className="text-white underline underline-offset-2">{selectedMyClass}</span>
                  {profile?.role === 'velitel_tridy' && (
                    <span className="ml-1 px-1.5 py-0.2 rounded bg-purple-600/60 text-purple-200 text-[10px]">
                      Velitel
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isClassDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Vyberte svou třídu
                    </div>
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => handleSelectMyClass(cls.className)}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                          cls.className.toLowerCase() === selectedMyClass.toLowerCase()
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span>{cls.className}</span>
                        {cls.className.toLowerCase() === selectedMyClass.toLowerCase() && (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Informační tabule tříd ZOP</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Denní operativní rozvrhy, ústrojová kázeň, nepravidelné výpomoci na Pankráci, služby na
              recepci Akademie a zkouškové termíny.
            </p>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-300/90 font-medium pt-1">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="capitalize">{todayFormatted}</span>
            </div>
          </div>

          {/* Pravé ovládací prvky v záhlaví */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Přepínač zobrazení: Podrobný přehled vs. Mřížka */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/90 rounded-2xl p-1 shadow-inner">
              <button
                onClick={() => setViewMode('expanded')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'expanded'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Podrobný přehled zvolené třídy na celou šířku"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Moje třída ({selectedMyClass})</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mřížka všech tříd"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Všechny třídy</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                title="Obnovit data nástěnky"
                aria-label="Obnovit"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              </button>

              {isPrivileged && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsEditModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 border border-blue-400/40 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Přidat třídu</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vyhledávací lišta */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat třídu, službu, osobu…"
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Zobrazeno:</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-bold border border-slate-700">
              {viewMode === 'expanded' ? `1 podrobná (${selectedMyClass})` : `${filteredClasses.length} tříd`}
            </span>
          </div>
        </div>
      </header>

      {/* ─── Celoškolní informace pro všechny (Akademie VS ČR) ───────────── */}
      <section className="no-print bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Informace pro všechny – Akademie VS ČR</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold border border-amber-300/40">
                  Celoškolní hlášení
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Společné rozkazy, provoz areálu a pokyny vedení pro všechny posluchače a ročníky
              </p>
            </div>
          </div>

          {isPrivileged && (
            <button
              onClick={() => {
                setEditingGlobalAnnouncement(null);
                setIsGlobalAnnouncementModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-500" />
              <span>Přidat celoškolní hlášení</span>
            </button>
          )}
        </div>

        {globalAnnouncements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {globalAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className={`p-4 rounded-2xl border transition-all ${
                  ann.priority === 'urgent'
                    ? 'bg-red-500/5 dark:bg-red-950/20 border-red-500/30'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.badge && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                          ann.priority === 'urgent'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-400/40'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-400/40'
                        }`}
                      >
                        {ann.badge}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ann.date}
                    </span>
                  </div>

                  {isPrivileged && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingGlobalAnnouncement(ann);
                          setIsGlobalAnnouncementModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-400"
                        title="Upravit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteGlobalAnnouncement(ann.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-400"
                        title="Smazat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  {ann.title}
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-2.5">
                  {ann.content}
                </div>
                <div className="text-[10px] text-slate-400 italic">Autor: {ann.author}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400 italic">
            Žádná mimořádná celoškolní hlášení nejsou v tuto chvíli aktivní.
          </div>
        )}
      </section>

      {/* ─── Podrobný přehled jedné třídy (Roztažená dlaždice) ─────────────── */}
      {viewMode === 'expanded' && myClassItem && (
        <section className="no-print space-y-6">
          <ClassDetailExpanded
            item={myClassItem}
            isManager={checkCanManageClass(myClassItem)}
            isPrivileged={isPrivileged}
            formatUpdateTime={formatUpdateTime}
            onEdit={() => {
              setEditingItem(myClassItem);
              setIsEditModalOpen(true);
            }}
            onEditUniform={() => setUniformModalItem(myClassItem)}
            onAddDuty={() => setDutyModalItem(myClassItem)}
            onDeleteDuty={(dutyId) => handleDeleteDuty(myClassItem, dutyId)}
            onAddSection={() => setSectionModalItem(myClassItem)}
            onDeleteSection={(secId) => handleDeleteSection(myClassItem, secId)}
            onOpenLightbox={() => {
              setLightboxItem(myClassItem);
              setLightboxZoom(1);
            }}
            onPrintSchedule={() => handlePrintSchedule(myClassItem)}
          />
        </section>
      )}

      {/* ─── Mřížka všech tříd (Grid mód) ─────────────────────────────────── */}
      {viewMode === 'grid' && (
        <section className="no-print space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Dlaždice jednotlivých tříd ZOP:</span>
            {hiddenClassIds.length > 0 && (
              <button
                onClick={() => setHiddenClassIds([])}
                className="text-blue-500 hover:text-blue-400 font-semibold cursor-pointer"
              >
                Zobrazit všechny skryté třídy ({hiddenClassIds.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses
              .filter((c) => !hiddenClassIds.includes(c.id))
              .map((item) => (
                <ClassCardCompact
                  key={item.id}
                  item={item}
                  isMyClass={item.className.toLowerCase() === selectedMyClass.toLowerCase()}
                  isManager={checkCanManageClass(item)}
                  isPrivileged={isPrivileged}
                  formatUpdateTime={formatUpdateTime}
                  onSelectAsMyClass={() => handleSelectMyClass(item.className)}
                  onToggleHide={() => handleToggleHideClass(item.id)}
                  onEdit={() => {
                    setEditingItem(item);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={() => setDeleteConfirmItem(item)}
                  onEditUniform={() => setUniformModalItem(item)}
                  onAddDuty={() => setDutyModalItem(item)}
                  onOpenLightbox={() => {
                    setLightboxItem(item);
                    setLightboxZoom(1);
                  }}
                  onPrintSchedule={() => handlePrintSchedule(item)}
                />
              ))}
          </div>
        </section>
      )}

      {/* ─── Modální formulář pro třídu ──────────────────────────────────── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <ClassEditModal
            item={editingItem}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingItem(null);
            }}
            onSave={handleSaveItem}
          />
        )}
      </AnimatePresence>

      {/* ─── Modál pro ústrojovou kázeň ──────────────────────────────────── */}
      <AnimatePresence>
        {uniformModalItem && (
          <UniformGuidanceModal
            item={uniformModalItem}
            authorName={profile?.full_name || (profile?.role === 'velitel_tridy' ? 'Velitel třídy' : 'Lektor')}
            onClose={() => setUniformModalItem(null)}
            onSave={(guidance) => handleSaveUniform(uniformModalItem, guidance)}
          />
        )}
      </AnimatePresence>

      {/* ─── Modál pro novou službu (Pankrác, Recepce...) ─────────────────── */}
      <AnimatePresence>
        {dutyModalItem && (
          <DutyModal
            item={dutyModalItem}
            onClose={() => setDutyModalItem(null)}
            onSave={(duty) => handleSaveDuty(dutyModalItem, duty)}
          />
        )}
      </AnimatePresence>

      {/* ─── Modál pro modulární sekci ───────────────────────────────────── */}
      <AnimatePresence>
        {sectionModalItem && (
          <SectionModal
            item={sectionModalItem}
            onClose={() => setSectionModalItem(null)}
            onSave={(sec) => handleSaveSection(sectionModalItem, sec)}
          />
        )}
      </AnimatePresence>

      {/* ─── Modál pro celoškolní hlášení ────────────────────────────────── */}
      <AnimatePresence>
        {isGlobalAnnouncementModalOpen && (
          <GlobalAnnouncementModal
            item={editingGlobalAnnouncement}
            authorDefault={profile?.full_name || 'Vedení Akademie VS ČR'}
            onClose={() => {
              setIsGlobalAnnouncementModalOpen(false);
              setEditingGlobalAnnouncement(null);
            }}
            onSave={handleSaveGlobalAnnouncement}
          />
        )}
      </AnimatePresence>

      {/* ─── Potvrzení smazání třídy ─────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirmItem && (
          <DeleteConfirmModal
            className={deleteConfirmItem.className}
            isDeleting={isDeleting}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteConfirmItem(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── Lightbox pro rozvrh ─────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxItem && lightboxItem.scheduleUrl && (
          <ScheduleLightbox
            item={lightboxItem}
            zoom={lightboxZoom}
            setZoom={setLightboxZoom}
            onClose={() => setLightboxItem(null)}
            onPrint={() => handlePrintSchedule(lightboxItem)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Komponenta: Odpočet a průběh kurzu ──────────────────────────────────────

interface CourseCountdownWidgetProps {
  startDate?: string | null;
  endDate?: string | null;
  compact?: boolean;
  onEditDates?: () => void;
  canEdit?: boolean;
}

function CourseCountdownWidget({
  startDate,
  endDate,
  compact = false,
  onEditDates,
  canEdit = false,
}: CourseCountdownWidgetProps) {
  const countdown = useMemo(() => getCourseCountdown(startDate, endDate), [startDate, endDate]);

  if (countdown.status === 'unset') {
    if (!canEdit) return null;
    return (
      <div
        className={`rounded-xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 flex items-center justify-between ${
          compact ? 'mx-4 my-2 px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Termín kurzu není nastaven</span>
        </div>
        {onEditDates && (
          <button
            onClick={onEditDates}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer"
          >
            Nastavit termín
          </button>
        )}
      </div>
    );
  }

  // Kompaktní varianta pro dlaždici v mřížce
  if (compact) {
    return (
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
              {countdown.headline}:
            </span>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
              {countdown.remainingText}
            </span>
          </div>
          {countdown.progressPercent !== undefined && (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0 bg-blue-100/60 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/40">
              {countdown.progressPercent} %
            </span>
          )}
        </div>

        {/* Jemný proužek průběhu výcviku */}
        {countdown.progressPercent !== undefined && countdown.progressPercent > 0 && (
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                countdown.status === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(3, countdown.progressPercent))}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  // Rozšířená varianta pro velký detail třídy
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-slate-50/70 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 border border-blue-200/70 dark:border-blue-900/40 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                {countdown.headline}
              </span>
              {countdown.elapsedText && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300/40 dark:border-blue-800/40">
                  {countdown.elapsedText}
                </span>
              )}
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {countdown.remainingText}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto text-left sm:text-right">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Období kurzu
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {countdown.formattedPeriod || 'Neuvedeno'}
            </div>
          </div>
          {canEdit && onEditDates && (
            <button
              onClick={onEditDates}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Upravit termín zahájení a ukončení kurzu"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {countdown.progressPercent !== undefined && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Průběh výcviku</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {countdown.progressPercent} %
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                countdown.status === 'completed'
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, countdown.progressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Podrobný přehled třídy (Full-Width Expanded View) ────────────────────────

interface ClassDetailExpandedProps {
  item: ClassBoardItem;
  isManager: boolean;
  isPrivileged: boolean;
  formatUpdateTime: (iso: string) => string;
  onEdit: () => void;
  onEditUniform: () => void;
  onAddDuty: () => void;
  onDeleteDuty: (id: string) => void;
  onAddSection: () => void;
  onDeleteSection: (id: string) => void;
  onOpenLightbox: () => void;
  onPrintSchedule: () => void;
}

function ClassDetailExpanded({
  item,
  isManager,
  isPrivileged,
  formatUpdateTime,
  onEdit,
  onEditUniform,
  onAddDuty,
  onDeleteDuty,
  onAddSection,
  onDeleteSection,
  onOpenLightbox,
  onPrintSchedule,
}: ClassDetailExpandedProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden space-y-6 p-6 sm:p-8">
      {/* Horní hlavička třídy */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            {item.className.replace(/[^0-9A-Z]/g, '').slice(-3) || 'VS'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Třída {item.className}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-400/30">
                Moje třída
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Aktualizováno: {formatUpdateTime(item.updatedAt)}
              </span>
              {item.uniformGuidance?.updatedBy && (
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  • {item.uniformGuidance.updatedBy}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Akční tlačítka správy */}
        <div className="flex items-center gap-2 flex-wrap">
          {isManager && (
            <>
              <button
                onClick={onEditUniform}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600/15 hover:bg-purple-600/25 text-purple-700 dark:text-purple-300 border border-purple-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Upravit ústrojovou kázeň"
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Ústrojová kázeň</span>
              </button>
              <button
                onClick={onAddDuty}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-400/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Přidat termín služby (Pankrác, Recepce...)"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ Služba / Pankrác</span>
              </button>
              <button
                onClick={onAddSection}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Přidat novou modulární sekci"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Sekce</span>
              </button>
            </>
          )}

          {isPrivileged && (
            <button
              onClick={onEdit}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Upravit třídu a rozvrh"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Informační odpočet a průběh kurzu */}
      <CourseCountdownWidget
        startDate={item.courseStartDate}
        endDate={item.courseEndDate}
        canEdit={isPrivileged}
        onEditDates={onEdit}
      />

      {/* Sekce Denní hlášení, operativní změny & zkoušky (Umístěno nahoře nad rozvrhem) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-500/20 dark:border-blue-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Denní hlášení, operativní změny & zkoušky</span>
          </h3>
          {isPrivileged && (
            <button
              onClick={onEdit}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Upravit hlášení</span>
            </button>
          )}
        </div>

        <div className="text-xs leading-relaxed space-y-2">
          {item.infoText ? (
            item.infoText
              .split('\n')
              .filter((l) => l.trim().length > 0)
              .map((line, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-slate-800 dark:text-slate-100">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span className="whitespace-pre-wrap font-medium">{line.replace(/^[•\-*]\s*/, '')}</span>
                </div>
              ))
          ) : (
            <div className="text-slate-400 italic py-1">
              Žádné aktuální změny ani mimořádná hlášení nejsou zadána.
            </div>
          )}
        </div>
      </div>

      {/* Dva hlavní pilíře vedle sebe: 1. Rozvrh hodin, 2. Ústrojová kázeň */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sloupec Rozvrh hodin (7/12) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Rozvrh hodin třídy {item.className}</span>
            </h3>
            {item.scheduleUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrintSchedule}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Tisk A4</span>
                </button>
                <button
                  onClick={onOpenLightbox}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Celoobrazovkový náhled</span>
                </button>
              </div>
            )}
          </div>

          {item.scheduleUrl ? (
            <div
              onClick={onOpenLightbox}
              className="group relative w-full h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={item.scheduleUrl}
                alt={`Rozvrh ${item.className}`}
                className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm">
                <ZoomIn className="w-5 h-5" />
                <span>Kliknutím otevřete velký rozvrh s možností zoomu</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-72 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col items-center justify-center p-6 text-center">
              <ImageIcon className="w-12 h-12 text-slate-400 mb-3 opacity-60" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Rozvrh pro třídu {item.className} zatím nebyl nahrán
              </span>
              <span className="text-xs text-slate-500 mt-1 max-w-xs">
                Lektor nebo velitel výcviku může nahrát aktuální obrázek rozvrhu v editaci třídy.
              </span>
              {isPrivileged && (
                <button
                  onClick={onEdit}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Nahrát rozvrh nyní
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sloupec Ústrojová kázeň & hlášení velitele (5/12) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              <span>Ústrojová kázeň třídy</span>
            </h3>
            {isManager && (
              <button
                onClick={onEditUniform}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
              >
                Upravit ústroj
              </button>
            )}
          </div>

          <div className="flex-1 bg-gradient-to-br from-purple-500/5 via-slate-50 to-indigo-500/5 dark:from-purple-950/20 dark:via-slate-950/40 dark:to-indigo-950/20 border border-purple-500/20 dark:border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
            {item.uniformGuidance ? (
              <>
                <div className="space-y-2 text-xs">
                  {(() => {
                    const days = normalizeUniformDays(item.uniformGuidance);
                    const todayName = getTodayCzechName();
                    return days.map((d, dIdx) => {
                      const dayName = d.day?.trim() || '';
                      const isToday =
                        dayName.length > 0 &&
                        (dayName.toLowerCase() === todayName.toLowerCase() ||
                          dayName.toLowerCase().includes(todayName.toLowerCase()));
                      return (
                        <div
                          key={`${dayName}-${dIdx}`}
                          className={`p-2.5 rounded-xl border transition-all ${
                            isToday
                              ? 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-400/60 shadow-sm ring-1 ring-purple-400/20'
                              : 'bg-white/85 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  isToday
                                    ? 'text-purple-700 dark:text-purple-300'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {dayName || `Položka ${dIdx + 1}`}
                              </span>
                              {isToday && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-600 text-white tracking-wider">
                                  Dnes
                                </span>
                              )}
                            </div>

                            {d.hasWorkout && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[10px] font-semibold">
                                <span>👟</span>
                                <span>Věci na cvičení</span>
                              </span>
                            )}
                          </div>

                          <div className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                            {d.outfit || <span className="text-slate-400 italic font-normal">Nestanoveno</span>}
                          </div>

                          {d.hasWorkout && d.workoutNote && (
                            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-normal">
                              <span>•</span>
                              <span>{d.workoutNote}</span>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                {item.uniformGuidance.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Poznámka: </span>
                    {item.uniformGuidance.notes}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 pt-2 border-t border-purple-200/40 dark:border-purple-900/40 flex items-center justify-between">
                  <span>Určil: {item.uniformGuidance.updatedBy || 'Velitel třídy'}</span>
                  {item.uniformGuidance.updatedAt && (
                    <span>{formatUpdateTime(item.uniformGuidance.updatedAt)}</span>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-slate-400">
                <Shirt className="w-10 h-10 mb-2 opacity-40 text-purple-400" />
                <span className="text-xs font-semibold">Ústrojová kázeň zatím nebyla zadána.</span>
                <span className="text-[11px] mt-0.5 text-slate-500">
                  Velitel třídy nebo lektor může stanovit ústroj na jednotlivé dny.
                </span>
                {isManager && (
                  <button
                    onClick={onEditUniform}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Nastavit ústroj třídy
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dvě doplňující sekce: 1. Operativní služby (Pankrác, Recepce), 2. Denní změny a materiály */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Sekce Mimořádné služby & Výpomoc Pankrác / Recepce */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Termíny výpomocí & služeb (Pankrác, Recepce)</span>
            </h3>
            {isManager && (
              <button
                onClick={onAddDuty}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                + Přidat termín
              </button>
            )}
          </div>

          <div className="space-y-3">
            {item.dutyRoster && item.dutyRoster.length > 0 ? (
              item.dutyRoster.map((duty) => (
                <div
                  key={duty.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 space-y-2 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                          duty.type === 'pankrac'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-400/40'
                            : duty.type === 'recepce'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-400/40'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-400/40'
                        }`}
                      >
                        {duty.type === 'pankrac'
                          ? 'VÝPOMOC PANKRÁC'
                          : duty.type === 'recepce'
                          ? 'RECE дистанce AKADEMIE'
                          : duty.type.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {duty.date}
                      </span>
                      {duty.time && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {duty.time}
                        </span>
                      )}
                    </div>

                    {isManager && (
                      <button
                        onClick={() => onDeleteDuty(duty.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                        title="Odstranit záznam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {duty.title}
                  </h4>

                  {duty.location && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{duty.location}</span>
                    </div>
                  )}

                  {duty.attendees && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs">
                      <div className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase mb-0.5">
                        Určení posluchači:
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {duty.attendees}
                      </div>
                    </div>
                  )}

                  {duty.uniform && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-bold">Požadovaná výstroj:</span> {duty.uniform}
                    </div>
                  )}

                  {duty.notes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      Poznámka: {duty.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs italic">
                Žádné mimořádné služby ani výpomoci na Pankráci nejsou v tomto období vypsány.
              </div>
            )}
          </div>
        </div>

        {/* Sekce Studijní materiály & Modulární sekce */}
        <div className="space-y-4">

          {/* Odkazy na studijní materiály třídy */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Studijní materiály pro třídu {item.className}</span>
            </h3>

            <div className="space-y-2">
              {item.linkedMaterials && item.linkedMaterials.length > 0 ? (
                item.linkedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {mat.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          {mat.subject && <span className="font-semibold">{mat.subject}</span>}
                          {mat.sizeLabel && <span>{mat.sizeLabel}</span>}
                        </div>
                      </div>
                    </div>
                    <a
                      href={mat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      <span>Stáhnout</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs italic">
                  K této třídě nejsou přiřazeny žádné specifické soubory. Všechny studijní texty naleznete v hlavní Knihovně.
                </div>
              )}
            </div>
          </div>

          {/* Vlastní modulární sekce */}
          {item.sections && item.sections.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Doplňující sekce třídy
              </h3>
              <div className="space-y-2">
                {item.sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {sec.badge && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {sec.badge}
                          </span>
                        )}
                        <span className="font-bold text-slate-900 dark:text-white">{sec.title}</span>
                      </div>
                      {isManager && (
                        <button
                          onClick={() => onDeleteSection(sec.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                          title="Smazat sekci"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {sec.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Kompaktní karta pro mřížku (Grid Card) ───────────────────────────────────

interface ClassCardCompactProps {
  item: ClassBoardItem;
  isMyClass: boolean;
  isManager: boolean;
  isPrivileged: boolean;
  formatUpdateTime: (iso: string) => string;
  onSelectAsMyClass: () => void;
  onToggleHide: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditUniform: () => void;
  onAddDuty: () => void;
  onOpenLightbox: () => void;
  onPrintSchedule: () => void;
}

function ClassCardCompact({
  item,
  isMyClass,
  isManager,
  isPrivileged,
  formatUpdateTime,
  onSelectAsMyClass,
  onToggleHide,
  onEdit,
  onDelete,
  onEditUniform,
  onAddDuty,
  onOpenLightbox,
  onPrintSchedule,
}: ClassCardCompactProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col overflow-hidden shadow-sm hover:shadow-md ${
        isMyClass
          ? 'border-blue-500/70 ring-2 ring-blue-500/20'
          : 'border-slate-200/90 dark:border-slate-800'
      }`}
    >
      {/* Horní lišta */}
      <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full ${isMyClass ? 'bg-blue-500' : 'bg-slate-400'}`} />
          <h3 className="font-black text-slate-900 dark:text-white text-base truncate">
            {item.className}
          </h3>
          {isMyClass && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Moje
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isMyClass && (
            <button
              onClick={onSelectAsMyClass}
              className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-1.5 py-0.5 cursor-pointer"
              title="Nastavit jako moji třídu"
            >
              Zvolit
            </button>
          )}

          <button
            onClick={onToggleHide}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
            title="Skrýt tuto třídu z mřížky"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          {isPrivileged && (
            <>
              <button
                onClick={onEdit}
                className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                title="Upravit třídu"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                title="Smazat třídu"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Informační odpočet a průběh kurzu */}
      <CourseCountdownWidget
        startDate={item.courseStartDate}
        endDate={item.courseEndDate}
        compact
        canEdit={isPrivileged}
        onEditDates={onEdit}
      />

      {/* Tělo kompaktní karty: dva sloupce */}
      <div className="p-4 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Rozvrh */}
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span>Rozvrh hodin</span>
            {item.scheduleUrl && (
              <button
                onClick={onPrintSchedule}
                className="text-slate-400 hover:text-slate-200 text-[10px]"
                title="Vytisknout v A4"
              >
                <Printer className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[140px] flex items-center justify-center">
            {item.scheduleUrl ? (
              <div
                onClick={onOpenLightbox}
                className="group relative w-full h-full min-h-[140px] max-h-[170px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 cursor-pointer"
              >
                <img
                  src={item.scheduleUrl}
                  alt={`Rozvrh ${item.className}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zvětšit</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-3 text-center">
                <ImageIcon className="w-6 h-6 text-slate-400 mb-1 opacity-50" />
                <span className="text-[11px] text-slate-500">Bez rozvrhu</span>
              </div>
            )}
          </div>
        </div>

        {/* Ústroj & Změny */}
        <div className="flex flex-col space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400">
            <span className="flex items-center gap-1">
              <Shirt className="w-3 h-3" />
              <span>Ústroj</span>
            </span>
            {isManager && (
              <button onClick={onEditUniform} className="text-[10px] hover:underline cursor-pointer">
                Upravit
              </button>
            )}
          </div>

          {(() => {
            const upcoming = getUpcomingUniformInfo(item.uniformGuidance);
            const displayOutfit =
              upcoming.item?.outfit ||
              item.uniformGuidance?.tomorrow ||
              item.uniformGuidance?.today;

            if (!displayOutfit) {
              return (
                <div className="p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-300/30 text-[11px] leading-snug text-slate-400 italic min-h-[50px] flex items-center">
                  Nestanoveno
                </div>
              );
            }

            return (
              <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-300/30 text-[11px] leading-snug text-purple-950 dark:text-purple-200 min-h-[50px] flex flex-col justify-between">
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <span className="font-bold text-purple-800 dark:text-purple-300">
                      {upcoming.targetDayLabel}:{' '}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {displayOutfit}
                    </span>
                  </div>
                  {upcoming.hasWorkout && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                      <span>👟</span>
                      <span>Cvičení</span>
                    </span>
                  )}
                </div>
                {upcoming.item?.workoutNote && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate mt-1">
                    {upcoming.item.workoutNote}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Nejbližší výpomoc Pankrác / Recepce */}
          {item.dutyRoster && item.dutyRoster.length > 0 ? (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] leading-snug space-y-0.5">
              <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 text-[10px]">
                <Building2 className="w-3 h-3" />
                <span>{item.dutyRoster[0].type === 'pankrac' ? 'Pankrác' : 'Recepce'}</span>
                <span className="text-slate-500 font-normal">({item.dutyRoster[0].date})</span>
              </div>
              <div className="truncate text-slate-700 dark:text-slate-300 font-medium">
                {item.dutyRoster[0].title}
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 italic">
              Žádná vypsaná výpomoc
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modál: Ústrojová kázeň ───────────────────────────────────────────────────

interface UniformGuidanceModalProps {
  item: ClassBoardItem;
  authorName: string;
  onClose: () => void;
  onSave: (guidance: UniformGuidance) => Promise<void>;
}

function UniformGuidanceModal({ item, authorName, onClose, onSave }: UniformGuidanceModalProps) {
  const [days, setDays] = useState<DayUniformItem[]>(() => {
    return normalizeUniformDays(item.uniformGuidance);
  });
  const [notes, setNotes] = useState(item.uniformGuidance?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleDayNameChange = (index: number, val: string) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, day: val } : d)));
  };

  const handleDayOutfitChange = (index: number, val: string) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, outfit: val } : d)));
  };

  const handleToggleWorkout = (index: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d;
        const nextHasWorkout = !d.hasWorkout;
        return {
          ...d,
          hasWorkout: nextHasWorkout,
          workoutNote: nextHasWorkout
            ? (d.workoutNote || 'Věci na cvičení do tělocvičny s sebou')
            : '',
        };
      })
    );
  };

  const handleWorkoutNoteChange = (index: number, val: string) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, workoutNote: val } : d)));
  };

  const handleAddDay = () => {
    setDays((prev) => [
      ...prev,
      { day: '', outfit: '', hasWorkout: false, workoutNote: '' },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    setDays((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanedDays = days.filter((d) => d.day.trim() !== '' || d.outfit.trim() !== '');
      await onSave({
        days: cleanedDays,
        notes: notes.trim(),
        updatedBy: authorName,
        updatedAt: new Date().toISOString(),
        today: cleanedDays[0]?.outfit,
        tomorrow: cleanedDays[1]?.outfit,
        dayAfterTomorrow: cleanedDays[2]?.outfit,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-5 sm:p-7 space-y-5 my-8 max-h-[90vh] flex flex-col"
      >
        {/* Hlavička */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                Ústroj pro třídu {item.className}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Volně zadejte, upravte nebo odstraňte dny a požadovanou ústroj. Názvy i texty si můžete přizpůsobit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          {/* Jednotlivé dny a volné kolonky */}
          <div className="space-y-2.5">
            {days.map((dayItem, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  dayItem.hasWorkout
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Název dne / položky - volně upravitelné */}
                  <div className="w-full sm:w-36 shrink-0">
                    <input
                      type="text"
                      value={dayItem.day}
                      onChange={(e) => handleDayNameChange(idx, e.target.value)}
                      placeholder="Den (např. Pondělí)..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  {/* Volné textové pole pro ústroj */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={dayItem.outfit}
                      onChange={(e) => handleDayOutfitChange(idx, e.target.value)}
                      placeholder="Ústroj (např. PS II, Civil, Služební...)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  {/* Tlačítko Cvičení a Smazat položku */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleWorkout(idx)}
                      className={`px-3 py-2 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
                        dayItem.hasWorkout
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/20'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>👟</span>
                      <span>{dayItem.hasWorkout ? 'Cvičení: ANO' : 'Cvičení'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveDay(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Odebrat tento řádek"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Doplňující poznámka ke cvičení, pokud je aktivní */}
                {dayItem.hasWorkout && (
                  <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shrink-0">
                      Upozornění pro třídu:
                    </span>
                    <input
                      type="text"
                      value={dayItem.workoutNote || ''}
                      onChange={(e) => handleWorkoutNoteChange(idx, e.target.value)}
                      placeholder="např. Věci na sebeobranu do tělocvičny a čistá sálová obuv"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-500/40 text-slate-900 dark:text-white text-xs font-normal focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tlačítko pro přidání dalšího dne / položky */}
          <button
            type="button"
            onClick={handleAddDay}
            className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Přidat další den / položku</span>
          </button>

          {/* Poznámka velitele třídy */}
          <div className="pt-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
              Doplňující poznámka pro celou třídu (volitelné)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="např. Přezůvky do tělocvičny a čistý ručník s sebou..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Tlačítka uložení */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              {saving ? 'Ukládám…' : 'Zveřejnit ústroj třídy'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Modál: Termín služby (Výpomoc Pankrác, Recepce...) ───────────────────────

interface DutyModalProps {
  item: ClassBoardItem;
  onClose: () => void;
  onSave: (duty: DutyRosterItem) => Promise<void>;
}

function DutyModal({ item, onClose, onSave }: DutyModalProps) {
  const [type, setType] = useState<DutyType>('pankrac');
  const [title, setTitle] = useState('Výpomoc VV Praha - Pankrác');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('06:30 – 15:30');
  const [location, setLocation] = useState('Vazební věznice Praha - Pankrác (hlavní vchod)');
  const [attendees, setAttendees] = useState('');
  const [uniform, setUniform] = useState('Pracovní stejnokroj PS II, vysoká obuv, taktický opasek, služební průkaz');
  const [notes, setNotes] = useState('Sraz před vchodem Akademie 15 minut předem.');
  const [saving, setSaving] = useState(false);

  const handleTypeChange = (newType: DutyType) => {
    setType(newType);
    if (newType === 'pankrac') {
      setTitle('Výpomoc VV Praha - Pankrác');
      setLocation('Vazební věznice Praha - Pankrác (hlavní brána)');
      setTime('06:30 – 15:30');
      setUniform('Pracovní stejnokroj PS II, vysoká obuv, taktický opasek, služební průkaz');
    } else if (newType === 'recepce') {
      setTitle('Služba na recepci Akademie VS ČR');
      setLocation('Recepce Akademie VS ČR');
      setTime('06:00 – 18:00 (denní směna)');
      setUniform('Služební stejnokroj, vázanka, služební odznak');
    } else {
      setTitle('Mimořádná výcviková událost');
      setLocation('Areál Akademie VS ČR');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: `duty-${Date.now()}`,
        type,
        title: title.trim(),
        date: date.trim() || new Date().toLocaleDateString('cs-CZ'),
        time: time.trim(),
        location: location.trim(),
        attendees: attendees.trim(),
        uniform: uniform.trim(),
        notes: notes.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Vypsat službu pro třídu {item.className}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Výběr typu služby */}
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
              Typ mimořádné služby
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('pankrac')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  type === 'pankrac'
                    ? 'bg-red-500/15 border-red-500 text-red-600 dark:text-red-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Výpomoc Pankrác
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('recepce')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  type === 'recepce'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Recepce Akademie
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('jine')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  type === 'jine'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Jiné / Stáž
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Název události *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Datum služby *
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="např. 22. 9. 2026"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Čas nástupu / směna
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="např. 06:30 – 15:30"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Určení posluchači (jmenný seznam) *
            </label>
            <input
              type="text"
              required
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="např. stržm. Novák, stržm. Dvořák, stržm. Svoboda"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Požadovaná výstroj a vybavení
            </label>
            <input
              type="text"
              value={uniform}
              onChange={(e) => setUniform(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Místo a operativní pokyny
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {saving ? 'Ukládám…' : 'Zapsat službu'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Modál: Přidání modulární sekce ───────────────────────────────────────────

interface SectionModalProps {
  item: ClassBoardItem;
  onClose: () => void;
  onSave: (section: ClassSection) => Promise<void>;
}

function SectionModal({ item, onClose, onSave }: SectionModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [badge, setBadge] = useState('OZNÁMENÍ');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: `sec-${Date.now()}`,
        type: 'custom',
        title: title.trim(),
        content: content.trim(),
        badge: badge.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Přidat sekci pro třídu {item.className}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Nadpis sekce *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="např. Příprava na střelby, Mimořádný nástup..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Štítek / Odznak
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="např. DŮLEŽITÉ, UPOZORNĚNÍ, ZKOUŠKA..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white uppercase text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Obsah sekce *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Podrobný text, odrážky nebo instrukce lektora..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
            >
              {saving ? 'Ukládám…' : 'Přidat sekci'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Modál: Celoškolní hlášení ───────────────────────────────────────────────

interface GlobalAnnouncementModalProps {
  item: GlobalAnnouncement | null;
  authorDefault: string;
  onClose: () => void;
  onSave: (ann: Omit<GlobalAnnouncement, 'id' | 'updatedAt'> & { id?: string }) => Promise<void>;
}

function GlobalAnnouncementModal({ item, authorDefault, onClose, onSave }: GlobalAnnouncementModalProps) {
  const [title, setTitle] = useState(item?.title ?? '');
  const [content, setContent] = useState(item?.content ?? '');
  const [badge, setBadge] = useState(item?.badge ?? 'CELOŠKOLNÍ ROZKAZ');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>(item?.priority ?? 'normal');
  const [author, setAuthor] = useState(item?.author ?? authorDefault);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: item?.id,
        title: title.trim(),
        content: content.trim(),
        badge: badge.trim(),
        date: new Date().toLocaleDateString('cs-CZ'),
        author: author.trim(),
        priority,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {item ? 'Upravit celoškolní hlášení' : 'Nové celoškolní hlášení pro všechny'}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Nadpis hlášení *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="např. Změna režimu výdeje stravy, Mimořádný nástup..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Kategorie / Štítek
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="CELOŠKOLNÍ ROZKAZ"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-semibold text-[11px]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Priorita
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'high' | 'urgent')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="normal">Běžná</option>
                <option value="high">Důležitá</option>
                <option value="urgent">Mimořádná / Naléhavá</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Text hlášení *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Podrobný text rozkazu či instrukce..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
              Autor / Vydal
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
            >
              {saving ? 'Ukládám…' : 'Zveřejnit hlášení'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Modál pro vytvoření / úpravu třídy ────────────────────────────────────────

interface ClassEditModalProps {
  item: ClassBoardItem | null;
  onClose: () => void;
  onSave: (input: ClassBoardInput) => Promise<void>;
}

function ClassEditModal({ item, onClose, onSave }: ClassEditModalProps) {
  const [className, setClassName] = useState(item?.className ?? '');
  const [courseStartDate, setCourseStartDate] = useState(item?.courseStartDate ?? '');
  const [courseEndDate, setCourseEndDate] = useState(item?.courseEndDate ?? '');
  const [infoText, setInfoText] = useState(item?.infoText ?? '');
  const [scheduleUrl, setScheduleUrl] = useState<string | null>(item?.scheduleUrl ?? null);
  const [scheduleStoragePath, setScheduleStoragePath] = useState<string | null>(
    item?.scheduleStoragePath ?? null
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(item?.scheduleUrl ?? null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Podporovány jsou pouze obrázky formátu JPG, PNG nebo WebP.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Maximální povolená velikost souboru je 15 MB.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScheduleUrl(null);
    setScheduleStoragePath(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      setErrorMsg('Vyplňte prosím název třídy (např. ZOP A11).');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      let finalScheduleUrl = scheduleUrl;
      let finalStoragePath = scheduleStoragePath;

      if (selectedFile) {
        try {
          const uploadRes = await uploadScheduleImage(selectedFile, className.trim());
          finalScheduleUrl = uploadRes.publicUrl;
          finalStoragePath = uploadRes.storagePath;
        } catch (uploadErr) {
          console.warn('[ClassEditModal] Storage upload selhal, ukládám DataURL:', uploadErr);
          finalScheduleUrl = await fileToDataUrl(selectedFile);
        }
      }

      await onSave({
        id: item?.id,
        className: className.trim(),
        scheduleUrl: finalScheduleUrl,
        scheduleStoragePath: finalStoragePath,
        infoText: infoText.trim(),
        courseStartDate: courseStartDate ? courseStartDate : null,
        courseEndDate: courseEndDate ? courseEndDate : null,
        dutyRoster: item?.dutyRoster,
        uniformGuidance: item?.uniformGuidance,
        linkedMaterials: item?.linkedMaterials,
        sections: item?.sections,
        createdAt: item?.createdAt,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Uložení třídy selhalo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {item ? `Upravit třídu: ${item.className}` : 'Vytvořit novou třídu'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Název třídy *
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="např. ZOP A11, ZOP B04..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-semibold"
            />
          </div>

          {/* Termín kurzu (pro odpočet) */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Termín kurzu (zahájení a ukončení)</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Pro odpočet do konce kurzu</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Datum zahájení kurzu
                </label>
                <input
                  type="date"
                  value={courseStartDate}
                  onChange={(e) => setCourseStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Datum ukončení kurzu
                </label>
                <input
                  type="date"
                  value={courseEndDate}
                  onChange={(e) => setCourseEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              Informační odpočet zobrazuje zbývající měsíce, týdny a dny i celkový průběh výcviku pro orientaci studentů.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Obrázek rozvrhu (JPG, PNG, WebP)
              </label>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-500 hover:text-red-400 font-semibold cursor-pointer"
                >
                  Odstranit obrázek
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center group">
                <img src={previewUrl} alt="Náhled rozvrhu" className="w-full h-48 object-contain" />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Kliknutím vyměnit obrázek</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
              >
                <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Vyberte obrázek rozvrhu k nahrání
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Uloženo do Supabase Storage bucketu studijni-materialy/rozvrhy/
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Denní informace, změny a pokyny
              </label>
              <span className="text-[11px] text-slate-500">Podporuje odrážky (•)</span>
            </div>
            <textarea
              rows={5}
              value={infoText}
              onChange={(e) => setInfoText(e.target.value)}
              placeholder="• Pondělí: Změna učebny na B2&#10;• Středa: Střelby posunuty na 13:00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Ukládám…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item ? 'Uložit změny' : 'Vytvořit třídu'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Dialog: Smazání třídy ───────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  className: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ className, isDeleting, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 mx-auto flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Smazat třídu {className}?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Tato akce odstraní kartu třídy, rozvrh, ústrojovou kázeň i všechny vypsané služby. Doporučeno
            při ukončení kurzu.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Zrušit
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20 cursor-pointer"
          >
            {isDeleting ? 'Mažu…' : 'Ano, smazat'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Lightbox pro rozvrh ─────────────────────────────────────────────────────

interface ScheduleLightboxProps {
  item: ClassBoardItem;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onPrint: () => void;
}

function ScheduleLightbox({ item, zoom, setZoom, onClose, onPrint }: ScheduleLightboxProps) {
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleZoomReset = () => setZoom(1);

  const handleDownload = () => {
    if (!item.scheduleUrl) return;
    const a = document.createElement('a');
    a.href = item.scheduleUrl;
    a.download = `Rozvrh_${item.className.replace(/\s+/g, '_')}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col">
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm sm:text-base">Rozvrh hodin – {item.className}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.75}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
              title="Oddálit"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              title="Obnovit 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
              title="Přiblížit"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Stáhnout rozvrh"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onPrint}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Vytisknout v A4"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white cursor-pointer ml-2"
            title="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        onClick={onClose}
        className="flex-1 overflow-auto flex items-center justify-center p-4 select-none cursor-zoom-out"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="transition-transform duration-200 cursor-default"
          style={{ transform: `scale(${zoom})` }}
        >
          {item.scheduleUrl && (
            <img
              src={item.scheduleUrl}
              alt={`Rozvrh ${item.className}`}
              className="max-w-[90vw] max-h-[82vh] object-contain rounded-xl shadow-2xl border border-slate-800"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
