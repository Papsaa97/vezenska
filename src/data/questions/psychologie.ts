import { Question } from '../../types';

export const psychologieQuestions: Question[] = [
  {
    id: 'psy-01',
    subject: 'Psychologie',
    topic: 'Pojem a historie psychologie',
    question: 'Co je to psychologie, jaký má cíl a z jakého vědního oboru se vyvinula?',
    answer: 'Psychologie (z řec. psyché = duše, logos = slovo/věda) je věda o duševním životě člověka. Cílem je porozumět chování, jednání a prožívání lidí, předvídat je a pomoci je formovat. Vyvinula se z filozofie (v novověku přispěl k osamostatnění Wilhelm Wundt založením 1. psychologické laboratoře v Lipsku roku 1879).',
    options: [
      'Aplikovaná přírodní věda zkoumající výhradně biochemické procesy v mozkové kůře a periferním nervovém systému za účelem medikamentózní léčby poruch, která se vyvinula z neurologie a animální fyziologie v polovině 19. století.',
      'Psychologie (z řec. psyché = duše, logos = slovo/věda) je věda o duševním životě člověka. Cílem je porozumět chování, jednání a prožívání lidí, předvídat je a pomoci je formovat. Vyvinula se z filozofie (v novověku přispěl k osamostatnění Wilhelm Wundt založením 1. psychologické laboratoře v Lipsku roku 1879).',
      'Normativní společenská disciplína zaměřená na zkoumání sociální stratifikace a institucionální represe v trestní justici, která se vyvinula z kriminologie a trestního práva hmotného na počátku 20. století.',
      'Empirická nauka zabývající se výhradně měřením psychomotorického tempa a somatických reakcí organismu na stresové podněty, která se osamostatnila z obecné antropologie a soudního lékařství.'
    ],
    correctOption: 1,
    rationale: 'Psychologie se řadí mezi společenské vědy. Zkoumá člověka ze dvou hledisek: vnitřního (prožívání – uvědomované sebepozorováním) a vnějšího (chování a jednání – navenek pozorovatelná a měřitelná aktivita).',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 3'
  },
  {
    id: 'psy-02',
    subject: 'Psychologie',
    topic: 'Struktura psychických jevů osobnosti',
    question: 'Jaké jsou hlavní skupiny psychických jevů osobnosti?',
    answer: '1. Psychické vlastnosti (temperament, charakter, schopnosti), 2. Psychické procesy (poznávací, paměťové, motivační – citové a volní), 3. Psychické stavy (stavy pozornosti, citové stavy, aktivační hladina), dále vědomosti, dovednosti, návyky, zájmy a postoje.',
    options: [
      '1. Kognitivní funkce (vnímání, pozornost, myšlení), 2. Somatické reflexy (podmíněné a nepodmíněné), 3. Patologické projevy (neurózy, psychopatie, psychózy), dále intelektový kvocient a typy vyšší nervové činnosti.',
      '1. Psychické vlastnosti (temperament, charakter, schopnosti), 2. Psychické procesy (poznávací, paměťové, motivační – citové a volní), 3. Psychické stavy (stavy pozornosti, citové stavy, aktivační hladina), dále vědomosti, dovednosti, návyky, zájmy a postoje.',
      '1. Psychické struktury (Id, Ego, Superego), 2. Psychodynamické obranné mechanismy (projekce, regrese, sublimace), 3. Afektivní reakce (panika, zlost, agrese), dále typologie temperamentu a behaviorální schémata.',
      '1. Reaktivní stavy (akutní reakce na stres, frustrační napětí), 2. Osobnostní dimenze (extroverze, neuroticismus, psychoticismus), 3. Intelektové dispozice (fluidní a krystalická inteligence), dále sociální postoje a role.'
    ],
    correctOption: 1,
    rationale: 'Psychické jevy tvoří integrovaný celek osobnosti. Poznávací procesy zahrnují vnímání, představivost, fantazii, myšlení a řeč; paměťové procesy zahrnují zapamatování, uchování a vybavení.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 7'
  },
  {
    id: 'psy-03',
    subject: 'Psychologie',
    topic: 'Pojem osobnost a její pojetí',
    question: 'Jak lze v psychologii chápat pojem osobnost (v širším a užším smyslu)?',
    answer: 'V širším slova smyslu je osobností každý člověk jako jednota tělesného a duševního. V užším slova smyslu je to osoba výjimečná, kterou společnost kladně hodnotí a obdivuje za její mimořádné kvality.',
    options: [
      'V širším slova smyslu je osobnost souhrnem biologických reflexů a vrozených instinktů. V užším slova smyslu představuje pouze dospělého jedince plně způsobilého k právním úkonům s dokončeným procesem socializace.',
      'V širším slova smyslu je osobností každý člověk jako jednota tělesného a duševního. V užším slova smyslu je to osoba výjimečná, kterou společnost kladně hodnotí a obdivuje za její mimořádné kvality.',
      'V širším slova smyslu je osobnost definována jako sociální status jedince ve skupině. V užším slova smyslu jde o psychologický konstrukt popisující výhradně introverzi a extraverzi dle Eysenckovy faktorové teorie.',
      'V širším slova smyslu představuje osobnost stabilní soubor charakterových rysů odolných vůči stresu. V užším slova smyslu se jedná o diagnostikovaný souhrn patologických odchylek a disociálních rysů jedince.'
    ],
    correctOption: 1,
    rationale: 'Osobnost představuje charakteristické vzorce myšlení, emocí a chování, které určují osobní styl jedince a ovlivňují jeho interakce s prostředím.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 7, 9'
  },
  {
    id: 'psy-04',
    subject: 'Psychologie',
    topic: 'Determinace osobnosti',
    question: 'Co je to biologická determinace a co sociální determinace osobnosti?',
    answer: 'Biologická determinace je podmíněnost vrozeným uspořádáním organismu, nervové soustavy a dědičností. Sociální determinace je vliv lidské kultury, sociálního okolí (rodiny), výchovy, vzdělávacích institucí a socializace („Bez společnosti lidí se člověk člověkem nestane“).',
    options: [
      'Biologická determinace je výhradně vliv prenatálního vývoje a somatotypu jedince. Sociální determinace představuje pouze formální sankční působení právního řádu a penitenciárních institucí na dospělého pachatele.',
      'Biologická determinace je podmíněnost vrozeným uspořádáním organismu, nervové soustavy a dědičností. Sociální determinace je vliv lidské kultury, sociálního okolí (rodiny), výchovy, vzdělávacích institucí a socializace („Bez společnosti lidí se člověk člověkem nestane“).',
      'Biologická determinace je utváření charakteru a volních vlastností v průběhu ontogeneze. Sociální determinace je vrozená typologie vyšší nervové činnosti a biologické dispozice k agresivnímu chování.',
      'Biologická determinace označuje osvojení sociálních rolí a norem prostřednictvím nápodoby. Sociální determinace představuje genetický přenos temperamentových rysů a psychických dispozic z rodičů na potomky.'
    ],
    correctOption: 1,
    rationale: 'Současná věda odmítá extrémy (např. lombrosiánské přeceňování vrozeného zločince i behavioristické přeceňování všemocnosti výchovy) a chápe osobnost jako syntézu biologických vloh a sociálního utváření.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 7, 55'
  },
  {
    id: 'psy-05',
    subject: 'Psychologie',
    topic: 'Socializace a její mechanismy',
    question: 'Co je to socializace a jaké jsou její 4 hlavní mechanismy?',
    answer: 'Socializace je proces přeměny biologické bytosti v bytost společenskou (interiorizace norem a exteriorizace chování). Mechanismy: 1. Sociální činnosti (hra, učení, práce), 2. Nápodoba/imitace (automatická a uvědomělá), 3. Identifikace/ztotožnění (obranná, emoční, projekce, racionalizace), 4. Sugesce.',
    options: [
      'Socializace je proces biologického zrání centrální nervové soustavy v ontogenezi. Mechanismy: 1. Podmiňování (klasické a operantní), 2. Senzomotorická habituace, 3. Kognitivní diferenciace, 4. Fyziologická regenerace.',
      'Socializace je proces přeměny biologické bytosti v bytost společenskou (interiorizace norem a exteriorizace chování). Mechanismy: 1. Sociální činnosti (hra, učení, práce), 2. Nápodoba/imitace (automatická a uvědomělá), 3. Identifikace/ztotožnění (obranná, emoční, projekce, racionalizace), 4. Sugesce.',
      'Socializace je proces institucionální adaptace jedince na podmínky totální instituce. Mechanismy: 1. Desocializace a ztráta identity, 2. Prizonizace, 3. Přijetí neformálního vězeňského kodexu, 4. Regrese chování.',
      'Socializace je formování intelektových schopností v edukačním procesu. Mechanismy: 1. Asimilace vědomostí, 2. Deduktivní usuzování, 3. Mnemotechnické operace, 4. Verbální komunikace a metakomplementární interakce.'
    ],
    correctOption: 1,
    rationale: 'Socializace je celoživotní proces sociálního učení a je nutnou podmínkou individualizace osobnosti. Klíčovými institucemi socializace jsou rodina, škola, vrstevníci a pracovní kolektiv.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 11–12'
  },
  {
    id: 'psy-06',
    subject: 'Psychologie',
    topic: 'Sociální adaptace a její techniky',
    question: 'Co je to sociální adaptace a jaké 4 techniky člověk volí při směřování k cíli?',
    answer: 'Sociální adaptace je aktivní a dynamické přizpůsobování se i přizpůsobování si společenského prostředí. Techniky: 1. Uspokojení (přímé dosažení cíle), 2. Obejití překážky (stanovení náhradního cíle při frustraci), 3. Agrese (snaha překážku rozbít), 4. Rezignace (vzdání se cíle).',
    options: [
      'Sociální adaptace je pasivní podřízení se skupinovému konformismu a vnějším normám. Techniky: 1. Konformita (přijetí cílů i prostředků), 2. Inovace, 3. Ritualismus (lpění na pravidlech), 4. Rebelie (snaha změnit systém dle Mertona).',
      'Sociální adaptace je aktivní a dynamické přizpůsobování se i přizpůsobování si společenského prostředí. Techniky: 1. Uspokojení (přímé dosažení cíle), 2. Obejití překážky (stanovení náhradního cíle při frustraci), 3. Agrese (snaha překážku rozbít), 4. Rezignace (vzdání se cíle).',
      'Sociální adaptace je homeostatické vyrovnávání neurofyziologického napětí v organismu. Techniky: 1. Boj (aktivní obranná reakce), 2. Útěk (stažení ze situace), 3. Ztuhnutí (freezing reflex), 4. Somatizace tenze.',
      'Sociální adaptace je osvojování penitenciárních vzorců jednání ve výkonu trestu. Techniky: 1. Užívání argotu, 2. Vytváření zájmových koalic, 3. Účelová simulace obtíží, 4. Racionální manipulace personálem.'
    ],
    correctOption: 1,
    rationale: 'Dobře adaptovaný člověk je citově zralý, reálně hodnotí své možnosti, ovládá své afekty a identifikuje se se sociálními rolemi odpovídajícími věku a postavení.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 13'
  },
  {
    id: 'psy-07',
    subject: 'Psychologie',
    topic: 'Výsledek socializace a maladaptace',
    question: 'Co je výsledkem dobré socializace a co je výsledkem špatné socializace (maladaptace)?',
    answer: 'Výsledkem dobré socializace je sociální adaptace (zralá, integrovaná osobnost dodržující společenské normy). Výsledkem špatné socializace je sociální maladaptace podle vzorce „idealismus → frustrace → demoralizace“, projevující se poruchami chování, neurózami, psychopatiemi a delikvencí.',
    options: [
      'Výsledkem dobré socializace je úplná konformita a nekritické podřízení se autoritě. Výsledkem špatné socializace je rozvoj organického psychosyndromu a výrazný pokles fluidní inteligence.',
      'Výsledkem dobré socializace je sociální adaptace (zralá, integrovaná osobnost dodržující společenské normy). Výsledkem špatné socializace je sociální maladaptace podle vzorce „idealismus → frustrace → demoralizace“, projevující se poruchami chování, neurózami, psychopatiemi a delikvencí.',
      'Výsledkem dobré socializace je vytvoření obranných mechanismů sublimace a vytěsnění. Výsledkem špatné socializace je výhradně somatické onemocnění v důsledku chronického distresu a syndromu vyhoření.',
      'Výsledkem dobré socializace je asimilace do sekundárních institucionálních struktur. Výsledkem špatné socializace je vývoj akutní psychotické poruchy s bludy a halucinacemi v zátěžové situaci.'
    ],
    correctOption: 1,
    rationale: 'Poruchy chování v dětském věku (lži, záškoláctví, krádeže, útěky) se dělí dle nebezpečnosti na disociální, asociální a antisociální a jsou častým předstupněm dospělé kriminality.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 12–14'
  },
  {
    id: 'psy-08',
    subject: 'Psychologie',
    topic: 'Sociální skupiny a jejich znaky',
    question: 'Co je to sociální skupina a jaké 4 základní znaky mají všechny skupiny společné?',
    answer: 'Skupina je sdružení dvou nebo více osob integrujících se při dosahování cílů se vzájemnou závislostí rolí a norem. Každá skupina má: 1. Společné cíle, 2. Určitou velikost, 3. Normy, kterými se řídí, 4. Sankce za porušení norem.',
    options: [
      'Skupina je prostorový shluk jedinců na jednom místě bez vzájemné interakce a cílů. Společné znaky: 1. Fyzická blízkost, 2. Shodná demografická kategorie, 3. Stejný věk členů, 4. Jednotný vnější vzhled.',
      'Skupina je sdružení dvou nebo více osob integrujících se při dosahování cílů se vzájemnou závislostí rolí a norem. Každá skupina má: 1. Společné cíle, 2. Určitou velikost, 3. Normy, kterými se řídí, 4. Sankce za porušení norem.',
      'Skupina je výhradně formální organizační složka zřízená zákonným předpisem. Společné znaky: 1. Písemný jednací řád, 2. Stanovená hierarchie hodností, 3. Finanční odměňování, 4. Právní odpovědnost.',
      'Skupina je agregát osob propojených výhradně emoční nákazou a sugescí. Společné znaky: 1. Úbytek inteligence, 2. Anonymita jednání, 3. Přítomnost charismatického vůdce, 4. Zvýšená agresivita.'
    ],
    correctOption: 1,
    rationale: 'Dále skupiny vykazují vnitřní dynamiku (vůdčí osoby, klima, kontakty) a rysy jako intimita, organizace, propustnost, disciplína a soudržnost.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 15, 17'
  },
  {
    id: 'psy-09',
    subject: 'Psychologie',
    topic: 'Charakteristika rodiny',
    question: 'Jak je charakterizována rodina z hlediska sociální psychologie?',
    answer: 'Rodina je malá (do 30–40 osob), primární (silné citové a intimní vazby), neformální a neprostupná skupina s pevnými vazbami, která je základní institucí socializace jedince.',
    options: [
      'Rodina je velká, sekundární, formální a plně prostupná skupina, která plní výhradně ekonomickou a materiálně zabezpečovací funkci v tržní společnosti.',
      'Rodina je malá (do 30–40 osob), primární (silné citové a intimní vazby), neformální a neprostupná skupina s pevnými vazbami, která je základní institucí socializace jedince.',
      'Rodina je středně velká, terciární, zájmová a přechodná skupina fungující na principu dobrovolného smluvního členství bez hlubších emocionálních vazeb.',
      'Rodina je malá, sekundární, referenční a formální instituce, jejímž jediným cílem je institucionální dohled a uplatňování právních sankcí vůči nedospělým členům.'
    ],
    correctOption: 1,
    rationale: 'Člověk se v rodině ocitá bez své vůle, přesto je pro něj po celý život nepostradatelným prostředím. Narušení vztahů v rodině mívá těžké následky na psychiku a vývoj.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 16, 18–19'
  },
  {
    id: 'psy-10',
    subject: 'Psychologie',
    topic: 'Komunikace a její roviny',
    question: 'Co je to komunikace a jaké 3 úrovně rozlišujeme u verbální komunikace?',
    answer: 'Komunikace je přenos myšlenek, emocí, postojů a jednání mezi lidmi. Úrovně verbální komunikace: 1. Suplementární (rovnováha, přítel-přítel), 2. Komplementární (dominantní x podřízený, např. nadřízený-podřízený), 3. Metakomplementární (dominantní úmyslně přenechává prostor druhému, např. terapeut-pacient).',
    options: [
      'Komunikace je proces výměny kódovaných informací. Úrovně verbální komunikace: 1. Monologická (jednosměrný tok), 2. Dialogická (obousměrná interakce), 3. Polylogická (skupinová panelová diskuse).',
      'Komunikace je přenos myšlenek, emocí, postojů a jednání mezi lidmi. Úrovně verbální komunikace: 1. Suplementární (rovnováha, přítel-přítel), 2. Komplementární (dominantní x podřízený, např. nadřízený-podřízený), 3. Metakomplementární (dominantní úmyslně přenechává prostor druhému, např. terapeut-pacient).',
      'Komunikace je neurofyziologický přenos signálů. Úrovně verbální komunikace: 1. Senzorická (příjem sluchem a zrakem), 2. Kognitivní (zpracování v kůře), 3. Motorická (artikulace mluvidel).',
      'Komunikace je předávání služebních pokynů v bezpečnostním sboru. Úrovně verbální komunikace: 1. Direktorní (rozkazovací), 2. Informativní (hlášení stavu), 3. Sankční (uložení kázeňského trestu).'
    ],
    correctOption: 1,
    rationale: 'Komunikace probíhá v rovině věcné (obsah sdělení) a rovině vztahové (vztah mezi komunikujícími). Záměna rovin nebo „čtení myšlenek“ vede k poruchám komunikace.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 24–25'
  },
  {
    id: 'psy-11',
    subject: 'Psychologie',
    topic: 'Neverbální komunikace',
    question: 'Z čeho se skládá neverbální komunikace a kolik procent celkového procesu komunikace tvoří?',
    answer: 'Tvoří 90–94 % celkového procesu komunikace. Zahrnuje mimiku (obličej), kineziku a gesta (pohyby těla a rukou), oční kontakt, paralingvistiku (tón, hlasitost, tempo, pauzy), proxemiku (vzdálenost), haptiku (doteky) a celkové držení těla.',
    options: [
      'Tvoří přibližně 50–55 % celkového procesu komunikace. Zahrnuje výhradně artikulační rychlost, slovní zásobu, syntaktickou stavbu vět a fonetické zabarvení hlasu mluvčího.',
      'Tvoří 90–94 % celkového procesu komunikace. Zahrnuje mimiku (obličej), kineziku a gesta (pohyby těla a rukou), oční kontakt, paralingvistiku (tón, hlasitost, tempo, pauzy), proxemiku (vzdálenost), haptiku (doteky) a celkové držení těla.',
      'Tvoří zanedbatelných 10–15 % komunikace. Zahrnuje pouze fyziologické vegetativní reakce organismu, jako je tepová frekvence, pocení dlaní a kožní galvanický reflex.',
      'Tvoří 70–75 % celkového procesu komunikace. Zahrnuje výhradně grafologické znaky rukopisu, styl oblékání, nošení doplňků a úpravu služebního stejnokroje.'
    ],
    correctOption: 1,
    rationale: 'Neverbální komunikace prozrazuje skutečné emoce a postoje lidí a podporuje nebo vyvrací věrohodnost slovního vyjádření (nesoulad signalizuje lež).',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 24, 26–29'
  },
  {
    id: 'psy-12',
    subject: 'Psychologie',
    topic: 'Styčná plocha a komunikační bariéry',
    question: 'Jak působí na komunikaci styčná plocha a jak komunikační bariéra? Uveďte příklady.',
    answer: 'Styčná plocha je společný základ (znalost jazyka, společné zájmy, porozumění), který komunikaci umožňuje a zefektivňuje. Komunikační bariéra komunikaci znesnadňuje či blokuje (např. bariéra jazyková, národnostní, sociální, věková, intelektová nebo charakterová).',
    options: [
      'Styčná plocha představuje formální služební předpis sjednocující terminologii, zatímco komunikační bariéra je výhradně stavebně-technická zábrana a mříž v návštěvní místnosti věznice.',
      'Styčná plocha je společný základ (znalost jazyka, společné zájmy, porozumění), který komunikaci umožňuje a zefektivňuje. Komunikační bariéra komunikaci znesnadňuje či blokuje (např. bariéra jazyková, národnostní, sociální, věková, intelektová nebo charakterová).',
      'Styčná plocha je asertivní technika hledání kompromisu při vyjednávání, zatímco komunikační bariéra je agresivní chování vyvolané abstinenčním syndromem u toxikomana.',
      'Styčná plocha je neverbální složka komunikace tvořící přes 90 % přenosu, zatímco komunikační bariéra je specifická fatická porucha způsobená organickou lézí řečových center mozku.'
    ],
    correctOption: 1,
    rationale: 'Ve vězeňství vznikají silné komunikační bariéry zejména při práci s cizinci (jazyk, odlišné kulturní vzorce) nebo u osob s mentálním deficitem a poruchami osobnosti.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 25, 62'
  },
  {
    id: 'psy-13',
    subject: 'Psychologie',
    topic: 'Sociální percepce a její chyby',
    question: 'Co je to sociální percepce, k čemu slouží a jaké jsou 3 typické chyby v sociální percepci?',
    answer: 'Sociální percepce je sociálně podmíněné vnímání sebe a druhých lidí, slouží k odhadu partnera a volbě strategie chování. Chyby: 1. Haló efekt (zobecnění podle jednoho nápadného znaku), 2. Golemovský efekt (podhodnocování podřízených), 3. Teorie atribuce (vlastní neúspěch svádím na okolí, cizí neúspěch na jeho neschopnost).',
    options: [
      'Sociální percepce je schopnost smyslového vnímání fyzických objektů v prostoru. Chyby: 1. Optická iluze, 2. Sluchová nedoslýchavost, 3. Taktilní hypestézie v důsledku periferní neuropatie.',
      'Sociální percepce je sociálně podmíněné vnímání sebe a druhých lidí, slouží k odhadu partnera a volbě strategie chování. Chyby: 1. Haló efekt (zobecnění podle jednoho nápadného znaku), 2. Golemovský efekt (podhodnocování podřízených), 3. Teorie atribuce (vlastní neúspěch svádím na okolí, cizí neúspěch na jeho neschopnost).',
      'Sociální percepce je standardizovaná diagnostická metoda měření emoční inteligence. Chyby: 1. Ebbinghausova křivka zapomínání, 2. Yerkes-Dodsonův zákon aktivace, 3. Weber-Fechnerův psychofyzikální zákon.',
      'Sociální percepce je proces utváření sociálních rolí ve vězeňské komunitě. Chyby: 1. Prizonizace odsouzených, 2. Deprivace základních potřeb, 3. Maladaptace na podmínky izolace.'
    ],
    correctOption: 1,
    rationale: 'Mezi další chyby patří: chyba prostředí (figura a pozadí), efekt setrvačnosti, první dojem, estetický stereotyp a soukromá teorie osobnosti.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 19–20'
  },
  {
    id: 'psy-14',
    subject: 'Psychologie',
    topic: 'Asertivita a asertivní techniky',
    question: 'Co je to asertivita a jaké známe základní asertivní techniky?',
    answer: 'Asertivita je zdravé, přiměřené sebeprosazení (jednání ani pasivní, ani agresivní). Techniky: Pokažená gramofonová deska, Otevřené dveře, Sebeotevření, Volné informace, Přijatý kompromis, Selektivní ignorování, Negativní aserce a Negativní dotazování („A co ti ještě vadí?“).',
    options: [
      'Asertivita je nátlakový autoritativní styl komunikace založený na demonstraci síly. Techniky: Zastrašování, Manipulativní lichocení, Ultimátum, Racionální vyčerpání a Argumentace ad hominem.',
      'Asertivita je zdravé, přiměřené sebeprosazení (jednání ani pasivní, ani agresivní). Techniky: Pokažená gramofonová deska, Otevřené dveře, Sebeotevření, Volné informace, Přijatý kompromis, Selektivní ignorování, Negativní aserce a Negativní dotazování („A co ti ještě vadí?“).',
      'Asertivita je psychoterapeutická metoda zaměřená na eliminaci úzkostných stavů. Techniky: Autogenní trénink, Progresivní svalová relaxace, Systematická desenzibilizace a Kognitivní restrukturalizace.',
      'Asertivita je nevědomý obranný mechanismus ega sloužící k redukci tenze. Techniky: Projekce viny, Regrese do dětství, Racionalizace selhání, Reaktivní výtvor a Vytěsnění do podvědomí.'
    ],
    correctOption: 1,
    rationale: 'Asertivita chrání příslušníka před manipulací, pocity viny a pomáhá řešit drobné konflikty bez citového zainteresování a bez narušení lidské důstojnosti.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 20, 22–23'
  },
  {
    id: 'psy-15',
    subject: 'Psychologie',
    topic: 'Dav, jeho znaky a klasifikace',
    question: 'Co je to dav, jaké má 4 základní znaky a jak se dělí?',
    answer: 'Dav je shromáždění značného počtu osob okolo středu společného zájmu. Znaky: anonymita, vláda citu (emocí), úbytek inteligence, úbytek osobní odpovědnosti. Dělí se na shluky (agresivní, výtržnické, únikové, přírůstkové/akvizitní, výrazové/expanzivní) a publika (záměrná, nahodilá).',
    options: [
      'Dav je organizovaná formální skupina s pevnou strukturou rolí. Znaky: racionální uvažování, vysoká sebekontrola, stálost cílů, individuální odpovědnost. Dělí se na jednotky pořádkové, zásahové a eskortní.',
      'Dav je shromáždění značného počtu osob okolo středu společného zájmu. Znaky: anonymita, vláda citu (emocí), úbytek inteligence, úbytek osobní odpovědnosti. Dělí se na shluky (agresivní, výtržnické, únikové, přírůstkové/akvizitní, výrazové/expanzivní) a publika (záměrná, nahodilá).',
      'Dav je primární skupina propojená hlubokými intimními vazbami. Znaky: empatie, altruismus, vysoká koheze, vzájemná tolerance. Dělí se na rodinné klany, profesní týmy a přátelské komunity.',
      'Dav je skupina osob trpících sdílenou duševní poruchou s bludy. Znaky: paranoidní ladění, halucinace, katatonické projevy, bradypsychismus. Dělí se na chronické psychotické shluky a neurotické skupiny.'
    ],
    correctOption: 1,
    rationale: 'Akce davu se vyznačuje psychickou nákazou (davová psychóza), sugescí a nápodobou. Fáze davu: 1. Formování (roste počet a emoce), 2. Vzrůst emocionality (přesvědčení o všemocnosti a beztrestnosti).',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 29–30'
  },
  {
    id: 'psy-16',
    subject: 'Psychologie',
    topic: 'Role jedince v davu',
    question: 'Jaké role mohou zastávat jednotlivci v davu a koho je nutné izolovat jako prvního?',
    answer: '1. Startéři (vůdci, iniciátoři, provokatéři – staví se do čela, podbízejí k akci; je nutné je vytipovat a izolovat jako první!), 2. Aktivní účastníci (snadno vznětliví, sugestibilní, rvou se), 3. Pomáhající účastníci (souhlasí, hecují, dodávají davu legitimitu), 4. Odporující účastníci (nestrhnou se, mohou akci zvrátit).',
    options: [
      '1. Formální velitelé (řídí postup podle plánu), 2. Spojovací personál (zajišťuje radiokomunikaci), 3. Záložní síly (čekají na povel k zákroku), 4. Dokumentační skupina (pořizuje videozáznam; je nutné ji izolovat jako první).',
      '1. Startéři (vůdci, iniciátoři, provokatéři – staví se do čela, podbízejí k akci; je nutné je vytipovat a izolovat jako první!), 2. Aktivní účastníci (snadno vznětliví, sugestibilní, rvou se), 3. Pomáhající účastníci (souhlasí, hecují, dodávají davu legitimitu), 4. Odporující účastníci (nestrhnou se, mohou akci zvrátit).',
      '1. Pasivní pozorovatelé (stojí na okraji a situaci sledují; nutno izolovat jako první), 2. Vyjednavači (tlumí emoce), 3. Evakuační asistenti (pomáhají zraněným), 4. Tiskoví mluvčí (informují veřejnost).',
      '1. Dominantní alfa jedinci (určují hierarchii), 2. Submisivní beta jedinci (přijímají sankce), 3. Marginalizovaní gama jedinci (stojí mimo dění), 4. Omega jedinci (obětní beránci; nutno izolovat jako první).'
    ],
    correctOption: 1,
    rationale: 'Startéři mívají nízkou úroveň právního vědomí a deformovaný hodnotový systém. Jejich včasná eliminace a izolace zamezí eskalaci nepokojů a vzniku davové psychózy.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 30–31'
  },
  {
    id: 'psy-17',
    subject: 'Psychologie',
    topic: 'Drogy a jejich dělení',
    question: 'Co je to droga a jak se drogy dělí podle účinku a podle původu?',
    answer: 'Droga je jakákoliv látka ovlivňující psychiku a prožívání, která může vyvolat závislost. Dělení dle účinku: Opiáty, Konopné látky, Tlumivé látky, Stimulancia, Halucinogeny, Těkavé látky. Dělení dle vzniku: přírodní, syntetické a polosyntetické.',
    options: [
      'Droga je výhradně chemicky syntetizované léčivo podléhající lékařskému předpisu. Dělení dle účinku: Analgetika, Antibiotika, Antidepresiva, Antipsychotika, Anestetika. Dělení dle vzniku: rostlinné a minerální.',
      'Droga je jakákoliv látka ovlivňující psychiku a prožívání, která může vyvolat závislost. Dělení dle účinku: Opiáty, Konopné látky, Tlumivé látky, Stimulancia, Halucinogeny, Těkavé látky. Dělení dle vzniku: přírodní, syntetické a polosyntetické.',
      'Droga je jakákoli jedovatá látka způsobující okamžitou zástavu dechu. Dělení dle účinku: Neurotoxiny, Hemotoxiny, Cytotoxiny, Karcinogeny. Dělení dle vzniku: anorganické plyny, organické roztoky a krystalické sloučeniny.',
      'Droga je psychoaktivní substance způsobující výhradně psychickou závislost bez somatických projevů. Dělení dle účinku: Sedativa, Hypnotika, Nootropika, Analeptika. Dělení dle vzniku: laboratorní a potravinářské.'
    ],
    correctOption: 1,
    rationale: 'Rozvoj závislosti probíhá v řetězci: 1. První kontakt → 2. Pokus (experiment) → 3. Zneužití (abúzus) → 4. Závislost. Na vzniku se podílí typ drogy, osobnost, sociální prostředí a spouštěcí podnět.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 38, 40, 45'
  },
  {
    id: 'psy-18',
    subject: 'Psychologie',
    topic: 'Projevy užití drog na zornicích',
    question: 'Jak se projevuje užití jednotlivých skupin drog na zornicích (zúžení vs. rozšíření)?',
    answer: 'Opiáty (morfin, heroin, braun, kodein) způsobují extrémní zúžení zornic (tzv. „špendlíková hlavička“). Naopak stimulancia (pervitin, kokain), halucinogeny (LSD, extáze), konopí a těkavé látky způsobují rozšíření zornic (mydriázu).',
    options: [
      'Opiáty a tlumivé látky vyvolávají výraznou mydriázu (rozšíření zornic nereagující na světlo), zatímco stimulancia (pervitin, kokain) a kanabinoidy vedou k extrémní mióze (zúžení zornic na špendlíkovou hlavičku).',
      'Opiáty (morfin, heroin, braun, kodein) způsobují extrémní zúžení zornic (tzv. „špendlíková hlavička“). Naopak stimulancia (pervitin, kokain), halucinogeny (LSD, extáze), konopí a těkavé látky způsobují rozšíření zornic (mydriázu).',
      'Všechny skupiny návykových látek způsobují patologickou anizokorii (nerovnoměrnou šíři zornic), kdy jedna zornice zůstává trvale zúžená a druhá rozšířená bez ohledu na aplikovanou substanci.',
      'Stimulancia a halucinogeny způsobují úplné vymizení zornicového reflexu se zúžením na 1 mm, zatímco opiáty a barbituráty vedou k přechodnému rozšíření zornic pouze při akomodaci na dálku.'
    ],
    correctOption: 1,
    rationale: 'Zkouška reakce zornic na světlo a jejich šířka je základním orientačním znakem pro příslušníka při podezření na intoxikaci vězněné osoby.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 41, 42, 43, 44, 45'
  },
  {
    id: 'psy-19',
    subject: 'Psychologie',
    topic: 'Nebezpečí způsobů aplikace drog',
    question: 'Který způsob aplikace drog je z hlediska aktuálního ohrožení života nejnebezpečnější a proč?',
    answer: 'Vdechování (čichání výparů těkavých látek), protože nelze odhadnout množství ani koncentraci výparů v plicích a může dojít k okamžitému předávkování, ochrnutí dýchacího centra a udušení.',
    options: [
      'Perorální aplikace (polykání tablet), protože v trávicím traktu dochází k okamžitému vstřebání celé dávky do krevního oběhu bez metabolické filtrace játry, což vyvolává rupturu žaludku.',
      'Vdechování (čichání výparů těkavých látek), protože nelze odhadnout množství ani koncentraci výparů v plicích a může dojít k okamžitému předávkování, ochrnutí dýchacího centra a udušení.',
      'Sublinguální aplikace (pod jazyk), protože sliznice dutiny ústní blokuje transport kyslíku a vyvolává akutní anafylaktoidní šok s uzávěrem dýchacích cest u většiny uživatelů.',
      'Transdermální aplikace (přes kůži náplastmi), protože látka prochází kožní bariérou nekontrolovanou rychlostí a způsobuje nevratnou nekrózu periferních nervových vláken.'
    ],
    correctOption: 1,
    rationale: 'Uživatelé těkavých látek (toluen, ředidla) navíc často inhalují v uzavřeném prostoru (pod dekou, s igelitovým sáčkem na hlavě), což riziko asfyxie ještě násobí.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 40, 45'
  },
  {
    id: 'psy-20',
    subject: 'Psychologie',
    topic: 'Závislost fyzická vs. psychická',
    question: 'Co je to závislost, jak se dělí na fyzickou a psychickou a jak se projevují?',
    answer: 'Závislost je silná, přemáhající touha užívat látku. Fyzická závislost = látka je zahrnuta do metabolismu, vysazení vyvolá tělesný abstinenční syndrom (třes, křeče, zvracení, pocení). Psychická závislost = neodolatelné nutkání a touha bez tělesných křečí po vysazení.',
    options: [
      'Závislost je přechodný stav zvýšené tolerance na běžná léčiva. Fyzická závislost se projevuje pouze změnou nálady a nespavostí, psychická závislost vyvolává těžké klonicko-tonické křeče a kolaps oběhu.',
      'Závislost je silná, přemáhající touha užívat látku. Fyzická závislost = látka je zahrnuta do metabolismu, vysazení vyvolá tělesný abstinenční syndrom (třes, křeče, zvracení, pocení). Psychická závislost = neodolatelné nutkání a touha bez tělesných křečí po vysazení.',
      'Závislost je geneticky podmíněná neschopnost odbourávat alkohol v játrech. Fyzická složka představuje vyhledávání komunity uživatelů, psychická složka je výhradně enzymatický jaterní deficit.',
      'Závislost je krátkodobý návyk vznikající výhradně u jedinců s lehkou mentální retardací. Fyzická i psychická složka mají identický průběh spočívající pouze v přechodném poklesu kognitivních funkcí.'
    ],
    correctOption: 1,
    rationale: 'Závislost vede k degradaci osobnosti, ztrátě zájmů, rozpadu sociálních vazeb a kriminálnímu jednání za účelem obstarání drogy.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 38–39'
  },
  {
    id: 'psy-21',
    subject: 'Psychologie',
    topic: 'Nelátkové (behaviorální) závislosti',
    question: 'Co jsou to nelátkové (behaviorální) závislosti a jaké jsou jejich příklady?',
    answer: 'Závislosti na procesech a činnostech, které přinášejí příjemný prožitek, bez užívání chemických substancí. Příklady: patologické hráčství (gambling), závislost na internetu/sociálních sítích, workoholismus, oniomanie (nakupování), hypersexualita, závislost na jídle.',
    options: [
      'Závislosti vznikající abúzem syntetických designer drugs a stimulancií bez obsahu přírodních alkaloidů. Příklady: užívání mefedronu, syntetických kanabinoidů, fentanylu a čichání toluenu.',
      'Závislosti na procesech a činnostech, které přinášejí příjemný prožitek, bez užívání chemických substancí. Příklady: patologické hráčství (gambling), závislost na internetu/sociálních sítích, workoholismus, oniomanie (nakupování), hypersexualita, závislost na jídle.',
      'Psychotické poruchy s bludnou produkcí a halucinacemi vznikající bez přítomnosti závislostního chování. Příklady: paranoidní schizofrenie, bipolární afektivní porucha a schizoafektivní psychóza.',
      'Vrozené poruchy osobnosti charakterizované trvale sníženou frustrační tolerancí a impulzivitou. Příklady: emočně nestabilní, disociální, histriónská a narcistická porucha osobnosti.'
    ],
    correctOption: 1,
    rationale: 'Nelátkové závislosti vykazují stejné znaky jako látkové (význačnost, změny nálady, růst tolerance, abstinenční tenze, konflikty a relapsy).',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 47–48'
  },
  {
    id: 'psy-22',
    subject: 'Psychologie',
    topic: 'Stadia alkoholismu podle Jellineka',
    question: 'Jaká jsou 4 vývojová stadia alkoholismu (podle Jellineka)?',
    answer: '1. Počáteční stadium (příležitostné pití pro euforii, roste tolerance), 2. Varovné stadium (alkohol jako droga, občasná opilost, paměťová okénka), 3. Rozhodující stadium (ztráta kontroly v pití, racionalizace, podřízení života alkoholu), 4. Konečné stadium (vícedenní tahy, pokles tolerance, tělesná a duševní deteriorace, debakl).',
    options: [
      '1. Experimentální stadium (ochutnávání alkoholu), 2. Sociální stadium (pití ve skupině), 3. Habituální stadium (pravidelné večerní dávky), 4. Remisní stadium (spontánní abstinence a obnova jaterních funkcí).',
      '1. Počáteční stadium (příležitostné pití pro euforii, roste tolerance), 2. Varovné stadium (alkohol jako droga, občasná opilost, paměťová okénka), 3. Rozhodující stadium (ztráta kontroly v pití, racionalizace, podřízení života alkoholu), 4. Konečné stadium (vícedenní tahy, pokles tolerance, tělesná a duševní deteriorace, debakl).',
      '1. Latentní stadium (bez zjevných symptomů), 2. Neurotické stadium (úzkosti a deprese), 3. Psychotické stadium (delirium tremens a alkoholická halucinóza), 4. Somatické stadium (cirhóza jater bez psychických změn).',
      '1. Prodromální stadium (abúzus nízkoalkoholických nápojů), 2. Kompenzované stadium (zachování pracovní schopnosti), 3. Dekompenzované stadium (ztráta zaměstnání), 4. Terminální stadium (ochranné ústavní léčení).'
    ],
    correctOption: 1,
    rationale: 'Pojem „debakl“ v konečném stadiu znamená stav bezvýchodnosti: bez alkoholu to dál nejde (těžký absťák), ale s alkoholem už také ne (orgánový a osobnostní kolaps).',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 46–47'
  },
  {
    id: 'psy-23',
    subject: 'Psychologie',
    topic: 'Fáze patologického hráčství (gamblingu)',
    question: 'Jaké jsou 3 základní vývojové fáze gamblerství a jak se liší gambler od toxikomana?',
    answer: 'Fáze: 1. Fáze výher (počáteční náhodná výhra, nárůst tempa hry), 2. Fáze proher (zadlužování, tajení pravdy, ztráta hodnoty peněz, lži), 3. Fáze zoufalství (trestná činnost, rozpad rodiny, panika, sebevražedné pokusy). Na rozdíl od toxikomana si gambler dlouho zachovává šarm a dbá o zevnějšek, aby si mohl půjčovat peníze.',
    options: [
      'Fáze: 1. Fáze experimentu (sázení malých částek), 2. Fáze závislosti (každodenní hra), 3. Fáze abstinence (ambulantní léčba). Gambler vykazuje okamžitý somatický úpadek, tremor rukou a zanedbaný vzhled již v počátku.',
      'Fáze: 1. Fáze výher (počáteční náhodná výhra, nárůst tempa hry), 2. Fáze proher (zadlužování, tajení pravdy, ztráta hodnoty peněz, lži), 3. Fáze zoufalství (trestná činnost, rozpad rodiny, panika, sebevražedné pokusy). Na rozdíl od toxikomana si gambler dlouho zachovává šarm a dbá o zevnějšek, aby si mohl půjčovat peníze.',
      'Fáze: 1. Fáze euforie (radost ze sázení), 2. Fáze agrese (fyzické útoky na automaty), 3. Fáze apatie (naprostý nezájem o finanční prostředky). Gambler se od toxikomana neliší, oba vykazují stejné toxické poškození CNS.',
      'Fáze: 1. Fáze kompenzace (kontrolované sázení), 2. Fáze dekompenzace (ztráta rodinného zázemí), 3. Fáze terminální (úmrtí na předávkování). Gambler na rozdíl od toxikomana nikdy nepáchá majetkovou kriminalitu.'
    ],
    correctOption: 1,
    rationale: 'Patologický hráč splňuje 6 znaků: význačnost, změny nálady, růst tolerance, abstinenční příznaky (neklid mizí zahájením hry), konflikty a relapsy.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 48–49'
  },
  {
    id: 'psy-24',
    subject: 'Psychologie',
    topic: 'Náročné životní situace',
    question: 'Jaké jsou 4 základní typy náročných životních situací a jaké známe druhy konfliktů?',
    answer: 'Typy situací: I. Konflikt rozhodování (volba mezi motivy/cíli), II. Frustrace (překážka na cestě k cíli), III. Deprivace (chronické neuspokojování potřeb – biologická, psychická, sociální, existenční), IV. Stres (přetížení adaptace – eustres vs. distres). Konflikty: vnější, vnitřní a vnějšně-vnitřní.',
    options: [
      'Typy situací: I. Agrese (fyzický útok), II. Panika (hromadný děs), III. Fobie (specifický strach), IV. Šok (cirkulační kolaps). Druhy konfliktů: verbální, fyzické, ozbrojené a mezinárodní.',
      'Typy situací: I. Konflikt rozhodování (volba mezi motivy/cíli), II. Frustrace (překážka na cestě k cíli), III. Deprivace (chronické neuspokojování potřeb – biologická, psychická, sociální, existenční), IV. Stres (přetížení adaptace – eustres vs. distres). Konflikty: vnější, vnitřní a vnějšně-vnitřní.',
      'Typy situací: I. Akutní intoxikace, II. Abstinenční syndrom, III. Prizonizační maladaptace, IV. Katatonický stupor. Druhy konfliktů: primární, sekundární a institucionální.',
      'Typy situací: I. Kognitivní disonance, II. Emoční labilita, III. Morální selhání, IV. Psychická deteriorace. Druhy konfliktů: vědomé, podvědomé, nevědomé a transcendentální.'
    ],
    correctOption: 1,
    rationale: 'Při frustraci nastupují obranné mechanismy: vytěsnění, potlačení, projekce, agrese, racionalizace, kompenzace, regrese (návrat do dětského chování) a fantazie.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 35–38'
  },
  {
    id: 'psy-25',
    subject: 'Psychologie',
    topic: 'Forenzní psychologie a její podobory',
    question: 'Kým a čím se zabývá forenzní psychologie a jak se dělí na další podobory?',
    answer: 'Zabývá se chováním a prožíváním lidí v situacích uplatňování práva (pachatelé, oběti, svědci, soudci, policisté, příslušníci VS). Dělí se na: 1. Kriminalistickou PS (typologie pachatelů, motivace), 2. Soudní PS (soudní líčení, výslech, svědectví), 3. Penitenciární PS (vězeňská psychologie – VV a VTOS), 4. Postpenitenciární PS (reintegrace po propuštění).',
    options: [
      'Zabývá se výhradně laboratorní analýzou stop DNA a biologického materiálu na místě činu. Dělí se na: 1. Forenzní genetiku, 2. Forenzní toxikologii, 3. Forenzní balistiku, 4. Daktyloskopickou psychologii.',
      'Zabývá se chováním a prožíváním lidí v situacích uplatňování práva (pachatelé, oběti, svědci, soudci, policisté, příslušníci VS). Dělí se na: 1. Kriminalistickou PS (typologie pachatelů, motivace), 2. Soudní PS (soudní líčení, výslech, svědectví), 3. Penitenciární PS (vězeňská psychologie – VV a VTOS), 4. Postpenitenciární PS (reintegrace po propuštění).',
      'Zabývá se psychoterapií hospitalizovaných pacientů v civilních psychiatrických léčebnách. Dělí se na: 1. Psychoanalýzu, 2. Kognitivně-behaviorální terapii, 3. Gestalt psychologii, 4. Existenciální logoterapii.',
      'Zabývá se statistickým zkoumáním recidivy a tvorbou zákonných trestních sazeb. Dělí se na: 1. Penologii, 2. Kriminologii, 3. Viktimologii, 4. Trestní právo procesní.'
    ],
    correctOption: 1,
    rationale: 'Forenzní psychologie aplikuje psychologické poznatky do všech fází trestního řízení, výkonu vazby, výkonu trestu i následné péče.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 5, 52'
  },
  {
    id: 'psy-26',
    subject: 'Psychologie',
    topic: 'Typologie pachatele trestných činů',
    question: 'Jak lze dělit pachatele trestné činnosti z pohledu forenzní psychologie?',
    answer: '1. Socializovaný (normální) typ (epizodický čin, zachované svědomí, lítost), 2. Deviantně socializovaný typ (gangy, organizovaný zločin, normy party), 3. Neurotický typ (mladistvý protest, z pocitu viny, z potřeby uznání, kleptomanie), 4. Psychopatický typ (porucha osobnosti, bezcitnost), 5. Mentálně nedostačivý typ (nízké IQ, primitivní), 6. Psychotický typ (duševní choroba, bludy, nepříčetnost).',
    options: [
      '1. Sangvinický typ (páchá trestné činy z lehkomyslnosti), 2. Cholerický typ (páchá násilí v afektu), 3. Flegmatický typ (plánuje promyšlené podvody), 4. Melancholický typ (páchá majetkovou kriminalitu ze zoufalství).',
      '1. Socializovaný (normální) typ (epizodický čin, zachované svědomí, lítost), 2. Deviantně socializovaný typ (gangy, organizovaný zločin, normy party), 3. Neurotický typ (mladistvý protest, z pocitu viny, z potřeby uznání, kleptomanie), 4. Psychopatický typ (porucha osobnosti, bezcitnost), 5. Mentálně nedostačivý typ (nízké IQ, primitivní), 6. Psychotický typ (duševní choroba, bludy, nepříčetnost).',
      '1. Prvopachatelé (trest do 1 roku), 2. Recidivisté (trest od 1 do 5 let), 3. Zvlášť nebezpeční recidivisté (trest nad 10 let), 4. Mladiství delikventi (věk 15 až 18 let).',
      '1. Introvertní pachatelé (odmítají vypovídat), 2. Extrovertní pachatelé (doznávají se k činu), 3. Ambivertní pachatelé (spolupracují jako svědci), 4. Neurotičtí pachatelé (vykazují kverulační tendence).'
    ],
    correctOption: 1,
    rationale: 'Znalost typologie umožňuje personálu volit odpovídající přístup při zacházení a bezpečnostních opatřeních.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 52–55'
  },
  {
    id: 'psy-27',
    subject: 'Psychologie',
    topic: 'Příčiny páchání trestné činnosti',
    question: 'Jak se dělí příčiny páchání trestné činnosti (patogenní činitelé vnitřní a vnější)?',
    answer: 'Vnitřní (endogenní): dědičné vlivy, typ nervové soustavy, snížené rozumové schopnosti, nekompenzované defekty, ADHD/LMD, psychopatie, psychózy. Vnější (exogenní): rozvrácená rodina a alkoholismus rodičů, selhání školy, negativní party, drastická média a násilí ve filmech, vliv závislostí.',
    options: [
      'Vnitřní činitelé: výhradně úroveň měsíčního příjmu a formální vzdělání. Vnější činitelé: makroekonomická situace, roční období, geografická poloha a hustota zalidnění v regionu.',
      'Vnitřní (endogenní): dědičné vlivy, typ nervové soustavy, snížené rozumové schopnosti, nekompenzované defekty, ADHD/LMD, psychopatie, psychózy. Vnější (exogenní): rozvrácená rodina a alkoholismus rodičů, selhání školy, negativní party, drastická média a násilí ve filmech, vliv závislostí.',
      'Vnitřní činitelé: vliv kriminální subkultury a delikventní party. Vnější činitelé: genetické chromozomální anomálie (syndrom XYY) a vrozené organické poškození mozkové tkáně.',
      'Vnitřní činitelé: absence fyzických bezpečnostních bariér a mříží. Vnější činitelé: nedostatečná kontrolní činnost orgánů činných v trestním řízení a nízké trestní sazby.'
    ],
    correctOption: 1,
    rationale: 'Kriminalita je výsledkem multidisciplinárního působení biologických, psychologických i sociálních faktorů.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 55–56'
  },
  {
    id: 'psy-28',
    subject: 'Psychologie',
    topic: 'Reakce obviněných ve výkonu vazby (VV)',
    question: 'Jaké jsou 3 nejčastější typy reakcí obviněných na zátěžovou situaci vazby?',
    answer: '1. Reakce trestající navenek (agrese proti personálu – útok, stížnosti/kverulace; šikana spoluvězňů), 2. Reakce trestající dovnitř (sebeobviňování, sebepoškozování/pořezání k redukci tenze, hladovky, pokusy o suicidium), 3. Reakce netrestající / úniky (fyzický útěk, přiznání i nespáchaného, sebeizolace, únik do fantazie, vazební psychóza).',
    options: [
      '1. Reakce asertivní (věcná komunikace s vychovatelem), 2. Reakce kooperativní (okamžité plnění režimových povinností), 3. Reakce relaxační (využití volného času ke studiu a autogennímu tréninku).',
      '1. Reakce trestající navenek (agrese proti personálu – útok, stížnosti/kverulace; šikana spoluvězňů), 2. Reakce trestající dovnitř (sebeobviňování, sebepoškozování/pořezání k redukci tenze, hladovky, pokusy o suicidium), 3. Reakce netrestající / úniky (fyzický útěk, přiznání i nespáchaného, sebeizolace, únik do fantazie, vazební psychóza).',
      '1. Reakce manická (zvýšená aktivita a psychomotorické tempo), 2. Reakce hysterická (teatrální záchvaty), 3. Reakce obsedantní (kompulzivní úklid cely a počítání mříží).',
      '1. Reakce fázická (cyklické střídání nálad), 2. Reakce strukturální (přijetí hierarchie vězeňské subkultury), 3. Reakce kompenzační (podávání žádostí o přemístění do jiné vazební věznice).'
    ],
    correctOption: 1,
    rationale: 'S délkou pobytu ve vazbě klesá věrohodnost výpovědi obviněného (nárůst obranných mechanismů racionalizace a projekce). Pozitivně působí volná vazba, kontakt s obhájcem a krizová intervence.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 65–66'
  },
  {
    id: 'psy-29',
    subject: 'Psychologie',
    topic: 'Způsoby přizpůsobení se VTOS podle Čepeláka',
    question: 'Jakých 5 typů adaptace na podmínky VTOS vymezil Jiří Čepelák?',
    answer: '1. Realistické přizpůsobení (zralý, odolný, motivace ke změně a podmíněnému propuštění), 2. Agresivně nepřátelské („proti všem“, napadání, ironie), 3. Přizpůsobení nepřiměřenou kompenzací (hraje „velkého zločince“), 4. Přizpůsobení nepřiměřenou projekcí (obviňuje druhé, popírá vinu), 5. Přizpůsobení únikem (denní snění, alkohol, drogy).',
    options: [
      '1. Konformní přizpůsobení (přijetí trestního rozsudku), 2. Inovativní (hledání nelegálních výhod), 3. Ritualistické (mechanické plnění řádu), 4. Únikové (stažení do sebe), 5. Rebelské (otevřená vzpoura dle Mertona).',
      '1. Realistické přizpůsobení (zralý, odolný, motivace ke změně a podmíněnému propuštění), 2. Agresivně nepřátelské („proti všem“, napadání, ironie), 3. Přizpůsobení nepřiměřenou kompenzací (hraje „velkého zločince“), 4. Přizpůsobení nepřiměřenou projekcí (obviňuje druhé, popírá vinu), 5. Přizpůsobení únikem (denní snění, alkohol, drogy).',
      '1. Sangvinické (optimistický postoj k trestu), 2. Cholerické (výbuchy hněvu při kontrolách), 3. Flegmatické (naprostá netečnost k výchovnému působení), 4. Melancholické (stálá skleslost a pláč), 5. Smíšené přizpůsobení.',
      '1. Primární adaptace (počáteční fáze trestu), 2. Sekundární adaptace (střední fáze trestu), 3. Prizonizační adaptace (úplné osvojení subkultury), 4. Předvýstupní adaptace (příprava na svobodu), 5. Postpenitenciární integrace.'
    ],
    correctOption: 1,
    rationale: 'Jiří Čepelák (významný odborník VÚPen) zdůraznil nutnost odborné diferenciace a zacházení; neodborné vedení vede k prohloubení patologických rysů osobnosti.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 57, 67'
  },
  {
    id: 'psy-30',
    subject: 'Psychologie',
    topic: 'Průběh krize z uvěznění',
    question: 'Jakých 5 stádií má typický průběh krize z uvěznění („šok z izolace“)?',
    answer: '1. Propuknutí krize (protestní křik, pláč, apatie, dezorientace), 2. Popírání krize (utlumenost, pozérství na siláka a ostříleného hocha), 3. Zajetí krizí / intruze (vtíravé negativní myšlenky), 4. Vyrovnání se s krizí (hledání adaptace, pokusy o náhradní uspokojení), 5. Odeznění krize (smíření se situací, schopnost myslet i na jiné věci).',
    options: [
      '1. Stadium popření reality, 2. Stadium hněvu a agrese vůči personálu, 3. Stadium smlouvání se soudem, 4. Stadium reaktivní deprese, 5. Stadium terminální akceptace (podle modelu Kübler-Rossové).',
      '1. Propuknutí krize (protestní křik, pláč, apatie, dezorientace), 2. Popírání krize (utlumenost, pozérství na siláka a ostříleného hocha), 3. Zajetí krizí / intruze (vtíravé negativní myšlenky), 4. Vyrovnání se s krizí (hledání adaptace, pokusy o náhradní uspokojení), 5. Odeznění krize (smíření se situací, schopnost myslet i na jiné věci).',
      '1. Fáze poplachové reakce (sympatikotonie), 2. Fáze rezistence (mobilizace adaptačních zdrojů), 3. Fáze vyčerpání (selhání adaptace a somatický kolaps organismu dle Hanse Selyeho).',
      '1. Akutní vazební šok (prvních 24 hodin), 2. Subakutní stadium (vyšetřovací fáze), 3. Chronické stadium (hlavní líčení), 4. Rozsudkové stadium (reakce na výši trestu), 5. Eskortní stadium (převoz do věznice).'
    ],
    correctOption: 1,
    rationale: 'Krize z uvěznění je deprivační situace vzniklá ztrátou svobody, rozpadem časoprostorové dimenze a ztrátou kontroly nad vlastním životem. Cizinci jí trpí ve větší míře.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 60–62'
  },
  {
    id: 'psy-31',
    subject: 'Psychologie',
    topic: 'Šikana ve vězeňském prostředí',
    question: 'Co je to šikana a jak se dělí na skrytou a zjevnou v prostředí věznice?',
    answer: 'Šikana je cílené a opakované užití násilí vůči jedinci/skupině, která se nemůže účinně bránit. Šikana skrytá = sociální izolace oběti, nálepkování (bonzák, koště, buk, neandrtálec/pako). Šikana zjevná = fyzické násilí (bití), psychické ponižování/vydírání (nucení k posluze, úsluhám) a ničení majetku oběti.',
    options: [
      'Šikana je jednorázový otevřený konflikt mezi rovnocennými vězni o vedoucí postavení na cele. Šikana skrytá = podávání stížností na personál. Šikana zjevná = hlasité hádky během vycházky na dvoře.',
      'Šikana je cílené a opakované užití násilí vůči jedinci/skupině, která se nemůže účinně bránit. Šikana skrytá = sociální izolace oběti, nálepkování (bonzák, koště, buk, neandrtálec/pako). Šikana zjevná = fyzické násilí (bití), psychické ponižování/vydírání (nucení k posluze, úsluhám) a ničení majetku oběti.',
      'Šikana je psychologický proces desocializace vyvolaný vězeňským řádem. Šikana skrytá = odmítání účasti na programech zacházení. Šikana zjevná = nedodržování zásad osobní hygieny a nepořádek na cele.',
      'Šikana je výhradně trestný čin vydírání páchaný organizovanou kriminální skupinou. Šikana skrytá = nelegální držení mobilního telefonu. Šikana zjevná = pokus o násilný útěk z výkonu trestu.'
    ],
    correctOption: 1,
    rationale: 'Šikana má vysokou latenci, oběti se bojí označení za „bonzáka“. VS ČR provádí preventivní zrakové prohlídky, lékařské kontroly a čtvrtletní vyhodnocování komisí za účasti vedení.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 70, 74'
  },
  {
    id: 'psy-32',
    subject: 'Psychologie',
    topic: 'Penitenciární psychologie',
    question: 'Čím se zabývá penitenciární psychologie a jaká je role vězeňského psychologa?',
    answer: 'Zabývá se psychologickými otázkami výkonu vazby a trestu (včetně alternativních trestů), osobností vězňů, interakcemi s personálem, vnitřní diferenciací, prevencí negativních jevů druhého života a psychologickou péčí o zaměstnance VS ČR. Vězeňský psycholog provádí diagnostiku, krizovou intervenci a ovlivňuje zařazování do cel a programů zacházení.',
    options: [
      'Zabývá se výhradně dokazováním viny u soudu a zpracováním znaleckých posudků o příčetnosti pachatele. Role psychologa spočívá ve vyšetřování trestných činů a rozhodování o propuštění vězňů.',
      'Zabývá se psychologickými otázkami výkonu vazby a trestu (včetně alternativních trestů), osobností vězňů, interakcemi s personálem, vnitřní diferenciací, prevencí negativních jevů druhého života a psychologickou péčí o zaměstnance VS ČR. Vězeňský psycholog provádí diagnostiku, krizovou intervenci a ovlivňuje zařazování do cel a programů zacházení.',
      'Zabývá se farmakologickou léčbou psychóz a předepisováním anxiolytik a antipsychotik vězněným osobám. Role psychologa spočívá v provádění lékařských vizit a řízení vězeňské nemocnice.',
      'Zabývá se fyzickou ostrahou věznice a taktikou služebních zákroků proti vzbouřeným odsouzeným. Role psychologa spočívá ve velení pořádkové jednotce a organizaci eskort do soudních budov.'
    ],
    correctOption: 1,
    rationale: 'Historicky významnou roli sehrál Výzkumný ústav penologický v Praze (VÚPen). Dnes jsou psychologové civilními specialisty působícími ve všech věznicích a vazebních věznicích.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 57, 62'
  },
  {
    id: 'psy-33',
    subject: 'Psychologie',
    topic: 'Automutilace a suicidium',
    question: 'Co znamenají pojmy automutilace a suicidium a jaký je mezi nimi zásadní rozdíl?',
    answer: 'Oba jsou poruchy jednání proti integritě organismu. Automutilace (sebepoškozování) nesměřuje k sebezničení/smrti, je účelová (redukce tenze, únik do nemocnice, nátlak na personál). Suicidium (sebevražedné jednání) směřuje k definitivnímu ukončení života (nejčastěji strangulací/oběšením, léky, pořezáním).',
    options: [
      'Automutilace je úmyslné usmrcení sebe sama pod vlivem akutní psychotické poruchy, zatímco suicidium představuje demonstrativní povrchové škrábnutí bez úmyslu zemřít, motivované snahou získat úlevu z práce.',
      'Oba jsou poruchy jednání proti integritě organismu. Automutilace (sebepoškozování) nesměřuje k sebezničení/smrti, je účelová (redukce tenze, únik do nemocnice, nátlak na personál). Suicidium (sebevražedné jednání) směřuje k definitivnímu ukončení života (nejčastěji strangulací/oběšením, léky, pořezáním).',
      'Automutilace označuje agresivní napadení jiné vězněné osoby na cele s následkem těžkého ublížení na zdraví, zatímco suicidium je trestný čin neposkytnutí pomoci spoluvězni v bezvědomí.',
      'Automutilace je somatické onemocnění projevující se samovolnou nekrózou tkání, zatímco suicidium je geneticky podmíněný typ temperamentu se zvýšeným prahem bolesti.'
    ],
    correctOption: 1,
    rationale: 'Rizikové faktory suicidia: pokusy v anamnéze či rodině, beznaděj, chronická nemoc, abúzus alkoholu/drog, osamělost, věk nad 40 let a mužské pohlaví.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 74–76'
  },
  {
    id: 'psy-34',
    subject: 'Psychologie',
    topic: 'Způsoby řešení konfliktů',
    question: 'Jaké mohou být základní způsoby řešení konfliktů a jaký je správný postup řešení?',
    answer: 'Příklady řešení: 1. Tvrdé vyjednávání (vítěz x poražený), 2. Měkké vyjednávání / kompromis (dohoda 50:50, oboustranný ústupek), 3. Neřešení (únik, oddalování problému). Správný postup: 1. Nepřipustit afektivní reakci (potlačit citový tlak, zapojit myšlení), 2. Racionalizace konfliktu, 3. Změna citového postoje k cílům.',
    options: [
      'Příklady řešení: 1. Autoritativní represe (okamžité použití donucovacích prostředků), 2. Ignorování (přehlížení incidentu), 3. Arbitrážní řízení. Správný postup: 1. Vyčkání bez zásahu, 2. Podání trestního oznámení, 3. Izolace celé ubytovny.',
      'Příklady řešení: 1. Tvrdé vyjednávání (vítěz x poražený), 2. Měkké vyjednávání / kompromis (dohoda 50:50, oboustranný ústupek), 3. Neřešení (únik, oddalování problému). Správný postup: 1. Nepřipustit afektivní reakci (potlačit citový tlak, zapojit myšlení), 2. Racionalizace konfliktu, 3. Změna citového postoje k cílům.',
      'Příklady řešení: 1. Agresivní konfrontace (prosazení dominance silou), 2. Submisivní kapitulace (přijetí všech podmínek oponenta), 3. Manipulace. Správný postup: 1. Emoční ventilace křikem, 2. Polarizace stran, 3. Zesílení sankcí.',
      'Příklady řešení: 1. Kognitivní restrukturalizace, 2. Transakční analýza, 3. Desenzibilizace podnětů. Správný postup: 1. Okamžitá konfrontace před ostatními vězni, 2. Prosazení vlastního řešení bez diskuse, 3. Formální zápis do knihy služeb.'
    ],
    correctOption: 1,
    rationale: 'Konflikty je třeba řešit věcně a včas, ne je oddalovat. Příslušník musí jednat profesionálně a nenechat se strhnout k emocionální nebo verbální agresi.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 36–37, 72'
  },
  {
    id: 'psy-35',
    subject: 'Psychologie',
    topic: 'Poruchy osobnosti a agresivita',
    question: 'Které poruchy osobnosti (psychopatie) se mohou nejčastěji projevovat agresivním a násilným chováním?',
    answer: 'Disociální porucha osobnosti (nerespektuje normy, egoismus, nízká frustrační tolerance, afektivní výbuchy násilí, slabé svědomí), Emočně nestabilní porucha osobnosti (impulzivní jednání, neovladatelný hněv a násilí bez plánování) a Paranoidní porucha osobnosti (vztahovačnost, nepřátelství, pocit ohrožení a domnělá příkoří).',
    options: [
      'Anankastická porucha osobnosti (nadměrný sklon k pořádku a perfekcionismus), Vyhýbavá porucha osobnosti (sociální plachost a strach z kritiky) a Závislá porucha osobnosti (neschopnost samostatného rozhodování).',
      'Disociální porucha osobnosti (nerespektuje normy, egoismus, nízká frustrační tolerance, afektivní výbuchy násilí, slabé svědomí), Emočně nestabilní porucha osobnosti (impulzivní jednání, neovladatelný hněv a násilí bez plánování) a Paranoidní porucha osobnosti (vztahovačnost, nepřátelství, pocit ohrožení a domnělá příkoří).',
      'Schizoidní porucha osobnosti (citový chlad, uzavřenost a nezájem o mezilidské vztahy), Histriónská porucha osobnosti (teatrálnost a dramatizace) a Narcistická porucha osobnosti bez agresivních rysů.',
      'Výhradně organická mozková léze s demencí v pokročilém stádiu, mentální retardace lehkého stupně a obsedantně-kompulzivní neurotická porucha spojená s rituály.'
    ],
    correctOption: 1,
    rationale: 'V kriminální populaci tvoří psychopati cca 30 % (u recidivistů ještě více). Disociální a emočně nestabilní jedinci mají navíc zvýšené riziko abúzu návykových látek, které agresivitu dále eskalují.',
    source: 'Učební texty předmětu Psychologie, Akademie VS ČR 2023, str. 31–32, 54, 70'
  }
  ,
  // 46. Krizová komunikace - Deeskalace
  {
    id: 'psy-36',
    subject: 'Psychologie',
    topic: 'Krizová komunikace',
    question: 'Co je hlavním cílem verbální deeskalace při jednání s agresivním nebo afektivním vězněm?',
    answer: 'Snížit úroveň emočního napětí a agresivity, navázat kontakt, získat čas a zabránit fyzickému útoku bez nutnosti okamžitého použití donucovacích prostředků (pokud to bezpečnostní situace dovoluje).',
    options: [
      'Okamžitě křičet hlasitěji než vězeň, aby se ukázala dominance.',
      'Snížit úroveň emočního napětí a agresivity, navázat kontakt, získat čas a zabránit fyzickému útoku bez nutnosti okamžitého použití donucovacích prostředků (pokud to bezpečnostní situace dovoluje).',
      'Ignorovat vězně, odejít a zamknout ho, dokud se sám neuklidní.',
      'Slibovat vězni cokoliv, co chce, jen aby přestal křičet.'
    ],
    correctOption: 1,
    rationale: 'Verbální deeskalace je preferovaným prvotním postupem u afektivní agrese (nikoli instrumentální). Cílem je zklidnit fyziologické nabuzení útočníka (získat kontrolu nad situací).',
    source: 'Metodika krizové intervence VS ČR'
  },
  // 47. Stockholm syndrom
  {
    id: 'psy-37',
    subject: 'Psychologie',
    topic: 'Penitenciární psychologie',
    question: 'Co se v psychologii rozumí pod pojmem Stockholmský syndrom, který se může vyskytnout například při vzetí rukojmí?',
    answer: 'Specifická emoční reakce (obranný mechanismus), při níž si oběť (rukojmí) vytváří paradoxní pozitivní emoční vazbu nebo sympatie k pachateli (únosci) jako podvědomou strategii přežití.',
    options: [
      'Syndrom absolutní paniky a ztráty paměti u oběti trestného činu.',
      'Odmítnutí oběti spolupracovat s vyjednavači a policií z důvodu jazykové bariéry.',
      'Specifická emoční reakce (obranný mechanismus), při níž si oběť (rukojmí) vytváří paradoxní pozitivní emoční vazbu nebo sympatie k pachateli (únosci) jako podvědomou strategii přežití.',
      'Extrémní agresivita oběti, která se snaží pachatele okamžitě fyzicky zlikvidovat.'
    ],
    correctOption: 2,
    rationale: 'Tato reakce komplikuje záchranné operace, protože oběť může chránit únosce nebo odmítat pomoc policie. Vzniká z prožitého ohrožení života a následné "vděčnosti", že ji pachatel nezabil.',
    source: 'Základy psychologie pro bezpečnostní sbory'
  },
  // 48. Psychohygiena
  {
    id: 'psy-38',
    subject: 'Psychologie',
    topic: 'Syndrom vyhoření',
    question: 'Která z následujících technik je považována za efektivní součást psychohygieny pro prevenci syndromu vyhoření u příslušníků bezpečnostních sborů?',
    answer: 'Oddělování pracovního a osobního života, pravidelný odpočinek, fyzická aktivita, supervize/debriefing s kolegy nebo psychologem po náročných zákrocích a pěstování zájmů nesouvisejících se službou.',
    options: [
      'Pravidelná konzumace alkoholu po noční směně k uvolnění napětí.',
      'Práce přesčas a přijímání co nejvíce služeb k dosažení rychlého povýšení.',
      'Oddělování pracovního a osobního života, pravidelný odpočinek, fyzická aktivita, supervize/debriefing s kolegy nebo psychologem po náročných zákrocích a pěstování zájmů nesouvisejících se službou.',
      'Potlačování emocí a přesvědčení, že profesionál nesmí nikdy cítit strach nebo stres.'
    ],
    correctOption: 2,
    rationale: 'Syndrom vyhoření (Burnout) hrozí u pomáhajících a bezpečnostních profesí. Aktivní psychohygiena a schopnost zpracovat zátěž (debriefing) jsou klíčové pro dlouhodobé duševní zdraví.',
    source: 'Psychologie pro výkon služby (Metodika GŘ VS ČR)'
  },
  // 49. Manipulace vězni
  {
    id: 'psy-39',
    subject: 'Psychologie',
    topic: 'Sociální interakce',
    question: 'Jaké jsou nejčastější formy manipulace, kterými se vězni snaží ovlivnit personál (např. k získání výhod nebo zakázaných věcí)?',
    answer: 'Lichocení, zdůrazňování vzájemných sympatií, hraní na soucit, vyvolávání pocitu viny u dozorce, postupné testování hranic (drobné laskavosti) nebo naopak skryté zastrašování a vydírání.',
    options: [
      'Vždy pouze otevřené fyzické napadení bez předchozí komunikace.',
      'Lichocení, zdůrazňování vzájemných sympatií, hraní na soucit, vyvolávání pocitu viny u dozorce, postupné testování hranic (drobné laskavosti) nebo naopak skryté zastrašování a vydírání.',
      'Podávání písemných žádostí prostřednictvím advokáta.',
      'Odmítání stravy a protestní hladovky za účelem zvýšení platu personálu.'
    ],
    correctOption: 1,
    rationale: 'Manipulace je účelové jednání (často u psychopatických rysů osobnosti vězňů). Vězeň se snaží narušit profesionální odstup dozorce ("my versus oni") a zatáhnout ho do neformálního vztahu.',
    source: 'Penitenciární psychologie'
  },
  // 50. Prevence sebevražd (Presuicidální syndrom)
  {
    id: 'psy-40',
    subject: 'Psychologie',
    topic: 'Prevence suicidiálního jednání',
    question: 'Které tři složky tvoří Ringelův presuicidální syndrom (varovné signály před sebevraždou)?',
    answer: '1. Zúžení (zúžení vnímání možností, ztráta zájmů, izolace), 2. Zadržovaná agresivita (obrácená vůči sobě), 3. Suicidiální fantazie (časté myšlenky nebo mluvení o smrti a sebevraždě).',
    options: [
      '1. Nadměrná radost, 2. Rozdávání majetku, 3. Zvýšený apetit.',
      '1. Zúžení (zúžení vnímání možností, ztráta zájmů, izolace), 2. Zadržovaná agresivita (obrácená vůči sobě), 3. Suicidiální fantazie (časté myšlenky nebo mluvení o smrti a sebevraždě).',
      '1. Agresivita k okolí, 2. Plánování útěku, 3. Odmítání komunikace s policií.',
      'Tento syndrom v psychologii neexistuje.'
    ],
    correctOption: 1,
    rationale: 'Rozpoznání těchto tří signálů (uvedených Erwinem Ringelem) u vězně může personálu VS ČR pomoci včas odhalit riziko sebevraždy a zajistit psychologickou či psychiatrickou pomoc.',
    source: 'Metodika krizové intervence a prevence sebevražd VS ČR'
  }
];
