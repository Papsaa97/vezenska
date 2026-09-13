# Akademie VS ČR — studijní portál ZOP A

Vzdělávací aplikace pro příslušníky a zaměstnance Vězeňské služby ČR: banka
testových otázek, kartičkový dril metodou Leitner, plná znění předpisů, taktické
scénáře, zbraňové trenažéry, administrativa a ETŘ, nástěnky tříd ZOP.

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
| `npm run check:legal` | Formální kontrola integrity dat předpisů |
| `npm run check:questions` | Strukturální kontroly otázek a ráčna na délkový tell |
| `npm run sync:laws` | Synchronizace textů předpisů |

Na každý pull request (a na push do `main`) běží [CI](.github/workflows/ci.yml):
typová kontrola, produkční build, integrita předpisů a kvalita banky otázek.
Lokálně je spustíš přes `npm test && npm run build`.

### Kontrola kvality banky otázek

`npm run check:questions` dělá dvě věci. Strukturální kontroly (unikátní ID,
platný `correctOption`, soulad `answer` s `options`, vyplněné `rationale`
a `source`) jsou **tvrdé** — banka je dnes plní na 100 %, takže každá regrese
shodí build.

Druhá část hlídá **délkový tell**: u 343 ze 377 otázek (91 %) je správná odpověď
zároveň nejdelší ze čtyř, takže se test dá projít bez znalosti předmětu. Opravit
to znamená přepsat distraktory u stovek otázek, proto se nekontroluje absolutní
cíl, ale to, že se stav nezhoršuje — počet takových otázek nesmí vzrůst ani
celkově, ani v jednom předmětu. Po zlepšení obsahu přepiš referenční stav:

```bash
npm run check:questions -- --update-baseline   # a commitni baseline
```

## Proměnné prostředí

Kompletní seznam s popisem je v [`.env.example`](.env.example). Stručně:

| Proměnná | Povinná | Poznámka |
|---|---|---|
| `VITE_SUPABASE_URL` | ano | URL projektu |
| `VITE_SUPABASE_ANON_KEY` | ano | Anon klíč (je určen ke zveřejnění, chrání ho RLS) |
| `VITE_ADMIN_EMAILS` | ne | Bootstrap správce, než se role nastaví v databázi |
| `VITE_GEMINI_API_KEY` | ne | AI asistent. Bez něj si klíč zadá uživatel sám — bezpečnější |
| `AUTONOMA_*` | ne | End-to-end testy, viz níže |

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

## End-to-end testy (Autonoma)

Endpoint `/api/autonoma` zakládá a maže **reálné řádky** v databázi, proto je
**ve výchozím stavu vypnutý** a tváří se jako neexistující (404). Zapne se jen
tehdy, je-li `AUTONOMA_ENABLED=true` **a zároveň** vyplněné všechny proměnné
`AUTONOMA_*` z `.env.example`. V produkci ho nechej vypnutý.

Tajemství nejsou nikde v repozitáři — vygeneruj si vlastní (`openssl rand -hex 32`).

## Nasazení

Produkce běží na Vercelu podle [`vercel.json`](vercel.json); proměnné prostředí
nastav v Project Settings → Environment Variables. Alternativní statické nasazení
popisuje [`render.yaml`](render.yaml).

## Pokyny pro vývoj

Pravidla pro práci s daty otázek, ID, prefixy a typovou bezpečností jsou
v [`AGENTS.md`](AGENTS.md).
