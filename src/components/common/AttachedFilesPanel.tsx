import React, { useState } from 'react';
import {
  Download,
  Eye,
  FileText,
  FileType2,
  Image as ImageIcon,
  Loader2,
  Presentation,
} from 'lucide-react';
import {
  TaggedMaterial,
  downloadMaterial,
  formatFileSize,
  getFileKind,
  getFileTypeLabel,
} from '../../utils/materials';
import FileViewerModal from './FileViewerModal';

interface AttachedFilesPanelProps {
  materials: TaggedMaterial[];
  loading?: boolean;
  /** Text, když k předmětu ani třídě není přiřazený žádný soubor. */
  emptyText?: string;
  /** Skryje seznam, když je prázdný — hodí se do hustě zaplněné nástěnky. */
  hideWhenEmpty?: boolean;
  className?: string;
}

function fileIcon(material: TaggedMaterial): React.ReactElement {
  switch (getFileKind(material.mimeType, material.name)) {
    case 'pdf':
      return <FileText className="w-4 h-4 text-red-500 shrink-0" />;
    case 'word':
      return <FileType2 className="w-4 h-4 text-blue-500 shrink-0" />;
    case 'presentation':
      return <Presentation className="w-4 h-4 text-orange-500 shrink-0" />;
    case 'image':
      return <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  }
}

/**
 * Seznam souborů přiřazených k předmětu nebo ke třídě.
 *
 * Soubory se sem nevkládají ručně — objeví se tu tím, že je někdo ve správci
 * souborů označil štítkem daného předmětu či třídy. Otevírají se v aplikaci,
 * stažení zůstává jako druhá možnost.
 */
export default function AttachedFilesPanel({
  materials,
  loading = false,
  emptyText = 'K tomuhle okruhu zatím není přiřazený žádný soubor.',
  hideWhenEmpty = false,
  className = '',
}: AttachedFilesPanelProps) {
  const [viewed, setViewed] = useState<TaggedMaterial | null>(null);
  const [downloadingName, setDownloadingName] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async (material: TaggedMaterial) => {
    setDownloadingName(material.name);
    setDownloadError(await downloadMaterial(material));
    setDownloadingName(null);
  };

  if (!loading && materials.length === 0 && hideWhenEmpty) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <FileViewerModal
        material={viewed}
        isOpen={Boolean(viewed)}
        onClose={() => setViewed(null)}
      />

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Načítám soubory…
        </div>
      )}

      {!loading && materials.length === 0 && (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs italic">
          {emptyText}
        </div>
      )}

      {downloadError && (
        <div className="text-[11px] text-red-600 dark:text-red-400">{downloadError}</div>
      )}

      {materials.map((material) => {
        const isDownloading = downloadingName === material.name;
        return (
          <div
            key={material.name}
            className="print-avoid-break flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {fileIcon(material)}
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {material.displayName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="font-bold">
                    {getFileTypeLabel(material.mimeType, material.name)}
                  </span>
                  <span>{formatFileSize(material.size)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 no-print">
              <button
                type="button"
                onClick={() => setViewed(material)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>Otevřít</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownload(material)}
                disabled={isDownloading}
                aria-label={`Stáhnout soubor ${material.displayName}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
