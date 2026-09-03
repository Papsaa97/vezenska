import { Question } from '../../types';

export const kriminalistikaQuestions: Question[] = [
  {
    id: 'krm-01',
    subject: 'Kriminalistika',
    topic: 'Zajištění místa činu',
    question: 'Jaké jsou bezprostřední povinnosti prvního příslušníka VS ČR na místě spáchání závažného trestného činu nebo mimořádné události ve věznici?',
    answer: 'Poskytnout první pomoc zraněným, zajistit bezpečnost a zamezit útěku pachatele, vymezit prostor páskou, zamezit vstupu nepovolaných osob (ochrana stop před zničením) a ihned informovat VIDS.',
    options: [
      'Místo činu důkladně zamést a umýt podlahu saponátem.',
      'Poskytnout první pomoc zraněným, zajistit bezpečnost a zamezit útěku pachatele, vymezit prostor páskou, zamezit vstupu nepovolaných osob (ochrana stop před zničením) a ihned informovat VIDS.',
      'Sebrat všechny zbraně holýma rukama a schovat je do kapsy.',
      'Odejít z místnosti a zamknout tam všechny svědky i podezřelé dohromady.'
    ],
    correctOption: 1,
    rationale: 'Zajištění místa činu (First Responder) je kritické pro budoucí dokazování. Záchrana lidského života má prioritu, ihned následuje izolace prostoru, fixace stop a předání vyšetřovatelům.',
    source: '§ 113 zákona č. 141/1961 Sb., trestní řád a Metodika zajištění místa činu VS ČR'
  },
  {
    id: 'krm-02',
    subject: 'Kriminalistika',
    topic: 'Kriminalistické stopy – Biologické stopy (DNA)',
    question: 'Jak se správně manipuluje s předměty nesoucími biologické stopy (krev, sliny, epitelie) při jejich zajištění?',
    answer: 'Používat sterilní rukavice a pinzetu, zamezit kontaminaci vlastním dechem/DNA (nosit roušku), stopy nechat volně uschnout při pokojové teplotě (nikdy nebalit vlhké do igelitu) a uložit do prodyšného papírového obalu.',
    options: [
      'Vlhké krvavé oblečení pevně zabalit do neprodyšného igelitového pytle a dát na radiátor.',
      'Používat sterilní rukavice a pinzetu, zamezit kontaminaci vlastním dechem/DNA (nosit roušku), stopy nechat volně uschnout při pokojové teplotě (nikdy nebalit vlhké do igelitu) a uložit do prodyšného papírového obalu.',
      'Omýt stopu teplou mýdlovou vodou a vyžehlit.',
      'Dotýkat se stopy výhradně holýma rukama k ověření vlhkosti.'
    ],
    correctOption: 1,
    rationale: 'Vlhké biologické stopy v igelitu bleskově zplesniví a DNA degraduje. Správný postup vyžaduje vysušení a balení do papírových sáčků či krabic.',
    source: 'Kriminalistická technika – Kriminalistický ústav PČR'
  },
  {
    id: 'krm-03',
    subject: 'Kriminalistika',
    topic: 'Daktyloskopie',
    question: 'Na jakých třech základních anatomických principech je založena kriminalistická daktyloskopie (otisk papilárních linií)?',
    answer: '1. Individuálnost (neexistují dva lidé se stejnými obrazci), 2. Neměnnost (obrazce zůstávají stejné po celý život), 3. Neodstranitelnost (při poškození škáry se linie obnoví ve stejném tvaru).',
    options: [
      '1. Rychlost, 2. Pružnost, 3. Barevnost.',
      '1. Individuálnost (neexistují dva lidé se stejnými obrazci), 2. Neměnnost (obrazce zůstávají stejné po celý život), 3. Neodstranitelnost (při poškození škáry se linie obnoví ve stejném tvaru).',
      '1. Tloušťka, 2. Vlhkost, 3. Teplota kůže.',
      'Daktyloskopie v moderní kriminalistice již neplatí.'
    ],
    correctOption: 1,
    rationale: 'Tyto 3 zákonitosti formulované Galtonem a Purkyněm tvoří vědecký základ daktyloskopické identifikace osob na celém světě.',
    source: 'Kriminalistická technika a metodika identifikace stop'
  },
  {
    id: 'krm-04',
    subject: 'Kriminalistika',
    topic: 'Úřední záznam a bezpečnostní dokumentace',
    question: 'Jaké náležitosti musí obsahovat úřední záznam o použití donucovacích prostředků nebo mimořádné události sepsaný příslušníkem VS ČR?',
    answer: 'Čas a místo incidentu, přesná identifikace zúčastněných osob, popis protiprávního jednání, zákonný důvod zákroku, použitý DP a intenzita, zákonná výzva, následky a zranění, poskytnutá první pomoc a podpis.',
    options: [
      'Pouze datum a jméno velitele směny bez popisu detailů.',
      'Čas a místo incidentu, přesná identifikace zúčastněných osob, popis protiprávního jednání, zákonný důvod zákroku, použitý DP a intenzita, zákonná výzva, následky a zranění, poskytnutá první pomoc a podpis.',
      'Pouze částku finanční odměny pro zasahujícího.',
      'Úřední záznam se sepisuje pouze v případě, že si vězeň stěžuje.'
    ],
    correctOption: 1,
    rationale: 'Úřední záznam je klíčovým procesním a služebním dokumentem. Musí být objektivní, chronologický, přesný a obsahovat veškeré zákonné náležitosti dle § 22 zákona č. 555/1992 Sb.',
    source: '§ 22 zákona č. 555/1992 Sb. a spisový řád VS ČR'
  },
  {
    id: 'krm-05',
    subject: 'Kriminalistika',
    topic: 'Zajištění zakázaných látek (OPL)',
    question: 'Jaký je stanovený postup při nálezu neznámé látky (prášek, tablety, rostlinná hmota) podezřelé z toho, že jde o omamnou nebo psychotropní látku (OPL)?',
    answer: 'Látky se nedotýkat holýma rukama (ani neochutnávat/nečichat), zajistit v rukavicích, popsat místo a okolnosti nálezu, provést orientační test (pokud je personál proškolen), zapečetit do důkazního obalu a předat k odborné expertíze PČR.',
    options: [
      'Látku okamžitě ochutnat na jazyku k ověření, zda je sladká.',
      'Látky se nedotýkat holýma rukama (ani neochutnávat/nečichat), zajistit v rukavicích, popsat místo a okolnosti nálezu, provést orientační test (pokud je personál proškolen), zapečetit do důkazního obalu a předat k odborné expertíze PČR.',
      'Spláchnout prášek do toalety a nikomu nic neříkat.',
      'Rozdat tablety ostatním odsouzeným.'
    ],
    correctOption: 1,
    rationale: 'Manipulace s neznámými látkami (např. syntetické opioidy, fentanyl) představuje riziko otravy i přes kůži. Zajištění se provádí v OOPP a stopa se předává s řetězcem návaznosti (Chain of Custody).',
    source: 'Metodický pokyn pro záchyt a dokumentaci OPL ve věznicích VS ČR'
  },
  {
    id: 'krm-06',
    subject: 'Kriminalistika',
    topic: 'Kriminalistická balistika',
    question: 'Jaké kriminalistické stopy vznikají při výstřelu ze služební střelné zbraně na místě střelby?',
    answer: 'Vystřelená nábojnice, vystřelená střela (projektil), povýstřelové zplodiny (GSR - olovo, baryum, antimon na rukou a oděvu střelce) a stopy po vmetcích a očuzení v okolí vstřelu.',
    options: [
      'Pouze zvuková vlna bez jakýchkoliv fyzických stop.',
      'Vystřelená nábojnice, vystřelená střela (projektil), povýstřelové zplodiny (GSR - olovo, baryum, antimon na rukou a oděvu střelce) a stopy po vmetcích a očuzení v okolí vstřelu.',
      'Otisk pneumatiky automobilu.',
      'Vzniká pouze kouř bez chemických zplodin.'
    ],
    correctOption: 1,
    rationale: 'Kriminalistická balistika a chemie zkoumá mikrostopové částice GSR a mechanoskopické stopy na nábojnici zanechané úderníkem, vytahovačem a vyhazovačem pro jednoznačnou identifikaci konkrétní zbraně.',
    source: 'Kriminalistická balistika – KÚ PČR'
  },
  {
    id: 'krm-07',
    subject: 'Kriminalistika',
    topic: 'Ohledání těla zemřelého',
    question: 'Kdo provádí ohledání těla zemřelé vězněné osoby a jaká je role příslušníků VS ČR na místě?',
    answer: 'Ohledání provádí koroner/lékař a policejní vyšetřovatel za účasti soudního lékaře; příslušníci VS ČR střeží prostor, zamezují vstupu a zajišťují bezpečnost vyšetřovacího týmu.',
    options: [
      'Ohledání provádí sám dozorce směny za pomoci kapesního nože.',
      'Ohledání provádí koroner/lékař a policejní vyšetřovatel za účasti soudního lékaře; příslušníci VS ČR střeží prostor, zamezují vstupu a zajišťují bezpečnost vyšetřovacího týmu.',
      'S tělem se manipuluje bez přítomnosti lékaře a ihned se pohřbí.',
      'Ohledání provádějí spoluvězni z cely.'
    ],
    correctOption: 1,
    rationale: 'Každé úmrtí ve věznici se vyšetřuje jako mimořádná událost za přítomnosti Policie ČR, GIBS a soudního lékaře k vyloučení cizího zavinění nebo pochybení personálu.',
    source: 'Trestní řád (§ 115) a směrnice pro řešení úmrtí ve věznicích VS ČR'
  },
  {
    id: 'krm-08',
    subject: 'Kriminalistika',
    topic: 'Zajištění mobilních telefonů a elektroniky',
    question: 'Jaký je správný postup při zajištění nalezeného nepovoleného mobilního telefonu ve věznici z hlediska digitální forenzní kriminalistiky?',
    answer: 'Telefon nevypínat/nezapínat, nezkoušet zadávat PIN (hrozí zablokování/smazání), vložit do stínícího obalu (Faradayova klec/sáček) k zamezení dálkového smazání a předat specialistům.',
    options: [
      'Okamžitě začít číst všechny soukromé SMS a volat na uložená čísla.',
      'Telefon nevypínat/nezapínat, nezkoušet zadávat PIN (hrozí zablokování/smazání), vložit do stínícího obalu (Faradayova klec/sáček) k zamezení dálkového smazání a předat specialistům.',
      'Telefon hodit do vody, aby se zničil virus.',
      'Zadat 10× libovolný kód pro zkoušku.'
    ],
    correctOption: 1,
    rationale: 'Stíněný obal brání dálkovému příkazu k vymazání paměti (Remote Wipe) přes síť. Digitální stopa musí zůstat v nezměněném stavu pro extrakci dat forenzním softwarem.',
    source: 'Metodika zajištění digitálních stop a komunikátorů VS ČR'
  },
  {
    id: 'krm-09',
    subject: 'Kriminalistika',
    topic: 'Mechanoskopické stopy',
    question: 'Co zkoumá kriminalistická mechanoskopie a jaké stopy se nejčastěji vyskytují při pokusu o překonání mříží či zámků ve věznici?',
    answer: 'Zkoumá stopy nástrojů (pilové listy, páčidla, paklíče); identifikuje stopy po řezání, pilování, páčení a vrypech na kovech pro ztotožnění použitého nástroje.',
    options: [
      'Zkoumá rukopis na dopisech vězňů.',
      'Zkoumá stopy nástrojů (pilové listy, páčidla, paklíče); identifikuje stopy po řezání, pilování, páčení a vrypech na kovech pro ztotožnění použitého nástroje.',
      'Zkoumá duševní stav pachatele.',
      'Zkoumá otisky pneumatik jízdních kol.'
    ],
    correctOption: 1,
    rationale: 'Mechanoskopické stopy umožňují mikroskopickým porovnáním mikroreliéfu břitu jednoznačně určit, kterým konkrétním pilníkem či nářadím byla vězeňská mříž přeřezána.',
    source: 'Kriminalistická mechanoskopie – KÚ PČR'
  },
  {
    id: 'krm-10',
    subject: 'Kriminalistika',
    topic: 'Kriminalistická fotografie a videozáznam',
    question: 'Jaké druhy fotografií se pořizují při dokumentaci místa mimořádné události?',
    answer: 'Fotografie orientační (širší okolí), přehledná (celé místo činu), polohová (vztah předmětů a stop) a detailní s měřítkem (metrická fotografie stopy kolmo k rovině).',
    options: [
      'Pouze umělecké portréty přítomných dozorců.',
      'Fotografie orientační (širší okolí), přehledná (celé místo činu), polohová (vztah předmětů a stop) a detailní s měřítkem (metrická fotografie stopy kolmo k rovině).',
      'Pouze černobílé snímky pořízené v noci bez blesku.',
      'Fotografie se v kriminalistice nepoužívají, stačí ústní popis.'
    ],
    correctOption: 1,
    rationale: 'Pravidla kriminalistické fotografie vyžadují systematický postup od celku k detailu. Detailní fotografie musí mít přiložené centimetrové měřítko a objektiv v ose 90°.',
    source: 'Metodika kriminalistické dokumentace VS ČR'
  },
  {
    id: 'krm-11',
    subject: 'Kriminalistika',
    topic: 'Výslech a vytěžení svědků',
    question: 'Jaký je rozdíl mezi operativním vytěžením osoby a procesním výslechem podle trestního řádu?',
    answer: 'Operativní vytěžení je neformální rozhovor k získání rychlých poznatků bez přímé procesní použitelnosti u soudu; procesní výslech dle TrŘ probíhá s řádným poučením a protokolací a slouží jako důkaz.',
    options: [
      'Operativní vytěžení se provádí v dole a výslech na policii.',
      'Operativní vytěžení je neformální rozhovor k získání rychlých poznatků bez přímé procesní použitelnosti u soudu; procesní výslech dle TrŘ probíhá s řádným poučením a protokolací a slouží jako důkaz.',
      'Vytěžení provádí pouze soudce a výslech pouze dozorce.',
      'Mezi těmito pojmy není žádný rozdíl.'
    ],
    correctOption: 1,
    rationale: 'Zatímco vytěžení slouží k operativnímu zorientování v situaci ve věznici, k usvědčení pachatele před soudem je nutný formální výslech dle § 91 a násl. trestního řádu.',
    source: 'Kriminalistická taktika a zákon č. 141/1961 Sb.'
  },
  {
    id: 'krm-12',
    subject: 'Kriminalistika',
    topic: 'Dohledový kamerový záznam (CCTV)',
    question: 'Jakým způsobem se zajišťuje videozáznam z kamerového systému věznice při dokumentaci napadení příslušníka nebo vězně?',
    answer: 'Záznam se vyexportuje v nezměněném nativním formátu s přesným časovým razítkem (hash kontrolní součet), uloží se na archivační médium a přiloží k vyšetřovacímu spisu jako digitální stopa.',
    options: [
      'Záznam se natočí mobilem z monitoru a původní soubor se smaže.',
      'Záznam se vyexportuje v nezměněném nativním formátu s přesným časovým razítkem (hash kontrolní součet), uloží se na archivační médium a přiloží k vyšetřovacímu spisu jako digitální stopa.',
      'Kamerové záznamy jsou u soudu zakázány jako důkaz.',
      'Záznam se sestříhá a podloží hudbou.'
    ],
    correctOption: 1,
    rationale: 'Forenzní integrita videozáznamu vyžaduje export originálního streamu včetně metadat a časové synchronizace, aby nebyla zpochybněna jeho pravost a souvislost.',
    source: 'Směrnice pro provoz a vytěžování kamerových systémů VS ČR'
  },
  {
    id: 'krm-13',
    subject: 'Kriminalistika',
    topic: 'Trasologie',
    question: 'Jaké druhy stop zkoumá kriminalistická trasologie na místě incidentu?',
    answer: 'Stopy bosých i obutých nohou (otisky a vtisk podrážek), stopy pneumatik vozidel, stopy chůze (chodidlová čára, úhel chůze) a stopy zvířat (služební pes).',
    options: [
      'Pouze stopy po střelách z pistole.',
      'Stopy bosých i obutých nohou (otisky a vtisk podrážek), stopy pneumatik vozidel, stopy chůze (chodidlová čára, úhel chůze) a stopy zvířat (služební pes).',
      'Pouze chemické složení léků.',
      'Otisky prstů na klávesnici.'
    ],
    correctOption: 1,
    rationale: 'Trasologie se zaměřuje na zkoumání stop pohybu. Zajišťuje se fotograficky s měřítkem, snímáním na želatinové fólie nebo sádrovým odléváním prostorových vtisků.',
    source: 'Kriminalistická trasologie – KÚ PČR'
  },
  {
    id: 'krm-14',
    subject: 'Kriminalistika',
    topic: 'Kriminalistická odorologie',
    question: 'Co je to kriminalistická odorologie a jak se zajišťuje pachová stopa na místě trestného činu ve věznici?',
    answer: 'Metoda zkoumání lidského pachu; pachová stopa se snímá přiložením sterilní pachové konzervy (speciální textilie ARATEX) zatížené alobalem na předmět po dobu min. 20–30 minut a uzavře do sklenice.',
    options: [
      'Zkoumání vůně vězeňského jídla před výdejem.',
      'Metoda zkoumání lidského pachu; pachová stopa se snímá přiložením sterilní pachové konzervy (speciální textilie ARATEX) zatížené alobalem na předmět po dobu min. 20–30 minut a uzavře do sklenice.',
      'Měření znečištění ovzduší v kuřárně.',
      'Pachové stopy se v ČR nesmějí odebírat.'
    ],
    correctOption: 1,
    rationale: 'Pachové konzervy slouží k následnému porovnání speciálně vycvičenými služebními psy Policie ČR metodou pachové komparace.',
    source: 'Pokyn policejního prezidenta o metodě pachové identifikace'
  },
  {
    id: 'krm-15',
    subject: 'Kriminalistika',
    topic: 'Spolupráce s GIBS a PČR',
    question: 'V jakých případech je vedení věznice povinno okamžitě postoupit vyšetřování incidentu Generální inspekci bezpečnostních sborů (GIBS)?',
    answer: 'Při podezření ze spáchání trestného činu příslušníkem nebo občanským zaměstnancem Vězeňské služby ČR dle zákona č. 341/2011 Sb.',
    options: [
      'Při každé rvačce mezi dvěma odsouzenými bez účasti personálu.',
      'Při podezření ze spáchání trestného činu příslušníkem nebo občanským zaměstnancem Vězeňské služby ČR dle zákona č. 341/2011 Sb.',
      'Pouze při ztrátě klíčů od skladu zeleniny.',
      'Při žádosti odsouzeného o přerušení trestu.'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 341/2011 Sb. o GIBS svěřuje vyšetřování trestné činnosti příslušníků bezpečnostních sborů (Policie ČR, VS ČR, Celní správa) výhradně do věcné příslušnosti GIBS.',
    source: 'Zákon č. 341/2011 Sb., o Generální inspekci bezpečnostních sborů'
  }
];
