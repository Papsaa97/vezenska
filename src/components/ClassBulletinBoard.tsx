import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Bookmark,
  Calendar,
  Check,
  CloudOff,
  ChevronDown,
  Clock,
  Edit2,
  Maximize2,
  Plus,
  Radio,
  RefreshCw,
  Search,
  School,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { DeleteResult, PersistResult } from '../utils/classBoardService';
import {
  ClassBoardItem,
  ClassBoardInput,
  GlobalAnnouncement,
  UniformGuidance,
  DutyRosterItem,
  ClassSection,
  fetchClassBoards,
  saveClassBoard,
  deleteClassBoard,
  fetchGlobalAnnouncements,
  saveGlobalAnnouncement,
  deleteGlobalAnnouncement,
  getMyClass,
  setMyClass,
  getHiddenClassIds,
  toggleHideClass,
  clearHiddenClasses,
} from '../utils/classBoardService';
import PrintHeader from './common/PrintHeader';
import ConfirmDialog from './common/ConfirmDialog';
import ClassDetailExpanded from './class-bulletin/ClassDetailExpanded';
import ClassCardCompact from './class-bulletin/ClassCardCompact';
import ClassEditModal from './class-bulletin/ClassEditModal';
import UniformGuidanceModal from './class-bulletin/UniformGuidanceModal';
import DutyModal from './class-bulletin/DutyModal';
import SectionModal from './class-bulletin/SectionModal';
import GlobalAnnouncementModal from './class-bulletin/GlobalAnnouncementModal';
import DeleteConfirmModal from './class-bulletin/DeleteConfirmModal';
import ScheduleLightbox from './class-bulletin/ScheduleLightbox';

/** Dnešní datum ve tvaru „pondělí 16. září 2026“. */
function formatToday(): string {
  return new Date().toLocaleDateString('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClassBulletinBoard() {
  const { profile, user, updateProfile } = useAuth();
  const isPrivileged = profile?.role === 'lektor' || profile?.role === 'admin';

  // Data
  const [classes, setClasses] = useState<ClassBoardItem[]>([]);
  const [globalAnnouncements, setGlobalAnnouncements] = useState<GlobalAnnouncement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Upozornění, že se obsah nástěnky nesešel se serverem.
   *
   * Nástěnka je sdílená — rozvrh, služby a ústrojová kázeň píše velitel třídy
   * pro ostatní. Když zápis neprojde, data zůstanou jen v tomto prohlížeči
   * a ostatní je nikdy neuvidí. Dřív o tom uživatel nevěděl vůbec nic.
   */
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

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
  /** Id celoškolního hlášení, u kterého se ptáme na potvrzení smazání. */
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<string | null>(null);

  // Lightbox pro rozvrh
  const [lightboxItem, setLightboxItem] = useState<ClassBoardItem | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  // Tisk
  const [printingItem, setPrintingItem] = useState<ClassBoardItem | null>(null);

  // Načtení dat
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [classResult, announcementResult] = await Promise.all([
        fetchClassBoards(),
        fetchGlobalAnnouncements(),
      ]);
      setClasses(classResult.items);
      setGlobalAnnouncements(announcementResult.items);

      // Když server odpoví chybou, zobrazí se záložní kopie ze zařízení. To samo
      // o sobě není špatně, ale uživatel musí vědět, že nemusí být aktuální —
      // dřív se chyba jen zapsala do konzole a nástěnka vypadala normálně.
      const loadError = classResult.error ?? announcementResult.error;
      setSyncNotice(
        loadError
          ? `${loadError} Zobrazuje se poslední uložená kopie z tohoto zařízení, nemusí být aktuální.`
          : null
      );
    } catch (err) {
      setSyncNotice(
        `Nástěnku se nepodařilo načíst (${err instanceof Error ? err.message : String(err)}). Zkuste to prosím znovu.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Zkontroluje výsledek zápisu a při neúspěchu na to upozorní.
   *
   * Vrací true při úspěchu, aby volající mohl rozhodnout, jestli pokračovat.
   */
  const reportWrite = useCallback((result: PersistResult<unknown> | DeleteResult): boolean => {
    if (result.persisted) {
      setSyncNotice(null);
      return true;
    }
    setSyncNotice(
      `${result.error ?? 'Změnu se nepodařilo uložit na server.'} Změna je zatím jen v tomto zařízení — ostatní ji neuvidí. Zkontrolujte připojení a uložte ji prosím znovu.`
    );
    return false;
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
        (c.infoText || '').toLowerCase().includes(q) ||
        c.dutyRoster?.some((d) => d.title.toLowerCase().includes(q) || d.attendees?.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [classes, searchQuery]);

  /** Třídy, které jsou v mřížce opravdu vidět (po filtru i po skrytí). */
  const visibleGridClasses = useMemo(
    () => filteredClasses.filter((c) => !hiddenClassIds.includes(c.id)),
    [filteredClasses, hiddenClassIds]
  );

  /**
   * Nástěnka zvolené třídy.
   *
   * Dřív se při nezvolené (nebo neexistující) třídě vzala `classes[0]` — uživatel
   * tak koukal na nástěnku cizí třídy s odznakem „Moje třída". Když třída zvolená
   * není, není co ukazovat a obrazovka o to požádá.
   */
  const myClassItem = useMemo(() => {
    const chosen = selectedMyClass.trim().toLowerCase();
    if (!chosen) return null;
    return classes.find((c) => c.className.toLowerCase() === chosen) ?? null;
  }, [classes, selectedMyClass]);

  // Kontrola, zda uživatel velí dané třídě
  const checkCanManageClass = useCallback(
    (item: ClassBoardItem) => {
      if (isPrivileged) return true;
      if (profile?.role === 'velitel_tridy') {
        // Jen třída zapsaná v profilu. Dřív se sem přimíchala volba „Moje třída"
        // z prohlížeče, takže si velitel mohl přepnutím v rozbalovátku zobrazit
        // tlačítka správy u kterékoli třídy. Server by zápis stejně odmítl
        // (politika can_manage_class), ale rozhraní slibovalo něco jiného.
        const myCls = (profile.user_class || '').trim().toLowerCase();
        return myCls.length > 0 && item.className.toLowerCase() === myCls;
      }
      return false;
    },
    [isPrivileged, profile]
  );

  /**
   * Dnešní datum v češtině.
   *
   * Přepočítává se každou minutu, ne jednou při připojení komponenty.
   * Informační tabule běžně visí na obrazovce v učebně celý den — po půlnoci
   * pak ukazovala včerejší datum jako „dnes“.
   */
  const [todayFormatted, setTodayFormatted] = useState(() => formatToday());
  useEffect(() => {
    const id = window.setInterval(() => setTodayFormatted(formatToday()), 60_000);
    return () => clearInterval(id);
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
      const result = await saveClassBoard(input, user?.email);
      reportWrite(result);
      const saved = result.item;
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
      reportWrite(await deleteClassBoard(deleteConfirmItem.id));
      setClasses((prev) => prev.filter((c) => c.id !== deleteConfirmItem.id));
      setDeleteConfirmItem(null);
    } catch (err) {
      console.error('[ClassBulletinBoard] Smazání třídy selhalo:', err);
      // Hlášení jde do stejného pruhu jako ostatní potíže se synchronizací,
      // ne do nativního alert(), který v PWA vypadá jako systémová chyba.
      setSyncNotice(
        `Třídu se nepodařilo smazat (${err instanceof Error ? err.message : String(err)}). ` +
          'Zkontrolujte připojení a zkuste to prosím znovu.'
      );
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
    reportWrite(await saveClassBoard(updated, user?.email));
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
    reportWrite(await saveClassBoard(updated, user?.email));
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
    reportWrite(await saveClassBoard(updated, user?.email));
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
    reportWrite(await saveClassBoard(updated, user?.email));
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
    reportWrite(await saveClassBoard(updated, user?.email));
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Celoškolní hlášení – uložení
  const handleSaveGlobalAnnouncement = async (item: Omit<GlobalAnnouncement, 'id' | 'updatedAt'> & { id?: string }) => {
    const result = await saveGlobalAnnouncement(item);
    reportWrite(result);
    const saved = result.item;
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
    reportWrite(await deleteGlobalAnnouncement(id));
    setGlobalAnnouncements((prev) => prev.filter((x) => x.id !== id));
    setDeleteAnnouncementId(null);
  };

  // Tisk rozvrhu.
  //
  // `printingItem` se po tisku musí uklidit — dřív zůstal nastavený navždy,
  // takže každý další Ctrl+P kdekoli v aplikaci vytiskl rozvrh té třídy.
  const handlePrintSchedule = (item: ClassBoardItem) => {
    setPrintingItem(item);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  useEffect(() => {
    if (!printingItem) return;
    const clear = () => setPrintingItem(null);
    window.addEventListener('afterprint', clear);
    // Záloha pro prohlížeče, které `afterprint` neposílají (starší WebKit).
    const fallback = window.setTimeout(clear, 20_000);
    return () => {
      window.removeEventListener('afterprint', clear);
      clearTimeout(fallback);
    };
  }, [printingItem]);

  // Klávesa Escape zavře JEN nejvýše položený dialog.
  //
  // Dřív procházela všechny podmínky bez `else`, takže jedno stisknutí zavřelo
  // všechno otevřené — kdo si nad rozepsanou třídou otevřel lightbox s
  // rozvrhem, přišel Escapem i o formulář.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;

      if (lightboxItem) setLightboxItem(null);
      else if (deleteAnnouncementId) setDeleteAnnouncementId(null);
      else if (deleteConfirmItem) setDeleteConfirmItem(null);
      else if (uniformModalItem) setUniformModalItem(null);
      else if (dutyModalItem) setDutyModalItem(null);
      else if (sectionModalItem) setSectionModalItem(null);
      else if (isGlobalAnnouncementModalOpen) setIsGlobalAnnouncementModalOpen(false);
      else if (isEditModalOpen) setIsEditModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    lightboxItem,
    isEditModalOpen,
    deleteConfirmItem,
    deleteAnnouncementId,
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

      {/* ─── Upozornění na nesesynchronizovaný obsah ──────────────────────── */}
      {syncNotice && (
        <div
          role="alert"
          aria-live="assertive"
          className="no-print flex items-start gap-3 bg-amber-50 dark:bg-amber-900/25 border border-amber-300 dark:border-amber-700/70 rounded-2xl px-4 py-3.5"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <CloudOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Nástěnka není sesynchronizovaná se serverem
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1 leading-snug">{syncNotice}</p>
            <button
              type="button"
              onClick={() => loadData()}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Zkusit načíst znovu
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSyncNotice(null)}
            aria-label="Skrýt upozornění"
            className="p-1.5 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── Záhlaví nástěnky s volbou „Moje třída" ───────────────────────── */}
      <header className="no-print bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            {/* Horní řádek: Pill ZOP + Volič „Moje třída" */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <School className="w-3.5 h-3.5" />
                <span>Základní odborná příprava (ZOP)</span>
              </div>

              {/* Výběr a propsání „Moje třída" */}
              <div className="relative" ref={classDropdownRef}>
                <button
                  onClick={() => setIsClassDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-400/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer shadow-sm"
                  title="Zvolit moji třídu"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Moje třída:</span>
                  <span className="text-white underline underline-offset-2">
                    {selectedMyClass || 'zatím nevybráno'}
                  </span>
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
                <span>Moje třída{selectedMyClass ? ` (${selectedMyClass})` : ''}</span>
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Hledání má smysl jen v mřížce všech tříd — v podrobném
                // přehledu jedné třídy nemělo pole žádný efekt a ukazatel
                // vedle něj hlásil „1 podrobná (X)“. Psaní teď na mřížku
                // samo přepne.
                if (e.target.value.trim() && viewMode !== 'grid') setViewMode('grid');
              }}
              placeholder="Hledat třídu, službu, osobu…"
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
            aria-label="Vymazat hledání"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Zobrazeno:</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-bold border border-slate-700">
              {viewMode === 'expanded'
                ? selectedMyClass
                  ? `1 podrobná (${selectedMyClass})`
                  : 'třída nevybrána'
                : /* Počítá se to, co je opravdu na obrazovce. Dřív se ukazoval
                     `filteredClasses.length`, do kterého se počítaly i skryté
                     třídy, takže číslo nesouhlasilo s počtem dlaždic. */
                  `${visibleGridClasses.length} z ${classes.length} tříd`}
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
                        onClick={() => setDeleteAnnouncementId(ann.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 cursor-pointer"
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
      {viewMode === 'expanded' && !loading && !myClassItem && (
        <section className="no-print bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <School className="w-6 h-6 text-slate-400" />
          </div>
          {classes.length === 0 ? (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Zatím není založená žádná třída
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                {isPrivileged
                  ? 'Třídu založíte tlačítkem „Přidat třídu" v záhlaví. Teprve potom si k ní posluchači mohou přiřadit sami sebe a lektoři k ní označit soubory.'
                  : 'Jakmile lektor založí vaši třídu, objeví se tady její rozvrh, ústrojová kázeň i služby.'}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Vyberte svou třídu
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                {selectedMyClass
                  ? `Třída „${selectedMyClass}" na nástěnce není — vyberte prosím svou třídu znovu v záhlaví u popisku „Moje třída".`
                  : 'Nahoře v záhlaví klepněte na „Moje třída" a zvolte tu svoji. Do té doby tu není co zobrazit — cizí třídu vám aplikace ukazovat nebude.'}
              </p>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Zobrazit všechny třídy
              </button>
            </>
          )}
        </section>
      )}

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
                onClick={() => setHiddenClassIds(clearHiddenClasses())}
                className="text-blue-500 hover:text-blue-400 font-semibold cursor-pointer"
              >
                Zobrazit všechny skryté třídy ({hiddenClassIds.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleGridClasses
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

      {/* ─── Potvrzení smazání celoškolního hlášení ──────────────────────── */}
      <ConfirmDialog
        isOpen={deleteAnnouncementId !== null}
        tone="danger"
        title="Smazat celoškolní hlášení?"
        description={
          <>
            Hlášení <strong>„{globalAnnouncements.find((a) => a.id === deleteAnnouncementId)?.title ?? ''}“</strong>{' '}
            zmizí všem posluchačům. Vrátit to zpět nelze — hlášení by se muselo napsat znovu.
          </>
        }
        confirmLabel="Smazat hlášení"
        onConfirm={() => {
          if (deleteAnnouncementId) void handleDeleteGlobalAnnouncement(deleteAnnouncementId);
        }}
        onCancel={() => setDeleteAnnouncementId(null)}
      />

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
