-- ═════════════════════════════════════════════════════════════════════════════
-- 023 — Služební příprava dostává svůj obsah
--
-- Spusťte CELÝ skript v Supabase Dashboard → SQL Editoru. Je idempotentní.
--
-- NÁLEZ
--   Služební příprava je na Akademii VS ČR řádný a jeden z hlavních předmětů,
--   ale v bance neměla ani jednu otázku, která by do ní obsahem patřila.
--   Migrace 022 z ní odstěhovala sedmnáct otázek o první pomoci, nutné obraně
--   a Justiční stráži — správně, jenže tím zůstala prázdná a v sekci Předměty
--   se přestala nabízet vůbec.
--
--   Její skutečný obsah v bance celou dobu byl. Seděl jen pod dvěma štítky,
--   které vypadají jako předměty, ale nejsou: `zbrane` (12 otázek) a `taktika`
--   (17 otázek). Že jde o klíče a ne o názvy předmětů, je vidět na první
--   pohled — jsou malými písmeny bez diakritiky, zatímco všechny ostatní
--   předměty mají řádné české názvy (`Právo`, `Penologie`, `Zdravověda a první
--   pomoc`). Totéž platí pro `zop` (4 otázky).
--
--   Popis Služební přípravy v aplikaci (src/data/questions/subjectsInfo.ts) na
--   ten obsah přitom sedí slovo od slova:
--
--       „Zákonné podmínky a taktika použití donucovacích prostředků a zbraně.
--        Střelecká a zbraňová příprava (pistole CZ 75 B / CZ P-10 C, samopal
--        Scorpion EVO 3A1) a taktická sebeobrana."
--
--   a mezi jejími okruhy stojí „Katalog donucovacích prostředků (§ 17)",
--   „Zákonná omezení použití DP a zbraně (§ 21)", „Použití zbraně (§ 19, § 20)
--   a povinnosti po střelbě (§ 22)", „Konstrukce a manipulace: CZ 75 B,
--   CZ P-10 C, CZ Scorpion EVO 3A1" a „Hmaty, chvaty, obrana proti noži".
--
-- ŘEŠENÍ
--   Služební příprava     21 otázek  donucovací prostředky, § 17/19/20/21/22,
--                                    pouta, obušek, paralyzér, slzotvorné,
--                                    zastavovací pás, sebeobrana, taktika
--                                    zákroku, eskorty, nutná obrana a krajní
--                                    nouze (§ 29 a § 28 TZ)
--   Zbraně                10 otázek  konstrukce, střelivo, balistika, mířidla,
--                                    závady, přebíjení, zbraňová bezpečnost
--   ZOP                    4 otázky  jen srovnání názvu z `zop` na `ZOP`
--
--   Taktika zůstává jako karta v subjectsInfo, ale bez otázek — její obsah je
--   z drtivé většiny právě služební příprava. Prázdné okruhy se v Předmětech
--   skrývají samy, takže se nenabídne, dokud do ní něco nepřibude.
--
--   Témata (pole topic) se nemění. Zůstávají v repozitáři a nesou to jemnější
--   dělení dál: „Katalog donucovacích prostředků", „Střelecká příprava –
--   CZ Scorpion EVO 3A1", „Taktická sebeobrana".
--
--   Stejná úprava je i v src/data/questions/sluzebniPriprava.ts, takže se
--   synchronizací výchozích otázek nevrátí zpátky.
--
-- Seznamy níže jsou VYGENEROVANÉ z repozitáře, ne psané ručně — u migrace 022
-- se ukázalo, že text otázky doplněný zpaměti se nespáruje.
-- ═════════════════════════════════════════════════════════════════════════════

UPDATE public.quiz_questions SET subject = 'Služební příprava'
WHERE question IN (
  'Jaké jsou zákonné podmínky pro použití donucovacích prostředků (DP) dle § 17 zákona č. 555/1992 Sb.?',
  'V jakých 5 taxativních případech je příslušník VS ČR oprávněn použít střelnou zbraň dle § 18 odst. 1 zákona č. 555/1992 Sb.?',
  'Které donucovací prostředky jsou taxativně vyjmenovány v § 17 zákona č. 555/1992 Sb.?',
  'Vůči kterým osobám je příslušník povinen omezit použití DP a zbraně dle § 19 zákona č. 555/1992 Sb.?',
  'Jaké povinnosti má příslušník VS ČR bezprostředně po použití donucovacích prostředků nebo zbraně dle § 20 zákona č. 555/1992 Sb.?',
  'Jaká jsou bezpečnostní pravidla a omezení při použití elektrického paralyzéru (Taser / kontaktní paralyzér)?',
  'Jaká jsou základní taktická pravidla při vstupu hlídky do cely k provedení zákroku proti ozbrojenému agresivnímu odsouzenému?',
  'Jaké jsou zásady správného nasazení služebních pout na ruce osoby za zády?',
  'Jaká látka a typ trysky se standardně využívá u služebních obranných sprejů ve výzbroji VS ČR a jak se aplikují?',
  'Které části těla jsou zakázanými zónami pro údery služebním obuškem při vedení zákroku?',
  'Za jakých podmínek a jakým způsobem se smí použít donucovací prostředek zastavovací pás (§ 17)?',
  'Jaké jsou zákonné podmínky a meze nutné obrany dle § 29 trestního zákoníku (č. 40/2009 Sb.)?',
  'V čem spočívá základní rozdíl mezi nutnou obranou (§ 29 TZ) a krajní nouzí (§ 28 TZ)?',
  'Jaké úkony musí provést velitel eskorty v případě úmrtí eskortované osoby během přepravy (§ 73)?',
  'Proč se řetízková i pevná nožní pouta přikládají VÝHRADNĚ na holé nohy nad kotníky a NIKDY přes kalhoty?',
  'Které části formuláře Záznamu o použití donucovacího prostředku vyplňuje a podepisuje zakročující příslušník (ML č. 5/2014)?',
  'Ve kterých situacích je příslušník VS ČR oprávněn použít pouta (nebo prostředky k zamezení prostorové orientace) jako donucovací prostředek?',
  'U jakých kategorií osob je příslušníkům VS ČR zakázáno použít úderů, kopů, slzotvorných prostředků, taseru a zbraně (neplatí pro nutnou obranu a krajní nouzi)?',
  'Jaké je základní taktické pravidlo při nečekaném útoku nožem na krátkou vzdálenost?',
  'Jaký je princip účinku elektrického paralyzéru (např. Taser) používaného VS ČR?',
  'Jaká povinnost příslušníka VS ČR předchází použití zbraně podle § 20 zákona č. 555/1992 Sb., je-li to s ohledem na okolnosti možné?'
);

UPDATE public.quiz_questions SET subject = 'Zbraně'
WHERE question IN (
  'Jaký je stanovený postup bezpečné kontroly zbraně (vybití zbraně) u lapače střel?',
  'Jaká je ráže a základní režimy střelby samopalu CZ Scorpion EVO 3A1 používaného u VS ČR?',
  'Jaký je okamžitý střelecký drill při selhání výstřelu (tzv. zádržka zbraně / Tap-Rack-Bang)?',
  'Jaký je rozdíl mezi taktickým přebitím (přebití s uschováním) a nouzovým přebitím zbraně?',
  'Jak zní první a nejdůležitější pravidlo bezpečné manipulace se střelnou zbraní?',
  'Který prostor se při manipulaci se střelnou zbraní (vybíjení, nabíjení, rána jistoty) považuje za bezpečný prostor?',
  'Jaká je ráže, kapacita zásobníku a charakteristika útočné pušky CZ BREN 2 zařazené ve výzbroji VS ČR?',
  'Co zkoumá terminální (cílová) balistika a jaký je hlavní účel celoplášťové střely (FMJ) služebního střeliva 9×19 mm Luger?',
  'Ze kterých 4 základních částí se skládá jednotný náboj pro služební pistole a samopaly (např. 9×19 mm Luger)?',
  'Jaká je správná optická rovina při míření mechanickými mířidly (muška – hledí) a na co musí střelec primárně zaostřit zrak?'
);

UPDATE public.quiz_questions SET subject = 'ZOP'
WHERE question IN (
  'Kdy příslušník VS ČR NENÍ povinen provést služební zákrok dle § 7 odst. 2 zákona č. 555/1992 Sb.?',
  'Jakými způsoby prokazuje příslušník svoji příslušnost k Vězeňské službě ČR (§ 8 zákona č. 555/1992 Sb.)?',
  'Jaké jsou hodnostní sbory a hodnostní označení ve Vězeňské službě ČR dle zákona č. 361/2003 Sb.?',
  'Ve kterých situacích příslušník VS ČR podle NGŘ č. 38/2018 NEZDRAVÍ a nepodává hlášení?'
);

-- ─── Ověření ─────────────────────────────────────────────────────────────────
--
-- (a) Rozdělení podle předmětů. Musí dát dohromady 377 a odpovídat repozitáři:
--
--       Právo 57 · Profesní etika 57 · Penologie 53 · Psychologie 42
--       Bezpečnostní služba 38 · Zdravověda a první pomoc 36 · Pedagogika 31
--       Vězeňská administrativa 28 · Služební příprava 21 · Zbraně 10 · ZOP 4

SELECT subject AS predmet, count(*) AS otazek
FROM public.quiz_questions
GROUP BY subject
ORDER BY count(*) DESC, subject;

-- (b) Štítky malými písmeny už v bance nesmí být. Musí vrátit prázdno:

SELECT DISTINCT subject
FROM public.quiz_questions
WHERE subject IN ('zbrane', 'taktika', 'zop');

-- (c) Služební příprava musí mít 21 otázek:

SELECT count(*) AS sluzebni_priprava
FROM public.quiz_questions
WHERE subject = 'Služební příprava';
