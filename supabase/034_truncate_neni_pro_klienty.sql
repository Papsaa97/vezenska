-- ============================================================================
-- 034  TRUNCATE není pro klienty
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- Role `anon` i `authenticated` měly nad všemi tabulkami ve schématu `public`
-- právo TRUNCATE. To není obyčejné mazání:
--
--   * RLS se na TRUNCATE nevztahuje — politiky nad profiles, class_boards ani
--     quiz_results by z něj nesmazaly ani řádek méně;
--   * trigger `chranit_posledniho_spravce` z migrace 020 je BEFORE DELETE OR
--     UPDATE OF role, tedy pro TRUNCATE se nespustí a poslední správce zmizí
--     s ostatními.
--
-- Přes PostgREST dnes TRUNCATE poslat nejde — REST API zná jen SELECT, INSERT,
-- UPDATE, DELETE a volání funkcí. Nález je proto LATENTNÍ: zaplatí se až tím,
-- že někdo doplní vlastní API vrstvu, edge funkci nebo že unikne přímé
-- připojení s anon rolí. Odebrat právo, které není k čemu, je levnější než
-- doufat, že se ta chvíle nepřihodí.
--
-- CO TENHLE SKRIPT DĚLÁ
--   1. Odebírá TRUNCATE oběma klientským rolím nad vším, co ve `public` stojí.
--   2. Nad `profiles` staví druhou pojistku: BEFORE TRUNCATE trigger, který
--      příkaz zamítne bez ohledu na to, kdo ho pošle — tedy i pro roli
--      `postgres` v SQL Editoru.
--
-- POZOR PŘI ÚMYSLNÉM MAZÁNÍ
-- Potřebujete-li `profiles` opravdu vyprázdnit (obnova ze zálohy, přesun
-- projektu), trigger nejdřív vypněte a pak vraťte:
--
--   ALTER TABLE public.profiles DISABLE TRIGGER zakazat_truncate_profiles;
--   TRUNCATE public.profiles CASCADE;
--   ALTER TABLE public.profiles ENABLE  TRIGGER zakazat_truncate_profiles;
--
-- CO TENHLE SKRIPT NEDĚLÁ
-- Nesahá na výchozí práva pro tabulky, které teprve vzniknou (ALTER DEFAULT
-- PRIVILEGES). Supabase si je spravuje sám a měnit mu je znamená koledovat si
-- o to, že příští tabulka bude mít jiná práva než všechny ostatní. Vznikne-li
-- nová tabulka, spusťte tenhle skript znovu — je idempotentní.
--
-- Spouštět po: 020_ochrana_posledniho_spravce.sql.
-- ============================================================================

-- ─── 1. Odebrat právo oběma klientským rolím ─────────────────────────────────

REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM authenticated;

-- ─── 2. Pojistka nad profiles ────────────────────────────────────────────────
--
-- Stejný důvod jako u triggeru z 020: strážní podmínka se nesmí spoléhat na
-- to, že někdo jiný (tady GRANT) drží slovo.

CREATE OR REPLACE FUNCTION public.zakazat_truncate_profiles()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION
    'TRUNCATE nad public.profiles je zakázaný — smazal by i posledního správce, '
    'kterého chrání trigger chranit_posledniho_spravce (migrace 020). '
    'Je-li to úmysl, trigger zakazat_truncate_profiles nejdřív vypněte.'
    USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS zakazat_truncate_profiles ON public.profiles;
CREATE TRIGGER zakazat_truncate_profiles
  BEFORE TRUNCATE ON public.profiles
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.zakazat_truncate_profiles();

-- ─── 3. Ověření ──────────────────────────────────────────────────────────────
--
-- (a) Žádná tabulka ve `public` nesmí klientským rolím TRUNCATE dávat.
--     Dotaz musí vrátit prázdno:
--
--   SELECT c.relname, r.rolname
--   FROM pg_class c
--   CROSS JOIN (VALUES ('anon'), ('authenticated')) AS r(rolname)
--   WHERE c.relnamespace = 'public'::regnamespace AND c.relkind = 'r'
--     AND has_table_privilege(r.rolname, c.oid, 'TRUNCATE');
--
-- (b) Trigger drží i pro postgres (uvnitř transakce, vždy ROLLBACK):
--
--   BEGIN;
--   TRUNCATE public.profiles;   -- musí skončit 42501
--   ROLLBACK;
