-- Schéma tabulky public.user_notifications pro zprávy zasílané správcem uživatelům
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)
--
-- Každý řádek je jedna zpráva doručená jednomu konkrétnímu uživateli.
-- Hromadná zpráva "všem" se ukládá jako více řádků (jeden na příjemce),
-- aby si každý uživatel mohl nezávisle spravovat vlastní stav přečtení.

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexy pro rychlé načtení schránky uživatele a odznaku nepřečtených zpráv
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON public.user_notifications(user_id) WHERE is_read = false;

-- 1. Zapnutí Row Level Security (RLS)
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- 2. Čtení: uživatel vidí pouze své vlastní zprávy, správce vidí všechny (audit odeslaných zpráv)
--    Poznámka: admin check jde přes public.is_admin() (SECURITY DEFINER), NIKDY přes
--    inline "EXISTS (SELECT ... FROM public.profiles ...)" – to by na profiles
--    způsobilo "infinite recursion detected in policy for relation profiles",
--    viz komentář v profiles.sql u definice is_admin().
DROP POLICY IF EXISTS "Uživatel čte vlastní zprávy, správce všechny" ON public.user_notifications;
CREATE POLICY "Uživatel čte vlastní zprávy, správce všechny"
  ON public.user_notifications
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- 3. Vkládání: pouze správce smí zakládat nové zprávy (jednotlivé i hromadné)
DROP POLICY IF EXISTS "Pouze správce může odesílat zprávy" ON public.user_notifications;
CREATE POLICY "Pouze správce může odesílat zprávy"
  ON public.user_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 4. Úprava: uživatel smí označit pouze svou vlastní zprávu jako přečtenou
DROP POLICY IF EXISTS "Uživatel označuje vlastní zprávy jako přečtené" ON public.user_notifications;
CREATE POLICY "Uživatel označuje vlastní zprávy jako přečtené"
  ON public.user_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Ochrana obsahu zprávy: příjemce smí přepnout pouze is_read, ostatní pole zůstávají neměnná
CREATE OR REPLACE FUNCTION public.protect_notification_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.title := OLD.title;
  NEW.body := OLD.body;
  NEW.user_id := OLD.user_id;
  NEW.sender_id := OLD.sender_id;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_notification_fields ON public.user_notifications;
CREATE TRIGGER trg_protect_notification_fields
  BEFORE UPDATE ON public.user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_notification_fields();

-- 6. Mazání: pouze správce (úklid odeslaných zpráv)
DROP POLICY IF EXISTS "Pouze správce může mazat zprávy" ON public.user_notifications;
CREATE POLICY "Pouze správce může mazat zprávy"
  ON public.user_notifications
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
