export interface LegalArticle {
  id: string;
  actNumber: string;
  actTitle: string;
  section: string;
  title: string;
  exactText: string;
  explanation: string;
  examTips: string;
  category: 
    | '555_1992' 
    | '169_1999' 
    | '293_1993' 
    | '361_2003' 
    | 'ngr_33_2019' 
    | 'ngr_16_2022' 
    | 'ngr_24_2022' 
    | 'justicni_straz' 
    | 'poutani' 
    | 'vstupy_vjezdy' 
    | 'poradova_sluzebni' 
    | 'ustava_lzps' 
    | 'trestni_pravo' 
    | 'zsm_mladez' 
    | 'mezinarodni_cpt';
}

export const legalDatabase: LegalArticle[] = [
  // =========================================================================
  // --- ZÁKON Č. 555/1992 SB., O VĚZEŇSKÉ SLUŽBĚ A JUSTIČNÍ STRÁŽI ČR ---
  // =========================================================================
  {
    id: '555-1-5-pusobnost',
    actNumber: 'Zákon č. 555/1992 Sb.',
    actTitle: 'Zákon o Vězeňské službě a justiční stráži České republiky',
    section: '§ 1 – § 5',
    title: 'Postavení, členění a hlavní úkoly Vězeňské služby a Justiční stráže',
    exactText: `§ 1 Postavení Vězeňské služby:
(1) Zřizuje se Vězeňská služba České republiky (dále jen „Vězeňská služba“). Vězeňská služba je ozbrojeným bezpečnostním sborem.
(2) Vězeňská služba zajišťuje výkon zabezpečovací detence, výkon vazby a výkon trestu odnětí svobody a v rozsahu stanoveném tímto zákonem ochranu pořádku a bezpečnosti při výkonu soudnictví a správě soudů a při činnosti státních zastupitelství.
(3) Vězeňskou službu řídí generální ředitel Vězeňské služby, kterého jmenuje a odvolává ministr spravedlnosti.

§ 2 Členění Vězeňské služby:
Vězeňská služba se člení na:
a) Vězeňskou stráž,
b) Justiční stráž,
c) Správní službu.

§ 3 Úkoly Vězeňské stráže:
Vězeňská stráž střeží, předvádí a eskortuje osoby ve výkonu zabezpečovací detence, ve výkonu vazby a ve výkonu trestu odnětí svobody, střeží věznice, ústavy pro výkon zabezpečovací detence a při výkonu služby v nich udržuje pořádek a bezpečnost.

§ 4 Úkoly Justiční stráže:
Justiční stráž zajišťuje pořádek a bezpečnost v budovách soudů, státních zastupitelství a ministerstva spravedlnosti a v jiných místech jejich činnosti a při výkonu pravomoci soudů a státních zastupitelství.

§ 5 Pověřené orgány Vězeňské služby:
Pověřené orgány Vězeňské služby mají postavení policejního orgánu v řízení o trestných činech osob ve výkonu vazby, trestu odnětí svobody nebo zabezpečovací detence spáchaných v těchto objektech.`,
    explanation: 'Základní organizační norma vymezující postavení VS ČR jako ozbrojeného sboru, trojí členění (Vězeňská stráž, Justiční stráž, Správní služba) a postavení pověřených orgánů jako policejního orgánu dle trestního řádu.',
    examTips: 'Pozor na členění: Vězeňská služba se člení na 3 složky (Vězeňská stráž, Justiční stráž, Správní služba). Kdo jmenuje generálního ředitele? Ministr spravedlnosti.',
    category: '555_1992'
  },
  {
    id: '555-6-14-opravneni',
    actNumber: 'Zákon č. 555/1992 Sb.',
    actTitle: 'Zákon o Vězeňské službě a justiční stráži České republiky',
    section: '§ 6 – § 14',
    title: 'Povinnosti a oprávnění příslušníka (zjišťování totožnosti, zajištění, odebrání zbraně)',
    exactText: `§ 6 Povinnosti příslušníka:
(1) Příslušník je při provádění služebního zákroku nebo úkonu povinen prokázat svou příslušnost k Vězeňské službě služebním stejnokrojem s identifikačním číslem, služebním průkazem nebo odznakem VS ČR.
(2) Před provedením služebního zákroku je příslušník povinen, pokud to okolnosti dovolují, použít zákonnou výzvu „Jménem zákona!“.

§ 7 Zjišťování totožnosti:
Příslušník je oprávněn vyzvat k prokázání totožnosti osobu, která vstupuje do střeženého objektu, zdržuje se v zakázaném pásmu, je podezřelá ze spáchání trestného činu nebo přestupku, anebo osobu, proti které směřuje služební zákrok.

§ 11 Zajištění osoby:
Příslušník je oprávněn zajistit osobu, která ve střeženém objektu bezprostředně ohrožuje život, zdraví nebo majetek, ruší pořádek, pokusila se vnést nepovolené věci, nebo odmítá prokázat totožnost. Zajištění smí trvat nejdéle 24 hodin, pak musí být osoba propuštěna nebo předána Policii ČR.

§ 13 Odebrání zbraně a věcí:
Příslušník je oprávněn přesvědčit se, zda vstupující nebo předváděná osoba nemá u sebe zbraň nebo jinou nepovolenou věc, a takovou věc odebrat a vystavit o tom potvrzení.`,
    explanation: 'Ustanovení upravují každodenní výkon strážní a dozorčí služby: prokazování příslušnosti, oprávnění kontrolovat totožnost na vchodech, odebrání nedovolených předmětů a limit zajištění osoby (max. 24 hodin).',
    examTips: 'Zkušební chytáky: 1. Jak dlouho smí trvat zajištění osoby příslušníkem VS ČR? Max. 24 hodin. 2. Jak zní zákonná výzva? „Jménem zákona!“. 3. O odebrání věci se vždy vystavuje písemné potvrzení.',
    category: '555_1992'
  },
  {
    id: '555-17',
    actNumber: 'Zákon č. 555/1992 Sb.',
    actTitle: 'Zákon o Vězeňské službě a justiční stráži České republiky',
    section: '§ 17',
    title: 'Donucovací prostředky (Podmínky a taxativní výčet)',
    exactText: `(1) K zajištění pořádku a bezpečnosti v místech výkonu zabezpečovací detence, vazby nebo trestu odnětí svobody, v místech střežených Vězeňskou službou nebo Justiční stráží nebo při eskortách je příslušník oprávněn použít donucovací prostředky proti osobám, které ohrožují život nebo zdraví, poškozují majetek nebo maří účel výkonu zabezpečovací detence, vazby nebo trestu odnětí svobody anebo neoprávněně narušují střežení nebo výkon služby.

(2) Donucovacími prostředky jsou:
a) hmaty, chvaty, údery a kopy sebeobrany,
b) předváděcí řetízky,
c) pouta,
d) poutací popruhy,
e) pouta s poutacím opaskem,
f) slzotvorný, elektrický nebo jiný obdobně dočasně zneschopňující prostředek,
g) obušek nebo jiný úderný prostředek,
h) služební pes,
ch) vodní stříkač,
i) zásahová výbuška,
j) expanzní zbraně,
k) úder střelnou zbraní,
l) hrozba střelnou zbraní,
m) varovný výstřel,
n) vytlačování štítem,
o) vytlačování vozidlem,
p) prostředek k zamezení prostorové orientace.

(3) Příslušník je oprávněn použít donucovací prostředek, který zvolí podle konkrétní situace tak, aby dosáhl účelu sledovaného služebním zákrokem a použitý donucovací prostředek a jeho intenzita byly přiměřené nebezpečnosti protiprávního jednání. Před použitím donucovacího prostředku je příslušník povinen vyzvat osobu, proti které zákrok směřuje, aby upustila od protiprávního jednání, s výstrahou, že bude použito donucovacích prostředků. Od výzvy s výstrahou lze upustit pouze v případě, je-li bezprostředně ohrožen život nebo zdraví příslušníka anebo jiné osoby a zákrok nesnese odkladu.

(4) Při předvádění nebo eskortování osoby ve výkonu zabezpečovací detence, vazby nebo trestu odnětí svobody mimo objekt věznice nebo ústavu lze použít předváděcí řetízky, pouta a pouta s poutacím opaskem i bez splnění podmínek uvedených v odstavci 1, pokud je to ke splnění účelu úkonu nezbytné.

(5) K omezení volnosti pohybu osoby ve výkonu zabezpečovací detence, vazby nebo trestu odnětí svobody, která fyzicky napadá jinou osobu nebo příslušníka, poškozuje majetek, pokusila se o útěk nebo se chová agresivně, lze použít připoutání k vhodnému předmětu, a to nejdéle po dobu 2 hodin od okamžiku připoutání.`,
    explanation: 'Paragraf 17 je základním ustanovením pro použití síly a technických prostředků. Obsahuje taxativní (uzavřený) výčet všech 17 zákonných donucovacích prostředků pod písmeny a) až p), zásadu subsidiarity a proporcionality, povinnou zákonnou výzvu s výstrahou (a jedinou výjimku – bezprostřední ohrožení života/zdraví a zákrok nesnese odkladu), zvláštní režim pro eskorty (odst. 4) a časový limit pro připoutání k pevnému předmětu na max. 2 hodiny (odst. 5).',
    examTips: 'Zásadní zkušební chytáky: 1. Úder střelnou zbraní, hrozba střelnou zbraní a varovný výstřel jsou DONUCOVACÍ PROSTŘEDKY dle § 17 odst. 2 písm. k), l), m), nikoliv použití zbraně! 2. Jak dlouho lze vězně připoutat k předmětu? Max. 2 hodiny (§ 17 odst. 5). 3. Kdy lze upustit od výzvy s výstrahou? Jen při bezprostředním ohrožení života/zdraví a zákrok nesnese odkladu.',
    category: '555_1992'
  },
  {
    id: '555-18',
    actNumber: 'Zákon č. 555/1992 Sb.',
    actTitle: 'Zákon o Vězeňské službě a justiční stráži České republiky',
    section: '§ 18',
    title: 'Použití střelné zbraně (Přesné a plné zákonné znění)',
    exactText: `(1) Příslušník je oprávněn použít střelnou zbraň pouze v těchto případech:
a) aby v nutné obraně odvrátil přímo hrozící nebo trvající útok vedený proti jeho osobě anebo útok na život nebo zdraví jiné osoby,
b) k překonání odporu směřujícího ke zmaření služebního zákroku, nelze-li tento odpor překonat jinak, a nezdaří-li se služební zákrok provést, bude ohrožen život nebo zdraví jiné osoby,
c) k zamezení útěku osoby ve výkonu zabezpečovací detence, ve výkonu vazby nebo ve výkonu trestu odnětí svobody ze střeženého objektu nebo při eskortě, nelze-li tuto osobu jinak zadržet,
d) k odvrácení nebezpečného útoku, který ohrožuje střežený nebo chráněný objekt nebo stanoviště, po marné výzvě, aby bylo upuštěno od útoku,
e) ke zneškodnění zvířete ohrožujícího život nebo zdraví osob.

(2) Použití střelné zbraně je přípustné pouze tehdy, jestliže použití donucovacích prostředků by bylo zřejmě neúčinné.

(3) Před použitím střelné zbraně v případech uvedených v odstavci 1 písm. a) až d) je příslušník povinen vyzvat osobu, proti které zákrok směřuje, aby upustila od protiprávního jednání, s výstrahou, že bude použita střelná zbraň. Od výzvy s výstrahou lze upustit pouze v případě, je-li ohrožen život nebo zdraví příslušníka anebo jiné osoby a zákrok nesnese odkladu.

(4) Při použití střelné zbraně je příslušník povinen dbát nutné opatrnosti, zejména aby nebyl ohrožen život nebo zdraví jiných osob, a co nejvíce šetřit život osoby, proti které zákrok směřuje.`,
    explanation: 'Paragraf 18 taxativně stanoví 5 zákonných důvodů [písm. a) až e)], kdy smí příslušník použít střelnou zbraň (střelbu proti osobě nebo zvířeti). Zbraň je institutem ultima ratio (nejzazším prostředkem), proto odst. 2 vyžaduje, aby použití DP bylo předem zřejmě neúčinné. Odst. 3 stanoví povinnost výzvy s výstrahou („Jménem zákona, stůj, nebo střelím!“) a odst. 4 ukládá povinnost šetřit život a neohrozit nezúčastněné osoby.',
    examTips: 'U zkoušky ZOP A zkušební komise vyžaduje doslovnou znalost všech 5 důvodů písm. a) až e). Nezapomeňte: zvíře je v písm. e), útěk vězně v písm. c), nutná obrana v písm. a), marná výzva u objektu v písm. d) a odpor ohrožující životy v písm. b).',
    category: '555_1992'
  },
  {
    id: '555-19',
    actNumber: 'Zákon č. 555/1992 Sb.',
    actTitle: 'Zákon o Vězeňské službě a justiční stráži České republiky',
    section: '§ 19',
    title: 'Omezení při použití donucovacích prostředků a střelné zbraně',
    exactText: `(1) Při použití donucovacích prostředků uvedených v § 17 odst. 2 písm. a), c) až m) a střelné zbraně je příslušník povinen dbát na to, aby nebyla způsobena újma na zdraví těhotné ženě, osobě vysokého věku, osobě se zjevným zdravotním postižením a osobě zjevně mladší 15 let; tyto donucovací prostředky a střelnou zbraň lze proti těmto osobám použít jen tehdy, jestliže jejich útok bezprostředně ohrožuje život nebo zdraví příslušníka nebo jiné osoby anebo hrozí škoda velkého rozsahu a nebezpečí nelze odvrátit jinak.

(2) Proti ženě nelze použít služebního psa, elektrického paralyzéru a střelné zbraně, s výjimkou případů uvedených v odstavci 1 a při zamezení útěku podle § 18 odst. 1 písm. c).`,
    explanation: 'Zákon poskytuje zvýšenou právní ochranu zranitelným kategoriím osob: těhotným ženám, seniorům, invalidům/nemocným a dětem do 15 let. Proti těmto skupinám lze použít pouze hmaty a chvaty nebo předváděcí řetízky, pokud nenastane výjimka bezprostředního ohrožení života/zdraví či škody velkého rozsahu. Proti ženám obecně je zakázán pes, paralyzér a střelná zbraň (mimo taxativní výjimky ohrožení života a útěku).',
    examTips: 'Otázka komise: Kdy lze použít zbraň nebo psa proti těhotné ženě či dítěti pod 15 let? Pouze tehdy, pokud jejich útok bezprostředně ohrožuje život nebo zdraví anebo hrozí škoda velkého rozsahu a nebezpečí nelze odvrátit jinak!',
    category: '555_1992'
  },
  {
    id: '555-20',
    actNumber: 'Zákon č. 555/1992 Sb.',
    actTitle: 'Zákon o Vězeňské službě a justiční stráži České republiky',
    section: '§ 20',
    title: 'Povinnosti po použití donucovacích prostředků a střelné zbraně',
    exactText: `(1) Zjistí-li příslušník, že při použití donucovacích prostředků nebo střelné zbraně došlo ke zranění osoby, je povinen, jakmile to okolnosti dovolí, poskytnout zraněné osobě první pomoc a zajistit lékařské ošetření.

(2) Každý služební zákrok, při kterém bylo použito donucovacích prostředků nebo střelné zbraně, je příslušník povinen bezodkladně ohlásit svému nadřízenému a sepsat o něm úřední záznam.

(3) Dojde-li při použití donucovacích prostředků nebo střelné zbraně ke zranění nebo usmrcení osoby nebo ke škodě na majetku, je ředitel věznice nebo ústavu anebo vedoucí organizační jednotky povinen neprodleně vyrozumět příslušného státního zástupce.`,
    explanation: 'Paragraf 20 stanoví obligatorní řetězec kroků po každém použití donucovacích prostředků nebo střelné zbraně: 1. Poskytnout první pomoc a zajistit lékařské ošetření, 2. Bezodkladně ohlásit nadřízenému a vyhotovit písemný úřední záznam, 3. Při zranění, smrti nebo škodě na majetku ředitel věznice neprodleně vyrozumí dozorujícího státního zástupce.',
    examTips: 'Kroky po použití DP/zbraně se u zkoušky recitují v logickém pořadí: První pomoc → Lékař → Hlášení nadřízenému → Písemný záznam → Vyrozumění státního zástupce ředitelem věznice (při zranění/smrti/škodě).',
    category: '555_1992'
  },
  {
    id: '555-21-22',
    actNumber: 'Zákon č. 555/1992 Sb.',
    actTitle: 'Zákon o Vězeňské službě a justiční stráži České republiky',
    section: '§ 21 a § 22',
    title: 'Služební zákroky pod jednotným velením a působnost Justiční stráže',
    exactText: `§ 21 Služební zákroky pod jednotným velením:
(1) Zakročují-li příslušníci pod jednotným velením, rozhoduje o použití donucovacích prostředků a střelné zbraně velitel zakročující jednotky.
(2) Rozhodnutí velitele zakročující jednotky o použití donucovacích prostředků a střelné zbraně musí být v souladu s tímto zákonem.
(3) Na postup velitele zakročující jednotky se vztahují ustanovení § 17 odst. 3 a § 18 až 20.

§ 22 Působnost Justiční stráže:
(1) Příslušníci Justiční stráže mají při plnění úkolů podle tohoto zákona povinnosti a oprávnění uvedené v § 6 až 14 a § 17 až 21.
(2) Příslušník Justiční stráže je oprávněn vykázat nebo vyvést z budovy soudu, státního zastupitelství nebo ministerstva anebo z místa jednání soudu osobu, která neuposlechne pokynu předsedy senátu, samosoudce, státního zástupce nebo příslušníka JS anebo hrubě porušuje veřejný pořádek.`,
    explanation: 'Při hromadném zákroku (např. Zásahové jednotky) přechází odpovědnost za volbu a použití DP na velitele jednotky. Paragraf 22 pak deleguje oprávnění z hlavy druhé na Justiční stráž a dává jí pravomoc vyvést neukázněné osoby z budov soudů a státních zastupitelství.',
    examTips: 'Kdo rozhoduje o použití DP při zákroku pod jednotným velením? Velitel zakročující jednotky (§ 21). Kdo může nařídit vykázání osoby z jednací síně? Předseda senátu / samosoudce, realizuje Justiční stráž.',
    category: '555_1992'
  },

  // =========================================================================
  // --- ZÁKON Č. 169/1999 SB., O VÝKONU TRESTU ODNĚTÍ SVOBODY ---
  // =========================================================================
  {
    id: '169-typy-veznic',
    actNumber: 'Zákon č. 169/1999 Sb.',
    actTitle: 'Zákon o výkonu trestu odnětí svobody',
    section: '§ 7, § 8, § 9, § 12',
    title: 'Typy věznic, diferenciace a vnitřní prostupnost oddělení',
    exactText: `§ 8 Typy věznic (po novele č. 58/2017 Sb.):
(1) Trest odnětí svobody se vykonává diferencovaně ve dvou základních typech věznic:
a) věznice s ostrahou,
b) věznice se zvýšenou ostrahou.

(2) Věznice s ostrahou se vnitřně člení na oddělení podle stupně zabezpečení:
a) s nízkým stupněm zabezpečení,
b) se středním stupněm zabezpečení,
c) s vysokým stupněm zabezpečení.

§ 9 Umisťování a přemisťování odsouzených:
(1) O zařazení odsouzeného do konkrétního typu věznice rozhoduje SOUD v odsuzujícím rozsudku.
(2) O umístění odsouzeného do konkrétního oddělení věznice s ostrahou (nízký, střední, vysoký stupeň zabezpečení) a o jeho přeřazení mezi těmito odděleními rozhoduje ŘEDITEL VĚZNICE na návrh odborné komise.

§ 12 Zvláštní věznice a oddělení:
Samostatně a odděleně od ostatních odsouzených se vykonává trest u žen, mladistvých, trvale pracovně nezařaditelných a osob s poruchami chování.`,
    explanation: 'Základní penologická struktura vězeňství v ČR: soud určuje pouze základní typ (ostraha vs. zvýšená ostraha), zatímco ředitel věznice má pravomoc flexibilně měnit vnitřní stupeň zabezpečení podle chování a plnění programu zacházení.',
    examTips: 'Klíčový rozdíl: Soud rozhoduje o TYPU věznice (ostraha / zvýšená ostraha). Ředitel věznice rozhoduje o STUPNI zabezpečení v rámci věznice s ostrahou (nízký / střední / vysoký).',
    category: '169_1999'
  },
  {
    id: '169-prava-povinnosti',
    actNumber: 'Zákon č. 169/1999 Sb.',
    actTitle: 'Zákon o výkonu trestu odnětí svobody',
    section: '§ 16 – § 20',
    title: 'Základní práva odsouzených (strava, ubytování, návštěvy, korespondence)',
    exactText: `§ 16 Ubytování a stravování:
(1) Odsouzenému se poskytuje pravidelná strava podle fyziologických potřeb organismu s přihlédnutím k jeho zdravotnímu stavu a náboženským zvyklostem (3x denně, z toho alespoň jedno teplé jídlo).
(2) Ubytovací plocha pro jednoho odsouzeného v cele nebo ložnici činí nejméně 4 m². Každý odsouzený má samostatné lůžko, skříňku na osobní věci a židli.

§ 17 Korespondence:
(1) Odsouzený má právo přijímat a na svůj náklad odesílat korespondenci bez omezení.
(2) Korespondence podléhá kontrole zaměstnanci VS ČR; kontrola korespondence mezi odsouzeným a jeho obhájcem, advokátem, státními orgány ČR a mezinárodními organizacemi je ZAKÁZÁNA.

§ 19 Návštěvy odsouzených:
(1) Odsouzený má právo přijímat návštěvy blízkých osob v celkovém rozsahu 3 HODINY ZA KALENDÁŘNÍ MĚSÍC.
(2) Návštěvy se může současně zúčastnit nejvýše 4 osoby včetně nezletilých dětí.`,
    explanation: 'Zákon garantuje minimální životní podmínky (4 m² plocha, 3x denně strava, 1 teplé jídlo), neomezenou korespondenci (s absolutní nedotknutelností advokátní pošty) a měsíční limit 3 hodiny návštěv pro max. 4 osoby.',
    examTips: 'Čísla k zapamatování: Ubytovací plocha = min. 4 m². Návštěvy odsouzených = 3 hodiny za měsíc, max. 4 osoby. Advokátní korespondence se NIKDY neotvírá ani nekontroluje.',
    category: '169_1999'
  },
  {
    id: '169-kazenske-tresty',
    actNumber: 'Zákon č. 169/1999 Sb.',
    actTitle: 'Zákon o výkonu trestu odnětí svobody',
    section: '§ 46 – § 54',
    title: 'Kázeňská odpovědnost, kázeňské odměny a kázeňské tresty odsouzených',
    exactText: `§ 46 Kázeňský přestupek:
Kázeňským přestupkem je zaviněné porušení stanoveného pořádku nebo kázně při výkonu trestu.

§ 47 Kázeňské odměny:
Za příkladné plnění povinností, pracovní výsledky nebo mimořádný čin lze udělit:
a) pochvalu,
b) prominutí dříve uloženého kázeňského trestu,
c) věcnou nebo peněžitou odměnu (do výše 2 000 Kč),
d) mimořádné opuštění věznice až na 5 dnů (přerušení výkonu trestu).

§ 53 Kázeňské tresty (taxativní výčet):
a) důtka,
b) zákaz přijetí balíčku (nejvýše na dobu 3 měsíců),
c) zákaz nákupu potravin a věcí osobní potřeby s výjimkou hygienických potřeb (až na 2 měsíce),
d) propadnutí věci,
e) umístění do uzavřeného oddílu v mimopracovní době (až na 30 dnů),
f) celodenní umístění do uzavřeného oddílu (až na 20 dnů),
g) umístění do samovazby (až na 20 dnů; u mladistvých max. na 10 dnů).

§ 54 Výkon samovazby:
Během samovazby je odsouzený umístěn na samostatné cele, neúčastní se hromadných aktivit, lůžko je přes den uzamčeno ke stěně a má právo pouze na 1 hodinu denně vycházky. Před nástupem do samovazby musí být vyšetřen LÉKAŘEM!`,
    explanation: 'Kázeňský řád pro odsouzené. Nejpřísnějším trestem je samovazba na max. 20 dnů (u mladistvých 10 dnů), která obligatorně vyžaduje předchozí schválení a potvrzení lékaře o zdravotní způsobilosti.',
    examTips: 'Otázky zkušební komise: 1. Jak dlouho může trvat samovazba u dospělého odsouzeného? Až 20 dnů (u mladistvého max. 10 dnů). 2. Kdo musí schválit nástup do samovazby? Lékař. 3. Jaké je maximum pro opuštění věznice jako odměna? Až 5 dnů.',
    category: '169_1999'
  },

  // =========================================================================
  // --- ZÁKON Č. 293/1993 SB., O VÝKONU VAZBY ---
  // =========================================================================
  {
    id: '293-vazba-komplet',
    actNumber: 'Zákon č. 293/1993 Sb.',
    actTitle: 'Zákon o výkonu vazby',
    section: '§ 1 – § 14, § 21 – § 25',
    title: 'Zásady výkonu vazby, práva obviněného, koluzní režim a kázeňské tresty',
    exactText: `§ 1 Účel a zásady výkonu vazby:
(1) Ve výkonu vazby se obviněný podrobuje jen těm omezením, která jsou nutná k zajištění účelu vazby a k zachování pořádku a bezpečnosti.
(2) Vůči obviněnému platí presumpce neviny; obviněný NESMÍ být nucen k práci!

§ 8 Návštěvy obviněných:
(1) Obviněný má právo přijmout návštěvu v rozsahu 90 MINUT JEDNOU ZA 2 TÝDNY. Současně se návštěvy mohou zúčastnit nejvýše 4 osoby včetně dětí.
(2) Obviněný v KOLUZNÍ VAZBĚ [§ 67 písm. b) TrŘ] smí přijmout návštěvu pouze s PŘEDCHOZÍM PÍSEMNÝM SOUHLASEM příslušného orgánu činného v trestním řízení (státního zástupce nebo soudce).

§ 9 Kontakt s obhájcem:
Obviněný má právo hovořit s obhájcem bez přítomnosti třetích osob a bez časového omezení.

§ 23 Kázeňské tresty ve vazbě:
a) důtka,
b) zákaz nákupu věcí osobní potřeby s výjimkou hygienických potřeb (až na 3 týdny),
c) umístění do samovazby (nejdéle na 14 DNŮ).`,
    explanation: 'Vazba je zajišťovací institut pro osoby dosud neodsouzené. Obviněný nemůže být nucen pracovat. U koluzní vazby je návštěva a korespondence podmíněna souhlasem OČTŘ. Samovazba ve vazbě činí max. 14 dnů.',
    examTips: 'Rozdíly vazba vs. trest: Návštěvy ve vazbě = 90 minut za 2 týdny (v trestu 3 hodiny měsíčně). Samovazba ve vazbě = max. 14 dnů (v trestu 20 dnů). Obviněný NESMÍ být nucen k práci.',
    category: '293_1993'
  },

  // =========================================================================
  // --- ZÁKON Č. 361/2003 SB., O SLUŽEBNÍM POMĚRU PŘÍSLUŠNÍKŮ BS ---
  // =========================================================================
  {
    id: '361-sluzebni-pomer',
    actNumber: 'Zákon č. 361/2003 Sb.',
    actTitle: 'Zákon o služebním poměru příslušníků bezpečnostních sborů',
    section: '§ 45 – § 55, § 42',
    title: 'Základní povinnosti příslušníka, zákaz stávky, mlčenlivost a kázeňské řízení',
    exactText: `§ 45 Základní povinnosti příslušníka:
Příslušník je povinen:
a) dodržovat služební kázeň a právní předpisy,
b) řídit se pokyny a rozkazy služebních funkcionářů (odmítnout smí jen rozkaz, jehož splněním by spáchal trestný čin),
c) zachovávat mlčenlivost o skutečnostech, o nichž se dozvěděl při výkonu služby, a to i po skončení služebního poměru,
d) zdržet se jednání, které by mohlo ohrozit důvěru v nestrannost výkonu služby,
e) poskytnout pomoc v nebezpečí a zakročit i v době mimo službu, je-li bezprostředně ohrožen život, zdraví nebo majetek.

§ 47 Omezení práv příslušníka:
(1) Příslušník nesmí být členem politické strany ani politického hnutí.
(2) Příslušník nesmí vykonávat jinou výdělečnou činnost (vyjma správy vlastního majetku, činnosti vědecké, pedagogické, publicistické a umělecké).
(3) Příslušník NESMÍ STÁVKOVAT.

§ 51 Kázeňské tresty pro příslušníky:
a) písemná důtka,
b) snížení základního tarifu až o 25 % na dobu až 3 měsíců,
c) odnětí služební medaile,
d) odnětí služební hodnosti (důvod propuštění),
e) propuštění ze služebního poměru.`,
    explanation: 'Služební zákoník upravuje práva, povinnosti a disciplinární odpovědnost příslušníka VS ČR. Stanoví přísná omezení: zákaz členství v politických stranách, zákaz stávky a zákaz podnikání.',
    examTips: 'Zkušební otázky: Kdy smí příslušník odmítnout rozkaz nadřízeného? Pouze tehdy, pokud by jeho splněním spáchal trestný čin! Jaký je max. postih srážkou z platu za kázeňský přestupek? Až 25 % základního tarifu na max. 3 měsíce.',
    category: '361_2003'
  },

  // =========================================================================
  // --- NGŘ Č. 33/2019 VE ZNĚNÍ 8/2022 (VĚZEŇSKÁ A JUSTIČNÍ STRÁŽ) ---
  // =========================================================================
  {
    id: 'ngr-33-streziste',
    actNumber: 'NGŘ č. 33/2019 ve znění 8/2022',
    actTitle: 'Nařízení generálního ředitele VS ČR o vězeňské a justiční stráži',
    section: '§ 35, 36, 79, 80, 81',
    title: 'Druhy strážních stanovišť a povinnosti strážného na věži a vchodu',
    exactText: `DRUHY STRÁŽNÍCH STANOVIŠŤ (§ 36):
- vnější a vnitřní,
- pevná a pohyblivá,
- stálá a dočasná.

STRÁŽNÝ NA STRÁŽNÍ VĚŽI (§ 81):
- Nepřipustit útěk přes střežený úsek ani proniknutí nepovolaných osob,
- Nedovolit nikomu vstup do zakázaného pásma bez doprovodu VISS/ISS/velitele eskorty,
- Zvýšit ostražitost při snížené viditelnosti (mlha, sněžení) a ihned hlásit na operační středisko (OS),
- Vyjít na ochoz strážní věže při hromadných nástupech vězňů s připravenou zbraní,
- Strážní na strážních věžích se NEHLÁSÍ, pouze zdraví stanoveným způsobem!

STRÁŽNÝ U HLAVNÍHO VCHODU (§ 80):
- Převzít klíče, Knihu příchodů/odchodů, propustky, VIS, uložené zbraně a prověřit funkčnost spojení a signalizace,
- Zákaz propouštět vězněné osoby bez souhlasu VISS,
- Zákaz otevírat současně vnitřní a vnější dveře (katr) – systém autoblok,
- Zákaz otevírat vstup bez zajištění dalším příslušníkem.`,
    explanation: 'Základní pravidla strážní služby ve věznici. Důraz je kladen na nepřetržitost střežení, správnou výzbroj a zákaz svévolného opuštění stanoviště.',
    examTips: 'Chyták u zkoušky: Hlásí se strážný na věži při příchodu nadřízeného? NE! Strážný na věži se nehlásí, pouze zdraví stanoveným způsobem, aby neztrácel přehled o střeženém úseku.',
    category: 'ngr_33_2019'
  },
  {
    id: 'ngr-33-zbrane-nosit',
    actNumber: 'NGŘ č. 33/2019 ve znění 8/2022',
    actTitle: 'Pravidla nošení, nabíjení a vybíjení zbraní ve VS ČR',
    section: '§ 16, 17, 19',
    title: 'Nošení zbraní a postup při nabíjení a vybíjení (Lapač střel)',
    exactText: `NOŠENÍ ZBRANÍ (§ 16 a § 17):
- Pistole CZ 75: v pouzdře na pravém boku (levák na levém) tak, aby osa hlavně kryla střed nohavice, pouzdro zapnuto. Zásobník na opačné straně opasku.
- Samopal vz. 58, CZ Scorpion EVO 3A1, útočná puška CZ 805 BREN A2:
  * při dvoubodovém popruhu zavěšeny na rameni HLAVNÍ VZHŮRU,
  * se sklopenou ramenní opěrkou nebo jednobodovým popruhem HLAVNÍ DOLŮ.
- Ve vozidle: pažba opřena o podlahu, hlaveň směřuje VZHŮRU.
- V ponosu před tělem s odklopenou ramenní opěrkou: na strážní věži z ochozu a při kruhovém střežení.

NABÍJENÍ A VYBÍJENÍ (§ 19):
- Provádí se na povel na určeném bezpečném místě s vybíjecím zařízením (lapačem střel). Ústí hlavně VŽDY směřuje do lapače!
- Povel „K prohlídce zbraň, jednotlivě NABÍJET!“ → prohlídka zbraně (bez zásobníku a náboje) → spuštění závěru → rána jistoty → zasunutí zásobníku (náboj se do komory nezasouvá) → zajištění → hlášení: „ZBRAŇ NABITA“.
- Povel „Jednotlivě vybíjet, K PROHLÍDCE ZBRAŇ!“ → vyjmutí zásobníku → natažení závěru do zadní polohy → vizuální kontrola komory velícím → spuštění závěru → rána jistoty → zajištění → hlášení: „ZBRAŇ VYBITA“. Velící příslušník nabíjí/vybíjí svou zbraň jako POSLEDNÍ.`,
    explanation: 'Bezpečnostní manipulace se zbraněmi je přísně formalizována povely a kontrolou v lapači střel, aby se zabránilo nechtěnému výstřelu.',
    examTips: 'Zkušební komise kontroluje: Kdo nabíjí jako poslední? Velící příslušník / VISS. Zasunuje se náboj do komory při běžném nabíjení do služby? NIKDY (pouze zásobník do zbraně).',
    category: 'ngr_33_2019'
  },
  {
    id: 'ngr-33-prohlidky-druhy',
    actNumber: 'NGŘ č. 33/2019 ve znění 8/2022',
    actTitle: 'Prohlídky a komisionální prověrky bezpečnosti',
    section: '§ 88, 89, 90, 91, 94, 95, 96',
    title: 'Druhy prohlídek, lhůty a metodický postup',
    exactText: `DRUHY PROHLÍDEK (§ 89):
1. Generální – min. 1x ročně v rozsahu celé věznice (nařízení ředitele věznice), součástí je osobní prohlídka všech vězňů.
2. Dílčí – nejméně 1x do 90 DNŮ od předchozí prohlídky příslušného prostoru (včetně samostatných oddílů). Za přítomnosti 1 vězně z cely.
3. Technická:
   - v celách eskortních středisek: 2x TÝDNĚ,
   - v eskortních místnostech soudů a eskortních vozidlech: 1x MĚSÍČNĚ.
4. Osobní (důkladná, preventivní, prohlídka těla).
5. Prohlídka věcí a zavazadel (do balíku/zavazadla příslušník NESAHÁ, obsah vyjímá kontrolovaná osoba, max. 5 kg).
6. Speciální – za využití služebního psa na drogy/OPL (neprovádí se za přítomnosti dětí).

DŮKLADNÁ OSOBNÍ PROHLÍDKA (§ 94, 95):
- Vězeň se svléká do spodního prádla (oddělená místnost, stejné pohlaví, hygienické rukavice).
- Prohlídka těla: ústní dutina, podpaží, uši, nos, dlaně, chodidla.
- Prohlédne se horní část těla → vězeň se zahalí → prohlédne se spodní část těla a genitálie → kontrola konečníku detektorem/dřepy.
- Do naha se svléká pouze z bezpečnostních důvodů (Index nebezpečných osob / Karta bezpečnostních opatření).`,
    explanation: 'Prohlídky jsou klíčovým prvkem prevence úniků a pronikání nedovolených předmětů. Novela 8/2022 upravila lhůtu dílčích prohlídek na 90 dnů.',
    examTips: 'Lhůty k zapamatování: Dílčí prohlídka = do 90 dnů. Technická prohlídka cel sběrného střediska = 2x týdně. Technická prohlídka eskortních cel u soudu = 1x měsíčně. Max. váha balíčku = 5 kg.',
    category: 'ngr_33_2019'
  },
  {
    id: 'eskorty-metodika-kupec',
    actNumber: 'Služební předpis & Metodika',
    actTitle: 'Eskortní služba a eskortní dokumentace (Kupec / NGŘ 33/2019)',
    section: '§ 38–47, § 72–76',
    title: 'Druhy eskort, stupně poutání (DP1–DP3), eskortní vaky a mimořádné události',
    exactText: `STUPNĚ POUTÁNÍ PŘI ESKORTĚ:
- DP1: Pouta na ruce.
- DP2: Pouta s poutacím opaskem.
- DP3: Pouta s poutacím opaskem + nožní pouta.
Předváděcí řetízky se přikládají VŽDY ZA POUTA na ruku na straně, kde příslušník NEMÁ zbraň.

DOKUMENTACE ESKORTY:
- Propustka (běžné eskorty – lékař, soud),
- Eskortní příkaz (přemístění mezi věznicemi, podepisuje ředitel věznice),
- Identifikační karta vězně (IKV),
- Zdravotní dokumentace v zapečetěné obálce s nápisem „OTEVŘE LÉKAŘ“,
- Eskortní vaky s osobními věcmi zapečetěné očíslovanou plastovou pečetí.

ZÁSADY VE VOZIDLE A PŘI POHYBU:
- Eskortovaní nesmějí sedět bezprostředně za řidičem.
- Vstup a výstup zásadně v zástupu za kruhového střežení.
- Při dopravní nehodě eskortní vozidlo se zvlášť nebezpečnými pachateli (ZVÝŠENÁ OSTRAHA / DOŽIVOTÍ) NEZASTAVUJE na místě a pokračuje v jízdě (nutná obrana / krajní nouze), nehoda se šetří až ve věznici.
- Léky na eskortě: vydává se max. dávka na 1 DEN; sprej k okamžitému použití (BEROTEC) má u sebe velitel eskorty!`,
    explanation: 'Eskortní činnost je nejrizikovějším výkonem služby. Přesná dokumentace, dodržení bezpečnostních stupňů DP1–DP3 a kruhového střežení chrání před napadením a útěkem.',
    examTips: 'Zkušební otázky: Jaká dávka léků se vydává na eskortu? Max. na 1 den. Kdo má u sebe sprej na astma? Velitel eskorty. Kdy eskortní vozidlo po nehodě nezastavuje a pokračuje? U vězňů z věznice se zvýšenou ostrahou nebo doživotních trestů za splnění podmínek nutné obrany/krajní nouze.',
    category: 'ngr_33_2019'
  },

  // =========================================================================
  // --- JUSTIČNÍ STRÁŽ (INSTRUKCE MS 8/2022 & METODIKA) ---
  // =========================================================================
  {
    id: 'js-instrukce-8-2022',
    actNumber: 'Instrukce MS ČR č. 8/2022',
    actTitle: 'Instrukce Ministerstva spravedlnosti o justiční stráži',
    section: '§ 1–8, § 114–152 NGŘ',
    title: 'Organizace Justiční stráže, režim vstupů u soudů, doručování písemností a přeprava cenin',
    exactText: `ORGANIZACE A VELENÍ JS:
- V čele místní jednotky je Vrchní inspektor justiční stráže (VIJS), jednotky v oblasti řídí Vedoucí oddělení justiční stráže (VOJS) podřízený řediteli věznice.
- Vstup se zbraní zakázán. VÝJIMKY ze zákazu zbraní: soudci a příslušníci ozbrojených sil/sborů při plnění služebních povinností.
- VÝJIMKY z bezpečnostní prohlídky: státní zástupci, advokáti, notáři a soudní exekutoři po předložení platného průkazu (pokud předseda soudu nestanoví jinak).

PŘEPRAVA CENIN A PENĚŽNÍCH HOTOVOSTÍ (§ 144):
- Přepravu provádějí zpravidla 2 příslušníci JS.
- ZÁSADA: Zavazadlo s finanční hotovostí nese VÝHRADNĚ zaměstnanec soudu/SZ/ministerstva, NIKDY příslušník justiční stráže! Příslušníci provádějí pouze ozbrojené krytí.

DORUČOVÁNÍ PÍSEMNOSTÍ (§ 146):
- Obálka typu I (červený pruh): Do vlastních rukou s možností náhradního doručení (fikce doručení nastává 10. dnem, poté vhození do schránky).
- Obálka typu II (zelený pruh): Do vlastních rukou s VYLOUČENÍM vložení do schránky (platební rozkaz, trestní příkaz) – po 10 dnech se vrací soudu, FIKCE DORUČENÍ NENASTÁVÁ!
- Obálka typu III: Obyčejné/jiné doručování s doručenkou.`,
    explanation: 'Justiční stráž zajišťuje bezpečnost soudů, státních zastupitelství a ministerstva. Stanoví přesná pravidla pro kontrolu osob, přepravu peněz a asistenci soudním vykonavatelům.',
    examTips: 'Zásadní otázky JS: 1. Smí příslušník JS nést tašku s penězi při přepravě cenin z banky? NIKDY, nese ji pouze pokladník/zaměstnanec soudu. 2. Nastává fikce doručení u obálky typu II? NIKDY nenastává.',
    category: 'justicni_straz'
  },

  // =========================================================================
  // --- NGŘ Č. 16/2022 O MIMOŘÁDNÝCH UDÁLOSTECH ---
  // =========================================================================
  {
    id: 'ngr-16-mimoradne-udalosti',
    actNumber: 'NGŘ č. 16/2022',
    actTitle: 'Nařízení generálního ředitele VS ČR o mimořádných událostech (Hlásná služba)',
    section: '§ 1–19, Přílohy 1–2',
    title: 'Kategorizace mimořádných událostí (závažné vs. ostatní) a hlásné lhůty',
    exactText: `ZÁVAŽNÉ MIMOŘÁDNÉ UDÁLOSTI (§ 5):
a) Útěk, pokus o útěk, prokazatelná příprava k útěku vězněné osoby,
b) Napadení eskorty, střeženého objektu nebo strážního stanoviště,
c) Vražda, pokus o vraždu, těžké ublížení na zdraví zaměstnance nebo vězně,
d) Vzpoura, hromadné odmítání stravy ohrožující bezpečnost,
e) Plán vyrozumění a svozu (součinnost s PČR a IZS),
f) Akutní ohrožení života/zdraví (požár, ekologická havárie),
g) Ztráta, odcizení nebo nález střelné zbraně, munice, výbušnin, vloupání do zbrojního skladu,
h) Použití střelné zbraně,
i) Výbuch, nález výbušniny nebo nástražného výbušného systému (NVS),
j) Anonymní oznámení o uložení výbušniny.

OSTATNÍ MIMOŘÁDNÉ UDÁLOSTI (§ 6):
- Dokonaná sebevražda (po konstatování smrti lékařem), pokus o sebevraždu s přímým ohrožením života,
- Úmrtí vězněné osoby nebo zaměstnance,
- Individuální hladovka vyžadující lůžkovou péči a její ukončení,
- Zneužití volného pohybu / neoprávněné opuštění nestřeženého pracoviště,
- Nález drog, alkoholu, nepovoleného mobilního telefonu nebo SIM karty,
- Fyzické napadení zaměstnance (mimo závažné dle § 5),
- Narušení vzdušného prostoru věznice DRONEM (bezpilotním prostředkem).

HLÁSNÉ LHŮTY:
- Telefonicky neprodleně stálé službě GŘ VS ČR a dozorovému státnímu zástupci.
- Písemná zpráva ředitele věznice v ETŘ: nejpozději do 3 PRACOVNÍCH DNŮ.
- Informační zpráva pro ministra: v pracovní dny následující den do 07:30 hod.`,
    explanation: 'Předpis stanoví taxativní rozdělení mimořádných událostí a přísný řetězec vyrozumění stálé služby GŘ VS ČR, Generální inspekce (GIBS) a dozorujícího státního zástupce.',
    examTips: 'Chyták: Je nález mobilního telefonu závažnou, nebo ostatní mimořádnou událostí? Je to OSTATNÍ mimořádná událost dle § 6 písm. g). Útěk nebo použití střelné zbraně je ZÁVAŽNÁ MU dle § 5.',
    category: 'ngr_16_2022'
  },

  // =========================================================================
  // --- NGŘ Č. 24/2022 O PŘEDCHÁZENÍ NÁSILÍ A KATEGORIÍCH VĚZŇŮ ---
  // =========================================================================
  {
    id: 'ngr-24-predchazeni-nasili',
    actNumber: 'NGŘ č. 24/2022',
    actTitle: 'Nařízení GŘ VS ČR o předcházení, zabránění a včasném odhalování násilí',
    section: '§ 1–25, Přílohy 1–5',
    title: 'Kategorie vytypovaných vězněných osob (STH, NMU, MON, MPN, DVO, DVO-P)',
    exactText: `KATEGORIE VĚZNĚNÝCH OSOB V SEZNAMU (§ 3):
1. STH – Snížená tělesná hmotnost (podváha dle indexu BMI). Určuje LÉKAŘ při vstupní prohlídce, schvaluje VOVT.
2. NMU – Zjevně nízká mentální úroveň. Určuje PSYCHOLOG na základě odborného posouzení, schvaluje VOVT.
3. MON – Možný objekt násilí (zranitelná osoba, obvinění za mravnostní delikty, týrání dětí). Navrhují zaměstnanci, schvaluje VOVT.
4. MPN – Možný pachatel násilí (sklony k agresi, násilná minulost). Navrhují zaměstnanci, schvaluje VOVT.
   *ZÁSADA: MPN se zpravidla neumísťuje do cely/ložnice s STH, NMU, MON a DVO!*
5. DVO – Další vytypovaná osoba (medializované kauzy, osoby známé z veřejného a politického života). Navrhuje VOVT, schvaluje a písemně odůvodňuje ŘEDITEL VĚZNICE.
6. DVO-P – Další vytypovaná osoba s výkonem profese (v posledních 5 letech před nástupem byl příslušníkem Policie ČR, VS ČR, BIS, Celní správy, GIBS, vojákem AČR, strážníkem MP). Rozhoduje ŘEDITEL VĚZNICE.

OPATŘENÍ A PROHLÍDKY:
- U osob STH, NMU, MON, DVO a DVO-P se provádí prohlídka těla na stopy násilí 1x TÝDNĚ (u obviněných při koupání, u odsouzených při osobních prohlídkách).
- Skartační lhůty: Záznamy o fyzickém násilí = 5 let (S 5). Seznamy k prohlídce těla = 3 roky (S 3).`,
    explanation: 'Systém prevence násilí zabraňuje viktimizaci zranitelných vězňů a incidentům mezi rizikovými skupinami (např. bývalí policisté v kategorii DVO-P nesmí přijít do kontaktu s běžnou vězeňskou populací).',
    examTips: 'Kdo rozhoduje o zařazení do DVO a DVO-P? Výhradně ŘEDITEL VĚZNICE. Kdo určuje STH? Lékař. Kdo určuje NMU? Psycholog. Jak často se kontrolují stopy násilí? 1x týdně.',
    category: 'ngr_24_2022'
  },

  // =========================================================================
  // --- METODIKA POUTÁNÍ A POUŽITÍ DP (Kupec) ---
  // =========================================================================
  {
    id: 'metodika-poutani-postupy',
    actNumber: 'Metodická příručka VS ČR',
    actTitle: 'Využití donucovacích prostředků k poutání v rámci VS ČR (Kupec)',
    section: 'Taktika poutání na ruce, nohy a poutacího opasku',
    title: 'Taktické zásady nasazování a snímání pout, opasku a nožních pout',
    exactText: `ZÁKLADNÍ TAKTICKÉ ZÁSADY POUTÁNÍ:
1. Pozice příslušníka: Příslušník NIKDY nestojí v ose vězně, ale mimo ni.
2. Krytí zbraně: Příslušník mající služební zbraň na pravém boku se k vězněné osobě natáčí LEVÝM BOKEM (odvrací zbraň od dosahu vězně).
3. Směr zámků: Zámky pout a visacích zámků směřují VŽDY K TĚLU vězněné osoby, aby si je nemohla sama odemknout nebo do nich zasahovat.
4. Pojistka: U svěracích pout se vždy aktivuje pojistka trnem na klíčku („lusknutí“ palcem proti prostředníku), aby nedošlo k nechtěnému zaškrcení zápěstí.
5. Poutací opasek:
   - Přikládá se odzadu do oblasti pasu nad pánev na co nejméně svršků (NIKDY přes zimní kabát či bundu!).
   - Vězeň si opasek NIKDY nenasazuje sám.
   - Řetízek se provléká třmenem ODSHORA (odspodu by vypadl).
6. Kombinace s nožními pouty (PO + P + NP):
   - Nasadí se jistící pouta na ruce.
   - Poutací opasek se nasadí ve stoje.
   - Nožní pouta se nasazují VKLEČE na židli/lavici na holé nohy nad kotníky. Zámky nožních pout směřují K ZEMI (ochrana achilovky a zamezení manipulace).
   - Jistící pouta se po dokončení úkonu sejmou. Při rozpoutávání se jistící pouta nasazují jako PRVNÍ!`,
    explanation: 'Přesný metodický postup zamezuje odzbrojení příslušníka, napadení kolenem či hlavou a sebepoškození vězně příliš utaženými pouty.',
    examTips: 'Časté chyby u praktické zkoušky: Příslušník stojí přímo před vězněm, natočí se k vězni bokem se zbraní, zapomene aktivovat pojistku na poutech, nebo nasazuje opasek přes bundu.',
    category: 'poutani'
  },

  // =========================================================================
  // --- METODIKA KONTROL VSTUPŮ A VJEZDŮ ---
  // =========================================================================
  {
    id: 'metodika-vstupy-vjezdy-2020',
    actNumber: 'Metodický list GŘ VS ČR 2020',
    actTitle: 'Metodika činnosti VS při kontrole osob a vozidel na vchodech a vjezdech',
    section: 'Vstupní a vjezdový koš, rentgen, detektory',
    title: 'Technologické zabezpečení vchodů, detektor tepové frekvence a zásady prohlídek',
    exactText: `ZABEZPEČENÍ VSTUPNÍHO A VJEZDOVÉHO KOŠE:
- Vstupní koš: vymezen vstupním katrem a katrem do věznice. Pohyb zásadně JEDNOSMĚRNÝ. Počet osob stanoven vnitřním řádem.
- Autoblok: systém znemožňující současné otevření vnějšího a vnitřního katru.
- Zásada kontroly zavazadel: Do zavazadel příslušník ZÁSADNĚ NESAHÁ! Vyzve vstupující osobu, aby obsah sama vyjmula a předložila ke kontrole rentgenem (RTG) či vizuálně.
- Kardiostimulátor: Osoba s kardiostimulátorem neprochází rámem bez zastavení, nepřejíždí se opakovaně ručním detektorem přes přístroj. Provádí se alternativní ruční kontrola po předložení identifikační karty přístroje.

KONTROLA VOZIDEL A DETEKTOR TEPOVÉ FREKVENCE (Heartbeat detector):
- Používá se k odhalení skrytých osob v nákladovém prostoru.
- Postup při měření:
  1. Řidič vypne motor vozidla,
  2. Zavřou se všechna okna a dveře vozidla,
  3. Všichni vystoupí mimo vozidlo,
  4. Umístí se seismické senzory na přední a zadní rám vozidla + zemní senzor,
  5. Spustí se měřicí cyklus na vyhodnocovacím PC.`,
    explanation: 'Moderní technická zařízení (RTG s rozlišením organických/anorganických látek, detektory tepové frekvence a detekční rámy) tvoří hlavní bariéru proti vnášení zbraní, drog a útěkům ve vozidlech.',
    examTips: 'Co se musí udělat před spuštěním detektoru tepové frekvence u vozidla? Vypnout motor, zavřít všechna okna i dveře, všichni musí vystoupit z vozidla a senzory se umístí na rám.',
    category: 'vstupy_vjezdy'
  },

  // =========================================================================
  // --- POŘADOVÁ PŘÍPRAVA A SLUŽEBNÍ ZDVOŘILOST (NGŘ 38/2018) ---
  // =========================================================================
  {
    id: 'ngr-38-2018-poradova',
    actNumber: 'NGŘ č. 38/2018',
    actTitle: 'Pravidla služební zdvořilosti a pořadová příprava ve VS ČR',
    section: '§ 1–15, Pravidla vystupování a povely',
    title: 'Služební zdvořilost, úprava zevnějšku, hodnosti a povely pořadové přípravy',
    exactText: `ÚPRAVA ZEVNĚJŠKU PŘÍSLUŠNÍKA:
- Vlasy: vzadu nepřesahují límec košile, vpředu linii obočí, po stranách ušní boltce. Zákaz extravagantních účesů (dredy, vyholované obrazce, pastelové barvy).
- Vousy: nad horním rtem do úrovně koutků úst, upravená bradka, plnovous nepřesahuje límec.
- Tetování a piercing: ZÁKAZ tetování na celé hlavě, krku, prstech nebo hřbetu ruky. Zákaz piercingu. Viditelné tetování nesmí obsahovat extremistické či vulgární motivy.

HODNOSTNÍ SBORY:
- Praporčické: rotný, strážmistr, nadstrážmistr, podpraporčík, praporčík, nadpraporčík.
- Důstojnické: podporučík, poručík, nadporučík, kapitán, major, podplukovník, plukovník.
- Generálské: brigádní generál, generálmajor, generálporučík.

KDY PŘÍSLUŠNÍK NEZDRAVÍ A NEPODÁVÁ HLÁŠENÍ:
1. Při provádění služebního zákroku nebo úkonu (např. osobní prohlídka),
2. Při řízení služebního vozidla nebo obsluze stroje,
3. Při obsluze spojovacích a signálně zabezpečovacích prostředků na operačním středisku,
4. Při odstraňování následků havárií a záchranných pracích,
5. Na strážním stanovišti, má-li zbraň v ponosu připravenou k okamžitému použití,
6. Při výcviku na přímý povel (při střelbách, sebeobraně),
7. Při jídle a osobní hygieně.

ZÁKLADNÍ POVELY:
- „POZOR!“: základní postoj (paty u sebe, špičky rozevřené, ruce v pěst podél těla, vzpřímené tělo).
- „Čelem - VZAD!“: obrat o 180° na podpatku levé nohy a špičce pravé nohy proti směru hodinových ručiček na dvě doby.
- „Pochodem - V CHOD!“: vykročení LEVOU nohou pochodovým krokem.
- „Zastavit - STÁT!“: povel při došlapu levé nohy → ještě jeden krok pravou → přísun levé do základního postoje.
- „VYSTUPTE!“: odpověď „ZDE“ → „PROVEDU“ → 2 kroky vpřed před čelo tvaru → obrat k nadřízenému.`,
    explanation: 'Pravidla vystupování, stejnokrojové kázně a pořadové přípravy reprezentují čest a autoritu bezpečnostního sboru VS ČR.',
    examTips: 'Otázky: Kterou nohou se vykračuje na povel Pochodem v chod? Levou nohou. Kdy se velí povel Zastavit stát? Při došlapu levé nohy. Kdy příslušník nezdraví? Při služebním zákroku, řízení vozidla, obsluze operačního střediska, se zbraní v ponosu.',
    category: 'poradova_sluzebni'
  },

  // =========================================================================
  // --- ÚSTAVA ČR (1/1993 SB.) & LISTINA ZÁKLADNÍCH PRÁV A SVOBOD (2/1993 SB.) ---
  // =========================================================================
  {
    id: 'ustava-lzps-prehled',
    actNumber: 'Ústavní zákon č. 1/1993 Sb. & č. 2/1993 Sb.',
    actTitle: 'Ústava České republiky a Listina základních práv a svobod',
    section: 'Ústava čl. 1–15, 54, 81; LZPS čl. 1–8, 14, 27, 39, 40',
    title: 'Ústavní základy ČR, dělba moci a katalog základních lidských práv a svobod',
    exactText: `ÚSTAVA ČESKÉ REPUBLIKY (1/1993 Sb.):
- Čl. 1: Česká republika je svrchovaný, jednotný a demokratický právní stát založený na úctě k právům a svobodám člověka a občana.
- Čl. 2 odst. 3: Státní moc slouží všem občanům a lze ji uplatňovat jen v případech, v mezích a způsoby, které stanoví zákon.
- Čl. 2 odst. 4: Každý občan může činit, co není zákonem zakázáno, a nikdo nesmí být nucen činit, co zákon neukládá.
- Dělba moci:
  1. Moc zákonodárná: Parlament ČR (Poslanecká sněmovna 200 poslanců na 4 roky – volby poměrným systémem od 21 let; Senát 81 senátorů na 6 let – volby většinovým systémem od 40 let, každé 2 roky obměna 1/3).
  2. Moc výkonná: Prezident republiky (přímá volba na 5 let, max. 2 po sobě jdoucí období, neodpovědný z výkonu funkce; pravomoci samostatné čl. 62 a s kontrasignací předsedy vlády čl. 63) a Vláda ČR (vrcholný orgán výkonné moci odpovědný PS).
  3. Moc soudní: Nezávislé soudy (soustava: okresní, krajské, vrchní, Nejvyšší soud a Nejvyšší správní soud se sídlem v Brně). Ústavní soud ČR (15 soudců na 10 let, sídlo v Brně) jako orgán ochrany ústavnosti.

LISTINA ZÁKLADNÍCH PRÁV A SVOBOD (2/1993 Sb.):
- Čl. 1: Základní práva a svobody jsou nezadatelná, nezcizitelná, nepromlčitelná a nezrušitelná.
- Čl. 6: Každý má právo na život. Trest smrti se nepřipouští.
- Čl. 7 odst. 2: Nikdo nesmí být mučen ani podroben krutému, nelidskému nebo ponižujícímu zacházení nebo trestu (absolutní zákaz).
- Čl. 8: Osobní svoboda je zaručena. Zadržená osoba musí být nejpozději do 48 hodin propuštěna na svobodu nebo odevzdána soudu. Soudce musí zadrženou osobu do 24 hodin od převzetí vyslechnout a rozhodnout o vazbě nebo propustit na svobodu.
- Čl. 14: Svoboda pohybu a pobytu (ze zákona omezena ve výkonu vazby a trestu).
- Čl. 39: Jen zákon stanoví, které jednání je trestným činem a jaký trest lze uložit (zásada nullum crimen sine lege, nulla poena sine lege).
- Čl. 40: Jen soud rozhoduje o vině a trestu. Presumpce neviny a zákaz retroaktivity v neprospěch pachatele.`,
    explanation: 'Ústava a Listina tvoří vrchol právního řádu ČR (ústavní pořádek). Pro příslušníky VS ČR je stěžejní zásada legality výkonu státní moci (čl. 2 odst. 3), absolutní zákaz mučení a nelidského zacházení (čl. 7 odst. 2) a lhůty zbavení svobody (48 hodin zadržení + 24 hodin soud).',
    examTips: 'Otázky k maturitě/zkoušce ZOP A: 1. Kolik poslanců a senátorů má Parlament ČR? (200 poslanců na 4 roky, 81 senátorů na 6 let). 2. Kde sídlí Ústavní soud? (V Brně). 3. Jaké jsou lhůty zadržení? (Do 48 hodin k soudu, soudce do 24 hodin rozhodne o vazbě). 4. Může být v ČR obnoven trest smrti? (Ne, čl. 6 odst. 3 LZPS jej výslovně zakazuje).',
    category: 'ustava_lzps'
  },

  // =========================================================================
  // --- TRESTNÍ ZÁKONÍK (40/2009 SB.) & TRESTNÍ ŘÁD (141/1961 SB.) ---
  // =========================================================================
  {
    id: 'trestni-pravo-kodexy',
    actNumber: 'Zákon č. 40/2009 Sb. & č. 141/1961 Sb.',
    actTitle: 'Trestní zákoník (TZ) a Trestní řád (TrŘ)',
    section: 'TZ § 13, 14, 28–32, 127, 138, 329, 344; TrŘ § 12, 67, 76',
    title: 'Základy trestní odpovědnosti, okolnosti vylučující protiprávnost a stádia řízení',
    exactText: `TRESTNÍ PRÁVO HMOTNÉ (TZ č. 40/2009 Sb.):
- Trestný čin (§ 13 odst. 1): Protiprávní čin, který trestní zákon označuje za trestný a který vykazuje znaky uvedené v takovém zákoně.
- Dělení TČ (§ 14): Přečiny (všechny nedbalostní TČ a úmyslné s horní hranicí sazby do 5 let) a Zločiny (ostatní TČ; zvlášť závažné zločiny = úmyslné s horní hranicí sazby nejméně 10 let).
- Okolnosti vylučující protiprávnost (Hlava III):
  • § 28 Krajní nouze: odvracení přímo hrozícího nebezpečí, subsidiarita (nešlo odvrátit jinak), proporcionalita (následek nesmí být stejný ani závažnější), neplatí pro osoby povinné nebezpečí snášet.
  • § 29 Nutná obrana: odvracení přímo hrozícího nebo trvajícího útoku, obrana nesmí být zcela zjevně nepřiměřená způsobu útoku.
  • § 30 Svolení poškozeného: dispozitivní práva, zákaz k usmrcení (eutanazie vyloučena) a ublížení na zdraví (vyjma lékařských zákroků).
  • § 31 Přípustné riziko: společensky prospěšná činnost v rámci povolání/výzkumu.
  • § 32 Oprávněné použití zbraně: v mezích zvláštního zákona (např. § 18–21 z. 555/1992 Sb.).
- Hranice výše škody (§ 138 TZ po novele č. 333/2020 Sb.):
  1. Škoda nikoli nepatrná: min. 10 000 Kč (hranice TČ / přestupek)
  2. Škoda nikoli malá: min. 50 000 Kč
  3. Větší škoda: min. 100 000 Kč
  4. Značná škoda: min. 1 000 000 Kč
  5. Škoda velkého rozsahu: min. 10 000 000 Kč
- Úřední osoba (§ 127): Příslušník bezpečnostního sboru (VS ČR, PČR) požívá zvýšené ochrany při výkonu pravomoci.
- Specifické TČ ve vězeňství:
  • § 329 Zneužití pravomoci úřední osoby (úmyslné porušení povinnosti k opatření prospěchu/škody)
  • § 330 Maření úkolu úřední osoby z nedbalosti
  • § 344 Vzpoura vězňů (násilné vymáhání propuštění, úlev nebo neuposlechnutí příkazů)
  • § 398 Porušení služební povinnosti příslušníka bezpečnostního sboru

TRESTNÍ PRÁVO PROCESNÍ (TrŘ č. 141/1961 Sb.):
- OČTŘ (§ 12 odst. 1): Soud, státní zástupce, policejní orgán (včetně pověřených orgánů VS ČR).
- Důvody vazby (§ 67): a) útěková, b) koluzní (působení na svědky – max. 3 měsíce), c) předstižná (opakování trestné činnosti).
- Stádia trestního řízení: 1. Přípravné řízení, 2. Předběžné projednání obžaloby, 3. Hlavní líčení, 4. Opravné řízení (odvolání, stížnost, odpor), 5. Vykonávací řízení.`,
    explanation: 'Ucelený přehled trestního práva pro zaměstnance VS ČR. Definuje hranice mezi trestným činem a přestupkem (10 000 Kč), pravidla sebeobrany a použití zbraně, specifické trestné činy ve vězeňství a procesní pravidla vazby.',
    examTips: 'Zkušební body: 1. Jaká je hranice pro trestný čin krádeže? Nejméně 10 000 Kč. 2. Jaký je rozdíl mezi nutnou obranou a krajní nouzí? Nutná obrana směřuje proti útočníkovi (člověku) a může způsobit větší škodu; krajní nouze směřuje proti nebezpečí a způsobená škoda musí být MENŠÍ než hrozící. 3. Jaké jsou důvody vazby? Útěková, koluzní, předstižná (§ 67 TrŘ).',
    category: 'trestni_pravo'
  },

  // =========================================================================
  // --- SOUDNICTVÍ VE VĚCECH MLÁDEŽE (ZÁKON Č. 218/2003 SB.) ---
  // =========================================================================
  {
    id: 'zsm-218-2003-komplet',
    actNumber: 'Zákon č. 218/2003 Sb.',
    actTitle: 'Zákon o odpovědnosti mládeže za protiprávní činy a soudnictví ve věcech mládeže (ZSM)',
    section: '§ 1–35, 47, 70, 93',
    title: 'Trestní odpovědnost mládeže, katalog opatření a specifika řízení a vazby',
    exactText: `ZÁKLADNÍ ROZDĚLENÍ (§ 2 ZSM):
- Dítě mladší 15 let: Není trestně odpovědné. Spáchá-li čin, jde o „čin jinak trestný“. Řízení vede soud pro mládež dle občanského soudního řádu (OSŘ). Ukládají se opatření dle § 93 (výchovná povinnost, výchovné omezení, napomenutí s výstrahou, dohled probačního úředníka, ochranná výchova, ochranné léčení).
- Mladistvý (15–18 let): Má relativní trestní odpovědnost (podmíněnou rozumovou a mravní vyspělostí § 5). Spáchaný trestný čin se nazývá „provinění“. V řízení má vždy nutnou obhajobu (§ 42a).

KATALOG OPATŘENÍ UKLÁDANÝCH MLADISTVÝM (§ 10 ZSM):
1. Výchovná opatření (§ 15–20):
   a) dohled probačního úředníka,
   b) probační program (sociální výcvik, schvaluje ministr spravedlnosti),
   c) výchovné povinnosti (např. bydlet s rodiči, nahradit škodu, společensky prospěšná činnost max. 60 hodin celkem / 4 hod denně),
   d) výchovná omezení (zákaz nevhodného prostředí, osob, návykových látek),
   e) napomenutí s výstrahou.
2. Ochranná opatření (§ 21–23):
   a) ochranné léčení,
   b) zabezpečovací detence,
   c) zabrání věci a zabrání části majetku,
   d) ochranná výchova (ukládá se ve zvláštních výchovných zařízeních, trvá nejdéle do 18 let, výjimečně lze prodloužit do 19 let).
3. Trestní opatření (§ 24–35):
   a) obecně prospěšné práce (poloviční sazba oproti dospělým),
   b) peněžité opatření (10–365 denních sazeb, sazba 100–5 000 Kč),
   c) peněžité opatření s podmíněným odkladem,
   d) propadnutí věci,
   e) zákaz činnosti (max. na 5 let),
   f) vyhoštění (1 až 5 let),
   g) domácí vězení (poloviční sazba),
   h) zákaz vstupu na sportovní/kulturní akce (max. 5 let),
   i) odnětí svobody podmíněné a podmíněné s dohledem (zkušební doba 1–3 roky),
   j) odnětí svobody nepodmíněné (trestní sazby se snižují na polovinu, horní hranice max. 5 let, dolní 1 rok; u činů s výjimečným trestem 5–10 let).

VAZBA MLADISTVÉHO (§ 47 ZSM):
- Vazba smí trvat nejdéle 2 měsíce (u zvlášť závažných provinění nejdéle 6 měsíců).
- Prodloužit lze výjimečně pouze jednou v přípravném řízení a jednou v řízení před soudem o další 2 měsíce (resp. 6 měsíců).

ODKLONY V ŘÍZENÍ:
- Odstoupení od trestního stíhání (§ 70 ZSM): U provinění s horní hranicí sazby do 3 let může soud nebo státní zástupce odstoupit od stíhání pro nedostatek veřejného zájmu, nahradil-li mladistvý škodu nebo vykonal probační program.`,
    explanation: 'Zákon o soudnictví ve věcech mládeže upřednostňuje výchovné působení, restorativní justici a odklony před represí. Výkon nepodmíněného odnětí svobody se vykonává odděleně od dospělých ve věznicích pro mladistvé (např. Věznice Všehrdy).',
    examTips: 'Zásadní otázky ze ZSM: 1. Jaké jsou 3 kategorie opatření pro mladistvé? Výchovná, ochranná, trestní. 2. Jak se krátí trestní sazby u mladistvých? Na polovinu, s horní hranicí 5 let (výjimečně 10 let). 3. Jak dlouho smí trvat vazba mladistvého? Max. 2 měsíce (u ZZZ max. 6 měsíců). 4. Do kdy trvá ochranná výchova? Do 18 let, výjimečně do 19 let.',
    category: 'zsm_mladez'
  },

  // =========================================================================
  // --- MEZINÁRODNÍ STANDARDY (CPT & PRAVIDLA NELSONA MANDELY OSN) ---
  // =========================================================================
  {
    id: 'mezinarodni-standardy-cpt-mandela',
    actNumber: 'Standardy CPT & Rezoluce OSN 70/175',
    actTitle: 'Standardy Evropského výboru pro zabránění mučení (CPT) a Pravidla Nelsona Mandely OSN',
    section: 'CPT zprávy 1992–2004 & Mandela Rules 1–122',
    title: 'Mezinárodní standardy zacházení s vězněnými osobami, materiální podmínky a lidská důstojnost',
    exactText: `STANDARDY CPT (Evropský výbor pro zabránění mučení Rady Evropy):
1. Tři základní záruky od okamžiku zadržení policií:
   a) Právo vyrozumět třetí osobu (rodinu, přítele, konzulát) o zadržení,
   b) Právo na přístup k právnímu zástupci (důvěrný kontakt bez přítomnosti třetích osob a přítomnost u výslechu),
   c) Právo na lékařské vyšetření lékařem dle vlastní volby (mimo doslech a dohled policistů).
2. Minimální standardy cel pro jednu osobu:
   - Podlahová plocha: přibližně 7 m² pro jednolůžkovou celu,
   - Vzdálenost mezi stěnami: nejméně 2 metry,
   - Světlá výška mezi podlahou a stropem: nejméně 2,5 metru,
   - Přirozené denní světlo a větrání (zákaz žaluzií/okenic blokujících světlo a vzduch),
   - Pobyt na čerstvém vzduchu: všichni vězni bez výjimky (včetně samovazby) mají právo na alespoň 1 hodinu denně venku.
3. Bezpečnost a lidská důstojnost:
   - Zákaz nošení obušků viditelně na ubytovnách (vyvolává konfrontaci a strach),
   - Zákaz nošení masek a kukel personálem při běžných zákrocích a eskortách (ztěžuje identifikaci a odpovědnost),
   - Zákaz zavazování očí vězňům (blindfolding),
   - Zákaz poziční asfyxie při imobilizaci (tlak na hrudník obličejem k zemi),
   - Zdravotnictví: zákaz diskriminační izolace HIV pozitivních osob bez klinických příznaků; těhotné ženy se nesmí rodit ve vězení a nesmí být připoutávány k lůžku.

PRAVIDLA NELSONA MANDELY (OSN Minimální standardy zacházení s vězněnými osobami, 2015):
- Pravidlo 1: Respekt k lidské důstojnosti, absolutní ochrana před mučením a nelidským zacházením.
- Pravidlo 43 a 44: Zákaz samovazby na dobu neurčitou a zákaz dlouhodobé samovazby (delší než 15 po sobě jdoucích dnů). Samovazba je umístění na 22+ hodin denně bez lidského kontaktu.
- Pravidlo 47: Úplný zákaz používání řetězů a železných okovů jako ponižujících prostředků.
- Pravidlo 52: Osobní a invazivní prohlídky (tělní dutiny) smí provádět pouze kvalifikovaný zdravotnický personál a personál stejného pohlaví v soukromí.
- Pravidlo 58: Zajištění kontaktu s rodinou a vnějším světem (návštěvy, korespondence, telefon).`,
    explanation: 'Tyto mezinárodní standardy slouží jako závazné hodnotící měřítko při inspekcích vězeňských zařízení v ČR mezinárodními delegacemi i Veřejným ochráncem práv.',
    examTips: 'Otázky: 1. Jaká je definice dlouhodobé samovazby dle pravidel OSN? Samovazba delší než 15 po sobě jdoucích dnů (je zakázána). 2. Jaké jsou minimální rozměry jednolůžkové cely dle CPT? 7 m² plocha, 2 m šířka, 2.5 m výška. 3. Kolik času venku musí mít vězeň v samovazbě? Nejméně 1 hodinu denně na čerstvém vzduchu.',
    category: 'mezinarodni_cpt'
  }
];
