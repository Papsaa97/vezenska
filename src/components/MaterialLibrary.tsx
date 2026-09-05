import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  FileText,
  FileType2,
  Presentation,
  Download,
  RefreshCw,
  Search,
  FolderOpen,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MaterialSubject =
  | 'ZOP'
  | 'Taktika'
  | 'Penologie'
  | 'Zbraně'
  | 'Právo'
  | 'Etika'
  | 'Administrativa'
  | 'Ostatní';

export interface StudyMaterial {
  name: string;
  displayName: string;
  subject: MaterialSubject;
  size: number;
  createdAt: string;
  mimeType: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET = 'studijni-materialy';

const SUBJECT_COLORS: Record<MaterialSubject, string> = {
  ZOP:           'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/30',
  Taktika:       'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/30',
  Penologie:     'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30',
  'Zbraně':      'bg-red-500/15 text-red-700 dark:text-red-300 border-red-400/30',
  'Právo':       'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-400/30',
  Etika:         'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/30',
  Administrativa:'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/30',
  'Ostatní':     'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-400/30',
};

const ALL_SUBJECTS: MaterialSubject[] = [
  'ZOP', 'Taktika', 'Penologie', 'Zbraně', 'Právo', 'Etika', 'Administrativa', 'Ostatní',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type StorageObjMeta = { size?: number; mimetype?: string; lastModified?: string } | null;

function getFileIcon(mimeType: string): React.ReactElement {
  if (mimeType.includes('pdf')) {
    return <FileText className="w-8 h-8 text-red-500 shrink-0" />;
  }
  if (
    mimeType.includes('word') ||
    mimeType.includes('docx') ||
    mimeType.includes('officedocument.wordprocessingml')
  ) {
    return <FileType2 className="w-8 h-8 text-blue-500 shrink-0" />;
  }
  if (
    mimeType.includes('presentation') ||
    mimeType.includes('pptx') ||
    mimeType.includes('officedocument.presentationml')
  ) {
    return <Presentation className="w-8 h-8 text-orange-500 shrink-0" />;
  }
  return <FileText className="w-8 h-8 text-slate-400 shrink-0" />;
}

function getFileTypeBadge(mimeType: string): { label: string; color: string } {
  if (mimeType.includes('pdf')) {
    return { label: 'PDF', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
  }
  if (
    mimeType.includes('word') ||
    mimeType.includes('docx') ||
    mimeType.includes('officedocument.wordprocessingml')
  ) {
    return { label: 'DOCX', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
  }
  if (
    mimeType.includes('presentation') ||
    mimeType.includes('pptx') ||
    mimeType.includes('officedocument.presentationml')
  ) {
    return { label: 'PPTX', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' };
  }
  return { label: 'FILE', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Zpětná mapa: ASCII slug složky → MaterialSubject pro zobrazení */
const SLUG_TO_SUBJECT: Record<string, MaterialSubject> = {
  zop:            'ZOP',
  taktika:        'Taktika',
  penologie:      'Penologie',
  zbrane:         'Zbraně',
  pravo:          'Právo',
  etika:          'Etika',
  administrativa: 'Administrativa',
  ostatni:        'Ostatní',
};

/** Slugy složek odpovídající ALL_SUBJECTS (ve stejném pořadí) */
const SUBJECT_SLUGS: string[] = [
  'zop', 'taktika', 'penologie', 'zbrane', 'pravo', 'etika', 'administrativa', 'ostatni',
];

function parseMaterial(obj: { name: string; metadata: StorageObjMeta }): StudyMaterial {
  const pathParts = obj.name.split('/');
  const folder = pathParts[0];
  const fileName = pathParts[pathParts.length - 1];

  // displayName: část před posledním '__'; pokud oddělovač chybí, použij název bez přípony
  const underscoreIdx = fileName.lastIndexOf('__');
  const displayName =
    underscoreIdx !== -1
      ? fileName.slice(0, underscoreIdx)   // čistý ASCII text (bez URL-encodingu)
      : fileName.replace(/\.[^.]+$/, '');

  // Rozpoznej předmět přes slug → MaterialSubject; fallback na 'Ostatní'
  const subject: MaterialSubject = SLUG_TO_SUBJECT[folder] ?? 'Ostatní';

  return {
    name: obj.name,
    displayName,
    subject,
    size: obj.metadata?.size ?? 0,
    createdAt: obj.metadata?.lastModified ?? new Date().toISOString(),
    mimeType: obj.metadata?.mimetype ?? 'application/octet-stream',
  };
}


// ─── Component ────────────────────────────────────────────────────────────────

export default function MaterialLibrary() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<MaterialSubject | 'Vše'>('Vše');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingName, setDownloadingName] = useState<string | null>(null);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allFiles: StudyMaterial[] = [];

      // Iteruj přes ASCII-safe slugy složek (ne původní názvy s diakritikou)
      for (const slug of SUBJECT_SLUGS) {
        const { data, error: listError } = await supabase.storage
          .from(BUCKET)
          .list(slug, { limit: 200, sortBy: { column: 'name', order: 'asc' } });

        if (listError) continue;

        if (data) {
          for (const obj of data) {
            if (obj.name === '.emptyFolderPlaceholder') continue;
            allFiles.push(
              parseMaterial({
                name: `${slug}/${obj.name}`,
                metadata: obj.metadata as StorageObjMeta,
              })
            );
          }
        }
      }

      setMaterials(allFiles);
    } catch (err) {
      setError('Nepodařilo se načíst materiály. Zkontrolujte připojení.');
      console.error('[MaterialLibrary]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const handleDownload = async (material: StudyMaterial) => {
    setDownloadingName(material.name);
    try {
      const { data, error: dlError } = await supabase.storage
        .from(BUCKET)
        .download(material.name);

      if (dlError || !data) {
        alert('Stahování selhalo: ' + (dlError?.message ?? 'Neznámá chyba'));
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      const ext = material.name.split('.').pop() ?? 'bin';
      a.download = `${material.displayName}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingName(null);
    }
  };

  const filtered = materials.filter((m) => {
    const matchSubject = activeSubject === 'Vše' || m.subject === activeSubject;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q || m.displayName.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
    return matchSubject && matchSearch;
  });

  const grouped = ALL_SUBJECTS.reduce<Record<MaterialSubject, StudyMaterial[]>>((acc, subj) => {
    acc[subj] = filtered.filter((m) => m.subject === subj);
    return acc;
  }, {} as Record<MaterialSubject, StudyMaterial[]>);

  const visibleSubjects = ALL_SUBJECTS.filter((s) => grouped[s].length > 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Knihovna materiálů</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Studijní podklady ke stažení</p>
          </div>
        </div>
        <button
          onClick={loadMaterials}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Obnovit
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Hledat materiál…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
      </div>

      {/* Subject filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['Vše', ...ALL_SUBJECTS] as (MaterialSubject | 'Vše')[]).map((subj) => (
          <button
            key={subj}
            onClick={() => setActiveSubject(subj)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeSubject === subj
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/25'
                : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm">Načítám materiály…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && materials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
          <FolderOpen className="w-14 h-14 opacity-30" />
          <div className="text-center">
            <div className="font-semibold text-slate-500 dark:text-slate-400">Žádné materiály k zobrazení</div>
            <div className="text-xs mt-1">Lektoři mohou přidávat materiály v sekci „Správa obsahu".</div>
          </div>
        </div>
      )}

      {!loading && !error && materials.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Search className="w-10 h-10 opacity-30" />
          <span className="text-sm">Žádné výsledky pro „{searchQuery}"</span>
        </div>
      )}

      {!loading && !error && visibleSubjects.length > 0 && (
        <AnimatePresence>
          <div className="space-y-8">
            {visibleSubjects.map((subject) => (
              <motion.section
                key={subject}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${SUBJECT_COLORS[subject]}`}>
                    {subject}
                  </span>
                  <span className="text-xs text-slate-400">{grouped[subject].length} souborů</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grouped[subject].map((material) => {
                    const typeBadge = getFileTypeBadge(material.mimeType);
                    const isDownloading = downloadingName === material.name;
                    return (
                      <div
                        key={material.name}
                        className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                      >
                        {getFileIcon(material.mimeType)}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {material.displayName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {formatFileSize(material.size)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(material)}
                          disabled={isDownloading}
                          className="shrink-0 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 border border-indigo-200 dark:border-indigo-700 transition-all cursor-pointer disabled:opacity-50"
                          title="Stáhnout"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
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
