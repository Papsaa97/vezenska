import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings2,
  Upload,
  Trash2,
  FileText,
  FileType2,
  Presentation,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FolderOpen,
  CloudUpload,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { StudyMaterial, MaterialSubject } from './MaterialLibrary';
import QuestionBankManager from './QuestionBankManager';

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET = 'studijni-materialy';

const ALL_SUBJECTS: MaterialSubject[] = [
  'ZOP', 'Taktika', 'Penologie', 'Zbraně', 'Právo', 'Etika', 'Administrativa', 'Ostatní',
];

const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const ALLOWED_EXT_LABEL = '.pdf, .docx, .pptx';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type StorageObjMeta = { size?: number; mimetype?: string; lastModified?: string } | null;

/**
 * Převede libovolný řetězec na ASCII-safe slug použitelný jako klíč v Supabase Storage.
 * Příklad: "Ostatní" → "ostatni", "Právo & Etika" → "pravo-etika"
 */
function sanitizePath(input: string): string {
  return input
    .normalize('NFD')                        // rozloží diakritiku na základní znak + kombinující znak
    .replace(/[\u0300-\u036f]/g, '')         // odstraní kombinující znaky (háčky, čárky…)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')         // nepovolené znaky → pomlčka
    .replace(/^-+|-+$/g, '');               // ořízne krajní pomlčky
}

/** Mapa zobrazovaného názvu předmětu → slug použitý jako název složky ve Storage */
const SUBJECT_SLUG_MAP: Record<MaterialSubject, string> = {
  ZOP: 'zop',
  Taktika: 'taktika',
  Penologie: 'penologie',
  Zbraně: 'zbrane',
  Právo: 'pravo',
  Etika: 'etika',
  Administrativa: 'administrativa',
  Ostatní: 'ostatni',
};

/** Zpětná mapa: slug → MaterialSubject */
const SLUG_TO_SUBJECT: Record<string, MaterialSubject> = Object.fromEntries(
  (Object.entries(SUBJECT_SLUG_MAP) as [MaterialSubject, string][]).map(([k, v]) => [v, k])
);

function parseMaterial(obj: { name: string; metadata: StorageObjMeta }): StudyMaterial {
  const pathParts = obj.name.split('/');
  const folder = pathParts[0];
  const fileName = pathParts[pathParts.length - 1];

  // displayName: část před posledním '__'; pokud oddělovač chybí, použij název bez přípony
  const underscoreIdx = fileName.lastIndexOf('__');
  const displayName =
    underscoreIdx !== -1
      ? fileName.slice(0, underscoreIdx)          // čistý ASCII text (bez URL-encodingu)
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


function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string): React.ReactElement {
  if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500 shrink-0" />;
  if (mimeType.includes('word') || mimeType.includes('wordprocessingml'))
    return <FileType2 className="w-5 h-5 text-blue-500 shrink-0" />;
  if (mimeType.includes('presentation') || mimeType.includes('presentationml'))
    return <Presentation className="w-5 h-5 text-orange-500 shrink-0" />;
  return <FileText className="w-5 h-5 text-slate-400 shrink-0" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContentManager() {
  const { profile } = useAuth();

  // Guard: only lektor or admin
  if (!profile || (profile.role !== 'lektor' && profile.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <ShieldAlert className="w-12 h-12 text-amber-500 opacity-60" />
        <div className="text-center">
          <div className="font-bold text-slate-700 dark:text-slate-300">Přístup odepřen</div>
          <div className="text-sm mt-1">Tato sekce je dostupná pouze pro lektory a správce.</div>
        </div>
      </div>
    );
  }

  return <ContentManagerInner />;
}

function ContentManagerInner() {
  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<'materials' | 'questions'>('materials');

  // ── Upload form state ──
  const [selectedSubject, setSelectedSubject] = useState<MaterialSubject>('ZOP');
  const [displayName, setDisplayName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── List state ──
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadMaterials = useCallback(async () => {
    setListLoading(true);
    try {
      const allFiles: StudyMaterial[] = [];
      // Iteruj přes ASCII-safe slugy složek (ne původní názvy s diakritikou)
      for (const slug of Object.values(SUBJECT_SLUG_MAP)) {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list(slug, { limit: 200, sortBy: { column: 'name', order: 'asc' } });
        if (error || !data) continue;
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
      setMaterials(allFiles);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // ── File picking ──

  const pickFile = (file: File) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      setUploadMsg({ type: 'error', text: `Nepodporovaný typ souboru. Povoleno: ${ALLOWED_EXT_LABEL}` });
      return;
    }
    setSelectedFile(file);
    setUploadMsg(null);
    if (!displayName) {
      setDisplayName(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
  };

  // ── Upload ──

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !displayName.trim()) return;

    setUploading(true);
    setUploadMsg(null);

    const ext = selectedFile.name.split('.').pop() ?? 'bin';
    // Sanitizuj displayName i slug předmětu → ASCII-safe klíče pro Supabase Storage
    const safeName = sanitizePath(displayName.trim());
    const subjectSlug = SUBJECT_SLUG_MAP[selectedSubject];
    const timestamp = Date.now();
    const storagePath = `${subjectSlug}/${safeName}__${timestamp}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, selectedFile, {
        contentType: selectedFile.type,
        upsert: false,
      });

    if (error) {
      setUploadMsg({ type: 'error', text: `Nahrání selhalo: ${error.message}` });
    } else {
      setUploadMsg({ type: 'success', text: `Soubor „${displayName}" byl úspěšně nahrán.` });
      setSelectedFile(null);
      setDisplayName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadMaterials();
    }
    setUploading(false);
  };

  // ── Delete ──

  const handleDelete = async (storageName: string) => {
    setDeletingName(storageName);
    const { error } = await supabase.storage.from(BUCKET).remove([storageName]);
    if (error) {
      alert('Smazání selhalo: ' + error.message);
    } else {
      setMaterials((prev) => prev.filter((m) => m.name !== storageName));
    }
    setDeletingName(null);
    setConfirmDelete(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
          <Settings2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Správa obsahu</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Nahrávání a správa studijních materiálů a testových otázek</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'materials'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-emerald-500" />
          Studijní materiály
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-blue-500" />
          Banka otázek
        </button>
      </div>

      {activeTab === 'questions' && <QuestionBankManager />}

      {activeTab === 'materials' && (
        <>
      {/* ── Upload form ── */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-500" />
          Nahrát nový materiál
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Subject select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Předmět *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as MaterialSubject)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Název materiálu *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Zákon č. 555/1992 Sb. – úplné znění"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          {/* Drag & drop zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Soubor * <span className="font-normal text-slate-400">({ALLOWED_EXT_LABEL})</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileInput}
                className="hidden"
              />
              {selectedFile ? (
                <>
                  {getFileIcon(selectedFile.type)}
                  <div className="text-center">
                    <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{selectedFile.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{formatFileSize(selectedFile.size)}</div>
                  </div>
                  <span className="text-xs text-slate-400">Kliknutím vyměnit soubor</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Přetáhněte soubor sem
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">nebo klikněte pro výběr</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Upload message */}
          <AnimatePresence>
            {uploadMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                  uploadMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
                }`}
              >
                {uploadMsg.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />}
                {uploadMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading || !selectedFile || !displayName.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-emerald-500/25"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Nahrávám…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Nahrát materiál
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Existing materials list ── */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-indigo-500" />
          Nahrané materiály
          {!listLoading && (
            <span className="font-normal text-slate-400 text-xs">({materials.length})</span>
          )}
        </h3>

        {listLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Načítám…
          </div>
        )}

        {!listLoading && materials.length === 0 && (
          <div className="text-sm text-slate-400 py-6 text-center">
            Zatím nejsou nahrány žádné materiály.
          </div>
        )}

        {!listLoading && materials.length > 0 && (
          <div className="space-y-2">
            {materials.map((material) => {
              const isDeleting = deletingName === material.name;
              const isConfirming = confirmDelete === material.name;
              return (
                <div
                  key={material.name}
                  className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl"
                >
                  {getFileIcon(material.mimeType)}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {material.displayName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {material.subject} · {formatFileSize(material.size)}
                    </div>
                  </div>

                  {/* Delete controls */}
                  {isConfirming ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-red-600 dark:text-red-400 font-semibold">Opravdu smazat?</span>
                      <button
                        onClick={() => handleDelete(material.name)}
                        disabled={isDeleting}
                        className="px-2.5 py-1 text-xs rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ano'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all cursor-pointer"
                      >
                        Zrušit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(material.name)}
                      className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                      title="Smazat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
