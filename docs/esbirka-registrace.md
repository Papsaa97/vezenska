# Registrace k veřejnému REST API e-Sbírky

Návod, jak požádat Ministerstvo vnitra o přístupový klíč, a co do žádosti
vyplnit. Čísla v části „Obsah žádosti“ nejsou odhady — vycházejí z toho, co
aplikace opravdu dělá, a dají se kdykoli přepočítat (viz „Odkud jsou čísla“).

## Potřebujeme to vůbec?

Poctivá odpověď: **nevíme jistě a nejde to zjistit jinak než dotazem.**

Aplikace dnes volá `https://e-sbirka.gov.cz/sbr-externi/…`. Je to backend, na
kterém běží samotný portál e-Sbírka, a měřením je ověřeno, že odpovídá bez
jakéhokoli klíče (HTTP 200 z několika nesouvisejících sítí).

Dokumentované **Veřejné API** e-Sbírky ale běží jinde — na
`https://api.e-sbirka.gov.cz` — a bez klíče vrací HTTP 401 s kódem
`NEPLATNY_API_KLIC`. Portál k němu uvádí, že *„každý subjekt, který chce
využívat veřejné API systému e-Sbírka a e-Legislativa, musí být registrován“*.

Z toho **nevyplývá**, že se registrační povinnost na dnešní použití
`sbr-externi` nevztahuje. Že jde o dvě různé věci, je náš výklad naměřeného
chování serveru, ne stanovisko správce systému. Žádný zveřejněný dokument se
k endpointu `sbr-externi` nevyjadřuje — dokumentace zná jen
`api.e-sbirka.gov.cz`.

**Doporučení:** registrovat se. Náklad je jeden formulář datovou schránkou,
získá se tím jistota, dokumentované podmínky užití a někdo, kdo o změnách
uvědomí. Pro aplikaci státní organizace, která učí právní texty příslušníky,
to za to stojí.

**Než se odešle žádost, vyplatí se zeptat** na podporu systému, jestli je
dnešní použití `sbr-externi` v pořádku a jestli klíč situaci vůbec změní —
viz „Co se zeptat předem“ níže.

## Postup

| Krok | Co udělat |
|---|---|
| 1 | Stáhnout formulář **Žádost o registraci klienta veřejného REST API e-Sbírky a e-Legislativy** — [odkaz](https://opendata.eselpoint.gov.cz/dokumentace/Zadost%20o%20registraci%20klienta%20verejneho%20REST%20API%20e-Sbirky%20a%20e-Legislativy.docx) (soubor je DOCX, přestože ho portál popisuje jako PDF) |
| 2 | Vyplnit podle části „Obsah žádosti“ níže |
| 3 | Odeslat **do datové schránky Ministerstva vnitra `6bnaawp`** |
| 4 | Předmět zprávy: `e-Sbírka a e-Legislativa – registrace REST API` |
| 5 | Počkat — žádost se posuzuje **nejpozději do 10 pracovních dní ode dne doručení** |
| 6 | Výsledek přijde datovou schránkou. Při kladném posouzení s ním dorazí **přístupový klíč a podmínky užití** |
| 7 | Klíč vložit do nastavení podle části „Co udělat s klíčem“ |

> **Pozor na pomlčku v předmětu.** Portál i formulář mají v předmětu zprávy
> dlouhou pomlčku „–“ (en dash, U+2013), ne spojovník „-“.

Datová schránka `6bnaawp` je ověřená ze tří nezávislých míst: text portálu,
samotný formulář a oficiální Seznam držitelů datových schránek (Ministerstvo
vnitra, IČO 00007064, Nad štolou 936/3, Praha 7; jde o **hlavní** schránku
úřadu, ne o některou z osmnácti vedlejších).

Jiná cesta než datová schránka nikde popsaná není. Kontakty `esel@spcss.cz`
a +420 225 515 900 (Státní pokladna Centrum sdílených služeb, platí od
1. 1. 2026) jsou uváděné jako uživatelská podpora systému, ne jako registrační
kanál.

Registrace pro e-Sbírku a e-Legislativu je **společná** — jeden klíč platí na
obojí, o druhé se nežádá zvlášť. API je po registraci bezplatné.

## Obsah žádosti

Formulář má sekci „Informace o klientovi“; hvězdička značí povinnou položku.

| Položka | Co vyplnit |
|---|---|
| **Název\*** | Vězeňská služba České republiky, Akademie VS ČR Stráž pod Ralskem |
| **E-mail\*** | *(služební adresa správce aplikace)* |
| **Telefon** | *(služební telefon téže osoby)* |
| **ID datové schránky\*** | `b86abcb` — hlavní schránka VS ČR (IČO 00212423, Soudní 1672/1a, Praha 4). Akademie má vlastní schránku `dya227n`, ta je ale vedená jako vedlejší („OVM – Ostatní“) pod týmž IČO; kterou uvést, je na rozhodnutí úřadu |
| **Důvod žádosti\*** | viz text níže |
| **Datové požadavky\*** | Konsolidovaná znění 9 předpisů (7 zákonů, 2 vyhlášky) v DOCX, k nim osnova a metadata znění. Jeden úplný běh stáhne přibližně **1,8 MB** textu. |
| **Maximální počet požadavků za sekundu\*** | **5** |
| **Maximální počet souběžných připojení\*** | **1** |
| **Časové rozpětí volání služeb v rámci dne\*** | Automatická synchronizace: pondělí 03:17–03:25 UTC (04:17–05:25 SEČ/SELČ). Interaktivní dotazy: pracovní dny 06:00–20:00 SEČ. |
| **Celkový předpokládaný počet volání za den\*** | V den synchronizace **do 450**, ostatní dny **do 50** |
| **Časové rozpětí předpokládaných provozních špiček\*** | Jedna špička týdně, pondělí 03:17–03:25 UTC, trvání přibližně 80 sekund |

Pod tabulkou je prohlášení „Odesláním tohoto formuláře stvrzuji, že uvedené
údaje jsou pravdivé“ a pole *V* (místo), *Dne* (datum) a *Jméno, příjmení*.

### Důvod žádosti — návrh textu

> Vězeňská služba České republiky provozuje pro Akademii VS ČR ve Stráži pod
> Ralskem interní studijní portál pro přípravu příslušníků na zkoušku odborné
> způsobilosti (ZOP A). Portál zobrazuje konsolidovaná znění předpisů, podle
> nichž příslušníci jednají ve službě — zákona č. 555/1992 Sb. o Vězeňské
> službě a justiční stráži, zákona č. 169/1999 Sb. o výkonu trestu odnětí
> svobody, zákona č. 293/1993 Sb. o výkonu vazby a dalších.
>
> Dosud se texty do aplikace přepisovaly ručně, což vedlo k tomu, že se
> rozešly s platným zněním. Napojení na REST API e-Sbírky to má nahradit:
> jednou týdně se automaticky ověří, zda u sledovaných předpisů nevyšla novela,
> a případné nové znění se stáhne. Uživatel si navíc může u každého ustanovení
> nechat zobrazit úřední znění a ověřit, že text v aplikaci odpovídá tomu,
> co e-Sbírka vede jako účinné.
>
> Data se nijak dál nešíří ani neposkytují třetím stranám; slouží výhradně ke
> služební přípravě příslušníků Vězeňské služby ČR. Přístup je čtecí.

### Odkud jsou čísla

Nejsou to odhady. Jeden úplný běh synchronizace udělá **402 požadavků**:

| Předpis | Položek osnovy | Požadavků |
|---|---|---|
| 141/1961 Sb. (trestní řád) | 717 | 105 |
| 40/2009 Sb. (trestní zákoník) | 546 | 85 |
| 361/2003 Sb. (služební poměr) | 331 | 73 |
| 169/1999 Sb. (výkon trestu) | 142 | 35 |
| 129/2008 Sb. (zabezpečovací detence) | 87 | 31 |
| 345/1999 Sb. (ŘVTOS) | 142 | 26 |
| 109/1994 Sb. (ŘVV) | 118 | 19 |
| 293/1993 Sb. (výkon vazby) | 61 | 15 |
| 555/1992 Sb. (VS a JS) | 59 | 13 |
| **celkem** | **2 203** | **402** |

Na jeden předpis připadá: dotaz na id, na detail znění, na historii, jeden
dotaz na kořen osnovy a další na každý uzel s potomky, žádost o vygenerování
DOCX a jeho stažení.

Hodnota **5 požadavků za sekundu** není přání, ale vlastnost kódu:
`src/utils/esbirka/pace.ts` drží mezi požadavky odstup 200 ms. Běh proto trvá
nejméně 80 sekund. Požadavky chodí sériově, odtud **1 souběžné připojení**.

Denní strop **450** je 402 požadavků jednoho běhu plus rezerva na ruční
spuštění a interaktivní ověřování. V ostatní dny se volá jen tehdy, když
někdo v aplikaci klikne na „Ověřit podle e-Sbírky“ — to je jeden požadavek.

> Kdyby se změnil odstup v `pace.ts` nebo přibyly sledované předpisy, přestanou
> tahle čísla platit a je potřeba upravit i tento dokument. Přepočítat je jde
> ze souborů v `public/data/esbirka/` — počet požadavků na předpis je
> `3 + 1 + (počet uzlů osnovy s potomky) + 2`.

## Co se zeptat předem

Tohle ze zveřejněných zdrojů zjistit nejde a stojí za dotaz na `esel@spcss.cz`
nebo +420 225 515 900 ještě před odesláním žádosti:

1. **Je dnešní použití `https://e-sbirka.gov.cz/sbr-externi` bez klíče
   v pořádku?** Dokumentace ho nezmiňuje, klíč nevyžaduje a my z toho neumíme
   vyvodit, jestli je to záměr, tolerovaný vedlejší efekt, nebo něco, co se
   může zavřít.
2. **Podporuje Veřejné API to, co aplikace potřebuje?** V definičním souboru
   OpenAPI (datován 17. 1. 2024) nejsou endpointy `/obsah`, `/detail-zneni`
   ani celá souborová služba, přes kterou se stahuje DOCX a úřední PDF.
   Dokumentace je ale o dva a půl roku starší než text portálu, takže z její
   neúplnosti nejde nic bezpečně usuzovat. Bez vydaného klíče to nejde
   vyzkoušet — 401 přijde dřív než routování.
3. **Jaké limity se k našim číslům přidělí** a co se stane při jejich
   překročení (odpověď 429? zablokování klíče?).
4. **Platnost a obnova klíče** — na jak dlouho se vydává, jde rotovat, co dělat
   při kompromitaci.
5. **Kdo má žádat** — VS ČR z hlavní schránky `b86abcb`, nebo Akademie
   z `dya227n`.

## Co udělat s klíčem

Aplikace je na klíč připravená. Nemění se kód, jen nastavení:

| Proměnná | Hodnota |
|---|---|
| `ESBIRKA_API_KEY` | přidělený klíč |
| `ESBIRKA_API_ROOT` | `https://api.e-sbirka.gov.cz` |

Obě **bez prefixu `VITE_`** — cokoli s tím prefixem Vite vkládá do veřejného
klientského balíku, odkud si to přečte kdokoli. Klíč se čte výhradně na
serveru; do prohlížeče se nedostane ani on, ani název hlavičky.

Kam je vyplnit:

- **Vercel** — Project Settings → Environment Variables (produkce i preview).
  Použije je serverless funkce `/api/esbirka`.
- **GitHub** — Settings → Secrets and variables → Actions. Bez nich bude
  týdenní synchronizace dál volat backend portálu jako dosud. Do workflow
  `.github/workflows/sync-esbirka.yml` se pak doplní `env:` u kroku stahování.
- **Lokálně** — `.env.local`, viz `.env.example`.

Bez těchto proměnných se nic nemění a aplikace se chová přesně jako dnes.
Klíč se posílá v hlavičce `esel-api-access-key`; její název je v kódu pevně,
protože ho určuje dokumentace (`securitySchemes.ApiKey` v OpenAPI e-Sbírky)
a ověřuje měření — query parametr ani `Authorization: Bearer` server nepřijímá.

## Zdroje

- Postup a klíč: [Použití REST API](https://e-sbirka.gov.cz/restful-api) —
  text lze stáhnout i strojově z
  `https://e-sbirka.gov.cz/sbr-obecne/clanky/fixni/esbirka/POUZITI_RESTFULL_API`
- Formulář: [Žádost o registraci klienta](https://opendata.eselpoint.gov.cz/dokumentace/Zadost%20o%20registraci%20klienta%20verejneho%20REST%20API%20e-Sbirky%20a%20e-Legislativy.docx)
- Definiční soubor OpenAPI 3.0: `https://opendata.eselpoint.gov.cz/dokumentace/Definicni_soubor_REST_API_e-Sbirka.zip`
- Příručka: `https://opendata.eselpoint.gov.cz/dokumentace/Prirucka_REST_API_e-Sbirka.pdf`
- Ověření datové schránky: [Seznam držitelů datových schránek](https://www.datovka.gov.cz/sds/detail?dbid=6bnaawp)
