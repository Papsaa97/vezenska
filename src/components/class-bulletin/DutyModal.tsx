import React, { useState, useId } from 'react';
import { motion } from 'motion/react';
import { Building2, X } from 'lucide-react';
import { ClassBoardItem, DutyRosterItem, DutyType } from '../../utils/classBoardService';
import { useDialog } from '../../hooks/useDialog';

interface DutyModalProps {
  item: ClassBoardItem;
  onClose: () => void;
  onSave: (duty: DutyRosterItem) => Promise<void>;
}

export default function DutyModal({ item, onClose, onSave }: DutyModalProps) {
  // Jedinečný základ id, kterým se popisek sváže se svým vstupem (htmlFor níže).
  const fieldIds = useId();

  const [type, setType] = useState<DutyType>('pankrac');
  const [title, setTitle] = useState('Výpomoc VV Praha - Pankrác');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('06:30 \u2013 15:30');
  const [location, setLocation] = useState('Vazební věznice Praha - Pankrác (hlavní vchod)');
  const [attendees, setAttendees] = useState('');
  const [uniform, setUniform] = useState('Pracovní stejnokroj PS II, vysoká obuv, taktický opasek, služební průkaz');
  const [notes, setNotes] = useState('Sraz před vchodem Akademie 15 minut předem.');
  const [saving, setSaving] = useState(false);

  const handleTypeChange = (newType: DutyType) => {
    setType(newType);
    if (newType === 'pankrac') {
      setTitle('Výpomoc VV Praha - Pankrác');
      setLocation('Vazební věznice Praha - Pankrác (hlavní brána)');
      setTime('06:30 \u2013 15:30');
      setUniform('Pracovní stejnokroj PS II, vysoká obuv, taktický opasek, služební průkaz');
    } else if (newType === 'recepce') {
      setTitle('Služba na recepci Akademie VS ČR');
      setLocation('Recepce Akademie VS ČR');
      setTime('06:00 \u2013 18:00 (denní směna)');
      setUniform('Služební stejnokroj, vázanka, služební odznak');
    } else {
      setTitle('Mimořádná výcviková událost');
      setLocation('Areál Akademie VS ČR');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        id: `duty-${Date.now()}`,
        type,
        title: title.trim(),
        date: date.trim() || new Date().toLocaleDateString('cs-CZ'),
        time: time.trim(),
        location: location.trim(),
        attendees: attendees.trim(),
        uniform: uniform.trim(),
        notes: notes.trim(),
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
      aria-labelledby="duty-modal-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h3 id="duty-modal-title" className="font-bold text-base text-slate-900 dark:text-white">
              Vypsat službu pro třídu {item.className}
            </h3>
          </div>
          <button onClick={onClose}
            aria-label="Zavřít formulář služby" className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            {/* Popisuje skupinu tlačítek, ne jedno pole — proto <span> a
                role="group", ne <label>. */}
            <span
              id={`${fieldIds}-typ`}
              className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5"
            >
              Typ mimořádné služby
            </span>
            <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby={`${fieldIds}-typ`}>
              <button
                type="button"
                onClick={() => handleTypeChange('pankrac')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  type === 'pankrac'
                    ? 'bg-red-500/15 border-red-500 text-red-600 dark:text-red-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Výpomoc Pankrác
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('recepce')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  type === 'recepce'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Recepce Akademie
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('jine')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  type === 'jine'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                Jiné / Stáž
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-0`}>
              Název události *
            </label>
            <input
              id={`${fieldIds}-0`}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-1`}>
                Datum služby *
              </label>
              <input
                id={`${fieldIds}-1`}
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="např. 22. 9. 2026"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-2`}>
                Čas nástupu / směna
              </label>
              <input
                id={`${fieldIds}-2`}
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="např. 06:30 \u2013 15:30"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-3`}>
              Určení posluchači (jmenný seznam) *
            </label>
            <input
              id={`${fieldIds}-3`}
              type="text"
              required
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="např. stržm. Novák, stržm. Dvořák, stržm. Svoboda"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-4`}>
              Požadovaná výstroj a vybavení
            </label>
            <input
              id={`${fieldIds}-4`}
              type="text"
              value={uniform}
              onChange={(e) => setUniform(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 uppercase mb-1" htmlFor={`${fieldIds}-5`}>
              Místo a operativní pokyny
            </label>
            <input
              id={`${fieldIds}-5`}
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {saving ? 'Ukládám\u2026' : 'Zapsat službu'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
