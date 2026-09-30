-- ============================================================================
-- 049  Zásobník CZ 75 B podle příručky akademie (1 otázka)
-- ============================================================================
--
-- CO BYLO ŠPATNĚ
-- Otázka na kapacitu zásobníku CZ 75 B (bs-37) uváděla 16 nábojů a palebný
-- průměr 32, ale příručka akademie, na kterou odkazuje (Speciální příprava –
-- střelecká teorie), uvádí 15 nábojů a plný palebný průměr 30 nábojů.
-- Uživatel rozhodl (2026-09-30), že aplikace se řídí příručkou, aby nebyl
-- rozpor mezi otázkami, Poznávačkou a záložkou Zbraně. Stejná změna je
-- v src/data/questions/bezpecnostniSluzba.ts.
--
-- CO TENHLE SKRIPT DĚLÁ
-- Přepíše možnosti a vysvětlení jen tam, kde je otázka pořád ve znění
-- z migrace 048 (první možnost „16 nábojů, …“). Otázku upravenou lektorem
-- nepřepíše. Idempotentní: druhé spuštění nic nezmění.
-- ============================================================================

BEGIN;

UPDATE public.quiz_questions
   SET options       = to_jsonb(ARRAY['15 nábojů, plný palebný průměr 30 nábojů', '12 nábojů, palebný průměr 24 nábojů', '20 nábojů, plný palebný průměr 60 nábojů ve 3 zásobnících', '10 nábojů, plný palebný průměr 20 nábojů']),
       correct_index = 0,
       explanation   = 'Pistole CZ 75 B ráže 9 mm Luger má dvouřadý zásobník na 15 nábojů; plný palebný průměr jsou 2 zásobníky po 15 nábojích, tedy 30 nábojů. (Právní úprava: Učební text Speciální příprava – střelecká teorie, s. 3–8)'
 WHERE question = 'Jaká je kapacita zásobníku pistole CZ 75 B a její plný palebný průměr?'
   AND options->>0 = '16 nábojů, plný palebný průměr 32 nábojů';

COMMIT;

-- Kontrola: má vrátit jeden řádek s první možností „15 nábojů, …“.
SELECT question, options->>0 AS spravna, correct_index
  FROM public.quiz_questions
 WHERE question = 'Jaká je kapacita zásobníku pistole CZ 75 B a její plný palebný průměr?';
