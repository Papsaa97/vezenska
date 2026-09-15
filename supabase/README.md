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
| 1 | `profiles.sql` | Tabulka `profiles`, funkce `get_role()` / `is_admin()`, trigger na registraci |
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
| 12 | `fix_admin_rls_recursion.sql` | Oprava rekurze v politikách (starší instalace) |
| 13 | `013_harden_rls.sql` | **Utažení politik**, které byly `USING (true)`; funkce `is_staff()`, `my_class()`, `can_manage_class()` |
| 14 | `012_materials_storage.sql` | Bucket `studijni-materialy` (potřebuje funkce z kroku 13) |
| 15 | `014_drop_leftover_policies.sql` | **Shodí zbylé povolující politiky**, které rušily účinek kroku 13 |
| 16 | `avatars_storage.sql` | Bucket `avatars` |
| 17 | `set_admin_miichalpapi.sql` | Prvotní nastavení správce — **uprav si e-mail** |
| 18 | `016_diagnostika_zapisu.sql` | Diagnostika a oprava, když nejde nic uložit — **uprav si e-mail** |

> Kroky 13 a 14 jsou číselně naopak, protože `012_materials_storage.sql` používá
> `public.get_role()` z kroku 1 a politiky z kroku 13 na sobě nezávisí. Spustíte-li
> 012 před 013, stačí 012 spustit ještě jednou.

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
`quiz_questions` (záměrně veřejné). Cokoli dalšího — hlavně `profiles` nebo
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

`quiz_questions` má SELECT `USING (true)` i pro nepřihlášené. Je to záměrně
ponecháno: `App.tsx` načítá otázky ještě před dokončením přihlášení a všech 377
výchozích otázek je tak jako tak součástí veřejného klientského bundlu.
