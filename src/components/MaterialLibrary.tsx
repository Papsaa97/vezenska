import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  FileText,
  FileType2,
  Image as ImageIcon,
  Presentation,
  Download,
  Eye,
  RefreshCw,
  Search,
  FolderOpen,
  AlertCircle,
  Loader2,
  Printer,
  Users,
} from 'lucide-react';
import PrintHeader from './common/PrintHeader';
import FileViewerModal from './common/FileViewerModal';
import { useTaggedMaterials } from '../hooks/useTaggedMaterials';
import { useMaterialTagOptions } from '../hooks/useMaterialTagOptions';
import {
  TaggedMaterial,
  downloadMaterial,
  formatFileSize,
  getFileKind,
  getFileTypeLabel,
} from '../utils/materials';

const UNSORTED = 'Nezařazené';

function getFileIcon(material: TaggedMaterial): React.ReactElement {
  switch (getFileKind(material.mimeType, material.name)) {
    case 'pdf':
      return <FileText className="w-8 h-8 text-red-500 shrink-0" />;
    case 'word':
      return <FileType2 className="w-8 h-8 text-blue-500 shrink-0" />;
    case 'presentation':
      return <Presentation className="w-8 h-8 text-orange-500 shrink-0" />;
    case 'image':
      return <ImageIcon className="w-8 h-8 text-emerald-500 shrink-0" />;
    default:
      return <FileText className="w-8 h-8 text-slate-400 shrink-0" />;
  }
}

function typeBadgeColor(material: TaggedMaterial): string {
  switch (getFileKind(material.mimeType, material.name)) {
    case 'pdf':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    case 'word':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'presentation':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'image':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  }
}

function pluralFiles(count: number): string {
  if (count === 1) return 'soubor';
  if (count < 5) return 'soubory';
  return 'souborů';
}

/**
 * Knihovna studijních souborů.
 *
 * Soubory se sem řadí podle štítků, které jim lektor dal ve správci souborů —
 * jeden soubor tak může být u Práva i u Penologie zároveň a navíc patřit
 * konkrétní třídě. Starší soubory bez štítků se zařadí podle složky, ve které
 * ve Storage leží, takže se z knihovny nic neztratilo.
 */
export default function MaterialLibrary() {
  const { materials, loading, error, tagsError, reload } = useTaggedMaterials();
  const { subjectOptions, classOptions, classNameById } = useMaterialTagOptions(false);

  const [activeSubject, setActiveSubject] = useState<string>('Vše');
  const [activeClassId, setActiveClassId] = useState<string>('Vše');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingName, setDownloadingName] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [viewed, setViewed] = useState<TaggedMaterial | null>(null);

  const handleDownload = async (material: TaggedMaterial) => {
    setDownloadingName(material.name);
    setDownloadError(await downloadMaterial(material));
    setDownloadingName(null);
  };

  /** Předměty, u kterých opravdu nějaký soubor je — jiné filtrovat nemá smysl. */
  const presentSubjects = useMemo(() => {
    const present = new Set<string>();
    for (const material of materials) {
      for (const subject of material.subjects) present.add(subject);
    }

    const ordered = subjectOptions
      .map((option) => option.value)
      .filter((value) => present.has(value));

    // Štítek předmětu, který mezitím zmizel ze seznamu předmětů, by jinak
    // soubory schoval — připojí se na konec, ať zůstanou dohledatelné.
    const extra = Array.from(present).filter((value) => !ordered.includes(value)).sort((a, b) => a.localeCompare(b, 'cs'));

    return [...ordered, ...extra];
  }, [materials, subjectOptions]);

  const presentClasses = useMemo(() => {
    const present = new Set<string>();
    for (const material of materials) {
      for (const classId of material.classIds) present.add(classId);
    }
    return classOptions.filter((option) => present.has(option.value));
  }, [materials, classOptions]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materials.filter((material) => {
      const matchSubject =
        activeSubject === 'Vše' ||
        (activeSubject === UNSORTED
          ? material.subjects.length === 0
          : material.subjects.includes(activeSubject));
      const matchClass = activeClassId === 'Vše' || material.classIds.includes(activeClassId);
      const matchSearch =
        !q ||
        material.displayName.toLowerCase().includes(q) ||
        material.subjects.some((s) => s.toLowerCase().includes(q));
      return matchSubject && matchClass && matchSearch;
    });
  }, [materials, activeSubject, activeClassId, searchQuery]);

  /** Sekce k vykreslení: předmět → soubory. Soubor s více štítky je ve všech. */
  const sections = useMemo(() => {
    const groups: { subject: string; items: TaggedMaterial[] }[] = [];

    for (const subject of presentSubjects) {
      const items = filtered.filter((m) => m.subjects.includes(subject));
      if (items.length > 0) groups.push({ subject, items });
    }

    const unsorted = filtered.filter((m) => m.subjects.length === 0);
    if (unsorted.length > 0) groups.push({ subject: UNSORTED, items: unsorted });

    return groups;
  }, [filtered, presentSubjects]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8">
      <FileViewerModal material={viewed} isOpen={Boolean(viewed)} onClose={() => setViewed(null)} />

      {/* Tisková hlavička – viditelná pouze při tisku */}
      <PrintHeader
        subject="Knihovna studijních materiálů"
        docTitle={`Katalog výukových podkladů a předpisů (Filtr: ${activeSubject})`}
        subtext="Akademie Vězeňské služby ČR – Interní studijní materiály"
      />

      {/* Header na obrazovce */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Knihovna materiálů</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Studijní podklady k otevření v aplikaci i ke stažení
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={loading || materials.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            title="Vytisknout katalog studijních materiálů nebo uložit do PDF"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Tisk / PDF
          </button>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative no-print">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <label className="sr-only" htmlFor="material-library-search">
          Hledat materiál
        </label>
        <input
          id="material-library-search"
          type="text"
          placeholder="Hledat materiál…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </div>

      {/* Filtr podle předmětu */}
      <div className="flex flex-wrap gap-2 no-print">
        {(['Vše', ...presentSubjects, ...(materials.some((m) => m.subjects.length === 0) ? [UNSORTED] : [])]).map(
          (subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setActiveSubject(subject)}
              aria-pressed={activeSubject === subject}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeSubject === subject
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300'
              }`}
            >
              {subject}
            </button>
          )
        )}
      </div>

      {/* Filtr podle třídy — jen když jsou soubory nějaké třídě přiřazené */}
      {presentClasses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 no-print">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            Třída
          </span>
          {(['Vše', ...presentClasses.map((c) => c.value)]).map((classId) => (
            <button
              key={classId}
              type="button"
              onClick={() => setActiveClassId(classId)}
              aria-pressed={activeClassId === classId}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeClassId === classId
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              {classId === 'Vše' ? 'Vše' : classNameById(classId) ?? classId}
            </button>
          ))}
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 no-print">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm">Načítám materiály…</span>
        </div>
      )}

      {!loading && (error || downloadError) && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl text-red-700 dark:text-red-300 text-sm no-print">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error ?? downloadError}
        </div>
      )}

      {!loading && !error && tagsError && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl text-amber-800 dark:text-amber-300 text-xs no-print">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {tagsError} Soubory se zatím řadí podle složek.
        </div>
      )}

      {!loading && !error && materials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 no-print">
          <FolderOpen className="w-14 h-14 opacity-30" />
          <div className="text-center">
            <div className="font-semibold text-slate-500 dark:text-slate-400">Žádné materiály k zobrazení</div>
            <div className="text-xs mt-1">Lektoři mohou přidávat materiály v sekci „Správa obsahu".</div>
          </div>
        </div>
      )}

      {!loading && !error && materials.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 no-print">
          <Search className="w-10 h-10 opacity-30" />
          <span className="text-sm">Žádné výsledky pro zvolený filtr</span>
        </div>
      )}

      {!loading && !error && sections.length > 0 && (
        <AnimatePresence>
          <div className="space-y-8">
            {sections.map((section) => (
              <motion.section
                key={section.subject}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="print-avoid-break"
              >
                <div className="flex items-center gap-2 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold border bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-400/30">
                    {section.subject}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {section.items.length} {pluralFiles(section.items.length)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-1 print:gap-2">
                  {section.items.map((material) => {
                    const isDownloading = downloadingName === material.name;
                    return (
                      <div
                        key={`${section.subject}-${material.name}`}
                        className="print-card flex items-center gap-3 p-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                      >
                        <div className="print:hidden">{getFileIcon(material)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-slate-900 dark:text-white truncate print:whitespace-normal">
                            {material.displayName}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeBadgeColor(material)}`}>
                              {getFileTypeLabel(material.mimeType, material.name)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {formatFileSize(material.size)}
                            </span>
                            {material.classIds.map((classId) => {
                              const label = classNameById(classId);
                              if (!label) return null;
                              return (
                                <span
                                  key={classId}
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                >
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="no-print flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewed(material)}
                            aria-label={`Otevřít ${material.displayName} v aplikaci`}
                            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
                            title="Otevřít v aplikaci"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(material)}
                            disabled={isDownloading}
                            aria-label={`Stáhnout ${material.displayName}`}
                            className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 border border-indigo-200 dark:border-indigo-700 transition-all cursor-pointer disabled:opacity-50"
                            title="Stáhnout"
                          >
                            {isDownloading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
