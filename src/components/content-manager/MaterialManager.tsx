import React, { useId, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  Download,
  Eye,
  FileText,
  FileType2,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Presentation,
  RefreshCw,
  Search,
  Tags,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTaggedMaterials } from '../../hooks/useTaggedMaterials';
import { useMaterialTagOptions } from '../../hooks/useMaterialTagOptions';
import MaterialTagPicker from '../common/MaterialTagPicker';
import FileViewerModal from '../common/FileViewerModal';
import {
  ALLOWED_UPLOAD_EXT_LABEL,
  ALLOWED_UPLOAD_MIME,
  TaggedMaterial,
  deleteMaterial,
  downloadMaterial,
  formatFileSize,
  getFileKind,
  invalidateMaterialsCache,
  saveMaterialTags,
  uploadMaterial,
} from '../../utils/materials';

interface QueuedFile {
  key: string;
  file: File;
  displayName: string;
}

function fileIcon(mimeType: string, name = ''): React.ReactElement {
  switch (getFileKind(mimeType, name)) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500 shrink-0" />;
    case 'word':
      return <FileType2 className="w-5 h-5 text-blue-500 shrink-0" />;
    case 'presentation':
      return <Presentation className="w-5 h-5 text-orange-500 shrink-0" />;
    case 'image':
      return <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" />;
    default:
      return <FileText className="w-5 h-5 text-slate-400 shrink-0" />;
  }
}

/**
 * Správce souborů.
 *
 * Proti původní podobě se změnilo hlavně tohle: soubor už nepatří do jedné
 * složky podle předmětu, ale nese štítky — libovolně mnoho předmětů a tříd
 * najednou. Štítky se dají nastavit při nahrávání i kdykoli potom, jednomu
 * souboru i celému výběru. Podle nich se soubory objevují v detailu předmětu
 * a na nástěnce třídy.
 */
export default function MaterialManager() {
  const fieldIds = useId();
  const { profile } = useAuth();
  const { materials, loading, error, tagsError, reload } = useTaggedMaterials();
  const { subjectOptions, classOptions, classNameById } = useMaterialTagOptions();

  // ── Nahrávání ──
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [batchSubjects, setBatchSubjects] = useState<string[]>([]);
  const [batchClassIds, setBatchClassIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Seznam a úpravy ──
  const [search, setSearch] = useState('');
  const [onlyUntagged, setOnlyUntagged] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubjects, setEditSubjects] = useState<string[]>([]);
  const [editClassIds, setEditClassIds] = useState<string[]>([]);
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [bulkSubjects, setBulkSubjects] = useState<string[]>([]);
  const [bulkClassIds, setBulkClassIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewed, setViewed] = useState<TaggedMaterial | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return materials
      .filter((m) => (onlyUntagged ? m.subjects.length === 0 && m.classIds.length === 0 : true))
      .filter((m) => {
        if (!q) return true;
        return (
          m.displayName.toLowerCase().includes(q) ||
          m.subjects.some((s) => s.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'cs'));
  }, [materials, search, onlyUntagged]);

  const untaggedCount = useMemo(
    () => materials.filter((m) => m.subjects.length === 0 && m.classIds.length === 0).length,
    [materials]
  );

  // ── Výběr souborů k nahrání ──

  const enqueue = (files: FileList | File[]) => {
    const accepted: QueuedFile[] = [];
    const rejected: string[] = [];

    for (const file of Array.from(files)) {
      if (!ALLOWED_UPLOAD_MIME.includes(file.type)) {
        rejected.push(file.name);
        continue;
      }
      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        displayName: file.name.replace(/\.[^.]+$/, ''),
      });
    }

    if (accepted.length > 0) {
      // Dvojí výběr téhož souboru by ho nahrál dvakrát pod jiným razítkem.
      setQueue((prev) => {
        const known = new Set(prev.map((q) => q.key));
        return [...prev, ...accepted.filter((a) => !known.has(a.key))];
      });
    }

    setUploadMsg(
      rejected.length > 0
        ? {
            type: 'error',
            text: `Nepodporovaný typ souboru: ${rejected.join(', ')}. Povoleno: ${ALLOWED_UPLOAD_EXT_LABEL}`,
          }
        : null
    );
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (queue.length === 0) return;

    setUploading(true);
    setUploadMsg(null);

    const failures: string[] = [];
    let uploaded = 0;

    for (const entry of queue) {
      const name = entry.displayName.trim() || entry.file.name;
      const result = await uploadMaterial(entry.file, name);
      if (!result.storagePath) {
        failures.push(result.error ?? entry.file.name);
        continue;
      }
      const tagResult = await saveMaterialTags(
        result.storagePath,
        { subjects: batchSubjects, classIds: batchClassIds, displayName: name },
        profile?.email
      );
      if (tagResult.error) failures.push(`${name}: ${tagResult.error}`);
      uploaded += 1;
    }

    // Zahození paměti rozešle událost, na kterou se seznam načte sám.
    invalidateMaterialsCache();

    setUploadMsg(
      failures.length === 0
        ? { type: 'success', text: `Nahráno souborů: ${uploaded}.` }
        : {
            type: 'error',
            text: `Nahráno ${uploaded} z ${queue.length}. Problémy: ${failures.join(' · ')}`,
          }
    );

    if (failures.length === 0) {
      setQueue([]);
      setBatchSubjects([]);
      setBatchClassIds([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setUploading(false);
  };

  // ── Úpravy štítků ──

  const startEditing = (material: TaggedMaterial) => {
    setEditingPath(material.name);
    setEditName(material.displayName);
    setEditSubjects(material.subjects);
    setEditClassIds(material.classIds);
    setActionMsg(null);
  };

  const saveEditing = async (material: TaggedMaterial) => {
    setBusyPath(material.name);
    const result = await saveMaterialTags(
      material.name,
      {
        subjects: editSubjects,
        classIds: editClassIds,
        displayName: editName.trim() || material.displayName,
      },
      profile?.email
    );
    setBusyPath(null);

    if (result.error) {
      setActionMsg({ type: 'error', text: result.error });
      return;
    }

    setActionMsg({ type: 'success', text: `Štítky souboru „${editName.trim()}" uloženy.` });
    setEditingPath(null);
    invalidateMaterialsCache();
  };

  const handleDelete = async (material: TaggedMaterial) => {
    setBusyPath(material.name);
    const result = await deleteMaterial(material.name);
    setBusyPath(null);
    setConfirmDelete(null);

    if (result.error) {
      setActionMsg({ type: 'error', text: result.error });
      return;
    }
    setSelected((prev) => prev.filter((p) => p !== material.name));
    invalidateMaterialsCache();
  };

  const handleDownload = async (material: TaggedMaterial) => {
    setBusyPath(material.name);
    const err = await downloadMaterial(material);
    if (err) setActionMsg({ type: 'error', text: err });
    setBusyPath(null);
  };

  // ── Hromadné označení ──

  const toggleSelected = (path: string) => {
    setSelected((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]));
  };

  const applyBulkTags = async (mode: 'add' | 'replace') => {
    if (selected.length === 0) return;
    setBulkBusy(true);

    const failures: string[] = [];
    for (const path of selected) {
      const material = materials.find((m) => m.name === path);
      if (!material) continue;

      const subjects =
        mode === 'replace'
          ? bulkSubjects
          : Array.from(new Set([...material.subjects, ...bulkSubjects]));
      const classIds =
        mode === 'replace'
          ? bulkClassIds
          : Array.from(new Set([...material.classIds, ...bulkClassIds]));

      const result = await saveMaterialTags(
        path,
        { subjects, classIds, displayName: material.displayName },
        profile?.email
      );
      if (result.error) failures.push(material.displayName);
    }

    setBulkBusy(false);
    invalidateMaterialsCache();

    setActionMsg(
      failures.length === 0
        ? {
            type: 'success',
            text: `Štítky upraveny u ${selected.length} souborů.`,
          }
        : { type: 'error', text: `Neuložilo se: ${failures.join(', ')}` }
    );

    if (failures.length === 0) {
      setSelected([]);
      setBulkSubjects([]);
      setBulkClassIds([]);
    }
  };

  return (
    <div className="space-y-8">
      <FileViewerModal material={viewed} isOpen={Boolean(viewed)} onClose={() => setViewed(null)} />

      {/* ── Nahrání ── */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-500" />
            Nahrát soubory
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Označte soubory předměty a třídami — podle štítků se pak zobrazí v detailu předmětu
            a na nástěnce třídy. Štítky jde kdykoli změnit i dodatečně.
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
              htmlFor={`${fieldIds}-soubory`}
            >
              Soubory <span className="font-normal text-slate-400">({ALLOWED_UPLOAD_EXT_LABEL})</span>
            </label>
            {/* Zóna je <label> pro pole níže: klik na ni otevře výběr souboru
                nativně. Přetažení myší je navíc — klávesovou cestou zůstává
                samotné pole, které je sr-only, tedy zaměřitelné. */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <label
              htmlFor={`${fieldIds}-soubory`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files.length > 0) enqueue(e.dataTransfer.files);
              }}
              className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : queue.length > 0
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
              }`}
            >
              <input
                ref={fileInputRef}
                id={`${fieldIds}-soubory`}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  if (e.target.files) enqueue(e.target.files);
                }}
                className="sr-only"
              />
              <CloudUpload className="w-10 h-10 text-slate-300 dark:text-slate-500" />
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Přetáhněte soubory sem
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  nebo klikněte pro výběr — vybrat jde i více souborů najednou
                </div>
              </div>
            </label>
          </div>

          {queue.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Připraveno k nahrání ({queue.length})
              </div>
              {queue.map((entry, idx) => (
                <div
                  key={entry.key}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"
                >
                  {fileIcon(entry.file.type, entry.file.name)}
                  <div className="flex-1 min-w-0">
                    <label className="sr-only" htmlFor={`${fieldIds}-nazev-${idx}`}>
                      Název souboru {entry.file.name}
                    </label>
                    <input
                      id={`${fieldIds}-nazev-${idx}`}
                      type="text"
                      value={entry.displayName}
                      onChange={(e) =>
                        setQueue((prev) =>
                          prev.map((q) =>
                            q.key === entry.key ? { ...q, displayName: e.target.value } : q
                          )
                        )
                      }
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {entry.file.name} · {formatFileSize(entry.file.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQueue((prev) => prev.filter((q) => q.key !== entry.key))}
                    aria-label={`Odebrat ${entry.file.name} z nahrávání`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <MaterialTagPicker
              subjectOptions={subjectOptions}
              classOptions={classOptions}
              selectedSubjects={batchSubjects}
              selectedClassIds={batchClassIds}
              onChange={({ subjects, classIds }) => {
                setBatchSubjects(subjects);
                setBatchClassIds(classIds);
              }}
              disabled={uploading}
            />
            <p className="text-[10px] text-slate-400 mt-2">
              Štítky se přiřadí všem souborům v tomhle nahrání. Jednotlivě je upravíte
              v seznamu níže.
            </p>
          </div>

          <AnimatePresence>
            {uploadMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                  uploadMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
                }`}
              >
                {uploadMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{uploadMsg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={uploading || queue.length === 0}
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
                {queue.length > 1 ? `Nahrát ${queue.length} souborů` : 'Nahrát soubor'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Seznam nahraných souborů ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-indigo-500" />
            Nahrané soubory
            {!loading && <span className="font-normal text-slate-400 text-xs">({materials.length})</span>}
          </h3>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </button>
        </div>

        {(error || tagsError) && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error ?? tagsError}</span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <label className="sr-only" htmlFor={`${fieldIds}-hledat`}>
              Hledat v nahraných souborech
            </label>
            <input
              id={`${fieldIds}-hledat`}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat podle názvu nebo předmětu…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button
            type="button"
            onClick={() => setOnlyUntagged((v) => !v)}
            aria-pressed={onlyUntagged}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              onlyUntagged
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Bez štítků ({untaggedCount})
          </button>
        </div>

        {actionMsg && (
          <div
            className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
              actionMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
            }`}
          >
            {actionMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{actionMsg.text}</span>
          </div>
        )}

        {/* Hromadné označení vybraných souborů */}
        {selected.length > 0 && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Tags className="w-4 h-4" />
                Vybráno souborů: {selected.length}
              </span>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
              >
                Zrušit výběr
              </button>
            </div>

            <MaterialTagPicker
              subjectOptions={subjectOptions}
              classOptions={classOptions}
              selectedSubjects={bulkSubjects}
              selectedClassIds={bulkClassIds}
              onChange={({ subjects, classIds }) => {
                setBulkSubjects(subjects);
                setBulkClassIds(classIds);
              }}
              disabled={bulkBusy}
              compact
            />

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => applyBulkTags('add')}
                disabled={bulkBusy || (bulkSubjects.length === 0 && bulkClassIds.length === 0)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {bulkBusy ? 'Ukládám…' : 'Přidat vybraným'}
              </button>
              <button
                type="button"
                onClick={() => applyBulkTags('replace')}
                disabled={bulkBusy}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                title="Nahradí štítky vybraných souborů tímhle výběrem — prázdný výběr je smaže"
              >
                Nahradit štítky
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Načítám…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-sm text-slate-400 py-6 text-center">
            {materials.length === 0
              ? 'Zatím nejsou nahrané žádné soubory.'
              : 'Zadaným kritériím neodpovídá žádný soubor.'}
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((material) => {
            const isEditing = editingPath === material.name;
            const isBusy = busyPath === material.name;
            const isConfirming = confirmDelete === material.name;
            const isSelected = selected.includes(material.name);

            return (
              <div
                key={material.name}
                className={`rounded-2xl border transition-colors ${
                  isSelected
                    ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 p-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(material.name)}
                    aria-label={`Vybrat soubor ${material.displayName}`}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  {fileIcon(material.mimeType, material.name)}

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {material.displayName}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {material.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                        >
                          {subject}
                        </span>
                      ))}
                      {material.classIds.map((classId) => (
                        <span
                          key={classId}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        >
                          {classNameById(classId) ?? 'Smazaná třída'}
                        </span>
                      ))}
                      {material.subjects.length === 0 && material.classIds.length === 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Bez štítků
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatFileSize(material.size)}
                      </span>
                    </div>
                  </div>

                  {isConfirming ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                        Opravdu smazat?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(material)}
                        disabled={isBusy}
                        className="px-2.5 py-1 text-xs rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ano'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all cursor-pointer"
                      >
                        Zrušit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setViewed(material)}
                        aria-label={`Otevřít soubor ${material.displayName}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(material)}
                        disabled={isBusy}
                        aria-label={`Stáhnout soubor ${material.displayName}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => (isEditing ? setEditingPath(null) : startEditing(material))}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                      >
                        <Tags className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Štítky</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(material.name)}
                        aria-label={`Smazat soubor ${material.displayName}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="px-3.5 pb-4 pt-1 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
                    <div>
                      <label
                        className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
                        htmlFor={`${fieldIds}-edit-nazev`}
                      >
                        Název souboru
                      </label>
                      <input
                        id={`${fieldIds}-edit-nazev`}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    <MaterialTagPicker
                      subjectOptions={subjectOptions}
                      classOptions={classOptions}
                      selectedSubjects={editSubjects}
                      selectedClassIds={editClassIds}
                      onChange={({ subjects, classIds }) => {
                        setEditSubjects(subjects);
                        setEditClassIds(classIds);
                      }}
                      disabled={isBusy}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveEditing(material)}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isBusy ? 'Ukládám…' : 'Uložit štítky'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPath(null)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Zavřít
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
