import { supabase } from '../lib/supabase';
import { MatchingCategory, MatchingPair, MatchingDiagramPart } from '../types';
import { SubjectInfo, subjectsMeta } from '../data/questions/subjectsInfo';
import { Scenario, ScenarioStep, ScenarioChoice } from '../data/scenariosData';
import { StoppageDrill, WeaponData, WeaponStep } from '../data/weaponsData';
import { Jidelnicek } from '../data/jidelnicek';
import { VscrRegulation } from '../data/vscrRegulationsRegistry';
import { DilemmaOption, DilemmaScenario } from '../data/professionalEthicsData';
import { STUDY_SECTION_AREAS, StudySection, StudySectionItem } from '../data/studySections';
import {
  BODY_PARTS,
  RecordTemplate,
  StyleExercise,
  StyleExerciseSegment,
  defaultRecordTemplates,
} from '../data/prisonAdminData';

// ─── Editovatelný obsah záložek ──────────────────────────────────────────────
//
// Předměty, poznávačky a modelové situace jsou v repozitáři (subjectsInfo.ts,
// questionsData.ts, scenariosData.ts). Aby je lektor mohl v průběhu let měnit
// bez zásahu do kódu, leží nad nimi PŘEKRYV — tabulka public.content_blocks
// (migrace 027):
//
//   • řádek se stejným id jako výchozí položka → nahradí její obsah
//   • řádek s novým id                         → přidá položku navíc
//   • is_deleted = true                        → schová výchozí položku
//   • is_hidden  = true                        → skryje ji studentům, lektor ji vidí
//   • is_deleted = true a is_hidden = true     → smazáno natrvalo: nevidí ji ani
//                                                lektor, v přehledu nepřekáží
//
// Výchozí data tím zůstávají nedotčená: smazáním řádku překryvu se aplikace
// vrátí přesně k tomu, co je v repozitáři. Proto se výchozí položka nemaže
// natvrdo, ale „náhrobkem“ (is_deleted) — jinak by ji zpátky nedostal nikdo.

/**
 * Druhy obsahu. Musí odpovídat CHECK `content_blocks_kind_check` v databázi —
 * 'weapon', 'stoppage_drill' a 'jidelnicek' přidává migrace 040, 'regulation' migrace 041,
 * 'ethics_dilemma', 'study_section', 'admin_template' a 'admin_exercise' migrace 042.
 */
export type ContentKind =
  | 'subject'
  | 'matching_category'
  | 'scenario'
  | 'weapon'
  | 'stoppage_drill'
  | 'jidelnicek'
  | 'regulation'
  | 'ethics_dilemma'
  | 'study_section'
  | 'admin_template'
  | 'admin_exercise';

/**
 * Předměty tak, jak jsou v repozitáři. Překryv z databáze je může přepsat,
 * doplnit i schovat — viz mergeContent().
 *
 * Modulová konstanta záměrně: hooky ji dostávají jako závislost a nová
 * reference při každém překreslení by je nutila počítat seznam pořád dokola.
 */
export const DEFAULT_SUBJECTS: SubjectInfo[] = Object.values(subjectsMeta);

export interface ContentBlock<T> {
  /** Id položky BEZ prefixu druhu — tedy id předmětu, kategorie či scénáře. */
  itemId: string;
  kind: ContentKind;
  payload: T | null;
  sortOrder: number;
  isHidden: boolean;
  isDeleted: boolean;
  updatedAt: string;
  updatedBy?: string | null;
}

/** Položka tak, jak ji má vykreslit obrazovka: obsah plus jeho původ a stav. */
export interface ContentEntry<T> {
  id: string;
  item: T;
  /** Pochází z repozitáře (byť třeba přepsaná překryvem). */
  isBuiltIn: boolean;
  /** Výchozí položka, kterou někdo upravil. */
  isEdited: boolean;
  /** Skrytá studentům. */
  isHidden: boolean;
  /** Výchozí položka schovaná náhrobkem — viditelná jen lektorovi k obnovení. */
  isDeleted: boolean;
  /** Kdy obsah naposledy uložil lektor (ISO); u neupravené položky chybí. */
  editedAt?: string;
}

export interface PersistResult {
  persisted: boolean;
  error: string | null;
}

export interface OverlayResult<T> {
  blocks: Record<string, ContentBlock<T>>;
  source: 'server' | 'local';
  error: string | null;
}

// ─── Lokální záloha ──────────────────────────────────────────────────────────

const CACHE_PREFIX = 'vscr_content_blocks_';

function cacheKey(kind: ContentKind): string {
  return `${CACHE_PREFIX}${kind}`;
}

function loadCache<T>(kind: ContentKind): Record<string, ContentBlock<T>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(cacheKey(kind));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, ContentBlock<T>>;
  } catch {
    return {};
  }
}

function saveCache<T>(kind: ContentKind, blocks: Record<string, ContentBlock<T>>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(cacheKey(kind), JSON.stringify(blocks));
  } catch (err) {
    console.error('[contentLibrary] Překryv se nepodařilo uložit do zařízení:', err);
  }
}

// ─── Kontrola tvaru dat ──────────────────────────────────────────────────────
//
// V JSONB může být cokoli — třeba záznam z dřívější verze aplikace nebo ručně
// upravený řádek. Každý druh obsahu proto má funkci, která hodnotu buď převede
// na očekávaný tvar, nebo vrátí null. Vadný řádek se přeskočí a obrazovka
// ukáže výchozí položku místo prázdna nebo pádu.

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function strArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function record(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeSubject(value: unknown): SubjectInfo | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const name = str(raw.name).trim();
  if (!id || !name) return null;

  return {
    id,
    name,
    code: str(raw.code).trim() || name.slice(0, 3).toUpperCase(),
    iconName: str(raw.iconName).trim() || 'BookOpen',
    badgeColor: str(raw.badgeColor).trim() ||
      'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    accentColor: str(raw.accentColor).trim() || 'indigo',
    description: str(raw.description),
    legalFramework: strArray(raw.legalFramework),
    keyTopics: strArray(raw.keyTopics),
    examRequirements: str(raw.examRequirements),
  };
}

function normalizeMatchingCategory(value: unknown): MatchingCategory | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const title = str(raw.title).trim();
  if (!id || !title) return null;

  const pairs: MatchingPair[] = Array.isArray(raw.pairs)
    ? raw.pairs
        .map((p) => {
          const pr = record(p);
          if (!pr) return null;
          const pairId = str(pr.id).trim();
          const left = str(pr.left).trim();
          const right = str(pr.right).trim();
          if (!pairId || !left || !right) return null;
          return { id: pairId, left, right };
        })
        .filter((p): p is MatchingPair => p !== null)
    : [];

  const parts: MatchingDiagramPart[] = Array.isArray(raw.parts)
    ? raw.parts
        .map((p): MatchingDiagramPart | null => {
          const pr = record(p);
          if (!pr) return null;
          const partId = str(pr.id).trim();
          const label = str(pr.label).trim();
          if (!partId || !label) return null;
          return {
            id: partId,
            label,
            top: typeof pr.top === 'number' ? pr.top : 50,
            left: typeof pr.left === 'number' ? pr.left : 50,
            labelTop: typeof pr.labelTop === 'number' ? pr.labelTop : undefined,
            labelLeft: typeof pr.labelLeft === 'number' ? pr.labelLeft : undefined,
          };
        })
        .filter((p): p is MatchingDiagramPart => p !== null)
    : [];

  const type = raw.type === 'diagram' ? 'diagram' : 'classic';

  // Poznávačka bez dvojic (u diagramu bez částí) by se otevřela jako prázdná
  // hra, ze které nejde vyhrát — taková položka se do seznamu nepustí.
  if (type === 'diagram' ? parts.length === 0 : pairs.length === 0) return null;

  return {
    id,
    title,
    type,
    imageUrl: str(raw.imageUrl).trim() || undefined,
    parts: parts.length > 0 ? parts : undefined,
    pairs,
  };
}

const SCENARIO_CATEGORIES: Scenario['category'][] = [
  'Právo, etika & Donucovací prostředky',
  'Mimořádné události & Zásah',
  'Eskorty & Střelba',
  'Ostraha, vstupy & Justiční stráž',
];

// Dřívější názvy kategorií. Situace, které lektor uložil ještě pod nimi, se
// tak nepřesunou do první kategorie v seznamu.
const LEGACY_SCENARIO_CATEGORIES: Record<string, Scenario['category']> = {
  'Vstupy & Justiční stráž': 'Ostraha, vstupy & Justiční stráž',
  'Právo & Donucovací prostředky': 'Právo, etika & Donucovací prostředky',
};

const SCENARIO_DIFFICULTIES: Scenario['difficulty'][] = ['Základní', 'Pokročilá', 'Expertní'];

function normalizeScenario(value: unknown): Scenario | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const title = str(raw.title).trim();
  if (!id || !title) return null;

  const steps: ScenarioStep[] = Array.isArray(raw.steps)
    ? raw.steps
        .map((s) => {
          const sr = record(s);
          if (!sr) return null;
          const stepId = str(sr.id).trim();
          if (!stepId) return null;

          const choices: ScenarioChoice[] = Array.isArray(sr.choices)
            ? sr.choices
                .map((c): ScenarioChoice | null => {
                  const cr = record(c);
                  if (!cr) return null;
                  const choiceId = str(cr.id).trim();
                  const text = str(cr.text).trim();
                  if (!choiceId || !text) return null;
                  return {
                    id: choiceId,
                    text,
                    isCorrect: cr.isCorrect === true,
                    feedback: str(cr.feedback),
                    legalBasis: str(cr.legalBasis),
                    nextStepId: str(cr.nextStepId).trim() || undefined,
                  };
                })
                .filter((c): c is ScenarioChoice => c !== null)
            : [];

          if (choices.length === 0) return null;

          return {
            id: stepId,
            title: str(sr.title).trim() || 'Krok',
            description: str(sr.description),
            choices,
          };
        })
        .filter((s): s is ScenarioStep => s !== null)
    : [];

  if (steps.length === 0) return null;

  const category =
    SCENARIO_CATEGORIES.find((c) => c === raw.category) ??
    LEGACY_SCENARIO_CATEGORIES[str(raw.category)] ??
    SCENARIO_CATEGORIES[0];
  const difficulty = SCENARIO_DIFFICULTIES.find((d) => d === raw.difficulty) ?? 'Základní';

  return {
    id,
    title,
    category,
    badge: str(raw.badge).trim() || 'Modelová situace',
    difficulty,
    briefing: str(raw.briefing),
    steps,
  };
}

function normalizeWeaponSteps(value: unknown): WeaponStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((s) => {
      const sr = record(s);
      if (!sr) return null;
      const title = str(sr.title).trim();
      const actionInstruction = str(sr.actionInstruction).trim();
      if (!title || !actionInstruction) return null;
      return {
        title,
        actionInstruction,
        whyCrucial: str(sr.whyCrucial),
        dangerIfOmitted: str(sr.dangerIfOmitted),
      };
    })
    .filter((s): s is Omit<WeaponStep, 'stepNumber'> => s !== null)
    .map((s, i) => ({ ...s, stepNumber: i + 1 }));
}

function normalizeWeapon(value: unknown): WeaponData | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const name = str(raw.name).trim();
  if (!id || !name) return null;

  const safetySteps = normalizeWeaponSteps(raw.safetySteps);
  const disassemblySteps = normalizeWeaponSteps(raw.disassemblySteps);
  // Zbraň bez postupu by se otevřela na prázdném nácviku.
  if (safetySteps.length === 0 || disassemblySteps.length === 0) return null;

  const technicalSpecs = Array.isArray(raw.technicalSpecs)
    ? raw.technicalSpecs
        .map((t) => {
          const tr = record(t);
          if (!tr) return null;
          const label = str(tr.label).trim();
          const specValue = str(tr.value).trim();
          return label && specValue ? { label, value: specValue } : null;
        })
        .filter((t): t is { label: string; value: string } => t !== null)
    : [];

  return {
    id,
    name,
    caliber: str(raw.caliber),
    capacity: str(raw.capacity),
    serviceRole: str(raw.serviceRole),
    technicalSpecs,
    safetySteps,
    disassemblySteps,
  };
}

function normalizeStoppageDrill(value: unknown): StoppageDrill | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const name = str(raw.name).trim();
  if (!id || !name) return null;

  const options = Array.isArray(raw.options)
    ? raw.options
        .map((o) => {
          const or = record(o);
          if (!or) return null;
          const text = str(or.text).trim();
          if (!text) return null;
          return { text, isCorrect: or.isCorrect === true, feedback: str(or.feedback) };
        })
        .filter((o): o is StoppageDrill['options'][number] => o !== null)
    : [];
  // Bez správné volby by závada nešla splnit.
  if (options.length < 2 || !options.some((o) => o.isCorrect)) return null;

  return {
    id,
    name,
    symptom: str(raw.symptom),
    cause: str(raw.cause),
    correctAction: str(raw.correctAction),
    whyCorrect: str(raw.whyCorrect),
    dangerOfWrongAction: str(raw.dangerOfWrongAction),
    options,
  };
}

function normalizeJidelnicek(value: unknown): Jidelnicek | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  if (!id) return null;
  const days = Array.isArray(raw.days)
    ? raw.days
        .map((d) => {
          const dr = record(d);
          if (!dr) return null;
          const day = str(dr.day).trim();
          if (!day) return null;
          return { day, meals: str(dr.meals) };
        })
        .filter((d): d is Jidelnicek['days'][number] => d !== null)
    : [];
  return {
    id,
    weekLabel: str(raw.weekLabel),
    note: str(raw.note),
    days,
  };
}

const REGULATION_TYPES: VscrRegulation['type'][] = ['zakon', 'vyhlaska', 'ngr', 'instrukce', 'ustava_mezinarodni'];
const REGULATION_IMPORTANCE: VscrRegulation['importanceForZOP'][] = [
  'Klíčový (ZOP A)',
  'Velmi vysoký',
  'Vysoký',
  'Informační',
];

function normalizeRegulation(value: unknown): VscrRegulation | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const code = str(raw.code).trim();
  const title = str(raw.title).trim();
  if (!id || !code || !title) return null;
  const type = REGULATION_TYPES.find((t) => t === raw.type) ?? 'ngr';
  const importance = REGULATION_IMPORTANCE.find((i) => i === raw.importanceForZOP) ?? 'Vysoký';
  return {
    id,
    code,
    title,
    shortTitle: str(raw.shortTitle).trim() || code,
    type,
    authority: str(raw.authority),
    effectiveFrom: str(raw.effectiveFrom) || undefined,
    lastAmendment: str(raw.lastAmendment) || undefined,
    scope: str(raw.scope),
    keyProvisions: strArray(raw.keyProvisions),
    importanceForZOP: importance,
    tags: strArray(raw.tags),
    summary: str(raw.summary),
    practicalApplication: str(raw.practicalApplication),
    officialUrl: str(raw.officialUrl) || undefined,
    fullLegalText: str(raw.fullLegalText),
  };
}

function normalizeEthicsDilemma(value: unknown): DilemmaScenario | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const title = str(raw.title).trim();
  if (!id || !title) return null;

  const options = Array.isArray(raw.options)
    ? raw.options
        .map((o): DilemmaOption | null => {
          const or = record(o);
          if (!or) return null;
          const text = str(or.text).trim();
          if (!text) return null;
          return { text, correct: or.correct === true, explanation: str(or.explanation) };
        })
        .filter((o): o is DilemmaOption => o !== null)
    : [];
  // Situace bez správné volby by nešla vyřešit a bez alternativy není co volit.
  if (options.length < 2 || !options.some((o) => o.correct)) return null;

  return { id, title, description: str(raw.description), options };
}

/** Stupeň 1–5 pro katalog korupčních rizik; cokoli jiného se zahodí. */
function ratingValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5 ? value : undefined;
}

function normalizeStudySection(value: unknown): StudySection | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const title = str(raw.title).trim();
  const area = STUDY_SECTION_AREAS.find((a) => a === raw.area);
  // Bez podzáložky by blok nebylo kam vykreslit.
  if (!id || !title || !area) return null;

  const items = Array.isArray(raw.items)
    ? raw.items
        .map((i): StudySectionItem | null => {
          const ir = record(i);
          if (!ir) return null;
          const item: StudySectionItem = {
            label: str(ir.label).trim(),
            title: str(ir.title).trim(),
            text: str(ir.text).trim(),
            note: str(ir.note).trim(),
          };
          if (!item.label && !item.title && !item.text && !item.note) return null;
          const probability = ratingValue(ir.probability);
          const impact = ratingValue(ir.impact);
          // Míra rizika je součin — jedno číslo bez druhého nedává smysl.
          if (probability !== undefined && impact !== undefined) {
            item.probability = probability;
            item.impact = impact;
          }
          return item;
        })
        .filter((i): i is StudySectionItem => i !== null)
    : [];

  const intro = str(raw.intro).trim();
  const outro = str(raw.outro).trim();
  // Prázdný blok by na obrazovce zůstal jako osiřelý nadpis.
  if (items.length === 0 && !intro && !outro) return null;

  return { id, area, title, kicker: str(raw.kicker).trim(), intro, items, outro };
}

const RECORD_TEMPLATES_BY_ID = new Map(defaultRecordTemplates.map((t) => [t.id, t]));
const BODY_PART_IDS = new Set(BODY_PARTS.map((p) => p.id));

function normalizeAdminTemplate(value: unknown): RecordTemplate | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const title = str(raw.title).trim();
  // Formulář i tisková podoba každého tiskopisu jsou v kódu, takže nový
  // tiskopis by neměl čím se vykreslit. Přijímá se jen úprava stávajícího.
  const base = RECORD_TEMPLATES_BY_ID.get(id);
  if (!base || !title) return null;

  // Vzor smí vyplnit jen pole, která formulář daného tiskopisu má; neznámé
  // klíče by se nikde nezobrazily, ale do konceptů by se tiše kopírovaly.
  const rawData = record(raw.defaultData) ?? {};
  const defaultData: Record<string, string> = {};
  for (const key of Object.keys(base.defaultData)) {
    defaultData[key] = typeof rawData[key] === 'string' ? (rawData[key] as string) : '';
  }

  const template: RecordTemplate = {
    id,
    title,
    subtitle: str(raw.subtitle),
    badge: str(raw.badge).trim() || base.badge,
    normReference: str(raw.normReference) || base.normReference,
    defaultData,
  };
  if (base.affectedBodyPartsDefault) {
    template.affectedBodyPartsDefault = strArray(raw.affectedBodyPartsDefault).filter((p) => BODY_PART_IDS.has(p));
  }
  return template;
}

function normalizeAdminExercise(value: unknown): StyleExercise | null {
  const raw = record(value);
  if (!raw) return null;
  const id = str(raw.id).trim();
  const title = str(raw.title).trim();
  if (!id || !title) return null;

  const segments = Array.isArray(raw.originalTextSegments)
    ? raw.originalTextSegments
        .map((seg) => {
          const sr = record(seg);
          if (!sr) return null;
          // Mezery na okrajích se neořezávají: úseky se skládají za sebe
          // do jednoho odstavce a mezera na konci úseku odděluje slova.
          const text = str(sr.text);
          if (!text.trim()) return null;
          return { text, isError: sr.isError === true, correction: str(sr.correction).trim() };
        })
        .filter((seg): seg is Omit<StyleExerciseSegment, 'id'> => seg !== null)
        // Id úseku jen rozlišuje, co student označil — stačí pořadí.
        .map((seg, i) => ({ ...seg, id: i + 1 }))
    : [];
  // Cvičení bez jediné chyby by nebylo co hledat.
  if (segments.length === 0 || !segments.some((seg) => seg.isError)) return null;

  return {
    id,
    title,
    badge: str(raw.badge).trim() || title,
    instruction: str(raw.instruction),
    originalTextSegments: segments,
  };
}

const NORMALIZERS: Record<ContentKind, (value: unknown) => unknown> = {
  subject: normalizeSubject,
  matching_category: normalizeMatchingCategory,
  scenario: normalizeScenario,
  weapon: normalizeWeapon,
  stoppage_drill: normalizeStoppageDrill,
  jidelnicek: normalizeJidelnicek,
  regulation: normalizeRegulation,
  ethics_dilemma: normalizeEthicsDilemma,
  study_section: normalizeStudySection,
  admin_template: normalizeAdminTemplate,
  admin_exercise: normalizeAdminExercise,
};

// ─── Čtení překryvu ──────────────────────────────────────────────────────────

interface ContentBlockRow {
  id: string;
  kind: string;
  payload: unknown;
  sort_order: number | null;
  is_hidden: boolean | null;
  is_deleted: boolean | null;
  updated_at: string | null;
  updated_by: string | null;
}

/** Id řádku v databázi. Tabulka je společná pro všechny druhy, proto prefix. */
function rowId(kind: ContentKind, itemId: string): string {
  return `${kind}:${itemId}`;
}

function mapRow<T>(kind: ContentKind, row: ContentBlockRow): ContentBlock<T> | null {
  const prefix = `${kind}:`;
  if (!row.id.startsWith(prefix)) return null;
  const itemId = row.id.slice(prefix.length);
  if (!itemId) return null;

  const normalized = NORMALIZERS[kind](row.payload) as T | null;

  return {
    itemId,
    kind,
    payload: normalized,
    sortOrder: row.sort_order ?? 0,
    isHidden: row.is_hidden === true,
    isDeleted: row.is_deleted === true,
    updatedAt: row.updated_at ?? new Date().toISOString(),
    updatedBy: row.updated_by,
  };
}

/** Načte překryv daného druhu. Při výpadku serveru sáhne po lokální záloze. */
export async function fetchContentOverlay<T>(kind: ContentKind): Promise<OverlayResult<T>> {
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('id, kind, payload, sort_order, is_hidden, is_deleted, updated_at, updated_by')
      .eq('kind', kind);

    if (error) {
      return {
        blocks: loadCache<T>(kind),
        source: 'local',
        error: `Úpravy obsahu se nepodařilo načíst ze serveru (${error.message}).`,
      };
    }

    const blocks: Record<string, ContentBlock<T>> = {};
    for (const row of (data ?? []) as ContentBlockRow[]) {
      const block = mapRow<T>(kind, row);
      if (block) blocks[block.itemId] = block;
    }

    saveCache(kind, blocks);
    return { blocks, source: 'server', error: null };
  } catch (err) {
    return {
      blocks: loadCache<T>(kind),
      source: 'local',
      error: `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`,
    };
  }
}

// ─── Složení výchozích dat s překryvem ───────────────────────────────────────

export interface MergeOptions {
  /**
   * Vidí volající i to, co je studentům skryté? Lektor ano — potřebuje skrytou
   * i smazanou položku vidět, aby ji mohl vrátit zpět.
   */
  includeHidden?: boolean;
}

/**
 * Výchozí položka smazaná natrvalo. Náhrobek zůstává (výchozí data jsou
 * v repozitáři a bez něj by se vrátila), ale lektorovi už se nenabízí
 * k obnovení — jinak by v přehledu visel navždy.
 */
function isPurged(block: ContentBlock<unknown>): boolean {
  return block.isDeleted && block.isHidden;
}

export function mergeContent<T extends { id: string }>(
  defaults: T[],
  blocks: Record<string, ContentBlock<T>>,
  options: MergeOptions = {}
): ContentEntry<T>[] {
  const includeHidden = options.includeHidden === true;
  const entries: ContentEntry<T>[] = [];
  const usedIds = new Set<string>();

  for (const base of defaults) {
    usedIds.add(base.id);
    const block = blocks[base.id];

    if (!block) {
      entries.push({ id: base.id, item: base, isBuiltIn: true, isEdited: false, isHidden: false, isDeleted: false });
      continue;
    }

    if (isPurged(block)) continue;
    if (block.isDeleted && !includeHidden) continue;
    if (block.isHidden && !includeHidden) continue;

    entries.push({
      id: base.id,
      item: block.payload ?? base,
      isBuiltIn: true,
      isEdited: block.payload !== null,
      isHidden: block.isHidden,
      isDeleted: block.isDeleted,
      editedAt: block.payload !== null ? block.updatedAt : undefined,
    });
  }

  // Položky, které ve výchozích datech nejsou — přidal je někdo v aplikaci.
  const custom = Object.values(blocks)
    .filter((block) => !usedIds.has(block.itemId) && block.payload !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.updatedAt.localeCompare(b.updatedAt));

  for (const block of custom) {
    if (isPurged(block)) continue;
    if (block.isDeleted && !includeHidden) continue;
    if (block.isHidden && !includeHidden) continue;
    entries.push({
      id: block.itemId,
      item: block.payload as T,
      isBuiltIn: false,
      isEdited: true,
      isHidden: block.isHidden,
      isDeleted: block.isDeleted,
      editedAt: block.updatedAt,
    });
  }

  return entries;
}

// ─── Zápis ───────────────────────────────────────────────────────────────────

function cacheBlock<T>(kind: ContentKind, block: ContentBlock<T>): void {
  const current = loadCache<T>(kind);
  current[block.itemId] = block;
  saveCache(kind, current);
}

function dropFromCache(kind: ContentKind, itemId: string): void {
  const current = loadCache<unknown>(kind);
  delete current[itemId];
  saveCache(kind, current);
}

export interface SaveOptions {
  isHidden?: boolean;
  sortOrder?: number;
  userEmail?: string | null;
}

/**
 * Uloží položku do překryvu. Platí pro výchozí i vlastní položku — u výchozí
 * vznikne řádek, který ji nahradí, u vlastní se řádek přepíše.
 */
export async function saveContentItem<T extends { id: string }>(
  kind: ContentKind,
  item: T,
  options: SaveOptions = {}
): Promise<PersistResult> {
  const normalized = NORMALIZERS[kind](item);
  if (!normalized) {
    return { persisted: false, error: 'Položka nemá povinné údaje, uložit ji nelze.' };
  }

  const now = new Date().toISOString();
  const block: ContentBlock<T> = {
    itemId: item.id,
    kind,
    payload: normalized as T,
    sortOrder: options.sortOrder ?? 0,
    isHidden: options.isHidden === true,
    isDeleted: false,
    updatedAt: now,
    updatedBy: options.userEmail ?? null,
  };

  let persistError: string | null = null;
  try {
    const { error } = await supabase.from('content_blocks').upsert(
      {
        id: rowId(kind, item.id),
        kind,
        payload: normalized,
        sort_order: block.sortOrder,
        is_hidden: block.isHidden,
        is_deleted: false,
        updated_at: now,
        updated_by: block.updatedBy,
      },
      { onConflict: 'id' }
    );
    if (error) {
      persistError = `Změnu se nepodařilo uložit na server (${error.message}).`;
    }
  } catch (err) {
    persistError = `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`;
  }

  cacheBlock(kind, block);
  return { persisted: persistError === null, error: persistError };
}

/**
 * Odstraní položku ze seznamu — vznikne náhrobek (`is_deleted`), takže ji
 * lektor může z přehledu odebraných kdykoli vrátit.
 *
 * Platí to i pro vlastní položky přidané v aplikaci. Dřív u nich zmizel celý
 * řádek, přestože potvrzovací dialog sliboval, že „vrátit to půjde z přehledu
 * odebraných“. Natrvalo maže až purgeContentItem.
 */
export async function deleteContentItem<T extends { id: string }>(
  kind: ContentKind,
  item: T,
  _isBuiltIn: boolean,
  userEmail?: string | null
): Promise<PersistResult> {
  const now = new Date().toISOString();
  const normalized = NORMALIZERS[kind](item);
  let persistError: string | null = null;

  try {
    const { error } = await supabase.from('content_blocks').upsert(
      {
        id: rowId(kind, item.id),
        kind,
        // Obsah se schovává, ne zahazuje — jinak by nebylo co obnovovat.
        payload: normalized ?? {},
        is_deleted: true,
        // Výslovně: náhrobek se skrytím znamená „smazáno natrvalo“.
        is_hidden: false,
        updated_at: now,
        updated_by: userEmail ?? null,
      },
      { onConflict: 'id' }
    );
    if (error) persistError = `Položku se nepodařilo odebrat (${error.message}).`;
  } catch (err) {
    persistError = `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`;
  }

  cacheBlock(kind, {
    itemId: item.id,
    kind,
    payload: (normalized as T) ?? null,
    sortOrder: 0,
    isHidden: false,
    isDeleted: true,
    updatedAt: now,
    updatedBy: userEmail ?? null,
  });

  return { persisted: persistError === null, error: persistError };
}

/** Odstraní řádek vlastní položky z databáze úplně. */
async function hardDeleteContentItem(kind: ContentKind, itemId: string): Promise<PersistResult> {
  let persistError: string | null = null;
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .delete()
      .eq('id', rowId(kind, itemId))
      .select('id');
    if (error) persistError = `Položku se nepodařilo smazat (${error.message}).`;
    else if (!data || data.length === 0) persistError = 'Server položku nesmazal — zkontrolujte, že na to máte oprávnění.';
  } catch (err) {
    persistError = `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`;
  }
  dropFromCache(kind, itemId);
  return { persisted: persistError === null, error: persistError };
}

/**
 * Smaže položku natrvalo — zmizí i z lektorova přehledu odebraných položek.
 *
 * Vlastní položka přijde o řádek. U výchozí to nejde (vrátila by se
 * z repozitáře), proto zůstane náhrobek označený zároveň jako skrytý.
 */
export async function purgeContentItem<T extends { id: string }>(
  kind: ContentKind,
  item: T,
  isBuiltIn: boolean
): Promise<PersistResult> {
  if (!isBuiltIn) return hardDeleteContentItem(kind, item.id);

  const now = new Date().toISOString();
  const normalized = NORMALIZERS[kind](item);
  let persistError: string | null = null;
  try {
    const { error } = await supabase.from('content_blocks').upsert(
      {
        id: rowId(kind, item.id),
        kind,
        payload: normalized ?? {},
        is_deleted: true,
        is_hidden: true,
        updated_at: now,
      },
      { onConflict: 'id' }
    );
    if (error) persistError = `Položku se nepodařilo smazat (${error.message}).`;
  } catch (err) {
    persistError = `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`;
  }

  cacheBlock(kind, {
    itemId: item.id,
    kind,
    payload: (normalized as T) ?? null,
    sortOrder: 0,
    isHidden: true,
    isDeleted: true,
    updatedAt: now,
  });
  return { persisted: persistError === null, error: persistError };
}

/** Vrátí výchozí položku zpět — smaže její řádek v překryvu. */
export async function restoreContentItem(
  kind: ContentKind,
  itemId: string
): Promise<PersistResult> {
  let persistError: string | null = null;
  try {
    const { error } = await supabase.from('content_blocks').delete().eq('id', rowId(kind, itemId));
    if (error) persistError = `Obnovení se nepodařilo (${error.message}).`;
  } catch (err) {
    persistError = `Spojení se serverem selhalo (${err instanceof Error ? err.message : String(err)}).`;
  }

  dropFromCache(kind, itemId);
  return { persisted: persistError === null, error: persistError };
}

/** Skryje či znovu zveřejní položku studentům. */
export async function setContentItemHidden<T extends { id: string }>(
  kind: ContentKind,
  item: T,
  isHidden: boolean,
  userEmail?: string | null
): Promise<PersistResult> {
  return saveContentItem(kind, item, { isHidden, userEmail });
}

// ─── Id nových položek ───────────────────────────────────────────────────────

/**
 * Vyrobí ASCII-safe id, které se nesrazí s žádným už použitým. Id je součástí
 * primárního klíče v databázi, takže duplicita by přepsala cizí položku.
 */
export function makeContentId(prefix: string, name: string, usedIds: string[]): string {
  const base =
    (name || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'polozka';

  const used = new Set(usedIds);
  let candidate = `${prefix}-${base}`;
  let counter = 2;
  while (used.has(candidate)) {
    candidate = `${prefix}-${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}
