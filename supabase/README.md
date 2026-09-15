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
