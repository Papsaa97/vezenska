import { LegalArticle } from '../data/legalCompasData';
import { VscrRegulation } from '../data/vscrRegulationsRegistry';
import { ESBIRKA_SNAPSHOTS } from '../data/esbirka/snapshotManifest';
import {
  buildSnapshotSlug,
  collectSectionLabels,
  normalizeSectionLabel,
  parseSbiratkaRef,
} from './esbirka/eli';
import type { EsbirkaSnapshotSummary } from './esbirka/snapshot';

export interface IntegrityIssue {
  id: string;
  field: string;
  type: 'empty' | 'too_short' | 'truncated' | 'unclosed_quote' | 'duplicate_id' | 'formatting' | 'missing_law';
  message: string;
}

/**
 * Porovnání studijního výběru ustanovení s úředním zněním z e-Sbírky.
 *
 * DŘÍVE to byl jen odhad: kontrola neměla k dispozici závazný zdroj, takže
 * počítala nadpisy § ve vlastním textu a hádala, jestli v číselné řadě něco
 * chybí. Mezera přitom může být legitimní (zrušený paragraf) a naopak předpis
 * s vysokým číslem posledního § mohl mít klidně polovinu obsahu vymyšlenou.
 *
 * TEĎ se seznam paragrafů bere z osnovy předpisu stažené z e-Sbírky
 * (`npm run sync:laws`), takže „chybí § 30 až § 85“ je tvrzení, ne dohad.
 * U předpisů, které ve Sbírce zákonů nejsou (NGŘ, mezinárodní dokumenty),
 * zůstává pole `maUplneZneni` na false a žádný verdikt o úplnosti se nevynáší.
 */
export interface RegulationCoverage {
  code: string;
  title: string;
  /** Délka studijního výběru v aplikaci ve znacích. */
  vyberZnaku: number;
  /** Paragrafy, které studijní výběr obsahuje. */
  vyberParagrafu: string[];
  /** Je k předpisu stažené úřední úplné znění? */
  maUplneZneni: boolean;
  /** Délka úředního znění ve znacích (0, když není staženo). */
  uredniZnaku: number;
  /** Počet paragrafů podle e-Sbírky. */
  uredniParagrafu: number;
  /** Paragrafy, které úřední znění má a studijní výběr je vynechává. */
  chybejiciParagrafy: string[];
  /**
   * Paragrafy, které výběr cituje, ale úřední znění je nezná.
   * Bývá to odkaz na jiný předpis nebo na ustanovení, které už bylo zrušeno.
   */
  neznameParagrafy: string[];
  /** Datum účinnosti staženého úředního znění. */
  ucinnostOd: string | null;
  /** Pořadové číslo staženého úředního znění. */
  cisloZneni: number | null;
}

/** Nález při porovnání jednoho článku Paragrafového výkladu s e-Sbírkou. */
export interface ArticleSectionIssue {
  id: string;
  actNumber: string;
  section: string;
  /** Paragrafy, které článek cituje, ale v úředním znění předpisu nejsou. */
  neznameParagrafy: string[];
}

/**
 * Nález, kdy text uvádí paragraf pod jiným nadpisem, než jaký má v zákoně.
 *
 * Tohle je ta kontrola, která chyběla. Dosud se ověřovalo jen to, že citovaný
 * paragraf v předpisu EXISTUJE — ne že obsah pod ním opravdu je. Právě tím
 * mohl výklad roky tvrdit „§ 47 Kázeňské odměny“, zatímco § 47 zákona
 * 169/1999 Sb. se jmenuje „Ukládání kázeňských trestů“ a odměny jsou § 45.
 */
export interface SectionHeadingIssue {
  /** Id článku výkladu nebo označení předpisu, ve kterém se nadpis našel. */
  id: string;
  actNumber: string;
  /** Paragraf, u kterého nadpis nesouhlasí. */
  section: string;
  /** Nadpis uvedený v naší aplikaci. */
  nadpisVAplikaci: string;
  /** Nadpis podle osnovy z e-Sbírky. */
  nadpisVZakone: string;
}

/** Nadpisy paragrafů podle osnovy z e-Sbírky: `§ 45` → `Odměny`. */
export type OfficialHeadings = Map<string, string>;

export interface AuditReport {
  timestamp: string;
  totalArticles: number;
  totalWords: number;
  totalCharacters: number;
  categories: Record<string, number>;
  issues: IntegrityIssue[];
  /** Porovnání výběrů ustanovení s úředními zněními. */
  regulationCoverage: RegulationCoverage[];
  /** Články, jejichž označení paragrafu úřední znění nezná. */
  articleSectionIssues: ArticleSectionIssue[];
  /** Kolik předpisů v registru má stažené úřední znění. */
  snapshotsAvailable: number;
  /**
   * True, když kontrola nenašla žádnou vadu tvaru dat (viz issues).
   *
   * NEZNAMENÁ, že texty odpovídají platnému znění předpisů ani že jsou úplné —
   * na to jsou `regulationCoverage` a `articleSectionIssues`.
   */
  valid: boolean;
}

/** Metadata staženého znění pro dané označení předpisu, nebo null. */
export function findSnapshot(code: string): EsbirkaSnapshotSummary | null {
  const ref = parseSbiratkaRef(code);
  if (!ref) return null;
  return ESBIRKA_SNAPSHOTS[buildSnapshotSlug(ref)] ?? null;
}

/**
 * Rozpozná odkaz na jiný předpis, aby se nezapočítal jako vlastní paragraf.
 *
 * Poznámky pod čarou mají tvar "§ 48 zákona č. 169/1999 Sb." nebo
 * "§ 158b trestního řádu". Bez tohohle filtru by se do seznamu dostala čísla
 * paragrafů úplně jiných zákonů a kontrola by hlásila neexistující vady.
 */
function isCrossReference(rest: string): boolean {
  return /záko|vyhlášk|nařízení|trestního řádu|Sb\./i.test(rest);
}

/**
 * Paragrafy, které text cituje jako vlastní — bez odkazů na jiné předpisy.
 * Za odkaz se bere výskyt, po kterém do 40 znaků následuje jméno jiného předpisu.
 */
export function collectOwnSections(text: string): string[] {
  const own = new Set<string>();
  for (const match of text.matchAll(/§\s*(\d+[a-z]*)/gi)) {
    const rest = text.slice(match.index + match[0].length, match.index + match[0].length + 40);
    if (isCrossReference(rest)) continue;
    own.add(`§ ${match[1].toLowerCase()}`);
  }
  return [...own];
}

/** Porovná studijní výběr jednoho předpisu s jeho úředním zněním. */
export function measureRegulationCoverage(reg: VscrRegulation): RegulationCoverage {
  const text = reg.fullLegalText || '';
  const vyberParagrafu = collectOwnSections(text).sort(compareSections);
  const snapshot = findSnapshot(reg.code);

  if (!snapshot) {
    return {
      code: reg.code,
      title: reg.shortTitle,
      vyberZnaku: text.length,
      vyberParagrafu,
      maUplneZneni: false,
      uredniZnaku: 0,
      uredniParagrafu: 0,
      chybejiciParagrafy: [],
      neznameParagrafy: [],
      ucinnostOd: null,
      cisloZneni: null,
    };
  }

  const uredni = new Set(snapshot.paragrafy);
  const vyber = new Set(vyberParagrafu);

  return {
    code: reg.code,
    title: reg.shortTitle,
    vyberZnaku: text.length,
    vyberParagrafu,
    maUplneZneni: true,
    uredniZnaku: snapshot.pocetZnaku,
    uredniParagrafu: snapshot.paragrafy.length,
    chybejiciParagrafy: snapshot.paragrafy.filter((p) => !vyber.has(p)),
    neznameParagrafy: vyberParagrafu.filter((p) => !uredni.has(p)),
    ucinnostOd: snapshot.ucinnostOd,
    cisloZneni: snapshot.cisloZneni,
  };
}

/** Řadí `§ 4`, `§ 4a`, `§ 10` v pořadí předpisu, ne abecedně. */
export function compareSections(a: string, b: string): number {
  const parse = (s: string) => {
    const m = s.match(/§\s*(\d+)([a-z]*)/i);
    return m ? { num: Number.parseInt(m[1], 10), suffix: m[2] } : { num: 0, suffix: '' };
  };
  const pa = parse(a);
  const pb = parse(b);
  if (pa.num !== pb.num) return pa.num - pb.num;
  return pa.suffix.localeCompare(pb.suffix);
}

/**
 * Ověří, že paragrafy citované v Paragrafovém výkladu v předpisu opravdu jsou.
 *
 * Tohle je nejcennější část kontroly: odhalí článek, který učí „§ 2 – členění
 * Vězeňské služby“, zatímco v platném znění je pod § 2 něco jiného nebo
 * paragraf vůbec neexistuje.
 */
export function auditArticleSections(articles: LegalArticle[]): ArticleSectionIssue[] {
  const issues: ArticleSectionIssue[] = [];

  for (const art of articles) {
    const snapshot = findSnapshot(art.actNumber);
    if (!snapshot) continue;

    const known = new Set(snapshot.paragrafy);
    const cited = collectSectionLabels(art.section)
      .map((label) => normalizeSectionLabel(label))
      .filter((label): label is string => label !== null);

    const unknown = cited.filter((label) => !known.has(label));
    if (unknown.length > 0) {
      issues.push({
        id: art.id,
        actNumber: art.actNumber,
        section: art.section,
        neznameParagrafy: unknown.sort(compareSections),
      });
    }
  }

  return issues;
}

/**
 * Nadpis paragrafu uvedený v našem textu, pokud tam nějaký je.
 *
 * Bere jen `§ N` na ZAČÁTKU řádku — tak jsou studijní texty formátované.
 * Výskyt uprostřed větv je odkaz („… podle § 17 odst. 6 vyhlášky …“), ne
 * nadpis, a porovnávat ho s osnovou by dělalo falešné nálezy. Ze stejného
 * důvodu se přeskočí pokračování `odst.`, `písm.` a text v závorce: zkratka
 * „(jen některý z těchto)“ za nadpisem je náš doplněk, ne součást názvu.
 */
export function collectLabeledHeadings(text: string): { section: string; heading: string }[] {
  const found: { section: string; heading: string }[] = [];

  for (const line of text.split('\n')) {
    const match = line.match(/^\s*§\s*(\d+[a-z]*)\s+(.+)$/i);
    if (!match) continue;

    const rest = match[2].trim();
    // Pokračování odkazu nebo rovnou tělo ustanovení, ne nadpis.
    if (/^(odst\.|písm\.|a\s|až\s|–|-|\()/i.test(rest)) continue;

    const heading = rest
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[:;.,]\s*$/, '')
      .trim();
    if (heading.length < 3) continue;

    found.push({ section: `§ ${match[1].toLowerCase()}`, heading });
  }

  return found;
}

/** Porovnávací tvar nadpisu: bez diakritiky, interpunkce a velkých písmen. */
function normalizeHeading(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Spojky a předložky, které o obsahu nadpisu nevypovídají nic. */
const HEADING_STOP_WORDS = new Set([
  'a', 'i', 'o', 'u', 'v', 've', 'k', 'ke', 'ku', 's', 'se', 'z', 'ze', 'na', 'do',
  'pro', 'po', 'pri', 'od', 'za', 'nebo', 'anebo', 'ci', 'jine', 'jinych', 'podobnych',
]);

/**
 * Hrubý kmen slova — jen aby „kázeňský trest“ a „kázeňské tresty“ splynuly.
 *
 * Není to morfologický analyzátor a nemá být: stačí, aby porovnání nadpisů
 * nepadalo na skloňování. Krátká slova se nechávají být, u delších se odřízne
 * koncovka, takže z „kázeňského“ i „kázeňské“ zbyde „kázeňsk“.
 */
function stemWord(word: string): string {
  if (word.length <= 4) return word;
  return word.replace(
    /(ateln[eay]|ovan[iíeay]|en[iíeay]|ost[iíeay]?|ami|ach|emi|ich|ych|ymi|eho|ymu|emu|[aeiouy]m|[aeiouy]ch|[aeiouy])$/,
    ''
  );
}

/** Kmeny významových slov nadpisu. */
function headingStems(value: string): Set<string> {
  return new Set(
    normalizeHeading(value)
      .split(' ')
      .filter((word) => word.length > 1 && !HEADING_STOP_WORDS.has(word))
      .map(stemWord)
      .filter(Boolean)
  );
}

function isSubset(smaller: Set<string>, larger: Set<string>): boolean {
  for (const item of smaller) if (!larger.has(item)) return false;
  return true;
}

/**
 * Souhlasí nadpis v aplikaci s názvem paragrafu v zákoně?
 *
 * Shoda nemusí být znak po znaku. Studijní text nadpis běžně zkracuje
 * („Služební hodnosti a tarifní třídy“ za zákonné „Služební hodnost, minimální
 * stupeň vzdělání, … a tarifní třída“) a skloňuje jinak — to obojí projde.
 * Neprojde záměna obsahu: „Kázeňské tresty ve vazbě“ nad paragrafem, který se
 * jmenuje „Řízení o kázeňských přestupcích a o zabrání věci“, je vada.
 */
export function headingMatches(inApp: string, inLaw: string): boolean {
  const a = normalizeHeading(inApp);
  const b = normalizeHeading(inLaw);
  if (!a || !b) return true;
  if (a === b || a.includes(b) || b.includes(a)) return true;

  const stemsApp = headingStems(inApp);
  const stemsLaw = headingStems(inLaw);
  if (stemsApp.size === 0 || stemsLaw.size === 0) return true;
  return isSubset(stemsApp, stemsLaw) || isSubset(stemsLaw, stemsApp);
}

/**
 * Ověří, že paragraf v textu nese tentýž nadpis jako v platném znění.
 *
 * Paragrafy, které osnova nepojmenovává (v zákoně mají jen číslo), se
 * přeskakují — není s čím porovnávat.
 */
export function auditSectionHeadings(
  entries: { id: string; actNumber: string; text: string }[],
  headingsByAct: (actNumber: string) => OfficialHeadings | null
): SectionHeadingIssue[] {
  const issues: SectionHeadingIssue[] = [];

  for (const entry of entries) {
    const headings = headingsByAct(entry.actNumber);
    if (!headings) continue;

    for (const { section, heading } of collectLabeledHeadings(entry.text)) {
      const official = headings.get(section);
      if (!official) continue;
      if (headingMatches(heading, official)) continue;

      issues.push({
        id: entry.id,
        actNumber: entry.actNumber,
        section,
        nadpisVAplikaci: heading,
        nadpisVZakone: official,
      });
    }
  }

  return issues;
}

export function auditLegalDatabase(
  articles: LegalArticle[],
  regulationCoverage: RegulationCoverage[] = []
): AuditReport {
  const issues: IntegrityIssue[] = [];
  const seenIds = new Set<string>();
  const categories: Record<string, number> = {};
  let totalWords = 0;
  let totalCharacters = 0;

  articles.forEach((art, index) => {
    // 1. ID check
    if (!art.id || art.id.trim() === '') {
      issues.push({ id: `index-${index}`, field: 'id', type: 'empty', message: 'ID článku chybí nebo je prázdné.' });
    } else if (seenIds.has(art.id)) {
      issues.push({ id: art.id, field: 'id', type: 'duplicate_id', message: `Duplicitní ID: ${art.id}` });
    } else {
      seenIds.add(art.id);
    }

    // 2. Category check
    if (!art.category) {
      issues.push({ id: art.id, field: 'category', type: 'empty', message: 'Kategorie není definována.' });
    } else {
      categories[art.category] = (categories[art.category] || 0) + 1;
    }

    // 3. Act Number and Title
    if (!art.actNumber || art.actNumber.trim().length < 3) {
      issues.push({ id: art.id, field: 'actNumber', type: 'too_short', message: `Číslo předpisu je příliš krátké: "${art.actNumber}".` });
    }
    if (!art.actTitle || art.actTitle.trim().length < 5) {
      issues.push({ id: art.id, field: 'actTitle', type: 'too_short', message: `Název předpisu je příliš krátký: "${art.actTitle}".` });
    }

    // 4. Section and Title
    if (!art.section || art.section.trim().length < 1) {
      issues.push({ id: art.id, field: 'section', type: 'empty', message: 'Paragraf / označení ustanovení chybí.' });
    }
    if (!art.title || art.title.trim().length < 4) {
      issues.push({ id: art.id, field: 'title', type: 'too_short', message: `Nadpis článku je příliš krátký: "${art.title}".` });
    }

    // 5. Exact Text Integrity Check
    if (!art.exactText || art.exactText.trim().length < 20) {
      issues.push({ id: art.id, field: 'exactText', type: 'empty', message: 'Přesné znění je prázdné nebo příliš krátké (< 20 znaků).' });
    } else {
      const text = art.exactText.trim();
      totalCharacters += text.length;
      totalWords += text.split(/\s+/).filter(Boolean).length;

      // Check if text ends abruptly mid-sentence
      const lastChar = text.slice(-1);
      const validEndChars = ['.', '!', '?', ':', ')', ']', '"', '“', '”', '»', '—', ';'];
      if (!validEndChars.includes(lastChar) && !text.endsWith('Sb.') && !text.endsWith('Kč')) {
        issues.push({
          id: art.id,
          field: 'exactText',
          type: 'truncated',
          message: `Text možná končí oříznutý nebo bez správného zakončení (končí "${lastChar}", závěr: "${text.slice(-30)}").`
        });
      }

      // Check for odd unescaped ASCII double quotes
      const doubleQuotesCount = (text.match(/"/g) || []).length;
      if (doubleQuotesCount % 2 !== 0) {
        issues.push({
          id: art.id,
          field: 'exactText',
          type: 'unclosed_quote',
          message: `Nespárované uvozovky v exactText (${doubleQuotesCount} uvozovek).`
        });
      }
    }

    // 6. Explanation Check
    if (!art.explanation || art.explanation.trim().length < 20) {
      issues.push({ id: art.id, field: 'explanation', type: 'empty', message: 'Výklad je prázdný nebo příliš krátký (< 20 znaků).' });
    } else {
      totalCharacters += art.explanation.length;
      totalWords += art.explanation.split(/\s+/).filter(Boolean).length;
    }

    // 7. Exam Tips Check
    if (!art.examTips || art.examTips.trim().length < 15) {
      issues.push({ id: art.id, field: 'examTips', type: 'empty', message: 'Zkušební chytáky jsou prázdné nebo příliš krátké (< 15 znaků).' });
    } else {
      totalCharacters += art.examTips.length;
      totalWords += art.examTips.split(/\s+/).filter(Boolean).length;
    }
  });

  return {
    timestamp: new Date().toISOString(),
    totalArticles: articles.length,
    totalWords,
    totalCharacters,
    categories,
    issues,
    regulationCoverage,
    articleSectionIssues: auditArticleSections(articles),
    snapshotsAvailable: Object.keys(ESBIRKA_SNAPSHOTS).length,
    valid: issues.length === 0
  };
}
