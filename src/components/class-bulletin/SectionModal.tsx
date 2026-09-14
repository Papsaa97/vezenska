import React, { useState, useId } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { ClassBoardItem, ClassSection } from '../../utils/classBoardService';
import { useDialog } from '../../hooks/useDialog';

interface SectionModalProps {
  item: ClassBoardItem;
  onClose: () => void;
  onSave: (section: ClassSection) => Promise<void>;
}

export default function SectionModal({ item, onClose, onSave }: SectionModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [badge, setBadge] = useState('OZNÁMENÍ');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: `sec-${Date.now()}`,
        type: 'custom',
        title: title.trim(),
        content: content.trim(),
        badge: badge.trim(),
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
      aria-labelledby="section-modal-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h3 id="section-modal-title" className="font-bold text-base text-slate-900 dark:text-white">
            Přidat sekci pro třídu {item.className}
          </h3>
          <button onClick={onClose}
            aria-label="Zavřít formulář sekce" className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-0`}>
              Nadpis sekce *
            </label>
            <input
              id={`${fieldIds}-0`}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="např. Příprava na střelby, Mimořádný nástup..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-1`}>
              Štítek / Odznak
            </label>
            <input
              id={`${fieldIds}-1`}
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="např. DŮLEŽITÉ, UPOZORNĚNÍ, ZKOUŠKA..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white uppercase text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-2`}>
              Obsah sekce *
            </label>
            <textarea
              id={`${fieldIds}-2`}
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Podrobný text, odrážky nebo instrukce lektora..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
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
              {saving ? 'Ukládám…' : 'Přidat sekci'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
