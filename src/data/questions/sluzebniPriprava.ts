import { Question } from '../../types';

export const sluzebniPripravaQuestions: Question[] = [
  {
    id: 'sp-01',
    subject: 'Služební příprava',
    topic: 'Použití donucovacích prostředků',
    question: 'Jaké jsou zákonné podmínky pro použití donucovacích prostředků (DP) dle § 17 zákona č. 555/1992 Sb.?',
    answer: 'K zajištění pořádku a bezpečnosti, k ochraně osob a majetku a proti maření účelu vazby/výkonu trestu; musí předcházet výzva „Jménem zákona!“ s výstrahou, ledaže je bezprostředně ohrožen život/zdraví a zákrok nesnese odkladu.',
    options: [
      'K překonání jakéhokoli odporu odsouzeného; výzva s výstrahou je povinná vždy a zákon z ní nepřipouští žádnou výjimku ani při přímém ohrožení života.',
      'K zajištění pořádku a bezpečnosti, k ochraně osob a majetku a proti maření účelu vazby/výkonu trestu; musí předcházet výzva „Jménem zákona!“ s výstrahou, ledaže je bezprostředně ohrožen život/zdraví a zákrok nesnese odkladu.',
      'Výhradně k odvrácení fyzického útoku na příslušníka; použití DP musí předem písemně schválit velitel směny nebo dozorující státní zástupce.',
      'Při jakémkoliv verbálním neuposlechnutí pokynu dozorce, přičemž výzva „Jménem zákona!“ postačí až po dokončení donucovacího zákroku.'
    ],
    correctOption: 1,
    rationale: 'Dle § 17 odst. 1 a odst. 3 zákona č. 555/1992 Sb. je příslušník oprávněn použít DP k zajištění pořádku a bezpečnosti a k ochraně osob. Zákroku musí předcházet zákonná výzva s výstrahou, ledaže je bezprostředně ohrožen život nebo zdraví a zákrok nesnese odkladu.',
    source: '§ 17 odst. 1 a 3 zákona č. 555/1992 Sb., o VS a JS ČR'
  },
  {
    id: 'sp-02',
    subject: 'Služební příprava',
    topic: 'Použití střelné zbraně',
    question: 'V jakých 5 taxativních případech je příslušník VS ČR oprávněn použít střelnou zbraň dle § 18 odst. 1 zákona č. 555/1992 Sb.?',
    answer: 'a) nutná obrana (život/zdraví), b) překonání odporu mařícího zákrok ohrožujícího životy, c) zamezení útěku vězněné osoby ze střeženého objektu/eskorty, d) odvrácení nebezpečného útoku na objekt po marné výzvě, e) zneškodnění nebezpečného zvířete.',
    options: [
      'a) nutná obrana majetku věznice, b) zastavení neuposlechnuvšího vozidla, c) varování před vstupem do věznice, d) vynucení poslušnosti při sčítání, e) zneškodnění dronu nad věznicí.',
      'a) nutná obrana (život/zdraví), b) překonání odporu mařícího zákrok ohrožujícího životy, c) zamezení útěku vězněné osoby ze střeženého objektu/eskorty, d) odvrácení nebezpečného útoku na objekt po marné výzvě, e) zneškodnění nebezpečného zvířete.',
      'a) odvrácení jakéhokoli útoku na dozorce, b) zamezení svévolného odchodu z nestřeženého pracoviště, c) usmrcení toulavého psa v okolí, d) vynucení otevření cely, e) při zásahu proti neozbrojené stávce.',
      'a) krajní nouze při požáru, b) zamezení vstupu nepovolaných osob na parkoviště soudu, c) zastavení prchajícího svědka, d) donucení k podrobení se osobní prohlídce, e) likvidace nebezpečného nákladu.'
    ],
    correctOption: 1,
    rationale: 'Paragraf 18 odst. 1 zákona č. 555/1992 Sb. taxativně vymezuje přesně 5 důvodů použití střelné zbraně pod písmeny a) až e). Použití zbraně je přípustné pouze tehdy, jestliže použití donucovacích prostředků by bylo zřejmě neúčinné (odst. 2).',
    source: '§ 18 odst. 1 zákona č. 555/1992 Sb., o VS a JS ČR'
  },
  {
    id: 'sp-03',
    subject: 'Služební příprava',
    topic: 'Katalog donucovacích prostředků',
    question: 'Které donucovací prostředky jsou taxativně vyjmenovány v § 17 zákona č. 555/1992 Sb.?',
    answer: 'Hmaty, chvaty, údery a kopy sebeobrany, předváděcí řetízky, pouta, poutací popruhy, pouta s poutacím opaskem, slzotvorný/elektrický prostředek, obušek, služební pes, vodní stříkač, zásahová výbuška, expanzní zbraně, úder zbraní, hrozba zbraní, varovný výstřel, vytlačování štítem/vozidlem a prostředek k zamezení prostorové orientace.',
    options: [
      'Hmaty a chvaty, gumový obušek, pouta, služební pes, přenosný vrhač sítě, paralyzující plyn a automatická palná zbraň s tlumičem.',
      'Hmaty, chvaty, údery a kopy sebeobrany, předváděcí řetízky, pouta, poutací popruhy, pouta s poutacím opaskem, slzotvorný/elektrický prostředek, obušek, služební pes, vodní stříkač, zásahová výbuška, expanzní zbraně, úder zbraní, hrozba zbraní, varovný výstřel, vytlačování štítem/vozidlem a prostředek k zamezení prostorové orientace.',
      'Pouta, předváděcí páky, elektrický obušek, slzotvorný granát s fragmentací, zastavovací hřeby a mechanická svěrací kazajka.',
      'Hmaty, údery a kopy sebeobrany, služební teleskopický obušek, pouta s řetízkem, paralyzér Taser, hypodermická uspávací puška a akustické dělo (LRAD).'
    ],
    correctOption: 1,
    rationale: 'Katalog DP v § 17 zákona č. 555/1992 Sb. je taxativní. Příslušník smí použít pouze zákonem schválené donucovací prostředky a musí volit ten nejmírnější, který postačí k dosažení účelu zákroku (subsidiarita).',
    source: '§ 17 zákona č. 555/1992 Sb., o VS a JS ČR'
  },
  {
    id: 'sp-04',
    subject: 'Služební příprava',
    topic: 'Zákonná omezení použití DP a zbraně',
    question: 'Vůči kterým osobám je příslušník povinen omezit použití DP a zbraně dle § 19 zákona č. 555/1992 Sb.?',
    answer: 'Vůči těhotným ženám, osobám vysokého věku, osobám se zjevným tělesným postižením a dětem mladším 15 let (smí použít pouze hmaty a chvaty, neohrožují-li bezprostředně život).',
    options: [
      'Vůči mladistvým do 18 let, osobám zbaveným svéprávnosti, cizím státním příslušníkům a osobám v ústavním léčení (nesmí se použít žádné DP včetně hmatů a chvatů).',
      'Vůči těhotným ženám, osobám vysokého věku, osobám se zjevným tělesným postižením a dětem mladším 15 let (smí použít pouze hmaty a chvaty, neohrožují-li bezprostředně život).',
      'Vůči ženám obecně, osobám starším 60 let a prvotrestaným odsouzeným (lze použít pouze slzotvorný sprej a pouta, nikoli obušek a psa).',
      'Vůči obviněným ve výkonu vazby a osobám s psychiatrickou diagnózou (povolena pouze hrozba namířenou střelnou zbraní a varovný výstřel).'
    ],
    correctOption: 1,
    rationale: 'Dle § 19 zákona č. 555/1992 Sb. smí příslušník proti zranitelným skupinám (těhotné, staří, postižení, děti <15 let) použít pouze hmaty a chvaty, s výjimkou případů, kdy útok těchto osob bezprostředně ohrožuje životy.',
    source: '§ 19 zákona č. 555/1992 Sb., o VS a JS ČR'
  },
  {
    id: 'sp-05',
    subject: 'Služební příprava',
    topic: 'Střelecká příprava – Pistole CZ 75 B / P-10 C',
    question: 'Jaký je stanovený postup bezpečné kontroly zbraně (vybití zbraně) u lapače střel?',
    answer: '1. Zbraň směřuje do lapače střel (úhel 45°), 2. Vyjmout zásobník, 3. Zkontrolovat nábojovou komoru (zrakem a hmatem), 4. Vypustit závěr, 5. Rána jistoty do lapače, 6. Zajistit/zasunout do pouzdra.',
    options: [
      '1. Zbraň směřuje do lapače, 2. Natáhnout závěr vzad a vypustit ránu jistoty, 3. Vyjmout zásobník, 4. Zkontrolovat komoru, 5. Zasunout do pouzdra.',
      '1. Zbraň směřuje do lapače střel (úhel 45°), 2. Vyjmout zásobník, 3. Zkontrolovat nábojovou komoru (zrakem a hmatem), 4. Vypustit závěr, 5. Rána jistoty do lapače, 6. Zajistit/zasunout do pouzdra.',
      '1. Zbraň směřuje do země, 2. Vyjmout zásobník, 3. Stisknout spoušť bez natažení závěru, 4. Vizuálně zkontrolovat výhozní okénko, 5. Zasunout zbraň do pouzdra.',
      '1. Zbraň směřuje do lapače střel, 2. Vyjmout zásobník, 3. Dvakrát promáčknout spoušť naprázdno, 4. Natáhnout závěr do zadní polohy a zajistit manuální pojistkou.'
    ],
    correctOption: 1,
    rationale: 'Základní bezpečnostní drill pro manipulaci se služební zbraní: Zbraň vždy směřuje do bezpečného prostoru/lapače, PRVNÍ je vyjmutí zásobníku, NÁSLEDUJE kontrola komory (dvojí kontrola: zrak + prst), vypuštění závěru a rána jistoty.',
    source: '§ 19 NGŘ č. 33/2019 a střelecký řád VS ČR'
  },
  {
    id: 'sp-06',
    subject: 'Služební příprava',
    topic: 'Střelecká příprava – CZ Scorpion EVO 3A1',
    question: 'Jaká je ráže a základní režimy střelby samopalu CZ Scorpion EVO 3A1 používaného u VS ČR?',
    answer: 'Ráže 9×19 mm Luger; režimy střelby: zajištěno (0), jednotlivé rány (1), tříranná dávka (3) a plně automatická střelba (∞).',
    options: [
      'Ráže 7,65 mm Browning; režimy střelby: zajištěno (0), jednotlivé rány (1) a nepřetržitá dávka (∞) bez možnosti omezené dávky.',
      'Ráže 9×19 mm Luger; režimy střelby: zajištěno (0), jednotlivé rány (1), tříranná dávka (3) a plně automatická střelba (∞).',
      'Ráže 9×19 mm Luger; režimy střelby: zajištěno (0), jednotlivé rány (1) a dvouranná dávka (2) s pevnou kadencí 1 200 ran/min.',
      'Ráže 5,56×45 mm NATO; režimy střelby: jednotlivé rány (1), tříranná dávka (3) a automatická střelba bez mechanické pojistky.'
    ],
    correctOption: 1,
    rationale: 'Samopal CZ Scorpion EVO 3A1 v ráži 9 mm Luger disponuje oboustranným 4polohovým voličem režimu střelby (0, 1, 3, dávka) a polymerovým tělem s lištami MIL-STD-1913.',
    source: 'Technický manuál a střelecký řád VS ČR'
  },
  {
    id: 'sp-07',
    subject: 'Služební příprava',
    topic: 'První pomoc – Zástava masivního krvácení',
    question: 'Jaký je správný a okamžitý postup při masivním tepenném krvácení z končetiny (např. po bodném poranění)?',
    answer: 'Okamžitě naložit turniket (škrtidlo) 5–7 cm nad ránu (mimo kloub), utáhnout vratidlo do úplného zastavení krvácení, zajistit a poznamenat přesný čas naložení na pásek/čelo zraněného.',
    options: [
      'Přiložit sterilní gázu na ránu, končetinu svěsit dolů pod úroveň srdce a škrtidlo naložit přímo přes kloubní spojení s povolením každých 10 minut.',
      'Okamžitě naložit turniket (škrtidlo) 5–7 cm nad ránu (mimo kloub), utáhnout vratidlo do úplného zastavení krvácení, zajistit a poznamenat přesný čas naložení na pásek/čelo zraněného.',
      'Naložit turniket co nejníže pod ránu směrem k prstům, vratidlo utáhnout pouze mírně pro zachování hmatného tepu na periferii a ránu vypláchnout peroxidem vodíku.',
      'Provést dezinfekci rány jodovým roztokem, naložit tlakový obvaz s obráceným škrtidlem a končetinu fixovat dlahou bez záznamu času aplikace.'
    ],
    correctOption: 1,
    rationale: 'Masivní končetinové krvácení je nejčastější odvratitelnou příčinou smrti v taktickém prostředí (TCCC protokoly - MARCH). Turniket se utahuje do vymizení pulsu a zastavení krvácení a čas se striktně eviduje.',
    source: 'Standardy první pomoci Akademie VS ČR a TCCC Guidelines'
  },
  {
    id: 'sp-08',
    subject: 'Služební příprava',
    topic: 'První pomoc – KPR a AED',
    question: 'Jaký je správný poměr stlačování hrudníku a umělých vdechů při základní resuscitaci dospělého a jaká je frekvence dle ERC Guidelines?',
    answer: 'Poměr 30 stlačení : 2 vdechy, frekvence 100–120 stlačení za minutu, hloubka 5–6 cm uprostřed hrudníku na tvrdé podložce; co nejrychleji připojit AED.',
    options: [
      'Poměr 15 stlačení : 2 vdechy, frekvence 80 stlačení za minutu, hloubka 2–3 cm na boku postiženého; AED připojit až po 10 minutách manuální KPR.',
      'Poměr 30 stlačení : 2 vdechy, frekvence 100–120 stlačení za minutu, hloubka 5–6 cm uprostřed hrudníku na tvrdé podložce; co nejrychleji připojit AED.',
      'Poměr 30 stlačení : 5 vdechů, frekvence 140–160 stlačení za minutu, hloubka 8–10 cm v oblasti žaludku; defibrilátor aplikovat pouze při přítomnosti lékaře.',
      'Pouze nepřetržité umělé dýchání bez masáže hrudníku frekvencí 20 vdechů za minutu až do příjezdu záchranné služby.'
    ],
    correctOption: 1,
    rationale: 'Dle mezinárodních doporučení ERC (European Resuscitation Council) je standardem pro dospělé KPR v poměru 30:2 s frekvencí 100-120/min, minimálním přerušováním a včasnou defibrilací pomocí AED.',
    source: 'Doporučené postupy ERC a výukové standardy Akademie VS ČR'
  },
  {
    id: 'sp-09',
    subject: 'Služební příprava',
    topic: 'Povinnosti po použití zbraně a DP',
    question: 'Jaké povinnosti má příslušník VS ČR bezprostředně po použití donucovacích prostředků nebo zbraně dle § 20 zákona č. 555/1992 Sb.?',
    answer: 'Poskytnout první pomoc a zajistit lékařské ošetření zraněných, zabezpečit místo činu/stopy, ihned událost ohlásit nadřízenému a sepsat písemnou zprávu (úřední záznam).',
    options: [
      'Předat zasaženou osobu na celu bez lékařského ošetření, provést očistu výstroje a zprávu o použití DP sepsat až po skončení víkendu.',
      'Poskytnout první pomoc a zajistit lékařské ošetření zraněných, zabezpečit místo činu/stopy, ihned událost ohlásit nadřízenému a sepsat písemnou zprávu (úřední záznam).',
      'Ověřit totožnost svědků z řad odsouzených, podat telefonické hlášení dozorujícímu soudci a vyčkat s poskytnutím první pomoci na příjezd výjezdové skupiny GIBS.',
      'Ihned zajistit střelivo do skladu zbraní, vyhotovit fotodokumentaci na soukromý mobilní telefon a ústně informovat předsedu odborové organizace.'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 555/1992 Sb. v § 20 striktně ukládá povinnost poskytnout první pomoc, zajistit lékařské vyšetření a bezodkladně podat písemné hlášení o každém použití DP nebo zbraně řediteli věznice.',
    source: '§ 20 zákona č. 555/1992 Sb., o VS a JS ČR'
  },
  {
    id: 'sp-10',
    subject: 'Služební příprava',
    topic: 'Elektrický paralyzér',
    question: 'Jaká jsou bezpečnostní pravidla a omezení při použití elektrického paralyzéru (Taser / kontaktní paralyzér)?',
    answer: 'Nesmí se cílit na hlavu, krk a oblast srdce; nesmí se použít v prostředí s rizikem výbuchu (hořlavé plyny, benzín) ani na osobách na vyvýšených místech s hrozbou pádu z výšky.',
    options: [
      'Primárním cílem zásahu sondami je vždy obličejová část a krk k okamžitému vyřazení zraku; v prostředí s hořlavými parami lze taser použít bez omezení.',
      'Nesmí se cílit na hlavu, krk a oblast srdce; nesmí se použít v prostředí s rizikem výbuchu (hořlavé plyny, benzín) ani na osobách na vyvýšených místech s hrozbou pádu z výšky.',
      'Sondy se aplikují výhradně do oblasti hrudní kosti z důvodu maximálního účinku na srdeční rytmus; aplikace musí trvat nepřetržitě minimálně 30 sekund.',
      'Taser je povolen pouze jako kontaktní paralyzér bez vystřelení sond; jeho použití je zakázáno v celách s betonovou podlahou pro riziko probíjení.'
    ],
    correctOption: 1,
    rationale: 'Použití elektrického paralyzéru vyžaduje směrování sond do velkých svalových skupin (trup, stehna, záda). Zásah do krku či hlavy je zakázán pro riziko těžkého zranění.',
    source: 'Metodika použití donucovacích prostředků – elektrošokové zbraně VS ČR'
  },
  {
    id: 'sp-11',
    subject: 'Služební příprava',
    topic: 'První pomoc – Popáleniny a poleptání',
    question: 'Jaká je správná první pomoc při termickém popálení pokožky II. stupně (puchýře)?',
    answer: 'Okamžitě chladit čistou studenou vodou (cca 10–20 minut), nestrhávat přiškvařený oděv, nepropichovat puchýře, sterilně překrýt popáleninovým krytím.',
    options: [
      'Puchýře sterilně propíchnout k vypuštění tekutiny, aplikovat mastný krém nebo zásyp a pevně obvázat elastickým obinadlem.',
      'Okamžitě chladit čistou studenou vodou (cca 10–20 minut), nestrhávat přiškvařený oděv, nepropichovat puchýře, sterilně překrýt popáleninovým krytím.',
      'Strhnout přiškvařené zbytky oděvu z popáleného místa pinzetou, ránu dezinfikovat koncentrovaným lihem a přiložit suchý froté ručník.',
      'Aplikovat ledové obklady s ledem přímo na ránu po dobu alespoň 60 minut a ránu ponechat zcela otevřenou na vzduchu bez krytí.'
    ],
    correctOption: 1,
    rationale: 'Při popáleninách je prioritou šetrné chlazení vodou o teplotě cca 15 °C k zastavení tepelné destrukce tkáně a prevence infekce sterilním nepřilnavým krytím bez nanášení mastí.',
    source: 'Standardy první pomoci Akademie VS ČR'
  },
  {
    id: 'sp-12',
    subject: 'Služební příprava',
    topic: 'Taktika služebního zákroku v cele',
    question: 'Jaká jsou základní taktická pravidla při vstupu hlídky do cely k provedení zákroku proti ozbrojenému agresivnímu odsouzenému?',
    answer: 'Zákrok provádí minimálně 3–4 vystrojení příslušníci s balistickými a úderovými štíty, zásahovými přilbami, předem určenými rolemi (štít, fixace rukou, poutání, jištění) a pod vedením velitele.',
    options: [
      'Zákrok provádí dvojice dozorců bez ochranných pomůcek, přičemž první dozorce ihned použije střelnou zbraň a druhý provádí videozáznam na tablet.',
      'Zákrok provádí minimálně 3–4 vystrojení příslušníci s balistickými a úderovými štíty, zásahovými přilbami, předem určenými rolemi (štít, fixace rukou, poutání, jištění) a pod vedením velitele.',
      'Vstup do cely zahajuje samostatně velitel směny bez štítu za účelem vyjednávání, zatímco ostatní příslušníci čekají na chodbě u mříže.',
      'Do cely vstupují současně všichni volní příslušníci směny bez stanovení konkrétních rolí a agresora vytlačují holýma rukama k oknu cely.'
    ],
    correctOption: 1,
    rationale: 'Taktika vstupu do cely (Cell Extraction) je týmovou činností založenou na momentu překvapení, převaze síly, použití ochranných štítů a bleskovém znehybnění agresora bez zranění personálu.',
    source: 'Metodika služebních zákroků v uzavřených prostorách, Akademie VS ČR'
  },
  {
    id: 'sp-13',
    subject: 'Služební příprava',
    topic: 'První pomoc – Tenzní pneumotorax',
    question: 'Jak se v taktické první pomoci (TCCC) ošetřuje otevřené poranění hrudníku (nasávající rána hrudníku)?',
    answer: 'Aplikací hrudního chlopňového krytí (Chest Seal s ventilem), které brání nasávání vzduchu do pohrudniční dutiny, ale umožňuje únik krve a vzduchu ven.',
    options: [
      'Ránu hermeticky uzavřít neprodyšnou náplastí ze všech 4 stran bez ventilu a zraněného uložit na záda se zvednutými dolními končetinami.',
      'Aplikací hrudního chlopňového krytí (Chest Seal s ventilem), které brání nasávání vzduchu do pohrudniční dutiny, ale umožňuje únik krve a vzduchu ven.',
      'Provést okamžitý výplach rány fyziologickým roztokem, zavést škrtidlo přes hrudník a nutit zraněného k hlubokému usilovnému dýchání.',
      'Přiložit suchý savý obvaz, zraněného položit na zdravý bok a provádět nepřetržitou masáž hrudníku i při zachovaném vědomí.'
    ],
    correctOption: 1,
    rationale: 'Otevřený pneumotorax může rychle přejít v tenzní pneumotorax vedoucí k útlaku srdce a plic. Použití polopropustného ventilového krytí (Chest Seal) zachraňuje život.',
    source: 'TCCC Guidelines a traumatologický protokol Akademie VS ČR'
  },
  {
    id: 'sp-14',
    subject: 'Služební příprava',
    topic: 'Použití pout a poutacích pásů',
    question: 'Jaké jsou zásady správného nasazení služebních pout na ruce osoby za zády?',
    answer: 'Pouta nasadit na zápěstí klíčovými dírkami směrem k tělu (nahoru/k tělu), dotáhnout na vůli cca jednoho prstu (nesmí škrtit oběh) a VŽDY uzamknout pojistku proti samovolnému dotažení.',
    options: [
      'Pouta nasadit klíčovými dírkami směrem od těla k prstům, utáhnout na doraz bez vůle a pojistku ponechat neuzamčenou pro rychlé sejmutí v případě potřeby.',
      'Pouta nasadit na zápěstí klíčovými dírkami směrem k tělu (nahoru/k tělu), dotáhnout na vůli cca jednoho prstu (nesmí škrtit oběh) a VŽDY uzamknout pojistku proti samovolnému dotažení.',
      'Pouta nasadit na předloktí nad loketní kloub, přičemž dlaně spoutané osoby musí směřovat od sebe a pojistka se aktivuje pouze při transportu vozidlem.',
      'Poutat vždy pouze jednu ruku k pevné konstrukci cely nebo nábytku, aby měl odsouzený volnou ruku pro manipulaci s osobními věcmi.'
    ],
    correctOption: 1,
    rationale: 'Zajištění pojistky (Double Lock) zabrání svévolnému utažení pout při pohybu osoby (prevence poškození nervů a cév) i snadnému vyhmatání západky.',
    source: 'Metodika použití donucovacích prostředků – Poutací technika VS ČR (Kupec)'
  },
  {
    id: 'sp-15',
    subject: 'Služební příprava',
    topic: 'Střelecká příprava – Závady na zbrani',
    question: 'Jaký je okamžitý střelecký drill při selhání výstřelu (tzv. zádržka zbraně / Tap-Rack-Bang)?',
    answer: '1. Dorazit zásobník zespodu dlaní (TAP), 2. Prudce natáhnout závěr vzad a vyhodit vadný náboj (RACK), 3. Zamířit a pokračovat ve střelbě (BANG).',
    options: [
      '1. Vypustit zásobník na zem, 2. Stisknout spoušť naprázdno třikrát za sebou, 3. Znovu vložit vystřelený náboj do komory výhozním okénkem.',
      '1. Dorazit zásobník zespodu dlaní (TAP), 2. Prudce natáhnout závěr vzad a vyhodit vadný náboj (RACK), 3. Zamířit a pokračovat ve střelbě (BANG).',
      '1. Zajistit zbraň manuální pojistkou, 2. Vyjmout hlaveň a vratnou pružinu, 3. Zkontrolovat úderník a pokračovat v míření.',
      '1. Natáhnout kohout do zadní polohy palcem, 2. Vyčkat 60 sekund pro případ opožděného zážehu, 3. Zbraň odložit do pouzdra s nábojem v komoře.'
    ],
    correctOption: 1,
    rationale: 'Drill Tap-Rack odstraní 90 % běžných zádržek pistole (nedoražený zásobník, selhač zápalky, nevytáhnutá nábojnice). Provádí se automaticky během zlomku sekundy.',
    source: 'Předpis pro střeleckou přípravu a taktiku VS ČR'
  },
  {
    id: 'sp-16',
    subject: 'Služební příprava',
    topic: 'Slzotvorné a dráždivé prostředky',
    question: 'Jaká látka a typ trysky se standardně využívá u služebních obranných sprejů ve výzbroji VS ČR a jak se aplikují?',
    answer: 'Látka OC (Oleoresin Capsicum - výtažek z kajenského pepře), tryska typu JET (tekutá střela/pěna) s dosahem 3–5 m, aplikace krátkými dávkami do oblasti očí a dýchacích cest.',
    options: [
      'Látka CN (chloracetofenon) v provedení FOG (široký aerosolový mrak) s dosahem 10 metrů, aplikace souvislým vystříkáním celé nádobky do středu místnosti.',
      'Látka OC (Oleoresin Capsicum - výtažek z kajenského pepře), tryska typu JET (tekutá střela/pěna) s dosahem 3–5 m, aplikace krátkými dávkami do oblasti očí a dýchacích cest.',
      'Látka CS (ortho-chlorbenzylidenmalononitril) v práškové formě, aplikace rozprášením na oděv a končetiny útočníka ze vzdálenosti minimálně 7 metrů.',
      'Syntetický nervově paralytický roztok s tryskou typu CONE, aplikace nepřetržitým proudem do oblasti uší a temene hlavy.'
    ],
    correctOption: 1,
    rationale: 'Typ trysky JET (tekutá střela nebo pěna) je vhodný pro uzavřené prostory chodeb věznic, protože nekontaminuje celou místnost a působí cíleně na agresora.',
    source: 'Metodika použití donucovacích prostředků VS ČR'
  },
  {
    id: 'sp-17',
    subject: 'Služební příprava',
    topic: 'První pomoc – Anafylaktický šok',
    question: 'Jaké jsou příznaky a první pomoc při těžké alergické reakci (anafylaxi) s otokem dýchacích cest?',
    answer: 'Dušnost, otok jazyka a hrdla, kopřivka, pokles tlaku; okamžitě aplikovat autoinjektor s adrenalinem (EpiPen) do zevní strany stehna a volat ZZS.',
    options: [
      'Zvýšená teplota a křeče v břiše; podat perorálně tabletu aspirinu, zapít velkým množstvím studené vody a uložit postiženého do polohy na břiše.',
      'Dušnost, otok jazyka a hrdla, kopřivka, pokles tlaku; okamžitě aplikovat autoinjektor s adrenalinem (EpiPen) do zevní strany stehna a volat ZZS.',
      'Krvácení z nosu a ztuhlost šíje; aplikovat autoinjektor s inzulínem přímo do břišní stěny a postiženého nutit k intenzivní chůzi.',
      'Svalový třes a hyperventilace; podat uklidňující sedativa, zraněného posadit k otevřenému oknu a vyčkat bez volání ZZS.'
    ],
    correctOption: 1,
    rationale: 'Anafylaxe bezprostředně ohrožuje život udušením a oběhovým selháním. Jediným kauzálním lékem první volby je intramuskulární podání adrenalinu do stehna.',
    source: 'Traumatologie a standardy první pomoci Akademie VS ČR'
  },
  {
    id: 'sp-18',
    subject: 'Služební příprava',
    topic: 'Služební obušek a tonfa',
    question: 'Které části těla jsou zakázanými zónami pro údery služebním obuškem při vedení zákroku?',
    answer: 'Hlava, krk, oblast hrtanu, oblast ledvin, páteř a rozkrok (tyto údery jsou přípustné pouze v podmínkách nutné obrany při přímém ohrožení života).',
    options: [
      'Stehna, ramena, paže a hýžďové svalstvo; povoleny jsou výhradně údery vedené naplocho na břicho a hrudní koš.',
      'Hlava, krk, oblast hrtanu, oblast ledvin, páteř a rozkrok (tyto údery jsou přípustné pouze v podmínkách nutné obrany při přímém ohrožení života).',
      'Zákaz úderů platí výhradně pro prsty na rukou a holenní kosti; údery na hlavu a krk jsou povoleny při jakémkoli neuposlechnutí výzvy.',
      'Zakázanou zónou jsou pouze chodidla a uši; veškeré ostatní části těla včetně krční páteře jsou standardními cílovými plochami pro vedení úderu.'
    ],
    correctOption: 1,
    rationale: 'Údery obuškem směřují do velkých svalových partií (stehna, hýždě, paže) k vyřazení motoriky. Údery na hlavu a páteř mohou způsobit smrt nebo trvalé ochrnutí.',
    source: 'Metodika použití obušku a taktiky sebeobrany Akademie VS ČR'
  },
  {
    id: 'sp-19',
    subject: 'Služební příprava',
    topic: 'První pomoc – Epileptický záchvat',
    question: 'Jaká je správná první pomoc při záchvatu křečí s bezvědomím (epileptický záchvat typu Grand Mal)?',
    answer: 'Zabránit poranění hlavy (podložit měkkým předmětem), odstranit nebezpečné věci z okolí, nevkládat nic do úst, nebránit křečím násilím, po odeznění zajistit dýchací cesty a sledovat stav.',
    options: [
      'Vložit mezi zuby roubík nebo dřevěný kolík proti překousnutí jazyka, zalehnout končetiny vší silou k zastavení křečí a podat tekutiny.',
      'Zabránit poranění hlavy (podložit měkkým předmětem), odstranit nebezpečné věci z okolí, nevkládat nic do úst, nebránit křečím násilím, po odeznění zajistit dýchací cesty a sledovat stav.',
      'Otočit postiženého okamžitě na břicho, vytáhnout jazyk pinzetou a zahájit nepřímou masáž srdce bez ohledu na probíhající křeče.',
      'Aplikovat studené obklady na hrudník, provést masáž krčních tepen a po celou dobu záchvatu držet hlavu v záklonu v sedě na židli.'
    ],
    correctOption: 1,
    rationale: 'Vkládání předmětů do úst vede k vylomení zubů a ucpání dýchacích cest. Prioritou je ochrana hlavy před úderem o podlahu a zotavovací poloha po záchvatu.',
    source: 'Standardy první pomoci Akademie VS ČR'
  },
  {
    id: 'sp-20',
    subject: 'Služební příprava',
    topic: 'Zastavovací pás',
    question: 'Za jakých podmínek a jakým způsobem se smí použít donucovací prostředek zastavovací pás (§ 17)?',
    answer: 'K násilnému zastavení motorového vozidla, jehož řidič odmítá zastavit na výzvu a bezprostředně ohrožuje bezpečnost; nesmí se použít proti jednostopým vozidlům (motocykly, jízdní kola).',
    options: [
      'K zastavení jakéhokoli podezřelého dopravního prostředku včetně motocyklů a jízdních kol, pás se hází přímo pod přední kola jedoucího vozidla ze vzdálenosti do 1 metru.',
      'K násilnému zastavení motorového vozidla, jehož řidič odmítá zastavit na výzvu a bezprostředně ohrožuje bezpečnost; nesmí se použít proti jednostopým vozidlům (motocykly, jízdní kola).',
      'Výhradně při plánovaných dopravně-bezpečnostních kontrolách před vjezdem do věznice jako preventivní zpomalovací prvek pro všechna vozidla.',
      'Pouze se souhlasem dozorujícího státního zástupce a za podmínky, že rychlost ujíždějícího vozidla nepřesahuje 30 km/h.'
    ],
    correctOption: 1,
    rationale: 'Použití zastavovacího pásu proti motocyklu je zakázáno pro extrémní riziko smrtelného úrazu řidiče. Používá se pro propíchnutí pneumatik osobních a nákladních automobilů.',
    source: '§ 17 zákona č. 555/1992 Sb. a služební předpis VS ČR'
  },
  {
    id: 'sp-21',
    subject: 'Služební příprava',
    topic: 'První pomoc – Zlomeniny a imobilizace',
    question: 'Jak se provádí první pomoc při podezření na zlomeninu dlouhé kosti končetiny?',
    answer: 'Znehybnit přes dva sousední klouby (kloub nad i pod zlomeninou), u otevřených zlomenin sterilně krýt ránu bez zatlačování kostních úlomků, chladit a zajistit transport.',
    options: [
      'Vyčnívající kostní úlomky zatlačit sterilním tamponem zpět do rány, končetinu pevně stáhnout elastickým obinadlem a narovnat tahem v ose.',
      'Znehybnit přes dva sousední klouby (kloub nad i pod zlomeninou), u otevřených zlomenin sterilně krýt ránu bez zatlačování kostních úlomků, chladit a zajistit transport.',
      'Znehybnit výhradně místo zlomeniny přiložením krátké dlahy přímo na lomnou linii bez fixace sousedních kloubů a končetinu prohřívat.',
      'Provést repozici kosti krouživým pohybem, naložit turniket nad zlomeninu k prevenci otoku a končetinu ponechat volně viset dolů.'
    ],
    correctOption: 1,
    rationale: 'Správná imobilizace znehybněním obou přilehlých kloubů brání posunu úlomků, sekundárnímu poškození cév a nervů a tiší traumatickou bolest.',
    source: 'Výukové standardy první pomoci Akademie VS ČR'
  },
  {
    id: 'sp-22',
    subject: 'Služební příprava',
    topic: 'Střelecká příprava – Taktické přebití zbraně',
    question: 'Jaký je rozdíl mezi taktickým přebitím (přebití s uschováním) a nouzovým přebitím zbraně?',
    answer: 'Nouzové přebití se provádí při prázdné zbrani na záchytu závěru co nejrychleji s odhozením zásobníku; taktické přebití probíhá v krytu při náboji v komoře s uschováním částečně plného zásobníku.',
    options: [
      'Nouzové přebití probíhá vždy v krytu s pečlivým uschováním prázdného zásobníku do sumky; taktické přebití se provádí v otevřeném prostoru za stálého odhazování plných zásobníků.',
      'Nouzové přebití se provádí při prázdné zbrani na záchytu závěru co nejrychleji s odhozením zásobníku; taktické přebití probíhá v krytu při náboji v komoře s uschováním částečně plného zásobníku.',
      'Nouzové přebití se provádí výhradně u samopalu s natažením závěru přes lapač střel; taktické přebití se týká pouze krátkých zbraní při střelbě z kleku.',
      'Taktické přebití vyžaduje okamžité vybití náboje z komory na zem a vložení nového zásobníku; nouzové přebití se provádí pouhým doplňováním nábojů do vloženého zásobníku páskem.'
    ],
    correctOption: 1,
    rationale: 'Taktické přebití umožňuje příslušníkovi doplnit maximální kapacitu střeliva v klidnější fázi kontaktu, aniž by ztratil náboj v komoře nebo zahodil zbývající munici.',
    source: 'Předpis střelecké přípravy a taktiky VS ČR'
  },
  {
    id: 'sp-23',
    subject: 'Služební příprava',
    topic: 'Povinnost zakročit – Výjimky ze zákroku',
    question: 'Kdy příslušník VS ČR NENÍ povinen provést služební zákrok dle § 7 odst. 2 zákona č. 555/1992 Sb.?',
    answer: 'Je-li pod vlivem léků/látek snižujících schopnost jednání, není-li k provedení odborně vyškolen/vycvičen, nebo brání-li tomu důležitý zájem služby (je však povinen vyrozumět nadřízeného).',
    options: [
      'Pokud zákrok probíhá mimo střežený objekt věznice, útočník je ozbrojen střelnou zbraní, nebo pokud příslušník nemá u sebe služební průkaz.',
      'Je-li pod vlivem léků/látek snižujících schopnost jednání, není-li k provedení odborně vyškolen/vycvičen, nebo brání-li tomu důležitý zájem služby (je však povinen vyrozumět nadřízeného).',
      'Pouze tehdy, pokud je v bezprostřední blízkosti přítomen příslušník Policie ČR, který přebírá velení, nebo pokud by došlo k poškození uniformy.',
      'Jestliže odsouzený podal proti zákroku předem stížnost k soudu, nebo pokud příslušník vykonává službu déle než 8 hodin v kuse.'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 555/1992 Sb. v § 7 odst. 2 taxativně stanoví tři důvody zproštění povinnosti provést služební zákrok. Příslušník však musí učinit jiná opatření k zajištění zákroku (např. ihned volat nadřízeného).',
    source: '§ 7 odst. 2 zákona č. 555/1992 Sb.'
  },
  {
    id: 'sp-24',
    subject: 'Služební příprava',
    topic: 'Prokazování příslušnosti k VS ČR',
    question: 'Jakými způsoby prokazuje příslušník svoji příslušnost k Vězeňské službě ČR (§ 8 zákona č. 555/1992 Sb.)?',
    answer: 'Služebním průkazem nebo služebním stejnokrojem s identifikačním číslem, v místech VV/VTOS též identifikačním štítkem a ve výjimečných situacích ústním prohlášením „Vězeňská služba“.',
    options: [
      'Výhradně předložením služebního odznaku kriminální služby s reliéfním státním znakem; stejnokroj ani ústní prohlášení zákon neuznává.',
      'Služebním průkazem nebo služebním stejnokrojem s identifikačním číslem, v místech VV/VTOS též identifikačním štítkem a ve výjimečných situacích ústním prohlášením „Vězeňská služba“.',
      'Předložením občanského průkazu spolu se zbrojním průkazem skupiny D a ústním prohlášením „Ostraha věznice“.',
      'Pouze písemným pověřením ředitele věznice s kulatým razítkem a jmenným seznamem členů zásahové jednotky.'
    ],
    correctOption: 1,
    rationale: 'Dle § 8 zákona č. 555/1992 Sb. prokazuje příslušník příslušnost průkazem nebo stejnokrojem s ID číslem. Ústní prohlášení „Vězeňská služba“ je vyhrazeno pro naléhavé zákroky, kde to okolnosti neumožňují.',
    source: '§ 8 zákona č. 555/1992 Sb. a vyhláška č. 166/2014 Sb.'
  },
  {
    id: 'sp-25',
    subject: 'Služební příprava',
    topic: 'Trestní právo – Nutná obrana',
    question: 'Jaké jsou zákonné podmínky a meze nutné obrany dle § 29 trestního zákoníku (č. 40/2009 Sb.)?',
    answer: 'Odvrací se přímo hrozící nebo trvající útok na zájem chráněný trestním zákonem; obrana nesmí být zcela zjevně nepřiměřená způsobu útoku.',
    options: [
      'Odvrací se nebezpečí vyvolané živelní událostí; způsobený následek musí být vždy menší než hrozící škoda a obránce nesměl mít možnost ústupu.',
      'Odvrací se přímo hrozící nebo trvající útok na zájem chráněný trestním zákonem; obrana nesmí být zcela zjevně nepřiměřená způsobu útoku.',
      'Obrana musí být zcela přiměřená a nesmí svou intenzitou ani použitým prostředkem v žádném případě převýšit intenzitu útoku.',
      'Lze ji uplatnit pouze tehdy, byl-li útok předem nahlášen veliteli směny a útočník byl vyzván zákonnou formulí k zanechání protiprávního jednání.'
    ],
    correctOption: 1,
    rationale: 'Nutná obrana (§ 29 TZ) opravňuje k odvrácení útoku. Obrana může být intenzivnější než útok (musí útok odrazit), nesmí však být zcela zjevně nepřiměřená (exces intenzivní) a útok musí trvat nebo bezprostředně hrozit (exces extenzivní).',
    source: '§ 29 zákona č. 40/2009 Sb., trestní zákoník'
  },
  {
    id: 'sp-26',
    subject: 'Služební příprava',
    topic: 'Trestní právo – Krajní nouze',
    question: 'V čem spočívá základní rozdíl mezi nutnou obranou (§ 29 TZ) a krajní nouzí (§ 28 TZ)?',
    answer: 'Krajní nouze odvrací nebezpečí (např. živelní pohromu, zvíře, požár), platí u ní přísná subsidiarita (nebezpečí nešlo odvrátit jinak) a proporcionalita (následek nesmí být stejně závažný ani závažnější).',
    options: [
      'U krajní nouze se odvrací přímo hrozící útok člověka a obrana smí být intenzivnější; u nutné obrany se odvrací přírodní živel a platí subsidiarita.',
      'Krajní nouze odvrací nebezpečí (např. živelní pohromu, zvíře, požár), platí u ní přísná subsidiarita (nebezpečí nešlo odvrátit jinak) a proporcionalita (následek nesmí být stejně závažný ani závažnější).',
      'Krajní nouze umožňuje způsobit škodu větší, než jaká hrozila, pokud jedná příslušník ozbrojeného sboru ve výkonu služby na rozkaz nadřízeného.',
      'Nutná obrana vyžaduje povinnost ustoupit z místa konfliktu a vyhnout se střetu; krajní nouze zakazuje jakýkoli ústup a nařizuje přímý zásah.'
    ],
    correctOption: 1,
    rationale: 'U krajní nouze (§ 28 TZ) se odvrací nebezpečí a způsobený následek musí být menší než hrozící. U nutné obrany (§ 29 TZ) se odvrací lidský útok a obrana může být i důraznější než útok.',
    source: '§ 28 a § 29 zákona č. 40/2009 Sb.'
  },
  {
    id: 'sp-27',
    subject: 'Služební příprava',
    topic: 'Vstupy do objektů – Výjimky z prohlídek',
    question: 'U kterých ústavních činitelů a funkcionářů se při vstupu do věznice NEPROVÁDÍ kontrola ani prohlídka zavazadla (§ 80 odst. 2 písm. c NGŘ č. 33/2019)?',
    answer: 'Prezident ČR, předseda vlády, předsedové PS a Senátu, ministr spravedlnosti a náměstci, členové vlády, generální ředitel VS ČR a náměstci, soudci, státní zástupci, ředitel GIBS a ombudsman.',
    options: [
      'U všech poslanců a senátorů Parlamentu ČR, advokátů obhajoby, akreditovaných novinářů a příslušníků Policie ČR ve služebním stejnokroji.',
      'Prezident ČR, předseda vlády, předsedové PS a Senátu, ministr spravedlnosti a náměstci, členové vlády, generální ředitel VS ČR a náměstci, soudci, státní zástupci, ředitel GIBS a ombudsman.',
      'Pouze u ředitele příslušné věznice a dozorujícího státního zástupce; všichni ostatní ústavní činitelé včetně prezidenta podléhají kompletní osobní prohlídce.',
      'U primátorů statutárních měst, ředitelů krajských úřadů, diplomatických zástupců cizích států a civilních lékařů rychlé záchranné služby.'
    ],
    correctOption: 1,
    rationale: 'Dle § 80 odst. 2 písm. c) NGŘ č. 33/2019 ve znění 8/2022 jsou stanovení ústavní činitelé, soudci, státní zástupci a kontrolní orgány osvobozeni od kontroly a prohlídky zavazadel při vstupu do věznice.',
    source: '§ 80 odst. 2 písm. c) NGŘ č. 33/2019'
  },
  {
    id: 'sp-28',
    subject: 'Služební příprava',
    topic: 'Vstupy do objektů – Vstupní doklady',
    question: 'Na jaké doklady mohou osoby vstupovat do střežených objektů VS ČR dle § 103 NGŘ č. 33/2019?',
    answer: 'Služební průkaz VS ČR / PČR / GIBS / BIS / CS / AČR / VP, občanský průkaz, cestovní/diplomatický pas, zvláštní povolení, průkaz ombudsmana a průkaz CPT.',
    options: [
      'Výhradně na biometrický cestovní pas nebo zaměstnaneckou čipovou kartu VS ČR; občanský průkaz ani služební průkazy jiných sborů nejsou uznávány.',
      'Služební průkaz VS ČR / PČR / GIBS / BIS / CS / AČR / VP, občanský průkaz, cestovní/diplomatický pas, zvláštní povolení, průkaz ombudsmana a průkaz CPT.',
      'Na řidičský průkaz, zbrojní průkaz, kartu pojištěnce VZP, studentský průkaz ISIC nebo písemné čestné prohlášení o totožnosti se dvěma svědky.',
      'Na služební odznak bez průkazu, novinářský průkaz Syndikátu novinářů ČR nebo plnou moc vystavenou advokátem odsouzeného.'
    ],
    correctOption: 1,
    rationale: 'Katalog oprávnění ke vstupu je taxativně vymezen v § 103 až 112 NGŘ č. 33/2019. Vstup na potvrzení o ztrátě OP je možný pouze s jiným platným dokladem s fotografií.',
    source: '§ 103–112 NGŘ č. 33/2019'
  },
  {
    id: 'sp-29',
    subject: 'Služební příprava',
    topic: 'Technická kontrola osob – Kardiostimulátor',
    question: 'Jaký je správný postup strážného na vchodu při kontrole osoby s implantovaným kardiostimulátorem?',
    answer: 'Osoba neprochází rámem bez zastavení, nepřejíždí se opakovaně ručním detektorem přes přístroj; po předložení identifikační karty přístroje se provede alternativní ruční osobní prohlídka.',
    options: [
      'Osobu nechat projít stacionárním rámem se sníženou citlivostí a následně provést kontrolu celotělovým rentgenovým skenerem zavazadel.',
      'Osoba neprochází rámem bez zastavení, nepřejíždí se opakovaně ručním detektorem přes přístroj; po předložení identifikační karty přístroje se provede alternativní ruční osobní prohlídka.',
      'Osoba projde rámem běžným způsobem a strážný provede detailní kontrolu hrudníku opakovaným těsným přikládáním ručního detektoru kovů přímo na implantát.',
      'Vstup osobě zcela odepřít do doby, než předloží písemné povolení od vězeňského lékaře a posudek primáře kardiologického oddělení ne starší 24 hodin.'
    ],
    correctOption: 1,
    rationale: 'Silné elektromagnetické pole detektoru by mohlo vyvolat interferenci. Na základě předložené karty implantátu se provede šetrná ruční kontrola oděvu.',
    source: 'Metodika činnosti VS ČR na vchodech a vjezdech 2020'
  },
  {
    id: 'sp-30',
    subject: 'Služební příprava',
    topic: 'Kontrola vozidel – Detektor tepové frekvence',
    question: 'Jaké úkony se musí provést před spuštěním detektoru tepové frekvence (Heartbeat detector) u vozidla?',
    answer: 'Řidič vypne motor, zavře všechna okna a dveře, všechny osoby vystoupí mimo vozidlo a seismické senzory se umístí na přední a zadní rám vozidla + zemní senzor.',
    options: [
      'Ponechat motor vozidla běžet na volnoběh pro napájení detektoru, otevřít všechna okna k vyrovnání tlaku a senzory umístit na pneumatiky kol.',
      'Řidič vypne motor, zavře všechna okna a dveře, všechny osoby vystoupí mimo vozidlo a seismické senzory se umístí na přední a zadní rám vozidla + zemní senzor.',
      'Řidič a spolujezdec zůstávají sedět v kabině v klidové poloze, senzory se připevní magnetem na výfukové potrubí a měření se provádí za pomalé jízdy.',
      'Vypnout motor, otevřít ložný prostor pro vizuální kontrolu a seismické sondy zapíchnout do nákladu sypkého materiálu bez použití zemního senzoru.'
    ],
    correctOption: 1,
    rationale: 'Detektor tepové frekvence zachycuje mikrovibrace karoserie způsobené tlukotem srdce ukryté osoby. Jakýkoliv pohyb motoru, větru otevřeným oknem nebo přítomnost posádky by zmařily měření.',
    source: 'Metodika činnosti VS ČR na vchodech a vjezdech 2020'
  },
  {
    id: 'sp-31',
    subject: 'Služební příprava',
    topic: 'Justiční stráž – Přeprava cenin a peněz',
    question: 'Jaká striktní zásada platí pro nesení zavazadla s peněžní hotovostí při přepravě Justiční stráží dle § 144?',
    answer: 'Zavazadlo s finanční hotovostí nese VÝHRADNĚ zaměstnanec soudu/SZ/ministerstva, NIKDY příslušník justiční stráže; příslušníci zajišťují pouze ozbrojené krytí.',
    options: [
      'Zavazadlo nese velitel eskorty JS v uzamčené speciální bezpečnostní kazetě připoutané k zápěstí, zatímco zaměstnanec soudu kráčí za ním.',
      'Zavazadlo s finanční hotovostí nese VÝHRADNĚ zaměstnanec soudu/SZ/ministerstva, NIKDY příslušník justiční stráže; příslušníci zajišťují pouze ozbrojené krytí.',
      'Zavazadlo s hotovostí nesou oba příslušníci JS společně na nosítkách, aby byla zajištěna rovnoměrná kontrola nad finančními prostředky.',
      'Zaměstnanec soudu a příslušník JS nesou zavazadlo střídavě podle předem stanoveného časového harmonogramu schváleného předsedou soudu.'
    ],
    correctOption: 1,
    rationale: 'Dle § 144 odst. 6 NGŘ č. 33/2019 a Instrukce MS č. 8/2022 má příslušník JS obě ruce volné pro okamžité použití donucovacích prostředků nebo zbraně a nikdy se nedotýká přepravovaných peněz.',
    source: '§ 144 odst. 6 NGŘ č. 33/2019 a Instrukce MS č. 8/2022'
  },
  {
    id: 'sp-32',
    subject: 'Služební příprava',
    topic: 'Justiční stráž – Asistence při odnětí dítěte',
    question: 'Jaké jsou povinnosti příslušníka Justiční stráže při doprovodu soudního vykonavatele k odebrání nezletilého dítěte (§ 143)?',
    answer: 'Zajišťuje bezpečnost a ochranu zaměstnance soudu před fyzickými útoky, do objektu nevstupuje první, nepodílí se na samotném odebírání dítěte ani stěhování věcí a při ohrožení zajistí bezpečný odchod.',
    options: [
      'Vstupuje do bytu jako první s vytaženým obuškem, provádí fyzické odebrání dítěte od rodičů a předává jej do přistaveného služebního vozidla JS.',
      'Zajišťuje bezpečnost a ochranu zaměstnance soudu před fyzickými útoky, do objektu nevstupuje první, nepodílí se na samotném odebírání dítěte ani stěhování věcí a při ohrožení zajistí bezpečný odchod.',
      'Provádí ztotožnění všech přítomných osob, sepisuje protokol o výkonu rozhodnutí a v případě odporu rodičů nařídí jejich okamžité zadržení a umístění do cely předběžného zadržení.',
      'Přebírá velení nad celým úkonem, vyslýchá nezletilé dítě v nepřítomnosti rodičů a rozhoduje o tom, kterému z rodičů bude dítě předáno.'
    ],
    correctOption: 1,
    rationale: 'Příslušník JS plní výhradně roli ozbrojené ochrany vykonavatele. Nesmí provádět samotný výkon soudního rozhodnutí ani zasahovat do práv nad rámec odvrácení fyzického útoku.',
    source: '§ 143 NGŘ č. 33/2019 a Instrukce MS č. 8/2022'
  },
  {
    id: 'sp-33',
    subject: 'Služební příprava',
    topic: 'Justiční stráž – Doručování písemností a obálky',
    question: 'U kterého typu soudní obálky NIKDY nenastává fikce doručení vhozením do schránky (§ 146 / OSŘ)?',
    answer: 'Obálka typu II (zelený pruh) – doručování do vlastních rukou s vyloučením vložení do schránky (např. platební rozkaz, trestní příkaz); po 10 dnech se vrací soudu.',
    options: [
      'Obálka typu I (červený pruh) – standardní úřední zásilka, kde je vhození do schránky přísně zakázáno a po 3 dnech dochází ke skartaci.',
      'Obálka typu II (zelený pruh) – doručování do vlastních rukou s vyloučením vložení do schránky (např. platební rozkaz, trestní příkaz); po 10 dnech se vrací soudu.',
      'Obálka typu III (fialový pruh) – určená výhradně pro doručování mezinárodních zatykačů a předvolání svědků s fikcí po 30 dnech.',
      'Obálka typu IV (žlutý pruh) – písemnost doručovaná pouze statutárním orgánům právnických osob do datové schránky s okamžitým účinkem.'
    ],
    correctOption: 1,
    rationale: 'U obálky typu II (§ 49 odst. 5 OSŘ a § 64 odst. 4 TrŘ) zákon vylučuje náhradní doručení vhozením do schránky. Písemnost se vrací soudu jako nedoručená.',
    source: '§ 146 NGŘ č. 33/2019 a § 49 odst. 5 OSŘ'
  },
  {
    id: 'sp-34',
    subject: 'Služební příprava',
    topic: 'Služební zdvořilost – Hodnosti ve VS ČR',
    question: 'Jaké jsou hodnostní sbory a hodnostní označení ve Vězeňské službě ČR dle zákona č. 361/2003 Sb.?',
    answer: 'Praporčické (rotný až nadpraporčík – stříbrné hvězdy), Důstojnické (podporučík až plukovník – zlaté pěticípé hvězdy), Generálské (brigádní generál až generálporučík – zlaté s lipovou ratolestí).',
    options: [
      'Poddůstojnické (strážník až vrchní strážník – bronzové pásky), Inspekční (inspektor až vrchní komisař – stříbrné hvězdy), Ředitelské (rada až generální rada – zlaté hvězdy s meči).',
      'Praporčické (rotný až nadpraporčík – stříbrné hvězdy), Důstojnické (podporučík až plukovník – zlaté pěticípé hvězdy), Generálské (brigádní generál až generálporučík – zlaté s lipovou ratolestí).',
      'Praporčické (desátník až štábní praporčík – zlaté pecky), Důstojnické (podporučík až major – stříbrné hvězdy), Vrchní velení (plukovník až armádní generál – zkřížené šavle).',
      'Základní sbor (čekatel až referent – bez označení), Velitelský sbor (kapitán až plukovník – stříbrné pásky), Generální sbor (divizní generál – velká zlatá hvězda).'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 361/2003 Sb. a NGŘ č. 38/2018 přesně vymezují hodnostní stupně a jejich grafické provedení na náramenících.',
    source: 'Zákon č. 361/2003 Sb. a NGŘ č. 38/2018'
  },
  {
    id: 'sp-35',
    subject: 'Služební příprava',
    topic: 'Pořadová příprava – Kdy příslušník nezdraví',
    question: 'Ve kterých situacích příslušník VS ČR podle NGŘ č. 38/2018 NEZDRAVÍ a nepodává hlášení?',
    answer: 'Při provádění zákroku nebo úkonu, při řízení vozidla/obsluze stroje, při obsluze spojovacích a EZS prostředků na OS, při záchranných pracích, na stanovišti se zbraní v ponosu a při jídle/hygieně.',
    options: [
      'Pouze v době nočního klidu od 22:00 do 06:00 a při kontaktu s příslušníky jiné bezpečnostní složky na veřejnosti.',
      'Při provádění zákroku nebo úkonu, při řízení vozidla/obsluze stroje, při obsluze spojovacích a EZS prostředků na OS, při záchranných pracích, na stanovišti se zbraní v ponosu a při jídle/hygieně.',
      'Při provádění sčítací prověrky na oddíle, při eskortě odsouzeného po chodbě věznice a při vstupu do kanceláře ředitele věznice.',
      'Výhradně při pobytu v mimopracovní době v civilním oděvu a při účasti na poradě vedení věznice.'
    ],
    correctOption: 1,
    rationale: 'V situacích, kde by salutování nebo podávání hlášení mohlo ohrozit bezpečnost, způsobit nehodu nebo přerušit taktický zákrok, je zdravení výslovně zakázáno.',
    source: 'Čl. 11 NGŘ č. 38/2018 o pravidlech služební zdvořilosti'
  },
  {
    id: 'sp-36',
    subject: 'Služební příprava',
    topic: 'Eskorty – Postup při úmrtí vězně',
    question: 'Jaké úkony musí provést velitel eskorty v případě úmrtí eskortované osoby během přepravy (§ 73)?',
    answer: 'Přivolat RZS k ohledání lékařem (koronerem), převzít protokol o prohlídce zemřelého, zajistit předání do márnice, vyhotovit záznam o osobních věcech a ihned informovat ředitele vysílající věznice a Policii ČR.',
    options: [
      'Pokračovat v eskortě do cílové věznice bez zastavení, tělo předat na příjmovém oddělení a úmrtí nechat konstatovat až služebním lékařem cílového zařízení.',
      'Přivolat RZS k ohledání lékařem (koronerem), převzít protokol o prohlídce zemřelého, zajistit předání do márnice, vyhotovit záznam o osobních věcech a ihned informovat ředitele vysílající věznice a Policii ČR.',
      'Předat tělo nejbližší hlídce městské policie, sepsat zjednodušený úřední záznam a eskortu se zbývajícími vězni dokončit podle původního plánu.',
      'Vrátit se neprodleně do odesílající věznice, tělo uložit do cely dočasného umístění a vyčkat na zahájení vyšetřování dozorujícím státním zástupcem.'
    ],
    correctOption: 1,
    rationale: 'Při úmrtí na eskortě je nutné protokolární ohledání lékařem RZS/koronerem, zajištění osobních věcí a okamžité vyrozumění ředitele věznice a Policie ČR k vyloučení cizího zavinění.',
    source: '§ 73 NGŘ č. 33/2019 a metodika eskort (Kupec)'
  },
  {
    id: 'sp-37',
    subject: 'Služební příprava',
    topic: 'Prevence násilí – Kategorie vězňů',
    question: 'Kdo rozhoduje o zařazení vězněné osoby do kategorie DVO (další vytypovaná osoba) a DVO-P (profese) dle NGŘ č. 24/2022?',
    answer: 'Výhradně ŘEDITEL VĚZNICE, který své rozhodnutí písemně odůvodní a originál se zakládá do osobního spisu vězně.',
    options: [
      'Vedoucí oddělení výkonu vazby a trestu (VOVT) na návrh psychologa po provedení vstupního diagnostického vyšetření.',
      'Výhradně ŘEDITEL VĚZNICE, který své rozhodnutí písemně odůvodní a originál se zakládá do osobního spisu vězně.',
      'Odborná komise složená z vychovatele, speciálního pedagoga a sociálního pracovníka prostou většinou hlasů.',
      'Dozorující státní zástupce na základě žádosti Policie ČR nebo Generální inspekce bezpečnostních sborů (GIBS).'
    ],
    correctOption: 1,
    rationale: 'Zatímco STH určuje lékař, NMU psycholog a MON/MPN schvaluje VOVT, o kategoriích DVO (medializované kauzy) a DVO-P (bývalí příslušníci ozbrojených sborů) rozhoduje výhradně ředitel věznice.',
    source: '§ 8 a § 9 NGŘ č. 24/2022'
  },
  {
    id: 'sp-38',
    subject: 'Služební příprava',
    topic: 'Metodika poutání – Nožní pouta',
    question: 'Proč se řetízková i pevná nožní pouta přikládají VÝHRADNĚ na holé nohy nad kotníky a NIKDY přes kalhoty?',
    answer: 'Při přiložení přes kalhoty si vězeň může nohavici vykasat/vysunout zpod pout, čímž se pouta uvolní a ztratí svůj zábranný účinek (hrozí útěk nebo napadení).',
    options: [
      'Aby kov pout nepoškodil látku vězeňského oděvu a nedošlo k prodření služebních nohavic při chůzi.',
      'Při přiložení přes kalhoty si vězeň může nohavici vykasat/vysunout zpod pout, čímž se pouta uvolní a ztratí svůj zábranný účinek (hrozí útěk nebo napadení).',
      'Z důvodu umožnění rychlé elektrické vodivosti v případě nutnosti použití kontaktního paralyzéru na dolní končetiny.',
      'Protože látka kalhot brání automatickému uzamčení bezpečnostního mechanismu a způsobila by zaseknutí klíče v zámku pout.'
    ],
    correctOption: 1,
    rationale: 'Přiložení pout na nohy přes textil umožňuje snadné vyvlečení látky a získání dostatečné vůle pro běh či útok. Pouta se přikládají na holou nohu s aktivací pojistky a zámky směřujícími k zemi.',
    source: 'Metodická příručka poutání ve VS ČR (Kupec)'
  },
  {
    id: 'sp-39',
    subject: 'Služební příprava',
    topic: 'Dokumentace – Záznam o použití DP',
    question: 'Které části formuláře Záznamu o použití donucovacího prostředku vyplňuje a podepisuje zakročující příslušník (ML č. 5/2014)?',
    answer: 'Části A až G (údaje o příslušníkovi, osobě, svědcích, důvodu a popisu zákroku, grafické zakreslení zasažených míst na těle, výsledek a prvotní opatření).',
    options: [
      'Vyplňuje výhradně část A (identifikace zakročujícího) a část M (závěrečné stanovisko Generální inspekce bezpečnostních sborů).',
      'Části A až G (údaje o příslušníkovi, osobě, svědcích, důvodu a popisu zákroku, grafické zakreslení zasažených míst na těle, výsledek a prvotní opatření).',
      'Části A až C (pouze osobní údaje a datum zákroku), zatímco popis průběhu a grafické schéma zranění vyplňuje vyšetřovatel PČR.',
      'Vyplňuje všechny části formuláře od A až po M včetně právního posouzení zákonnosti zákroku a podpisu ředitele věznice v zastoupení.'
    ],
    correctOption: 1,
    rationale: 'Dle Metodického listu č. 5/2014 má formulář 13 částí A–M. Zakročující příslušník zpracovává části A až G ve 2 výtiscích bez zbytečného odkladu.',
    source: '§ 4 Metodického listu ředitele odboru VaJS č. 5/2014'
  }
  ,
  // 36. Donucovací prostředky – Pouta
  {
    id: 'sp-40',
    subject: 'Služební příprava',
    topic: 'Donucovací prostředky',
    question: 'Ve kterých situacích je příslušník VS ČR oprávněn použít pouta (nebo prostředky k zamezení prostorové orientace) jako donucovací prostředek?',
    answer: 'K vzájemnému připoutání předváděných osob, při eskortě, k zamezení fyzického napadání, poškozování majetku nebo pokusu o útěk, a na osobě, která má být umístěna do výkonu trestu/vazby a klade odpor.',
    options: [
      'Pouze při převozu vězně mimo území České republiky.',
      'K vzájemnému připoutání předváděných osob, při eskortě, k zamezení fyzického napadání, poškozování majetku nebo pokusu o útěk, a na osobě, která má být umístěna do výkonu trestu/vazby a klade odpor.',
      'Pouta lze použít pouze se souhlasem ředitele věznice v případě, že vězeň odmítá pracovat.',
      'Pouze v případě, že je vězeň agresivní vůči civilnímu lékaři.'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 555/1992 Sb. taxativně vyjmenovává situace pro použití pout, mezi které patří zejména zamezení útěku, sebepoškozování, napadání okolí a zajištění bezpečnosti při předvádění a eskortách.',
    source: '§ 17 zákona č. 555/1992 Sb., o VS a JS ČR'
  },
  // 37. Donucovací prostředky – Zákaz použití u zranitelných osob
  {
    id: 'sp-41',
    subject: 'Služební příprava',
    topic: 'Donucovací prostředky',
    question: 'U jakých kategorií osob je příslušníkům VS ČR zakázáno použít úderů, kopů, slzotvorných prostředků, taseru a zbraně (neplatí pro nutnou obranu a krajní nouzi)?',
    answer: 'U zjevně těhotných žen, osob zjevně vysokého věku, osob se zjevnou tělesnou vadou (invalidů) a dětí mladších 15 let.',
    options: [
      'U všech cizích státních příslušníků a diplomatů.',
      'U osob, které jsou ve výkonu vazby déle než 1 rok.',
      'U zjevně těhotných žen, osob zjevně vysokého věku, osob se zjevnou tělesnou vadou (invalidů) a dětí mladších 15 let.',
      'Zákon nedefinuje žádné chráněné kategorie, donucovací prostředky lze použít bez omezení vůči každému.'
    ],
    correctOption: 2,
    rationale: 'Zákon jasně chrání vybrané zranitelné skupiny. Výjimka pro použití DP vůči nim platí POUZE tehdy, pokud útok těchto osob bezprostředně ohrožuje život nebo zdraví jiných a nelze jej odvrátit jinak (§ 21 zákona č. 555/1992 Sb.).',
    source: '§ 21 zákona č. 555/1992 Sb., o VS a JS ČR'
  },
  // 38. Základní bezpečnostní pravidlo pro střelbu
  {
    id: 'sp-42',
    subject: 'Služební příprava',
    topic: 'Zbraňová bezpečnost',
    question: 'Jak zní první a nejdůležitější pravidlo bezpečné manipulace se střelnou zbraní?',
    answer: 'S každou zbraní je třeba vždy zacházet tak, jako by byla nabitá a připravená k výstřelu.',
    options: [
      'Zbraň musí být vždy uzamčena v trezoru.',
      'Při předání zbraně je nutné se podívat do hlavně zepředu.',
      'S každou zbraní je třeba vždy zacházet tak, jako by byla nabitá a připravená k výstřelu.',
      'Před výstřelem je třeba zbraň namazat olejem.'
    ],
    correctOption: 2,
    rationale: 'Toto pravidlo (spolu s mířením do bezpečného prostoru a prstem mimo spoušť) tvoří celosvětový standard pro prevenci nechtěných výstřelů a fatálních zranění při manipulaci.',
    source: 'Předpis pro střeleckou přípravu a bezpečnost manipulace se zbraněmi'
  },
  // 39. Taktická obrana proti noži
  {
    id: 'sp-43',
    subject: 'Služební příprava',
    topic: 'Taktická sebeobrana',
    question: 'Jaké je základní taktické pravidlo při nečekaném útoku nožem na krátkou vzdálenost?',
    answer: 'Prioritou je zablokovat/kontrolovat útočící končetinu (ruku s nožem) a narušit stabilitu útočníka, nikoliv se primárně pokoušet nůž vytrhnout.',
    options: [
      'Stát na místě a snažit se zachytit čepel nože holýma rukama.',
      'Prioritou je zablokovat/kontrolovat útočící končetinu (ruku s nožem) a narušit stabilitu útočníka, nikoliv se primárně pokoušet nůž vytrhnout.',
      'Otočit se k útočníkovi zády a utíkat rovně pryč.',
      'Zavřít oči a doufat, že si to útočník rozmyslí.'
    ],
    correctOption: 1,
    rationale: 'Kontrola zbraně a vytvoření bezpečné vzdálenosti/úhlu je klíčové pro přežití útoku bodnou zbraní. Snaha o disarm (vytržení) před plnou kontrolou pohybu vede k těžkým řezným poraněním.',
    source: 'Metodika taktické sebeobrany Akademie VS ČR'
  },
  // 40. Použití elektrického paralyzéru (Taser)
  {
    id: 'sp-44',
    subject: 'Služební příprava',
    topic: 'Donucovací prostředky',
    question: 'Jaký je princip účinku elektrického paralyzéru (např. Taser) používaného VS ČR?',
    answer: 'Taser vystřeluje elektrody, které po zasažení těla naruší senzorický a motorický nervový systém útočníka (NMI - Neuromuskulární inkapacitace), což způsobí okamžitou, ale dočasnou svalovou paralýzu a neschopnost ovládat tělo.',
    options: [
      'Způsobuje trvalé poškození mozkové kůry vysokým napětím.',
      'Taser vystřeluje elektrody, které po zasažení těla naruší senzorický a motorický nervový systém útočníka (NMI - Neuromuskulární inkapacitace), což způsobí okamžitou, ale dočasnou svalovou paralýzu a neschopnost ovládat tělo.',
      'Využívá ultrazvukové vlny k vyvolání nevolnosti a zvracení.',
      'Pouze zahřeje kůži na vysokou teplotu a způsobí popáleniny 3. stupně.'
    ],
    correctOption: 1,
    rationale: 'Technologie NMI přeruší komunikaci mezi mozkem a svaly (bez ohledu na toleranci bolesti pachatele např. z drog). Po vypnutí cyklu se motorická funkce okamžitě vrací k normálu.',
    source: '§ 17 zákona č. 555/1992 Sb. a manuál výrobce'
  }
];
