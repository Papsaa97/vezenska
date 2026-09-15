import { useEffect, useMemo, useState } from 'react';
import { TagOption } from '../components/common/MaterialTagPicker';
import { DEFAULT_SUBJECTS } from '../utils/contentLibrary';
import { ClassBoardItem, fetchClassBoards } from '../utils/classBoardService';
import { useEditableContent } from './useEditableContent';

export interface MaterialTagOptions {
  subjectOptions: TagOption[];
  classOptions: TagOption[];
  classes: ClassBoardItem[];
  /** Název třídy podle id — pro popisky štítků u souboru. */
  classNameById: (id: string) => string | null;
}

/**
 * Nabídka štítků: předměty a třídy.
 *
 * Předměty se berou ze stejného seznamu jako záložka Předměty, takže nově
 * založený předmět jde označit hned. Třídy se čtou z nástěnek — jakmile někdo
 * třídu vytvoří, objeví se tady sama a soubory k ní jde přiřazovat, aniž by se
 * kdekoli něco nastavovalo.
 */
export function useMaterialTagOptions(includeHidden = true): MaterialTagOptions {
  // Ve správě souborů (includeHidden) musí být vidět i předmět, který lektor
  // studentům skryl — soubory k němu se přiřazují dál. V knihovně materiálů,
  // kam chodí i studenti, se skrytý předmět jako filtr nenabízí.
  const { entries } = useEditableContent('subject', DEFAULT_SUBJECTS, includeHidden);
  const [classes, setClasses] = useState<ClassBoardItem[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchClassBoards().then((result) => {
      if (mounted) setClasses(result.items);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const subjectOptions = useMemo(
    () =>
      entries
        .filter((entry) => !entry.isDeleted)
        .map((entry) => ({ value: entry.item.name, label: entry.item.name })),
    [entries]
  );

  const classOptions = useMemo(
    () => classes.map((item) => ({ value: item.id, label: item.className })),
    [classes]
  );

  const classNameById = useMemo(() => {
    const map = new Map(classes.map((item) => [item.id, item.className]));
    return (id: string) => map.get(id) ?? null;
  }, [classes]);

  return { subjectOptions, classOptions, classes, classNameById };
}
