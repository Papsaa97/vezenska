-- ═════════════════════════════════════════════════════════════════════════════
-- 015 — Oprava strážní podmínky v admin_delete_user a omezení práv funkcí
--
-- NÁLEZ: funkci public.admin_delete_user(uuid) mohl zavolat kdokoliv, i bez
-- přihlášení, a smazat libovolný uživatelský účet.
--
-- Řetězec, který k tomu vedl:
--   1. get_role(NULL) nevrátí žádný řádek → NULL
--   2. is_admin() počítá `get_role(auth.uid()) = 'admin'` → NULL = 'admin' → NULL
--   3. v plpgsql je `IF NOT NULL THEN` výraz NULL, což se chová jako nepravda,
--      takže se strážní RAISE EXCEPTION přeskočil
--   4. `IF target_user_id = auth.uid()` je pro NULL také NULL → taky přeskočeno
--   5. DELETE FROM auth.users WHERE id = target_user_id se provedl
--
-- Funkce je SECURITY DEFINER s vlastníkem postgres, takže mazala bez ohledu na
-- práva volajícího, a role anon na ni měla EXECUTE — tedy dosažitelné přes
-- veřejné /rest/v1/rpc/admin_delete_user s anon klíčem, který je součástí
-- frontendu.
--
-- V RLS politikách stejná NULL hodnota problém nedělala: NULL i false tam
-- shodně znamenají zákaz. Proto se to neprojevilo nikde jinde.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 1. Pomocné funkce rolí nesmí vracet NULL ────────────────────────────────
--
-- Oprava u zdroje. Pro RLS se nic nemění (NULL i false = zákaz), ale volání
-- z plpgsql se tím stává bezpečným.

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(public.get_role(auth.uid()) = 'admin', false);
$function$;

CREATE OR REPLACE FUNCTION public.is_staff()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(public.get_role(auth.uid()) IN ('lektor', 'admin'), false);
$function$;

CREATE OR REPLACE FUNCTION public.can_manage_class(target_class text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    public.is_staff()
    OR (
      public.get_role(auth.uid()) = 'velitel_tridy'
      AND public.my_class() IS NOT NULL
      AND lower(trim(target_class)) = lower(trim(public.my_class()))
    ),
    false
  );
$function$;

-- ─── 2. admin_delete_user musí selhat do zavřena ─────────────────────────────
--
-- COALESCE výše by stačil, ale strážní podmínka se nesmí spoléhat na to, že
-- jiná funkce nikdy nevrátí NULL. Explicitní kontroly jsou druhá pojistka.

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Mazat uživatelské účty může jen přihlášený správce.' USING ERRCODE = '42501';
  END IF;

  IF COALESCE(public.is_admin(), false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Pouze správce může mazat uživatelské účty.' USING ERRCODE = '42501';
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Nebyl zadán účet ke smazání.' USING ERRCODE = '22004';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Nelze smazat vlastní uživatelský účet.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$function$;

-- ─── 3. protect_notification_fields — pevný search_path ──────────────────────
--
-- Řeší lint 0011_function_search_path_mutable. Funkce nesahá na žádný objekt
-- podle jména, takže prázdný search_path je bezpečný i nejpřísnější.

CREATE OR REPLACE FUNCTION public.protect_notification_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.title := OLD.title;
  NEW.body := OLD.body;
  NEW.user_id := OLD.user_id;
  NEW.sender_id := OLD.sender_id;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$function$;

-- ─── 4. Odebrat právo volání nepřihlášeným ───────────────────────────────────
--
-- Všechny politiky, které tyhle funkce používají, platí pro roli
-- {authenticated} (ověřeno dotazem na pg_policies), takže anon je nepotřebuje
-- a přes /rest/v1/rpc/… nemá co volat. Právo pro authenticated ZŮSTÁVÁ —
-- bez něj by RLS politiky skončily chybou „permission denied for function".

REVOKE EXECUTE ON FUNCTION public.admin_delete_user(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_role(uuid)          FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin()              FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff()              FROM anon;
REVOKE EXECUTE ON FUNCTION public.my_class()              FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_class(text)  FROM anon;

-- ─── Co se ZÁMĚRNĚ nemění ────────────────────────────────────────────────────
--
-- handle_new_user() a rls_auto_enable() zůstávají beze změny, přestože je
-- linter hlásí taky. Obě vracejí typ trigger / event_trigger a Postgres je
-- odmítne zavolat přímo:
--
--   ERROR: trigger functions can only be called as triggers
--
-- (ověřeno na ostré databázi). Nemají tedy využitelnou cestu přes REST API
-- a sahat jim na práva by jen zbytečně riskovalo trigger, který při registraci
-- zakládá profil uživatele.
--
-- Zbývající hlášení linteru „Signed-In Users Can Execute SECURITY DEFINER
-- Function" je očekávané: is_admin(), is_staff(), my_class(), get_role()
-- a can_manage_class() musí být pro authenticated volatelné, protože je
-- používají RLS politiky, a admin_delete_user() volá administrátorská konzole.
-- Po opravě výše už strážní podmínka drží.
