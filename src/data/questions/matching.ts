import { MatchingCategory } from '../../types';

export const matchingCategories: MatchingCategory[] = [
  {
    id: 'vedeni_vscr',
    title: 'Vedení VS ČR a resortu justice',
    asOf: 'září 2026',
    pairs: [
      { id: 'v1', left: 'Ministr spravedlnosti ČR', right: 'JUDr. Jeroným Tejc (stojí v čele resortu justice)' },
      { id: 'v2', left: 'Generální ředitel VS ČR', right: 'genmjr. Mgr. Tomáš Hůlka, LL.M. (řídí Vězeňskou službu ČR)' },
      { id: 'v3', left: 'Náměstek GŘ pro bezpečnost, kontrolu a odb. zacházení', right: 'brig. gen. PhDr. Petr Červený, MBA, LL.M.' },
      { id: 'v4', left: 'Náměstek GŘ pro ekonomiku a logistiku', right: 'Ing. Jaroslav Myšička, MBA' },
      { id: 'v5', left: 'Náměstek GŘ pro penologii a správní činnost', right: 'plk. Ing. Zbyšek Trepeš' },
      { id: 'v6', left: 'Ředitel odboru výkonu vazby a trestu GŘ', right: 'Mgr. Kamil Indra' },
      { id: 'v7', left: 'Ředitelka Akademie VS ČR (Stráž pod Ralskem)', right: 'plk. Mgr. Martina Gänsel, LL.M.' },
      { id: 'v8', left: 'Ředitel odboru vězeňské a justiční stráže GŘ', right: 'plk. Mgr. Jiří Princ' },
      { id: 'v9', left: 'Osoby se zvláštním oprávněním vstupu bez prokazování totožnosti', right: 'Ministr spravedlnosti, Generální ředitel VS ČR a jeho náměstci' }
    ]
  },
  {
    id: 'organizace_vscr',
    title: 'Organizační struktura a složky VS ČR',
    pairs: [
      { id: 'org1', left: 'Generální ředitelství VS ČR (GŘ)', right: 'Organizační jednotka, která zabezpečuje společné úkoly ostatních jednotek VS ČR, metodicky je řídí a kontroluje' },
      { id: 'org2', left: 'Vězeňská stráž (VS)', right: 'Zajišťuje střežení, eskorty, pořádek a bezpečnost ve věznicích a detenčních ústavech' },
      { id: 'org3', left: 'Justiční stráž (JS)', right: 'Zajišťuje pořádek, bezpečnost a ochranu osob v budovách soudů a státních zastupitelství' },
      { id: 'org4', left: 'Správní služba', right: 'Rozhoduje ve správním řízení, zajišťuje organizační, ekonomickou, výchovnou, vzdělávací a zdravotnickou činnost' },
      { id: 'org5', left: 'Akademie VS ČR (Stráž pod Ralskem)', right: 'Vzdělávací instituce zajišťující základní i specializovanou přípravu příslušníků (ZOP)' },
      { id: 'org6', left: 'Oddělení prevence a stížností (OPaS)', right: 'Pověřený kontrolní orgán prošetřující stížnosti vězněných osob a mimořádné události' }
    ]
  },
  {
    id: 'paragrafy_555',
    title: 'Klíčové paragrafy zákona č. 555/1992 Sb.',
    pairs: [
      { id: 'p1', left: '§ 6 zákona č. 555/1992 Sb.', right: 'Jednat s vězněnými osobami vážně a rozhodně, před zákrokem výzva „jménem zákona“' },
      { id: 'p2', left: '§ 10 zákona č. 555/1992 Sb.', right: 'Oprávnění požadovat vysvětlení' },
      { id: 'p8', left: '§ 11 zákona č. 555/1992 Sb.', right: 'Osobní prohlídka a prohlídka těla osoby ve výkonu vazby či trestu' },
      { id: 'p3', left: '§ 13 zákona č. 555/1992 Sb.', right: 'Zjišťování totožnosti a prohlídky zavazadel a vozidel při střežení objektů' },
      { id: 'p9', left: '§ 14 zákona č. 555/1992 Sb.', right: 'Oprávnění požádat kohokoli o pomoc při bezprostředním nebezpečí' },
      { id: 'p4', left: '§ 17 zákona č. 555/1992 Sb.', right: 'Taxativní katalog donucovacích prostředků' },
      { id: 'p5', left: '§ 18 zákona č. 555/1992 Sb.', right: 'Zákonné důvody a podmínky pro použití služební zbraně' },
      { id: 'p6', left: '§ 19 zákona č. 555/1992 Sb.', right: 'Omezení použití DP a zbraně (těhotná žena, osoba vysokého věku, zjevně mladší 15 let)' },
      { id: 'p7', left: '§ 20 zákona č. 555/1992 Sb.', right: 'Povinnosti příslušníka po použití DP a zbraně (první pomoc, hlášení, záznam)' }
    ]
  },
  {
    id: 'donucovaci_prostredky_555',
    title: 'Katalog donucovacích prostředků (§ 17 zák. 555/1992 Sb.)',
    pairs: [
      { id: 'dp1', left: 'Hmaty, chvaty, údery a kopy (§ 17 odst. 2 písm. a)', right: 'Základní sebeobrana k překonání fyzického odporu nebo odvrácení útoku' },
      { id: 'dp2', left: 'Předváděcí řetízky (§ 17 odst. 2 písm. b)', right: 'Bezpečné připoutání a předvedení předváděné či eskortované osoby' },
      { id: 'dp3', left: 'Pouta (§ 17 odst. 2 písm. c)', right: 'Omezení pohybu rukou při agresivitě, maření výkonu služby nebo riziku útěku' },
      { id: 'dp4', left: 'Poutací popruhy (§ 17 odst. 2 písm. d)', right: 'Znehybnění osoby na lůžku při akutním sebepoškozování či zuřivosti' },
      { id: 'dp5', left: 'Pouta s poutacím opaskem (§ 17 odst. 2 písm. e)', right: 'Zvýšené bezpečnostní zajištění rukou u těla při eskortě nebezpečných osob' },
      { id: 'dp6', left: 'Slzotvorný, elektrický či jiný prostředek (§ 17 odst. 2 písm. f)', right: 'Dočasné zneschopnění agresora (sprej, taser) na dálku bez trvalých následků' },
      { id: 'dp7', left: 'Obušek a jiný úderný prostředek (§ 17 odst. 2 písm. g)', right: 'Úderný prostředek k odvrácení fyzického útoku a překonání aktivního odporu' },
      { id: 'dp8', left: 'Služební pes (§ 17 odst. 2 písm. h)', right: 'Překonání odporu, ochrana eskorty, pátrání a silné psychologické působení' },
      { id: 'dp9', left: 'Vodní stříkač (§ 17 odst. 2 písm. ch)', right: 'Hromadné narušení pořádku, vzpoura a rozptýlení agresivního davu' },
      { id: 'dp10', left: 'Zásahová výbuška (§ 17 odst. 2 písm. i)', right: 'Zvukový a světelný šok způsobující dočasnou dezorientaci při vstupu' },
      { id: 'dp11', left: 'Expanzní zbraně (§ 17 odst. 2 písm. j)', right: 'Palná zbraň pro nábojky (plyn, záblesk, zvuk), kulový ani brokový náboj nevystřelí' },
      { id: 'dp12', left: 'Úder a hrozba střelnou zbraní (§ 17 odst. 2 písm. k, l)', right: 'Důrazná výzva namířenou zbraní či fyzický úder tělem zbraně v nouzi' },
      { id: 'dp13', left: 'Varovný výstřel (§ 17 odst. 2 písm. m)', right: 'Výstřel do bezpečného prostoru jako poslední výstraha před střelbou' },
      { id: 'dp14', left: 'Vytlačování štítem nebo vozidlem (§ 17 odst. 2 písm. n, o)', right: 'Kordonový postup pořádkové jednotky či vytlačení překážky vozidlem' },
      { id: 'dp15', left: 'Prostředek k zamezení prostorové orientace (§ 17 odst. 2 písm. p)', right: 'Neprůhledná kukla/brýle zamezující zjištění polohy a trasy při eskortě' }
    ]
  },
  {
    id: 'hodnosti',
    title: 'Služební hodnosti bezpečnostních sborů (Zákon č. 361/2003 Sb.)',
    pairs: [
      { id: 'h1', left: '2 stříbrné pěticípé hvězdy', right: 'Strážmistr (strm.)' },
      { id: 'h2', left: '3 stříbrné pěticípé hvězdy', right: 'Nadstrážmistr (nstrm.)' },
      { id: 'h3', left: '1 stříbrná hvězda + stříbrná lemovka', right: 'Podpraporčík (pprap.)' },
      { id: 'h4', left: '2 stříbrné hvězdy + stříbrná lemovka', right: 'Praporčík (prap.)' },
      { id: 'h5', left: '3 stříbrné hvězdy + stříbrná lemovka', right: 'Nadpraporčík (nprap.)' },
      { id: 'h6', left: '1 zlatá pěticípá hvězda (důstojník)', right: 'Podporučík (ppor.)' },
      { id: 'h7', left: '2 zlaté pěticípé hvězdy', right: 'Poručík (por.)' },
      { id: 'h8', left: '3 zlaté pěticípé hvězdy', right: 'Nadporučík (npor.)' },
      { id: 'h9', left: '4 zlaté pěticípé hvězdy', right: 'Kapitán (kpt.)' },
      { id: 'h10', left: '1 zlatá hvězda + zlatá lemovka (kolejnice)', right: 'Major (mjr.)' },
      { id: 'h11', left: '2 zlaté hvězdy + zlatá lemovka (kolejnice)', right: 'Podplukovník (pplk.)' },
      { id: 'h12', left: '3 zlaté hvězdy + zlatá lemovka (kolejnice)', right: 'Plukovník (plk.)' }
    ]
  },
  {
    id: 'druhy_veznic',
    title: 'Typy věznic a stupně zabezpečení (§ 56 TZ, § 12a ZVTOS, §§ 51–54 vězeňského řádu)',
    pairs: [
      { id: 'dv1', left: 'Věznice s ostrahou – nízký stupeň zabezpečení', right: 'Pohyb v určených prostorách zpravidla bez dohledu, práce zpravidla mimo věznici' },
      { id: 'dv2', left: 'Věznice s ostrahou – střední stupeň zabezpečení', right: 'Pohyb organizovaně pod dohledem, práce zpravidla na nestřežených pracovištích mimo věznici' },
      { id: 'dv3', left: 'Věznice s ostrahou – vysoký stupeň zabezpečení', right: 'Pohyb organizovaně pod dohledem, práce uvnitř věznice nebo na střežených pracovištích' },
      { id: 'dv4', left: 'Věznice se zvýšenou ostrahou (VZO)', right: 'Bez volného pohybu i při práci, práce jen uvnitř věznice nebo v celách, dohled nejméně 1× za 30 minut' },
      { id: 'dv5', left: 'Vazební věznice', right: 'Zajištění obviněných osob pro účely trestního řízení (§ 67 Trestního řádu)' },
      { id: 'dv6', left: 'Ústav pro výkon zabezpečovací detence (ÚVVZD)', right: 'Léčebně-izolační výkon detence pro duševně nemocné či nebezpečné pachatele' }
    ]
  },
  {
    id: 'kazenske_tresty',
    title: 'Kázeňská řízení a tresty odsouzených (§ 46 odst. 3 zák. 169/1999 Sb.)',
    pairs: [
      { id: 'kt1', left: 'Důtka', right: 'Nejmírnější kázeňský trest za méně závažné porušení vězeňského řádu' },
      { id: 'kt2', left: 'Snížení kapesného', right: 'Finanční postih až o jednu třetinu na dobu až 3 kalendářních měsíců' },
      { id: 'kt3', left: 'Propadnutí věci', right: 'Trvalé odebrání nedovoleného předmětu (např. nepovolený elektrospotřebič)' },
      { id: 'kt4', left: 'Zákaz přijetí balíčku', right: 'Zákaz přijetí jednoho balíčku v kalendářním roce, nikoli roční zákaz' },
      { id: 'kt5', left: 'Umístění do uzavřeného oddílu', right: 'Zpřísněný režim mimo dobu plnění úkolů programu zacházení až na 28 dnů' },
      { id: 'kt9', left: 'Celodenní umístění do uzavřeného oddílu', right: 'Pobyt v uzavřeném oddílu po celý den až na 20 dnů' },
      { id: 'kt6', left: 'Umístění do samovazby', right: 'Nejpřísnější trest: izolace na samovazbě až na 20 dnů (u mladistvých max. 10 dnů)' },
      { id: 'kt7', left: 'Pokuta', right: 'Peněžitý kázeňský trest až do výše 5 000 Kč — nezaměňovat s odměnou do 1 000 Kč' },
      { id: 'kt8', left: 'Odnětí výhod z předchozí odměny', right: 'Zrušení výhod, které odsouzený získal dřívější kázeňskou odměnou' }
    ]
  },
  {
    id: 'skody',
    title: 'Hranice škod v trestním zákoníku (§ 138 TZ)',
    pairs: [
      { id: 's1', left: 'Škoda nikoli nepatrná (hranice přestupek / trestný čin)', right: 'min. 10 000 Kč' },
      { id: 's2', left: 'Škoda nikoli malá', right: 'min. 50 000 Kč' },
      { id: 's3', left: 'Větší škoda', right: 'min. 100 000 Kč' },
      { id: 's4', left: 'Značná škoda', right: 'min. 1 000 000 Kč' },
      { id: 's5', left: 'Škoda velkého rozsahu', right: 'min. 10 000 000 Kč' },
      { id: 's6', left: 'Krádež bez dalšího znaku trestného činu (jen přestupek)', right: 'škoda pod 10 000 Kč' }
    ]
  },
  {
    id: 'penologie_pojmy',
    title: 'Vytypované vězněné osoby (NGŘ 24/2022) a SARPO',
    pairs: [
      { id: 'rk1', left: 'MON', right: 'Možný objekt násilí (lehce zranitelná osoba ohrožená napadením či zneužitím)' },
      { id: 'rk2', left: 'MPN', right: 'Možný pachatel násilí (osoba se sklony k agresivnímu jednání)' },
      { id: 'rk3', left: 'DVO', right: 'Další vytypovaná osoba' },
      { id: 'rk7', left: 'DVO-P', right: 'Další vytypovaná osoba charakteristická výkonem profese' },
      { id: 'rk4', left: 'STH', right: 'Osoba s výrazně sníženou tělesnou hmotností' },
      { id: 'rk5', left: 'NMU', right: 'Osoba se zjevně nízkou mentální úrovní' },
      { id: 'rk6', left: 'SARPO', right: 'Souhrnná analýza rizik a potřeb odsouzeného (podklad pro zacházení)' }
    ]
  },
  {
    id: 'mimoradne_udalosti',
    title: 'Mimořádné bezpečnostní signály a postupy',
    pairs: [
      { id: 'mu1', left: 'Červený pruh na osobní kartě / eskortním lístku', right: 'Zvýšené nebezpečí útěku nebo napadení personálu (nutná maximální ostraha)' },
      { id: 'mu2', left: 'Signál „NÁSILÍ“', right: 'Fyzické napadení příslušníka či hromadný konflikt vězňů vyžadující okamžitý zásah' },
      { id: 'mu3', left: 'Signál „ÚTĚK“', right: 'Narušení signálně-bezpečnostní linie perimetru nebo svévolné opuštění věznice' },
      { id: 'mu4', left: 'Zvláštní režim střežení (Kategorie A)', right: 'Nejvyšší stupeň bezpečnostních opatření při eskortě k soudu a k lékaři' },
      { id: 'mu5', left: 'Hladovka vězně', right: 'Neprodleně vyrozumět lékaře a dozorového státního zástupce (§ 23 odst. 4 vězeňského řádu)' }
    ]
  },
  {
    id: 'tccc_first_aid',
    title: 'Neodkladná první pomoc & TCCC',
    pairs: [
      { id: 'fa1', left: 'Turniket / CAT škrtidlo', right: 'Okamžitá zástava masivního tepenného krvácení končetiny' },
      { id: 'fa2', left: 'Chest Seal s ventilovou chlopní', right: 'Uzavření otevřeného poranění hrudníku, ventil brání vzniku tenzního pneumotoraxu' },
      { id: 'fa3', left: 'Poměr KPR u dospělého', right: '30 stlačení hrudníku : 2 vdechy (frekvence 100–120/min)' },
      { id: 'fa4', left: 'Izraelský tlakový obvaz', right: 'Tlakové krytí hlubokých ran a plošných krvácení' },
      { id: 'fa5', left: 'Stabilizovaná (zotavovací) poloha', right: 'Osoba v bezvědomí se spolehlivě zachovaným dýcháním' },
      { id: 'fa6', left: 'Nosní vzduchovod (NPA)', right: 'Zajištění průchodnosti dýchacích cest při zapadajícím jazyku u zraněného' }
    ]
  },
  {
    id: 'bezpecna_manipulace',
    title: 'Bezpečná manipulace se zbraní a zkušební značky (příručka SPST)',
    pairs: [
      { id: 'bm1', left: 'Základní pravidlo', right: 'Se zbraní zacházej vždy tak, jako by byla nabitá' },
      { id: 'bm2', left: 'Nejlepší pojistka', right: 'Jakýkoli prst výrazně mimo spoušť' },
      { id: 'bm3', left: 'Míření na člověka', right: 'Jen při splnění zákonných podmínek pro použití střelné zbraně' },
      { id: 'bm4', left: 'Bezpečný prostor', right: 'Střela při náhodném výstřelu či ráně jistoty neohrozí osoby ani nezpůsobí větší škodu' },
      { id: 'bm5', left: 'Kdy smí být prst na spoušti', right: 'Vědomý výstřel, vypouštění kohoutu, rána jistoty, kontrola po sborce' },
      { id: 'bm6', left: 'Tormentační značka', right: 'Značka státní zkušebny ČÚZZS na hlavních částech zbraně' },
      { id: 'bm7', left: 'Značka „A CZ“ v trojúhelníku', right: 'Kontrolní značka vojenské zbraně, která není ve výzbroji Armády ČR' },
      { id: 'bm8', left: 'Značka lva (Praha, od roku 1984)', right: 'Kusové ověření zbraně s drážkovým vývrtem, zkouška bezdýmným prachem' }
    ]
  },
  {
    id: 'cz75_technika',
    title: 'CZ 75 B – technická data a konstrukce (příručka SPST)',
    pairs: [
      { id: 'ct1', left: 'Ráže', right: '9 mm (9×19 Luger)' },
      { id: 'ct2', left: 'Kapacita zásobníku', right: '15 nábojů' },
      { id: 'ct3', left: 'Plný palebný průměr', right: '30 nábojů (2 zásobníky po 15)' },
      { id: 'ct4', left: 'Délka hlavně', right: '120 mm' },
      { id: 'ct5', left: 'Celková délka', right: '206 mm' },
      { id: 'ct6', left: 'Hmotnost prázdné zbraně', right: '1000 g' },
      { id: 'ct7', left: 'Efektivní střelba', right: 'do 50 m' },
      { id: 'ct8', left: 'Maximální dostřel', right: '2000 m' },
      { id: 'ct9', left: 'Systém závěru', right: 'Uzamčený závěr, systém Browning (krátký zákluz, nucený pokles hlavně)' },
      { id: 'ct10', left: 'Spoušťový mechanismus', right: 'SA/DA – jednočinná i dvojčinná spoušť' },
      { id: 'ct11', left: 'Vývrt hlavně', right: '6 drážek a 6 polí' },
      { id: 'ct12', left: 'Mířidla (hledí a muška)', right: 'Pevná, mechanická, otevřená' }
    ]
  },
  {
    id: 'cz75_soucasti',
    title: 'CZ 75 B – součásti a pojistky (příručka SPST)',
    pairs: [
      { id: 'cs1', left: 'Doraz blokování zápalníku', right: 'Automatická pojistka: zápalník se nepohne, dokud není stisknuta spoušť' },
      { id: 'cs2', left: 'Pojistka (vnější, mechanická)', right: 'Ovládá ji střelec, zajistí jen napnutý kohout, blokuje spoušť i závěr' },
      { id: 'cs3', left: 'Bezpečnostní ozub kohoutu', right: 'Pádová pojistka proti výstřelu při pádu na kohout či jeho vysmeknutí' },
      { id: 'cs4', left: 'Vodící kulisa a rozborný čep', right: 'Pokles a zdvih zadku hlavně při odemykání a uzamykání' },
      { id: 'cs5', left: 'Uzamykací žebra hlavně', right: 'Zapadají do uzamykacích ozubů závěru a uzamknou hlaveň' },
      { id: 'cs6', left: 'Úchopová část těla zbraně', right: 'V její zadní části je uložena bicí zpruha a brzda zásobníku' },
      { id: 'cs7', left: 'Záchyt závěru', right: 'Zároveň slouží jako rozborný čep při rozborce' },
      { id: 'cs8', left: 'Předsuvná (vratná) zpruha', right: 'Na vedení pod hlavní, vrací závěr do přední polohy' },
      { id: 'cs9', left: 'Části zásobníku', right: 'Plášť, podavač, zpruha, západka dna a dno zásobníku' },
      { id: 'cs10', left: 'Hlavní části CZ 75 B s výrobním číslem', right: 'Závěr, hlaveň a tělo zbraně' }
    ]
  },
  {
    id: 'evo3_technika',
    title: 'CZ Scorpion EVO 3 A1 – technická data a konstrukce (příručka SPST)',
    pairs: [
      { id: 'et1', left: 'Označení „EVO 3“', right: 'Třetí generace Scorpionu' },
      { id: 'et2', left: 'Písmeno „A“ v označení', right: 'Ozbrojený sektor – samočinná verze' },
      { id: 'et3', left: 'Číslice „1“ za písmenem', right: 'Provedení v ráži 9×19 mm' },
      { id: 'et4', left: 'Režimy střelby', right: 'Jednotlivé rány, tříranné dávky a neomezené dávky' },
      { id: 'et5', left: 'Typ závěru', right: 'Dynamický neuzamčený závěr, střílí z přední polohy' },
      { id: 'et6', left: 'Kapacita zásobníku', right: '30 nábojů (vyrábí se i 20 a 10ranný)' },
      { id: 'et7', left: 'Plný palebný průměr', right: '90 nábojů (3 zásobníky po 30)' },
      { id: 'et8', left: 'Délka hlavně', right: '196 mm' },
      { id: 'et9', left: 'Délka s vyklopenou / sklopenou opěrou', right: '670 mm / 410 mm' },
      { id: 'et10', left: 'Hmotnost prázdné zbraně', right: '2450 g' },
      { id: 'et11', left: 'Účinný dostřel', right: '200 m' },
      { id: 'et12', left: 'Maximální dostřel', right: '2200 m' },
      { id: 'et13', left: 'Montážní lišty', right: 'Po čtyřech stranách pouzdra závěru, MIL-STD-1913' },
      { id: 'et14', left: 'Manuální pojistka v poloze „0“', right: 'Zbraň je zajištěna' }
    ]
  },
  {
    id: 'evo3_rozborka',
    title: 'CZ Scorpion EVO 3 A1 – části a rozborka (příručka SPST)',
    pairs: [
      { id: 'er1', left: 'Rozborka – krok 1', right: 'Napnout závěr a zachytit přestavitelnou páku vzadu v pojistném výřezu' },
      { id: 'er2', left: 'Rozborka – krok 2', right: 'Vysunout přední čep doleva, vyháknout a odejmout pouzdro spouštědla' },
      { id: 'er3', left: 'Rozborka – krok 3', right: 'Otvorem ve spodní části vyjmout závěr s vratnou pružinou na vodicím trnu' },
      { id: 'er4', left: 'Sestava hlavně s předpažbím', right: 'Kompenzátor, matice hlavně, chladič, hlaveň s fixační vložkou, předpažbí' },
      { id: 'er5', left: 'Spouštědlo', right: 'Bicí kladivo, rozborný čep, ovladač, záchyt závěru, vyhazovač, spoušť' },
      { id: 'er6', left: 'Polohovač ramenní opěry', right: 'Tři podélné stavitelné polohy' },
      { id: 'er7', left: 'Západka opěry', right: 'Hmatník pro vztyčení a sklopení ramenní opěry' },
      { id: 'er8', left: 'Vybrání na pravém boku závěru', right: 'Dorážení závěru do přední polohy při silném znečištění' },
      { id: 'er9', left: 'Zásobník EVO 3', right: 'Dvouřadý s dvouřadým vyústěním' },
      { id: 'er10', left: 'Popruh ke zbrani', right: 'Jednobodový' }
    ]
  },
  {
    id: 'druhy_zbrani',
    title: 'Druhy zbraní (příručka SPST)',
    pairs: [
      { id: 'dz1', left: 'Palná zbraň', right: 'Střelná zbraň poháněná okamžitým uvolněním chemické energie' },
      { id: 'dz2', left: 'Plynová zbraň', right: 'Střelná zbraň poháněná stlačeným vzduchem nebo jiným plynem' },
      { id: 'dz3', left: 'Mechanická zbraň', right: 'Střelná zbraň poháněná nahromaděnou mechanickou energií' },
      { id: 'dz4', left: 'Expanzní zbraň', right: 'Palná zbraň, která konstrukčně vylučuje kulový i brokový náboj' },
      { id: 'dz5', left: 'Krátká zbraň', right: 'Hlaveň nejvýše 300 mm nebo celková délka nejvýše 600 mm' },
      { id: 'dz6', left: 'Samočinná zbraň', right: 'Nabíjí se výstřelem a umožní více výstřelů na jedno stisknutí spouště' },
      { id: 'dz7', left: 'Samonabíjecí zbraň', right: 'Nabíjí se výstřelem, ale na jedno stisknutí spouště jen jeden výstřel' },
      { id: 'dz8', left: 'Opakovací zbraň', right: 'Nabíjí se ručním ovládáním závěru nebo otočením revolverového válce' },
      { id: 'dz9', left: 'Jednoranová zbraň', right: 'Bez zásobníku, náboj se vkládá ručně do komory' },
      { id: 'dz10', left: 'Historická zbraň', right: 'Zbraň i všechny její hlavní části vyrobeny do 31. 12. 1890' },
      { id: 'dz11', left: 'Signální zbraň', right: 'Jednoúčelové zařízení pro signální náboje ráže větší než 16 mm' },
      { id: 'dz12', left: 'Hlavní části střelné zbraně', right: 'Hlaveň, vložná hlaveň, vložná komora, rám, válec, pouzdro závěru, tělo, závěr' }
    ]
  },
  {
    id: 'druhy_streliva',
    title: 'Druhy střeliva (příručka SPST)',
    pairs: [
      { id: 'ds1', left: 'Náboj', right: 'Nábojnice, zápalka, výmetná náplň a střela – do palné zbraně' },
      { id: 'ds2', left: 'Nábojka', right: 'Do expanzní zbraně či přístroje: nábojnice, zápalka, případně náplň či dráždivá látka' },
      { id: 'ds3', left: 'Jednotná střela', right: 'Po opuštění hlavně se nerozdělí' },
      { id: 'ds4', left: 'Hromadná střela', right: 'Po opuštění hlavně se rozdělí (např. broky)' },
      { id: 'ds5', left: 'Průbojná střela', right: 'Materiál tvrdší než 250 HB (tvrdost podle Brinella)' },
      { id: 'ds6', left: 'Šoková střela', right: 'Špička komolého kužele s otevřenou dutinou, plášť na okrajích naříznut' },
      { id: 'ds7', left: 'Střelivo přebíjené', right: 'Využívá již použité nábojnice' },
      { id: 'ds8', left: 'Cvičný náboj', right: 'Akustická a světelná imitace ostré střelby' },
      { id: 'ds9', left: 'Maketa střeliva', right: 'Tvarově shodná s originálem, bez aktivních náplní, pro výuku' },
      { id: 'ds10', left: 'Znehodnocené střelivo', right: 'Upravené tak, že nemá žádnou aktivní náplň a nemůže plnit funkci' }
    ]
  },
  {
    id: 'cz75_diagram',
    title: 'CZ 75 B – Hlavní části zbraně (Diagram)',
    type: 'diagram',
    imageUrl: '/images/weapons/cz75.jpg',
    pairs: [],
    parts: [
      { id: 'c1', label: 'Muška', top: 27, left: 10, labelTop: 10, labelLeft: 18 },
      { id: 'c2', label: 'Závěr', top: 31, left: 45, labelTop: 10, labelLeft: 50 },
      { id: 'c3', label: 'Hledí', top: 26, left: 78, labelTop: 10, labelLeft: 82 },
      { id: 'c4', label: 'Kohout', top: 31, left: 88, labelTop: 32, labelLeft: 88 },
      { id: 'c5', label: 'Pojistka (manuální)', top: 38, left: 74, labelTop: 54, labelLeft: 88 },
      { id: 'c6', label: 'Střenky (rukojeť)', top: 65, left: 80, labelTop: 76, labelLeft: 88 },
      { id: 'c7', label: 'Zásobník (dno)', top: 83, left: 82, labelTop: 92, labelLeft: 70 },
      { id: 'c8', label: 'Lučík a spoušť', top: 52, left: 49, labelTop: 92, labelLeft: 35 },
      { id: 'c9', label: 'Záchyt závěru', top: 37.5, left: 61, labelTop: 68, labelLeft: 14 },
      { id: 'c10', label: 'Tělo zbraně (rám)', top: 39, left: 28, labelTop: 44, labelLeft: 14 },
      { id: 'c11', label: 'Hlaveň (ústí)', top: 32, left: 6.5, labelTop: 24, labelLeft: 14 },
      { id: 'c12', label: 'Záchyt zásobníku', top: 52.8, left: 65.2, labelTop: 80, labelLeft: 45 }
    ]
  },
  {
    id: 'evo3_diagram',
    title: 'CZ Scorpion EVO 3 – Hlavní části (Diagram)',
    type: 'diagram',
    imageUrl: '/images/weapons/evo3.jpg',
    pairs: [],
    parts: [
      { id: 'e1', label: 'Hledí (dioptrické)', top: 31.5, left: 40.5, labelTop: 10, labelLeft: 20 },
      { id: 'e2', label: 'Montážní lišta (Picatinny)', top: 33, left: 58, labelTop: 10, labelLeft: 50 },
      { id: 'e3', label: 'Muška', top: 31.5, left: 76.5, labelTop: 10, labelLeft: 80 },
      { id: 'e4', label: 'Kompenzátor', top: 40.5, left: 94, labelTop: 32, labelLeft: 88 },
      { id: 'e5', label: 'Předpažbí', top: 40.5, left: 80, labelTop: 54, labelLeft: 88 },
      { id: 'e6', label: 'Táhlo s hmatníkem', top: 35.5, left: 81, labelTop: 76, labelLeft: 88 },
      { id: 'e7', label: 'Zásobník', top: 62, left: 63, labelTop: 92, labelLeft: 70 },
      { id: 'e8', label: 'Pažbička', top: 54, left: 40, labelTop: 92, labelLeft: 35 },
      { id: 'e9', label: 'Ovladač (přeřaďovač střelby)', top: 44, left: 46.5, labelTop: 68, labelLeft: 14 },
      { id: 'e10', label: 'Výhozní okénko', top: 37.5, left: 59.5, labelTop: 44, labelLeft: 14 },
      { id: 'e11', label: 'Ramenní opěra (sklopná)', top: 41, left: 20, labelTop: 24, labelLeft: 14 }
    ]
  },
  {
    id: 'tccc_diagram',
    title: 'Vybavení lékárničky IFAK (Diagram)',
    type: 'diagram',
    imageUrl: '/images/gear/ifak_kit.jpg',
    pairs: [],
    parts: [
      { id: 'm1', label: 'Pouzdro IFAK', top: 50, left: 24, labelTop: 18, labelLeft: 22 },
      { id: 'm2', label: 'Turniket (CAT zaškrcovadlo)', top: 50, left: 47, labelTop: 18, labelLeft: 50 },
      { id: 'm3', label: 'Chlopeň na hrudník (Chest Seal)', top: 50, left: 68, labelTop: 18, labelLeft: 78 },
      { id: 'm4', label: 'Izraelský tlakový obvaz', top: 50, left: 57, labelTop: 82, labelLeft: 35 },
      { id: 'm5', label: 'Hemostatická gáza', top: 50, left: 81, labelTop: 82, labelLeft: 65 },
      { id: 'm6', label: 'Nosní vzduchovod (NPA)', top: 50, left: 92, labelTop: 82, labelLeft: 88 }
    ]
  }
];
