/**
 * Stažení úplných znění předpisů z veřejného REST API e-Sbírky.
 * Spuštění: `npm run sync:laws` (volitelně `-- 555/1992 169/1999` pro výběr,
 * `-- --summary-file=zmeny.md` pro přehled změn ve formátu Markdown, který
 * používá plánovaná synchronizace v `.github/workflows/sync-esbirka.yml`).
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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';

import { VSCR_REGULATIONS_REGISTRY } from '../src/data/vscrRegulationsRegistry';
import {
  configureServerCredentials,
  fetchContents,
  fetchDocumentId,
  fetchHistory,
  fetchVersionDetail,
  pickCurrentVersion,
} from '../src/utils/esbirka/client';
import {
  buildAuthHeaders,
  describeServerConfig,
  readServerConfig,
} from '../src/utils/esbirka/serverConfig';
import { downloadOfficialDocument } from '../src/utils/esbirka/files';
import {
  buildEli,
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

/** Stav předpisu ze souboru, který na disku leží z minulého stažení. */
function readPreviousSnapshot(slug: string): EsbirkaSnapshot | null {
  const file = path.join(SNAPSHOT_DIR, `${slug}.json`);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as EsbirkaSnapshot;
  } catch {
    return null;
  }
}

/**
 * Liší se stažené znění od toho na disku něčím jiným než časem stažení?
 *
 * PROČ TO TU JE: `stazenoDne` se mění při každém běhu, takže bez téhle
 * kontroly by plánovaná synchronizace přepsala všech devět souborů (2,3 MB)
 * i ve chvíli, kdy se v žádném zákoně nezměnilo ani písmeno — a každý týden
 * by zakládala pull request s prázdným rozdílem. Soubor se proto přepíše jen
 * tehdy, když se změnil jeho obsah.
 */
function hasSameContent(previous: EsbirkaSnapshot, current: EsbirkaSnapshot): boolean {
  const strip = (snapshot: EsbirkaSnapshot) => {
    const { stazenoDne: _stazenoDne, ...rest } = snapshot;
    return JSON.stringify(rest);
  };
  return strip(previous) === strip(current);
}

/** Co se u předpisu změnilo proti tomu, co bylo stažené předtím. */
interface SyncChange {
  code: string;
  /**
   * `nove`    — předpis přibyl,
   * `zmenene` — vyšla novela nebo se změnil text zákona,
   * `tvar`    — znění i text jsou stejné, změnil se jen tvar uložených dat
   *             (přibylo/ubylo pole, jinak se skládá odkaz). Není to změna
   *             práva, ale soubor se přepsal, takže to hlášení musí přiznat —
   *             jinak by automat otevřel pull request s rozdílem a v těle
   *             tvrdil, že se nic nezměnilo.
   */
  druh: 'nove' | 'zmenene' | 'tvar';
  predtim?: { cisloZneni: number; ucinnostOd: string; pocetZnaku: number };
  nyni: { cisloZneni: number; ucinnostOd: string; pocetZnaku: number };
  novely: string[];
}

function describeChange(
  code: string,
  previous: EsbirkaSnapshot | null,
  current: EsbirkaSnapshot
): SyncChange | null {
  const nyni = {
    cisloZneni: current.cisloZneni,
    ucinnostOd: current.ucinnostOd,
    pocetZnaku: current.pocetZnaku,
  };
  if (!previous) return { code, druh: 'nove', nyni, novely: current.novely };

  const predtim = {
    cisloZneni: previous.cisloZneni,
    ucinnostOd: previous.ucinnostOd,
    pocetZnaku: previous.pocetZnaku,
  };
  const stejne =
    predtim.cisloZneni === nyni.cisloZneni &&
    predtim.ucinnostOd === nyni.ucinnostOd &&
    previous.text === current.text;

  return stejne ? null : { code, druh: 'zmenene', predtim, nyni, novely: current.novely };
}

/** Přehled změn pro tělo pull requestu, který zakládá plánovaná synchronizace. */
function buildMarkdownSummary(
  changes: SyncChange[],
  failures: Array<{ code: string; reason: string }>,
  celkem: number
): string {
  const lines: string[] = [];

  const pravni = changes.filter((c) => c.druh !== 'tvar');
  const tvarove = changes.filter((c) => c.druh === 'tvar');

  if (changes.length === 0) {
    lines.push('Žádné znění se nezměnilo — e-Sbírka vede u všech sledovaných předpisů totéž, co už je v repozitáři.');
  } else if (pravni.length === 0) {
    lines.push(
      `Žádný předpis nezměnil znění. U ${tvarove.length} z ${celkem} se ale změnil tvar uložených dat, ` +
        'takže se soubory přepsaly — projděte prosím rozdíl.'
    );
  } else {
    lines.push(`Změnilo se ${pravni.length} z ${celkem} sledovaných předpisů.`);
    if (tvarove.length > 0) {
      lines.push('');
      lines.push(`U dalších ${tvarove.length} se změnil jen tvar uložených dat, ne znění.`);
    }
    lines.push('');
    lines.push('| Předpis | Bylo | Je | Novely | Změna textu |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const ch of changes) {
      const bylo = ch.predtim
        ? `znění č. ${ch.predtim.cisloZneni} od ${ch.predtim.ucinnostOd}`
        : '— (nově sledováno)';
      const je = `znění č. ${ch.nyni.cisloZneni} od ${ch.nyni.ucinnostOd}`;
      const rozdil =
        ch.druh === 'tvar'
          ? 'beze změny textu (jen tvar dat)'
          : ch.predtim
            ? `${ch.nyni.pocetZnaku - ch.predtim.pocetZnaku >= 0 ? '+' : ''}${(
                ch.nyni.pocetZnaku - ch.predtim.pocetZnaku
              ).toLocaleString('cs-CZ')} znaků`
            : `${ch.nyni.pocetZnaku.toLocaleString('cs-CZ')} znaků`;
      lines.push(`| ${ch.code} | ${bylo} | ${je} | ${ch.novely.join(', ') || '—'} | ${rozdil} |`);
    }
  }

  if (failures.length > 0) {
    lines.push('');
    lines.push(`### Nepodařilo se stáhnout (${failures.length})`);
    lines.push('');
    for (const f of failures) lines.push(`- **${f.code}** — ${f.reason}`);
    lines.push('');
    lines.push('U těchto předpisů zůstává v repozitáři znění z minulého stažení.');
  }

  return lines.join('\n');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const filters = args.filter((arg) => !arg.startsWith('-'));
  const summaryFile = args
    .find((arg) => arg.startsWith('--summary-file='))
    ?.slice('--summary-file='.length);
  const targets = collectTargets(filters);

  // Kořen API i případný přístupový klíč se berou z prostředí. Bez nich se
  // volá backend veřejného portálu, který klíč nevyžaduje — tedy dnešní stav.
  const serverConfig = readServerConfig();
  configureServerCredentials({
    apiRoot: serverConfig.apiRoot,
    headers: buildAuthHeaders(serverConfig),
  });

  console.log('===========================================================');
  console.log('STAŽENÍ ÚPLNÝCH ZNĚNÍ Z e-Sbírka.gov.cz (REST API)');
  console.log('===========================================================');
  console.log(describeServerConfig(serverConfig));
  console.log(`Předpisů ke stažení: ${targets.length}`);
  if (filters.length > 0) console.log(`Filtr: ${filters.join(', ')}`);
  console.log('');

  mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const summaries: EsbirkaSnapshotSummary[] = [];
  const failures: Array<{ code: string; reason: string }> = [];
  const changes: SyncChange[] = [];

  for (const target of targets) {
    process.stdout.write(`  ${target.code.padEnd(30)} `);
    const previous = readPreviousSnapshot(target.slug);
    try {
      const stazene = await syncOne(target);
      // Beze změny obsahu se soubor nechává být i s původním datem stažení,
      // aby plánovaná synchronizace nezakládala PR s prázdným rozdílem.
      const beze_zmeny = previous !== null && hasSameContent(previous, stazene);
      const snapshot = beze_zmeny && previous ? previous : stazene;

      if (!beze_zmeny) {
        writeFileSync(
          path.join(SNAPSHOT_DIR, `${snapshot.slug}.json`),
          `${JSON.stringify(snapshot)}\n`,
          'utf8'
        );
      }

      const { osnova: _osnova, text: _text, ...summary } = snapshot;
      summaries.push(summary);

      // Když se obsah liší, ale číslo znění ani text ne, je to změna tvaru dat.
      // Musí se vypsat taky — soubor se přepsal a rozdíl bude vidět v gitu.
      const change = beze_zmeny
        ? null
        : (describeChange(target.code, previous, snapshot) ?? {
            code: target.code,
            druh: 'tvar',
            predtim: previous
              ? {
                  cisloZneni: previous.cisloZneni,
                  ucinnostOd: previous.ucinnostOd,
                  pocetZnaku: previous.pocetZnaku,
                }
              : undefined,
            nyni: {
              cisloZneni: snapshot.cisloZneni,
              ucinnostOd: snapshot.ucinnostOd,
              pocetZnaku: snapshot.pocetZnaku,
            },
            novely: snapshot.novely,
          });
      if (change) changes.push(change);

      console.log(
        `znění č. ${String(snapshot.cisloZneni).padStart(3)} ` +
          `od ${snapshot.ucinnostOd}  ` +
          `${String(snapshot.paragrafy.length).padStart(3)} §  ` +
          `${(snapshot.pocetZnaku / 1024).toFixed(0).padStart(4)} kB  ` +
          `${
            change
              ? change.druh === 'nove'
                ? 'NOVÉ'
                : change.druh === 'tvar'
                  ? 'tvar dat'
                  : 'ZMĚNA'
              : 'beze změny'
          }`
      );
    } catch (error) {
      console.log(`SELHALO — ${(error as Error).message}`);
      failures.push({ code: target.code, reason: (error as Error).message });

      // Předpis, který se nepodařilo stáhnout, nesmí vypadnout z přehledu:
      // jeho soubor na disku zůstává a aplikace by jinak přestala vědět, že
      // k němu úplné znění má. Do manifestu se proto vrátí minulý stav.
      if (previous) {
        const { osnova: _osnova, text: _text, ...summary } = previous;
        summaries.push(summary);
      }
    }
  }

  // Přehled musí zůstat úplný i při běhu s filtrem. Předpisy, které se teď
  // nesynchronizovaly, se do něj vrátí ze souborů na disku — jinak by
  // `npm run sync:laws -- 555/1992` vyhodil zbylých osm znění z aplikace
  // a ta by u nich přestala vědět, že úplné znění vůbec má.
  if (summaries.length > 0) {
    const synced = new Set(summaries.map((s) => s.slug));
    for (const target of collectTargets([])) {
      if (synced.has(target.slug)) continue;
      const previous = readPreviousSnapshot(target.slug);
      if (!previous) continue;
      const { osnova: _osnova, text: _text, ...summary } = previous;
      summaries.push(summary);
    }

    writeManifest(summaries);
    console.log('');
    console.log(`V přehledu je ${summaries.length} znění (public/data/esbirka/).`);
    console.log('Přehled aktualizován: src/data/esbirka/snapshotManifest.ts');
  }

  console.log('');
  if (changes.length === 0) {
    console.log('ZMĚNY: žádné — stažená znění odpovídají tomu, co už bylo v repozitáři.');
  } else {
    console.log(`ZMĚNY (${changes.length}):`);
    for (const ch of changes) {
      const bylo = ch.predtim
        ? `znění č. ${ch.predtim.cisloZneni} od ${ch.predtim.ucinnostOd}`
        : 'nově sledováno';
      console.log(
        `  ${ch.code.padEnd(30)} ${bylo} → znění č. ${ch.nyni.cisloZneni} od ${ch.nyni.ucinnostOd}` +
          `${ch.novely.length > 0 ? ` (novely: ${ch.novely.join(', ')})` : ''}`
      );
    }
  }

  if (summaryFile) {
    writeFileSync(summaryFile, `${buildMarkdownSummary(changes, failures, targets.length)}\n`, 'utf8');
    console.log(`Přehled změn zapsán do ${summaryFile}`);
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
