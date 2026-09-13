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
| 15 | `avatars_storage.sql` | Bucket `avatars` |
| 16 | `set_admin_miichalpapi.sql` | Prvotní nastavení správce — **uprav si e-mail** |

> Kroky 13 a 14 jsou číselně naopak, protože `012_materials_storage.sql` používá
> `public.get_role()` z kroku 1 a politiky z kroku 13 na sobě nezávisí. Spustíte-li
> 012 před 013, stačí 012 spustit ještě jednou.

## ⚠️ Pořadí při nasazení: nejdřív SQL, potom kód

Aplikace už roli nedoplňuje z localStorage — bere ji výhradně z databáze. Dokud
sloupec `user_class` neexistuje, selže dotaz na `profiles` i jeho záložní varianta
a **každý uživatel se načte jako `student`**, tedy i lektoři a správci ztratí
přístup ke správě obsahu.

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
```

Po spuštění `011` lze poprvé skutečně přidělit roli **velitel třídy**. Veliteli
nezapomeňte ve správě uživatelů vyplnit i **třídu** (`user_class`) — politika
`can_manage_class()` ho bez ní nepustí k žádné nástěnce (úmyslně fail-closed).

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
