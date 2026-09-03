import React, { useState } from 'react';
import { 
  Crosshair, 
  ShieldCheck, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Zap, 
  Sparkles, 
  Award,
  AlertOctagon,
  Wrench,
  ShieldAlert,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateDailyStreak } from '../utils/gamification';

interface WeaponSimulatorProps {
  onNavigateToBadges?: () => void;
}

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

interface WeaponStep {
  stepNumber: number;
  title: string;
  actionInstruction: string;
  whyCrucial: string;
  dangerIfOmitted: string;
}

interface WeaponData {
  id: string;
  name: string;
  caliber: string;
  capacity: string;
  serviceRole: string;
  safetySteps: WeaponStep[];
  disassemblySteps: WeaponStep[];
  technicalSpecs: { label: string; value: string }[];
}

const weapons: WeaponData[] = [
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

const stoppageDrills: StoppageDrill[] = [
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

export default function WeaponSimulator({ onNavigateToBadges }: WeaponSimulatorProps = {}) {
  const [selectedWeaponId, setSelectedWeaponId] = useState<'cz75b' | 'evo3'>('cz75b');
  const [activeMode, setActiveMode] = useState<'safety' | 'disassembly' | 'troubleshooting' | 'specs'>('safety');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Troubleshooting mode state
  const [currentDrillIndex, setCurrentDrillIndex] = useState<number>(0);
  const [selectedDrillOption, setSelectedDrillOption] = useState<number | null>(null);
  const [isDrillAnswered, setIsDrillAnswered] = useState<boolean>(false);
  const [completedDrills, setCompletedDrills] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vscr_completed_drills');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const currentWeapon = weapons.find(w => w.id === selectedWeaponId)!;
  const stepsToUse = activeMode === 'safety' ? currentWeapon.safetySteps : currentWeapon.disassemblySteps;

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps(prev => [...prev, currentStepIndex]);
    }
    if (currentStepIndex < stepsToUse.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      updateDailyStreak();
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsFinished(false);
    setSelectedDrillOption(null);
    setIsDrillAnswered(false);
  };

  const handleSwitchWeapon = (id: 'cz75b' | 'evo3') => {
    setSelectedWeaponId(id);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsFinished(false);
    setSelectedDrillOption(null);
    setIsDrillAnswered(false);
  };

  const handleSwitchMode = (mode: 'safety' | 'disassembly' | 'troubleshooting' | 'specs') => {
    setActiveMode(mode);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsFinished(false);
    setSelectedDrillOption(null);
    setIsDrillAnswered(false);
  };

  const handleDrillChoice = (index: number) => {
    if (isDrillAnswered) return;
    setSelectedDrillOption(index);
    setIsDrillAnswered(true);

    const drill = stoppageDrills[currentDrillIndex];
    if (drill.options[index].isCorrect) {
      setCompletedDrills(prev => {
        if (!prev.includes(drill.id)) {
          const next = [...prev, drill.id];
          try {
            localStorage.setItem('vscr_completed_drills', JSON.stringify(next));
            window.dispatchEvent(new Event('storage'));
          } catch {
            // ignore
          }
          return next;
        }
        return prev;
      });
      updateDailyStreak();
    }
  };

  const handleNextDrill = () => {
    if (currentDrillIndex < stoppageDrills.length - 1) {
      setCurrentDrillIndex(prev => prev + 1);
      setSelectedDrillOption(null);
      setIsDrillAnswered(false);
    }
  };

  const currentStep = stepsToUse[currentStepIndex];

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto p-2 sm:p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-md border border-amber-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-400/20">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Střelecká a zbraňová příprava VS ČR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Trenažér manipulace a rozborky zbraní</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Interaktivní nácvik bezpečnostní prověrky, vybíjení do lapače střel a postupu částečné rozborky pro pistoli CZ 75 B a samopal Scorpion EVO 3A1.
            </p>
          </div>

          {/* Weapon Selector Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleSwitchWeapon('cz75b')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                selectedWeaponId === 'cz75b'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Pistole CZ 75 B
            </button>
            <button
              onClick={() => handleSwitchWeapon('evo3')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                selectedWeaponId === 'evo3'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Scorpion EVO 3A1
            </button>
          </div>
        </div>
      </div>

      {/* Mode Sub-nav */}
      <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => handleSwitchMode('safety')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMode === 'safety'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Bezpečnostní kontrola & Vybíjení</span>
          </button>

          <button
            onClick={() => handleSwitchMode('disassembly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMode === 'disassembly'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Částečná rozborka</span>
          </button>

          <button
            onClick={() => handleSwitchMode('troubleshooting')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeMode === 'troubleshooting'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>3. Odstraňování závad</span>
            {completedDrills.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black">
                {completedDrills.length}/{stoppageDrills.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSwitchMode('specs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeMode === 'specs'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>4. Takticko-technická data</span>
          </button>
        </div>

        {activeMode !== 'specs' && activeMode !== 'troubleshooting' && (
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs shrink-0 cursor-pointer"
            title="Resetovat průchod"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        )}
      </div>

      {activeMode === 'troubleshooting' ? (
        <div className="flex flex-col gap-5">
          {/* Drills Selector Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {stoppageDrills.map((drill, idx) => {
              const isCurrent = idx === currentDrillIndex;
              const isDone = completedDrills.includes(drill.id);
              return (
                <button
                  key={drill.id}
                  onClick={() => {
                    setCurrentDrillIndex(idx);
                    setSelectedDrillOption(null);
                    setIsDrillAnswered(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                      : isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{drill.name.split('. ')[1] || drill.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Drill Card */}
          {(() => {
            const drill = stoppageDrills[currentDrillIndex];
            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <AlertOctagon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modelová střelecká závada</span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{drill.name}</h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Závada {currentDrillIndex + 1} z {stoppageDrills.length}
                  </span>
                </div>

                {/* Symptom & Cause Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Příznak závady (Symptom):</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      {drill.symptom}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                      <HelpCircle className="w-4 h-4" />
                      <span>Možná příčina:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {drill.cause}
                    </p>
                  </div>
                </div>

                {/* Prompt & Options */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>Jaký je správný a bezpečný metodický postup odstranění závady?</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">
                    {drill.options.map((opt, optIdx) => {
                      const isSelected = selectedDrillOption === optIdx;
                      let optClass = "border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-amber-400";
                      
                      if (isDrillAnswered) {
                        if (opt.isCorrect) {
                          optClass = "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs";
                        } else if (isSelected) {
                          optClass = "border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold shadow-xs";
                        } else {
                          optClass = "opacity-40 border-slate-200 dark:border-slate-800 text-slate-400";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleDrillChoice(optIdx)}
                          disabled={isDrillAnswered}
                          className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${optClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="text-xs sm:text-sm leading-relaxed">{opt.text}</span>
                          </div>
                          {isDrillAnswered && (
                            opt.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : isSelected ? (
                              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            ) : null
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback & Explanation Card */}
                {isDrillAnswered && selectedDrillOption !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      {drill.options[selectedDrillOption].isCorrect ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          SPRÁVNÉ ROZHODNUTÍ (+40 XP)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs">
                          NESPRÁVNÝ POSTUP
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      {drill.options[selectedDrillOption].feedback}
                    </p>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div><strong>Správný metodický postup:</strong> {drill.correctAction}</div>
                      <div><strong>Zdůvodnění:</strong> {drill.whyCorrect}</div>
                      <div><strong>Nebezpečí nesprávného zásahu:</strong> <span className="text-rose-600 dark:text-rose-400 font-medium">{drill.dangerOfWrongAction}</span></div>
                    </div>

                    <div className="flex justify-end pt-2">
                      {currentDrillIndex < stoppageDrills.length - 1 ? (
                        <button
                          onClick={handleNextDrill}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                        >
                          <span>Další závada</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setCurrentDrillIndex(0);
                            setSelectedDrillOption(null);
                            setIsDrillAnswered(false);
                          }}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Všechny závady procvičeny! Restartovat</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })()}
        </div>
      ) : activeMode === 'specs' ? (
        /* Technical Specifications Tab */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
              <Crosshair className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentWeapon.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentWeapon.serviceRole}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {currentWeapon.technicalSpecs.map((spec, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{spec.label}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white text-right">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Zkušební požadavek Akademie VS ČR ke zkoušce ZOP A:</span>
              Frekventant musí samostatně předvést bezpečnou kontrolu zbraně a částečnou rozborku do 60 sekund bez míření zbraní mimo bezpečný prostor lapače střel.
            </div>
          </div>
        </div>
      ) : isFinished ? (
        /* Completion Summary View */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-6 sm:p-8 shadow-lg text-center space-y-6"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Nácvik úspěšně dokončen
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {activeMode === 'safety' ? 'Bezpečnostní protokol bezchybně zvládnut!' : 'Částečná rozborka bezchybně zvládnuta!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl mx-auto">
              Úspěšně jste prošli všemi {stepsToUse.length} fázemi metodického postupu pro <strong className="text-slate-900 dark:text-white">{currentWeapon.name}</strong>.
            </p>
          </div>

          {/* Steps Summary Card */}
          <div className="text-left bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 space-y-2.5 max-w-2xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Splněné kontrolní body Akademie VS ČR:
            </div>
            {stepsToUse.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{step.title}</span>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.whyCrucial}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Zopakovat tento nácvik</span>
            </button>

            {activeMode === 'safety' ? (
              <button
                onClick={() => handleSwitchMode('disassembly')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Přejít na částečnou rozborku</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSwitchMode('specs')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Takticko-technická data</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => handleSwitchWeapon(selectedWeaponId === 'cz75b' ? 'evo3' : 'cz75b')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <Crosshair className="w-4 h-4" />
              <span>Přepnout na {selectedWeaponId === 'cz75b' ? 'Scorpion EVO 3A1' : 'Pistoli CZ 75 B'}</span>
            </button>

            {onNavigateToBadges && (
              <button
                onClick={onNavigateToBadges}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors border border-amber-500/30 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Zobrazit odznaky a hodnost</span>
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        /* Interactive Step by Step Simulation */
        <div className="flex flex-col gap-5">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {stepsToUse.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isDone = completedSteps.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                      : isDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{idx + 1}</span>}
                  <span className="truncate max-w-[120px]">{step.title.split('. ')[1] || step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Step Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedWeaponId}-${activeMode}-${currentStepIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full border border-amber-500/20">
                  {currentWeapon.name} • {activeMode === 'safety' ? 'Bezpečnostní postup' : 'Rozborka'}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Krok {currentStepIndex + 1} z {stepsToUse.length}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {currentStep.title}
              </h3>

              {/* Action Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                  Požadovaný úkon střelce:
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                  {currentStep.actionInstruction}
                </p>
              </div>

              {/* Crucial & Danger Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-300 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Proč je tento krok klíčový:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                    {currentStep.whyCrucial}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800 dark:text-rose-300 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Riziko při opomenutí:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200/90 leading-relaxed">
                    {currentStep.dangerIfOmitted}
                  </p>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                  className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  Předchozí krok
                </button>

                <button
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>{currentStepIndex === stepsToUse.length - 1 ? 'Dokončit nácvik' : 'Potvrdit provedení & Další krok'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
