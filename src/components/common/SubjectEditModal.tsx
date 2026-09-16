import React, { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { SubjectInfo } from '../../data/questions/subjectsInfo';
import { makeContentId } from '../../utils/contentLibrary';
import { useDialog } from '../../hooks/useDialog';

/** Barvy, které umí vykreslit getSubjectColorStyles v SubjectsHub. */
const ACCENT_COLORS: { value: string; label: string }[] = [
  { value: 'indigo', label: 'Indigová' },
  { value: 'blue', label: 'Modrá' },
  { value: 'emerald', label: 'Zelená' },
  { value: 'amber', label: 'Jantarová' },
  { value: 'rose', label: 'Růžová' },
  { value: 'teal', label: 'Tyrkysová' },
  { value: 'purple', label: 'Fialová' },
];

/** Ikony, které umí vykreslit getSubjectIcon v SubjectsHub. */
const ICONS: { value: string; label: string }[] = [
  { value: 'Scale', label: 'Váhy (právo)' },
  { value: 'Shield', label: 'Štít (bezpečnost)' },
  { value: 'Building2', label: 'Budova (věznice)' },
  { value: 'Crosshair', label: 'Zaměřovač (výcvik)' },
  { value: 'Brain', label: 'Mozek (psychologie)' },
  { value: 'Search', label: 'Lupa (šetření)' },
  { value: 'FileText', label: 'Dokument (administrativa)' },
  { value: 'GraduationCap', label: 'Absolventská čapka (výuka)' },
  { value: 'HeartHandshake', label: 'Podání ruky (etika)' },
  { value: 'HeartPulse', label: 'Tep (zdravověda)' },
  { value: 'BookOpen', label: 'Kniha (obecné)' },
];

interface SubjectEditModalProps {
  /** Upravovaný předmět, nebo null pro založení nového. */
  subject: SubjectInfo | null;
  isOpen: boolean;
  /** Id všech existujících předmětů — nový nesmí žádné z nich přebít. */
  usedIds: string[];
  onClose: () => void;
  onSave: (subject: SubjectInfo) => Promise<{ persisted: boolean; error: string | null }>;
}

function linesToArray(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean);
}

/**
 * Formulář bloku předmětu.
 *
 * Předměty jsou v repozitáři, ale lektor je tímhle formulářem může přepsat,
 * doplnit o nový nebo schovat — uloží se jako překryv (contentLibrary.ts),
 * takže se výchozí data dají kdykoli vrátit.
 */
export default function SubjectEditModal({
  subject,
  isOpen,
  usedIds,
  onClose,
  onSave,
}: SubjectEditModalProps) {
  const fieldIds = useId();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('BookOpen');
  const [accentColor, setAccentColor] = useState('indigo');
  const [legalFramework, setLegalFramework] = useState('');
  const [keyTopics, setKeyTopics] = useState('');
  const [examRequirements, setExamRequirements] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dialogRef = useDialog<HTMLDivElement>({ isOpen, onClose, closeOnEscape: !saving });

  useEffect(() => {
    if (!isOpen) return;
    setName(subject?.name ?? '');
    setCode(subject?.code ?? '');
    setDescription(subject?.description ?? '');
    setIconName(subject?.iconName ?? 'BookOpen');
    setAccentColor(subject?.accentColor ?? 'indigo');
    setLegalFramework((subject?.legalFramework ?? []).join('\n'));
    setKeyTopics((subject?.keyTopics ?? []).join('\n'));
    setExamRequirements(subject?.examRequirements ?? '');
    setErrorMsg(null);
  }, [subject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Název předmětu nesmí zůstat prázdný.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload: SubjectInfo = {
      // Id existujícího předmětu se nemění — je klíčem překryvu i štítků
      // u souborů, takže by změnou obojí ztratilo vazbu.
      id: subject?.id ?? makeContentId('predmet', name, usedIds),
      name: name.trim(),
      code: code.trim().toUpperCase() || name.trim().slice(0, 3).toUpperCase(),
      iconName,
      badgeColor:
        subject?.badgeColor ??
        'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800',
      accentColor,
      description: description.trim(),
      legalFramework: linesToArray(legalFramework),
      keyTopics: linesToArray(keyTopics),
      examRequirements: examRequirements.trim(),
    };

    const result = await onSave(payload);
    setSaving(false);

    if (result.error) {
      setErrorMsg(result.error);
      return;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${fieldIds}-title`}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 id={`${fieldIds}-title`} className="font-bold text-slate-900 dark:text-white">
                  {subject ? 'Upravit předmět' : 'Nový předmět'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Zavřít formulář předmětu"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-nazev`}
                  >
                    Název předmětu *
                  </label>
                  <input
                    id={`${fieldIds}-nazev`}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Například Penologie"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-kod`}
                  >
                    Zkratka
                  </label>
                  <input
                    id={`${fieldIds}-kod`}
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="PEN"
                    maxLength={6}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                  htmlFor={`${fieldIds}-popis`}
                >
                  Popis předmětu
                </label>
                <textarea
                  id={`${fieldIds}-popis`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-ikona`}
                  >
                    Ikona
                  </label>
                  <select
                    id={`${fieldIds}-ikona`}
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {ICONS.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    htmlFor={`${fieldIds}-barva`}
                  >
                    Barva dlaždice
                  </label>
                  <select
                    id={`${fieldIds}-barva`}
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {ACCENT_COLORS.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                  htmlFor={`${fieldIds}-prameny`}
                >
                  Prameny práva a předpisy <span className="font-normal text-slate-400">(každý na samostatný řádek)</span>
                </label>
                <textarea
                  id={`${fieldIds}-prameny`}
                  value={legalFramework}
                  onChange={(e) => setLegalFramework(e.target.value)}
                  rows={4}
                  placeholder={'Zákon č. 169/1999 Sb., o výkonu trestu odnětí svobody\nNGŘ č. 41/2024, o kázeňském řízení'}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                  htmlFor={`${fieldIds}-okruhy`}
                >
                  Klíčové tematické okruhy <span className="font-normal text-slate-400">(každý na samostatný řádek)</span>
                </label>
                <textarea
                  id={`${fieldIds}-okruhy`}
                  value={keyTopics}
                  onChange={(e) => setKeyTopics(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                  htmlFor={`${fieldIds}-zkouska`}
                >
                  Požadavky ke zkoušce
                </label>
                <textarea
                  id={`${fieldIds}-zkouska`}
                  value={examRequirements}
                  onChange={(e) => setExamRequirements(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors cursor-pointer"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Uložit předmět
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
