# Akademie VS ČR — studijní portál ZOP A

Vzdělávací aplikace pro příslušníky a zaměstnance Vězeňské služby ČR: banka
testových otázek, kartičkový dril metodou Leitner, plná znění předpisů, taktické
scénáře, zbraňové trenažéry, administrativa a ETŘ, nástěnky tříd ZOP a knihovna
studijních souborů s prohlížečem přímo v aplikaci.

**Stack:** React 19 · Vite 6 · TypeScript 5.8 · Tailwind CSS 4 · Supabase · PWA

## Spuštění lokálně

**Předpoklady:** Node.js 20+ a projekt v [Supabase](https://supabase.com).

```bash
# 1. Závislosti
npm install

# 2. Proměnné prostředí
cp .env.example .env.local
#    … a vyplň VITE_SUPABASE_URL a VITE_SUPABASE_ANON_KEY
#    (Supabase Dashboard → Project Settings → API)

# 3. Databáze
#    V Supabase Dashboard → SQL Editor spusť migrace ze supabase/
#    v pořadí podle supabase/README.md. Bez nich se aplikace spustí,
#    ale přihlášení, role ani ukládání výsledků nebudou fungovat.

# 4. Vývojový server
npm run dev          # http://localhost:3000
```

## Skripty

| Příkaz | Co dělá |
|---|---|
| `npm run dev` | Vývojový server na portu 3000 |
| `npm run build` | Produkční build do `dist/` |
| `npm run preview` | Náhled produkčního buildu |
| `npm run lint` | Typová kontrola (`tsc --noEmit`) |
| `npm test` | Typy + integrita předpisů + kvalita banky otázek |
| `npm run check:legal` | Kontrola dat předpisů a porovnání s úředním zněním z e-Sbírky |
| `npm run check:questions` | Strukturální kontroly otázek a ráčna na délkový tell |
| `npm run sync:laws` | Stažení úplných znění předpisů z REST API e-Sbírky |

Na každý pull request (a na push do `main`) běží [CI](.github/workflows/ci.yml):
typová kontrola, produkční build, integrita předpisů a kvalita banky otázek.
Lokálně je spustíš přes `npm test && npm run build`.

Jednou týdně navíc běží [synchronizace s e-Sbírkou](.github/workflows/sync-esbirka.yml)
— viz níže.

### Kontrola kvality banky otázek

`npm run check:questions` dělá dvě věci. Strukturální kontroly (unikátní ID,
platný `correctOption`, soulad `answer` s `options`, vyplněné `rationale`
a `source`) jsou **tvrdé** — banka je dnes plní na 100 %, takže každá regrese
shodí build.

Druhá část hlídá **délkový tell**: nese délka možnosti informaci o tom, která
odpověď je správná? Při zavedení kontroly byla správná odpověď nejdelší ze čtyř
u 343 ze 377 otázek (91 %), takže se test dal projít bez znalosti předmětu.

Hlídají se **oba extrémy**. Dorovnat distraktory tak, aby byly všechny delší než
správná odpověď, tell neodstraní — jen ho překlopí na „vyber nejkratší“. Ráčna
proto sleduje zvlášť „správná je nejdelší“ i „správná je nejkratší“ a ani jeden
počet nesmí vzrůst — celkově ani v jednom předmětu. Ideál je u obou poblíž 25 %,
což je náhodná hladina u čtyř možností (Penologie je na 25 % / 26,9 %).

Po zlepšení obsahu přepiš referenční stav:

```bash
npm run check:questions -- --update-baseline   # a commitni baseline
```

## Právní kompas a e-Sbírka

Znění zákonů a vyhlášek se do aplikace nepřepisují ručně. Stahuje je
`npm run sync:laws` z [veřejného REST API e-Sbírky](https://e-sbirka.gov.cz/restful-api)
— bez klíče a bez přihlášení:

1. Pro každý předpis z registru, který má číslo ve Sbírce zákonů, se zjistí jeho
   `dokumentId`, aktuální znění, historie novel a osnova (seznam paragrafů).
2. Stáhne se úřední **informativní znění v DOCX** a převede se na text.
3. Výsledek se uloží do `public/data/esbirka/<předpis>.json` a jeho metadata do
   generovaného `src/data/esbirka/snapshotManifest.ts`.

Texty leží mimo JavaScriptový balík záměrně: dohromady mají přes 1,5 MB (samotný
trestní řád přes 600 kB) a načítají se až ve chvíli, kdy je čtenář otevře.
Service Worker si je pak drží v mezipaměti, takže tlačítko **Stáhnout pro
offline** skutečně stáhne znění do zařízení.

### Týdenní synchronizace

`npm run sync:laws` spouští sám workflow
[`sync-esbirka.yml`](.github/workflows/sync-esbirka.yml), každé pondělí ve 3:17 UTC
(a na požádání přes *Run workflow*, kde jde omezit výběr předpisů).

- **Nezměnilo-li se nic, neudělá nic.** Skript přepíše soubor jen tehdy, když se
  změnil jeho obsah — samotné datum stažení diff nevytvoří, takže prázdné pull
  requesty nevznikají.
- **Změnilo-li se něco**, proběhnou `npm run lint`, `npm run check:legal`
  a `npm run build` a teprve pak se založí (nebo aktualizuje) draft pull request
  na větvi `automat/esbirka-sync`. V těle je tabulka „bylo → je“ s čísly znění,
  novelami a změnou délky textu.
- Kontroly běží uvnitř workflow schválně: pull request založený přes
  `GITHUB_TOKEN` nespouští další workflow sám od sebe (GitHub tak brání
  smyčkám). `ci.yml` se na něm zařadí do fronty, ale zůstane ve stavu
  `action_required`, dokud ho někdo ručně nepustí — bez kontrol uvnitř
  synchronizace by tedy změna přišla k posouzení neověřená.

Aby workflow mohlo pull request založit, musí být v **Settings → Actions →
General → Workflow permissions** zaškrtnuté *Allow GitHub Actions to create and
approve pull requests*.

Studijní výběr v `vscrRegulationsRegistry.ts` ani Paragrafový výklad
v `legalCompasData.ts` skript neupravuje — po novele je na člověku, aby je
prošel. `check:legal` upozorní na paragraf, který v novém znění není, a na
rozpor v poli `lastAmendment`.

| Kde | Co to umí |
|---|---|
| Paragrafový výklad | Pod studijním přepisem lze rozbalit **doslovné znění** citovaných paragrafů z e-Sbírky |
| Registr předpisů | Odznak „Úplné znění od …“ vs. „Jen studijní výběr“ u každé karty |
| Čtečka předpisu | Přepínač *Úplné znění (e-Sbírka)* / *Studijní výběr*, skok na paragraf, odkaz na úřední PDF |
| Ověřit podle e-Sbírky | Živý dotaz na API: je stažené znění pořád to účinné? Odpověď zní *aktuální*, *e-Sbírka vede novější* nebo *nedostupné* — nikdy „ověřeno“ naslepo |
| Audit | Kolik paragrafů předpisu studijní výběr pokrývá a které chybí, porovnáno s osnovou z e-Sbírky |

Prohlížeč na e-Sbírku přímo nedosáhne — API posílá `Access-Control-Allow-Origin`
jen pro vlastní doménu. Dotazy proto vedou přes vlastní cestu `/api/esbirka`,
kterou obsluhuje serverless funkce [`api/esbirka.ts`](api/esbirka.ts) na Vercelu
a při `npm run dev` stejná obsluha ve vývojovém serveru. Proxy pouští jen šest
konkrétních endpointů a ELI ve tvaru `/eli/cz/sb/{rok}/{číslo}`; nic jiného ven
neodejde. Na čistě statickém nasazení (`render.yaml`) funkce neběží a ověřování
se poctivě označí za nedostupné.

### Přístupový klíč

Aplikace volá `https://e-sbirka.gov.cz/sbr-externi` — backend veřejného portálu,
který klíč nevyžaduje. Dokumentované **Veřejné API** e-Sbírky ale běží na
`https://api.e-sbirka.gov.cz` a bez klíče vrací `401 NEPLATNY_API_KLIC`; klíč
přiděluje Ministerstvo vnitra po registraci.

Aplikace je na to připravená — stačí vyplnit dvě proměnné prostředí, v kódu se
nemění nic:

| Proměnná | Výchozí stav |
|---|---|
| `ESBIRKA_API_KEY` | nevyplněno = žádný klíč se neposílá |
| `ESBIRKA_API_ROOT` | nevyplněno = `https://e-sbirka.gov.cz/sbr-externi` |

Ani jedna nemá prefix `VITE_` — klíč se čte výhradně na serveru
(`src/utils/esbirka/serverConfig.ts`) a do klientského balíku se nedostane.

**Postup registrace a obsah žádosti je v [`docs/esbirka-registrace.md`](docs/esbirka-registrace.md).**
Jestli se registrační povinnost vztahuje i na dnešní použití backendu portálu,
nevíme — dokument to říká otevřeně a navrhuje, na co se předem zeptat.

Synchronizace drží mezi požadavky odstup 200 ms (`src/utils/esbirka/pace.ts`),
tedy nejvýš 5 požadavků za sekundu. Jeden běh je 402 požadavků a trvá přes
80 sekund. Tahle čísla jsou zároveň to, co se uvádí v registrační žádosti —
když se jedno změní, musí se změnit i druhé.

> **Právní závaznost:** e-Sbírka poskytuje *informativní* znění. Závazné je znění
> vyhlášené ve Sbírce zákonů. Aplikace to u každého textu uvádí, včetně čísla
> znění, data účinnosti a data stažení.

`npm run check:legal` porovnává data s tím, co se stáhlo: hlásí paragrafy, které
v platném znění neexistují (to shodí build), pokrytí předpisu studijním výběrem,
rozpor mezi novelami v registru a v e-Sbírce a doslovnost textů, které se
zobrazují jako znění zákona.

## Obsah, který spravuje lektor

Předměty, poznávačky i modelové situace jsou v repozitáři jako výchozí data,
ale lektor a správce je může měnit přímo v aplikaci — přidat blok, upravit ho,
skrýt studentům nebo odebrat. Úprava se ukládá jako **překryv** nad výchozími
daty (tabulka `content_blocks`, migrace `027`), takže se kdykoli dá vrátit
k původní podobě: stačí u položky zvolit obnovení.

| Záložka | Co jde spravovat |
|---|---|
| Předměty | bloky předmětů včetně popisu, pramenů práva, okruhů a požadavků ke zkoušce |
| Poznávačka | kategorie i jednotlivé dvojice, u diagramů popisky a souřadnice částí |
| Modelovky | situace, jejich kroky, volby, zpětná vazba a zákonný podklad |
| Banka otázek | otázky ke všem předmětům včetně nově založených |

## Soubory: štítky, předměty a třídy

O zařazení souboru nerozhoduje složka, ve které leží, ale **štítky** (tabulka
`material_tags`, migrace `027`). Jeden soubor tak může patřit k několika
předmětům a zároveň k několika třídám:

- Štítky se nastavují při nahrávání (i u několika souborů najednou) a dají se
  kdykoli změnit — u jednoho souboru i hromadně u celého výběru.
- Nově založená třída je ve správci souborů k dispozici hned, nic se nenastavuje.
- Podle štítků se soubory samy objeví v detailu předmětu a na nástěnce třídy.
- Starší soubory ve složkách podle předmětu se čtou dál; bez štítků se zařadí
  podle své složky, takže se nic neztratilo a nic není potřeba přesouvat.

Soubory jdou otevřít přímo v aplikaci: PDF a obrázky vykreslí prohlížeč, Word se
převede knihovnou [mammoth](https://github.com/mwilliamson/mammoth.js)
a prezentace se rozeberou přes [JSZip](https://stuk.github.io/jszip/) na text
a obrázky jednotlivých snímků. Převod běží **celý v zařízení uživatele** —
interní materiály VS ČR se kvůli náhledu neposílají do žádné cizí online
prohlížečky dokumentů. Obě knihovny se stahují až při prvním otevření dokumentu,
takže hlavní balík aplikace nezvětšují.

## Proměnné prostředí

Kompletní seznam s popisem je v [`.env.example`](.env.example). Stručně:

| Proměnná | Povinná | Poznámka |
|---|---|---|
| `VITE_SUPABASE_URL` | ano | URL projektu |
| `VITE_SUPABASE_ANON_KEY` | ano | Anon klíč (je určen ke zveřejnění, chrání ho RLS) |
| `VITE_ADMIN_EMAILS` | ne | Bootstrap správce, než se role nastaví v databázi |
| `VITE_GEMINI_API_KEY` | ne | AI asistent. Bez něj si klíč zadá uživatel sám — bezpečnější |

> Vše s prefixem `VITE_` se vkládá do **veřejného** klientského bundlu. Nikdy tam
> nedávej `service_role` klíč ani nic, co nemá být vidět ve zdrojovém kódu stránky.

## Databáze a oprávnění

Schéma i RLS politiky jsou v [`supabase/`](supabase/README.md). Aplikace zná čtyři
role, o kterých rozhoduje **výhradně** sloupec `public.profiles.role`:

| Role | Oprávnění |
|---|---|
| `student` | Studium, testy, vlastní statistiky |
| `velitel_tridy` | Navíc správa nástěnky **své vlastní** třídy |
| `lektor` | Navíc správa otázek, materiálů, zpětné vazby a všech tříd |
| `admin` | Navíc správa uživatelů, rolí a interních zpráv |

Roli přiděluje správce ve správě uživatelů. Uživatel si ji nemůže nastavit sám —
zápis jde přímo do databáze a vynucuje ho RLS politika, ne kód na klientovi.

## Nasazení

Produkce běží na Vercelu podle [`vercel.json`](vercel.json); proměnné prostředí
nastav v Project Settings → Environment Variables. Alternativní statické nasazení
popisuje [`render.yaml`](render.yaml).

## Pokyny pro vývoj

Pravidla pro práci s daty otázek, ID, prefixy a typovou bezpečností jsou
v [`AGENTS.md`](AGENTS.md).
