import { supabase } from '../lib/supabase';
import { fetchContentOverlay, mergeContent } from './contentLibrary';
import { getFileKind, listMaterials, MATERIALS_BUCKET } from './materials';
import type { VscrRegulation } from '../data/vscrRegulationsRegistry';
import type { GeminiInlineDataPart } from './geminiAnalyzer';

/**
 * Zdroje, ze kterých smí AI asistent čerpat (návrh z 29. 9. 2026: „čerpat
 * pouze ze zdrojů v aplikaci — záložka kompas zákonů; případně zaškrtnout
 * čerpání i z nahraných souborů“).
 *
 * 1. Právní kompas: články kompasu (legalCompasData) a registr předpisů
 *    včetně úprav lektorů (content_blocks druhu 'regulation') — tedy přesně
 *    to, co student v záložce vidí.
 * 2. Volitelně nahrané studijní materiály (knihovna materiálů). Model umí
 *    číst PDF a obrázky; Word a PowerPoint ne, ty se jen vyjmenují jako
 *    přeskočené.
 *
 * Data kompasu se načítají dynamicky, aby se ~200 kB textu stahovalo až při
 * prvním dotazu na asistenta, ne s každým otevřením záložky.
 */

/** Horní mez velikosti přiložených souborů. Gemini přijme v jednom požadavku
 *  nejvýš 20 MB a base64 přidá třetinu. */
const MATERIALS_BYTE_BUDGET = 12 * 1024 * 1024;
const MATERIALS_MAX_FILES = 10;

export interface AppSourcesContext {
  /** Text Právního kompasu připravený do promptu. */
  compassText: string;
  /** Přiložené soubory pro model (PDF, obrázky). */
  materialParts: GeminiInlineDataPart[];
  /** Názvy přiložených materiálů v pořadí příloh. */
  materialNames: string[];
  /** Materiály, které se přiložit nepodařilo nebo nešlo, i s důvodem. */
  skippedMaterials: string[];
}

function compact(text: string | undefined | null): string {
  return (text ?? '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function buildCompassText(): Promise<string> {
  const [{ legalDatabase }, { VSCR_REGULATIONS_REGISTRY }, overlay] = await Promise.all([
    import('../data/legalCompasData'),
    import('../data/vscrRegulationsRegistry'),
    fetchContentOverlay<VscrRegulation>('regulation'),
  ]);

  const regulations = mergeContent(VSCR_REGULATIONS_REGISTRY, overlay.blocks).map((entry) => entry.item);

  const articles = legalDatabase.map((a) =>
    [
      `### [KOMPAS] ${a.actNumber}, ${a.section} – ${a.title}`,
      `Text: ${compact(a.exactText)}`,
      a.explanation ? `Výklad: ${compact(a.explanation)}` : '',
      a.examTips ? `Tipy ke zkoušce: ${compact(a.examTips)}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  );

  const registry = regulations.map((r) =>
    [
      `### [PŘEDPIS] ${r.code} – ${r.title}`,
      r.scope ? `Působnost: ${compact(r.scope)}` : '',
      r.keyProvisions?.length ? `Klíčová ustanovení:\n- ${r.keyProvisions.map(compact).join('\n- ')}` : '',
      r.summary ? `Shrnutí: ${compact(r.summary)}` : '',
      r.practicalApplication ? `Praxe: ${compact(r.practicalApplication)}` : '',
      r.fullLegalText ? `Studijní výběr ustanovení:\n${compact(r.fullLegalText)}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  );

  return [
    '## ČLÁNKY PRÁVNÍHO KOMPASU',
    articles.join('\n\n'),
    '## REGISTR PŘEDPISŮ PRÁVNÍHO KOMPASU',
    registry.join('\n\n'),
  ].join('\n\n');
}

async function blobToInlinePart(blob: Blob, mimeType: string): Promise<GeminiInlineDataPart> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < buffer.length; i += CHUNK) {
    binary += String.fromCharCode(...buffer.subarray(i, i + CHUNK));
  }
  return { inlineData: { data: btoa(binary), mimeType } };
}

async function loadMaterials(): Promise<Pick<AppSourcesContext, 'materialParts' | 'materialNames' | 'skippedMaterials'>> {
  const materialParts: GeminiInlineDataPart[] = [];
  const materialNames: string[] = [];
  const skippedMaterials: string[] = [];

  const { items, error } = await listMaterials();
  if (error) {
    skippedMaterials.push(`knihovnu materiálů se nepodařilo načíst (${error})`);
    return { materialParts, materialNames, skippedMaterials };
  }

  // Nejnovější materiály mají přednost, když se všechny do limitu nevejdou.
  const sorted = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  let used = 0;

  for (const m of sorted) {
    const kind = getFileKind(m.mimeType, m.name);
    if (kind !== 'pdf' && kind !== 'image') {
      skippedMaterials.push(`${m.displayName} (formát, který model neumí číst)`);
      continue;
    }
    if (materialParts.length >= MATERIALS_MAX_FILES || used + m.size > MATERIALS_BYTE_BUDGET) {
      skippedMaterials.push(`${m.displayName} (překročen limit velikosti příloh)`);
      continue;
    }
    const { data, error: downloadError } = await supabase.storage.from(MATERIALS_BUCKET).download(m.name);
    if (downloadError || !data) {
      skippedMaterials.push(`${m.displayName} (nepodařilo se stáhnout)`);
      continue;
    }
    const mimeType = kind === 'pdf' ? 'application/pdf' : m.mimeType || data.type || 'image/jpeg';
    materialParts.push(await blobToInlinePart(data, mimeType));
    materialNames.push(m.displayName);
    used += m.size || data.size;
  }

  return { materialParts, materialNames, skippedMaterials };
}

/** Sestaví zdroje pro jeden dotaz na asistenta. */
export async function buildAppSources(includeMaterials: boolean): Promise<AppSourcesContext> {
  const [compassText, materials] = await Promise.all([
    buildCompassText(),
    includeMaterials
      ? loadMaterials()
      : Promise.resolve({ materialParts: [], materialNames: [], skippedMaterials: [] }),
  ]);
  return { compassText, ...materials };
}
