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
            text: 'Poučit ženu, že balík může nechat u vrátnice pro pozdější předání po schválení VISS, dítě se švagrem však vpustit dovnitř do čekárny bez zápisu do žádanky, „aby na ně nepršelo“.',
            isCorrect: false,
            feedback: 'CHYBA: Strážný nesmí svévolně obcházet pravidla pro vstupy osob ani provádět neschválenou úschovu balíků. Všechny osoby vstupující do věznice musí být řádně evidovány v návštěvním systému (žádance) se souhlasem VISS.',
            legalBasis: '§ 80 NGŘ č. 33/2019 a Řád výkonu vazby'
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
            text: 'Zůstat v bezpečí strážního stanoviště za neprůstřelným sklem, zachovat klid, vyzvat osobu slovy „Jménem zákona“ k opuštění vstupního koše a prostřednictvím VISS přivolat hlídku PČR k vyvedení z veřejné části.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Strážní stanoviště zůstává bezpečně uzamčeno a neopouští se bez zajištění. Před užitím donucovacích opatření musí předcházet zákonná výzva slovy „Jménem zákona“ (§ 6 odst. 3 písm. b). Nelze-li situaci s civilní osobou zvládnout vlastními silami bez opuštění stanoviště, vyžaduje se součinnost Policie ČR (§ 24 odst. 2).',
            legalBasis: '§ 6 odst. 3 písm. b) a § 24 odst. 2 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c2-2',
            text: 'Otevřít dveře stanoviště, vyběhnout ven a použít proti ženě obušek a slzotvorný prostředek.',
            isCorrect: false,
            feedback: 'CHYBA: Nepřiměřený zásah (porušení zásady proporcionality a subsidiarity dle § 6 odst. 2 a § 17 odst. 3 zákona). Navíc je zakázáno svévolně opouštět a otevírat stanoviště bez zajištění dalším příslušníkem.',
            legalBasis: '§ 6 odst. 2 a § 17 odst. 3 zákona č. 555/1992 Sb.'
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
            legalBasis: '§ 3 odst. 8 zákona č. 555/1992 Sb. (postavení pověřeného orgánu) a NGŘ č. 24/2022 (umístění na celu se zesílenými STP)'
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
            feedback: 'HRUBÁ CHYBA: Použití střelné zbraně je přípustné jen pro taxativně vymezené účely (§ 18 odst. 1), což přelet dronu nezakládá. Střelba do vzduchu nad dvorem by navíc hrubě porušila povinnost dbát nutné opatrnosti a neohrozit životy osob (§ 18 odst. 4).',
            legalBasis: '§ 18 odst. 1 písm. a) až e) a § 18 odst. 4 zákona č. 555/1992 Sb.'
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
            id: 'c2-1',
            text: 'Vezmete balíček, nožem jej okamžitě rozříznete a obsah vysypete na stůl.',
            isCorrect: false,
            feedback: 'CHYBA: Riziko výbušného systému, biologického materiálu nebo nebezpečných chemikálií (fentanyl).',
            legalBasis: 'Zásady pyrotechnické a chemické bezpečnosti'
          },
          {
            id: 'c2-2',
            text: 'Uzavřít prostor, za pomoci technických prostředků (detektor kovů / RTG / psovod) vyloučit přítomnost nástražného výbušného systému, v ochranných rukavicích balíček zadokumentovat, zajistit a vyrozumět Policii ČR.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Bezpečné zajištění podezřelého předmětu s ochranou stop (DNA, otisky prstů) pro další vyšetřování Policií ČR bez rizika výbušného, biologického či chemického ohrožení.',
            legalBasis: '§ 12 zákona č. 555/1992 Sb., § 78–79 trestního řádu a interní směrnice VS ČR'
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
    badge: '§ 16 zák. 169/1999 Sb. & Řád VTOS',
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
            feedback: 'SPRÁVNĚ: Zákon č. 169/1999 Sb. (§ 16 odst. 1 a 6) a Řád výkonu trestu stanoví právo na zdravotní péči a povinnost lékařského dohledu a monitorace zdravotního stavu hladovkáře.',
            legalBasis: '§ 16 odst. 1 a 6 zákona č. 169/1999 Sb. a vyhláška č. 345/1999 Sb. (Řád VTOS)',
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
            text: 'Umístit odsouzeného do samovazby bez přístupu k pitné vodě.',
            isCorrect: false,
            feedback: 'ZÁKAZ: Odsouzený musí mít nepřetržitý přístup k pitné vodě! Takový postup je hrubě nezákonný a představuje nelidské a ponižující zacházení v rozporu s mezinárodními standardy.',
            legalBasis: '§ 16 zákona č. 169/1999 Sb. a čl. 3 Evropské úmluvy o lidských právech'
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
            legalBasis: 'Směrnice pro řešení krizových situací (Rukojmí)',
            nextStepId: 'step-3'
          }
        ]
      },
      {
        id: 'step-3',
        title: 'Krok 3: Vyústění vyjednávání a taktické zajištění rukojmího',
        description: 'Vyjednavači se podařilo pachatele částečně uklidnit. Pachatel souhlasí s odložením bodce a propuštěním rukojmího pod podmínkou osobního jednání s ředitelem věznice. Pachatel odhodil zbraň na zem a ustoupil. Jaký je správný postup v této fázi?',
        choices: [
          {
            id: 'c3-1',
            text: 'Jako dozorce okamžitě vběhnete do místnosti a sám se pokusíte vězně povalit a spoutat, abyste incident ukončil co nejrychleji.',
            isCorrect: false,
            feedback: 'CHYBA: Narušení plánu vyjednávání a taktického postupu. Zajištění pachatele a evakuaci rukojmího provádí určený zásahový tým (ZJ) dle pokynů velitele zásahu, nikoli neorganizovaně jednotlivý dozorce.',
            legalBasis: 'Taktika služebních zákroků & NGŘ č. 16/2022'
          },
          {
            id: 'c3-2',
            text: 'Ponecháte realizaci zákroku a bezpečné převzetí pachatele na připravené zásahové jednotce pod velením VISS. Po zajištění pachatele pomůžete s evakuací zraněného rukojmího a zajištěním lékařského ošetření.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Velení zákroku a taktické zajištění odzbrojeného pachatele provádí specialisté ZJ. Vaší prioritou je okamžitá péče o propuštěného rukojmího a zajištění poskytnutí první pomoci a lékařského ošetření.',
            legalBasis: '§ 20 zákona č. 555/1992 Sb. a NGŘ č. 16/2022'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-13',
    title: 'Modelová situace 13: Eskorta – pokus o útěk při zastávce eskortního vozidla',
    category: 'Eskorty & Střelba',
    badge: '§ 15 & § 18 zák. č. 555/1992 Sb.',
    difficulty: 'Expertní',
    briefing: 'Jste členem dvoučlenné eskorty vezoucí odsouzeného zařazeného do věznice s ostrahou (kategorie rizika: útěkový sklon) k soudnímu jednání. Na frekventované silnici mimo obec dojde k technické závadě vozidla. Při kontrolním výstupu z vozidla se odsouzený náhle vytrhne z úchopu, přeskočí svodidla a běží směrem k lesnímu porostu cca 80 m od vozovky. V dohledu se nenacházejí žádné třetí osoby.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Prvotní reakce a zahájení pronásledování',
        description: 'Odsouzený prchá přes příkop k lesnímu porostu. Jaký je bezprostřední postup zasahujícího příslušníka?',
        choices: [
          {
            id: 'c1-1',
            text: 'Okamžitě bez výzvy vystřelit ze služební zbraně na prchajícího odsouzeného.',
            isCorrect: false,
            feedback: 'HRUBÁ CHYBA: Před použitím střelné zbraně k zamezení útěku dle § 18 odst. 1 písm. c) musí zásadně předcházet výzva a výstraha (§ 18 odst. 3). Výjimka platí pouze při bezprostředním ohrožení života nebo zdraví, které zde nenastalo.',
            legalBasis: '§ 18 odst. 1 písm. c) a odst. 3 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c1-2',
            text: 'Bezprostředně zahájit pronásledování, hlasitě vyzvat slovy „Jménem zákona, stůj!“ s výstrahou, že bude použito zbraně. Druhý člen eskorty zajišťuje vozidlo a přivolává posilu/PČR vysílačkou.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Příslušník má zákonnou povinnost bezprostředního pronásledování (§ 15). Před použitím zbraně je nezbytná zákonná výzva a výstraha (§ 18 odst. 3). Zároveň je zajištěno eskortní vozidlo a relace na operační středisko.',
            legalBasis: '§ 15 a § 18 odst. 1 písm. c), odst. 3 zákona č. 555/1992 Sb.',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-3',
            text: 'Útěk neřešit pronásledováním, vrátit se do vozidla a událost nahlásit až po návratu do kmenové věznice.',
            isCorrect: false,
            feedback: 'ZÁVAŽNÉ PORUŠENÍ POVINNOSTI: Příslušník je povinen prchajícího bezprostředně pronásledovat a učinit vše pro jeho zadržení. Zanedbání zakládá kázeňskou i trestní odpovědnost.',
            legalBasis: '§ 15 zákona č. 555/1992 Sb. a zákon č. 361/2003 Sb.'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Odsouzený na výzvu nereaguje a hrozí jeho zmizení v lese',
        description: 'Odsouzený ignoruje opakovanou výzvu i výstrahu, zrychluje a vbíhá do okraje lesa. Vzdálenost činí cca 60 metrů, mírnější donucovací prostředky (hmaty, chvaty, slzotvorný prostředek) nelze použít. Třetí osoby nejsou ohroženy.',
        choices: [
          {
            id: 'c2-1',
            text: 'Jelikož nelze útěk odvrátit mírnějšími prostředky a výzva byla marná, použít střelnou zbraň s maximální mírou šetrnosti k životu a zdraví (mířený výstřel na dolní končetiny) a bez ohrožení nezúčastněných osob.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Použití střelné zbraně k zamezení útěku při eskortě (§ 18 odst. 1 písm. c) je přípustné jako krajní prostředek, nelze-li osobu zadržet jinak, za dodržení nutné opatrnosti (§ 18 odst. 4).',
            legalBasis: '§ 18 odst. 1 písm. c) a odst. 4 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c2-2',
            text: 'Pronásledování okamžitě vzdát, protože odsouzený je již příliš daleko a střelba je při eskortách vždy absolutně zakázána.',
            isCorrect: false,
            feedback: 'CHYBA: Střelba k zamezení útěku při eskortě není absolutně zakázána – zákon ji výslovně upravuje v § 18 odst. 1 písm. c) při splnění zákonných podmínek subsidiarity.',
            legalBasis: '§ 18 odst. 1 písm. c) zákona č. 555/1992 Sb.'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-14',
    title: 'Modelová situace 14: Postupná korupční příprava (grooming) nového příslušníka',
    category: 'Právo & Donucovací prostředky',
    badge: 'Protikorupční program VS ČR & NGŘ č. 28/2018 Sb.',
    difficulty: 'Pokročilá',
    briefing: 'Jste tři týdny po nástupu do samostatné služby na ubytovně odsouzených. Jeden z odsouzených vám opakovaně nabízí drobné laskavosti – upozorňuje vás „v zájmu klidu“ na dění mezi ostatními, chválí vás před nadřízeným za „lidský přístup“ a zanechá vám na stole kávu. Po dvou týdnech takového jednání vás osloví: „Pane dozorce, jste tu jediný rozumný chlap. Mohl byste mi jen na dvě minuty půjčit mobil, abych napsal nemocné mámě? Hned ho vrátím, nikdo se to nedozví.“',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Rozpoznání manipulace v rané fázi budování neformálního vztahu',
        description: 'Jak reagovat na počáteční nabízení drobných pozorností, neformálních informací a kávy ze strany odsouzeného?',
        choices: [
          {
            id: 'c1-1',
            text: 'Laskavosti a kávu přijmout s tím, že jde o projev dobrých vztahů a informace od odsouzeného pomohou k udržení pořádku.',
            isCorrect: false,
            feedback: 'CHYBA: Příslušník nesmí přijímat od vězněných osob žádné dary, výhody ani pozornosti. Budování pocitu neformálního závazku je typickou první fází korupčního nátlaku (groomingu).',
            legalBasis: 'Kodex profesní etiky VS ČR a NGŘ č. 28/2018 Sb.'
          },
          {
            id: 'c1-2',
            text: 'Zdvořile, ale nekompromisně odmítnout jakékoliv dary a pozornosti, udržovat striktně profesionální odstup a o opakovaném nestandardním chování vězně preventivně informovat velitele oddělení.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Udržení profesních hranic a okamžité preventivní hlášení nadřízenému eliminuje riziko vydírání či prohlubování manipulace již v zárodku.',
            legalBasis: 'Katalog korupčních rizik (příloha NGŘ č. 28/2018 Sb.) a Kodex profesní etiky VS ČR',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Přímá žádost o nedovolenou službu (zapůjčení mobilního telefonu)',
        description: 'Odsouzený nyní přechází k přímé žádosti o krátké zapůjčení osobního telefonu pro kontakt s rodinou. Jak postupovat?',
        choices: [
          {
            id: 'c2-1',
            text: 'Telefon pod dohledem na minutu zapůjčit, protože jde o nemocnou matku a nehrozí žádné bezpečnostní riziko.',
            isCorrect: false,
            feedback: 'HRUBÁ CHYBA: Půjčení telefonu odsouzenému je závažným bezpečnostním incidentem a porušením služebních povinností. Vězeň tím získává kompromitující materiál a páku k dalšímu vydírání.',
            legalBasis: 'Zákon č. 555/1992 Sb., zákon č. 169/1999 Sb. a zákon č. 361/2003 Sb.'
          },
          {
            id: 'c2-2',
            text: 'Žádost věcně a klidně odmítnout, poučit odsouzeného o možnosti legálního telefonování dle Řádu VTOS, sepsat úřední záznam o incidentu a předat jej nadřízenému a OPaS.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Jednoznačné odmítnutí nedovoleného požadavku, odkázání na legální komunikační kanály a písemné zadokumentování události pro ochranu sboru i samotného příslušníka.',
            legalBasis: '§ 6 zákona č. 555/1992 Sb., Řád výkonu trestu a NGŘ č. 28/2018 Sb.'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-15',
    title: 'Modelová situace 15: Pasivní rezistence při plánované prohlídce cely',
    category: 'Mimořádné události & Zásah',
    badge: '§ 6 & § 17 zák. č. 555/1992 Sb.',
    difficulty: 'Pokročilá',
    briefing: 'Během plánované technické prohlídky ubytovny odmítá jeden z odsouzených opustit celu. Sedne si na podlahu uprostřed místnosti, založí ruce na prsou a odmítá se pohnout. Nejeví známky fyzické agresivity, nekřičí, na výzvy však reaguje mlčením.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Gradace a zákonná výzva před použitím donucovacích prostředků',
        description: 'Odsouzený sedí na zemi v pasivním odporu. Jaký je správný postup zasahujících příslušníků v souladu se zásadou subsidiarity?',
        choices: [
          {
            id: 'c1-1',
            text: 'Okamžitě použít teleskopický obušek a slzotvorný prostředek k rychlému zjednání poslušnosti.',
            isCorrect: false,
            feedback: 'CHYBA: Použití úderného či chemického prostředku proti pasivně sedící osobě je nepřiměřené (exces z intenzity i volby prostředku). Donucovací prostředky se volí od nejmírnějších a pouze po předchozí výzvě.',
            legalBasis: '§ 6 odst. 2 a § 17 odst. 3 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c1-2',
            text: 'Zajistit prostor minimálně dvěma příslušníky, důrazně odsouzeného vyzvat jménem zákona k opuštění cely a upozornit ho, že při neuposlechnutí budou použity donucovací prostředky (hmaty a chvaty).',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Zásada dvojic, zákonná výzva slovy „Jménem zákona“ a výstraha před použitím konkrétního donucovacího prostředku dle § 6 odst. 3 a § 17 odst. 3 zákona.',
            legalBasis: '§ 6 odst. 3 a § 17 odst. 3 zákona č. 555/1992 Sb.',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-3',
            text: 'Nechat odsouzeného sedět na zemi a prohlídku cely zrušit, aby nevznikl zbytečný konflikt.',
            isCorrect: false,
            feedback: 'CHYBA: Rezignace na výkon služby a neprovedení bezpečnostní prohlídky je nepřípustné zanedbání povinností dozorce.',
            legalBasis: '§ 6 zákona č. 555/1992 Sb. a NGŘ č. 33/2019'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Realizace zákroku při přetrvávajícím pasivním odporu',
        description: 'Odsouzený ani po zákonné výzvě s výstrahou nevstává a nadále pasivně sedí na podlaze. Jaký způsob překonání odporu zvolíte?',
        choices: [
          {
            id: 'c2-1',
            text: 'Za využití hmatů a chvatů (zvedací a odváděcí páky) ve dvou příslušnících odsouzeného kontrolovaně zvednout, vyvést z cely do vyhrazeného prostoru a v případě potřeby přiložit pouta.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Volba mírnějšího donucovacího prostředku (hmaty a chvaty dle § 17 odst. 2 písm. a)), který postačuje k dosažení účelu sledovaného zákrokem, plně odpovídá zákonným mantinelům přiměřenosti.',
            legalBasis: '§ 6 odst. 2 a § 17 odst. 2 písm. a), odst. 3 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c2-2',
            text: 'Použít proti odsouzenému elektrický paralyzér (taser), aby se ušetřila fyzická námaha personálu.',
            isCorrect: false,
            feedback: 'HRUBÁ CHYBA: Použití taseru proti neagresivní, pasivně odporující osobě je hrubým porušením zásady subsidiarity a mezinárodních úmluv proti mučení a zlému zacházení (CPT).',
            legalBasis: '§ 17 odst. 3 zákona č. 555/1992 Sb. a Doporučení CPT'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-16',
    title: 'Modelová situace 16: Hromadné testování hranic a skupinová neposlušnost na oddíle',
    category: 'Mimořádné události & Zásah',
    badge: '§ 21 zák. č. 555/1992 Sb. & Zásah pod velením',
    difficulty: 'Expertní',
    briefing: 'Během ukončení vycházky na vycházkovém dvoře skupina 6 odsouzených demonstrativně ignoruje povel dozorce k návratu na oddíl. Odsouzení hlučně skandují, vulgárně pokřikují a začínají dozorce v kruhu obstupovat ve vzdálenosti cca 3 metrů. Fyzický útok zatím neprobíhá, situace však rychle eskaluje.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Taktická reakce osamoceného dozorce',
        description: 'Skupina 6 odsouzených vás obkličuje a odmítá uposlechnout povel. Jste na dvoře v této chvíli sám. Jak se zachováte?',
        choices: [
          {
            id: 'c1-1',
            text: 'Vytáhnete obušek a sám se vrhnete na nejhlasitějšího odsouzeného s cílem ho okamžitě zpacifikovat a ukázat autoritu.',
            isCorrect: false,
            feedback: 'FATÁLNÍ TAKTICKÁ CHYBA: Osamocený fyzický útok proti přesile 6 osob vede k odzbrojení dozorce, jeho těžkému zranění nebo vzetí jako rukojmí. Příslušník nikdy nesmí riskovat ztrátu kontroly a donucovacích prostředků.',
            legalBasis: 'Zásady taktiky zákroku a bezpečnostní metodika VS ČR'
          },
          {
            id: 'c1-2',
            text: 'Udržíte bezpečnou distanci, ustoupíte zády ke krytému vstupu/zdi, okamžitě rádiem/hlásičem vyhlásíte signál pomoci (kód pro skupinové narušení), situaci slovně uklidňujete zákonnou výzvou a vyčkáte na příjezd pořádkové jednotky/posil.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Udržení odstupu, krytí zad, okamžité přivolání posily a zabránění vzniku rukojmí. Izolace hrozby a vyčkání na organizovaný zákrok.',
            legalBasis: '§ 6 a § 24 zákona č. 555/1992 Sb. a NGŘ č. 16/2022',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Organizovaný zákrok pod jednotným velením',
        description: 'Na vycházkový dvůr dorazila pohotovostní jednotka pod velením velitele směny (VISS) s ochrannými štíty a služebním psem. Odsouzení nadále odmítají uposlechnout. Jak probíhá zákrok?',
        choices: [
          {
            id: 'c2-1',
            text: 'Každý dozorce si samostatně vybere jednoho vězně a na vlastní pěst použije slzotvorný sprej nebo obušek bez koordinace s velitelem.',
            isCorrect: false,
            feedback: 'CHYBA: Při hromadném zákroku je individuální neřízený postup přísně zakázán. Zákrok více příslušníků musí probíhat pod jednotným velením a o použití donucovacích prostředků rozhoduje velitel zákroku.',
            legalBasis: '§ 21 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c2-2',
            text: 'Zákrok probíhá výhradně pod jednotným velením VISS dle § 21 zákona č. 555/1992 Sb. Velitel vydá zákonnou výzvu s výstrahou, nařídí kordonový postup se štíty k rozdělení skupiny, nasazení donucovacích prostředků probíhá na jeho povel a odsouzení jsou postupně izolováni a spoutáni.',
            isCorrect: true,
            feedback: 'SPRÁVNĚ: Zákrok pod jednotným velením dle § 21 zákona č. 555/1992 Sb. zajišťuje koordinaci, přiměřenost a bezpečnost. O použití DP rozhoduje velitel zákroku, který nese odpovědnost za jeho zákonné provedení.',
            legalBasis: '§ 21 zákona č. 555/1992 Sb. (Zákrok pod jednotným velením)'
          }
        ]
      }
    ]
  }
];
