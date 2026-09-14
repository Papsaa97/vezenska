import React, { useState, useId } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { GlobalAnnouncement } from '../../utils/classBoardService';
import { useDialog } from '../../hooks/useDialog';

interface GlobalAnnouncementModalProps {
  item: GlobalAnnouncement | null;
  authorDefault: string;
  onClose: () => void;
  onSave: (ann: Omit<GlobalAnnouncement, 'id' | 'updatedAt'> & { id?: string }) => Promise<void>;
}

export default function GlobalAnnouncementModal({
  item,
  authorDefault,
  onClose,
  onSave,
}: GlobalAnnouncementModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const [title, setTitle] = useState(item?.title ?? '');
  const [content, setContent] = useState(item?.content ?? '');
  const [badge, setBadge] = useState(item?.badge ?? 'CELOŠKOLNÍ ROZKAZ');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>(item?.priority ?? 'normal');
  const [author, setAuthor] = useState(item?.author ?? authorDefault);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: item?.id,
        title: title.trim(),
        content: content.trim(),
        badge: badge.trim(),
        date: new Date().toLocaleDateString('cs-CZ'),
        author: author.trim(),
        priority,
      });
    } finally {
      setSaving(false);
    }
  };

  // Escape, past na fokus a jeho návrat po zavření — viz hooks/useDialog.
  const dialogRef = useDialog<HTMLDivElement>({
    isOpen: true,
    onClose,
    closeOnEscape: !saving,
  });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-announcement-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 id="global-announcement-title" className="font-bold text-base text-slate-900 dark:text-white">
            {item ? 'Upravit celoškolní hlášení' : 'Nové celoškolní hlášení pro všechny'}
          </h3>
          <button onClick={onClose}
            aria-label="Zavřít formulář hlášení" className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-0`}>
              Nadpis hlášení *
            </label>
            <input
              id={`${fieldIds}-0`}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="např. Změna režimu výdeje stravy, Mimořádný nástup..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-1`}>
                Kategorie / Štítek
              </label>
              <input
                id={`${fieldIds}-1`}
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="CELOŠKOLNÍ ROZKAZ"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-semibold text-[11px]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-2`}>
                Priorita
              </label>
              <select
                id={`${fieldIds}-2`}
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'high' | 'urgent')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="normal">Běžná</option>
                <option value="high">Důležitá</option>
                <option value="urgent">Mimořádná / Naléhavá</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-3`}>
              Text hlášení *
            </label>
            <textarea
              id={`${fieldIds}-3`}
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Podrobný text rozkazu či instrukce..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-4`}>
              Autor / Vydal
            </label>
            <input
              id={`${fieldIds}-4`}
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
            >
              {saving ? 'Ukládám…' : 'Zveřejnit hlášení'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
