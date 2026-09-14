import React, { useRef, useState, useId } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Loader2,
  School,
  UploadCloud,
  X,
} from 'lucide-react';
import { ClassBoardItem, ClassBoardInput, uploadScheduleImage } from '../../utils/classBoardService';
import { fileToDataUrl } from '../../utils/fileUtils';
import { useDialog } from '../../hooks/useDialog';

interface ClassEditModalProps {
  item: ClassBoardItem | null;
  onClose: () => void;
  onSave: (input: ClassBoardInput) => Promise<void>;
}

export default function ClassEditModal({ item, onClose, onSave }: ClassEditModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

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

  // Escape, past na fokus a jeho návrat po zavření — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({ isOpen: true, onClose });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-edit-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-blue-500" />
            <h3 id="class-edit-title" className="font-bold text-base text-slate-900 dark:text-white">
              {item ? `Upravit třídu: ${item.className}` : 'Vytvořit novou třídu'}
            </h3>
          </div>
          <button onClick={onClose}
            aria-label="Zavřít úpravu třídy" className="p-1.5 rounded-full text-slate-400 hover:text-white cursor-pointer">
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
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300" htmlFor={`${fieldIds}-0`}>
              Název třídy *
            </label>
            <input
              id={`${fieldIds}-0`}
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
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1" htmlFor={`${fieldIds}-1`}>
                  Datum zahájení kurzu
                </label>
                <input
                  id={`${fieldIds}-1`}
                  type="date"
                  value={courseStartDate}
                  onChange={(e) => setCourseStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1" htmlFor={`${fieldIds}-2`}>
                  Datum ukončení kurzu
                </label>
                <input
                  id={`${fieldIds}-2`}
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
              placeholder={"• Pondělí: Změna učebny na B2\n• Středa: Střelby posunuty na 13:00"}
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
                  <span>Ukládám\u2026</span>
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
