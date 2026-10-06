// ─── Sdílení věcí z aplikace do chatu (migrace 054) ──────────────────────────
//
// Sdílená věc putuje ve zprávě jako malý JSON (sloupec `sdileni`). Server
// ověří jen druh, název a velikost; obsah napsal jiný uživatel, proto se tu
// každé pole čte opatrně a zobrazuje se výhradně jako prostý text.

/** Soubor z Knihovny (kbelík studijních materiálů). */
export interface SharedMaterial {
  druh: 'material';
  nazev: string;
  /** Cesta v kbelíku `studijni-materialy`. */
  cesta: string;
  typ: string;
  velikost: number;
}

/** Testová otázka se správnou odpovědí a odůvodněním. */
export interface SharedQuestion {
  druh: 'otazka';
  nazev: string;
  predmet: string;
  otazka: string;
  moznosti: string[];
  /** Index správné možnosti, nebo null u otázky bez možností. */
  spravna: number | null;
  odpoved: string;
  oduvodneni: string;
  pramen: string;
}

/** Předpis z registru Kompasu zákonů. */
export interface SharedRegulation {
  druh: 'predpis';
  nazev: string;
  id: string;
  kod: string;
}

/** Článek (paragraf) z Kompasu zákonů. */
export interface SharedArticle {
  druh: 'clanek';
  nazev: string;
  id: string;
  kod: string;
}

/** Modelová situace (migrace 056). */
export interface SharedScenario {
  druh: 'scenar';
  nazev: string;
  id: string;
  /** Kategorie a obtížnost, jen pro popisek karty. */
  popis: string;
}

/** Okruh Poznávačky (migrace 056). */
export interface SharedMatching {
  druh: 'poznavacka';
  nazev: string;
  id: string;
  popis: string;
}

export type ChatShare =
  | SharedMaterial
  | SharedQuestion
  | SharedRegulation
  | SharedArticle
  | SharedScenario
  | SharedMatching;

export const CHAT_SHARE_LABEL: Record<ChatShare['druh'], string> = {
  material: 'Soubor z Knihovny',
  otazka: 'Otázka',
  predpis: 'Předpis',
  clanek: 'Kompas zákonů',
  scenar: 'Modelová situace',
  poznavacka: 'Poznávačka',
};

/** Server přijme nejvýš 6000 znaků JSON; necháváme rezervu. */
const MAX_FIELD = 1500;

function str(value: unknown, max = MAX_FIELD): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function cut(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** Bezpečné čtení sdílené věci ze zprávy; cokoli neznámého = null. */
export function parseChatShare(raw: unknown): ChatShare | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const nazev = str(r.nazev, 300);
  if (!nazev) return null;

  switch (r.druh) {
    case 'material': {
      const cesta = str(r.cesta, 500);
      // Jen relativní cesta v kbelíku, žádné skoky o složku výš.
      if (!cesta || cesta.startsWith('/') || cesta.includes('..')) return null;
      return {
        druh: 'material',
        nazev,
        cesta,
        typ: str(r.typ, 200) ?? '',
        velikost: typeof r.velikost === 'number' && Number.isFinite(r.velikost) ? r.velikost : 0,
      };
    }
    case 'otazka': {
      const otazka = str(r.otazka);
      if (!otazka) return null;
      const moznosti = Array.isArray(r.moznosti)
        ? r.moznosti.map((m) => str(m, 500)).filter((m): m is string => m !== null).slice(0, 8)
        : [];
      const spravna =
        typeof r.spravna === 'number' && Number.isInteger(r.spravna) && r.spravna >= 0 && r.spravna < moznosti.length
          ? r.spravna
          : null;
      return {
        druh: 'otazka',
        nazev,
        predmet: str(r.predmet, 200) ?? '',
        otazka,
        moznosti,
        spravna,
        odpoved: str(r.odpoved, 500) ?? '',
        oduvodneni: str(r.oduvodneni) ?? '',
        pramen: str(r.pramen, 300) ?? '',
      };
    }
    case 'predpis':
    case 'clanek': {
      const id = str(r.id, 200);
      if (!id) return null;
      return { druh: r.druh, nazev, id, kod: str(r.kod, 200) ?? '' };
    }
    case 'scenar':
    case 'poznavacka': {
      const id = str(r.id, 200);
      if (!id) return null;
      return { druh: r.druh, nazev, id, popis: str(r.popis, 200) ?? '' };
    }
    default:
      return null;
  }
}

// ─── Tvorba sdílených věcí ───────────────────────────────────────────────────

export function shareMaterial(m: { name: string; displayName: string; mimeType: string; size: number }): SharedMaterial {
  return { druh: 'material', nazev: cut(m.displayName, 300), cesta: m.name, typ: m.mimeType, velikost: m.size };
}

export function shareQuestion(q: {
  subject: string;
  question: string;
  answer: string;
  options?: string[];
  correctOption?: number;
  rationale: string;
  source: string;
}): SharedQuestion {
  const moznosti = (q.options ?? []).slice(0, 8).map((o) => cut(o, 400));
  const spravna =
    typeof q.correctOption === 'number' && q.correctOption >= 0 && q.correctOption < moznosti.length
      ? q.correctOption
      : null;
  return {
    druh: 'otazka',
    nazev: cut(q.question, 300),
    predmet: cut(q.subject, 200),
    otazka: cut(q.question, 1200),
    moznosti,
    spravna,
    odpoved: cut(q.answer, 400),
    oduvodneni: cut(q.rationale, 1200),
    pramen: cut(q.source, 300),
  };
}

export function shareRegulation(reg: { id: string; code: string; shortTitle: string; title: string }): SharedRegulation {
  return { druh: 'predpis', nazev: cut(reg.shortTitle || reg.title, 300), id: reg.id, kod: cut(reg.code, 200) };
}

export function shareArticle(a: { id: string; title: string; section: string; actNumber: string }): SharedArticle {
  return { druh: 'clanek', nazev: cut(a.title, 300), id: a.id, kod: cut(`${a.section} · ${a.actNumber}`, 200) };
}

export function shareScenario(s: { id: string; title: string; category: string; difficulty: string }): SharedScenario {
  return { druh: 'scenar', nazev: cut(s.title, 300), id: s.id, popis: cut(`${s.category} · ${s.difficulty}`, 200) };
}

export function shareMatching(c: { id: string; title: string; type?: string }): SharedMatching {
  const popis = c.type === 'diagram' ? 'Popis schématu' : c.type === 'weapon' ? 'Poznávačka zbraně' : 'Spojování pojmů';
  return { druh: 'poznavacka', nazev: cut(c.title, 300), id: c.id, popis };
}

// ─── Otevření scénáře nebo poznávačky z chatu ────────────────────────────────

/** Adresa, která otevře modelovou situaci nebo okruh Poznávačky. */
export function appItemHash(share: SharedScenario | SharedMatching): string {
  const tab = share.druh === 'scenar' ? 'scenarios' : 'matching';
  return `#${tab}/${encodeURIComponent(share.id)}`;
}

/** Id položky z adresy `#<záložka>/<id>` pro danou záložku, jinak null. */
export function itemIdFromHash(hash: string, tab: 'scenarios' | 'matching'): string | null {
  const [hashTab, id] = hash.replace(/^#/, '').split('/');
  if (hashTab !== tab || !id) return null;
  try {
    return decodeURIComponent(id);
  } catch {
    return null;
  }
}

// ─── Otevření předpisu nebo článku z chatu ───────────────────────────────────

/** Adresa, kterou Kompas zákonů po otevření přečte a ukáže danou věc. */
export function compassHash(share: SharedRegulation | SharedArticle): string {
  return `#compass/${share.druh}/${encodeURIComponent(share.id)}`;
}

/** Co má Kompas po otevření ukázat (z adresy `#compass/<druh>/<id>`), jinak null. */
export function compassTargetFromHash(hash: string): { druh: 'predpis' | 'clanek'; id: string } | null {
  const [tab, druh, id] = hash.replace(/^#/, '').split('/');
  if (tab !== 'compass' || !id || (druh !== 'predpis' && druh !== 'clanek')) return null;
  try {
    return { druh, id: decodeURIComponent(id) };
  } catch {
    return null;
  }
}
