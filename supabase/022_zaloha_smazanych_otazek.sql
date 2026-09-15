-- ═════════════════════════════════════════════════════════════════════════════
-- 022 — Záloha otázek smazaných skriptem 022_uklid_banky_otazek.sql
--
-- TENTO SKRIPT SE BĚŽNĚ NESPOUŠTÍ. Je tu proto, že smazání se vrátit nedá,
-- a kdyby se ukázalo, že některou z těch osmi otázek přece jen chcete, vrátí
-- ji zpět jedním příkazem.
--
-- CO TU JE
--   Osm otázek, které úklid odstranil. V bance jich bylo 51 řádků: vznikly
--   12. 9. 2026 během čtyř sekund jednoho automatického importu a lišily se
--   pouze hexadecimální příponou přilepenou na konec textu otázky, například
--   „Mezi donucovací prostředky nepatří: [0ff143bd] [7cf656d0]".
--
--   Kopie se tu nezachovávají — nemá to smysl, byly znak po znaku shodné až
--   na tu příponu. Ukládá se obsah, tedy osm různých otázek. UUID a časy
--   vzniku smazaných řádků se také nezachovávají: po smazání ztrácejí smysl
--   a otázka by při obnovení stejně dostala nové id.
--
-- PROČ BYLY SMAZANÉ
--   Nejsou v udržované sadě v src/data/questions/ a nesedí do ní ani formou.
--   Zbytek banky jsou rozvité otázky s odkazem na konkrétní ustanovení;
--   tyhle mají odpovědi typu „9 mm Luger" nebo „Modrošedá". První z nich má
--   navíc chybu v zadání („Jaký je ráže" místo „Jaká je ráže").
--
--   Chcete-li některou vrátit natrvalo, nestačí ji vložit sem do banky —
--   patří do repozitáře, do příslušného souboru v src/data/questions/,
--   jinak ji příští „Přepsat banku novou revizí" zase smaže.
-- ═════════════════════════════════════════════════════════════════════════════

INSERT INTO public.quiz_questions (subject, question, options, correct_index, explanation) VALUES
  ('Právo',
   'Jaký zákon upravuje Vězeňskou službu ČR?',
   '["Zákon č. 555/1992 Sb.", "Zákon č. 40/2009 Sb.", "Zákon č. 273/2008 Sb.", "Zákon č. 141/1961 Sb."]'::jsonb,
   0,
   'Zákon č. 555/1992 Sb., o Vězeňské službě a justiční stráži České republiky, je základním právním předpisem pro VS ČR.'),

  ('Právo',
   'Kdo jmenuje a odvolává generálního ředitele Vězeňské služby?',
   '["Prezident republiky", "Vláda ČR", "Ministr spravedlnosti", "Poslanecká sněmovna"]'::jsonb,
   2,
   'Generálního ředitele Vězeňské služby jmenuje a odvolává ministr spravedlnosti.'),

  ('Zbraně',
   'Jaký je ráže pistole CZ 75 B, kterou používá VS ČR?',
   '["7.65 mm Browning", "9 mm Luger", ".45 ACP", "5.56 mm NATO"]'::jsonb,
   1,
   'Standardní služební pistole CZ 75 B využívá náboj 9 mm Luger.'),

  ('Zbraně',
   'Která z těchto částí NENÍ součástí samopalu vz. 61 Škorpion?',
   '["Závorník", "Předpažbí", "Napínací táhlo", "Plynový násadec"]'::jsonb,
   3,
   'Škorpion vz. 61 nepracuje na principu odběru plynů z hlavně (nemá plynový násadec), ale využívá energii zpětného rázu.'),

  ('Taktika',
   'Co znamená zkratka DP v kontextu donucovacích prostředků?',
   '["Dozorčí pracovník", "Donucovací prostředek", "Disciplinární postih", "Důkladná prohlídka"]'::jsonb,
   1,
   'DP je standardní zkratka pro donucovací prostředky.'),

  ('Taktika',
   'Mezi donucovací prostředky nepatří:',
   '["Hmaty a chvaty", "Pouta", "Varovný výstřel", "Služební pes"]'::jsonb,
   2,
   'Varovný výstřel je zákonem definován samostatně, nikoliv jako donucovací prostředek.'),

  ('Etika',
   'Etický kodex zaměstnance VS ČR vyžaduje především:',
   '["Rychlost za každou cenu", "Lidskou důstojnost a nestrannost", "Absolutní poslušnost bez otázek", "Osobní známosti"]'::jsonb,
   1,
   'Základem etiky je respektování lidské důstojnosti a nestranné jednání.'),

  ('Ostatní',
   'Jaká je barva služebního stejnopisu VS ČR?',
   '["Zelená", "Černá", "Modrošedá", "Světle modrá"]'::jsonb,
   2,
   'Typickou barvou uniformy Vězeňské služby ČR je modrošedá.')
ON CONFLICT (question) DO NOTHING;

-- Předměty „Zbraně", „Taktika", „Etika" a „Ostatní" jsou tu schválně tak, jak
-- byly v bance. Pozor: „Zbraně" a „Taktika" s velkým písmenem jsou jiné řetězce
-- než skutečné „zbrane" a „taktika" z udržované sady, takže by se ve výběru
-- předmětů při zakládání testu zase objevily dvakrát. Při vracení otázky proto
-- předmět rovnou přepište na ten správný.
