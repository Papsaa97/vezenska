import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Loader2,
  AlertCircle,
  FileText,
  Presentation,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import {
  MATERIALS_BUCKET,
  StudyMaterial,
  downloadMaterial,
  formatFileSize,
  getFileKind,
  getFileTypeLabel,
} from '../../utils/materials';
import { PptxSlide, renderDocx, renderPptx, revokePptxImages } from '../../utils/documentPreview';
import { supabase } from '../../lib/supabase';

interface FileViewerModalProps {
  material: StudyMaterial | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Prohlížeč studijních souborů uvnitř aplikace.
 *
 * Soubor se stáhne do prohlížeče a zobrazí se na místě — PDF a obrázky
 * vykreslí prohlížeč sám, Word a prezentace se převedou v zařízení uživatele
 * (viz documentPreview.ts). Nikam ven se přitom neposílá nic: interní materiály
 * Vězeňské služby nemají co dělat v cizí online prohlížečce dokumentů.
 */
export default function FileViewerModal({ material, isOpen, onClose }: FileViewerModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [docHtml, setDocHtml] = useState<string | null>(null);
  const [docWarnings, setDocWarnings] = useState<string[]>([]);
  const [slides, setSlides] = useState<PptxSlide[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const dialogRef = useDialog<HTMLDivElement>({ isOpen, onClose });

  const storagePath = material?.name ?? null;
  const mimeType = material?.mimeType ?? '';
  const kind = useMemo(
    () => getFileKind(mimeType, storagePath ?? ''),
    [mimeType, storagePath]
  );

  // Uvolnění zdrojů drží ref, ne stav: úklid musí proběhnout i tehdy, když se
  // mezitím vybral jiný soubor a stav už ukazuje na něj.
  const cleanupRef = useRef<() => void>(() => {});

  const releasePreview = useCallback(() => {
    cleanupRef.current();
    cleanupRef.current = () => {};
    setBlobUrl(null);
    setDocHtml(null);
    setDocWarnings([]);
    setSlides([]);
    setSlideIndex(0);
  }, []);

  useEffect(() => {
    if (!isOpen || !storagePath) return;

    // Náhled předchozího souboru musí pryč dřív, než se začne stavět další —
    // jinak by po sobě zůstal object URL, který už nemá kdo uvolnit.
    releasePreview();

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const { data, error: dlError } = await supabase.storage
        .from(MATERIALS_BUCKET)
        .download(storagePath);

      if (cancelled) return;

      if (dlError || !data) {
        setError(`Soubor se nepodařilo načíst: ${dlError?.message ?? 'neznámá chyba'}`);
        setLoading(false);
        return;
      }

      try {
        if (kind === 'word') {
          const preview = await renderDocx(data);
          if (cancelled) return;
          setDocHtml(preview.html);
          setDocWarnings(preview.warnings);
        } else if (kind === 'presentation') {
          const parsed = await renderPptx(data);
          if (cancelled) {
            revokePptxImages(parsed);
            return;
          }
          setSlides(parsed);
          setSlideIndex(0);
          cleanupRef.current = () => revokePptxImages(parsed);
        } else {
          const url = URL.createObjectURL(data);
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }
          setBlobUrl(url);
          cleanupRef.current = () => URL.revokeObjectURL(url);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            `Náhled se nepodařilo vytvořit (${err instanceof Error ? err.message : String(err)}). ` +
              'Soubor si můžete stáhnout a otevřít v počítači.'
          );
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, storagePath, kind, releasePreview]);

  // Zavřením prohlížeče se uvolní object URL — jinak by se s každým otevřením
  // dalšího souboru držel v paměti obsah všech předchozích.
  useEffect(() => {
    if (!isOpen) releasePreview();
  }, [isOpen, releasePreview]);

  useEffect(() => releasePreview, [releasePreview]);

  const handleDownload = async () => {
    if (!material) return;
    setDownloading(true);
    const err = await downloadMaterial(material);
    if (err) setError(err);
    setDownloading(false);
  };

  if (!material) return null;

  const activeSlide = slides[slideIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-6"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-viewer-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-5xl h-full sm:h-[88vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Hlavička */}
            <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  {kind === 'presentation' ? (
                    <Presentation className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2
                    id="file-viewer-title"
                    className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate"
                  >
                    {material.displayName}
                  </h2>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="font-bold">{getFileTypeLabel(mimeType, material.name)}</span>
                    <span>{formatFileSize(material.size)}</span>
                    {kind === 'presentation' && slides.length > 0 && (
                      <span>{slides.length} snímků</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Stáhnout</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Zavřít prohlížeč souboru"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Obsah */}
            <div className="flex-1 min-h-0 overflow-auto bg-slate-50 dark:bg-slate-950/40">
              {loading && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <span className="text-sm">Připravuji náhled…</span>
                </div>
              )}

              {!loading && error && (
                <div className="p-6">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {!loading && !error && kind === 'pdf' && blobUrl && (
                <div className="h-full flex flex-col">
                  {/* <object> místo <iframe>: když prohlížeč PDF neumí zobrazit
                      (typicky starší mobil), vykreslí se obsah uvnitř značky
                      místo prázdné plochy. */}
                  <object data={blobUrl} type="application/pdf" className="w-full h-full flex-1">
                    <div className="p-6 text-center space-y-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Váš prohlížeč neumí zobrazit PDF přímo v aplikaci.
                      </p>
                      <a
                        href={blobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Otevřít na nové kartě
                      </a>
                    </div>
                  </object>
                </div>
              )}

              {!loading && !error && kind === 'image' && blobUrl && (
                <div className="h-full flex items-center justify-center p-4">
                  <img
                    src={blobUrl}
                    alt={material.displayName}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-sm"
                  />
                </div>
              )}

              {!loading && !error && kind === 'word' && docHtml !== null && (
                <div className="p-4 sm:p-8">
                  <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
                    {docWarnings.length > 0 && (
                      <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                        Náhled zjednodušuje formátování. Původní podobu má stažený soubor.
                      </div>
                    )}
                    {/* Obsah dokumentu prošel převodem i protříděním povolených
                        prvků v sanitizeDocumentHtml(). */}
                    <div
                      className="document-preview text-slate-800 dark:text-slate-200"
                      dangerouslySetInnerHTML={{ __html: docHtml }}
                    />
                  </div>
                </div>
              )}

              {!loading && !error && kind === 'presentation' && (
                <div className="p-4 sm:p-6">
                  {slides.length === 0 ? (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-12">
                      V prezentaci se nepodařilo najít žádné snímky. Zkuste soubor stáhnout.
                    </div>
                  ) : (
                    <div className="max-w-3xl mx-auto space-y-4">
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm min-h-[320px] space-y-4">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Snímek {activeSlide.index} z {slides.length}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                          {activeSlide.title}
                        </h3>
                        {activeSlide.lines.length > 0 && (
                          <ul className="space-y-2">
                            {activeSlide.lines.map((line, idx) => (
                              <li
                                key={`${activeSlide.index}-${idx}`}
                                className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
                              >
                                <span className="text-indigo-500 font-bold shrink-0">•</span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {activeSlide.images.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {activeSlide.images.map((src, idx) => (
                              <img
                                key={src}
                                src={src}
                                alt={`Obrázek ${idx + 1} na snímku ${activeSlide.index}`}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                          disabled={slideIndex === 0}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Předchozí
                        </button>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Náhled ukazuje text a obrázky snímků
                        </span>
                        <button
                          type="button"
                          onClick={() => setSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
                          disabled={slideIndex >= slides.length - 1}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
                        >
                          Další
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!loading && !error && kind === 'other' && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 p-6 text-center">
                  <FileText className="w-10 h-10 opacity-40" />
                  <p className="text-sm">
                    Tenhle typ souboru aplikace zobrazit neumí. Stáhněte si ho a otevřete
                    v příslušném programu.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
