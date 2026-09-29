import React, { useState } from 'react';
import { Edit3, Eye, EyeOff, Plus, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { ContentEntry } from '../../utils/contentLibrary';
import { EditableContent } from '../../hooks/useEditableContent';
import ConfirmDialog from './ConfirmDialog';

interface ContentEditorBarProps<T extends { id: string }> {
  content: EditableContent<T>;
  /** Položky, které lze právě upravit — u trenažéru ta zobrazená, u bloků všechny v podzáložce. */
  targets: ContentEntry<T>[];
  /** Odebrané položky k obnovení nebo smazání natrvalo. */
  deleted: ContentEntry<T>[];
  getName: (item: T) => string;
  /** Jak se položce říká v textech tlačítek („situaci“, „blok“, „tiskopis“). */
  noun: string;
  onEdit: (item: T) => void;
  /** Bez obsluhy se tlačítko Přidat nezobrazí (tiskopis přidat nejde). */
  onAdd?: () => void;
  addLabel?: string;
}

type PendingAction = { action: 'remove' | 'purge' | 'revert'; id: string; name: string };

const BTN = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors';

/**
 * Lištička lektora nad upravitelným obsahem záložky: upravit, skrýt, vrátit
 * výchozí znění, odebrat, přidat a obnovit odebrané.
 *
 * Dělá totéž co správa zbraní ve WeaponSimulatoru, jen obecně — záložky
 * etiky a administrativy mají takových míst sedm a každé by jinak neslo
 * vlastní kopii stejných tlačítek, potvrzovacího dialogu a hlášení chyb.
 * Vzhled a rozvržení studijního obsahu se jí netýká; formulář úprav si
 * otevírá volající přes onEdit/onAdd.
 */
export default function ContentEditorBar<T extends { id: string }>({
  content,
  targets,
  deleted,
  getName,
  noun,
  onEdit,
  onAdd,
  addLabel,
}: ContentEditorBarProps<T>) {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPending = async () => {
    if (!pending) return;
    const { action, id } = pending;
    setPending(null);
    const result =
      action === 'remove'
        ? await content.remove(id)
        : action === 'purge'
        ? await content.purge(id)
        : await content.restore(id);
    setError(result.error);
  };

  const confirmTexts: Record<PendingAction['action'], { title: string; description: string; label: string }> = {
    remove: {
      title: 'Odebrat ze záložky?',
      description: `„${pending?.name ?? ''}“ studenti přestanou vidět. Vrátit to půjde z přehledu odebraných.`,
      label: 'Odebrat',
    },
    purge: {
      title: 'Smazat natrvalo?',
      description: `„${pending?.name ?? ''}“ zmizí i z přehledu odebraných.`,
      label: 'Smazat natrvalo',
    },
    revert: {
      title: 'Vrátit výchozí znění?',
      description: `Úpravy „${pending?.name ?? ''}“ se zahodí a vrátí se text z aplikace. Zruší se i případné skrytí před studenty.`,
      label: 'Vrátit výchozí',
    },
  };
  const confirm = pending ? confirmTexts[pending.action] : null;

  return (
    <div className="p-3 rounded-2xl border border-dashed border-amber-400/60 bg-amber-50/60 dark:bg-amber-950/20 space-y-2 text-slate-700 dark:text-slate-200 no-print print:hidden">
      {targets.map((entry) => {
        const name = getName(entry.item);
        return (
          <div key={entry.id} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold max-w-full truncate">{name}</span>
            {entry.isHidden && (
              <span className="px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[0.625rem] font-bold">
                Skryto studentům
              </span>
            )}
            {entry.isBuiltIn && entry.isEdited && (
              <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 text-[0.625rem] font-bold">
                Upraveno
              </span>
            )}
            <button
              type="button"
              onClick={() => onEdit(entry.item)}
              aria-label={`Upravit ${noun} ${name}`}
              className={`${BTN} bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Upravit
            </button>
            <button
              type="button"
              onClick={() => content.toggleHidden(entry.id).then((r) => setError(r.error))}
              aria-label={`${entry.isHidden ? 'Zveřejnit studentům' : 'Skrýt studentům'}: ${name}`}
              className={`${BTN} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300`}
            >
              {entry.isHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
              {entry.isHidden ? 'Zveřejnit studentům' : 'Skrýt studentům'}
            </button>
            {entry.isBuiltIn && entry.isEdited && (
              <button
                type="button"
                onClick={() => setPending({ action: 'revert', id: entry.id, name })}
                aria-label={`Vrátit výchozí znění: ${name}`}
                className={`${BTN} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300`}
              >
                <Undo2 className="w-3.5 h-3.5" />
                Výchozí znění
              </button>
            )}
            <button
              type="button"
              onClick={() => setPending({ action: 'remove', id: entry.id, name })}
              aria-label={`Odebrat ${noun} ${name}`}
              className={`${BTN} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Odebrat
            </button>
          </div>
        );
      })}

      {onAdd && (
        <button type="button" onClick={onAdd} className={`${BTN} bg-amber-500 hover:bg-amber-400 text-slate-950`}>
          <Plus className="w-3.5 h-3.5" />
          {addLabel ?? `Přidat ${noun}`}
        </button>
      )}

      {deleted.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-[0.6875rem] text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Odebrané (vrátit / smazat natrvalo):</span>
          {deleted.map((entry) => {
            const name = getName(entry.item);
            return (
              <span key={entry.id} className="inline-flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => content.restore(entry.id).then((r) => setError(r.error))}
                  aria-label={`Vrátit ${name}`}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  {name}
                </button>
                <button
                  type="button"
                  onClick={() => setPending({ action: 'purge', id: entry.id, name })}
                  aria-label={`Smazat ${name} natrvalo`}
                  className="p-1 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {(error || content.error) && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error ?? content.error}</p>
      )}

      <ConfirmDialog
        isOpen={pending !== null}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        confirmLabel={confirm?.label ?? ''}
        tone="danger"
        onCancel={() => setPending(null)}
        onConfirm={runPending}
      />
    </div>
  );
}
