import { supabase } from '../lib/supabase';

// ─── Soubory ve Storage a jejich štítky ──────────────────────────────────────
//
// Jeden soubor = jeden objekt v bucketu 'studijni-materialy'. O tom, ke kterým
// předmětům a třídám patří, dřív rozhodovala složka, ve které ležel — takže
// vždycky právě jeden předmět a žádná třída.
//
// Dnes je cesta ve Storage jen adresou a zařazení nese řádek v tabulce
// public.material_tags (migrace 027), kde je předmětů i tříd libovolný počet.
// Starší soubory ve složkách podle předmětu se tím neznehodnotily: nemají-li
// vlastní řádek se štítky, odvodí se předmět ze složky jako dřív.

export const MATERIALS_BUCKET = 'studijni-materialy';

/** Složka pro nově nahrávané soubory. O zařazení už nerozhoduje, je to jen adresa. */
export const MATERIALS_UPLOAD_FOLDER = 'materialy';

/** Složka s rozvrhy tříd — spravuje ji nástěnka, do knihovny materiálů nepatří. */
const SCHEDULES_FOLDER = 'rozvrhy';

/**
 * Historické složky podle předmětu a předmět, který z nich plyne.
 *
 * Klíče odpovídají názvům předmětů v `subjectsMeta` (subjectsInfo.ts), takže
 * starší soubor se ukáže u stejného předmětu jako soubor nově označený.
 */
export const LEGACY_FOLDER_SUBJECTS: Record<string, string> = {
  zop: 'ZOP',
  taktika: 'Taktika',
  penologie: 'Penologie',
  zbrane: 'Zbraně',
  pravo: 'Právo',
  etika: 'Profesní etika',
  administrativa: 'Vězeňská administrativa',
  ostatni: 'Ostatní',
};

const LEGACY_FOLDERS = Object.keys(LEGACY_FOLDER_SUBJECTS);

/** Všechny složky, které knihovna prochází. */
const LISTED_FOLDERS = [MATERIALS_UPLOAD_FOLDER, ...LEGACY_FOLDERS];

export const ALLOWED_UPLOAD_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ALLOWED_UPLOAD_EXT_LABEL = '.pdf, .doc(x), .ppt(x), .jpg, .png, .webp';

// ─── Typy ────────────────────────────────────────────────────────────────────

export interface StudyMaterial {
  /** Celá cesta v bucketu — podle ní se soubor stahuje, maže i štítkuje. */
  name: string;
  displayName: string;
  /** Předmět odvozený ze složky. Prázdný u nové složky 'materialy/'. */
  folderSubject: string;
  size: number;
  createdAt: string;
  mimeType: string;
}

export interface MaterialTagSet {
  subjects: string[];
  classIds: string[];
  displayName?: string;
}

export type MaterialTagMap = Record<string, MaterialTagSet>;

export interface TaggedMaterial extends StudyMaterial {
  /** Předměty, ke kterým soubor patří (ze štítků, jinak ze složky). */
  subjects: string[];
  /** Id tříd, ke kterým soubor patří. */
  classIds: string[];
  /** True, když soubor zatím žádný řádek se štítky nemá. */
  isUntagged: boolean;
}

export type MaterialFileKind = 'pdf' | 'word' | 'presentation' | 'image' | 'other';

// ─── Pomocné funkce ──────────────────────────────────────────────────────────

/**
 * Převede libovolný řetězec na ASCII-safe klíč použitelný v Supabase Storage.
 * Příklad: "Ostatní" → "ostatni", "Právo & Etika" → "pravo-etika"
 */
export function sanitizePath(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileKind(mimeType: string, fileName = ''): MaterialFileKind {
  const mime = (mimeType || '').toLowerCase();
  const ext = fileName.toLowerCase().split('.').pop() ?? '';

  if (mime.includes('pdf') || ext === 'pdf') return 'pdf';
  if (mime.includes('word') || mime.includes('wordprocessingml') || ext === 'doc' || ext === 'docx') {
    return 'word';
  }
  if (
    mime.includes('presentation') ||
    mime.includes('presentationml') ||
    ext === 'ppt' ||
    ext === 'pptx'
  ) {
    return 'presentation';
  }
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return 'image';
  }
  return 'other';
}

export function getFileTypeLabel(mimeType: string, fileName = ''): string {
  switch (getFileKind(mimeType, fileName)) {
    case 'pdf': return 'PDF';
    case 'word': return 'WORD';
    case 'presentation': return 'PREZENTACE';
    case 'image': return 'OBRÁZEK';
    default: return 'SOUBOR';
  }
}

type StorageObjMeta = { size?: number; mimetype?: string; lastModified?: string } | null;

function parseMaterial(storagePath: string, metadata: StorageObjMeta): StudyMaterial {
  const pathParts = storagePath.split('/');
  const folder = pathParts[0];
  const fileName = pathParts[pathParts.length - 1];

  // displayName: část před posledním '__'; bez oddělovače název bez přípony
  const underscoreIdx = fileName.lastIndexOf('__');
  const displayName =
    underscoreIdx !== -1 ? fileName.slice(0, underscoreIdx) : fileName.replace(/\.[^.]+$/, '');

  return {
    name: storagePath,
    displayName,
    folderSubject: LEGACY_FOLDER_SUBJECTS[folder] ?? '',
    size: metadata?.size ?? 0,
    createdAt: metadata?.lastModified ?? new Date().toISOString(),
    mimeType: metadata?.mimetype ?? 'application/octet-stream',
  };
}

// ─── Čtení souborů z bucketu ─────────────────────────────────────────────────

const PAGE_SIZE = 100;

async function listFolder(folder: string): Promise<StudyMaterial[]> {
  const found: StudyMaterial[] = [];
  let offset = 0;

  // Storage vrací nejvýš `limit` položek na dotaz. Dřív se bralo prvních 200
  // a zbytek tiše mizel; stránkování běží, dokud přichází plná stránka.
  for (;;) {
    const { data, error } = await supabase.storage
      .from(MATERIALS_BUCKET)
      .list(folder, { limit: PAGE_SIZE, offset, sortBy: { column: 'name', order: 'asc' } });

    if (error || !data) break;

    for (const obj of data) {
      if (obj.name === '.emptyFolderPlaceholder') continue;
      found.push(parseMaterial(`${folder}/${obj.name}`, obj.metadata as StorageObjMeta));
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return found;
}

export interface MaterialsFetchResult {
  items: StudyMaterial[];
  error: string | null;
}

/** Načte soubory ze všech sledovaných složek bucketu (bez rozvrhů tříd). */
export async function listMaterials(): Promise<MaterialsFetchResult> {
  try {
    const perFolder = await Promise.all(
      LISTED_FOLDERS.filter((f) => f !== SCHEDULES_FOLDER).map((folder) => listFolder(folder))
    );
    return { items: perFolder.flat(), error: null };
  } catch (err) {
    return {
      items: [],
      error: `Soubory se nepodařilo načíst (${err instanceof Error ? err.message : String(err)}).`,
    };
  }
}

// ─── Štítky ──────────────────────────────────────────────────────────────────

interface MaterialTagRow {
  storage_path: string;
  display_name: string | null;
  subjects: string[] | null;
  class_ids: string[] | null;
}

export interface MaterialTagsFetchResult {
  tags: MaterialTagMap;
  error: string | null;
}

/** Načte štítky všech souborů. Chybějící tabulka ani výpadek sítě není fatální. */
export async function fetchMaterialTags(): Promise<MaterialTagsFetchResult> {
  try {
    const { data, error } = await supabase
      .from('material_tags')
      .select('storage_path, display_name, subjects, class_ids');

    if (error) {
      return { tags: {}, error: `Štítky souborů se nepodařilo načíst (${error.message}).` };
    }

    const tags: MaterialTagMap = {};
    for (const row of (data ?? []) as MaterialTagRow[]) {
      tags[row.storage_path] = {
        subjects: row.subjects ?? [],
        classIds: row.class_ids ?? [],
        displayName: row.display_name ?? undefined,
      };
    }
    return { tags, error: null };
  } catch (err) {
    return {
      tags: {},
      error: `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`,
    };
  }
}

export interface TagWriteResult {
  persisted: boolean;
  error: string | null;
}

/**
 * Uloží štítky jednoho souboru. Prázdné pole je platná hodnota — znamená
 * „soubor nepatří nikam", ne „odvoď si to ze složky".
 */
export async function saveMaterialTags(
  storagePath: string,
  tags: MaterialTagSet,
  userEmail?: string | null
): Promise<TagWriteResult> {
  try {
    const { error } = await supabase.from('material_tags').upsert(
      {
        storage_path: storagePath,
        display_name: tags.displayName ?? null,
        subjects: tags.subjects,
        class_ids: tags.classIds,
        updated_at: new Date().toISOString(),
        updated_by: userEmail ?? null,
      },
      { onConflict: 'storage_path' }
    );

    if (error) {
      return { persisted: false, error: `Štítky se nepodařilo uložit (${error.message}).` };
    }
    return { persisted: true, error: null };
  } catch (err) {
    return {
      persisted: false,
      error: `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`,
    };
  }
}

/** Smaže řádek se štítky — volá se, když ze Storage mizí i samotný soubor. */
export async function deleteMaterialTags(storagePaths: string[]): Promise<TagWriteResult> {
  if (storagePaths.length === 0) return { persisted: true, error: null };
  try {
    const { error } = await supabase
      .from('material_tags')
      .delete()
      .in('storage_path', storagePaths);

    if (error) {
      return { persisted: false, error: `Štítky se nepodařilo smazat (${error.message}).` };
    }
    return { persisted: true, error: null };
  } catch (err) {
    return {
      persisted: false,
      error: `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`,
    };
  }
}

// ─── Soubory se štítky pohromadě ─────────────────────────────────────────────

export interface TaggedMaterialsResult {
  items: TaggedMaterial[];
  /** Chyba při čtení souborů — bez nich není co zobrazit. */
  error: string | null;
  /** Chyba při čtení štítků. Soubory se ukážou, jen se zařadí podle složek. */
  tagsError: string | null;
}

/** Spojí soubory z bucketu s jejich štítky do jednoho seznamu. */
export async function loadTaggedMaterials(): Promise<TaggedMaterialsResult> {
  const [filesResult, tagsResult] = await Promise.all([listMaterials(), fetchMaterialTags()]);

  const items = filesResult.items.map((material) =>
    applyTags(material, tagsResult.tags[material.name])
  );

  return { items, error: filesResult.error, tagsError: tagsResult.error };
}

/**
 * Doplní souboru jeho štítky. Bez řádku v `material_tags` se předmět odvodí
 * ze složky, ve které soubor leží — tím se starší materiály neztratí.
 */
export function applyTags(material: StudyMaterial, tags?: MaterialTagSet): TaggedMaterial {
  if (!tags) {
    return {
      ...material,
      subjects: material.folderSubject ? [material.folderSubject] : [],
      classIds: [],
      isUntagged: true,
    };
  }

  return {
    ...material,
    displayName: tags.displayName?.trim() || material.displayName,
    subjects: tags.subjects,
    classIds: tags.classIds,
    isUntagged: false,
  };
}

export function materialsForSubject(items: TaggedMaterial[], subject: string): TaggedMaterial[] {
  const needle = normalizeTag(subject);
  return items.filter((m) => m.subjects.some((s) => normalizeTag(s) === needle));
}

export function materialsForClass(items: TaggedMaterial[], classId: string): TaggedMaterial[] {
  return items.filter((m) => m.classIds.includes(classId));
}

/** Porovnání štítků bez ohledu na diakritiku a velikost písmen. */
export function normalizeTag(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

// ─── Nahrání a stažení ───────────────────────────────────────────────────────

export interface UploadResult {
  storagePath: string | null;
  error: string | null;
}

/** Nahraje soubor do složky 'materialy/' pod ASCII-safe názvem. */
export async function uploadMaterial(file: File, displayName: string): Promise<UploadResult> {
  if (!ALLOWED_UPLOAD_MIME.includes(file.type)) {
    return { storagePath: null, error: `Nepodporovaný typ souboru: ${file.name}` };
  }

  const ext = file.name.split('.').pop() ?? 'bin';
  const safeName = sanitizePath(displayName.trim()) || 'soubor';
  // Časové razítko drží cesty jedinečné i pro dva soubory téhož jména.
  const storagePath = `${MATERIALS_UPLOAD_FOLDER}/${safeName}__${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 6)}.${ext}`;

  const { error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (error) {
    return { storagePath: null, error: `Nahrání „${displayName}" selhalo: ${error.message}` };
  }
  return { storagePath, error: null };
}

/** Smaže soubor i jeho štítky. */
export async function deleteMaterial(storagePath: string): Promise<TagWriteResult> {
  const { error } = await supabase.storage.from(MATERIALS_BUCKET).remove([storagePath]);
  if (error) {
    return { persisted: false, error: `Smazání selhalo: ${error.message}` };
  }
  // Osiřelý řádek se štítky by v seznamech nic nezobrazil, ale zůstal by
  // v databázi natrvalo — soubor, na který ukazuje, už neexistuje.
  await deleteMaterialTags([storagePath]);
  return { persisted: true, error: null };
}

/** Veřejná URL souboru — bucket je veřejně čitelný (migrace 012). */
export function getMaterialUrl(storagePath: string): string {
  const { data } = supabase.storage.from(MATERIALS_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl ?? '';
}

/** Stáhne soubor do zařízení pod čitelným názvem. */
export async function downloadMaterial(material: StudyMaterial): Promise<string | null> {
  const { data, error } = await supabase.storage.from(MATERIALS_BUCKET).download(material.name);
  if (error || !data) {
    return `Stahování selhalo: ${error?.message ?? 'Neznámá chyba'}`;
  }

  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  const ext = material.name.split('.').pop() ?? 'bin';
  a.download = `${material.displayName}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
  return null;
}

// ─── Sdílená vyrovnávací paměť ───────────────────────────────────────────────
//
// Seznam souborů potřebuje knihovna, správce souborů, detail předmětu i každá
// nástěnka třídy. Bez společné paměti by si každá obrazovka při otevření znovu
// vylistovala celý bucket. Platnost je krátká a po každé změně (nahrání,
// smazání, přeštítkování) se paměť zahazuje událostí, na kterou obrazovky
// reagují překreslením.

export const MATERIALS_UPDATED_EVENT = 'vscr:materials_updated';

const CACHE_TTL_MS = 60_000;

let materialsCache: { result: TaggedMaterialsResult; at: number } | null = null;
let materialsInFlight: Promise<TaggedMaterialsResult> | null = null;

/** Načte soubory se štítky, nejvýš jednou za minutu. */
export async function loadTaggedMaterialsCached(force = false): Promise<TaggedMaterialsResult> {
  if (!force && materialsCache && Date.now() - materialsCache.at < CACHE_TTL_MS) {
    return materialsCache.result;
  }
  // Dvě obrazovky, které se otevřou naráz, sdílí jeden dotaz místo dvou.
  if (!force && materialsInFlight) return materialsInFlight;

  materialsInFlight = loadTaggedMaterials()
    .then((result) => {
      // Neúspěšné načtení se neukládá — příští pokus má začít načisto.
      if (!result.error) materialsCache = { result, at: Date.now() };
      return result;
    })
    .finally(() => {
      materialsInFlight = null;
    });

  return materialsInFlight;
}

/** Zahodí paměť a dá vědět otevřeným obrazovkám, že se mají načíst znovu. */
export function invalidateMaterialsCache(): void {
  materialsCache = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MATERIALS_UPDATED_EVENT));
  }
}
