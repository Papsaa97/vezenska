-- ═════════════════════════════════════════════════════════════════════════════
-- 022 — Úklid banky otázek: odpad z importu a špatně zařazené předměty
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editoru. Je idempotentní.
--
-- Skript MAŽE DATA. Krok 1 vypíše, co půjde pryč, ještě než se to stane.
--
-- NÁLEZ 1 — 51 řádků z jednoho zkušebního importu
--   V bance bylo 428 otázek, ale jen 377 z nich pochází z udržované sady
--   v repozitáři. Zbylých 51 řádků vzniklo 12. 9. 2026 mezi 04:06:56 a 04:07:00,
--   tedy během čtyř sekund jednoho automatického běhu, a jde v nich dohromady
--   jen o OSM různých otázek:
--
--       „Jaký je ráže pistole CZ 75 B, kterou používá VS ČR?"      7 kopií
--       „Jaký zákon upravuje Vězeňskou službu ČR?"                 7 kopií
--       „Co znamená zkratka DP v kontextu donucovacích prostředků?" 6 kopií
--       „Etický kodex zaměstnance VS ČR vyžaduje především:"        6 kopií
--       „Kdo jmenuje a odvolává generálního ředitele…?"             7 kopií
--       „Která z těchto částí NENÍ součástí samopalu vz. 61…?"      6 kopií
--       „Mezi donucovací prostředky nepatří:"                       7 kopií
--       „Jaká je barva služebního stejnopisu VS ČR?"                5 kopií
--
--   Kopie se od sebe liší jen hexadecimální příponou přilepenou na konec textu,
--   například „Mezi donucovací prostředky nepatří: [0ff143bd] [7cf656d0]".
--   Ta přípona obchází unikátní index na sloupci question, který má u importu
--   sloužit jako konfliktní klíč — místo aby se řádek aktualizoval, vznikl nový.
--
--   Žádná z těch osmi otázek není v repozitáři (ověřeno hledáním v
--   src/data/questions/). Do udržované sady nepatří ani obsahem: jsou to
--   jednoslovné odpovědi typu „9 mm Luger" nebo „Modrošedá", zatímco zbytek
--   banky jsou rozvité otázky s odkazem na předpis. Jedna má navíc chybu
--   v zadání („Jaký je ráže" místo „Jaká je ráže").
--
--   Tyhle řádky zároveň vyrobily čtyři předměty, které jinak neexistují —
--   „Etika", „Ostatní", „Zbraně" a „Taktika" (druhé dva se liší jen velkým
--   písmenem od skutečných „zbrane" a „taktika"). Ve výběru předmětů při
--   zakládání testu se proto některé předměty nabízely dvakrát.
--
-- NÁLEZ 2 — sedmnáct otázek pod špatným předmětem
--   Předmět „Služební příprava" měl 17 otázek a ANI JEDNA z nich není služební
--   příprava. Sedm je první pomoc (resuscitace, turniket, anafylaxe…), dvě jsou
--   trestní právo (nutná obrana, krajní nouze) a osm je bezpečnostní služba,
--   administrativa a penologie.
--
--   Pole topic u nich přitom bylo správně už od začátku — říká „První pomoc –
--   KPR a AED", „Trestní právo – Nutná obrana" a podobně. Podle něj se předmět
--   níže opravuje. Skutečná služební příprava v bance je pod předměty „zbrane",
--   „taktika" a „zop"; předmět „Služební příprava" proto zůstane prázdný a
--   v sekci Předměty se přestane nabízet (prázdné okruhy se skrývají samy).
--
--   Stejná oprava je i v repozitáři (src/data/questions/sluzebniPriprava.ts),
--   takže se po synchronizaci výchozích otázek nevrátí zpátky.
-- ═════════════════════════════════════════════════════════════════════════════

-- ─── 0. Seznam odpadu ────────────────────────────────────────────────────────
--
-- Osm základních textů z nálezu 1. Porovnává se text OŘÍZNUTÝ o hexadecimální
-- přípony, takže jedno pravidlo pokrývá kopie i ty dva řádky, které příponu
-- nedostaly (vznikly na konci téhož běhu, v 04:06:59 a 04:07:00).

-- Pomocná tabulka schválně BEZ „ON COMMIT DROP": v SQL Editoru se každý příkaz
-- potvrzuje zvlášť, takže by zmizela hned po svém vytvoření a zbytek skriptu by
-- spadl. Takhle přežije do konce relace a opakované spuštění ji shodí sama.

DROP VIEW  IF EXISTS _odpad;
DROP TABLE IF EXISTS _odpad_texty;

CREATE TEMP TABLE _odpad_texty(zaklad text);
INSERT INTO _odpad_texty(zaklad) VALUES
  ('Jaký je ráže pistole CZ 75 B, kterou používá VS ČR?'),
  ('Jaký zákon upravuje Vězeňskou službu ČR?'),
  ('Co znamená zkratka DP v kontextu donucovacích prostředků?'),
  ('Etický kodex zaměstnance VS ČR vyžaduje především:'),
  ('Kdo jmenuje a odvolává generálního ředitele Vězeňské služby?'),
  ('Která z těchto částí NENÍ součástí samopalu vz. 61 Škorpion?'),
  ('Mezi donucovací prostředky nepatří:'),
  ('Jaká je barva služebního stejnopisu VS ČR?');

CREATE TEMP VIEW _odpad AS
SELECT q.id, q.subject, q.question, q.created_at
FROM public.quiz_questions q
JOIN _odpad_texty t
  ON t.zaklad = btrim(regexp_replace(q.question, '(\s*\[[0-9a-fA-F]{8}\])+\s*$', ''));

-- ─── 1. Co půjde pryč (spusťte a podívejte se, než pustíte krok 2) ──────────
--
-- Očekávaný výsledek při prvním spuštění: 51 řádků, všechny z 12. 9. 2026.
-- Při opakovaném spuštění nevrátí nic — skript už proběhl.

SELECT subject AS predmet, count(*) AS radku,
       min(created_at) AS od, max(created_at) AS do
FROM _odpad
GROUP BY subject
ORDER BY count(*) DESC, subject;

SELECT count(*) AS radku_ke_smazani FROM _odpad;

-- ─── 2. Smazání ──────────────────────────────────────────────────────────────
--
-- Na quiz_questions není cizí klíč z quiz_results — historie testů drží text
-- otázky ve sloupci attempts, ne odkaz. Smazáním se tedy nikomu nerozpadne
-- vlastní historie ani statistika.

DELETE FROM public.quiz_questions q
WHERE q.id IN (SELECT id FROM _odpad);

-- ─── 3. Oprava předmětů u sedmnácti otázek ───────────────────────────────────
--
-- Páruje se podle textu otázky, protože id v bance jsou UUID přidělená při
-- importu, kdežto v repozitáři mají otázky identifikátory typu 'sp-21'.
--
-- Sloupec topic se neplní: importní funkce ho neposílá, takže je v bance NULL
-- u všech otázek. Zdroj pravdy o tématu zůstává repozitář.

UPDATE public.quiz_questions SET subject = 'Zdravověda a první pomoc'
WHERE subject = 'Služební příprava' AND question IN (
  'Jaký je správný a okamžitý postup při masivním tepenném krvácení z končetiny (např. po bodném poranění)?',
  'Jaký je správný poměr stlačování hrudníku a umělých vdechů při základní resuscitaci dospělého a jaká je frekvence dle ERC Guidelines?',
  'Jaká je správná první pomoc při termickém popálení pokožky II. stupně (puchýře)?',
  'Jak se v taktické první pomoci (TCCC) ošetřuje otevřené poranění hrudníku (nasávající rána hrudníku)?',
  'Jaké jsou příznaky a první pomoc při těžké alergické reakci (anafylaxi) s otokem dýchacích cest?',
  'Jaká je správná první pomoc při záchvatu křečí s bezvědomím (epileptický záchvat typu Grand Mal)?',
  'Jak se provádí první pomoc při podezření na zlomeninu dlouhé kosti končetiny?'
);

UPDATE public.quiz_questions SET subject = 'Bezpečnostní služba'
WHERE subject = 'Služební příprava' AND question IN (
  'U kterých ústavních činitelů a funkcionářů se při vstupu do věznice NEPROVÁDÍ kontrola ani prohlídka zavazadla (§ 80 odst. 2 písm. c NGŘ č. 33/2019)?',
  'Na jaké doklady mohou osoby vstupovat do střežených objektů VS ČR dle § 103 NGŘ č. 33/2019?',
  'Jaký je správný postup strážného na vchodu při kontrole osoby s implantovaným kardiostimulátorem?',
  'Jaké úkony se musí provést před spuštěním detektoru tepové frekvence (Heartbeat detector) u vozidla?',
  'Jaká striktní zásada platí pro nesení zavazadla s peněžní hotovostí při přepravě Justiční stráží dle § 144?',
  'Jaké jsou povinnosti příslušníka Justiční stráže při doprovodu soudního vykonavatele k odebrání nezletilého dítěte (§ 143)?'
);

UPDATE public.quiz_questions SET subject = 'Právo'
WHERE subject = 'Služební příprava' AND question IN (
  'Jaké jsou zákonné podmínky a meze nutné obrany dle § 29 trestního zákoníku (č. 40/2009 Sb.)?',
  'V čem spočívá základní rozdíl mezi nutnou obranou (§ 29 TZ) a krajní nouzí (§ 28 TZ)?'
);

UPDATE public.quiz_questions SET subject = 'Vězeňská administrativa'
WHERE subject = 'Služební příprava' AND question IN (
  'U kterého typu soudní obálky NIKDY nenastává fikce doručení vhozením do schránky (§ 146 / OSŘ)?'
);

UPDATE public.quiz_questions SET subject = 'Penologie'
WHERE subject = 'Služební příprava' AND question IN (
  'Kdo rozhoduje o zařazení vězněné osoby do kategorie DVO (další vytypovaná osoba) a DVO-P (profese) dle NGŘ č. 24/2022?'
);

-- ─── 4. Ověření ──────────────────────────────────────────────────────────────
--
-- (a) Rozdělení podle předmětů. Musí dát dohromady 377 a odpovídat repozitáři:
--
--       Právo 59 · Profesní etika 57 · Penologie 53 · Psychologie 42
--       Bezpečnostní služba 38 · Zdravověda a první pomoc 36 · Pedagogika 31
--       Vězeňská administrativa 28 · taktika 17 · zbrane 12 · zop 4
--
--     Předměty „Služební příprava", „Etika", „Ostatní", „Zbraně" a „Taktika"
--     (s velkým písmenem) se ve výsledku už nesmí objevit.

SELECT subject AS predmet, count(*) AS otazek
FROM public.quiz_questions
GROUP BY subject
ORDER BY count(*) DESC, subject;

SELECT count(*) AS celkem_v_bance FROM public.quiz_questions;

-- (b) Žádná otázka už nesmí mít hexadecimální příponu. Musí vrátit 0:

SELECT count(*) AS zbyva_s_priponou
FROM public.quiz_questions
WHERE question ~ '\[[0-9a-fA-F]{8}\]';

-- (c) Žádné dvě otázky se nesmí lišit jen tou příponou. Musí vrátit prázdno:

SELECT btrim(regexp_replace(question, '(\s*\[[0-9a-fA-F]{8}\])+\s*$', '')) AS zaklad,
       count(*) AS kopii
FROM public.quiz_questions
GROUP BY 1
HAVING count(*) > 1;

-- ─── Jak zabránit opakování ──────────────────────────────────────────────────
--
-- Import z aplikace („Doplnit chybějící do Supabase") dělá upsert s konfliktním
-- klíčem na sloupci question, takže sám duplicity netvoří. Vznikly proto, že si
-- něco k textu otázky přilepilo náhodnou příponu, čímž se z aktualizace stal
-- nový řádek. Než něco takového pustíte znovu, ověřte si dotazem (b) výše, že
-- v bance nepřibyly otázky s příponou.
--
-- Kdyby bylo potřeba banku srovnat od nuly, slouží k tomu tlačítko „Přepsat
-- banku novou revizí" ve správě otázek: smaže všechno a nahraje 377 otázek
-- z repozitáře. Hrubší nástroj — otázky dostanou nová UUID a přijdete o
-- cokoli, co je jen v bance a ne v repozitáři.
