-- ═════════════════════════════════════════════════════════════════════════════
-- 024 — Dvě otázky o použití síly přecházejí do Služební přípravy
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editoru. Je idempotentní.
--
-- NÁLEZ
--   V Bezpečnostní službě zůstaly dvě otázky, které obsahem patří do služební
--   přípravy — tedy k § 17 až § 22 zákona č. 555/1992 Sb., kam je migrace 023
--   soustředila:
--
--     bs-30  „Jaké jsou povinnosti příslušníka před použitím donucovacího
--            prostředku?"
--            Téma má rovnou „Donucovací prostředky" a odpověď je o zákonné
--            výzvě před zákrokem. Její dvojče — „Jaké jsou zákonné podmínky
--            pro použití donucovacích prostředků dle § 17" — je ve Služební
--            přípravě už od migrace 023.
--
--     bs-29  „Je příslušník VS ČR oprávněn použít střelnou zbraň proti davu?"
--            Téma říká „Strážní služba", ale obsah jsou meze použití zbraně
--            a varovný výstřel, tedy přesně okruh „Zákonná omezení použití DP
--            a zbraně".
--
-- CO SE ZÁMĚRNĚ NEMĚNÍ
--   bs-21 „V jakých případech je velitel eskorty povinen nařídit použití pout
--   a poutacích řemenů" zůstává v Bezpečnostní službě. Pouta sice donucovací
--   prostředek jsou, ale otázka je o vyhodnocení rizika eskorty, ne o tom, jak
--   se pouta nasazují — to řeší sp-14 a sp-38 ve Služební přípravě.
--
--   bs-19 o kynologii zůstává také. Služební pes je podle § 17 donucovací
--   prostředek, jenže otázka se ptá na účel a specializaci psů, ne na jejich
--   použití při zákroku.
--
--   Stejná úprava je i v src/data/questions/bezpecnostniSluzba.ts, takže se
--   synchronizací výchozích otázek nevrátí zpátky.
--
-- Seznam je vygenerovaný z repozitáře, ne psaný ručně.
-- ═════════════════════════════════════════════════════════════════════════════

UPDATE public.quiz_questions SET subject = 'Služební příprava'
WHERE question IN (
  'Je příslušník VS ČR oprávněn použít střelnou zbraň proti davu, pokud z něj vychází nebezpečí?',
  'Jaké jsou povinnosti příslušníka před použitím donucovacího prostředku?'
);

-- ─── Ověření ─────────────────────────────────────────────────────────────────
--
-- Rozdělení podle předmětů. Musí dát 377 a odpovídat repozitáři:
--
--   Právo 57 · Profesní etika 57 · Penologie 53 · Psychologie 42
--   Bezpečnostní služba 36 · Zdravověda a první pomoc 36 · Pedagogika 31
--   Vězeňská administrativa 28 · Služební příprava 23 · Zbraně 10 · ZOP 4

SELECT subject AS predmet, count(*) AS otazek
FROM public.quiz_questions
GROUP BY subject
ORDER BY count(*) DESC, subject;

-- ─── Co tímhle skriptem vyřešené NENÍ ────────────────────────────────────────
--
-- Při procházení Bezpečnostní služby vyšly najevo dvě věci, které se nedají
-- spravit přeštítkováním, protože jde o obsah otázek:
--
-- 1. ROZPOR V BARVÁCH SOUDNÍCH OBÁLEK
--    bs-04 (Bezpečnostní služba) tvrdí:
--        „Typ I (ZELENÝ pruh) umožňuje náhradní doručení … Typ II (ČERVENÝ
--         pruh) je striktně do vlastních rukou bez vhození do schránky."
--    sp-33 (Vězeňská administrativa) tvrdí:
--        „Obálka typu II (ZELENÝ pruh) – doručování do vlastních rukou
--         s vyloučením vložení do schránky."
--
--    Obě nemohou platit zároveň: jedna přiřazuje zelený pruh typu I, druhá
--    typu II. Kdo se učí obojí, naučí se to opačně. Která z nich je správně,
--    se musí ověřit proti předpisu — hádat se to nedá.
--
-- 2. DVĚ OTÁZKY NA TOTÉŽ
--    bs-05 „Kdo nese zavazadlo s penězi a ceninami při pěším doprovodu
--          pokladní soudu příslušníky Justiční stráže?"
--    sp-31 „Jaká striktní zásada platí pro nesení zavazadla s peněžní
--          hotovostí při přepravě Justiční stráží dle § 144?"
--
--    Stejná věc, stejná odpověď (hotovost nese vždy zaměstnanec soudu, nikdy
--    příslušník), jen jinými slovy. Unikátní index na textu otázky je
--    nezachytí, protože znění se liší. Obě jsou teď v Bezpečnostní službě.
