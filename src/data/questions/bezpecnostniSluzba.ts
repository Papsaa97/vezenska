import { Question } from '../../types';

export const bezpecnostniSluzbaQuestions: Question[] = [
  {
    id: 'bs-01',
    subject: 'Bezpečnostní služba',
    topic: 'Strážní služba u vchodu',
    question: 'Jaké jsou hlavní povinnosti a zákazy pro strážného u hlavního vchodu do věznice?',
    answer: 'Převzít službu (PPZZ), kontrolovat totožnost a oprávnění ke vstupu, nepustit podnapilé osoby a děti <15 let bez doprovodu >18 let, neotevírat současně vnitřní a vnější vrata/dveře.',
    options: [
      'Převzít službu (PPZZ), provést evidenci v IS, vpustit osoby na základě platného občanského průkazu bez ohledu na věk doprovodu a při zvýšeném provozu otevřít obě brány propusťového systému pro urychlení odbavení.',
      'Převzít službu (PPZZ), kontrolovat totožnost a oprávnění ke vstupu, nepustit podnapilé osoby a děti <15 let bez doprovodu >18 let, neotevírat současně vnitřní a vnější vrata/dveře.',
      'Provádět kontrolu totožnosti výhradně u civilních návštěv, umožnit vstup osobám pod vlivem alkoholu pouze se souhlasem velitele stráže a zajistit trvalé otevření vnějších vrat pro větrání vstupního koridoru.',
      'Přezkoušet spojení, kontrolovat oprávnění ke vstupu, vpustit mladistvé od 12 let bez doprovodu při předložení studentského průkazu a provádět osobní prohlídku příslušníků GIBS a soudců bez výjimky.'
    ],
    correctOption: 1,
    rationale: 'Strážný u hlavního vchodu plní klíčovou bariérovou funkci: provádí PPZZ (převzít, přezkoušet, zapsat, zahlásit), provádí lustraci a evidenci v IS, zakazuje vstup osobám pod vlivem OPL a mladistvým bez doprovodu a striktně dodržuje propusťový režim (komorový systém – nikdy neotevřít obě brány najednou).',
    source: 'NGŘ č. 33/2019 a NGŘ č. 2/2026'
  },
  {
    id: 'bs-02',
    subject: 'Bezpečnostní služba',
    topic: 'Prohlídky',
    question: 'Jaká je četnost a charakteristika dílčích a technických prohlídek ve věznici?',
    answer: 'Dílčí prohlídka: zkontrolovat všechny prostory věznice za 90 dní (přítomen vychovatel a 1 vězeň u osobních věcí). Technická prohlídka: sběrná střediska 2× týdně, eskortní místnosti soudů 1× měsíčně (bez vězňů).',
    options: [
      'Dílčí prohlídka: kontrola všech ubytovacích prostor jednou za 30 dní za přítomnosti celého oddílu; technická prohlídka: kontrola mříží a katrů jednou za 6 měsíců za účasti specialisty prevence.',
      'Dílčí prohlídka: zkontrolovat všechny prostory věznice za 90 dní (přítomen vychovatel a 1 vězeň u osobních věcí). Technická prohlídka: sběrná střediska 2× týdně, eskortní místnosti soudů 1× měsíčně (bez vězňů).',
      'Dílčí prohlídka: zkontrolovat vybrané rizikové cely jednou za 180 dní bez přítomnosti vězňů; technická prohlídka: sběrná střediska 1× měsíčně a eskortní místnosti soudů 1× týdně za přítomnosti eskortovaných osob.',
      'Dílčí prohlídka: provádí se výhradně na základě podezření na výskyt OPL do 48 hodin; technická prohlídka: sběrná střediska denně před nástupem směny a eskortní místnosti soudů 1× za čtvrtletí.'
    ],
    correctOption: 1,
    rationale: 'Dle předpisů VS ČR se celá věznice v rámci dílčích prohlídek zkontroluje během 90 dnů. Technické prohlídky zaměřené na stav mříží, STP a spojení probíhají ve sběrných střediscích 2x týdně a v eskortních celách soudů 1x měsíčně bez přítomnosti vězňů.',
    source: 'Směrnice pro provádění prohlídek ve věznicích a vazebních věznicích VS ČR'
  },
  {
    id: 'bs-03',
    subject: 'Bezpečnostní služba',
    topic: 'Justiční stráž',
    question: 'Jaký je postup příslušníka Justiční stráže při převzetí střelné zbraně do úschovy od veřejnosti u vstupu do budovy soudu?',
    answer: 'Vyplní Protokol o uschování (odebrání) a vrácení zakázané věci ve dvou výtiscích (jeden pro osobu, jeden k uložení), zbraň bezpečně uzamkne do trezoru; při odchodu ji vrátí proti předložení protokolu a dokladu totožnosti a oba výtisky zlikviduje.',
    options: [
      'Zbraň zkontroluje, vybije před držitelem u bezpečnostního rámu, vystaví stvrzenku o převzetí s dobou platnosti 24 hodin a uloží ji do neuzamčené zásuvky služebního pultu.',
      'Vyplní Protokol o uschování (odebrání) a vrácení zakázané věci ve dvou výtiscích (jeden pro osobu, jeden k uložení), zbraň bezpečně uzamkne do trezoru; při odchodu ji vrátí proti předložení protokolu a dokladu totožnosti a oba výtisky zlikviduje.',
      'Vystaví jednostranné potvrzení o převzetí zbraně, zbraň uloží do přenosné bezpečnostní schránky a při odchodu ji vydá kterékoli osobě, která předloží příslušnou stvrzenku bez ověření totožnosti.',
      'Vyplní Protokol o uschování ve třech vyhotoveních, originál odešle do 24 hodin na Policejní prezidium ČR, zbraň zapečetí do plastového obalu a vrátí ji pouze na základě písemného souhlasu předsedy soudu.'
    ],
    correctOption: 1,
    rationale: 'Dle instrukce Ministerstva spravedlnosti o Justiční stráži se při vstupu ozbrojené osoby (pokud nemá výjimku ze zákona) vystaví dvoudílný protokol, zbraň se bezpečně uzamkne v trezoru a při opuštění budovy se po ověření totožnosti vrátí a protokoly zničí.',
    source: 'Instrukce Ministerstva spravedlnosti č. 8/2022 o Justiční stráži'
  },
  {
    id: 'bs-04',
    subject: 'Bezpečnostní služba',
    topic: 'Justiční stráž – doručování',
    question: 'Jaký je rozdíl mezi doručováním písemností soudu typu I (zelený pruh) a typu II (červený pruh)?',
    answer: 'Typ I (zelený pruh) umožňuje náhradní doručení (po 10 dnech vyvěšení/výzvy se vhodí do schránky s fikcí doručení). Typ II (červený pruh) je striktně do vlastních rukou bez vhození do schránky (pokud nevyzvedne, vrací se odesílateli bez fikce vhozením).',
    options: [
      'Typ I (zelený pruh) se doručuje výhradně do vlastních rukou bez možnosti náhradního doručení; Typ II (červený pruh) umožňuje po 3 dnech uložení vhození do domovní schránky s okamžitým účinkem doručení.',
      'Typ I (zelený pruh) umožňuje náhradní doručení (po 10 dnech vyvěšení/výzvy se vhodí do schránky s fikcí doručení). Typ II (červený pruh) je striktně do vlastních rukou bez vhození do schránky (pokud nevyzvedne, vrací se odesílateli bez fikce vhozením).',
      'Typ I (zelený pruh) je určen pouze pro orgány činné v trestním řízení s fikcí po 15 dnech; Typ II (červený pruh) se doručuje civilním osobám a vhazuje se do schránky ihned při nezastižení adresáta.',
      'Typ I i Typ II umožňují vhození do schránky po 10 dnech, ale u Typu II musí doručující příslušník JS osobně ověřit přítomnost adresáta u sousedů a vyhotovit úřední záznam pro Policii ČR.'
    ],
    correctOption: 1,
    rationale: 'Dle občanského soudního řádu (§ 49 a násl. OSŘ): Zásilka typu I připouští náhradní doručení vhozením do schránky po uplynutí 10denní úložní lhůty (fikce doručení). U zásilky typu II je vhození vyloučeno předsedou senátu a při nevyzvednutí se vrací soudu.',
    source: 'Zákon č. 99/1963 Sb., občanský soudní řád (OSŘ) a kancelářský řád'
  },
  {
    id: 'bs-05',
    subject: 'Bezpečnostní služba',
    topic: 'Eskortní služba',
    question: 'Kdo nese zavazadlo s penězi a ceninami při pěším doprovodu pokladní soudu příslušníky Justiční stráže?',
    answer: 'Zavazadlo s finanční hotovostí nese VŽDY zaměstnanec soudu (pokladní), NIKDY příslušník Justiční stráže.',
    options: [
      'Zavazadlo s hotovostí nese velitel eskorty, který je jištěn dalším příslušníkem JS s tasrem nebo střelnou zbraní v pohotovostní poloze.',
      'Zavazadlo s finanční hotovostí nese VŽDY zaměstnanec soudu (pokladní), NIKDY příslušník Justiční stráže.',
      'Zavazadlo nese mladší příslušník JS připoutané bezpečnostním ocelovým lankem k opasku, zatímco pokladní kráčí v čele formace.',
      'Příslušníci JS a pokladní se v nesení zavazadla střídají v pravidelných 15minutových intervalech z důvodu snížení fyzické únavy.'
    ],
    correctOption: 1,
    rationale: 'Zásadní taktické pravidlo: Příslušníci JS mají volné ruce pro zajištění bezpečnosti, manipulaci s donucovacími prostředky a zbraní. Peníze a ceniny nese přepravovaná oprávněná civilní osoba, která jde mezi příslušníky.',
    source: 'Směrnice pro přepravu peněz a cenin Justiční stráží'
  },
  {
    id: 'bs-06',
    subject: 'Bezpečnostní služba',
    topic: 'Strážní služba – strážní věž',
    question: 'Jaký je stanovený postup strážného na strážní věži, pokud odsouzený vnikne do vnitřního zakázaného pásma a překonává ohradní zeď?',
    answer: 'Okamžitě vyhlásit poplach na OS, dát zákonnou výzvu s výstrahou, provést varovný výstřel do bezpečného prostoru, a pokud vězeň neuposlechne a útěk nelze zmařit jinak, použít střelnou zbraň k zamezení útěku.',
    options: [
      'Okamžitě zahájit mířenou střelbu na trup odsouzeného bez varovného výstřelu a výzvy, aby nebyl zmařen moment překvapení, a poplach nahlásit až po eliminaci hrozby.',
      'Okamžitě vyhlásit poplach na OS, dát zákonnou výzvu s výstrahou, provést varovný výstřel do bezpečného prostoru, a pokud vězeň neuposlechne a útěk nelze zmařit jinak, použít střelnou zbraň k zamezení útěku.',
      'Použít nejprve slzotvorný prostředek vržený ze stanoviště věže, vyčkat na příjezd zásahové hlídky a střelbu použít až v případě, že odsouzený překoná vnější perimetr mimo dohled věznice.',
      'Dát zákonnou výzvu „Stůj!“, vyčkat 60 sekund na reakci odsouzeného, vystřelit varovný výstřel směrem k ubytovně a v případě neuposlechnutí opustit strážní věž a zahájit pěší pronásledování.'
    ],
    correctOption: 1,
    rationale: 'Dle § 18 odst. 1 písm. c) zákona č. 555/1992 Sb. je příslušník oprávněn použít střelnou zbraň k zamezení útěku osoby ve VTOS ze střeženého objektu nebo při eskortě, nelze-li tuto osobu jinak zadržet. Tomu předchází výzva, výstraha a varovný výstřel, nelze-li od nich upustit pro bezprostřední ohrožení života/zdraví.',
    source: '§ 18 a § 20 zákona č. 555/1992 Sb. a NGŘ č. 33/2019'
  },
  {
    id: 'bs-07',
    subject: 'Bezpečnostní služba',
    topic: 'Zdravotní eskorta',
    question: 'Jaká bezpečnostní pravidla platí pro eskortu vězněné osoby při vyšetření na magnetické rezonanci (MR) v civilní nemocnici?',
    answer: 'Před vstupem do vyšetřovací místnosti s magnetickým polem musí příslušník odložit zbraň a kovové předměty do trezoru nebo je předat kolegovi vně zóny; střežení probíhá přes prosklený průhled.',
    options: [
      'Příslušník vstupuje do vyšetřovací místnosti MR se zbraní zajištěnou v pouzdře s pojistkou proti vytržení úrovně III a vězně nepřetržitě drží za předváděcí řetízek.',
      'Před vstupem do vyšetřovací místnosti s magnetickým polem musí příslušník odložit zbraň a kovové předměty do trezoru nebo je předat kolegovi vně zóny; střežení probíhá přes prosklený průhled.',
      'Vězněná osoba musí mít po celou dobu vyšetření nasazena ocelová řetízková pouta s poutacím opaskem a strážný stojí ve vzdálenosti 1 metru od vstupu do tunelu MR.',
      'Příslušník zbraň vybije a náboje uschová v kapse, přičemž samotnou zbraň ponechá v magnetickém poli na vyšetřovacím lůžku pod dohledem radiologického asistenta.'
    ],
    correctOption: 1,
    rationale: 'Silné magnetické pole MR přitahuje feromagnetické kovy obrovskou silou (hrozí vystřelení zbraně, zranění a destrukce přístroje). Zbraň se nikdy nevnáší do zóny magnetu; střežení zajišťuje příslušník z ovládací místnosti.',
    source: 'Metodika eskortní činnosti do zdravotnických zařízení, NGŘ č. 23/2021'
  },
  {
    id: 'bs-08',
    subject: 'Bezpečnostní služba',
    topic: 'Kontrola balíčků',
    question: 'Jaký je hmotnostní limit pro balíček s potravinami a věcmi osobní potřeby zasílaný vězněné osobě a jak se provádí jeho kontrola?',
    answer: 'Hmotnost nesmí přesáhnout 5 kg včetně obalu; balíček projde kontrolou na RTG, fyzickou kontrolou obsahu a kontrolou na přítomnost OPL a nepovolených předmětů za přítomnosti vězně.',
    options: [
      'Hmotnost nesmí přesáhnout 10 kg bez obalu; balíček se otevírá a kontroluje výhradně na oddělení prevence za nepřítomnosti vězně a předává se jednou za 6 měsíců.',
      'Hmotnost nesmí přesáhnout 5 kg včetně obalu; balíček projde kontrolou na RTG, fyzickou kontrolou obsahu a kontrolou na přítomnost OPL a nepovolených předmětů za přítomnosti vězně.',
      'Hmotnost je limitována na 3 kg včetně obalu; kontrola probíhá pouze orientačním převážením na příjmu a vizuální kontrolou neporušenosti originálního poštovního obalu.',
      'Hmotnost nesmí přesáhnout 5 kg netto (bez obalu); kontrola se provádí výhradně stěrem na detekci výbušnin bez nutnosti rozbalení jednotlivých potravinových balení.'
    ],
    correctOption: 1,
    rationale: 'Dle zákona č. 169/1999 Sb. (§ 24) má odsouzený právo jednou za rok (nebo jako odměnu) přijmout balíček s potravinami do hmotnosti 5 kg. Balíček podléhá důkladné technické i vizuální kontrole.',
    source: '§ 24 zákona č. 169/1999 Sb. a Řád výkonu trestu'
  },
  {
    id: 'bs-09',
    subject: 'Bezpečnostní služba',
    topic: 'Důkladná osobní prohlídka',
    question: 'Kdo a za jakých podmínek smí provádět důkladnou osobní prohlídku vězněné osoby spojenou se svlečením?',
    answer: 'Vždy pouze příslušník stejného pohlaví, v oddělené místnosti bez přítomnosti neoprávněných osob. Prohlídku tělních dutin smí provádět výhradně lékař.',
    options: [
      'Příslušník jakéhokoliv pohlaví za přítomnosti nejméně dvou svědků z řad civilních zaměstnanců věznice, přičemž kontrolu tělních dutin provádí zdravotní sestra.',
      'Vždy pouze příslušník stejného pohlaví, v oddělené místnosti bez přítomnosti neoprávněných osob. Prohlídku tělních dutin smí provádět výhradně lékař.',
      'Výhradně velitel směny nebo inspektor dozorčí služby bez ohledu na pohlaví prohlíženého; invazivní kontrolu tělních dutin může provést zakročující dozorce v rukavicích.',
      'Příslušník stejného pohlaví na cele za přítomnosti spoluvězňů z důvodu zajištění bezpečnosti provádějícího personálu; lékař je přizván pouze při zjištění zranění.'
    ],
    correctOption: 1,
    rationale: 'Důkladná osobní prohlídka musí respektovat lidskou důstojnost: provádí ji zásadně příslušník stejného pohlaví v soukromí. Příslušník provádí kontrolu těla pohledem a kontrolu oděvu; invazivní prohlídku tělesných dutin je oprávněn provádět pouze lékař.',
    source: '§ 10 zákona č. 555/1992 Sb. a Směrnice pro provádění prohlídek'
  },
  {
    id: 'bs-10',
    subject: 'Bezpečnostní služba',
    topic: 'Dozorčí služba – mimořádná událost',
    question: 'Jaký je bezprostřední postup dozorce při nálezu oběšeného odsouzeného na okenní mříži v cele?',
    answer: 'Okamžitě tělo nadzvednout a odříznout/uvolnit škrtidlo, položit na záda na pevnou podlahu, zkontrolovat životní funkce, zahájit KPR, současně rádiem/hlásičem vyhlásit poplach a přivolat lékaře a VIDS.',
    options: [
      'Ponechat tělo v původní poloze z důvodu zachování stop pro vyšetřování GIBS a PČR, uzamknout celu a z chodby vyrozumět operační středisko a lékaře.',
      'Okamžitě tělo nadzvednout a odříznout/uvolnit škrtidlo, položit na záda na pevnou podlahu, zkontrolovat životní funkce, zahájit KPR, současně rádiem/hlásičem vyhlásit poplach a přivolat lékaře a VIDS.',
      'Odříznout škrtidlo, posadit odsouzeného na lůžko, podat mu vodu a vyčkat na příchod psychologa k vyhodnocení suicidálního rizika.',
      'Okamžitě vyhlásit poplach a vyčkat před celou na příchod minimálně tříčlenné zásahové hlídky, aby nedošlo k ohrožení zasahujícího dozorce.'
    ],
    correctOption: 1,
    rationale: 'Záchrana života má absolutní přednost: okamžité uvolnění krku, šetrné spuštění na podlahu, okamžitá resuscitace a přivolání lékařské pomoci. Místo se po resuscitaci zajistí pro ohledání PČR a inspekce.',
    source: 'Metodika řešení mimořádných událostí ve věznicích VS ČR'
  },
  {
    id: 'bs-11',
    subject: 'Bezpečnostní služba',
    topic: 'Nestřežené pracoviště',
    question: 'Jak postupuje dozorce na vnějším nestřeženém pracovišti při zjištění svévolného odchodu odsouzeného?',
    answer: 'Zkontroluje prostor pracoviště k vyloučení úrazu, ihned uvědomí operační středisko a VIDS s popisem osoby a směrem odchodu, zabezpečí zbývající odsouzené na pracovišti a vyčká pokynů.',
    options: [
      'Ponechá zbývající odsouzené bez dozoru na pracovišti, zahájí samostatné pronásledování uprchlého a operační středisko vyrozumí až po jeho dopadení.',
      'Zkontroluje prostor pracoviště k vyloučení úrazu, ihned uvědomí operační středisko a VIDS s popisem osoby a směrem odchodu, zabezpečí zbývající odsouzené na pracovišti a vyčká pokynů.',
      'Ihned nařídí všem zbývajícím odsouzeným pěší návrat do věznice, sám na místě vyčká příjezdu hlídky Policie ČR a zahájí pátrání v nejbližším okolí.',
      'Využije služební zbraň k varovnému výstřelu do vzduchu k přivolání pomoci civilních osob a uzamkne ostatní odsouzené v prostorách civilního zaměstnavatele.'
    ],
    correctOption: 1,
    rationale: 'Při svévolném odchodu z nestřeženého pracoviště je nutné okamžitě zahájit pátrací relaci přes operační středisko a Policii ČR a současně udržet dohled nad ostatními odsouzenými na pracovišti.',
    source: 'NGŘ č. 33/2019 a metodický pokyn pro dozorčí službu'
  },
  {
    id: 'bs-12',
    subject: 'Bezpečnostní služba',
    topic: 'Kontrola vozidel',
    question: 'Jaké úkony provádí strážný při kontrole nákladního vozidla vyjíždějícího ze střeženého objektu věznice?',
    answer: 'Kontrolu podvozku a dutin (inspekční zrcadlo/kamera), kontrolu nákladového prostoru (fyzicky, detektorem či propichovací sondou u sypkých materiálů), kabiny řidiče a ověření totožnosti osádky.',
    options: [
      'Ověří propustku vozidla v IS, zkontroluje kabinu řidiče a bez nutnosti kontroly nákladového prostoru otevře vnější vrata, pokud má vozidlo neporušenou celní plombu.',
      'Kontrolu podvozku a dutin (inspekční zrcadlo/kamera), kontrolu nákladového prostoru (fyzicky, detektorem či propichovací sondou u sypkých materiálů), kabiny řidiče a ověření totožnosti osádky.',
      'Provede kontrolu motorového prostoru a podvozku, ale kontrolu korby a sypkého nákladu přenechá řidiči vozidla, který podepíše čestné prohlášení o nepřítomnosti osob.',
      'Zkontroluje podvozek inspekčním zrcadlem a nákladový prostor vizuálně přes kameru propusťového systému, přičemž osádka nemusí předkládat doklady totožnosti při výjezdu.'
    ],
    correctOption: 1,
    rationale: 'Vyjíždějící vozidla představují nejvyšší riziko útěku vězněných osob. Provádí se systematická prohlídka všech prostor, podvozku i nákladu za účelem zamezení úkrytu osob.',
    source: 'NGŘ č. 33/2019 o strážní službě'
  },
  {
    id: 'bs-13',
    subject: 'Bezpečnostní služba',
    topic: 'Strážní služba – převzetí stanoviště',
    question: 'Co znamená zkratka PPZZ a v jakých situacích ji příslušník VS ČR aplikuje?',
    answer: 'Přezkoušet, Převzít, Zapsat, Zahlásit – standardní postup při střídání a nástupu do výkonu strážní a dozorčí služby.',
    options: [
      'Prověřit prostory, Poučit personál, Zajistit zbraně, Zamknout stanoviště – postup při vyhlašování bezpečnostního poplachu ve věznici.',
      'Přezkoušet, Převzít, Zapsat, Zahlásit – standardní postup při střídání a nástupu do výkonu strážní a dozorčí služby.',
      'Předat post, Prověřit spojení, Zkontrolovat závady, Zapsat stav – postup používaný výhradně při předávání služebních vozidel autoparku.',
      'Přijmout pokyn, Prověřit perimetr, Zadržet pachatele, Zpracovat hlášení – standardní taktický postup operativní skupiny při narušení perimetru.'
    ],
    correctOption: 1,
    rationale: 'PPZZ je základním služebním návykem při střídání na stanovišti: přezkoušení funkčnosti STP a spojení, převzetí materiálu a zbraní, zápis do knihy služby a hlášení veliteli směny.',
    source: 'NGŘ č. 33/2019, o Vězeňské a justiční stráži'
  },
  {
    id: 'bs-14',
    subject: 'Bezpečnostní služba',
    topic: 'Justiční stráž – jednací síň',
    question: 'Jaká oprávnění má příslušník Justiční stráže v jednací síni soudu během hlavního líčení?',
    answer: 'Dbá pokynů předsedy senátu (soudce), zajišťuje nerušený průběh jednání, může vyvést neukázněné osoby a střeží obžalovaného.',
    options: [
      'Je oprávněn samostatně přerušit jednání soudu při jakémkoli verbálním projevu veřejnosti a rozhodnout o vyloučení veřejnosti bez souhlasu soudce.',
      'Dbá pokynů předsedy senátu (soudce), zajišťuje nerušený průběh jednání, může vyvést neukázněné osoby a střeží obžalovaného.',
      'Podléhá výhradně pokynům státního zástupce, provádí protokolaci výpovědí obžalovaného a rozhoduje o povolení vstupu médií s kamerami.',
      'Zajišťuje fyzickou ostrahu soudce a na pokyn obhájce je povinen provést osobní prohlídku přítomných svědků a poškozených přímo v síni.'
    ],
    correctOption: 1,
    rationale: 'Dle § 3 zákona č. 555/1992 Sb. Justiční stráž zajišťuje pořádek a bezpečnost v budovách soudů a v jednacích síních plní pokyny předsedy senátu nebo samosoudce.',
    source: '§ 3 zákona č. 555/1992 Sb. a Instrukce MS ČR č. 8/2022'
  },
  {
    id: 'bs-15',
    subject: 'Bezpečnostní služba',
    topic: 'Dozorčí služba – sčítací prověrka',
    question: 'Jakým způsobem a v jakých intervalech se provádí sčítací prověrka vězněných osob na ubytovně?',
    answer: 'Minimálně 2× denně (ranní a večerní sčíták) vizuální kontrolou každého vězně podle jmenného seznamu; při pochybnostech se nařídí mimořádná sčítací prověrka.',
    options: [
      'Provádí se 1× denně v poledne nahlášením počtů předsedou samosprávy odsouzených dozorci na chodbě oddílu bez nutnosti vstupu do cel.',
      'Minimálně 2× denně (ranní a večerní sčíták) vizuální kontrolou každého vězně podle jmenného seznamu; při pochybnostech se nařídí mimořádná sčítací prověrka.',
      'Minimálně 4× denně elektronickým načtením identifikačních čipů vězňů u vchodu do jídelny bez fyzické kontroly na obytných celách.',
      'Pouze při ranním budíčku vizuální kontrolou ubytovny a v nočních hodinách výhradně dálkovou kontrolou z kamerového systému bez vstupu na oddíl.'
    ],
    correctOption: 1,
    rationale: 'Pravidelná sčítací prověrka je základním bezpečnostním prvkem dozorčí služby. Dozorce musí vidět obličej a živé tělo každého vězně (v noci ověřit dýchání).',
    source: 'Řád výkonu trestu odnětí svobody a NGŘ č. 33/2019'
  },
  {
    id: 'bs-16',
    subject: 'Bezpečnostní služba',
    topic: 'Eskortní služba – eskorta do nemocnice',
    question: 'Jaký je minimální počet příslušníků eskortní hlídky při předvádění nebezpečné vězněné osoby do civilního zdravotnického zařízení?',
    answer: 'Minimálně 2 ozbrojení příslušníci (velitel eskorty a strážný); u mimořádně nebezpečných osob posiluje hlídku operativní skupina nebo psovod.',
    options: [
      'Postačuje 1 ozbrojený příslušník s krátkou střelnou zbraní a zdravotní sestra vězeňské nemocnice vybavená slzotvorným prostředkem.',
      'Minimálně 2 ozbrojení příslušníci (velitel eskorty a strážný); u mimořádně nebezpečných osob posiluje hlídku operativní skupina nebo psovod.',
      'Minimálně 3 příslušníci, z nichž alespoň jeden musí být neozbrojen z důvodu poskytování bezprostřední asistence lékaři při vyšetření.',
      'Vždy minimálně 4 ozbrojení příslušníci s dlouhými zbraněmi a služebním psem bez ohledu na stupeň zabezpečení a bezpečnostní profil eskortovaného.'
    ],
    correctOption: 1,
    rationale: 'Dle NGŘ č. 33/2019 tvoří eskortu minimálně dvoučlenná hlídka. Eskortovaný je nepřetržitě střežen a v civilním zdravotnickém zařízení jsou uplatňována přísná bezpečnostní opatření.',
    source: 'NGŘ č. 33/2019 o eskortní službě'
  },
  {
    id: 'bs-17',
    subject: 'Bezpečnostní služba',
    topic: 'Zakázané předměty',
    question: 'Které předměty jsou striktně zakázány vnášet do střeženého objektu věznice nepovolaným osobám?',
    answer: 'Zbraně a střelivo, alkohol a jiné návykové látky (OPL), mobilní telefony a záznamová zařízení, finanční hotovost nad povolený limit a předměty umožňující útěk.',
    options: [
      'Pouze střelné zbraně a výbušniny; mobilní telefony, fotoaparáty a drobnou elektroniku lze vnášet bez omezení po předložení občanského průkazu.',
      'Zbraně a střelivo, alkohol a jiné návykové látky (OPL), mobilní telefony a záznamová zařízení, finanční hotovost nad povolený limit a předměty umožňující útěk.',
      'Veškeré kovové předměty včetně snubních prstenů, opaskových spon, mincí a běžných léků na předpis bez výjimky.',
      'Alkoholické nápoje a tabákové výrobky; mobilní telefony a záznamová zařízení jsou povoleny všem návštěvám po vizuální kontrole dozorcem.'
    ],
    correctOption: 1,
    rationale: 'Vnášení zakázaných věcí (zejména komunikátorů a OPL) představuje zásadní narušení bezpečnosti věznice a může naplnit skutkovou podstatu trestného činu maření výkonu úředního rozhodnutí.',
    source: '§ 28 zákona č. 169/1999 Sb. a NGŘ č. 2/2026'
  },
  {
    id: 'bs-18',
    subject: 'Bezpečnostní služba',
    topic: 'Strážní služba – signálně bezpečnostní technika',
    question: 'Jak reaguje operační středisko (OS) při aktivaci perimetrického čidla v zakázaném pásmu věznice?',
    answer: 'Okamžitě ověří situaci na kamerovém systému (CCTV), vyhlásí poplach pro zásahovou hlídku/výjezdovou skupinu a navede ji na konkrétní sektor narušení.',
    options: [
      'Provede dálkový reset poplachového čidla v systému a hlídku vyšle k prověření až v případě, že se signál ze stejného úseku zopakuje třikrát během 10 minut.',
      'Okamžitě ověří situaci na kamerovém systému (CCTV), vyhlásí poplach pro zásahovou hlídku/výjezdovou skupinu a navede ji na konkrétní sektor narušení.',
      'Ihned aktivuje automatický slzotvorný systém v daném úseku perimetru a uvědomí krajské ředitelství Policie ČR bez vyslání vlastní hlídky.',
      'Vyčká na telefonické hlášení strážného z nejbližší strážní věže a teprve po jeho potvrzení zaznamená událost do knihy poruch technických prostředků.'
    ],
    correctOption: 1,
    rationale: 'Signálně bezpečnostní technika (SBT) v zakázaném pásmu vyžaduje okamžitou reakci operačního důstojníka a bleskový výjezd zásahové jednotky na místo signálu.',
    source: 'Směrnice pro obsluhu SBT a činnost operačních středisek VS ČR'
  },
  {
    id: 'bs-19',
    subject: 'Bezpečnostní služba',
    topic: 'Kynologie VS ČR',
    question: 'K jakým účelům se ve Vězeňské službě ČR využívají služební psi a jak se dělí podle specializace?',
    answer: 'Dělí se na psy všestranné (hlídkové, obranáře pro eskorty a zákroky) a psy speciální (vyhledávání drog/OPL, výbušnin a mobilních telefonů).',
    options: [
      'Dělí se výhradně na psy záchranářské (vyhledávání zavalených osob) a psy pastevecké pro střežení vnějších zemědělských ploch věznice.',
      'Dělí se na psy všestranné (hlídkové, obranáře pro eskorty a zákroky) a psy speciální (vyhledávání drog/OPL, výbušnin a mobilních telefonů).',
      'Dělí se na psy hlídkové (pouze pro noční pochůzkovou službu na perimetru) a psy terapeutické určené pro výkon trestu mladistvých.',
      'Využívají se výhradně psi se specializací na vyhledávání akcelerantů hoření a biologických stop pro potřeby kriminalistického oddělení.'
    ],
    correctOption: 1,
    rationale: 'Služební kynologie VS ČR je vysoce specializovaná složka; psi se využívají jak pro přímé donucovací zákroky a eskorty, tak pro pachové práce při detekci drog a telefonů.',
    source: 'NGŘ č. 14/2020 o kynologii VS ČR'
  },
  {
    id: 'bs-20',
    subject: 'Bezpečnostní služba',
    topic: 'Návštěvní místnost',
    question: 'Jaká jsou pravidla dozoru během přímého kontaktu vězněné osoby s návštěvou v návštěvní místnosti?',
    answer: 'Dozorce provádí nepřetržitý zrakový dohled, sleduje předávání nedovolených předmětů a při hrubém porušení pořádku nebo pokusu o předání OPL návštěvu ihned ukončí.',
    options: [
      'Dozorce kontroluje návštěvní místnost v nepravidelných intervalech 1× za 30 minut a při podezření na předávání věcí provede zápis až po ukončení návštěvy.',
      'Dozorce provádí nepřetržitý zrakový dohled, sleduje předávání nedovolených předmětů a při hrubém porušení pořádku nebo pokusu o předání OPL návštěvu ihned ukončí.',
      'Dozorce sedí přímo u stolu mezi vězněm a návštěvou, osobně ochutnává přinesené potraviny a kontroluje veškeré písemné poznámky návštěvníků.',
      'Dozor je prováděn výhradně prostřednictvím audio odposlechu z vedlejší místnosti bez přímé fyzické a zrakové přítomnosti personálu v sále.'
    ],
    correctOption: 1,
    rationale: 'Dle § 19 zákona č. 169/1999 Sb. se návštěvy uskutečňují za přítomnosti příslušníka VS ČR. Dozorce dbá na bezpečnost a zamezuje vnášení nepovolených látek a předmětů.',
    source: '§ 19 zákona č. 169/1999 Sb. a Řád VTOS'
  },
  {
    id: 'bs-21',
    subject: 'Bezpečnostní služba',
    topic: 'Eskortní služba – poutací technika',
    question: 'V jakých případech je velitel eskorty povinen nařídit použití pout a poutacích řemenů (kombinované poutání)?',
    answer: 'U osob nebezpečných, násilných, podezřelých z plánování útěku nebo eskortovaných k soudním jednáním u závažných trestných činů na základě bezpečnostního vyhodnocení.',
    options: [
      'Automaticky a povinně u všech eskortovaných osob bez výjimky, včetně těhotných žen a osob s trvalým tělesným postižením horních končetin.',
      'U osob nebezpečných, násilných, podezřelých z plánování útěku nebo eskortovaných k soudním jednáním u závažných trestných činů na základě bezpečnostního vyhodnocení.',
      'Výhradně u odsouzených zařazených do věznice s ostrahou s vysokým stupněm zabezpečení a pouze na základě předchozího písemného souhlasu soudce.',
      'Pouze v případech, kdy je eskorta prováděna pěšky po veřejných komunikacích nebo městskou hromadnou dopravou.'
    ],
    correctOption: 1,
    rationale: 'Použití pout a poutacích pásů při eskortě se řídí mírou bezpečnostního rizika odsouzeného/obviněného v souladu s § 17 zákona č. 555/1992 Sb. a eskortním příkazem.',
    source: '§ 17 zákona č. 555/1992 Sb. a NGŘ č. 33/2019'
  },
  {
    id: 'bs-22',
    subject: 'Bezpečnostní služba',
    topic: 'Mimořádné události – požár',
    question: 'Jaký je prvotní postup dozorce při zjištění kouře a požáru na ubytovně vězněných osob?',
    answer: 'Okamžitě ohlásit požár na operační středisko (vyhlásit požární poplach), zahájit evakuaci osob do bezpečného sektoru a zahájit hašení dostupnými hasicími přístroji/hydrantem.',
    options: [
      'Nejprve otevřít všechna okna na chodbě a celách k odvětrání kouře, uzamknout katry a vyčkat na příjezd jednotky HZS bez vyhlašování poplachu na OS.',
      'Okamžitě ohlásit požár na operační středisko (vyhlásit požární poplach), zahájit evakuaci osob do bezpečného sektoru a zahájit hašení dostupnými hasicími přístroji/hydrantem.',
      'Samostatně zahájit hašení uvnitř zasažené cely vodním proudem z hydrantu a operační středisko informovat až po úplné likvidaci ohniska požáru.',
      'Okamžitě otevřít všechny cely v celém patře a ponechat odsouzeným volný pohyb na dvůr věznice bez zajištění střežení perimetru.'
    ],
    correctOption: 1,
    rationale: 'Záchrana životů a evakuace ohrožených osob v kombinaci s okamžitým vyhlášením požárního poplachu a zásahem vězeňské jednotky PO/HZS je základem požárního řádu věznice.',
    source: 'Požární poplachová směrnice VS ČR'
  },
  {
    id: 'bs-23',
    subject: 'Bezpečnostní služba',
    topic: 'Technické vyhledávací prostředky',
    question: 'K jakému účelu slouží ve Vězeňské službě ČR detektor nelineárních přechodů (NLJD)?',
    answer: 'K vyhledávání skrytých polovodičových součástek – zejména vypnutých mobilních telefonů, SIM karet, diktafonů a elektroniky ukryté ve zdech, matracích nebo nábytku.',
    options: [
      'K dálkové detekci radioaktivního záření a kontrole přítomnosti toxických plynů ve vězeňských dílnách.',
      'K vyhledávání skrytých polovodičových součástek – zejména vypnutých mobilních telefonů, SIM karet, diktafonů a elektroniky ukryté ve zdech, matracích nebo nábytku.',
      'K lokalizaci kovových předmětů a zbraní pod hladinou vody nebo v hlubokých výkopech areálu věznice.',
      'K odposlechu a dekódování šifrované radiokomunikace mezi nepovolanými vysílačkami v okolí věznice.'
    ],
    correctOption: 1,
    rationale: 'Detektor nelineárních přechodů (NLJD - Non-Linear Junction Detector) reaguje na křemíkové polovodičové přechody, a proto spolehlivě odhalí i zcela vypnutý mobilní telefon či samotnou SIM kartu, bez ohledu na to, zda jsou pod napětím.',
    source: 'Metodika bezpečnostně technických prostředků VS ČR'
  },
  {
    id: 'bs-24',
    subject: 'Bezpečnostní služba',
    topic: 'Metodika bezpečnostních prohlídek',
    question: 'Jaká jsou přísná zákonná a metodická pravidla pro provádění důkladné osobní prohlídky (se svlečením do naha)?',
    answer: 'Musí ji provádět VÝHRADNĚ osoba stejného pohlaví jako prohlížený, v oddělené místnosti bez přítomnosti nepovolaných osob a způsobem zachovávajícím lidskou důstojnost.',
    options: [
      'Může ji provádět příslušník opačného pohlaví, pokud je přítomen lékař nebo psycholog a je pořízen nepřetržitý videozáznam úkonu.',
      'Musí ji provádět VÝHRADNĚ osoba stejného pohlaví jako prohlížený, v oddělené místnosti bez přítomnosti nepovolaných osob a způsobem zachovávajícím lidskou důstojnost.',
      'Prohlídku provádí zásadně tříčlenná komise na společné chodbě oddílu za účelem zajištění maximální bezpečnosti personálu.',
      'Příslušník stejného pohlaví smí provést kontrolu oděvu a těla pohledem, přičemž je oprávněn sám provádět i invazivní fyzikální vyšetření tělesných dutin pomocí zrcadla.'
    ],
    correctOption: 1,
    rationale: 'Dle zákona a Řádu VTOS důkladnou osobní prohlídku (včetně kontroly tělesných záhybů a dutin) smí provádět pouze příslušník stejného pohlaví v určené vyšetřovací/prohlížecí místnosti za dodržení důstojnosti a hygienických standardů.',
    source: '§ 9 zákona č. 555/1992 Sb. a NGŘ o bezpečnostních prohlídkách'
  },
  {
    id: 'bs-25',
    subject: 'Bezpečnostní služba',
    topic: 'Eskortní služba a rizikové osoby',
    question: 'Co v praxi VS ČR znamená označení eskortní karty vězněné osoby červeným pruhem?',
    answer: 'Označuje zvlášť nebezpečnou osobu (vysoké riziko útěku nebo násilí), což vyžaduje posílenou eskortu, trvalé použití donucovacích prostředků (vč. poutacího pásu) a zvýšená taktická opatření.',
    options: [
      'Označuje vězněnou osobu s infekčním onemocněním, která vyžaduje eskortu ve speciálním sanitním vozidle s biologickou ochranou.',
      'Označuje zvlášť nebezpečnou osobu (vysoké riziko útěku nebo násilí), což vyžaduje posílenou eskortu, trvalé použití donucovacích prostředků (vč. poutacího pásu) a zvýšená taktická opatření.',
      'Označuje odsouzeného s uloženým kázeňským trestem samovazby, u kterého je zakázáno použití jakýchkoli poutacích prostředků při přepravě.',
      'Signalizuje osobu spolupracující s orgány činnými v trestním řízení, která musí být eskortována výhradně v civilním oděvu a neoznačeným vozidlem.'
    ],
    correctOption: 1,
    rationale: 'Eskortní karta s červeným pruhem (tzv. Červený pruh) signalizuje nejvyšší bezpečnostní riziko (často doživotně odsouzení, členové organizovaného zločinu, osoby s pokusem o ozbrojený útěk). Eskorta se provádí se zvýšeným počtem příslušníků a zbraní.',
    source: 'Eskortní řád VS ČR (NGŘ č. 24/2018)'
  }
  ,
  // 17. Zásada dvojic
  {
    id: 'bs-17',
    subject: 'Bezpečnostní služba',
    topic: 'Zásady bezpečnosti',
    question: 'Co znamená "zásada dvojic" při výkonu služby ve věznici?',
    answer: 'Příslušníci nesmí provádět otevírání cel nebo zasahovat na ubytovnách o samotě. Úkony, při nichž hrozí napadení (např. řešení konfliktů, prohlídky, předvádění agresivních vězňů, vstup do cely v noční době), se provádějí vždy za přítomnosti minimálně dvou příslušníků (jeden koná, druhý jistí).',
    options: [
      'Při každé službě musí být přítomni dva velitelé oddělení.',
      'Příslušníci nesmí provádět otevírání cel nebo zasahovat na ubytovnách o samotě. Úkony, při nichž hrozí napadení (např. řešení konfliktů, prohlídky, předvádění agresivních vězňů, vstup do cely v noční době), se provádějí vždy za přítomnosti minimálně dvou příslušníků (jeden koná, druhý jistí).',
      'Každý vězeň musí mít přidělené dva vychovatele.',
      'Strážný na věži musí mít u sebe vždy dva typy donucovacích prostředků.'
    ],
    correctOption: 1,
    rationale: 'Zásada dvojic je základním bezpečnostním pravidlem dozorčí služby. Zajišťuje vzájemné jištění, odrazuje od napadení a poskytuje svědeckou podporu při řešení incidentů.',
    source: 'NGŘ č. 33/2019, o strážní, dozorčí a eskortní službě'
  },
  // 18. Povinnosti dozorce po nástupu
  {
    id: 'bs-18',
    subject: 'Bezpečnostní služba',
    topic: 'Dozorčí služba',
    question: 'Jaké jsou bezprostřední povinnosti dozorce po převzetí služby na ubytovně?',
    answer: 'Dozorce provede kontrolu početního stavu (přepočítání), prohlídku mříží, zámků, oken, osvětlení a celkového pořádku. O převzetí úseku, stavu vězněných osob a případných závadách provede záznam do staniční knihy.',
    options: [
      'Provést důkladnou osobní prohlídku všech vězňů a odeslat je na vycházku.',
      'Uvařit kávu pro ostatní příslušníky a zkontrolovat televizní program.',
      'Dozorce provede kontrolu početního stavu (přepočítání), prohlídku mříží, zámků, oken, osvětlení a celkového pořádku. O převzetí úseku, stavu vězněných osob a případných závadách provede záznam do staniční knihy.',
      'Sepsat hlášení o průběhu minulé směny, aniž by musel kontrolovat ubytovnu.'
    ],
    correctOption: 2,
    rationale: 'Fyzická přejímka úseku (kontrola osob a bezpečnostních prvků) je kritická pro odpovědnost za stav oddělení a pro zajištění kontinuity bezpečnosti při střídání směn.',
    source: 'NGŘ č. 33/2019, o strážní, dozorčí a eskortní službě'
  },
  // 19. Propustkový režim
  {
    id: 'bs-19',
    subject: 'Bezpečnostní služba',
    topic: 'Strážní služba u vchodu',
    question: 'Jaká jsou základní pravidla pro propustkový režim do střeženého objektu?',
    answer: 'Vstup do objektu je možný jen na základě platného průkazu totožnosti (služební průkaz, OP) a pověření nebo jednorázové propustky po evidenci návštěvy. Strážný kontroluje oprávněnost vstupu, zavazadla a využívá rámový detektor kovů.',
    options: [
      'Propustkový režim neplatí pro rodinné příslušníky dozorců, pokud vstupují do areálu v době návštěv.',
      'Vstup do objektu je možný jen na základě platného průkazu totožnosti (služební průkaz, OP) a pověření nebo jednorázové propustky po evidenci návštěvy. Strážný kontroluje oprávněnost vstupu, zavazadla a využívá rámový detektor kovů.',
      'Do věznice lze pustit kohokoliv, kdo zná heslo dne.',
      'Strážný propouští osoby na základě ústního slibu ředitele věznice bez prokázání totožnosti.'
    ],
    correctOption: 1,
    rationale: 'Kontrola vstupu brání průniku nepovolaných osob a vnášení zakázaných předmětů. Každá civilní návštěva musí být evidována a doprovázena.',
    source: 'NGŘ č. 2/2026, o pravidlech vstupu a vjezdu do objektů VS ČR'
  },
  // 20. Použití střelné zbraně proti davu
  {
    id: 'bs-20',
    subject: 'Bezpečnostní služba',
    topic: 'Strážní služba',
    question: 'Je příslušník VS ČR oprávněn použít střelnou zbraň proti davu, pokud z něj vychází nebezpečí?',
    answer: 'Příslušník nesmí použít zbraň přímo proti davu (do davu střílet nelze z důvodu ohrožení nezúčastněných osob). Může použít varovný výstřel (do bezpečného prostoru), aby dav zastavil, nebo zasáhnout konkrétního identifikovaného agresora, pokud to situace vyžaduje a nejsou ohroženi ostatní.',
    options: [
      'Příslušník může střílet dávkou přímo do středu davu k rychlému rozehnání.',
      'Příslušník musí odložit zbraň a pokusit se dav uklidnit verbálně z bezprostřední blízkosti.',
      'Zbraň se nesmí použít vůbec, dav lze rozhánět jen slzotvornými prostředky a vodními děly.',
      'Příslušník nesmí použít zbraň přímo proti davu (do davu střílet nelze z důvodu ohrožení nezúčastněných osob). Může použít varovný výstřel (do bezpečného prostoru), aby dav zastavil, nebo zasáhnout konkrétního identifikovaného agresora, pokud to situace vyžaduje a nejsou ohroženi ostatní.'
    ],
    correctOption: 3,
    rationale: 'Zákon č. 555/1992 Sb. i obecné zásady bezpečnosti použití zbraně přísně zakazují plošnou střelbu do davu. Zbraň lze použít jen selektivně proti pachateli, pokud to neodporuje § 18 odst. 4 (povinnost dbát opatrnosti).',
    source: 'Zákon č. 555/1992 Sb., o VS a JS ČR'
  },
  // 21. Použití donucovacích prostředků
  {
    id: 'bs-21',
    subject: 'Bezpečnostní služba',
    topic: 'Donucovací prostředky',
    question: 'Jaké jsou povinnosti příslušníka před použitím donucovacího prostředku?',
    answer: 'Příslušník je povinen vyzvat osobu jménem zákona k upuštění od protiprávního jednání (s výstrahou, že bude zakročeno) s výjimkou případů, kdy hrozí bezprostřední nebezpečí a výzvu není možné učinit. Musí volit prostředek přiměřený povaze protiprávního jednání (zásada subsidiarity a proporcionality).',
    options: [
      'Příslušník musí nejprve sepsat úřední záznam a získat podpis odsouzeného.',
      'Příslušník je povinen vyzvat osobu jménem zákona k upuštění od protiprávního jednání (s výstrahou, že bude zakročeno) s výjimkou případů, kdy hrozí bezprostřední nebezpečí a výzvu není možné učinit. Musí volit prostředek přiměřený povaze protiprávního jednání (zásada subsidiarity a proporcionality).',
      'Příslušník může zasáhnout bez varování v každé situaci, aby zajistil moment překvapení.',
      'Příslušník musí vyžádat telefonický souhlas státního zástupce.'
    ],
    correctOption: 1,
    rationale: 'Zákonná výzva („Jménem zákona, upusťte od...“) je obligatorní podmínkou použití DP, pokud to situace umožňuje. Dále platí zásada subsidiarity (využít mírnější prostředky) a proporcionality (intenzita nesmí zjevně převýšit hrozbu).',
    source: '§ 17 a § 21 zákona č. 555/1992 Sb., o VS a JS ČR'
  }
];
