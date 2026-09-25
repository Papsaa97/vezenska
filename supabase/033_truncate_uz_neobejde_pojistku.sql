-- ============================================================================
-- 033  TRUNCATE už neobejde ochranu posledního správce ani RLS
-- ============================================================================
--
-- NÁLEZ (DEEP_AUDIT_2026-09.md, §7 bod 11)
-- Řádkové triggery (FOR EACH ROW) se na TRUNCATE nespouštějí, RLS se na něj
-- nevztahuje a na `profiles` nemíří žádný cizí klíč, který by ho zastavil.
-- Privilegium TRUNCATE přitom drží nad všemi devíti tabulkami ve schématu
-- `public` role `anon` i `authenticated` — výchozí `GRANT ALL` Supabase,
-- který žádný skript v repozitáři neodebírá.
--
-- Ověřeno na produkci 18. 9. 2026 (v transakci, ukončeno ROLLBACK):
-- `TRUNCATE TABLE public.profiles` pod JWT studenta prošel. Pojistka
-- `chranit_posledniho_spravce` z migrace 020 se neprobudila — je to trigger
-- `BEFORE UPDATE OF role OR DELETE FOR EACH ROW` a TRUNCATE žádný řádek
-- nezpracovává, takže řádkový trigger nikdy nespustí. Přes PostgREST TRUNCATE
-- dnes nejde (nevystavuje ho a žádná funkce v `public` ho nevolá), stačí ale
-- přímé SQL spojení, volba „Truncate" ve Studiu, hromadné čištění skriptem
-- nebo budoucí RPC funkce.
--
-- ŘEŠENÍ
-- 1. REVOKE TRUNCATE nad všemi tabulkami `public` rolím `anon`, `authenticated`
--    a `service_role` — aplikace za běhu netruncatuje nic pod žádnou z nich
--    (service_role klíč kód nikde nepoužívá, viz `api/`, `scripts/`), takže
--    odebrání nic nerozbije.
-- 2. Statement-level `BEFORE TRUNCATE` trigger nad `profiles`, který příkaz
--    vždy odmítne. Kryje případ, kdy TRUNCATE spustí role, na kterou REVOKE
--    nemíří — `postgres` v SQL Editoru, budoucí servisní role, nebo
--    znovu-GRANT při obnově ze zálohy — přesně jako u UPDATE/DELETE v 020.
--
-- Spouštět po: 020_ochrana_posledniho_spravce.sql. Skript je idempotentní.
-- ============================================================================

-- ─── 1. REVOKE TRUNCATE ────────────────────────────────────────────────────────
--
-- ALL TABLES IN SCHEMA public pokrývá tabulky existující v době spuštění —
-- ne ty, které vzniknou POTOM touhle migrací dál. Nová tabulka zdědí výchozí
-- GRANT ALL, dokud jí pozdější migrace TRUNCATE výslovně neodebere.

REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated, service_role;

-- ─── 2. Trigger nad profiles ───────────────────────────────────────────────────
--
-- TRUNCATE nemá řádky, takže trigger nemůže být FOR EACH ROW ani číst
-- OLD/NEW — jen FOR EACH STATEMENT. Podmínka není potřeba: na rozdíl od
-- UPDATE/DELETE role, kde smí projít cokoli kromě odebrání poslednímu
-- správci, tady žádný legitimní důvod TRUNCATE za provozu není, takže funkce
-- zamítá vždy. SECURITY DEFINER ani search_path nejsou potřeba — funkce
-- nečte žádnou tabulku, jen odmítá.

CREATE OR REPLACE FUNCTION public.zakazat_truncate_profiles()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE EXCEPTION
    'TRUNCATE nad public.profiles je zakázán. Obešel by ochranu poslednímu '
    'správci z migrace 020 — smaže všechny řádky bez ohledu na roli. Je-li '
    'TRUNCATE opravdu potřeba (obnova ze zálohy, úplný reset), trigger '
    'dočasně vypněte — viz Nouzový východ v hlavičce této migrace.'
    USING ERRCODE = '42501';
END;
$function$;

DROP TRIGGER IF EXISTS zakazat_truncate_profiles ON public.profiles;
CREATE TRIGGER zakazat_truncate_profiles
  BEFORE TRUNCATE ON public.profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.zakazat_truncate_profiles();

-- ─── 3. Ověření ────────────────────────────────────────────────────────────────
--
-- (a) Privilegium je pryč:
--
--   SELECT grantee, table_name FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND privilege_type = 'TRUNCATE'
--     AND grantee IN ('anon', 'authenticated', 'service_role');
--   -- musí vrátit 0 řádků
--
-- (b) Trigger existuje vedle pojistky z 020:
--
--   SELECT tgname, pg_get_triggerdef(oid) FROM pg_trigger
--   WHERE tgrelid = 'public.profiles'::regclass AND NOT tgisinternal;
--
-- (c) Zkouška pod rolí, na kterou míří REVOKE — musí padnout dřív, než se
--     vůbec stihne zeptat triggeru:
--
--     SET LOCAL ROLE authenticated;
--     TRUNCATE TABLE public.profiles;
--     -- 42501 „permission denied for table profiles"
--     RESET ROLE;
--
-- (d) Zkouška triggeru pod rolí postgres, kterou REVOKE nezasahuje (ROLLBACK
--     stačí, protože trigger TRUNCATE zastaví ještě před zápisem):
--
--     BEGIN;
--     TRUNCATE TABLE public.profiles;
--     -- 42501 z RAISE EXCEPTION výše, ne z GRANT systému
--     ROLLBACK;
--
-- ─── Nouzový východ ─────────────────────────────────────────────────────────────
--
-- Skutečný důvod TRUNCATE nad profiles (obnova ze zálohy, úplný reset dat) i tak
-- vyžaduje roli postgres — tu REVOKE nezasahuje. Trigger ale platí i pro ni,
-- takže se dočasně vypne a zase zapne:
--
--     ALTER TABLE public.profiles DISABLE TRIGGER zakazat_truncate_profiles;
--     -- … TRUNCATE nebo obnova ze zálohy …
--     ALTER TABLE public.profiles ENABLE  TRIGGER zakazat_truncate_profiles;
--
-- REVOKE u anon/authenticated/service_role zpátky nevrací nic — je to trvalé
-- rozhodnutí, ne dočasná pojistka. Potřebuje-li ho některá z nich znovu,
-- napište explicitní GRANT do nové migrace a zdůvodněte proč.
