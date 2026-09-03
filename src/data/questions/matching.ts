import { MatchingCategory } from '../../types';

export const matchingCategories: MatchingCategory[] = [
  {
    id: 'vedeni_vscr',
    title: 'Vedení VS ČR a resortu justice',
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
      { id: 'org1', left: 'Generální ředitelství VS ČR (GŘ)', right: 'Ústřední správní úřad řídící a kontrolující věznice a vazební ústavy v ČR' },
      { id: 'org2', left: 'Vězeňská stráž (VS)', right: 'Zajišťuje střežení, eskorty, pořádek a bezpečnost ve věznicích a detenčních ústavech' },
      { id: 'org3', left: 'Justiční stráž (JS)', right: 'Zajišťuje pořádek, bezpečnost a ochranu osob v budovách soudů a státních zastupitelství' },
      { id: 'org4', left: 'Správní služba', right: 'Zabezpečuje personální, finanční, logistické, zdravotnické a provozní zázemí' },
      { id: 'org5', left: 'Akademie VS ČR (Stráž pod Ralskem)', right: 'Vzdělávací instituce zajišťující základní i specializovanou přípravu příslušníků (ZOP)' },
      { id: 'org6', left: 'Oddělení prevence a stížností (OPS)', right: 'Pověřený kontrolní orgán prošetřující stížnosti vězněných osob a mimořádné události' }
    ]
  },
  {
    id: 'paragrafy_555',
    title: 'Klíčové paragrafy zákona č. 555/1992 Sb.',
    pairs: [
      { id: 'p1', left: '§ 6 zákona č. 555/1992 Sb.', right: 'Oprávnění vyzvat k prokázání totožnosti' },
      { id: 'p2', left: '§ 10 zákona č. 555/1992 Sb.', right: 'Oprávnění k provádění osobní a věcné prohlídky' },
      { id: 'p3', left: '§ 13 zákona č. 555/1992 Sb.', right: 'Oprávnění k zákazu vstupu a vykázání osob z objektu' },
      { id: 'p4', left: '§ 17 zákona č. 555/1992 Sb.', right: 'Taxativní katalog donucovacích prostředků' },
      { id: 'p5', left: '§ 18 zákona č. 555/1992 Sb.', right: 'Zákonné důvody a podmínky pro použití služební zbraně' },
      { id: 'p6', left: '§ 19 zákona č. 555/1992 Sb.', right: 'Zvláštní omezení použití DP a zbraně (těhotné, děti, senioři, postižení)' },
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
      { id: 'dp11', left: 'Expanzní zbraně (§ 17 odst. 2 písm. j)', right: 'Vystřelení nesmrtícího projektilu či akustického náboje k zastavení útoku' },
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
    title: 'Typy věznic a stupně zabezpečení (§ 39a TZ)',
    pairs: [
      { id: 'dv1', left: 'Věznice s ostrahou – nízký stupeň zabezpečení', right: 'Volný pohyb v ubytovně, možnost zaměstnání mimo věznici bez přímého dozoru' },
      { id: 'dv2', left: 'Věznice s ostrahou – střední stupeň zabezpečení', right: 'Organizovaný pohyb pod dozorem, práce uvnitř věznice nebo na střežených pracovištích' },
      { id: 'dv3', left: 'Věznice s ostrahou – vysoký stupeň zabezpečení', right: 'Pohyb výhradně pod přímým dohledem, cely uzamčené, práce jen uvnitř věznice' },
      { id: 'dv4', left: 'Věznice se zvýšenou ostrahou (VZO)', right: 'Trvale uzamčené cely, nejpřísnější bezpečnostní režim, eskorty s ozbrojeným doprovodem' },
      { id: 'dv5', left: 'Vazební věznice', right: 'Zajištění obviněných osob pro účely trestního řízení (§ 67 Trestního řádu)' },
      { id: 'dv6', left: 'Ústav pro výkon zabezpečovací detence (ÚVVZD)', right: 'Léčebně-izolační výkon detence pro duševně nemocné či nebezpečné pachatele' }
    ]
  },
  {
    id: 'kazenske_tresty',
    title: 'Kázeňská řízení a tresty odsouzených (§ 46 zák. 169/1999 Sb.)',
    pairs: [
      { id: 'kt1', left: 'Písemná důtka', right: 'Nejmírnější kázeňský trest za méně závažné porušení vězeňského řádu' },
      { id: 'kt2', left: 'Snížení kapesného', right: 'Finanční postih až o jednu třetinu na dobu až 3 měsíců' },
      { id: 'kt3', left: 'Propadnutí věci', right: 'Trvalé odebrání nedovoleného předmětu (např. nepovolený elektrospotřebič)' },
      { id: 'kt4', left: 'Zákaz přijetí balíčku', right: 'Zákaz příjmu nárokového balíčku s potravinami až na dobu 1 roku' },
      { id: 'kt5', left: 'Celodenní umístění do uzavřeného oddílu', right: 'Zpřísněný režim mimo pracovní dobu na dobu až 30 dnů' },
      { id: 'kt6', left: 'Umístění do samovazby', right: 'Nejpřísnější trest: izolace na samovazbě až na 20 dnů (u mladistvých max. 10 dnů)' }
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
      { id: 's6', left: 'Přestupek proti majetku', right: 'škoda do 9 999 Kč' }
    ]
  },
  {
    id: 'penologie_pojmy',
    title: 'Rizikové kategorie v penologii (NGŘ 24/2022)',
    pairs: [
      { id: 'rk1', left: 'MON', right: 'Možná oběť násilí (potenciální cíl agrese a šikany)' },
      { id: 'rk2', left: 'MPN', right: 'Možný pachatel násilí (predátor a iniciátor násilí mezi vězni)' },
      { id: 'rk3', left: 'DVO', right: 'Dočasně vyčleněná osoba (bezpečnostní izolace od kolektivu)' },
      { id: 'rk4', left: 'STH', right: 'Soustavně těžce handicapovaná osoba (trvalé zdravotní omezení)' },
      { id: 'rk5', left: 'NMU', right: 'Násilná mimořádná událost (fyzický útok, vzpoura, incident)' },
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
      { id: 'mu5', left: 'Hladovka vězně', right: 'Povinnost lékařské prohlídky a evidence po více než 24 hodinách odmítání stravy' }
    ]
  },
  {
    id: 'tccc_first_aid',
    title: 'Neodkladná první pomoc & TCCC',
    pairs: [
      { id: 'fa1', left: 'Turniket / CAT škrtidlo', right: 'Okamžitá zástava masivního tepenného krvácení končetiny' },
      { id: 'fa2', left: 'Chest Seal s ventilovou chlopní', right: 'Ošetření otevřeného poranění hrudníku (tenzní pneumotorax)' },
      { id: 'fa3', left: 'Poměr KPR u dospělého', right: '30 stlačení hrudníku : 2 vdechy (frekvence 100–120/min)' },
      { id: 'fa4', left: 'Izraelský tlakový obvaz', right: 'Tlakové krytí hlubokých ran a plošných krvácení' },
      { id: 'fa5', left: 'Stabilizovaná (zotavovací) poloha', right: 'Osoba v bezvědomí se spolehlivě zachovaným dýcháním' },
      { id: 'fa6', left: 'Nosní vzduchovod (NPA)', right: 'Zajištění průchodnosti dýchacích cest při zapadajícím jazyku u zraněného' }
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
      { id: 'c5', label: 'Manuální pojistka', top: 38, left: 74, labelTop: 54, labelLeft: 88 },
      { id: 'c6', label: 'Střenky (rukojeť)', top: 65, left: 80, labelTop: 76, labelLeft: 88 },
      { id: 'c7', label: 'Zásobník (dno)', top: 83, left: 82, labelTop: 92, labelLeft: 70 },
      { id: 'c8', label: 'Lučík a spoušť', top: 52, left: 49, labelTop: 92, labelLeft: 35 },
      { id: 'c9', label: 'Záchyt závěru', top: 37.5, left: 61, labelTop: 68, labelLeft: 14 },
      { id: 'c10', label: 'Rám zbraně', top: 39, left: 28, labelTop: 44, labelLeft: 14 },
      { id: 'c11', label: 'Hlaveň (ústí)', top: 32, left: 6.5, labelTop: 24, labelLeft: 14 }
    ]
  },
  {
    id: 'evo3_diagram',
    title: 'CZ Scorpion EVO 3 – Hlavní části (Diagram)',
    type: 'diagram',
    imageUrl: '/images/weapons/evo3.jpg',
    pairs: [],
    parts: [
      { id: 'e1', label: 'Hledí', top: 31.5, left: 40.5, labelTop: 10, labelLeft: 20 },
      { id: 'e2', label: 'Montážní lišta (Picatinny)', top: 33, left: 58, labelTop: 10, labelLeft: 50 },
      { id: 'e3', label: 'Muška', top: 31.5, left: 76.5, labelTop: 10, labelLeft: 80 },
      { id: 'e4', label: 'Kompenzátor / tlumič ohně', top: 40.5, left: 94, labelTop: 32, labelLeft: 88 },
      { id: 'e5', label: 'Předpažbí', top: 40.5, left: 80, labelTop: 54, labelLeft: 88 },
      { id: 'e6', label: 'Napínací páka', top: 35.5, left: 81, labelTop: 76, labelLeft: 88 },
      { id: 'e7', label: 'Zásobník', top: 62, left: 63, labelTop: 92, labelLeft: 70 },
      { id: 'e8', label: 'Pistolová rukojeť', top: 54, left: 40, labelTop: 92, labelLeft: 35 },
      { id: 'e9', label: 'Přeřaďovač režimu střelby', top: 44, left: 46.5, labelTop: 68, labelLeft: 14 },
      { id: 'e10', label: 'Výhozní okénko', top: 37.5, left: 59.5, labelTop: 44, labelLeft: 14 },
      { id: 'e11', label: 'Sklopná ramenní opěra (pažba)', top: 41, left: 20, labelTop: 24, labelLeft: 14 }
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
