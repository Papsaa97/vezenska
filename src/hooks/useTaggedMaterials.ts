import { useCallback, useEffect, useState } from 'react';
import {
  MATERIALS_UPDATED_EVENT,
  TaggedMaterial,
  loadTaggedMaterialsCached,
} from '../utils/materials';

export interface TaggedMaterialsState {
  materials: TaggedMaterial[];
  loading: boolean;
  /** Soubory se nepodařilo načíst — seznam je prázdný. */
  error: string | null;
  /** Štítky se nepodařilo načíst — soubory jsou, jen se zařadily podle složek. */
  tagsError: string | null;
  reload: () => Promise<void>;
}

/**
 * Soubory ze Storage i s jejich štítky.
 *
 * Sdílí vyrovnávací paměť s ostatními obrazovkami (materials.ts), takže
 * otevření detailu předmětu nebo nástěnky třídy nevyvolá nové listování
 * bucketu. Po nahrání, smazání nebo přeštítkování souboru se seznam překreslí
 * sám — správce souborů paměť zahodí událostí.
 */
export function useTaggedMaterials(): TaggedMaterialsState {
  const [materials, setMaterials] = useState<TaggedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    const result = await loadTaggedMaterialsCached(force);
    setMaterials(result.items);
    setError(result.error);
    setTagsError(result.tagsError);
    setLoading(false);
  }, []);

  const reload = useCallback(() => load(true), [load]);

  useEffect(() => {
    load(false);
  }, [load]);

  useEffect(() => {
    // Paměť je v tu chvíli už zahozená, takže stačí načíst znovu.
    const handleUpdate = () => { load(false); };
    window.addEventListener(MATERIALS_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(MATERIALS_UPDATED_EVENT, handleUpdate);
  }, [load]);

  return { materials, loading, error, tagsError, reload };
}
