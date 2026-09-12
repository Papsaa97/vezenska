-- Rozšíření tabulky public.profiles o sloupec avatar_url
-- Spusťte tento skript v Supabase SQL Editoru (Dashboard -> SQL Editor)
--
-- avatar_url může obsahovat buď:
--   1. veřejnou URL nahranou uživatelem do Storage bucketu "avatars", nebo
--   2. interní identifikátor předdefinované ikony ve formátu "preset:<klíč>"
--      (vykreslován čistě na klientovi, bez síťového požadavku).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Poznámka: politika pro UPDATE ("Povolit úpravu vlastního jména bez změny role")
-- definovaná v profiles.sql již povoluje uživateli upravit libovolné sloupce
-- vlastního řádku (mimo roli), takže žádná další RLS politika není potřeba.
