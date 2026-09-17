# Databázové migrace (Supabase)

Migrace se spouštějí **ručně** v Supabase Dashboardu → SQL Editor. Všechny skripty
jsou idempotentní (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`), takže je lze spustit
opakovaně.

## Pořadí spuštění

Skripty na sobě závisí — pomocné funkce `get_role()` a `is_admin()` vznikají
v `profiles.sql` a používají je politiky ve všech dalších souborech. Na novém
projektu spusťte v tomto pořadí:

| # | Soubor | Co dělá |
|---|---|---|
| 1 | `profiles.sql` | Tabulka `profiles`, funkce `get_role()` / `is_admin()` / `is_staff()`, trigger na registraci |
| 2 | `profiles_avatar.sql` | Sloupec `avatar_url` |
| 3 | `010_profiles_user_class.sql` | Sloupec `user_class` — **bez něj se autorizace rolí opírá o localStorage** |
| 4 | `011_profiles_role_constraint.sql` | Doplní roli `velitel_tridy` do omezení `CHECK` |
| 5 | `quiz_questions.sql` | Banka otázek |
| 6 | `quiz_questions_is_hidden.sql` | Sloupce `is_hidden`, `source`, `topic` |
| 7 | `quiz_results.sql` | Historie testů |
| 8 | `user_feedback.sql` | Zpětná vazba |
| 9 | `user_notifications.sql` | Interní zprávy od správce |
| 10 | `class_boards.sql` | Nástěnky tříd a celoškolní hlášení |
| 11 | `admin_user_management.sql` | RPC `admin_delete_user()` |
| 12 | `013_harden_rls.sql` | **Utažení politik**, které byly `USING (true)`; funkce `my_class()`, `can_manage_class()` |
| 13 | `012_materials_storage.sql` | Bucket `studijni-materialy` (potřebuje funkce z kroku 12) |
| 14 | `014_drop_leftover_policies.sql` | **Shodí zbylé povolující politiky**, které rušily účinek kroku 12 |
| 15 | `avatars_storage.sql` | Bucket `avatars` |
| 16 | `set_admin_miichalpapi.sql` | Prvotní nastavení správce — **uprav si e-mail** |
| 17 | `016_diagnostika_zapisu.sql` | Diagnostika a oprava, když nejde nic uložit — **uprav si e-mail** |
| 18 | `017_oprava_rekurze_politik.sql` | Oprava „infinite recursion … for relation profiles" (42P17) |
| 19 | `018_get_role_neni_volatelna_z_klienta.sql` | Zavádí `my_role()` a odebírá klientům `EXECUTE` na `get_role(uuid)` |
| 20 | `019_vykon_politik_a_indexu.sql` | Výkon: ruší překrývající se politiky, obaluje `auth.uid()` do `(select …)`, doplňuje indexy nad cizími klíči |
| 21 | `020_ochrana_posledniho_spravce.sql` | Pojistka: poslednímu správci nelze odebrat roli ani ho smazat |
| 22 | `021_vyhodnoceni_kvizu_na_serveru.sql` | Skóre testu počítá funkce `vyhodnotit_kviz()`, ne prohlížeč; sloupec `quiz_results.overeno` |
| 23 | `022_uklid_banky_otazek.sql` | Smaže 51 řádků odpadu z importu a srovná předměty u 17 špatně zařazených otázek |
| 24 | `023_sluzebni_priprava_dostava_obsah.sql` | Služební příprava dostává svůj obsah (21 otázek); `zbrane`/`taktika`/`zop` mizí jako štítky |
| 25 | `024_pouziti_sily_do_sluzebni_pripravy.sql` | Dvě otázky o použití DP a zbraně přecházejí z Bezpečnostní služby do Služební přípravy |
| 26 | `025_zruseni_bezpecnostni_sluzby.sql` | Ruší předmět Bezpečnostní služba — 34 otázek do Služební přípravy, 2 jinam |
| 27 | `026_smazani_duplicit_a_zruseni_zop.sql` | Maže 13 zdvojených otázek a ruší předmět ZOP — banka klesá na 364 |
| 28 | `027_stitky_souboru_a_editovatelny_obsah.sql` | Štítky souborů (`material_tags`) a editovatelné bloky obsahu (`content_blocks`) |
| 29 | `028_naprava_schematu_class_boards.sql` | Srovnává `class_boards` s aplikací — bez toho se nástěnka tříd neuloží na server |
| 30 | `029_profily_nejsou_verejny_seznam.sql` | ⚠️ **Nespouštět — už proběhla a nic nepřidá.** Měla být bezpečnostní oprava, ale opravovala něco, co nebylo rozbité; navíc u čtení profilů zrušila InitPlan z kroku 20. Podrobně v jejím záhlaví |
| 31 | `030_vratit_initplan_u_cteni_profilu.sql` | Vrací čtení profilů k obalenému tvaru `(select public.is_admin())` z kroku 20 — na viditelnost dat nemá vliv, jen na počet volání funkce |

> Kroky 12 a 13 jsou číselně naopak, protože `012_materials_storage.sql` používá
> `public.get_role()` z kroku 1 a politiky z kroku 12 na sobě nezávisí. Spustíte-li
> 012 před 013, stačí 012 spustit ještě jednou.

## Chyba „infinite recursion detected in policy for relation profiles" (42P17)

Hlásí-li aplikace tohle — v červeném pruhu nahoře nebo u nenačtené nástěnky —
spusť **`017_oprava_rekurze_politik.sql`**. Nic jiného nepomůže: profil se
nenačte, uživatel se tváří jako student a neuloží se vůbec nic.

Příčinou je politika nad `public.profiles`, která sama čte `public.profiles`:

```sql
USING (EXISTS (SELECT 1 FROM public.profiles p
               WHERE p.id = auth.uid() AND p.role = 'admin'))
```

Politika se odkazuje na tabulku, na které je definovaná, takže Postgres skončí
chybou. A protože se PERMISSIVE politiky slučují přes **OR**, stačí jedna taková
— shodí i všechny správné politiky vedle sebe. Typicky vznikne ručním založením
v dashboardu.

`017` je hledá **podle definice, ne podle názvu** (dotazem nad `pg_policies`),
takže najde i politiku pojmenovanou jakkoli. Zároveň převede politiky nad
`quiz_questions` z inline dotazu na `public.is_staff()`, aby úpravy otázek na
stavu politik nad `profiles` vůbec nezávisely.

> ⚠️ **Hledáš-li `fix_admin_rls_recursion.sql`, ten už v repozitáři není.** Řešil
> totéž, ale jen pro politiky se známými názvy, takže tuhle rekurzi minul —
> a navíc přepisoval `admin_delete_user()` a `is_admin()` zpět na verze bez
> pojistek z migrace `015`. Všechno, co dělal, dnes pokrývají `profiles.sql`,
> `admin_user_management.sql`, `user_notifications.sql`, `015` a `017`.

### Proč to nenajde `016`

Diagnostika v `016` běží v SQL Editoru jako role `postgres`, která **RLS
obchází**. Rekurzivní politika se tam vůbec nespustí, takže `016` vypíše
„✅ smí spravovat otázky" i nad úplně rozbitou databází. `016` proto dnes na
rekurzi aspoň upozorní a odkáže na `017`; skutečné ověření dělá krok 5 v `017`,
který se přepne do role `authenticated` a podstrčí `auth.uid()` stejně jako
PostgREST — tedy vidí přesně to, co uvidí aplikace.

**Obecné pravidlo:** cokoli ověřuješ v SQL Editoru jako `postgres`, neověřuješ
z pohledu aplikace. RLS se tam neaplikuje.

## Nejde uložit vůbec nic? Spusť `016_diagnostika_zapisu.sql`

Příznak: otázky, uživatelé ani nástěnka nejdou uložit. Buď to skončí hláškou,
že databáze změnu odmítla, nebo se změna zdánlivě uloží a po obnovení stránky
je pryč.

Příčina je skoro vždy v tom, že **o oprávnění rozhoduje výhradně sloupec
`public.profiles.role`**, ne to, co ukazuje aplikace. Účet uvedený ve
`VITE_ADMIN_EMAILS` vidí správcovské rozhraní i tehdy, když má v databázi roli
`student` — rozhraní je pak funkční jen na pohled a RLS každý zápis zamítne.
Roli správce navíc nelze nastavit z aplikace: politika „Pouze administrátor může
měnit role“ vyžaduje, aby už nějaký správce existoval. Prvního správce v projektu
proto musí založit SQL.

`016_diagnostika_zapisu.sql` nejdřív vypíše, co je špatně, pak to opraví a nakonec
vypíše výsledek. Řeší čtyři příčiny: chybějící roli správce, chybějící řádek
v `profiles`, chybějící sloupec `user_class` (migrace 010) a chybějící roli
`velitel_tridy` v omezení `CHECK` (migrace 011). Je idempotentní a nic nemaže.

Pátou příčinu — rekurzivní politiku (42P17) — `016` jen ohlásí; opravuje ji
`017_oprava_rekurze_politik.sql` (viz výše). Když si nejste jistí, spusťte oba
v pořadí 016 → 017.

> **Po opravě se v aplikaci odhlas a znovu přihlas.** Role se čte při načtení
> profilu, takže stará session ukazuje pořád stará oprávnění.

### Proč se zamítnutý zápis nijak neprojeví

Zamítnutí RLS u `UPDATE` a `DELETE` **není chyba**. Politika jen odfiltruje
řádky, které volající smí měnit, a příkaz korektně změní nula řádků — PostgREST
vrátí HTTP 200 a prázdný výsledek:

```
=> UPDATE public.quiz_questions SET question = 'ZMĚNĚNO' WHERE id = '…';
UPDATE 0        -- žádná chyba, a přitom se nezapsalo nic
```

Klient proto musí každý `UPDATE` a `DELETE` zakončit `.select()` a spočítat
vrácené řádky — jinak ohlásí úspěch i tam, kde se nezapsalo nic. `INSERT`
a `upsert` tuhle past nemají: porušení `WITH CHECK` je u nich skutečná chyba
(SQLSTATE 42501).

## ⚠️ Pořadí při nasazení: nejdřív SQL, potom kód

Aplikace už roli nedoplňuje z localStorage — bere ji výhradně z databáze.

Dřív platilo, že bez sloupce `user_class` selže dotaz na `profiles` i jeho
záložní varianta a **každý uživatel se načte jako `student`**, tedy i lektoři
a správci ztratí přístup ke správě obsahu. `AuthContext` dnes volitelné sloupce
při chybě 42703 postupně ubírá, takže roli přečte i z instalace bez migrace 010.
Pořadí přesto dodržte: `user_class` určuje, kterou nástěnku smí velitel třídy
upravovat, a bez něj ho `can_manage_class()` úmyslně nepustí k žádné.

Proto migrace spusť **před** nasazením nové verze aplikace, nebo hned po něm.
Jediná výjimka jsou e-maily uvedené v `VITE_ADMIN_EMAILS` — těm se role správce
přidělí i bez databáze, takže se přes ně dá případně dostat zpátky dovnitř.

## Na existující instalaci

Pokud už aplikaci provozujete, doplňte jen nové skripty:

```
010_profiles_user_class.sql
011_profiles_role_constraint.sql
013_harden_rls.sql
012_materials_storage.sql
014_drop_leftover_policies.sql
```

Po spuštění `011` lze poprvé skutečně přidělit roli **velitel třídy**. Veliteli
nezapomeňte ve správě uživatelů vyplnit i **třídu** (`user_class`) — politika
`can_manage_class()` ho bez ní nepustí k žádné nástěnce (úmyslně fail-closed).

## Proč je potřeba i `014` (ověřte si to)

`013_harden_rls.sql` shazuje staré politiky podle **přesných názvů**, které očekává
z dřívějších souborů — všechny české. Pokud na vaší instalaci vznikly politiky pod
anglickými názvy (`profiles_select_authenticated`, `Authenticated users can read
feedback`…), v seznamu `DROP` nejsou a **přežijí**.

To není jen nepořádek. PERMISSIVE politiky se v Postgresu slučují přes **OR**,
takže jediná zbylá s `USING (true)` zneplatní všechna utažení, která 013 vytvořilo
vedle ní. Utažení pak vypadá provedené — funkce i nové politiky existují — ale
neúčinkuje.

Zkontrolujte si to tímto dotazem:

```sql
SELECT tablename, cmd, policyname, coalesce(qual, with_check) AS podminka
FROM pg_policies
WHERE schemaname = 'public' AND (qual = 'true' OR with_check = 'true')
ORDER BY tablename, cmd, policyname;
```

Vrátit smí jen `class_boards` a `global_announcements` (čtení pro přihlášené) a
`quiz_questions` (čtení pro všechny přihlášené). Cokoli dalšího — hlavně `profiles` nebo
`user_feedback` — znamená, že 013 neúčinkuje a je potřeba spustit `014`.

## Po utažení politik se změní chování

`013_harden_rls.sql` mění to, kdo co vidí. Očekávané dopady:

- **Zpětnou vazbu** (`user_feedback`) čte, upravuje a maže jen lektor a správce.
  Student vidí jen své vlastní podněty. Nepřihlášený nemůže zapisovat vůbec.
- **Cizí profily** čte jen správce. Ostatní vidí jen svůj vlastní — administrátorská
  konzole je jediné místo v aplikaci, které seznam uživatelů potřebuje.
- **Nástěnky tříd** a **celoškolní hlášení** jsou čitelné jen po přihlášení.
  Velitel třídy smí upravovat výhradně nástěnku své vlastní třídy.

## Co zatím utažené není

Banku otázek čte každý **přihlášený** uživatel celou, včetně sloupce
`correct_index` — politika `quiz_questions_select` má `USING (true)` pro roli
`authenticated`. Ponecháno záměrně, a nejde jen o bundlované otázky: portál
správné odpovědi **sám ukazuje**. V sekci Předměty si každý přihlášený rozklikne
otázku i s vyznačenou správnou odpovědí a vysvětlením — to je smysl studijní
pomůcky. Utáhnout RLS by tedy znamenalo tu sekci zrušit, ne něco utajit.

Z toho plyne, co serverové vyhodnocení testů (migrace 021) řeší a co ne:

- **Řeší:** zapsané skóre odpovídá odeslaným odpovědím. Dřív si `correct_answers`
  i `accuracy` spočítal prohlížeč a poslal je hotové; politika u `INSERT` hlídala
  jedině `auth.uid() = user_id`. Vymyšlené číslo se tak dostalo až do admin
  konzole, která z `quiz_results` počítá XP každého uživatele.
- **Neřeší:** že se uživatel na odpověď předtím podíval. XP proto zůstává měkké
  číslo, ne důkaz o znalostech.

**Nepřihlášený** uživatel naproti tomu nedostane ani řádek: pro roli `anon` na
`quiz_questions` žádná politika není. `App.tsx` proto otázky načítá až po
vyřešení relace (efekt závisí na `authLoading` a `user?.id`), jinak by dotaz
odešel jako anonymní, nevrátil nic a aplikace by zůstala na bundlované sadě až
do dalšího načtení stránky.

Politika se jmenuje `quiz_questions_select` a má `TO authenticated` — to je
podstatné. Bez klauzule `TO` by platila pro `PUBLIC`, tedy i pro roli `anon`, a
banku by si stáhl kdokoli bez přihlášení. `quiz_questions.sql` dřív takovou
politiku zakládal pod názvem „Povolit čtení otázek pro všechny", takže se
repozitář rozcházel s produkcí a čistá instalace vycházela volnější než ostrý
provoz. Srovnáno; starý název skript shazuje.

## Výsledky bez razítka (`quiz_results.overeno`)

Sloupec `overeno` říká, jestli skóre spočítala funkce `vyhodnotit_kviz()`.
Politika `„Vlastní výsledek jen jako neověřený"` klientovi nedovolí zapsat řádek
s `overeno = true`, takže razítko umí dát jedině ta funkce.

Přímý zápis **bez** razítka zůstává povolený schválně: výsledky, které uvízly ve
frontě neodeslaných testů (`localStorage`, klíč `vscr_pending_quiz_results`) ještě
ve starší verzi aplikace, si nepamatují text zvolené odpovědi a serverově se
vyhodnotit nedají. Uloží se tedy bez razítka — zahodit je by znamenalo připravit
uživatele o dokončený test. Do XP v admin konzoli se nezapočítají a u uživatele se
zobrazí jako „+N neověř.".

Až fronty doběhnou, je možné politiku shodit úplně a nechat jedinou cestu přes
`vyhodnotit_kviz()`:

```sql
DROP POLICY "Vlastní výsledek jen jako neověřený" ON public.quiz_results;
```

Kolik neověřených řádků ještě je:

```sql
SELECT overeno, count(*) FROM public.quiz_results GROUP BY overeno;
```

## Proč se posílá text odpovědi, ne její pořadí

`Quiz.tsx` možnosti u každé otázky před zobrazením promíchá
(`shuffleQuestionOptions`), takže index, na který uživatel klikl, s pořadím
v databázi nesouvisí. `vyhodnotit_kviz()` proto porovnává **text** zvolené
odpovědi s `options ->> correct_index`.

Stejný důvod stojí za polem `selectedText` v typu `QuestionAttempt`. Prázdný
řetězec znamená „nevybráno" a vyhodnotí se jako chyba.

Otázka se v bance dohledává primárně podle `id`, a když to není UUID, podle textu
otázky. Druhá cesta je pro testy dokončené offline nad bundlovanou sadou, kde mají
otázky identifikátory typu `pravo-1`. Nedohledaná otázka se počítá jako chybná
a celý řádek vyjde jako neověřený.

## Úklid banky otázek (`022`)

Skript **maže data**. Nejdřív vypíše, co půjde pryč, teprve pak to smaže —
spusťte ho po částech a na výpis se podívejte.

Šlo o 51 řádků z jednoho automatického importu 12. 9. 2026, ve kterých bylo
dohromady jen osm různých otázek. Kopie se lišily hexadecimální příponou na
konci textu (`… nepatří: [0ff143bd] [7cf656d0]`), čímž obešly unikátní index
na sloupci `question` — ten má u importu sloužit jako konfliktní klíč, takže
místo aktualizace řádku pokaždé vznikl nový.

Obsah těch osmi otázek je v `022_zaloha_smazanych_otazek.sql`. Ten skript se
běžně nespouští; je tu proto, že smazání se vrátit nedá.

Druhá část skriptu srovnává předmět u 17 otázek, které byly pod
„Služební příprava“, ale patří jinam (první pomoc, trestní právo,
bezpečnostní služba, administrativa, penologie). Stejná oprava je
i v `src/data/questions/sluzebniPriprava.ts`, takže se synchronizací
výchozích otázek nevrátí zpátky.

### Proč hned potom následuje `023`

Úklid v `022` odstěhoval ze „Služební přípravy“ všech sedmnáct otázek, protože
ani jedna z nich tam obsahem nepatřila. Předmět tím ale zůstal prázdný a
v Předmětech se přestal nabízet — a to je na Akademii VS ČR jeden z hlavních
předmětů.

Jeho skutečný obsah v bance celou dobu byl, jen seděl pod štítky `zbrane` (12)
a `taktika` (17). Že jde o klíče a ne o názvy předmětů, je poznat na první
pohled: jsou malými písmeny bez diakritiky, zatímco všechny ostatní předměty
mají řádné české názvy. Totéž platilo pro `zop` (4).

`023` to srovnává na **Služební příprava 21**, **Zbraně 10** a **ZOP 4**.
Karta Taktika zůstává v `subjectsInfo.ts`, ale bez otázek — její obsah
(donucovací prostředky, pouta, obušek, paralyzér, sebeobrana) je služební
příprava. Prázdné okruhy se v Předmětech skrývají samy.

Pole `topic` se nemění a nese jemnější dělení dál.

Kontrola, jestli odpad nepřibyl znovu:

```sql
SELECT count(*) FROM public.quiz_questions WHERE question ~ '\[[0-9a-fA-F]{8}\]';
```

Kontrola, že se štítky malými písmeny nevrátily:

```sql
SELECT DISTINCT subject FROM public.quiz_questions
WHERE subject IN ('zbrane', 'taktika', 'zop');
```

## Otevřené nálezy v obsahu otázek

Tohle se přeštítkováním spravit nedá — jde o znění otázek, ne o jejich zařazení.

**Rozpor v barvách soudních obálek.** `bs-04` (Bezpečnostní služba) tvrdí, že
zelený pruh má typ I a červený typ II. `sp-33` (Vězeňská administrativa) tvrdí,
že zelený pruh má typ II. Obě nemohou platit zároveň a kdo se učí obojí, naučí
se to opačně. Která je správně, se musí ověřit proti předpisu.

**Dvě otázky na totéž.** `bs-05` a `sp-31` se obě ptají, kdo nese zavazadlo
s hotovostí při přepravě Justiční stráží, a mají stejnou odpověď — jen jinými
slovy. Unikátní index na textu otázky je nezachytí, protože znění se liší.

## Zrušení předmětu Bezpečnostní služba (`025`)

Takový předmět se na Akademii VS ČR nevyučuje. Strážní, dozorčí a eskortní
služba, služba justiční stráže, prohlídky a vstupy do objektů je služební
příprava, a tam těch 34 otázek přechází. Dvě jdou jinam, protože do ní obsahem
nepatří:

- `bs-04` (doručování písemností soudu typu I/II) do **Vězeňské administrativy**,
  kde už týž okruh je (`sp-33`),
- `bs-08` (hmotnostní limit balíčku, § 24 z. 169/1999 Sb.) do **Penologie**,
  kde je k témuž `pen-41`.

Skript porovnává proti předmětu, ne proti vyjmenovaným textům otázek — v bance
je `Bezpečnostní služba` právě těch 36 řádků, takže je pravidlo úplné
a opakované spuštění už nenajde co měnit.

Karta předmětu zůstává v `subjectsInfo.ts`, ale bez otázek se v Předmětech
nenabídne. Parser importních šablon nově posílá `bezpečnostní služba`,
`strážní` i `dozorčí` rovnou do Služební přípravy, aby ji import nezaložil
znovu.

## Smazání duplicit a zrušení ZOP (`026`)

Skript **maže data**. Krok 1 vypíše, co půjde pryč, teprve krok 2 to smaže.
Celé znění mazaných otázek včetně distraktorů je v
`026_zaloha_smazanych_duplicit.txt`.

**Třináct otázek** se ptalo na totéž jako jiná otázka, která v bance zůstala —
ve Zdravovědě byla resuscitace i popáleniny třikrát. Většinu zdvojení způsobilo
to, že sedm otázek o první pomoci bylo napsaných do `sluzebniPriprava.ts` vedle
už existujících `zdr-*`; migrace `022` je přeřadila do Zdravovědy a tím se
dvojice dostaly vedle sebe. Unikátní index na sloupci `question` je nezachytil,
protože znění se lišilo — shodná byla až odpověď.

**Předmět ZOP** se ruší. Základní odborná příprava je celý kurz, ne okruh vedle
Práva a Penologie; jeho čtyři otázky jsou služební příprava.

Výsledek: **377 → 364 otázek**, Služební příprava 60 a je největší.

Záměrně se nemazaly dvojice ptající se na týž pojem z obou stran (`ped-11` ↔
`ped-25`, `pe_20` ↔ `pe_28`, `pe_23` ↔ `pe_29`) — to je legitimní procvičování —
ani dvojice s jiným rozsahem (`pen-12` ≈ `pen-18`, `pen-06` ≈ `pen-33`).

## Štítky souborů a editovatelný obsah (`027`)

Dvě nové tabulky. Obě řeší totéž: co dosud určoval zdrojový kód nebo název
složky ve Storage, má jít změnit z aplikace.

### `material_tags` — soubor patří k předmětům a třídám

Dosud rozhodovala o zařazení souboru složka v bucketu `studijni-materialy`
(`pravo/`, `penologie/`, …), takže soubor patřil právě k jednomu předmětu
a ke třídě vůbec. Štítky to obracejí: cesta ve Storage je jen adresa, zařazení
nese řádek v téhle tabulce a štítků může být víc najednou. Jde je nastavit při
nahrávání i kdykoli potom.

Klíčem je celá cesta v bucketu, protože přesně tou se soubor stahuje i maže.
Nové soubory se nahrávají do `materialy/`; starší složky se čtou dál a soubor
bez štítků se zobrazí podle své složky, takže se nic neztratí a nic se nemusí
přesouvat.

`class_ids` **nemá cizí klíč** na `class_boards`. Nástěnky tříd fungují i bez
serveru (výchozí sada v `localStorage`), takže třída, na kterou štítek ukazuje,
nemusí mít v databázi řádek — cizí klíč by v takovém případě označení
znemožnil. Osiřelý odkaz nevadí, aplikace zobrazuje jen štítky existujících
tříd.

### `content_blocks` — překryv nad daty z repozitáře

Předměty (`subjectsInfo.ts`), poznávačky (`questionsData.ts`) a modelové
situace (`scenariosData.ts`) zůstávají v repozitáři. Tabulka je nepřepisuje,
leží nad nimi jako překryv:

| Řádek | Účinek |
|---|---|
| `id` shodné s výchozí položkou | nahradí její obsah |
| `id`, které ve výchozích datech není | přidá položku navíc |
| `is_deleted = true` | schová výchozí položku (lektor ji může vrátit) |
| `is_hidden = true` | schová položku studentům, lektor ji vidí dál |

Výchozí data tím zůstávají nedotčená a smazáním řádku překryvu se aplikace
vrátí k tomu, co je v repozitáři. `payload` je `JSONB`, protože každý druh
obsahu má jiný tvar; kontroluje ho aplikace při zápisu i při čtení
(`src/utils/contentLibrary.ts`). Sloupec `kind` má omezení `CHECK` na výčet
`subject`, `matching_category`, `scenario` — nový druh obsahu znamená novou
migraci, která výčet rozšíří.

## Náprava schématu nástěnky tříd (`028`)

**Spusť na každé instalaci, která vznikla dřív než `class_boards.sql`.** Tabulka
`public.class_boards` v takovém projektu pochází ze starší verze aplikace a od
té doby se s ní rozešla:

| Sloupec v databázi | Co posílá aplikace |
|---|---|
| `announcements` | `info_text` |
| `schedule_image_url` | `schedule_url` |
| chybí | `schedule_storage_path` |
| chybí | `course_start_date`, `course_end_date` |
| chybí | `updated_by` |
| `id UUID` | `id TEXT` (`class-1758…-x7a2`) |

Důsledek je nenápadný, ale úplný: **každé uložení nástěnky skončilo chybou**
(`column "info_text" does not exist`, u id `invalid input syntax for type uuid`).
Aplikace na to upozorní pruhem „změna je zatím jen v tomto zařízení", takže to
nevypadá jako porucha — jenže rozvrh, ústrojová kázeň ani služby se nikdy
nedostaly na server a ostatní je neviděli. Čtení dopadalo stejně: i kdyby
v tabulce řádky byly, přišly by bez textu hlášení a bez rozvrhu.

Migrace sloupce **přejmenuje** (obsah zůstává), chybějící doplní a převede `id`
na `TEXT`. Nemaže nic kromě `linked_materials` — a ten jen tehdy, když je
prokazatelně prázdný; s obsahem ho ponechá a upozorní v logu. RLS politiky se
nemění, jsou v pořádku z migrací `013` a `019`.

Na konci skript zkusí vložit a hned smazat jeden řádek. Projde-li to bez chyby,
tvar tabulky sedí. Že zápis projde i z aplikace, ukáže až uložení třídy
přihlášeným lektorem — v SQL Editoru běží vše jako `postgres`, na kterého se RLS
nevztahuje.

### Sloupec `linked_materials` mizí

Ručně vkládané odkazy na materiály nahradily štítky souborů z migrace `027`:
soubor se ke třídě přiřadí ve správci souborů a na nástěnce se objeví sám.
Odpovídající blok „Odkazy vložené ručně" je z nástěnky pryč.

### Třída `ZOP A11` v profilech

Samostatný nález, který migrace **neřeší** — je to data, ne schéma. Aplikace
dosazovala `ZOP A11` jako výchozí třídu na čtyřech místech (registrace,
zakládání profilu, načtení profilu, uložení jména), takže se zapsala i účtům,
které si třídu nikdy nevybraly. Kód už ji nedosazuje nikde; hodnoty, které
v databázi zůstaly, smaže tenhle dotaz — po něm si každý zvolí třídu sám:

```sql
-- Zvaž, komu třídu opravdu chceš nechat. Tohle ji smaže všem najednou:
UPDATE public.profiles SET user_class = NULL WHERE user_class = 'ZOP A11';
```
