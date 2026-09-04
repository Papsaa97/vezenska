export interface ScenarioChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
  legalBasis: string;
  nextStepId?: string;
}

export interface ScenarioStep {
  id: string;
  title: string;
  description: string;
  choices: ScenarioChoice[];
}

export interface Scenario {
  id: string;
  title: string;
  category: 'Právo & Donucovací prostředky' | 'Mimořádné události & Zásah' | 'Eskorty & Střelba' | 'Vstupy & Justiční stráž';
  badge: string;
  difficulty: 'Základní' | 'Pokročilá' | 'Expertní';
  briefing: string;
  steps: ScenarioStep[];
}

export const tacticalScenarios: Scenario[] = [
  {
    id: 'sc-01',
    title: 'Modelová situace 1: Podnapilá návštěva, děti a nepovolený balík na vchodu',
    category: 'Vstupy & Justiční stráž',
    badge: 'NGŘ č. 33/2019 & § 80',
    difficulty: 'Pokročilá',
    briefing: 'Jste velen jako strážný u hlavního vchodu do věznice. Ke vchodu se dostavila žena (manželka obviněného), která přivedla bratra a 5letého syna (neuvedeného na žádance) a s sebou má balík s potravinami o hmotnosti 5,5 kg. Ze ženy je navíc cítit alkohol.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Posouzení způsobilosti ke vstupu a kontrola osob',
        description: 'Žena jeví zjevné známky požití alkoholu, na žádance není uvedeno dítě a hmotnost balíku překračuje limit. Jak budete jednat?',
        choices: [
          {
            id: 'c1-1',
            text: 'Nechat paní vstoupit, protože má platný občanský průkaz a nechcete dělat rozruch před dítětem.',
            isCorrect: false,
            feedback: 'CHYBA: Dle § 80 odst. 3 písm. e) NGŘ č. 33/2019 je strážnému výslovně ZAKÁZÁNO vpustit do věznice zjevně podnapilé osoby a osoby mladší 15 let bez řádného povolení.',
            legalBasis: '§ 80 odst. 3 písm. e) NGŘ č. 33/2019'
          },
          {
            id: 'c1-2',
            text: 'Jednat slušně, taktně, ale rozhodně. Vstup podnapilé osobě neumožnit, vysvětlit důvody nevpuštění, odmítnout převzetí balíku o váze 5,5 kg (limit je max. 5 kg) a o situaci neprodleně vyrozumět VISS.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Podnapilá osoba nesmí do střeženého objektu. Osoby neuvedené v žádance nelze vpustit. Hmotnost balíčku nesmí přesáhnout 5 kg.',
            legalBasis: '§ 80 NGŘ č. 33/2019 a Řád výkonu vazby',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-3',
            text: 'Odebrat ženě občanský průkaz a balík vyhodit do popelnice.',
            isCorrect: false,
            feedback: 'CHYBA: Strážný nesmí svévolně odebírat doklady ani ničit cizí majetek.',
            legalBasis: '§ 6 zákona č. 555/1992 Sb.'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Agresivní reakce návštěvy v prostoru vstupního koše',
        description: 'Žena začne hlasitě křičet: „Nebudu tady dělat striptýz, stěžovat si budu na generálním ředitelství!“ a odmítá opustit prostor vchodu.',
        choices: [
          {
            id: 'c2-1',
            text: 'Zůstat v bezpečí strážního stanoviště za neprůstřelným sklem, zachovat klid, vyzvat osobu jménem zákona k opuštění vstupního koše a prostřednictvím VISS přivolat hlídku PČR k vyvedení z veřejné části.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Strážní stanoviště zůstává bezpečně uzamčeno. Při neuposlechnutí výzvy k opuštění objektu civilní osobou se vyžaduje součinnost Policie ČR.',
            legalBasis: '§ 13 odst. 1 zákona č. 555/1992 Sb. a § 80 NGŘ č. 33/2019'
          },
          {
            id: 'c2-2',
            text: 'Otevřít dveře stanoviště, vyběhnout ven a použít proti ženě obušek a slzotvorný prostředek.',
            isCorrect: false,
            feedback: 'CHYBA: Nepřiměřený zásah. Navíc je zakázáno otevírat stanoviště bez zajištění dalším příslušníkem.',
            legalBasis: '§ 17 a § 19 zákona č. 555/1992 Sb.'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-02',
    title: 'Modelová situace 2: Útěk vězně z ordinace civilního lékaře',
    category: 'Eskorty & Střelba',
    badge: 'Kupec Eskorty & § 18 z. 555/1992 Sb.',
    difficulty: 'Expertní',
    briefing: 'Jste velitel mimořádné zdravotní eskorty do nemocnice. Odsouzenému byly na pokyn lékaře sňata pouta kvůli vyšetření ruky. Po rozpoutání odsouzený prudce odstrčí strážného a dá se na útěk chodbou polikliniky směrem k otevřenému východu.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Prvotní zákrok v prostoru nemocnice',
        description: 'Odsouzený běží chodbou, kde se nacházejí civilní pacienti. Jaký je váš postup jako velitele eskorty?',
        choices: [
          {
            id: 'c1-1',
            text: 'Okamžitě vytáhnout pistoli a vystřelit na prchajícího odsouzeného.',
            isCorrect: false,
            feedback: 'HRUBÁ CHYBA: Použití střelné zbraně v prostoru plném nezúčastněných civilních osob je v rozporu s § 18 odst. 4 (povinnost dbát nutné opatrnosti a neohrozit život jiných osob).',
            legalBasis: '§ 18 odst. 4 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c1-2',
            text: 'Okamžitě zahájit bezprostřední pronásledování, použít zákonnou výzvu „Jménem zákona stůj!“, použít hmaty a chvaty k povalení na zem, přiložit pouta DP1/DP2 a strážný řidič zablokuje východ.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Bezprostřední pronásledování a fyzické zpacifikování pomocí hmatů a chvatů bez ohrožení okolních pacientů.',
            legalBasis: '§ 15 a § 17 zákona č. 555/1992 Sb. a NGŘ č. 33/2019',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Hlášení a administrativní dořešení mimořádné události',
        description: 'Odsouzený byl zpacifikován a spoután. Jaké kroky bezodkladně následují?',
        choices: [
          {
            id: 'c2-1',
            text: 'Okamžitě telefonicky vyrozumět operační středisko (OS) kmenové věznice, informovat VISS, dokončit lékařské ošetření za zpřísněných bezpečnostních opatření (DP2/DP3) a po návratu sepsat záznam o použití DP a hlášení k mimořádné události.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Pokus o útěk je závažnou mimořádnou událostí dle § 5 písm. a) NGŘ č. 16/2022. Vyžaduje okamžité hlášení na OS a zpracování záznamu.',
            legalBasis: 'NGŘ č. 16/2022 § 5 a Metodický list č. 5/2014'
          },
          {
            id: 'c2-2',
            text: 'Nikomu nic nehlásit, protože se vězně podařilo chytit, a vrátit se do věznice.',
            isCorrect: false,
            feedback: 'CHYBA: Zatajení pokusu o útěk je závažným porušením služebních povinností zakládajícím kárnou i trestní odpovědnost.',
            legalBasis: 'Zákon č. 361/2003 Sb. a NGŘ č. 16/2022'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-03',
    title: 'Modelová situace 3: Naříznutá mříž při dílčí prohlídce cel',
    category: 'Mimořádné události & Zásah',
    badge: 'NGŘ č. 33/2019 & § 92',
    difficulty: 'Základní',
    briefing: 'Provádíte dílčí prohlídku cel obviněných ve vazební věznici. Dva obvinění jsou mimo celu. Při proklepávání okenní mříže železnou tyčí zjistíte dutý zvuk a následně odhalíte, že je mříž naříznutá a řez byl zamaskován pastou z chleba.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Prvotní bezpečnostní opatření na cele',
        description: 'Objevili jste naříznutou mříž signalizující přípravu k útěku. Co uděláte jako první?',
        choices: [
          {
            id: 'c1-1',
            text: 'Zůstat v klidu na cele, mříž zalepit páskou a počkat do konce směny.',
            isCorrect: false,
            feedback: 'CHYBA: Příprava k útěku je závažnou bezpečnostní událostí.',
            legalBasis: 'NGŘ č. 33/2019'
          },
          {
            id: 'c1-2',
            text: 'Ihned rádiem/spojením informovat VISS a operační středisko, nevpustit obviněné zpět na tuto celu, provést důkladnou osobní prohlídku obou obviněných a zkontrolovat přítomnost řezných nástrojů (pilek na kov).',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Zabránění návratu na kompromitovanou celu, okamžité hlášení VISS a důkladná prohlídka vězňů k odhalení nástrojů.',
            legalBasis: '§ 92 a § 94 NGŘ č. 33/2019',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Zajištění stop a přemístění vězňů',
        description: 'VISS se dostavil na místo. Jaká opatření budou nařízena pro další postup?',
        choices: [
          {
            id: 'c2-1',
            text: 'Předat věc Pověřenému orgánu VS ČR k prošetření podezření z trestného činu maření výkonu úředního rozhodnutí, celu zapečetit a obviněné přemístit do cely se zesílenými stavebně technickými prostředky.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Příprava k útěku vyžaduje umístění na celu se zesílenými STP (dvojitý okenní katr, armatura) a předání Pověřenému orgánu.',
            legalBasis: '§ 3 odst. 8 zákona č. 555/1992 Sb. a NGŘ č. 24/2022'
          },
          {
            id: 'c2-2',
            text: 'Pouze uložit obviněným kázeňský trest napomenutí a nechat je na cele.',
            isCorrect: false,
            feedback: 'CHYBA: Cela je stavebně narušená a hrozí dokonání útěku.',
            legalBasis: 'Bezpečnostní předpisy VS ČR'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-04',
    title: 'Modelová situace 4: Sebevražedný pokus oběšením na cele',
    category: 'Právo & Donucovací prostředky',
    badge: 'První pomoc & NGŘ č. 16/2022',
    difficulty: 'Expertní',
    briefing: 'Během noční kontroly cel zjistíte kukátkem, že na okenní mříži visí obviněný na pruhu látky z prostěradla a nejeví známky života. Spoluvězeň leží na lůžku a nereaguje.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Vstup do cely a záchrana života',
        description: 'Jaký je přesný taktický a záchranný postup při vstupu do cely?',
        choices: [
          {
            id: 'c1-1',
            text: 'Sám ihned odemknout celu, vběhnout dovnitř a začít odřezávat tělo.',
            isCorrect: false,
            feedback: 'CHYBA: V noci dozorce NIKDY neotevírá celu sám bez asistence dalšího příslušníka (riziko fingované sebevraždy a napadení).',
            legalBasis: 'Zásady bezpečnosti dozorčí služby'
          },
          {
            id: 'c1-2',
            text: 'Stisknout tísňové tlačítko / přivolat rádiem další hlídku a VISS, po příchodu posily vstoupit, nadzvednout tělo k uvolnění tlaku na krk, záchranářským nožem odříznout škrtidlo, položit na pevnou podložku a zahájit kardiopulmonální resuscitaci (30:2).',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Záchrana života s dodržením taktické bezpečnosti (vstup ve dvou) a okamžité zahájení KPR.',
            legalBasis: 'Traumatologický plán VS ČR & NGŘ č. 16/2022',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Lékařské dořešení a hlásná povinnost',
        description: 'Přivolaný lékař po 20 minutách resuscitace konstatuje smrt obviněného. Jak je událost kvalifikována v hlásné službě?',
        choices: [
          {
            id: 'c2-1',
            text: 'Jde o ostatní mimořádnou událost – dokonaná sebevražda dle § 6 písm. a) NGŘ č. 16/2022. Věznice neprodleně telefonicky informuje stálou službu GŘ VS ČR a dozorového státního zástupce, místo zajistí pro PČR a do 3 pracovních dnů zašle písemnou zprávu v ETŘ.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Dokonaná sebevražda spadá pod § 6 písm. a). Vyrozumívá se stálá služba GŘ, dozorový státní zástupce a PČR.',
            legalBasis: 'NGŘ č. 16/2022 § 6, § 7 a § 9'
          },
          {
            id: 'c2-2',
            text: 'Událost se nahlásí až v měsíčním souhrnu.',
            isCorrect: false,
            feedback: 'CHYBA: Smrt vězněné osoby musí být hlášena neprodleně.',
            legalBasis: 'NGŘ č. 16/2022'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-05',
    title: 'Modelová situace 5: Noční neohlášená kontrola z Generálního ředitelství',
    category: 'Vstupy & Justiční stráž',
    badge: 'NGŘ č. 33/2019 & § 54, 80',
    difficulty: 'Pokročilá',
    briefing: 'Jste velen jako strážný u hlavního vchodu. Ve 22:15 hod. se ke vchodu dostaví muž v civilním oděvu, prokáže se služebním průkazem se žlutým pruhem a uvede, že je ředitel odboru VaJS GŘ VS ČR. Požaduje okamžitý vstup na vaše stanoviště bez přítomnosti VISS a chce zkontrolovat nabití vaší zbraně.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Kontrola průkazu a oprávnění ke vstupu',
        description: 'Jak posoudíte předložený doklad a požadavky kontrolujícího?',
        choices: [
          {
            id: 'c1-1',
            text: 'Ihned otevřít stanoviště, podat mu svou nabitou zbraň a nechat ho nahlédnout do počítače VIS.',
            isCorrect: false,
            feedback: 'HRUBÁ CHYBA: Dle § 32 odst. 3 NGŘ č. 33/2019 strážný NESMÍ NIKOMU VÝDAT SVOJI ZBRAŇ, a to ani nadřízenému! Na stanoviště nesmí vstupovat nepovolané osoby bez VISS.',
            legalBasis: '§ 32 odst. 3 a § 80 odst. 3 písm. f) NGŘ č. 33/2019'
          },
          {
            id: 'c1-2',
            text: 'Ověřit platnost průkazu (žlutý pruh = ředitel odboru GŘ VS ČR). Podle § 80 odst. 2 písm. c) neprovádět prohlídku jeho zavazadla. Vstup do střeženého objektu povolit, avšak vstup na samotné strážní stanoviště a kontrolu výkonu služby umožnit POUZE v přítomnosti službukonajícího VISS, kterého ihned vyrozumíte.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Ředitel odboru GŘ má právo vstupu bez prohlídky zavazadel, ale kontrolu strážního stanoviště a zbraní provádí v součinnosti s VISS. Zbraň se nikdy nepředává z ruky do ruky!',
            legalBasis: '§ 54, § 80 a § 32 NGŘ č. 33/2019'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-06',
    title: 'Modelová situace 6: Přeprava peněžních zásilek Justiční stráží',
    category: 'Vstupy & Justiční stráž',
    badge: 'Instrukce MS 8/2022 & § 144',
    difficulty: 'Základní',
    briefing: 'Jste určen jako velitel přepravy finanční hotovosti z ČNB do budovy okresního soudu. Doprava probíhá pěšky přes frekventovanou městskou zónu za účasti pokladní soudu a druhého příslušníka JS.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Taktika pěší formace a nesení hotovosti',
        description: 'Kdo nese zavazadlo s penězi a jak jsou rozmístěni příslušníci Justiční stráže?',
        choices: [
          {
            id: 'c1-1',
            text: 'Příslušník JS vezme tašku s penězi do ruky, aby ulehčil pokladní.',
            isCorrect: false,
            feedback: 'HRUBÁ CHYBA: Podle § 144 odst. 6 NGŘ č. 33/2019 a Instrukce MS č. 8/2022 platí striktní zásada: Zavazadlo s finanční hotovostí nese VÝHRADNĚ pracovník soudu, NIKDY příslušník justiční stráže!',
            legalBasis: '§ 144 odst. 6 NGŘ č. 33/2019'
          },
          {
            id: 'c1-2',
            text: 'Zavazadlo nese výhradně pracovnice soudu. Druhý příslušník JS jde vedle zajišťované osoby tak, aby taška byla mezi ním a pracovnicí. Velitel přepravy provádí zajišťování a krytí zezadu s přehledem o okolí a stálým spojením na služebnu JS.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Přesné dodržení taktické formace: peníze nese civilní pracovník, 1. příslušník po boku, velitel přepravy jistí situaci zezadu.',
            legalBasis: '§ 144 odst. 5 a 6 NGŘ č. 33/2019'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-07',
    title: 'Modelová situace 7: Přelet dronu (UAV) nad vycházkovým dvorem věznice',
    category: 'Mimořádné události & Zásah',
    badge: 'NGŘ č. 16/2022 & UAV',
    difficulty: 'Pokročilá',
    briefing: 'Strážný na strážní věži č. 3 zaznamená ve večerních hodinách letící bezpilotní prostředek (dron) směřující nad vycházkový dvůr ubytovny odsouzených. Z dronu visí zavěšený balíček a klesá k zemi.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Okamžitá reakce strážného a hlásná povinnost',
        description: 'Dron se vznáší cca 15 metrů nad dvorem, kde probíhá vycházka 20 odsouzených. Jak bude strážný věže reagovat?',
        choices: [
          {
            id: 'c1-1',
            text: 'Okamžitě zahájit palbu ze služebního samopalu na dron ve vzduchu.',
            isCorrect: false,
            feedback: 'HRUBÁ CHYBA: Střelba do vzduchu na pohyblivý cíl nad střeženým areálem je přísně zakázána! Hrozí dopad střel mimo areál věznice, usmrcení civilních osob nebo zásah vězňů na dvoře.',
            legalBasis: '§ 18 a § 20 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c1-2',
            text: 'Okamžitě vyhlásit poplach rádiem pro VISS, popsat směr příletu a výšku dronu, nařídit dozorcům okamžité vyklizení vycházkového dvora a uzamčení vězňů do ubytovny a sledovat místo dopadu zásilky.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Prioritou je izolace prostoru, zabránění převzetí balíčku odsouzenými a ochrana personálu bez nebezpečné střelby.',
            legalBasis: 'Metodický pokyn VS ČR pro zásah proti bezpilotním prostředkům (UAV)',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Zajištění shozeného balíčku',
        description: 'Dron odletěl a na zemi zůstal ležet neznámý černý balíček obalený lepicí páskou. Jak probíhá zajištění?',
        choices: [
          {
            id: 'c1-3',
            text: 'Vezmete balíček, nožem jej okamžitě rozříznete a obsah vysypete na stůl.',
            isCorrect: false,
            feedback: 'CHYBA: Riziko výbušného systému, biologického materiálu nebo nebezpečných chemikálií (fentanyl).',
            legalBasis: 'Zásady pyrotechnické a chemické bezpečnosti'
          },
          {
            id: 'c1-4',
            text: 'Uzavřít prostor, za pomoci technických prostředků (detektor kovů / RTG / psovod) vyloučit přítomnost nástražného výbušného systému, v ochranných rukavicích balíček zadokumentovat, zajistit a vyrozumět Policii ČR.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Bezpečné zajištění podezřelého předmětu s ochranou kriminalistických stop (DNA, otisky prstů) pro další vyšetřování.',
            legalBasis: 'Trestní řád a směrnice pro nález nepovolených předmětů VS ČR'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-08',
    title: 'Modelová situace 8: Pokus o korupci a nabídka úplatku za pronesení mobilu',
    category: 'Právo & Donucovací prostředky',
    badge: 'Protikorupční program VS ČR',
    difficulty: 'Expertní',
    briefing: 'Během obchůzky vnitřního pracoviště vás osloví odsouzený se slovy: „Pane strážmistr, potřebuji pomoc. Když mi zítra pronesete v kapse malý smartphone, brácha vám na účet pošle 30 000 Kč a nikdo se nic nedozví.“',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Reakce na korupční nabídku',
        description: 'Jak se zachováte v přímém kontaktu s odsouzeným při nabídce úplatku?',
        choices: [
          {
            id: 'c1-1',
            text: 'Nabídku jednoznačně a důrazně odmítnout, zachovat chladný profesionální odstup, nevstupovat do další diskuze a nepřijímat žádné kompromisy.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Striktní odmítnutí korupčního jednání v souladu s Kodexem etiky a okamžité ukončení neformální komunikace.',
            legalBasis: 'Kodex profesní etiky VS ČR a NGŘ č. 28/2018 Sb.',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-2',
            text: 'Říct odsouzenému, že za 30 000 Kč je to málo a ať nabídne víc.',
            isCorrect: false,
            feedback: 'HRUBÉ PORUŠENÍ ZÁKONA: Jednání naplňuje znaky trestného činu přijetí úplatku (§ 331 trestního zákoníku) s trestem odnětí svobody a propuštěním ze služebního poměru.',
            legalBasis: '§ 331 zákona č. 40/2009 Sb., trestní zákoník'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Procesní a služební postup po incidentu',
        description: 'Jaké bezprostřední kroky musíte učinit po návratu na dozorčí stanoviště?',
        choices: [
          {
            id: 'c2-1',
            text: 'Neprodleně sepsat podrobný úřední záznam, o události informovat velitele směny (VISS) a podnět postoupit Oddělení prevence a stížností (OPaS) / GIBS pro podezření z trestného činu podplácení dle § 332 TZ.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Přesný služební postup. Oznamovací povinnost příslušníka je klíčovou součástí protikorupčního programu VS ČR.',
            legalBasis: '§ 332 TZ a interní protikorupční program VS ČR'
          },
          {
            id: 'c2-2',
            text: 'Nikomu nic neříkat, abyste neměl zbytečné papírování.',
            isCorrect: false,
            feedback: 'CHYBA: Neoznámení korupčního jednání je kázeňským proviněním a ohrožuje bezpečnost celého sboru.',
            legalBasis: 'Zákon č. 361/2003 Sb., o služebním poměru'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-09',
    title: 'Modelová situace 9: Hladovka a odmítání stravy odsouzeným',
    category: 'Mimořádné události & Zásah',
    badge: '§ 16 zák. 169/1999 Sb.',
    difficulty: 'Základní',
    briefing: 'Odsouzený na oddělení se zvýšenou ostrahou odmítne třetí den po sobě převzít stravu (snídani, oběd i večeři). Tvrdí, že drží protestní hladovku kvůli zamítnutí přeřazení do mírnějšího typu věznice.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Postup dozorce při odmítnutí stravy',
        description: 'Jak postupuje službukonající personál při opakovaném odmítání stravy vězněm?',
        choices: [
          {
            id: 'c1-1',
            text: 'Každé odmítnutí stravy přesně zaznamenat do stravovací knihy a ETŘ, odebrat nevydanou stravu a neprodleně písemně uvědomit vězeňského lékaře, psychologa a velitele oddílu.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Zákon č. 169/1999 Sb. stanoví povinnost lékařského dohledu a monitorace zdravotního stavu hladovkáře.',
            legalBasis: '§ 16 odst. 3 zákona č. 169/1999 Sb. a Řád výkonu trestu',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-2',
            text: 'Odsouzeného přivázat k lůžku a jídlo mu násilím vnutit do úst.',
            isCorrect: false,
            feedback: 'HRUBÉ PORUŠENÍ ZÁKONA: Násilné krmení je zakázáno Evropskými vězeňskými pravidly i českou legislativou, pokud není nařízeno soudem při bezprostředním ohrožení života.',
            legalBasis: 'Čl. 3 Úmluvy o ochraně lidských práv a základních svobod'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Zdravotní péče a poučení',
        description: 'Vězeňský lékař převezme odsouzeného do zdravotní péče. Jaká opatření následují?',
        choices: [
          {
            id: 'c2-1',
            text: 'Pravidelná kontrola vitálních funkcí (tlak, glykémie, hmotnost), poučení odsouzeného o nevratném poškození zdraví s podpisem do zdravotní dokumentace a nabídka psychologické intervence.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Standardní penitenciární a zdravotnický postup péče o hladovkáře.',
            legalBasis: 'Metodika zdravotnické služby VS ČR'
          },
          {
            id: 'c2-2',
            text: 'Umístit odsouzeného do temnice bez přístupu k pitné vodě.',
            isCorrect: false,
            feedback: 'ZÁKAZ: Odsouzený musí mít nepřetržitý přístup k pitné vodě!',
            legalBasis: 'Zákon č. 169/1999 Sb.'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-10',
    title: 'Modelová situace 10: Požár na cele během noční směny',
    category: 'Mimořádné události & Zásah',
    badge: 'Požární poplachový plán',
    difficulty: 'Expertní',
    briefing: 'Ve 02:45 hod. se na úseku ubytovny B rozezní požární hlásič EPS. Z ventilačních otvorů cely č. 8 vychází hustý kouř a zevnitř je slyšet dusivý kašel a křik dvou odsouzených.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Vyhlášení poplachu a příprava zásahu',
        description: 'Co musí dozorce udělat před otevřením hořící a zakouřené cely?',
        choices: [
          {
            id: 'c1-1',
            text: 'Ihned vyhlásit požární poplach (tlačítko EPS + radiostanice), přivolat HZS a velitele směny, nasadit autonomní dýchací přístroj (izolační dýchací masku) a vyčkat na příchod druhého vystrojeného příslušníka.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Bez dýchacího přístroje hrozí dozorci otrava oxidem uhelnatým (CO) během 30 sekund! Vstup do požáru se provádí vždy ve dvojici.',
            legalBasis: 'Požární poplachová směrnice VS ČR & BOZP',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-2',
            text: 'Sám bez masky okamžitě otevřít dveře a skočit do kouře.',
            isCorrect: false,
            feedback: 'FATÁLNÍ CHYBA: Náhlý přísun kyslíku otevřením dveří způsobí backdraft (výbuch plynů) a nechráněný záchranář upadne do bezvědomí.',
            legalBasis: 'Taktika hašení požárů HZS ČR'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Vyvedení osob a první pomoc',
        description: 'Cela je otevřena, hoří matrace a lůžkoviny. Jak probíhá záchrana osob?',
        choices: [
          {
            id: 'c2-1',
            text: 'Za pomoci práškového/sněhového hasicího přístroje srazit plameny, vyvést ležící odsouzené do nezakouřeného úseku ubytovny, zajistit bezpečnost (pouta dle situace), poskytnout první pomoc při nadýchání kouřem (poloha v polosedě, kyslík) a předat ZZS.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Rychlá lokalizace ohně, vyvedení postižených a okamžitá první pomoc s dodržením bezpečnostních opatření.',
            legalBasis: 'Traumatologický plán VS ČR & § 16 NGŘ č. 16/2022'
          },
          {
            id: 'c2-2',
            text: 'Nejprve dohasit celou celu a vězně nechat ležet uvnitř.',
            isCorrect: false,
            feedback: 'CHYBA: Záchrana lidských životů má vždy absolutní prioritu před hašením majetku!',
            legalBasis: 'Zákon o požární ochraně a instrukce VS ČR'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-11',
    title: 'Modelová situace 11: Zadržení osoby s návykovou látkou na návštěvě',
    category: 'Vstupy & Justiční stráž',
    badge: 'NGŘ č. 33/2019 & TZ',
    difficulty: 'Pokročilá',
    briefing: 'Při kontrole civilní osoby (návštěvy odsouzeného) za použití RTG a osobní prohlídky naleznete v podšívce bundy zatavený igelitový sáček s bílou krystalickou látkou (podezření na pervitin). Návštěvník začne být nervózní a chce věznici ihned opustit.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Omezení osobní svobody a zajištění místa',
        description: 'Jak budete postupovat vůči podezřelé civilní osobě u vchodu do věznice?',
        choices: [
          {
            id: 'c1-1',
            text: 'Osobu ihned propustíte s tím, že se návštěva ruší, a sáček vyhodíte do koše.',
            isCorrect: false,
            feedback: 'CHYBA: Nález OPL je podezřením ze spáchání trestného činu (nedovolená výroba a jiné nakládání s OPL dle § 283 TZ nebo maření výkonu úředního rozhodnutí). Zničení důkazu a propuštění pachatele je nepřípustné.',
            legalBasis: '§ 283 TZ'
          },
          {
            id: 'c1-2',
            text: 'Zabráníte osobě v odchodu z věznice (omezení osobní svobody osoby přistižené při trestném činu dle § 76 odst. 2 TrŘ), sáčku se nebudete dotýkat holýma rukama, informujete velitele směny a ihned přivoláte Policii ČR k převzetí osoby a důkazu.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Omezení osobní svobody podle § 76 odst. 2 TrŘ (občanské zadržení) je zde na místě, jelikož osoba byla přistižena při činu. Zajištění stop (sáčků) se provádí v rukavicích a věc se předává PČR.',
            legalBasis: '§ 76 odst. 2 trestního řádu',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Administrativní opatření a hlášení',
        description: 'Policie osobu převzala. Co učiníte na úrovni věznice?',
        choices: [
          {
            id: 'c2-1',
            text: 'Zpracujete úřední záznam o incidentu, zaevidujete událost v ETŘ, navrhnete zrušení návštěvy a zavedete odsouzeného, k němuž návštěva směřovala, na mimořádnou prohlídku a případně test na OPL.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Událost se musí interně řešit (záznam, ETŘ) a cílový odsouzený je ihned považován za rizikového pro možnou držbu či distribuci OPL.',
            legalBasis: 'NGŘ č. 33/2019 a Řád výkonu trestu'
          },
          {
            id: 'c2-2',
            text: 'Událost se nemusí hlásit, protože policie si případ odvezla a odsouzený drogu nedostal.',
            isCorrect: false,
            feedback: 'CHYBA: Jakýkoli nález a zásah PČR je mimořádnou událostí, která musí být zaznamenána a hlášena vedení věznice (příp. GŘ).',
            legalBasis: 'NGŘ č. 16/2022'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-12',
    title: 'Modelová situace 12: Rukojmí na oddělení - Krizová situace',
    category: 'Mimořádné události & Zásah',
    badge: 'Krizové řízení & IZS',
    difficulty: 'Expertní',
    briefing: 'Během výdeje stravy na oddělení s vysokým stupněm zabezpečení agresivní vězeň ozbrojený improvizovaným bodcem (zaostřený kartáček) napadne vychovatele a vezme ho jako rukojmí. Drží mu zbraň pod krkem a dožaduje se klíčů od katru a přistavení vozidla.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Prvotní reakce dozorce na oddělení',
        description: 'Jste první na místě (dozorce z vedlejšího traktu). Jak zareagujete na tuto kritickou situaci?',
        choices: [
          {
            id: 'c1-1',
            text: 'Ihned vytáhnete obušek, rozběhnete se na vězně a pokusíte se mu bodec vytrhnout.',
            isCorrect: false,
            feedback: 'FATÁLNÍ CHYBA: Přímý útok na ozbrojeného pachatele, který drží rukojmí, s největší pravděpodobností povede ke smrtelnému zranění rukojmího (vychovatele).',
            legalBasis: 'Zásady taktického zásahu a krizové vyjednávání'
          },
          {
            id: 'c1-2',
            text: 'Ustoupíte do bezpečné vzdálenosti, zablokujete/uzamknete únikovou cestu z daného sektoru, okamžitě stisknete tísňový hlásič (nebo nahlásíte do vysílačky kód pro vzetí rukojmí), navážete s pachatelem vizuální a uklidňující verbální kontakt (deeskalace) a vyčkáte na příjezd zásahové jednotky.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Prioritou je zabránit šíření incidentu (izolace perimetru), vyrozumět velení (přivolání specialistů - vyjednavačů, ZJ) a pokusit se situaci verbálně zmrazit (nekřičet, nevyhrožovat).',
            legalBasis: 'Metodika krizového vyjednávání a NGŘ č. 16/2022',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Chování během krizového vyjednávání',
        description: 'Na místo dorazil VISS s vyjednavačem. Vězeň je stále extrémně rozrušený. Co uděláte s klíči od hlavních dveří, které máte u sebe?',
        choices: [
          {
            id: 'c2-1',
            text: 'Pokud pachatel křičí, že vychovatele zabije, ihned mu své klíče hodíte a otevřete hlavní katr k východu.',
            isCorrect: false,
            feedback: 'HRUBÁ CHYBA: Zásadní pravidlo vězeňské bezpečnosti zní, že klíče od střeženého prostoru se NIKDY nesmí vydat vězňům, a to ani pod hrozbou násilí či smrti. Vydání klíčů by ohrozilo celou věznici a neochránilo rukojmí.',
            legalBasis: 'Zásady bezpečnosti VS ČR'
          },
          {
            id: 'c2-2',
            text: 'Klíče nevydáte. Předáte řízení situace vyjednavači a VISS a nadále pouze plníte jejich pokyny (např. zabezpečení vnějšího okruhu, odsunutí ostatních vězňů z dohledu).',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Řízení přebírá krizový manažer/vyjednavač. Klíče se nesmí za žádných okolností vydat. Váš úkol se mění na podpůrný a zajišťovací.',
            legalBasis: 'Směrnice pro řešení krizových situací (Rukojmí)'
          }
        ]
      }
    ]
  }
];
