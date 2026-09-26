import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ContentBlock,
  ContentEntry,
  ContentKind,
  PersistResult,
  deleteContentItem,
  fetchContentOverlay,
  mergeContent,
  purgeContentItem,
  restoreContentItem,
  saveContentItem,
} from '../utils/contentLibrary';

export interface EditableContent<T extends { id: string }> {
  /** Položky k vykreslení. Lektor v nich má i skryté a smazané, student ne. */
  entries: ContentEntry<T>[];
  /** Jen samotný obsah — pro místa, která o stavu položky nic vědět nepotřebují. */
  items: T[];
  loading: boolean;
  /** Chyba při načítání překryvu. Obsah se i tak ukáže, jen z výchozích dat. */
  error: string | null;
  source: 'server' | 'local';
  reload: () => Promise<void>;
  save: (item: T, options?: { isHidden?: boolean }) => Promise<PersistResult>;
  remove: (id: string) => Promise<PersistResult>;
  restore: (id: string) => Promise<PersistResult>;
  /** Smaže odebranou položku natrvalo — zmizí i z přehledu odebraných. */
  purge: (id: string) => Promise<PersistResult>;
  toggleHidden: (id: string) => Promise<PersistResult>;
}

/**
 * Obsah záložky složený z výchozích dat repozitáře a úprav z databáze.
 *
 * `defaults` musí být stabilní reference (modulové pole nebo `useMemo`),
 * jinak se přepočítává při každém překreslení.
 */
export function useEditableContent<T extends { id: string }>(
  kind: ContentKind,
  defaults: T[],
  canEdit: boolean
): EditableContent<T> {
  const [blocks, setBlocks] = useState<Record<string, ContentBlock<T>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'server' | 'local'>('local');

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await fetchContentOverlay<T>(kind);
    setBlocks(result.blocks);
    setSource(result.source);
    setError(result.error);
    setLoading(false);
  }, [kind]);

  useEffect(() => {
    reload();
  }, [reload]);

  const entries = useMemo(
    () => mergeContent(defaults, blocks, { includeHidden: canEdit }),
    [defaults, blocks, canEdit]
  );

  const items = useMemo(
    () => entries.filter((entry) => !entry.isDeleted).map((entry) => entry.item),
    [entries]
  );

  const findEntry = useCallback((id: string) => entries.find((e) => e.id === id), [entries]);

  const save = useCallback(
    async (item: T, options?: { isHidden?: boolean }) => {
      const existing = entries.find((e) => e.id === item.id);
      const result = await saveContentItem(kind, item, {
        isHidden: options?.isHidden ?? existing?.isHidden ?? false,
      });
      await reload();
      return result;
    },
    [kind, entries, reload]
  );

  const remove = useCallback(
    async (id: string) => {
      const entry = findEntry(id);
      if (!entry) return { persisted: false, error: 'Položka už v seznamu není.' };
      const result = await deleteContentItem(kind, entry.item, entry.isBuiltIn);
      await reload();
      return result;
    },
    [kind, findEntry, reload]
  );

  const restore = useCallback(
    async (id: string) => {
      const result = await restoreContentItem(kind, id);
      await reload();
      return result;
    },
    [kind, reload]
  );

  const purge = useCallback(
    async (id: string) => {
      const entry = findEntry(id);
      if (!entry) return { persisted: false, error: 'Položka už v seznamu není.' };
      const result = await purgeContentItem(kind, entry.item, entry.isBuiltIn);
      await reload();
      return result;
    },
    [kind, findEntry, reload]
  );

  const toggleHidden = useCallback(
    async (id: string) => {
      const entry = findEntry(id);
      if (!entry) return { persisted: false, error: 'Položka už v seznamu není.' };
      const result = await saveContentItem(kind, entry.item, { isHidden: !entry.isHidden });
      await reload();
      return result;
    },
    [kind, findEntry, reload]
  );

  return { entries, items, loading, error, source, reload, save, remove, restore, purge, toggleHidden };
}
