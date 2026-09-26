/**
 * Výchozí obsah záložky Zbraně a střelba.
 *
 * Lektor a správce ho v aplikaci upravují přes překryv content_blocks
 * (druhy 'weapon' a 'stoppage_drill', migrace 040) — tenhle soubor zůstává
 * výchozí podobou, ke které se dá kdykoli vrátit.
 */
export interface StoppageDrill {
  id: string;
  name: string;
  symptom: string;
  cause: string;
  correctAction: string;
  whyCorrect: string;
  dangerOfWrongAction: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface WeaponStep {
  stepNumber: number;
  title: string;
  actionInstruction: string;
  whyCrucial: string;
  dangerIfOmitted: string;
}

export interface WeaponData {
  id: string;
  name: string;
  caliber: string;
  capacity: string;
  serviceRole: string;
  safetySteps: WeaponStep[];
  disassemblySteps: WeaponStep[];
  technicalSpecs: { label: string; value: string }[];
}

export const defaultWeapons: WeaponData[] = [
  {
    id: 'cz75b',
    name: 'Pistole CZ 75 B',
    caliber: '9×19 mm Luger',
    capacity: '16 nábojů (dvouřadý zásobník)',
    serviceRole: 'Základní služební zbraň příslušníků Vězeňské služby a Justiční stráže ČR.',
    technicalSpecs: [
      { label: 'Ráže', value: '9×19 mm Luger' },
      { label: 'Kapacita zásobníku', value: '16 nábojů' },
      { label: 'Spoušťový mechanismus', value: 'SA / DA (Single Action / Double Action)' },
      { label: 'Hmotnost s prázdným zásobníkem', value: '1 000 g' },
      { label: 'Délka hlavně', value: '114 mm' },
      { label: 'Pojistné prvky', value: 'Manuální pojistka, blokování zápalníku, bezpečnostní ozub na kohoutu' }
    ],
    safetySteps: [
      {
        stepNumber: 1,
        title: '1. Bezpečný směr (Lapač střel)',
        actionInstruction: 'Zbraň neustále směřuje hlavní do bezpečného prostoru nebo ústí lapače střel. Prst leží podél rámu zbraně MIMO lučík a spoušť.',
        whyCrucial: 'Pravidlo číslo 1 bezpečné manipulace se zbraní.',
        dangerIfOmitted: 'Při nechtěném výstřelu hrozí zranění nebo usmrcení přítomných osob či odraz střely od zdi.'
      },
      {
        stepNumber: 2,
        title: '2. Vyjmutí zásobníku',
        actionInstruction: 'Stisknout záchyt zásobníku a vysunout/vyjmout zásobník z těla zbraně do dlaně. Odložit zásobník stranou.',
        whyCrucial: 'Zamezí podání dalšího náboje do komory při natažení závěru.',
        dangerIfOmitted: 'Pokud zůstane zásobník ve zbrani, natažením závěru dojde k okamžitému nabití dalšího ostrého náboje do komory!'
      },
      {
        stepNumber: 3,
        title: '3. Natažení závěru (2× energicky)',
        actionInstruction: 'Uchopit závěr v zadní části a energicky jej dvakrát natáhnout do zadní polohy. Případný náboj z komory je vyhozen výhozním okénkem.',
        whyCrucial: 'Vytahuje a vyhazuje náboj, který mohl zůstat zasunut v nábojové komoře.',
        dangerIfOmitted: 'V komoře zůstane náboj a zbraň je stále nabitá k výstřelu.'
      },
      {
        stepNumber: 4,
        title: '4. Vizuální a hmatová kontrola komory a šachty',
        actionInstruction: 'Zajistit závěr v zadní poloze pomocí záchytu závěru. Pohledem i prstem zkontrolovat prázdnotu nábojové komory a prázdnotu zásobníkové šachty.',
        whyCrucial: 'Dvojitá (optická i hmatová) kontrola vylučuje selhání vytahovače.',
        dangerIfOmitted: 'Zlomený vytahovač mohl náboj v komoře ponechat.'
      },
      {
        stepNumber: 5,
        title: '5. Vypuštění závěru',
        actionInstruction: 'Stiskem záchytu závěru nebo lehkým potažením vzad a uvolněním vypustit závěr do přední uzamčené polohy.',
        whyCrucial: 'Příprava zbraně na provedení rány jistoty.',
        dangerIfOmitted: 'Zbraň nelze se závěrem vzadu uvést do klidového bezpečného stavu.'
      },
      {
        stepNumber: 6,
        title: '6. Rána jistoty do lapače střel',
        actionInstruction: 'S hlavní namířenou přímo do lapače střel stisknout spoušť a vypustit napnutý kohout.',
        whyCrucial: 'Uvolňuje napnutý bicí mechanismus zbraně bez namáhání pružin a potvrzuje prázdnost komory.',
        dangerIfOmitted: 'Bicí pružina zůstává napnutá a zbraň v pohotovostním režimu.'
      },
      {
        stepNumber: 7,
        title: '7. Zajištění zbraně manuální pojistkou',
        actionInstruction: 'Páčku manuální pojistky posunout nahoru (zakryje červenou tečku). Zbraň vložit do služebního pouzdra.',
        whyCrucial: 'Dokončení bezpečnostního protokolu.',
        dangerIfOmitted: 'Zbraň není zabezpečena proti neautorizované manipulaci.'
      }
    ],
    disassemblySteps: [
      {
        stepNumber: 1,
        title: '1. Bezpečnostní prověrka',
        actionInstruction: 'Provést kompletní vybití zbraně, kontrolu prázdnoty komory a vyjmutí zásobníku dle postupu č. 1.',
        whyCrucial: 'Nikdy se nerozebírá zbraň bez předchozí kontroly bezpečnosti!',
        dangerIfOmitted: 'Fatální nehoda při manipulaci s nabitou zbraní.'
      },
      {
        stepNumber: 2,
        title: '2. Slícování rysek',
        actionInstruction: 'Uchopit zbraň levou rukou přes závěr a posunout závěr mírně vzad tak, aby ryska na levé straně závěru přesně lícovala s ryskou na těle pistole.',
        whyCrucial: 'Uvolňuje záchyt závěru ze své uzamykací drážky.',
        dangerIfOmitted: 'Při neslícovaných ryskách nelze záchyt závěru vytlačit a hrozí poškození kolíku.'
      },
      {
        stepNumber: 3,
        title: '3. Vytlačení záchytu závěru',
        actionInstruction: 'Z pravé strany zatlačit na vyčnívající čep záchytu závěru (např. dnem zásobníku) a z levé strany záchyt závěru zcela vytáhnout.',
        whyCrucial: 'Čep záchytu závěru fixuje závěr s hlavní k rámu pistole.',
        dangerIfOmitted: 'Bez vyjmutí záchytu závěru nelze oddělit závěr od rámu.'
      },
      {
        stepNumber: 4,
        title: '4. Sejmutí závěru s hlavní',
        actionInstruction: 'Vysunout celý sestavený závěr s hlavní po vodicích drážkách rámu směrem dopředu.',
        whyCrucial: 'Oddělení horní sestavy od rámu zbraně se spoušťovým ústrojím.',
        dangerIfOmitted: 'Při neopatrném tahu může dojít k vypadnutí vratné pružiny.'
      },
      {
        stepNumber: 5,
        title: '5. Vyjmutí vratné pružiny s vodicí tyčinkou',
        actionInstruction: 'Z vnitřku závěru mírně stlačit vodicí tyčinku vratné pružiny dopředu a vyjmout ji směrem nahoru a vzad.',
        whyCrucial: 'Uvolnění hlavně v lůžku závěru.',
        dangerIfOmitted: 'Vratná pružina je pod předpětím; nutno jistit prstem.'
      },
      {
        stepNumber: 6,
        title: '6. Vyjmutí hlavně ze závěru',
        actionInstruction: 'Uchopit hlaveň za spodní uzamykací výstupek, posunout ji mírně vpřed a poté vyjmout směrem dolů a vzad ze závěru.',
        whyCrucial: 'Dokončení částečné rozborky pro běžné čištění a konzervaci.',
        dangerIfOmitted: 'Hlavní části zbraně jsou připraveny k inspekci a čištění.'
      }
    ]
  },
  {
    id: 'evo3',
    name: 'Samopal CZ Scorpion EVO 3A1',
    caliber: '9×19 mm Luger',
    capacity: '30 nábojů (průhledný polymerový zásobník)',
    serviceRole: 'Útočná a obranná zbraň pro strážní věže, eskorty zvlášť nebezpečných pachatelů a zásahové skupiny VS ČR.',
    technicalSpecs: [
      { label: 'Ráže', value: '9×19 mm Luger' },
      { label: 'Kapacita zásobníku', value: '30 nábojů' },
      { label: 'Režimy střelby', value: 'Zajištěno (0), Jednotlivé rány (1), Tříranná dávka (3), Plná dávka (∞)' },
      { label: 'Teoretická rychlost střelby', value: '1 150 ran / min' },
      { label: 'Hmotnost s prázdným zásobníkem', value: '2 770 g' },
      { label: 'Konstrukce', value: 'Dynamický neuzamčený závěr, polymerové tělo, sklopná a teleskopická ramenní opěra' }
    ],
    safetySteps: [
      {
        stepNumber: 1,
        title: '1. Bezpečný směr',
        actionInstruction: 'Hlaveň samopalu směřuje do lapače střel. Prst mimo spoušť a lučík.',
        whyCrucial: 'Zamezení ohrožení osob.',
        dangerIfOmitted: 'Ohrožení života v případě nechtěného výstřelu dávkou.'
      },
      {
        stepNumber: 2,
        title: '2. Přeřazovač do polohy ZAJIŠTĚNO',
        actionInstruction: 'Přeřazovač režimu střelby otočit do vodorovné polohy na symbol bílého přeškrtnutého náboje (0).',
        whyCrucial: 'Blokuje spoušťový mechanismus samopalu.',
        dangerIfOmitted: 'Samopal zůstává odjištěn v režimu dávky.'
      },
      {
        stepNumber: 3,
        title: '3. Vyjmutí zásobníku',
        actionInstruction: 'Palcem stlačit oboustrannou páčku záchytu zásobníku před lučíkem a vytáhnout zásobník ze šachty.',
        whyCrucial: 'Zamezení podání náboje ze zásobníku do komory.',
        dangerIfOmitted: 'Natažení závěru se zásobníkem ve zbrani nabije náboj do komory!'
      },
      {
        stepNumber: 4,
        title: '4. Natažení a zajištění závěru v zadní poloze',
        actionInstruction: 'Levou rukou natáhnout napínací páku do zadní úvrati a zvednout ji nahoru do bezpečnostního vybrání v polymerovém těle (tzv. Heckler lock).',
        whyCrucial: 'Umožňuje přímou vizuální kontrolu komory shora i přes výhozní okénko.',
        dangerIfOmitted: 'Bez zajištění nelze spolehlivě provést vizuální prověrku komory.'
      },
      {
        stepNumber: 5,
        title: '5. Kontrola nábojové komory a šachty',
        actionInstruction: 'Pohledem do výhozního okénka a do zásobníkové šachty se přesvědčit, že v komoře ani v šachtě není žádný náboj.',
        whyCrucial: '100% jistota, že zbraň je prázdná.',
        dangerIfOmitted: 'Přehlédnutí náboje vede k nechtěnému výstřelu při ráně jistoty.'
      },
      {
        stepNumber: 6,
        title: '6. Vypuštění závěru',
        actionInstruction: 'Udeřit dlaní na napínací páku dolů (nebo stisknout páčku vypouštění závěru nad lučíkem) a nechat závěr dojet dopředu.',
        whyCrucial: 'Uzavření závěru pro ránu jistoty.',
        dangerIfOmitted: 'Se závěrem vzadu nelze provést ránu jistoty.'
      },
      {
        stepNumber: 7,
        title: '7. Rána jistoty do lapače střel a zajištění',
        actionInstruction: 'Přepnout přeřazovač na jednotlivé rány (1), namířit do lapače, stisknout spoušť a ihned přepnout přeřazovač zpět na zajištěno (0).',
        whyCrucial: 'Uvolnění bicího mechanismu a finální zabezpečení zbraně.',
        dangerIfOmitted: 'Bicí ústrojí zůstává natažené.'
      }
    ],
    disassemblySteps: [
      {
        stepNumber: 1,
        title: '1. Bezpečnostní kontrola',
        actionInstruction: 'Kompletní vybití a kontrola prázdnoty komory dle předchozího postupu.',
        whyCrucial: 'Základní bezpečnostní pravidlo.',
        dangerIfOmitted: 'Riziko výstřelu při manipulaci.'
      },
      {
        stepNumber: 2,
        title: '2. Vytlačení spojovacího čepu pouzdra závěru',
        actionInstruction: 'Vytlačit přední spojovací čep spušťadla a těla zbraně.',
        whyCrucial: 'Uvolnění pouzdra spušťadla.',
        dangerIfOmitted: 'Čep fixuje spodní modul k tělu samopalu.'
      },
      {
        stepNumber: 3,
        title: '3. Oddělení pouzdra spoušťadla',
        actionInstruction: 'Vyklopit a vyjmout pouzdro spoušťadla směrem dolů a dopředu.',
        whyCrucial: 'Oddělení bicího a spoušťového mechanismu.',
        dangerIfOmitted: 'Bez vyjmutí spušťadla nelze vyjmout dynamický závěr.'
      },
      {
        stepNumber: 4,
        title: '4. Vyjmutí sestavy závěru s vratnou pružinou',
        actionInstruction: 'Posunout napínací pákou dynamický blokový závěr vzad a vyjmout jej i s vratnou pružinou z těla samopalu.',
        whyCrucial: 'Zpřístupnění hlavně a vnitřku pouzdra pro čištění.',
        dangerIfOmitted: 'Dokončení částečné rozborky samopalu.'
      }
    ]
  }
];

export const defaultStoppageDrills: StoppageDrill[] = [
  {
    id: 'misfire',
    name: '1. Selhač náboje (Misfire / Dud / Hangfire)',
    symptom: 'Při stisknutí spouště se ozve cvaknutí bicího mechanismu (kohout/úderník dopadne), ale nedojde k výstřelu.',
    cause: 'Vadná zápalka, vlhká prachová náplň, nečistota v lůžku zápalníku nebo nedostatečná razance bicí pružiny.',
    correctAction: 'Zbraň neustále směřuje do terče (bezpečný směr). Vyčkat 10–15 sekund pro případ zpožděného zážehu (Hangfire). Poté rázně klepnout do dna zásobníku (Tap), energicky natáhnout závěr vzad a vyhodit vadný náboj (Rack) a pokračovat v mířené střelbě.',
    whyCorrect: 'Okamžité otevření závěru při zpožděném zážehu by mohlo vést k explozi náboje mimo komoru a těžkému zranění střelce.',
    dangerOfWrongAction: 'Otočení zbraně k sobě nebo okamžité otevření závěru při doutnající složi může způsobit výbuch náboje do obličeje a zraku střelce.',
    options: [
      {
        text: 'Okamžitě zbraň otočit výhozním okénkem k očím a zkontrolovat, co se stalo.',
        isCorrect: false,
        feedback: 'FATÁLNÍ CHYBA: Nikdy neotáčejte zbraň proti sobě! Při zpožděném zážehu hrozí výbuch náboje přímo do obličeje.'
      },
      {
        text: 'Držet zbraň v bezpečném směru do terče min. 10 sekund, poté provést Tap-Rack (dorazit zásobník, energicky natáhnout závěr a vyhodit vadný náboj).',
        isCorrect: true,
        feedback: 'SPRÁVNĚ: Bezpečný směr a vyčkání chrání před zpožděným výstřelem (Hangfire). Dril Tap-Rack spolehlivě odstraní vadný náboj a podá nový.'
      },
      {
        text: 'Opakovaně mačkat spoušť plnou silou bez vyčkání.',
        isCorrect: false,
        feedback: 'CHYBA: Opakované mačkání spouště u vadného náboje nic nevyřeší a ztrácí se drahocenný čas v krizové situaci.'
      }
    ]
  },
  {
    id: 'stovepipe',
    name: '2. Vzpříčená nábojnice (Stovepipe / Komínek)',
    symptom: 'Vystřelená nábojnice nebyla úplně vyhozena a zůstala sevřená závěrem ve svislé poloze ve výhozním okénku.',
    cause: 'Slabý úchop střelce (Limp wristing), znečištěný dráp vytahovače nebo slabší prachová náplň.',
    correctAction: 'Udržovat bezpečný směr k terči. Volnou rukou energicky přejet hranou dlaně shora přes závěr směrem vzad a smést nábojnici / energicky natáhnout závěr a uvolnit jej.',
    whyCorrect: 'Rychlé smetení nábojnice dlaní umožní pružině závěru dorazit náboj do komory a okamžitě pokračovat ve střelbě.',
    dangerOfWrongAction: 'Snažit se nábojnici vyviklat prsty v rukavicích s prstem na spoušti může vést k nechtěnému výstřelu.',
    options: [
      {
        text: 'Udržovat bezpečný směr, hranou dlaně přejet přes závěr vzad (Sweep) / natáhnout závěr vzad a vypustit.',
        isCorrect: true,
        feedback: 'SPRÁVNĚ: Rychlé mechanické smetení nábojnice (Sweep/Rack) vyčistí výhozní okno a závěr zaskočí do přední polohy.'
      },
      {
        text: 'Začít rozebírat zbraň a vytlačovat záchyt závěru.',
        isCorrect: false,
        feedback: 'CHYBA: Při vzpříčené nábojnici se zbraň nerozebírá – jde o jednoduchou závadu řešitelnou během 2 sekund.'
      },
      {
        text: 'Udeřit zbraní o stůl nebo betonovou podlahu.',
        isCorrect: false,
        feedback: 'CHYBA: Nárazy zbraně o tvrdý podklad poškozují mechanismus a hrozí nebezpečný odraz.'
      }
    ]
  },
  {
    id: 'double_feed',
    name: '3. Dvojité podání náboje (Double Feed / Zádržka 3. typu)',
    symptom: 'V nábojové komoře zůstala nevystřelená nábojnice a závěr se snaží ze zásobníku zasunout další náboj. Závěr je zaseknutý v mezipoloze a nelze jej dorazit.',
    cause: 'Poškozený vytahovač, znečištěná komora nebo roztažené vývodky zásobníku.',
    correctAction: '1. Zajištění závěru v zadní poloze pomocí záchytu závěru. 2. Vyjmutí zásobníku (často vytržením / Rip Mag). 3. Energické 2–3× natažení závěru k vyhození uvízlého náboje. 4. Vložení nového zásobníku, natažení a pokračování.',
    whyCorrect: 'Jednoduchý Tap-Rack situaci jen zhorší, protože náboje jsou zapříčené proti sobě. Nutné je odlehčit tlak pružiny zásobníku.',
    dangerOfWrongAction: 'Snažit se dorazit závěr silou dopředu může deformovat náboj a způsobit jeho vznícení v komoře.',
    options: [
      {
        text: 'Silou bouchat pěstí do zadního čela závěru a snažit se jej zavřít.',
        isCorrect: false,
        feedback: 'NEBEZPEČNÁ CHYBA: Závěr je blokován dvěma náboji! Silový doraz deformuje střelu a může dojít k poškození zbraně nebo iniciaci.'
      },
      {
        text: 'Uzamknout závěr vzadu (Lock), energicky vytrhnout zásobník (Rip), 2–3× prorazit závěr (Rack), zasunout nový zásobník a natáhnout.',
        isCorrect: true,
        feedback: 'SPRÁVNĚ: Standardní taktický postup pro Double Feed (Lock – Rip – Rack – Reload). Jedině tak se uvolní sevření nábojů v komoře.'
      },
      {
        text: 'Zahodit zbraň a utéct z palebné čáry.',
        isCorrect: false,
        feedback: 'CHYBA: Příslušník VS ČR musí umět závadu na služební zbrani bezpečně a chladnokrevně vyřešit.'
      }
    ]
  },
  {
    id: 'out_of_battery',
    name: '4. Nedovřený závěr (Out of Battery)',
    symptom: 'Závěr nedojel do krajní přední uzamčené polohy (zůstal nedovřený o 2–5 mm). Zbraň nelze odpálit (pojistka blokuje spoušť).',
    cause: 'Znečištění vodicích drážek, nános karbonu, cizí tělísko nebo znavená vratná pružina.',
    correctAction: 'Udržovat bezpečný směr, energický úder dlaní do zadního čela závěru směrem vpřed (Tap Forward). Pokud nezaskočí, provést kompletní cyklus Tap-Rack.',
    whyCorrect: 'Krátký doraz dlaní překoná odpor nečistoty a bezpečně uzamkne zbraň do palebného stavu.',
    dangerOfWrongAction: 'Střelba s neuzamčeným závěrem by vedla k roztržení nábojnice a poškození rámu zbraně (moderní zbraně mají blokování spouště).',
    options: [
      {
        text: 'Udržovat bezpečný směr do terče, energicky udeřit dlaní do zadního čela závěru směrem vpřed.',
        isCorrect: true,
        feedback: 'SPRÁVNĚ: Úder dlaní (Forward Tap) pomůže závěru překonat mechanický odpor a bezpečně uzamknout hlaveň.'
      },
      {
        text: 'Dívat se zepředu do hlavně, zda tam není kamínek.',
        isCorrect: false,
        feedback: 'FATÁLNÍ CHYBA: Pohled do hlavně nabité zbraně je hrubé porušení všech bezpečnostních předpisů!'
      },
      {
        text: 'Zatáhnout za hlaveň kleštěmi.',
        isCorrect: false,
        feedback: 'CHYBA: Nářadí se při střelbě nepoužívá, manipulace se provádí výhradně manuálně.'
      }
    ]
  }
];
