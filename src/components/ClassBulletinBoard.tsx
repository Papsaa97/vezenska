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
  UserCheck,
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
import ClassOverviewCard from './class-bulletin/ClassOverviewCard';
import ClassAssignmentPanel from './class-bulletin/ClassAssignmentPanel';
import {
  ChooseClassDialog,
  MEMBERSHIP_CHANGED_EVENT,
  announceMembershipChange,
} from './class-bulletin/ClassMembershipGate';
import {
  ClassOverview,
  MyMembership,
  fetchClassOverview,
  fetchMyMembership,
} from '../utils/classMembership';
import JidelnicekCard from './class-bulletin/JidelnicekCard';

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
  const { profile, user, realRole, refreshProfile } = useAuth();
  const isPrivileged = profile?.role === 'lektor' || profile?.role === 'admin';

  // Data
  /**
   * Plné nástěnky. Od migrace 038 vrátí server jen ty, ke kterým má účet
   * přístup: vlastní třídu, lektor a správce všechny.
   */
  const [classes, setClasses] = useState<ClassBoardItem[]>([]);
  /** Přehled všech tříd (název, termín, velitel, počet členů) — vidí každý. */
  const [overview, setOverview] = useState<ClassOverview[]>([]);
  /** Stav zařazení přihlášeného (čekající žádost, poznámka). */
  const [membership, setMembership] = useState<MyMembership | null>(null);
  const [isChooseClassOpen, setIsChooseClassOpen] = useState<boolean>(false);
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

  // Preference zobrazení.
  //
  // „Moje třída“ je od migrace 038 zařazení z profilu — student ani velitel ji
  // tady nepřepíná. Lektor a správce čtou všechny nástěnky, takže si
  // mohou vybrat, kterou zobrazit v podrobném přehledu; ta volba zůstává jen
  // v prohlížeči a do profilu se nezapisuje.
  const [staffViewClass, setStaffViewClass] = useState<string>(getMyClass);
  const selectedMyClass = isPrivileged
    ? staffViewClass || profile?.user_class || ''
    : profile?.user_class || '';
  const [hiddenClassIds, setHiddenClassIds] = useState<string[]>(getHiddenClassIds);
  const [viewMode, setViewMode] = useState<'expanded' | 'grid' | 'assignments'>('expanded');
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

  /**
   * Stav serveru, pro který už se jednou obnovoval profil.
   *
   * Zástupce velitele má `commandsClass` vyplněné, ale roli dál „student“ —
   * rozpor tak po obnovení profilu může trvat. Bez téhle pojistky by se profil
   * obnovoval při každém načtení nástěnky; takhle jen jednou na každou změnu.
   */
  const refreshedForRef = useRef<string | null>(null);

  // Načtení dat
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [classResult, announcementResult, overviewResult, membershipResult] = await Promise.all([
        fetchClassBoards(),
        fetchGlobalAnnouncements(),
        fetchClassOverview(),
        fetchMyMembership(),
      ]);
      // Záložní kopie z prohlížeče může pocházet z doby, kdy nástěnky četl
      // každý. Bez serveru se nečlenovi ukáže nanejvýš jeho vlastní třída.
      const ownClass = (profile?.user_class || '').trim().toLowerCase();
      setClasses(
        classResult.source === 'local' && !isPrivileged
          ? classResult.items.filter((c) => ownClass && c.className.trim().toLowerCase() === ownClass)
          : classResult.items
      );
      setGlobalAnnouncements(announcementResult.items);
      // Bez migrace 038 přehled chybí — pak se vystačí s plnými nástěnkami.
      setOverview(
        overviewResult.data ??
          classResult.items.map((c) => ({
            id: c.id,
            className: c.className,
            courseStartDate: c.courseStartDate ?? null,
            courseEndDate: c.courseEndDate ?? null,
            commanderName: null,
            deputyName: null,
            deputyUntil: null,
            memberCount: 0,
            updatedAt: c.updatedAt,
          }))
      );
      setMembership(membershipResult.data);

      // Profil v AuthContext se načítá jen při přihlášení. Schválí-li žádost
      // velitel, zařadí-li účet lektor nebo odvolá-li velitele, zůstane v něm
      // stará třída i role — stránka pak hlásí „Zatím nejste zařazeni“ a nabízí
      // tlačítko, které server odmítne, nebo odvolanému veliteli nechává
      // tlačítka správy. Server tu právě řekl, jak to je, tak se profil obnoví.
      const server = membershipResult.data;
      if (server) {
        const norm = (v: string | null | undefined) => (v || '').trim().toLowerCase();
        const classStale = norm(server.userClass) !== norm(profile?.user_class);
        const roleStale =
          (realRole === 'velitel_tridy' && !server.commandsClass) ||
          (realRole === 'student' && Boolean(server.commandsClass));
        const key = `${norm(server.userClass)}|${norm(server.commandsClass)}|${realRole ?? ''}|${norm(profile?.user_class)}`;
        if ((classStale || roleStale) && refreshedForRef.current !== key) {
          refreshedForRef.current = key;
          void refreshProfile();
        }
      }

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
  }, [profile?.user_class, isPrivileged, realRole, refreshProfile]);

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

  // Znovu načíst i po změně zařazení (přijatá nominace mění, čí nástěnku
  // server vůbec vydá) a po akci v jiné části aplikace.
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handler = () => void loadData();
    window.addEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
    return () => window.removeEventListener(MEMBERSHIP_CHANGED_EVENT, handler);
  }, [loadData]);

  /** Lektor/správce: kterou třídu ukázat v podrobném přehledu. Jen v prohlížeči. */
  const handleSelectViewClass = (className: string) => {
    setStaffViewClass(className);
    setMyClass(className);
    setIsClassDropdownOpen(false);
    setViewMode('expanded');
  };

  /** Seznam nezařazených vidí lektor, správce, velitel a jeho platný zástupce. */
  const canSeeAssignments =
    isPrivileged ||
    (profile?.role === 'velitel_tridy' && Boolean(profile?.user_class)) ||
    Boolean(membership?.commandsClass);

  /** Čekající žádost o třídu, pokud nějaká je. */
  const pendingRequest = membership?.pending.find((p) => p.kind === 'zadost') ?? null;
  const isUnassigned = !profile?.user_class;

  /** Jméno skutečného velitele třídy podle přehledu. */
  const overviewOf = useCallback(
    (className: string): ClassOverview | null =>
      overview.find((o) => o.className.toLowerCase() === className.toLowerCase()) ?? null,
    [overview]
  );

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

  /** Plná nástěnka k položce přehledu, má-li k ní účet přístup. */
  const fullBoardById = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  // Filtrované třídy pro mřížku. Mřížka stojí na přehledu, protože ten vidí
  // každý; plný obsah se u dlaždice ukáže jen tam, kde ho server vydal.
  const filteredClasses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return overview.filter((o) => {
      if (!q) return true;
      const full = fullBoardById.get(o.id);
      return (
        o.className.toLowerCase().includes(q) ||
        (o.commanderName || '').toLowerCase().includes(q) ||
        (full?.infoText || '').toLowerCase().includes(q) ||
        Boolean(full?.dutyRoster?.some((d) => d.title.toLowerCase().includes(q) || d.attendees?.toLowerCase().includes(q)))
      );
    });
  }, [overview, fullBoardById, searchQuery]);

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
      // Platný zástupce velitele má k nástěnce stejná práva (can_manage_class
      // v migraci 038); `commandsClass` počítá server včetně konce zástupcování.
      const leads = (membership?.commandsClass || '').trim().toLowerCase();
      return leads.length > 0 && item.className.toLowerCase() === leads;
    },
    [isPrivileged, profile, membership?.commandsClass]
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
      // Nová nebo přejmenovaná třída musí naskočit i v přehledu.
      if (reportWrite(result)) void loadData();
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
      if (reportWrite(await deleteClassBoard(deleteConfirmItem.id))) void loadData();
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

              {/* „Moje třída“ — zařazení z profilu, ne volba v prohlížeči */}
              {isPrivileged ? (
                <div className="relative" ref={classDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsClassDropdownOpen((prev) => !prev)}
                    aria-expanded={isClassDropdownOpen}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-400/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer shadow-sm"
                    title="Kterou třídu zobrazit v podrobném přehledu"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Zobrazená třída:</span>
                    <span className="text-white underline underline-offset-2">
                      {selectedMyClass || 'zatím nevybráno'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isClassDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isClassDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                      <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Zobrazit nástěnku třídy
                      </div>
                      {classes.map((cls) => (
                        <button
                          type="button"
                          key={cls.id}
                          onClick={() => handleSelectViewClass(cls.className)}
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
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-400/40 text-amber-200 text-xs font-bold shadow-sm">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Moje třída:</span>
                  <span className="text-white">
                    {profile?.user_class
                      ? profile.user_class
                      : pendingRequest
                      ? `${pendingRequest.className} (čeká na schválení)`
                      : 'nezařazen(a)'}
                  </span>
                  {profile?.role === 'velitel_tridy' && (
                    <span className="ml-1 px-1.5 py-0.2 rounded bg-purple-600/60 text-purple-200 text-[10px]">
                      Velitel
                    </span>
                  )}
                </div>
              )}
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

              {canSeeAssignments && (
                <button
                  type="button"
                  onClick={() => setViewMode('assignments')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'assignments'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Nezařazení uživatelé, žádosti a nominace"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Zařazení</span>
                </button>
              )}
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
              {viewMode === 'assignments'
                ? 'zařazení do tříd'
                : viewMode === 'expanded'
                ? selectedMyClass
                  ? `1 podrobná (${selectedMyClass})`
                  : 'třída nevybrána'
                : /* Počítá se to, co je opravdu na obrazovce. Dřív se ukazoval
                     `filteredClasses.length`, do kterého se počítaly i skryté
                     třídy, takže číslo nesouhlasilo s počtem dlaždic. */
                  `${visibleGridClasses.length} z ${overview.length} tříd`}
            </span>
          </div>
        </div>
      </header>

      {/* ─── Jídelníček ──────────────────────────────────────────────────── */}
      <JidelnicekCard canEdit={isPrivileged} />

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
          {overview.length === 0 ? (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Zatím není založená žádná třída
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                {isPrivileged
                  ? 'Třídu založíte tlačítkem „Přidat třídu" v záhlaví. Teprve potom do ní půjde zařazovat posluchače a lektoři k ní budou moct označit soubory.'
                  : 'Jakmile lektor založí vaši třídu, objeví se tady její rozvrh, ústrojová kázeň i služby.'}
              </p>
            </>
          ) : isPrivileged ? (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vyberte třídu</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                V záhlaví u popisku „Zobrazená třída" zvolte, čí nástěnku chcete vidět.
              </p>
            </>
          ) : isUnassigned ? (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {pendingRequest ? `Žádost o třídu ${pendingRequest.className} čeká na schválení` : 'Zatím nejste zařazeni do třídy'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                {pendingRequest
                  ? 'Jakmile ji velitel třídy (nebo lektor) schválí, uvidíte tady rozvrh, ústroj i služby své třídy. Dostanete o tom oznámení.'
                  : membership?.note
                  ? `Vaše poznámka: „${membership.note}". Až bude vaše třída založená, velitel vás označí nebo si o ni požádáte sami. Nástěnky tříd vidí jen jejich členové, ostatním se ukazuje přehled.`
                  : 'Nástěnky tříd vidí jen jejich členové. Požádejte o zařazení do své třídy.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChooseClassOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  {pendingRequest ? 'Změnit žádost' : 'Požádat o zařazení'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold cursor-pointer"
                >
                  Přehled všech tříd
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Nástěnku třídy {profile?.user_class} se nepodařilo načíst
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                Třída mohla být přejmenována nebo smazána. Zkuste nástěnku obnovit; pokud to nepomůže, obraťte se na lektora.
              </p>
            </>
          )}
        </section>
      )}

      {viewMode === 'expanded' && myClassItem && (
        <section className="no-print space-y-6">
          <ClassDetailExpanded
            item={myClassItem}
            commanderName={overviewOf(myClassItem.className)?.commanderName ?? null}
            deputyName={overviewOf(myClassItem.className)?.deputyName ?? null}
            deputyUntil={overviewOf(myClassItem.className)?.deputyUntil ?? null}
            isMyClass={myClassItem.className.toLowerCase() === (profile?.user_class || '').toLowerCase()}
            isManager={checkCanManageClass(myClassItem)}
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
            {visibleGridClasses.map((entry) => {
              const item = fullBoardById.get(entry.id);
              const isMine = entry.className.toLowerCase() === (profile?.user_class || '').toLowerCase();
              // Bez plné nástěnky (cizí třída) jen přehled. Obsah posílá
              // server jen členům, lektorům a správcům — tady se nic neskrývá
              // navíc, jen se nemá co ukázat.
              if (!item) {
                return (
                  <ClassOverviewCard
                    key={entry.id}
                    item={entry}
                    canRequest={isUnassigned && !isPrivileged}
                    isRequested={pendingRequest?.className.toLowerCase() === entry.className.toLowerCase()}
                    onRequest={() => setIsChooseClassOpen(true)}
                    onToggleHide={() => handleToggleHideClass(entry.id)}
                  />
                );
              }
              return (
                <ClassCardCompact
                  key={item.id}
                  item={item}
                  commanderName={entry.commanderName}
                  deputyName={entry.deputyName}
                  memberCount={entry.memberCount}
                  isMyClass={isMine}
                  isManager={checkCanManageClass(item)}
                  isPrivileged={isPrivileged}
                  formatUpdateTime={formatUpdateTime}
                  onSelectAsMyClass={isPrivileged ? () => handleSelectViewClass(item.className) : undefined}
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
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Zařazení do tříd (velitel, lektor, správce) ─────────────────── */}
      {viewMode === 'assignments' && canSeeAssignments && <ClassAssignmentPanel classes={overview} leadsClass={membership?.commandsClass ?? null} />}

      {/* ─── Žádost o zařazení (nezařazený student) ──────────────────────── */}
      {isChooseClassOpen && (
        <ChooseClassDialog
          classes={overview}
          onCancel={() => setIsChooseClassOpen(false)}
          onDone={() => {
            setIsChooseClassOpen(false);
            announceMembershipChange();
          }}
        />
      )}

      {/* ─── Modální formulář pro třídu ──────────────────────────────────── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <ClassEditModal
            item={editingItem}
            canRename={isPrivileged}
            canUploadSchedule={isPrivileged || profile?.role === 'velitel_tridy'}
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
