import { supabase } from '../lib/supabase';
import { RegulationDocument, VscrRegulation } from '../data/vscrRegulationsRegistry';
import { MATERIALS_BUCKET, StudyMaterial, sanitizePath } from './materials';

// ─── Texty NGŘ a dalších interních předpisů ──────────────────────────────────
//
// NGŘ nejsou ve Sbírce zákonů, takže je aplikace nemůže stáhnout z e-Sbírky
// jako zákony. Jejich text proto nahrává lektor jako soubor. Soubor leží ve
// stejném privátním kbelíku jako studijní materiály (číst smí každý
// přihlášený, nahrávat lektor a správce — migrace 031 a 036), jen ve vlastní
// složce 'predpisy/', kterou Knihovna materiálů neprochází. Kde soubor je,
// si pamatuje záznam předpisu v content_blocks (pole `document`), takže
// žádná nová tabulka ani migrace není potřeba.

export const REGULATION_DOCS_FOLDER = 'predpisy';

/** Text předpisu se nahrává jako PDF nebo Word — obojí umí prohlížeč aplikace. */
export const REGULATION_DOC_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const REGULATION_DOC_ACCEPT = '.pdf,.doc,.docx';

export interface RegulationUploadResult {
  document: RegulationDocument | null;
  error: string | null;
}

/** Nahraje soubor s textem předpisu. Předchozí verze se nemaže. */
export async function uploadRegulationDocument(
  file: File,
  regulationCode: string
): Promise<RegulationUploadResult> {
  if (!REGULATION_DOC_MIME.includes(file.type)) {
    return { document: null, error: `Soubor „${file.name}“ není PDF ani Word.` };
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
  const safeName = sanitizePath(regulationCode) || 'predpis';
  const path = `${REGULATION_DOCS_FOLDER}/${safeName}__${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    return { document: null, error: `Nahrání souboru „${file.name}“ selhalo: ${error.message}` };
  }
  return {
    document: {
      path,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
    },
    error: null,
  };
}

/** Nahraný soubor v podobě, kterou zná prohlížeč souborů (FileViewerModal). */
export function regulationDocumentAsMaterial(doc: RegulationDocument, code: string): StudyMaterial {
  return {
    name: doc.path,
    displayName: `${code} – ${doc.fileName.replace(/\.[^.]+$/, '')}`,
    folderSubject: '',
    size: doc.size,
    createdAt: doc.uploadedAt,
    mimeType: doc.mimeType,
  };
}

/**
 * Číslo NGŘ v jednotném tvaru „2/2022“.
 *
 * Tentýž předpis se v podkladech píše jako „NGŘ č. 02/2022“ i „NGŘ č. 2/2022“;
 * bez sjednocení by se k sobě záznamy nepřiřadily.
 */
export function ngrNumber(text: string): string | null {
  const match = /NGŘ\s*(?:č\.\s*)?0*(\d+)\s*\/\s*(\d{4})/i.exec(text);
  return match ? `${match[1]}/${match[2]}` : null;
}

/** Je předpis zrušený? */
export function isRepealed(reg: VscrRegulation): boolean {
  return reg.status === 'zruseny';
}

/**
 * Zrušený NGŘ, na který se odvolává text (např. `actNumber` článku
 * Paragrafového výkladu). Vrací null, když NGŘ platí nebo ho registr nezná.
 */
export function findRepealedNgr(text: string, regs: VscrRegulation[]): VscrRegulation | null {
  const number = ngrNumber(text);
  if (!number) return null;
  return regs.find((r) => r.type === 'ngr' && isRepealed(r) && ngrNumber(r.code) === number) ?? null;
}
