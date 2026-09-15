// ─── Náhledy dokumentů přímo v aplikaci ──────────────────────────────────────
//
// PDF a obrázky zobrazí prohlížeč sám. Word a prezentace ne — a posílat interní
// materiály Vězeňské služby do cizí online prohlížečky (Microsoft, Google) kvůli
// náhledu nepřipadá v úvahu. Převod proto běží celý v prohlížeči uživatele:
// soubor se stáhne ze Storage a rozebere se na místě, nikam dál neodchází.
//
// Obě knihovny se načítají dynamickým importem, takže se stahují až při prvním
// otevření dokumentu a nezvětšují hlavní balík aplikace.

export interface DocxPreview {
  html: string;
  /** Hlášky převodu (nepodporované prvky dokumentu), pro lektora k informaci. */
  warnings: string[];
}

// Povolený seznam prvků a atributů. Mammoth generuje jen podmnožinu HTML, ale
// obsah dokumentu (odkazy) se do něj dostává z cizího souboru — a ten se
// vykresluje přes dangerouslySetInnerHTML. Proto se výsledek ještě protřídí.
const ALLOWED_TAGS = new Set([
  'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'SUP', 'SUB',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD',
  'A', 'IMG', 'DIV', 'SPAN', 'HR',
]);

// Prvky, které se zahazují i s obsahem. U ostatních nepovolených prvků se text
// zachovává, tady by ale zůstal kód jako viditelný text uprostřed dokumentu.
const DROPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META']);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(['href', 'title']),
  IMG: new Set(['src', 'alt']),
  TD: new Set(['colspan', 'rowspan']),
  TH: new Set(['colspan', 'rowspan']),
};

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  // Data URI povolujeme jen u obrázků — tak mammoth vkládá obrázky z dokumentu.
  if (trimmed.startsWith('data:image/')) return true;
  return /^(https?:|mailto:|#|\/)/.test(trimmed);
}

/** Vyhodí z převedeného HTML všechno, co není v povoleném seznamu. */
export function sanitizeDocumentHtml(html: string): string {
  if (typeof window === 'undefined') return '';
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');

  const walk = (node: Element) => {
    // Kopie seznamu — s prvky se během procházení hýbe.
    for (const child of Array.from(node.children)) {
      if (DROPPED_TAGS.has(child.tagName)) {
        child.remove();
        continue;
      }

      if (!ALLOWED_TAGS.has(child.tagName)) {
        // Prvek pryč, jeho text zůstává — jinak by z dokumentu zmizel obsah.
        const text = doc.createTextNode(child.textContent ?? '');
        child.replaceWith(text);
        continue;
      }

      const allowed = ALLOWED_ATTRS[child.tagName] ?? new Set<string>();
      for (const attr of Array.from(child.attributes)) {
        if (!allowed.has(attr.name.toLowerCase())) {
          child.removeAttribute(attr.name);
          continue;
        }
        if ((attr.name === 'href' || attr.name === 'src') && !isSafeUrl(attr.value)) {
          child.removeAttribute(attr.name);
        }
      }

      if (child.tagName === 'A') {
        child.setAttribute('target', '_blank');
        child.setAttribute('rel', 'noopener noreferrer');
      }

      walk(child);
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

/** Převede .docx na HTML. Formátování se zjednoduší, obsah zůstává. */
export async function renderDocx(blob: Blob): Promise<DocxPreview> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await blob.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  return {
    html: sanitizeDocumentHtml(result.value),
    warnings: (result.messages ?? [])
      .filter((m) => m.type === 'warning' || m.type === 'error')
      .map((m) => m.message),
  };
}

export interface PptxSlide {
  index: number;
  title: string;
  lines: string[];
  /** Object URL obrázků ze snímku — po zavření je nutné je uvolnit. */
  images: string[];
}

function slideNumber(path: string): number {
  const match = path.match(/slide(\d+)\.xml$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Rozebere .pptx na jednotlivé snímky.
 *
 * Prezentace není dokument — přesné rozvržení, animace ani přechody se v HTML
 * napodobit nedají. Náhled proto ukazuje text snímku a obrázky na něm, což
 * stačí na zopakování látky; kdo potřebuje původní podobu, stáhne si soubor.
 */
export async function renderPptx(blob: Blob): Promise<PptxSlide[]> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(blob);

  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort((a, b) => slideNumber(a) - slideNumber(b));

  const parser = new DOMParser();
  const slides: PptxSlide[] = [];

  for (let i = 0; i < slidePaths.length; i += 1) {
    const path = slidePaths[i];
    const xml = await zip.file(path)?.async('string');
    if (!xml) continue;

    const doc = parser.parseFromString(xml, 'application/xml');

    // Text snímku je rozdělený po odstavcích <a:p>, uvnitř nich po úsecích
    // <a:t>. Spojení po odstavcích drží řádky tak, jak jsou ve snímku.
    const lines: string[] = [];
    const paragraphs = doc.getElementsByTagName('a:p');
    for (let p = 0; p < paragraphs.length; p += 1) {
      const runs = paragraphs[p].getElementsByTagName('a:t');
      let text = '';
      for (let r = 0; r < runs.length; r += 1) {
        text += runs[r].textContent ?? '';
      }
      const trimmed = text.trim();
      if (trimmed) lines.push(trimmed);
    }

    // Obrázky přes vztahy snímku: Target je relativní cesta do ppt/media.
    const images: string[] = [];
    const relsXml = await zip.file(`ppt/slides/_rels/slide${slideNumber(path)}.xml.rels`)?.async('string');
    if (relsXml) {
      const relsDoc = parser.parseFromString(relsXml, 'application/xml');
      const rels = relsDoc.getElementsByTagName('Relationship');
      for (let r = 0; r < rels.length; r += 1) {
        const type = rels[r].getAttribute('Type') ?? '';
        if (!type.endsWith('/image')) continue;
        // Target bývá relativní ke složce snímku ('../media/obr.png'), občas
        // absolutní ('/ppt/media/obr.png'). Obojí musí skončit jako cesta
        // uvnitř archivu, jinak se obrázek nenajde.
        const rawTarget = (rels[r].getAttribute('Target') ?? '').trim();
        if (!rawTarget || /^https?:/i.test(rawTarget)) continue;
        const normalized = rawTarget.replace(/^\//, '').replace(/^\.\.\//, '');
        const target = normalized.startsWith('ppt/') ? normalized : `ppt/${normalized}`;
        const file = zip.file(target);
        if (!file) continue;
        const mediaBlob = await file.async('blob');
        images.push(URL.createObjectURL(mediaBlob));
      }
    }

    slides.push({
      index: i + 1,
      title: lines[0] ?? `Snímek ${i + 1}`,
      lines: lines.slice(1),
      images,
    });
  }

  return slides;
}

/** Uvolní object URL obrázků. Bez toho by se s každým otevřením držela paměť. */
export function revokePptxImages(slides: PptxSlide[]): void {
  for (const slide of slides) {
    for (const url of slide.images) {
      URL.revokeObjectURL(url);
    }
  }
}
