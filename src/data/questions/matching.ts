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
    id: 'zbran_cz75b',
    title: 'Pistole CZ 75 B',
    type: 'weapon',
    source: 'Učební text Speciální příprava – střelecká teorie (SPST), Akademie VS ČR',
    pairs: [
      { id: 'czf1', left: 'Doraz blokování zápalníku', right: 'Automatická pojistka: zápalník se nepohne, dokud není stisknuta spoušť' },
      { id: 'czf2', left: 'Pojistka (vnější, mechanická)', right: 'Ovládá ji střelec, zajistí jen napnutý kohout, blokuje spoušť i závěr' },
      { id: 'czf3', left: 'Bezpečnostní ozub kohoutu', right: 'Pádová pojistka proti výstřelu při pádu na kohout či jeho vysmeknutí' },
      { id: 'czf4', left: 'Vodící kulisa a rozborný čep', right: 'Pokles a zdvih zadku hlavně při odemykání a uzamykání' },
      { id: 'czf5', left: 'Uzamykací žebra hlavně', right: 'Zapadají do uzamykacích ozubů závěru a uzamknou hlaveň' },
      { id: 'czf6', left: 'Úchopová část těla zbraně', right: 'V její zadní části je uložena bicí zpruha a brzda zásobníku' },
      { id: 'czf7', left: 'Záchyt závěru', right: 'Zároveň slouží jako rozborný čep při rozborce' },
      { id: 'czf8', left: 'Předsuvná (vratná) zpruha', right: 'Na vedení pod hlavní, vrací závěr do přední polohy' },
      { id: 'czf9', left: 'Hlavní části s výrobním číslem', right: 'Závěr, hlaveň a tělo zbraně' },
      { id: 'czf10', left: 'Systém závěru', right: 'Uzamčený závěr, systém Browning (krátký zákluz, nucený pokles hlavně)' },
      { id: 'czf11', left: 'Spoušťový mechanismus', right: 'SA/DA – jednočinná i dvojčinná spoušť' },
      { id: 'czf12', left: 'Mířidla (hledí a muška)', right: 'Pevná, mechanická, otevřená' }
    ],
    specs: [
      { id: 'czt1', label: 'Ráže', answer: '9 mm (9×19 Luger)', accepted: ['9', '9x19', '9luger', '9x19luger'] },
      { id: 'czt2', label: 'Celková délka', answer: '206', unit: 'mm' },
      { id: 'czt3', label: 'Výška', answer: '138', unit: 'mm' },
      { id: 'czt4', label: 'Šířka (přes střenky)', answer: '35', unit: 'mm' },
      { id: 'czt5', label: 'Délka hlavně', answer: '120', unit: 'mm' },
      { id: 'czt6', label: 'Hmotnost prázdné zbraně', answer: '1000', unit: 'g', accepted: ['1kg'] },
      { id: 'czt7', label: 'Kapacita zásobníku', answer: '15', unit: 'nábojů' },
      { id: 'czt8', label: 'Plný palebný průměr', answer: '30', unit: 'nábojů' },
      { id: 'czt9', label: 'Efektivní střelba do', answer: '50', unit: 'm' },
      { id: 'czt10', label: 'Maximální dostřel', answer: '2000', unit: 'm', accepted: ['2km'] },
      { id: 'czt11', label: 'Počet drážek vývrtu hlavně', answer: '6' }
    ],
    views: [
      {
        id: 'cz75-ovladaci-prvky',
        title: 'Ovládací prvky',
        imageUrl: '/images/weapons/prirucka/cz75-ovladaci-prvky.webp',
        width: 1260,
        height: 800,
        parts: [
        { id: 'cz-ovladaci-prvky-1', label: 'Záchyt závěru', top: 11.4, left: 38.3, labelTop: 11.4, labelLeft: 38.3, slotWidth: 24.6, slotHeight: 9.1 },
        { id: 'cz-ovladaci-prvky-2', label: 'Kohout', top: 20.9, left: 87.2, labelTop: 20.9, labelLeft: 87.2, slotWidth: 14.5, slotHeight: 8.9 },
        { id: 'cz-ovladaci-prvky-3', label: 'Pojistka', top: 38.1, left: 85.6, labelTop: 38.1, labelLeft: 85.6, slotWidth: 16, slotHeight: 10 },
        { id: 'cz-ovladaci-prvky-4', label: 'Spoušť', top: 50.6, left: 10.8, labelTop: 50.6, labelLeft: 10.8, slotWidth: 13.9, slotHeight: 8.3 },
        { id: 'cz-ovladaci-prvky-5', label: 'Záchyt zásobníku', top: 78.1, left: 33.1, labelTop: 78.1, labelLeft: 33.1, slotWidth: 26.1, slotHeight: 9.3 }
        ]
      },
      {
        id: 'cz75-telo',
        title: 'Tělo zbraně',
        imageUrl: '/images/weapons/prirucka/cz75-telo.webp',
        width: 1400,
        height: 695,
        parts: [
        { id: 'cz-telo-1', label: 'Pojistka (vnější, mechanická)', top: 6.9, left: 39.9, labelTop: 6.9, labelLeft: 39.9, slotWidth: 18.8, slotHeight: 7.2 },
        { id: 'cz-telo-2', label: 'Kohout', top: 20.9, left: 90.7, labelTop: 20.9, labelLeft: 90.7, slotWidth: 12.8, slotHeight: 10.5 },
        { id: 'cz-telo-3', label: 'Výrobní číslo', top: 45.8, left: 18.8, labelTop: 45.8, labelLeft: 18.8, slotWidth: 18.2, slotHeight: 8.4 },
        { id: 'cz-telo-4', label: 'Úchopová část', top: 47.1, left: 88.1, labelTop: 47.1, labelLeft: 88.1, slotWidth: 17.2, slotHeight: 7.8 },
        { id: 'cz-telo-5', label: 'Lučík', top: 63.9, left: 15.9, labelTop: 63.9, labelLeft: 15.9, slotWidth: 13.6, slotHeight: 8.1 },
        { id: 'cz-telo-6', label: 'Spoušť', top: 64.1, left: 31.6, labelTop: 64.1, labelLeft: 31.6, slotWidth: 10.6, slotHeight: 8.4 },
        { id: 'cz-telo-7', label: 'Záchyt zásobníku', top: 64.1, left: 46.7, labelTop: 64.1, labelLeft: 46.7, slotWidth: 17.3, slotHeight: 8.4 },
        { id: 'cz-telo-8', label: 'Střenky', top: 79.9, left: 40.1, labelTop: 79.9, labelLeft: 40.1, slotWidth: 30.1, slotHeight: 8.1 },
        { id: 'cz-telo-9', label: 'Oko pro závěsnou šňůru', top: 77.8, left: 92.7, labelTop: 77.8, labelLeft: 92.7, slotWidth: 13.3, slotHeight: 7.8 },
        { id: 'cz-telo-10', label: 'Šachta zásobníku', top: 94.2, left: 33.9, labelTop: 94.2, labelLeft: 33.9, slotWidth: 25.1, slotHeight: 8.1 }
        ]
      },
      {
        id: 'cz75-hlaven',
        title: 'Hlaveň',
        imageUrl: '/images/weapons/prirucka/cz75-hlaven.webp',
        width: 1400,
        height: 529,
        parts: [
        { id: 'cz-hlaven-1', label: 'Náběh do nábojové komory', top: 20.2, left: 12.8, labelTop: 20.2, labelLeft: 12.8, slotWidth: 23.3, slotHeight: 11.5 },
        { id: 'cz-hlaven-2', label: 'Nábojová komora', top: 8.6, left: 31.2, labelTop: 8.6, labelLeft: 31.2, slotWidth: 19.7, slotHeight: 10.5 },
        { id: 'cz-hlaven-3', label: 'Uzamykací žebra', top: 8.5, left: 51.4, labelTop: 8.5, labelLeft: 51.4, slotWidth: 19.6, slotHeight: 10.8 },
        { id: 'cz-hlaven-4', label: 'Vodící část s vývrtem', top: 7.6, left: 79.8, labelTop: 7.6, labelLeft: 79.8, slotWidth: 34.2, slotHeight: 11.2 },
        { id: 'cz-hlaven-5', label: 'Ústí hlavně', top: 63.4, left: 88.1, labelTop: 63.4, labelLeft: 88.1, slotWidth: 19.9, slotHeight: 10.8 },
        { id: 'cz-hlaven-6', label: 'Vodící kulisa', top: 80.2, left: 27.7, labelTop: 80.2, labelLeft: 27.7, slotWidth: 19.7, slotHeight: 11.2 },
        { id: 'cz-hlaven-7', label: 'Výrobní číslo a zkušební (tormentační) značka', top: 85.6, left: 58, labelTop: 85.6, labelLeft: 58, slotWidth: 31.4, slotHeight: 10.2 }
        ]
      },
      {
        id: 'cz75-zaver',
        title: 'Závěr',
        imageUrl: '/images/weapons/prirucka/cz75-zaver.webp',
        width: 1400,
        height: 776,
        parts: [
        { id: 'cz-zaver-1', label: 'Hledí', top: 6.3, left: 18.4, labelTop: 6.3, labelLeft: 18.4, slotWidth: 14.9, slotHeight: 7.9 },
        { id: 'cz-zaver-2', label: 'Muška', top: 6.2, left: 90.5, labelTop: 6.2, labelLeft: 90.5, slotWidth: 16.5, slotHeight: 8.1 },
        { id: 'cz-zaver-3', label: 'Značka státní zkušebny / rok', top: 18.4, left: 56.7, labelTop: 18.4, labelLeft: 56.7, slotWidth: 30.1, slotHeight: 7.9 },
        { id: 'cz-zaver-4', label: 'Vytahovač', top: 58.9, left: 32.5, labelTop: 58.9, labelLeft: 32.5, slotWidth: 13.7, slotHeight: 8.3 },
        { id: 'cz-zaver-5', label: 'Výhozné okénko', top: 58.6, left: 52.1, labelTop: 58.6, labelLeft: 52.1, slotWidth: 20.9, slotHeight: 8.2 },
        { id: 'cz-zaver-6', label: 'Výrobní číslo', top: 58.6, left: 74.4, labelTop: 58.6, labelLeft: 74.4, slotWidth: 20, slotHeight: 8.2 },
        { id: 'cz-zaver-7', label: 'Uzamykací ozuby (uzamykací element)', top: 75.1, left: 70, labelTop: 75.1, labelLeft: 70, slotWidth: 40.7, slotHeight: 9 },
        { id: 'cz-zaver-8', label: 'Zápalník', top: 89.1, left: 8.5, labelTop: 89.1, labelLeft: 8.5, slotWidth: 14.5, slotHeight: 8.1 }
        ]
      },
      {
        id: 'cz75-rozborka',
        title: 'Rozborka a zásobník',
        imageUrl: '/images/weapons/prirucka/cz75-rozborka.webp',
        width: 1400,
        height: 989,
        parts: [
        { id: 'cz-rozborka-1', label: 'Hledí', top: 4.9, left: 22.4, labelTop: 4.9, labelLeft: 22.4, slotWidth: 11.8, slotHeight: 6.3 },
        { id: 'cz-rozborka-2', label: 'Závěr', top: 4.5, left: 36.1, labelTop: 4.5, labelLeft: 36.1, slotWidth: 10.7, slotHeight: 5.8 },
        { id: 'cz-rozborka-3', label: 'Muška', top: 4.1, left: 50.8, labelTop: 4.1, labelLeft: 50.8, slotWidth: 10.9, slotHeight: 6 },
        { id: 'cz-rozborka-4', label: 'Podavač', top: 7.9, left: 61.4, labelTop: 7.9, labelLeft: 61.4, slotWidth: 11.1, slotHeight: 6.3 },
        { id: 'cz-rozborka-5', label: 'Hlaveň', top: 21.8, left: 8.5, labelTop: 21.8, labelLeft: 8.5, slotWidth: 10.8, slotHeight: 5.9 },
        { id: 'cz-rozborka-6', label: 'Vedení předsuvné zpruhy', top: 24, left: 39.7, labelTop: 24, labelLeft: 39.7, slotWidth: 25, slotHeight: 6.8 },
        { id: 'cz-rozborka-7', label: 'Zpruha zásobníku', top: 20.8, left: 83.1, labelTop: 20.8, labelLeft: 83.1, slotWidth: 30.7, slotHeight: 8 },
        { id: 'cz-rozborka-8', label: 'Záchyt závěru (rozborný čep)', top: 42.6, left: 7.7, labelTop: 42.6, labelLeft: 7.7, slotWidth: 14.4, slotHeight: 11 },
        { id: 'cz-rozborka-9', label: 'Předsuvná (vratná) zpruha', top: 43.9, left: 46.2, labelTop: 43.9, labelLeft: 46.2, slotWidth: 15.8, slotHeight: 10.4 },
        { id: 'cz-rozborka-10', label: 'Plášť zásobníku', top: 46.7, left: 88.6, labelTop: 46.7, labelLeft: 88.6, slotWidth: 17.6, slotHeight: 6.3 },
        { id: 'cz-rozborka-11', label: 'Tělo zbraně', top: 81.8, left: 18.3, labelTop: 81.8, labelLeft: 18.3, slotWidth: 13.1, slotHeight: 6.3 },
        { id: 'cz-rozborka-12', label: 'Lučík', top: 81.4, left: 32.3, labelTop: 81.4, labelLeft: 32.3, slotWidth: 13.3, slotHeight: 6.3 },
        { id: 'cz-rozborka-13', label: 'Západka dna zásobníku', top: 85, left: 82.5, labelTop: 85, labelLeft: 82.5, slotWidth: 30.9, slotHeight: 6.5 },
        { id: 'cz-rozborka-14', label: 'Zásobníková šachta', top: 94, left: 24, labelTop: 94, labelLeft: 24, slotWidth: 21.8, slotHeight: 6.3 },
        { id: 'cz-rozborka-15', label: 'Dno zásobníku', top: 95.2, left: 82.6, labelTop: 95.2, labelLeft: 82.6, slotWidth: 30.9, slotHeight: 6.6 }
        ]
      },
      {
        id: 'cz75-rez-horni',
        title: 'Řez pistolí',
        imageUrl: '/images/weapons/prirucka/cz75-rez-horni.webp',
        width: 1400,
        height: 1535,
        parts: [
        { id: 'cz-rez-horni-1', label: 'Muška', top: 1.7, left: 16.1, labelTop: 1.7, labelLeft: 16.1, slotWidth: 5.3, slotHeight: 3 },
        { id: 'cz-rez-horni-2', label: 'Závěr', top: 6.2, left: 31.8, labelTop: 6.2, labelLeft: 31.8, slotWidth: 5, slotHeight: 3 },
        { id: 'cz-rez-horni-3', label: 'Uzamykací ozuby', top: 11.3, left: 50.5, labelTop: 11.3, labelLeft: 50.5, slotWidth: 14.6, slotHeight: 3 },
        { id: 'cz-rez-horni-4', label: 'Vytahovač', top: 21.4, left: 70.5, labelTop: 21.4, labelLeft: 70.5, slotWidth: 9, slotHeight: 3 },
        { id: 'cz-rez-horni-5', label: 'Hledí', top: 26, left: 82.4, labelTop: 26, labelLeft: 82.4, slotWidth: 4.5, slotHeight: 3 },
        { id: 'cz-rez-horni-6', label: 'Doraz blokování zápalníku', top: 31.2, left: 90.8, labelTop: 31.2, labelLeft: 90.8, slotWidth: 13.3, slotHeight: 3 },
        { id: 'cz-rez-horni-7', label: 'Kohout', top: 37.7, left: 93.8, labelTop: 37.7, labelLeft: 93.8, slotWidth: 5.9, slotHeight: 3 },
        { id: 'cz-rez-horni-8', label: 'Hlaveň', top: 28.3, left: 5.9, labelTop: 28.3, labelLeft: 5.9, slotWidth: 4.7, slotHeight: 3 },
        { id: 'cz-rez-horni-9', label: 'Předsuvná (vratná) pružina', top: 34.8, left: 9.3, labelTop: 34.8, labelLeft: 9.3, slotWidth: 15.6, slotHeight: 3 },
        { id: 'cz-rez-horni-10', label: 'Vedení předsuvné pružiny', top: 42.4, left: 14, labelTop: 42.4, labelLeft: 14, slotWidth: 21.4, slotHeight: 3 },
        { id: 'cz-rez-horni-11', label: 'Záchyt závěru', top: 50.4, left: 24.6, labelTop: 50.4, labelLeft: 24.6, slotWidth: 12.1, slotHeight: 3 },
        { id: 'cz-rez-horni-12', label: 'Lučík', top: 53.5, left: 28.4, labelTop: 53.5, labelLeft: 28.4, slotWidth: 3.9, slotHeight: 3 },
        { id: 'cz-rez-horni-13', label: 'Spoušť', top: 56.2, left: 31.5, labelTop: 56.2, labelLeft: 31.5, slotWidth: 5.7, slotHeight: 3 },
        { id: 'cz-rez-horni-14', label: 'Vyhazovač', top: 61.9, left: 34.9, labelTop: 61.9, labelLeft: 34.9, slotWidth: 8.6, slotHeight: 3 },
        { id: 'cz-rez-horni-15', label: 'Tyčka bicí pružiny', top: 60.8, left: 91, labelTop: 60.8, labelLeft: 91, slotWidth: 9.7, slotHeight: 3 },
        { id: 'cz-rez-horni-16', label: 'Pojistka', top: 66.5, left: 41.2, labelTop: 66.5, labelLeft: 41.2, slotWidth: 7, slotHeight: 3 },
        { id: 'cz-rez-horni-17', label: 'Brzda zásobníku', top: 66.7, left: 93, labelTop: 66.7, labelLeft: 93, slotWidth: 11.2, slotHeight: 3 },
        { id: 'cz-rez-horni-18', label: 'Podavač', top: 73.5, left: 48.9, labelTop: 73.5, labelLeft: 48.9, slotWidth: 6.8, slotHeight: 3 },
        { id: 'cz-rez-horni-19', label: 'Tělo zbraně', top: 71.5, left: 92.6, labelTop: 71.5, labelLeft: 92.6, slotWidth: 4.8, slotHeight: 3 },
        { id: 'cz-rez-horni-20', label: 'Bicí pružina', top: 76.5, left: 93.6, labelTop: 76.5, labelLeft: 93.6, slotWidth: 6.2, slotHeight: 3 },
        { id: 'cz-rez-horni-21', label: 'Střenka', top: 81.8, left: 54.5, labelTop: 81.8, labelLeft: 54.5, slotWidth: 6.9, slotHeight: 3 },
        { id: 'cz-rez-horni-22', label: 'Zátka bicí pružiny', top: 83.4, left: 93.8, labelTop: 83.4, labelLeft: 93.8, slotWidth: 6.2, slotHeight: 4.2 }
        ]
      },
      {
        id: 'cz75-rez-spoust',
        title: 'Řez spoušťovým a bicím ústrojím',
        imageUrl: '/images/weapons/prirucka/cz75-rez-spoust.webp',
        width: 1110,
        height: 780,
        parts: [
        { id: 'cz-rez-spoust-1', label: 'Nábojová komora', top: 10.7, left: 39.7, labelTop: 10.7, labelLeft: 39.7, slotWidth: 16.7, slotHeight: 3 },
        { id: 'cz-rez-spoust-2', label: 'Zápalník', top: 22.2, left: 54.4, labelTop: 22.2, labelLeft: 54.4, slotWidth: 9.2, slotHeight: 3 },
        { id: 'cz-rez-spoust-3', label: 'Záchyt kohoutku', top: 45.4, left: 81.9, labelTop: 45.4, labelLeft: 81.9, slotWidth: 10.6, slotHeight: 5.6 },
        { id: 'cz-rez-spoust-4', label: 'Přerušovač', top: 54.6, left: 85.6, labelTop: 54.6, labelLeft: 85.6, slotWidth: 13, slotHeight: 3 },
        { id: 'cz-rez-spoust-5', label: 'Bezpečnostní ozub', top: 60, left: 90.8, labelTop: 60, labelLeft: 90.8, slotWidth: 16.7, slotHeight: 3 },
        { id: 'cz-rez-spoust-6', label: 'Táhlo spouště', top: 83.3, left: 9, labelTop: 83.3, labelLeft: 9, slotWidth: 14.8, slotHeight: 3.1 },
        { id: 'cz-rez-spoust-7', label: 'Záchyt zásobníku', top: 96.2, left: 19.5, labelTop: 96.2, labelLeft: 19.5, slotWidth: 17.1, slotHeight: 3.1 }
        ]
      }
    ]
  },
  {
    id: 'zbran_evo3',
    title: 'Samopal CZ Scorpion EVO 3 A1',
    type: 'weapon',
    source: 'Učební text Speciální příprava – střelecká teorie (SPST), Akademie VS ČR',
    pairs: [
      { id: 'evf1', left: 'Označení „EVO 3“', right: 'Třetí generace Scorpionu' },
      { id: 'evf2', left: 'Písmeno „A“ v označení', right: 'Ozbrojený sektor – samočinná verze' },
      { id: 'evf3', left: 'Číslice „1“ za písmenem', right: 'Provedení v ráži 9×19 mm' },
      { id: 'evf4', left: 'Režimy střelby', right: 'Jednotlivé rány, tříranné dávky a neomezené dávky' },
      { id: 'evf5', left: 'Typ závěru', right: 'Dynamický neuzamčený závěr, střílí z přední polohy' },
      { id: 'evf6', left: 'Montážní lišty', right: 'Po čtyřech stranách pouzdra závěru, MIL-STD-1913' },
      { id: 'evf7', left: 'Manuální pojistka v poloze „0“', right: 'Zbraň je zajištěna' },
      { id: 'evf8', left: 'Rozborka – krok 1', right: 'Napnout závěr a zachytit přestavitelnou páku vzadu v pojistném výřezu' },
      { id: 'evf9', left: 'Rozborka – krok 2', right: 'Vysunout přední čep doleva, vyháknout a odejmout pouzdro spouštědla' },
      { id: 'evf10', left: 'Rozborka – krok 3', right: 'Otvorem ve spodní části vyjmout závěr s vratnou pružinou na vodicím trnu' },
      { id: 'evf11', left: 'Vybrání na pravém boku závěru', right: 'Dorážení závěru do přední polohy při silném znečištění' },
      { id: 'evf12', left: 'Zásobník EVO 3', right: 'Dvouřadý s dvouřadým vyústěním' }
    ],
    specs: [
      { id: 'evt1', label: 'Ráže', answer: '9 mm (9×19)', accepted: ['9', '9x19', '9luger', '9x19luger'] },
      { id: 'evt2', label: 'Délka s vyklopenou opěrou', answer: '670', unit: 'mm' },
      { id: 'evt3', label: 'Délka se sklopenou opěrou', answer: '410', unit: 'mm' },
      { id: 'evt4', label: 'Délka hlavně', answer: '196', unit: 'mm' },
      { id: 'evt5', label: 'Hmotnost prázdné zbraně', answer: '2450', unit: 'g', accepted: ['2.45kg'] },
      { id: 'evt6', label: 'Počet drážek vývrtu hlavně', answer: '6' },
      { id: 'evt7', label: 'Stoupání drážek (na jednu otáčku)', answer: '250', unit: 'mm' },
      { id: 'evt8', label: 'Kapacita zásobníku', answer: '30', unit: 'nábojů' },
      { id: 'evt9', label: 'Plný palebný průměr', answer: '90', unit: 'nábojů' },
      { id: 'evt10', label: 'Účinný dostřel', answer: '200', unit: 'm' },
      { id: 'evt11', label: 'Maximální dostřel', answer: '2200', unit: 'm', accepted: ['2.2km'] },
      { id: 'evt12', label: 'Poloha manuální pojistky pro „zajištěno“', answer: '0', accepted: ['nula'] }
    ],
    views: [
      {
        id: 'evo3-celek',
        title: 'Celkový pohled a hlavní části',
        imageUrl: '/images/weapons/prirucka/evo3-celek.webp',
        width: 1400,
        height: 1201,
        parts: [
        { id: 'ev-celek-1', label: 'Muška', top: 4.1, left: 15.9, labelTop: 4.1, labelLeft: 15.9, slotWidth: 13.7, slotHeight: 6 },
        { id: 'ev-celek-2', label: 'Táhlo s hmatníkem (sestava)', top: 7, left: 36.3, labelTop: 7, labelLeft: 36.3, slotWidth: 21, slotHeight: 4.9 },
        { id: 'ev-celek-3', label: 'Hledí (dioptrické stavitelné)', top: 7.8, left: 62.7, labelTop: 7.8, labelLeft: 62.7, slotWidth: 27.4, slotHeight: 7.3 },
        { id: 'ev-celek-4', label: 'Ramenní opěra (teleskopicky stavitelná)', top: 14.5, left: 88.2, labelTop: 14.5, labelLeft: 88.2, slotWidth: 20.3, slotHeight: 4.9 },
        { id: 'ev-celek-5', label: 'Pažbička', top: 40.9, left: 73.4, labelTop: 40.9, labelLeft: 73.4, slotWidth: 12.9, slotHeight: 6.2 },
        { id: 'ev-celek-6', label: 'Závěr s vratným ústrojím', top: 53.4, left: 8.7, labelTop: 53.4, labelLeft: 8.7, slotWidth: 12.9, slotHeight: 4.5 },
        { id: 'ev-celek-7', label: 'Spouštědlo', top: 78, left: 52.5, labelTop: 78, labelLeft: 52.5, slotWidth: 18.1, slotHeight: 5.6 },
        { id: 'ev-celek-8', label: 'Zásobník', top: 83.1, left: 13.5, labelTop: 83.1, labelLeft: 13.5, slotWidth: 20, slotHeight: 4.5 },
        { id: 'ev-celek-9', label: 'Jednobodový popruh', top: 91.9, left: 51.6, labelTop: 91.9, labelLeft: 51.6, slotWidth: 18.1, slotHeight: 4.1 }
        ]
      },
      {
        id: 'evo3-zaver',
        title: 'Závěr s vratným ústrojím',
        imageUrl: '/images/weapons/prirucka/evo3-zaver.webp',
        width: 1400,
        height: 814,
        parts: [
        { id: 'ev-zaver-1', label: 'Vodící trn s vratnou pružinou', top: 62.4, left: 19.4, labelTop: 62.4, labelLeft: 19.4, slotWidth: 16, slotHeight: 6.7 },
        { id: 'ev-zaver-2', label: 'Závěr', top: 54.6, left: 38.9, labelTop: 54.6, labelLeft: 38.9, slotWidth: 18, slotHeight: 8.4 },
        { id: 'ev-zaver-3', label: 'Vytahovač', top: 55.5, left: 57.9, labelTop: 55.5, labelLeft: 57.9, slotWidth: 17.8, slotHeight: 7.6 },
        { id: 'ev-zaver-4', label: 'Blokace zápalníku', top: 67.8, left: 63.1, labelTop: 67.8, labelLeft: 63.1, slotWidth: 28.3, slotHeight: 7.9 }
        ]
      },
      {
        id: 'evo3-spoustedlo',
        title: 'Spouštědlo',
        imageUrl: '/images/weapons/prirucka/evo3-spoustedlo.webp',
        width: 1400,
        height: 971,
        parts: [
        { id: 'ev-spoustedlo-1', label: 'Bicí kladivo', top: 4.7, left: 25.8, labelTop: 4.7, labelLeft: 25.8, slotWidth: 13.3, slotHeight: 6.5 },
        { id: 'ev-spoustedlo-2', label: 'Rozborný čep', top: 5.2, left: 72.3, labelTop: 5.2, labelLeft: 72.3, slotWidth: 28.1, slotHeight: 6.7 },
        { id: 'ev-spoustedlo-3', label: 'Pouzdro spouštědla', top: 21.4, left: 83.8, labelTop: 21.4, labelLeft: 83.8, slotWidth: 28.2, slotHeight: 6.5 },
        { id: 'ev-spoustedlo-4', label: 'Záchyt závěru', top: 53.1, left: 29.7, labelTop: 53.1, labelLeft: 29.7, slotWidth: 17.8, slotHeight: 6.7 },
        { id: 'ev-spoustedlo-5', label: 'Vyhazovač', top: 52.7, left: 54.9, labelTop: 52.7, labelLeft: 54.9, slotWidth: 28.8, slotHeight: 6.5 },
        { id: 'ev-spoustedlo-6', label: 'Ovladač (přeřaďovač střelby)', top: 52.3, left: 85.3, labelTop: 52.3, labelLeft: 85.3, slotWidth: 28.1, slotHeight: 6.5 },
        { id: 'ev-spoustedlo-7', label: 'Lučík', top: 65.9, left: 84.6, labelTop: 65.9, labelLeft: 84.6, slotWidth: 17, slotHeight: 6.5 },
        { id: 'ev-spoustedlo-8', label: 'Spoušť (hmatník spouště)', top: 85.3, left: 87.1, labelTop: 85.3, labelLeft: 87.1, slotWidth: 19.4, slotHeight: 6 },
        { id: 'ev-spoustedlo-9', label: 'Záchyt zásobníku (oboustranný)', top: 94.9, left: 19, labelTop: 94.9, labelLeft: 19, slotWidth: 29.3, slotHeight: 7.4 }
        ]
      },
      {
        id: 'evo3-hlaven',
        title: 'Sestava hlavně s předpažbím',
        imageUrl: '/images/weapons/prirucka/evo3-hlaven.webp',
        width: 1400,
        height: 755,
        parts: [
        { id: 'ev-hlaven-1', label: 'Kompenzátor', top: 10.2, left: 18.5, labelTop: 10.2, labelLeft: 18.5, slotWidth: 17.2, slotHeight: 9.9 },
        { id: 'ev-hlaven-2', label: 'Matice hlavně', top: 6.4, left: 45.5, labelTop: 6.4, labelLeft: 45.5, slotWidth: 28.5, slotHeight: 10.9 },
        { id: 'ev-hlaven-3', label: 'Chladič', top: 19.5, left: 77.9, labelTop: 19.5, labelLeft: 77.9, slotWidth: 28.9, slotHeight: 9.2 },
        { id: 'ev-hlaven-4', label: 'Nábojová komora / fixační vložka', top: 30.8, left: 81.4, labelTop: 30.8, labelLeft: 81.4, slotWidth: 35.5, slotHeight: 10.3 },
        { id: 'ev-hlaven-5', label: 'Náběh do nábojové komory', top: 43.4, left: 77.5, labelTop: 43.4, labelLeft: 77.5, slotWidth: 29.1, slotHeight: 9.2 },
        { id: 'ev-hlaven-6', label: 'Vodící část vývrtu hlavně (hlaveň)', top: 62.1, left: 79.4, labelTop: 62.1, labelLeft: 79.4, slotWidth: 34, slotHeight: 9.2 },
        { id: 'ev-hlaven-7', label: 'Předpažbí', top: 76.3, left: 69.1, labelTop: 76.3, labelLeft: 69.1, slotWidth: 29.8, slotHeight: 8.6 },
        { id: 'ev-hlaven-8', label: 'Táhlo a hmatník (sestava)', top: 93.4, left: 16, labelTop: 93.4, labelLeft: 16, slotWidth: 29.1, slotHeight: 9.7 }
        ]
      },
      {
        id: 'evo3-bezpecnost',
        title: 'Bezpečnostní prvky',
        imageUrl: '/images/weapons/prirucka/evo3-bezpecnost.webp',
        width: 1400,
        height: 410,
        parts: [
        { id: 'ev-bezpecnost-1', label: 'Blokace zápalníku na závěru', top: 71.1, left: 26.4, labelTop: 71.1, labelLeft: 26.4, slotWidth: 30.7, slotHeight: 16.3 },
        { id: 'ev-bezpecnost-2', label: 'Manuální pojistka (poloha 0 = zajištěno)', top: 69.5, left: 78.2, labelTop: 69.5, labelLeft: 78.2, slotWidth: 35, slotHeight: 17.1 }
        ]
      },
      {
        id: 'evo3-opera',
        title: 'Ramenní opěra',
        imageUrl: '/images/weapons/prirucka/evo3-opera.webp',
        width: 1400,
        height: 487,
        parts: [
        { id: 'ev-opera-1', label: 'Tubus opěry', top: 9.4, left: 51.5, labelTop: 9.4, labelLeft: 51.5, slotWidth: 28.5, slotHeight: 13.2 },
        { id: 'ev-opera-2', label: 'Kloub opěry', top: 33.6, left: 11.8, labelTop: 33.6, labelLeft: 11.8, slotWidth: 21.6, slotHeight: 13.2 },
        { id: 'ev-opera-3', label: 'Ramenní opěra', top: 28.8, left: 84.5, labelTop: 28.8, labelLeft: 84.5, slotWidth: 27.4, slotHeight: 16 },
        { id: 'ev-opera-4', label: 'Západka opěry', top: 70.9, left: 16.7, labelTop: 70.9, labelLeft: 16.7, slotWidth: 25.6, slotHeight: 11.7 },
        { id: 'ev-opera-5', label: 'Polohovač ramenní opěry', top: 73, left: 84.6, labelTop: 73, labelLeft: 84.6, slotWidth: 26.2, slotHeight: 11.3 }
        ]
      },
      {
        id: 'evo3-rez',
        title: 'Řez samopalem',
        imageUrl: '/images/weapons/prirucka/evo3-rez.webp',
        width: 1600,
        height: 1043,
        parts: [
        { id: 'ev-rez-1', label: 'Kompenzátor', top: 4.1, left: 11.4, labelTop: 4.1, labelLeft: 11.4, slotWidth: 9.6, slotHeight: 3 },
        { id: 'ev-rez-2', label: 'Muška', top: 2.8, left: 33.7, labelTop: 2.8, labelLeft: 33.7, slotWidth: 4.5, slotHeight: 3 },
        { id: 'ev-rez-3', label: 'Pouzdro levé', top: 5.2, left: 45.4, labelTop: 5.2, labelLeft: 45.4, slotWidth: 9.7, slotHeight: 3 },
        { id: 'ev-rez-4', label: 'Záchyt závěru', top: 7.9, left: 57, labelTop: 7.9, labelLeft: 57, slotWidth: 10.3, slotHeight: 3 },
        { id: 'ev-rez-5', label: 'Hledí', top: 12.8, left: 68.1, labelTop: 12.8, labelLeft: 68.1, slotWidth: 3.8, slotHeight: 3 },
        { id: 'ev-rez-6', label: 'Západka opěry', top: 23.4, left: 75.9, labelTop: 23.4, labelLeft: 75.9, slotWidth: 10.3, slotHeight: 3 },
        { id: 'ev-rez-7', label: 'Chladič', top: 29.8, left: 4.8, labelTop: 29.8, labelLeft: 4.8, slotWidth: 5.9, slotHeight: 3 },
        { id: 'ev-rez-8', label: 'Táhlo a hmatník', top: 34.9, left: 12.9, labelTop: 34.9, labelLeft: 12.9, slotWidth: 11.9, slotHeight: 3 },
        { id: 'ev-rez-9', label: 'Tubus opěry', top: 32.7, left: 90.9, labelTop: 32.7, labelLeft: 90.9, slotWidth: 8.7, slotHeight: 3 },
        { id: 'ev-rez-10', label: 'Pouzdro spouštědla', top: 43.1, left: 18.6, labelTop: 43.1, labelLeft: 18.6, slotWidth: 15.5, slotHeight: 3 },
        { id: 'ev-rez-11', label: 'Předpažbí', top: 52.3, left: 12.7, labelTop: 52.3, labelLeft: 12.7, slotWidth: 7.3, slotHeight: 3 },
        { id: 'ev-rez-12', label: 'Závěr', top: 54.2, left: 21.2, labelTop: 54.2, labelLeft: 21.2, slotWidth: 4.4, slotHeight: 3 },
        { id: 'ev-rez-13', label: 'Spoušť', top: 54, left: 43.1, labelTop: 54, labelLeft: 43.1, slotWidth: 4.9, slotHeight: 3 },
        { id: 'ev-rez-14', label: 'Ovladač levý', top: 53.1, left: 67.5, labelTop: 53.1, labelLeft: 67.5, slotWidth: 9.5, slotHeight: 3 },
        { id: 'ev-rez-15', label: 'Vratná pružina', top: 64.4, left: 44.7, labelTop: 64.4, labelLeft: 44.7, slotWidth: 5.4, slotHeight: 4.2 },
        { id: 'ev-rez-16', label: 'Polohovač ramenní opěry', top: 64.7, left: 78.1, labelTop: 64.7, labelLeft: 78.1, slotWidth: 10.1, slotHeight: 4.1 },
        { id: 'ev-rez-17', label: 'Pažbička', top: 74.2, left: 66.9, labelTop: 74.2, labelLeft: 66.9, slotWidth: 6.2, slotHeight: 3 },
        { id: 'ev-rez-18', label: 'Ramenní opěra', top: 83.1, left: 82.2, labelTop: 83.1, labelLeft: 82.2, slotWidth: 10, slotHeight: 3 },
        { id: 'ev-rez-19', label: 'Pouzdro pravé', top: 85.7, left: 58.8, labelTop: 85.7, labelLeft: 58.8, slotWidth: 10.4, slotHeight: 3 },
        { id: 'ev-rez-20', label: 'Rozborný čep', top: 88.7, left: 7.7, labelTop: 88.7, labelLeft: 7.7, slotWidth: 7.2, slotHeight: 4.1 },
        { id: 'ev-rez-21', label: 'Demontážní tlačítko', top: 92.7, left: 60.4, labelTop: 92.7, labelLeft: 60.4, slotWidth: 14.7, slotHeight: 3 },
        { id: 'ev-rez-22', label: 'Záchyt zásobníku', top: 98.5, left: 11.6, labelTop: 98.5, labelLeft: 11.6, slotWidth: 12.7, slotHeight: 3 }
        ]
      }
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
