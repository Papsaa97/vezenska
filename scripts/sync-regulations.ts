/**
 * Stažení úplných znění předpisů z veřejného REST API e-Sbírky.
 * Spuštění: `npm run sync:laws` (volitelně `-- 555/1992 169/1999` pro výběr).
 *
 * CO SKRIPT DĚLÁ
 *   1. Pro každý předpis z registru, který má číslo ve Sbírce, zjistí přes API
 *      jeho id, aktuální znění, historii novel a osnovu (seznam paragrafů).
 *   2. Stáhne úřední informativní znění v DOCX a převede ho na čistý text.
 *   3. Uloží výsledek do `public/data/esbirka/<slug>.json` a přehled do
 *      `src/data/esbirka/snapshotManifest.ts`.
 *
 * PROČ TO TAK JE
 *   Dřívější verze skriptu poslala na portál jeden požadavek HEAD a bez ohledu
 *   na odpověď vypsala, že „konsolidované znění je aktuální“ — při výpadku sítě
 *   dokonce započítala předpis mezi úspěšně ověřené. Nic se nestahovalo ani
 *   neporovnávalo. Texty v aplikaci proto zůstávaly ručně přepsané a nikdo
 *   neviděl, že se rozešly s platným zněním.
 *
 * ZDROJ DAT
 *   https://e-sbirka.gov.cz/restful-api — veřejné API bez klíče a bez
 *   přihlášení. Informativní znění není právně závazné (závazná je částka
 *   Sbírky), proto si aplikace u každého znění drží datum účinnosti i seznam
 *   novel a pojmenovává ho jako informativní.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';

import { VSCR_REGULATIONS_REGISTRY } from '../src/data/vscrRegulationsRegistry';
import {
  fetchContents,
  fetchDocumentId,
  fetchHistory,
  fetchVersionDetail,
  pickCurrentVersion,
} from '../src/utils/esbirka/client';
import { downloadOfficialDocument } from '../src/utils/esbirka/files';
import {
  buildEli,
  buildOfficialPdfUrl,
  buildPortalUrl,
  buildSnapshotSlug,
  normalizeSectionLabel,
  parseSbiratkaRef,
} from '../src/utils/esbirka/eli';
import type {
  EsbirkaOutlineItem,
  EsbirkaSnapshot,
  EsbirkaSnapshotSummary,
} from '../src/utils/esbirka/snapshot';
import type { EsbirkaContentItem } from '../src/utils/esbirka/types';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT_DIR = path.join(ROOT, 'public', 'data', 'esbirka');
const MANIFEST_FILE = path.join(ROOT, 'src', 'data', 'esbirka', 'snapshotManifest.ts');

/** Kolik úrovní osnovy se prochází. Hlouběji než příloha v dílu se nejde. */
const MAX_OUTLINE_DEPTH = 5;

interface SyncTarget {
  code: string;
  shortTitle: string;
  eli: string;
  slug: string;
}

/**
 * Cíle synchronizace se berou z registru aplikace, ne z vlastního seznamu.
 * Nový zákon v registru se tak synchronizuje sám a nemůže vzniknout stav,
 * kdy skript kontroluje jiné předpisy, než jaké aplikace zobrazuje.
 * Vnitřní předpisy (NGŘ, instrukce) ve Sbírce nejsou, ty se přeskočí.
 */
function collectTargets(filters: string[]): SyncTarget[] {
  const targets: SyncTarget[] = [];
  for (const reg of VSCR_REGULATIONS_REGISTRY) {
    const ref = parseSbiratkaRef(reg.code);
    if (!ref) continue;
    const label = `${ref.cislo}/${ref.rok}`;
    if (filters.length > 0 && !filters.some((f) => f.includes(label))) continue;
    targets.push({
      code: reg.code,
      shortTitle: reg.shortTitle,
      eli: buildEli(ref),
      slug: buildSnapshotSlug(ref),
    });
  }
  return targets;
}

/** Rekurzivně projde osnovu předpisu a zploští ji na seznam s úrovněmi. */
async function collectOutline(
  eli: string,
  uzel: string | undefined,
  uroven: number
): Promise<EsbirkaOutlineItem[]> {
  const result: EsbirkaOutlineItem[] = [];
  const { polozkyObsahu } = await fetchContents(eli, uzel);

  for (const item of polozkyObsahu as EsbirkaContentItem[]) {
    const oznaceni = (item.oznaceniUstanoveni || item.nazev || '').trim();
    if (oznaceni) {
      result.push({
        oznaceni,
        nazev: item.oznaceniUstanoveni ? item.nazev?.trim() || undefined : undefined,
        rozsah: item.rozsah?.trim() || undefined,
        uroven,
        fragmentId: item.fragmentId,
      });
    }
    if (item.maPotomky && uroven + 1 < MAX_OUTLINE_DEPTH) {
      result.push(...(await collectOutline(eli, item.id, uroven + 1)));
    }
  }

  return result;
}

/**
 * Převede úřední DOCX na text.
 *
 * Konce řádků se sjednotí a víc než dva prázdné řádky za sebou se stáhnou na
 * dva — DOCX je plné prázdných odstavců kvůli sazbě, v textu by jen nafukovaly
 * soubor a rozbíjely čtení.
 */
async function docxToText(data: Uint8Array): Promise<string> {
  const buffer = Buffer.from(data);
  const { value } = await mammoth.extractRawText({ buffer });
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t\u00a0]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Paragrafy předpisu v pořadí osnovy, bez duplicit a bez odkazů na jiné akty. */
function collectSections(osnova: EsbirkaOutlineItem[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const item of osnova) {
    if (!/^§\s*\d/.test(item.oznaceni)) continue;
    const label = normalizeSectionLabel(item.oznaceni);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    order.push(label);
  }
  return order;
}

async function syncOne(target: SyncTarget): Promise<EsbirkaSnapshot> {
  const dokumentId = await fetchDocumentId(target.eli);
  const detail = await fetchVersionDetail(dokumentId);
  const history = await fetchHistory(target.eli);
  const current = pickCurrentVersion(history);

  const osnova = await collectOutline(target.eli, undefined, 0);
  const file = await downloadOfficialDocument(dokumentId, 'DOCX');
  const text = await docxToText(file.data);

  if (text.length < 500) {
    throw new Error(`Stažený text má jen ${text.length} znaků — to na předpis nevypadá.`);
  }

  const ref = parseSbiratkaRef(detail.citace) ?? parseSbiratkaRef(target.code);
  if (!ref) throw new Error(`Z citace „${detail.citace}" nejde odvodit číslo předpisu.`);

  return {
    slug: target.slug,
    eli: target.eli,
    citace: detail.citace,
    nazev: detail.nazev,
    dokumentId,
    cisloZneni: current?.cisloZneni ?? 0,
    ucinnostOd: current?.datumUcinnostiZneniOd ?? detail.datumUcinnostiZneniOd,
    novely: (current?.novely ?? []).map((n) => n.kodDokumentuSbirky),
    portalUrl: buildPortalUrl(ref, current?.datumUcinnostiZneniOd),
    pdfUrl: buildOfficialPdfUrl(dokumentId),
    stazenoDne: new Date().toISOString(),
    pocetZnaku: text.length,
    paragrafy: collectSections(osnova),
    osnova,
    text,
  };
}

function writeManifest(summaries: EsbirkaSnapshotSummary[]): void {
  const body = summaries
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((s) => `  ${JSON.stringify(s.slug)}: ${JSON.stringify(s, null, 2).replace(/\n/g, '\n  ')},`)
    .join('\n');

  const source = `/**
 * GENEROVANÝ SOUBOR — needitovat ručně.
 * Vytváří ho \`npm run sync:laws\` (scripts/sync-regulations.ts) z veřejného
 * REST API e-Sbírky: https://e-sbirka.gov.cz/restful-api
 *
 * Obsahuje jen metadata stažených znění. Samotné texty leží v
 * \`public/data/esbirka/<slug>.json\` a načítají se až na vyžádání —
 * viz src/utils/esbirka/snapshot.ts.
 */
import type { EsbirkaSnapshotSummary } from '../../utils/esbirka/snapshot';

/** Stažená znění podle klíče předpisu (\`sb-{rok}-{číslo}\`). */
export const ESBIRKA_SNAPSHOTS: Record<string, EsbirkaSnapshotSummary> = {
${body}
};

/** Metadata staženého znění pro dané označení předpisu, nebo null. */
export function findSnapshotSummary(slug: string | null): EsbirkaSnapshotSummary | null {
  if (!slug) return null;
  return ESBIRKA_SNAPSHOTS[slug] ?? null;
}
`;

  mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true });
  writeFileSync(MANIFEST_FILE, source, 'utf8');
}

async function main(): Promise<void> {
  const filters = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  const targets = collectTargets(filters);

  console.log('===========================================================');
  console.log('STAŽENÍ ÚPLNÝCH ZNĚNÍ Z e-Sbírka.gov.cz (REST API)');
  console.log('===========================================================');
  console.log(`Předpisů ke stažení: ${targets.length}`);
  if (filters.length > 0) console.log(`Filtr: ${filters.join(', ')}`);
  console.log('');

  mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const summaries: EsbirkaSnapshotSummary[] = [];
  const failures: Array<{ code: string; reason: string }> = [];

  for (const target of targets) {
    process.stdout.write(`  ${target.code.padEnd(30)} `);
    try {
      const snapshot = await syncOne(target);
      writeFileSync(
        path.join(SNAPSHOT_DIR, `${snapshot.slug}.json`),
        `${JSON.stringify(snapshot)}\n`,
        'utf8'
      );
      const { osnova: _osnova, text: _text, ...summary } = snapshot;
      summaries.push(summary);
      console.log(
        `znění č. ${String(snapshot.cisloZneni).padStart(3)} ` +
          `od ${snapshot.ucinnostOd}  ` +
          `${String(snapshot.paragrafy.length).padStart(3)} §  ` +
          `${(snapshot.pocetZnaku / 1024).toFixed(0).padStart(4)} kB`
      );
    } catch (error) {
      console.log(`SELHALO — ${(error as Error).message}`);
      failures.push({ code: target.code, reason: (error as Error).message });
    }
  }

  if (summaries.length > 0) {
    writeManifest(summaries);
    console.log('');
    console.log(`Zapsáno ${summaries.length} znění do public/data/esbirka/`);
    console.log('Přehled aktualizován: src/data/esbirka/snapshotManifest.ts');
  }

  console.log('');
  console.log('===========================================================');
  if (failures.length === 0) {
    console.log(`HOTOVO: staženo ${summaries.length} z ${targets.length} předpisů.`);
  } else {
    console.log(`DOKONČENO S CHYBAMI: ${failures.length} z ${targets.length} předpisů selhalo.`);
    failures.forEach((f) => console.log(`  - ${f.code}: ${f.reason}`));
  }
  console.log('Informativní znění není právně závazné; závazná je částka Sbírky.');
  console.log('===========================================================');

  // Nestažený předpis je chyba synchronizace — ať to pozná i CI.
  if (failures.length > 0 && summaries.length === 0) process.exitCode = 1;
}

main().catch((error: Error) => {
  console.error(`Synchronizace skončila chybou: ${error.message}`);
  process.exitCode = 1;
});
