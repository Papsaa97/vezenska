-- ============================================================================
-- 037  Zprávy od správce: produkční tabulka má jiné sloupce než aplikace
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- Tabulka public.user_notifications vznikla na produkci ze starší podoby
-- skriptu se sloupci `sender_name` a `message`. Dnešní user_notifications.sql
-- ji zakládá se sloupci `sender_id` a `body`, jenže přes CREATE TABLE IF NOT
-- EXISTS — nad existující tabulkou tedy neudělal nic a rozdíl zůstal.
--
-- Aplikace přitom čte i zapisuje `sender_id` a `body`:
--   - NotificationBell.tsx:35 — SELECT id, user_id, sender_id, title, body, …
--   - UserManager.tsx:277     — INSERT { user_id, sender_id, title, body }
--
-- Důsledek, ověřený v logu API 25. 9. 2026: každé načtení zvonku skončí
-- chybou 400 (PostgREST 42703, „column … sender_id does not exist“), a to
-- u každého přihlášeného uživatele při každém otevření aplikace. Správce
-- nemůže poslat žádnou zprávu — tabulka je proto prázdná. Trigger
-- protect_notification_fields() navíc přiřazuje do NEW.body a NEW.sender_id,
-- takže by selhalo i označení zprávy jako přečtené.
--
-- CO TENHLE SKRIPT DĚLÁ
-- 1. Přejmenuje `message` na `body` (jen když `body` ještě neexistuje).
-- 2. Doplní `sender_id` s cizím klíčem na auth.users a indexem.
-- 3. Srovná NOT NULL a výchozí hodnoty s user_notifications.sql — jen tam,
--    kde to data dovolí, takže na tabulce s obsahem skript nespadne.
-- `sender_name` zůstává: aplikace ho nečte ani nezapisuje, výchozí hodnota
-- „Správce systému“ ho vyplní sama a smazat sloupec by bylo zbytečně
-- nevratné.
--
-- Idempotentní — opakované spuštění nic nezmění.
-- ============================================================================

BEGIN;

-- 1. message → body
DO $$
BEGIN
  IF EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'user_notifications' AND column_name = 'message'
     )
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'user_notifications' AND column_name = 'body'
     )
  THEN
    ALTER TABLE public.user_notifications RENAME COLUMN message TO body;
  END IF;
END $$;

ALTER TABLE public.user_notifications ADD COLUMN IF NOT EXISTS body TEXT;

-- 2. sender_id
ALTER TABLE public.user_notifications
  ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_notifications_sender_id
  ON public.user_notifications(sender_id);

-- 3. NOT NULL a výchozí hodnoty podle user_notifications.sql
ALTER TABLE public.user_notifications ALTER COLUMN is_read SET DEFAULT false;
ALTER TABLE public.user_notifications ALTER COLUMN created_at SET DEFAULT now();

UPDATE public.user_notifications SET is_read = false WHERE is_read IS NULL;
UPDATE public.user_notifications SET created_at = now() WHERE created_at IS NULL;
UPDATE public.user_notifications SET body = '' WHERE body IS NULL;

ALTER TABLE public.user_notifications ALTER COLUMN is_read SET NOT NULL;
ALTER TABLE public.user_notifications ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.user_notifications ALTER COLUMN body SET NOT NULL;

-- Zpráva bez příjemce nemá komu patřit a politika čtení ji nikomu neukáže.
-- NOT NULL se nastaví jen tehdy, když taková zpráva neexistuje; jinak je
-- potřeba ji nejdřív ručně prohlédnout.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_notifications WHERE user_id IS NULL) THEN
    ALTER TABLE public.user_notifications ALTER COLUMN user_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'user_notifications má zprávy bez příjemce — user_id zůstává NULLABLE';
  END IF;
END $$;

COMMIT;

-- PostgREST si nové sloupce načte hned, ne až při dalším obnovení cache.
NOTIFY pgrst, 'reload schema';

-- ─── Kontrola ───────────────────────────────────────────────────────────────
-- Musí vrátit body, sender_id (a sender_name, který zůstává):
--
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'user_notifications'
--   ORDER BY ordinal_position;
