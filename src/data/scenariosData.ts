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
  category: 'Právo, etika & Donucovací prostředky' | 'Mimořádné události & Zásah' | 'Eskorty & Střelba' | 'Ostraha, vstupy & Justiční stráž';
  badge: string;
  difficulty: 'Základní' | 'Pokročilá' | 'Expertní';
  briefing: string;
  steps: ScenarioStep[];
}

export const tacticalScenarios: Scenario[] = [
  {
    id: 'sc-01',
    title: 'Modelová situace 1: Podnapilá návštěva, děti a nepovolený balík na vchodu',
    category: 'Ostraha, vstupy & Justiční stráž',
    badge: 'NGŘ č. 33/2019 & § 80',
    difficulty: 'Pokročilá',
    briefing: 'Konáte službu strážného u hlavního vchodu do věznice. Ke vchodu se dostavila žena (manželka obviněného), která přivedla bratra a 5letého syna (neuvedeného na žádance) a s sebou má balík s potravinami o hmotnosti 5,5 kg. Ze ženy je navíc cítit alkohol.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Posouzení způsobilosti ke vstupu a kontrola osob',
        description: 'Žena jeví zjevné známky požití alkoholu, na žádance není uvedeno dítě a hmotnost balíku překračuje limit. Jak budete jednat?',
        choices: [
          {
            id: 'c1-1',
            text: 'Ženu i se synem vpustit, balík převzít a VISS jen upozornit, že je z návštěvnice cítit alkohol.',
            isCorrect: false,
            feedback: 'Upozornění VISS nenahrazuje rozhodnutí o nevpuštění. Strážnému je výslovně zakázáno vpustit do věznice zjevně podnapilé osoby a osoby mladší 15 let bez řádného povolení; balíček s potravinami navíc převyšuje zákonný limit 5 kg.',
            legalBasis: '§ 80 odst. 3 písm. e) NGŘ č. 33/2019; § 16 odst. 2 zákona č. 293/1993 Sb.'
          },
          {
            id: 'c1-3',
            text: 'Ženu nevpustit, syna pustit na návštěvu s bratrem a balík převzít, ať o jeho vydání rozhodne vychovatel.',
            isCorrect: false,
            feedback: 'Syn není uveden v žádance, proto ho nelze vpustit ani s jiným doprovodem. Hmotnostní limit 5 kg pro balíček s potravinami stanoví zákon – o jeho překročení nerozhoduje dodatečně vychovatel, balík se u vchodu nepřevezme.',
            legalBasis: '§ 80 NGŘ č. 33/2019; § 16 odst. 2 zákona č. 293/1993 Sb.'
          },
          {
            id: 'c1-2',
            text: 'Slušně a rozhodně vstup nepovolit, vysvětlit důvody, balík nad 5 kg nepřevzít a vyrozumět VISS.',
            isCorrect: true,
            feedback: 'Správně. Jednáte slušně, taktně, ale rozhodně: podnapilá osoba nesmí do střeženého objektu, osoby neuvedené v žádance nelze vpustit a balíček s potravinami a věcmi osobní potřeby nesmí přesáhnout 5 kg. Důvody nevpuštění návštěvě vysvětlíte a o situaci neprodleně vyrozumíte VISS.',
            legalBasis: '§ 80 NGŘ č. 33/2019; § 16 odst. 2 zákona č. 293/1993 Sb.',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Agresivní reakce návštěvy v prostoru vstupního koše',
        description: 'Žena začne hlasitě křičet: „Nebudu tady dělat striptýz, stěžovat si budu na generálním ředitelství!“ a odmítá opustit prostor vchodu.',
        choices: [
          {
            id: 'c2-2',
            text: 'Vyjít ze stanoviště a ženu z prostoru vstupního koše sám vyvést hmaty a chvaty, než se situace vyhrotí.',
            isCorrect: false,
            feedback: 'Stanoviště se bez zajištění dalším příslušníkem neotevírá. Žena slovně protestuje, ale nikoho neohrožuje – před jakýmkoli zákrokem je nutné použít výzvy „jménem zákona“ a vyvedení civilní osoby z veřejné části se řeší součinností s Policií ČR.',
            legalBasis: '§ 6 odst. 3 a § 17 zákona č. 555/1992 Sb.; § 80 NGŘ č. 33/2019'
          },
          {
            id: 'c2-1',
            text: 'Zůstat za sklem stanoviště, vyzvat ji jménem zákona k odchodu a přes VISS přivolat hlídku PČR.',
            isCorrect: true,
            feedback: 'Správně. Strážní stanoviště zůstává bezpečně uzamčeno, zachováte klid a osobu vyzvete jménem zákona k opuštění vstupního koše. Při neuposlechnutí výzvy k opuštění objektu civilní osobou se prostřednictvím VISS vyžaduje součinnost Policie ČR k vyvedení z veřejné části.',
            legalBasis: '§ 13 odst. 1 zákona č. 555/1992 Sb. a § 80 NGŘ č. 33/2019'
          },
          {
            id: 'c2-3',
            text: 'Její křik ignorovat, dokud neodejde sama, a nic nehlásit, protože vstup do věznice stejně nezískala.',
            isCorrect: false,
            feedback: 'Osoba, která ve vstupním prostoru neoprávněně setrvává a narušuje pořádek, nemůže být přehlížena. Příslušník je oprávněn proti ní zakročit – nejprve výzvou k odchodu – a událost hlásí VISS.',
            legalBasis: '§ 13 odst. 2 písm. b) zákona č. 555/1992 Sb.; § 80 NGŘ č. 33/2019'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-02',
    title: 'Modelová situace 2: Útěk vězně z ordinace civilního lékaře',
    category: 'Eskorty & Střelba',
    badge: 'Eskortní služba & § 18 z. 555/1992 Sb.',
    difficulty: 'Expertní',
    briefing: 'Jste velitel mimořádné zdravotní eskorty do nemocnice. Odsouzenému byla na pokyn lékaře sňata pouta kvůli vyšetření ruky. Po sejmutí pout odsouzený prudce odstrčí strážného a dá se na útěk chodbou polikliniky směrem k otevřenému východu.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Prvotní zákrok v prostoru nemocnice',
        description: 'Odsouzený běží chodbou, kde se nacházejí civilní pacienti. Jaký je váš postup jako velitele eskorty?',
        choices: [
          {
            id: 'c1-2',
            text: 'Bezprostředně pronásledovat s výzvou „Jménem zákona stůj!“, zadržet hmaty a chvaty a spoutat.',
            isCorrect: true,
            feedback: 'Správně. Příslušník je povinen prchající osobu bezprostředně pronásledovat. Po zákonné výzvě ji zpacifikujete hmaty a chvaty, povalíte na zem a přiložíte pouta, zatímco strážný řidič zablokuje východ – bez ohrožení okolních pacientů.',
            legalBasis: '§ 15 a § 17 zákona č. 555/1992 Sb. a NGŘ č. 33/2019',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-1',
            text: 'Po výzvě s výstrahou vystřelit, protože jde o útěk při eskortě podle § 18 odst. 1 písm. c) zákona.',
            isCorrect: false,
            feedback: 'Chyba. Důvod podle písm. c) platí jen pro útěk, který nelze zadržet jiným způsobem, a střelná zbraň je přípustná, jen jsou-li donucovací prostředky zřejmě neúčinné. Na chodbě plné civilních pacientů by střelba navíc porušila povinnost dbát nutné opatrnosti a neohrozit život jiných osob.',
            legalBasis: '§ 18 odst. 1 písm. c), odst. 2 a 4 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c1-3',
            text: 'Nepronásledovat, zůstat se strážným u ordinace a útěk ihned hlásit operačnímu středisku a PČR.',
            isCorrect: false,
            feedback: 'Hlášení je nutné, ale pronásledování nenahrazuje. Pokud tomu nebrání jiné důležité okolnosti, je příslušník povinen prchající osobu bezprostředně pronásledovat a činit nezbytná opatření k jejímu zadržení.',
            legalBasis: '§ 15 zákona č. 555/1992 Sb.'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Hlášení a administrativní dořešení mimořádné události',
        description: 'Odsouzený byl zpacifikován a spoután. Jaké kroky bezodkladně následují?',
        choices: [
          {
            id: 'c2-2',
            text: 'Dokončit vyšetření a pokus o útěk nahlásit až po návratu do věznice, když byl odsouzený zadržen.',
            isCorrect: false,
            feedback: 'Pokus o útěk je závažnou mimořádnou událostí dle § 5 písm. a) NGŘ č. 16/2022 a hlásí se na operační středisko okamžitě, ne až po návratu. Zatajení nebo oddálení hlášení je porušením služebních povinností.',
            legalBasis: 'NGŘ č. 16/2022 § 5; zákon č. 361/2003 Sb.'
          },
          {
            id: 'c2-3',
            text: 'Vyrozumět OS, ale použití hmatů, chvatů a pout nadřízenému neoznamovat, šlo o běžné spoutání.',
            isCorrect: false,
            feedback: 'Každé použití donucovacího prostředku je příslušník povinen bezodkladně oznámit nadřízenému. Výjimka se týká jen pout použitých při předvádění za podmínek § 17 odst. 4 a 5, ne hmatů, chvatů a pout při zadržení prchajícího.',
            legalBasis: '§ 20 odst. 2 a 3 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c2-1',
            text: 'Ihned vyrozumět OS kmenové věznice a VISS, ošetření dokončit za zpřísněných opatření a sepsat záznamy.',
            isCorrect: true,
            feedback: 'Správně. Pokus o útěk je závažnou mimořádnou událostí dle § 5 písm. a) NGŘ č. 16/2022. Okamžitě telefonicky vyrozumíte operační středisko kmenové věznice, informujete VISS, lékařské ošetření dokončíte za zpřísněných bezpečnostních opatření (DP2/DP3) a po návratu sepíšete záznam o použití DP a hlášení k mimořádné události.',
            legalBasis: 'NGŘ č. 16/2022 § 5 a Metodický list č. 5/2014; § 20 zákona č. 555/1992 Sb.'
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
            text: 'Prohlídku ostatních cel dokončit, obviněné zatím vrátit na celu pod zvýšeným dohledem a VISS informovat potom.',
            isCorrect: false,
            feedback: 'Příprava k útěku je závažnou bezpečnostní událostí. Obvinění se na kompromitovanou celu nevracejí a VISS se informuje ihned – odkladem získávají čas dokončit řez nebo ukrýt nástroje.',
            legalBasis: '§ 92 a § 94 NGŘ č. 33/2019'
          },
          {
            id: 'c1-2',
            text: 'Ihned hlásit VISS a OS, obviněné na celu nevpustit a provést jejich důkladnou osobní prohlídku.',
            isCorrect: true,
            feedback: 'Správně. Rádiem neprodleně informujete VISS a operační středisko, zabráníte návratu obviněných na kompromitovanou celu a důkladnou osobní prohlídkou obou obviněných ověříte, zda u sebe nemají řezné nástroje (pilky na kov).',
            legalBasis: '§ 92 a § 94 NGŘ č. 33/2019',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-3',
            text: 'Řez nejdřív sám očistit od chlebové pasty a změřit, aby šlo VISS nahlásit přesný rozsah poškození.',
            isCorrect: false,
            feedback: 'Manipulací s mříží zničíte stopy potřebné k prošetření podezření z trestného činu a zdržíte hlášení. Rozsah poškození zdokumentují k tomu určené orgány.',
            legalBasis: '§ 92 NGŘ č. 33/2019; § 3 odst. 8 zákona č. 555/1992 Sb.'
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
            text: 'Věc předat pověřenému orgánu VS ČR, celu zapečetit a obviněné přemístit na celu se zesílenými STP.',
            isCorrect: true,
            feedback: 'Správně. Podezření z trestného činu maření výkonu úředního rozhodnutí prošetří pověřený orgán VS ČR, který má postavení policejního orgánu. Cela se zapečetí a obvinění se umístí na celu se zesílenými stavebně technickými prostředky (dvojitý okenní katr, armatura).',
            legalBasis: '§ 3 odst. 8 zákona č. 555/1992 Sb.; § 337 zákona č. 40/2009 Sb.; NGŘ č. 24/2022'
          },
          {
            id: 'c2-2',
            text: 'Mříž nechat ještě dnes opravit údržbou a obviněné vrátit na stejnou celu, jakmile bude oprava hotová.',
            isCorrect: false,
            feedback: 'Opravou se zničí stopy pro prošetření a obvinění, kteří útěk připravovali, zůstávají rizikoví. Umísťují se na celu se zesílenými stavebně technickými prostředky.',
            legalBasis: '§ 3 odst. 8 zákona č. 555/1992 Sb.; NGŘ č. 24/2022'
          },
          {
            id: 'c2-3',
            text: 'Věc vyřídit jen kázeňsky, protože k útěku nedošlo, a obviněné ponechat na cele pod zvýšeným dohledem.',
            isCorrect: false,
            feedback: 'Příprava útěku z vazby zakládá podezření z trestného činu, které prošetřuje pověřený orgán VS ČR – kázeňské řízení to nenahrazuje. Stavebně narušená cela navíc dál umožňuje dokonání útěku.',
            legalBasis: '§ 3 odst. 8 zákona č. 555/1992 Sb.; § 337 zákona č. 40/2009 Sb.'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-04',
    title: 'Modelová situace 4: Sebevražedný pokus oběšením na cele',
    category: 'Mimořádné události & Zásah',
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
            text: 'Sám bez hlášení odemknout celu, vběhnout dovnitř a začít odřezávat tělo, každá sekunda rozhoduje.',
            isCorrect: false,
            feedback: 'Pomoc se přivolává vždy ihned – bez hlášení nikdo neví, že jste na cele. Situace může být fingovaná s cílem napadení (spoluvězeň nereaguje), proto se do cely vstupuje za dodržení zásad bezpečnosti, pokud možno se zajištěním dalším příslušníkem.',
            legalBasis: '§ 3 písm. l) NGŘ č. 2/2026'
          },
          {
            id: 'c1-3',
            text: 'Přivolat posilu a VISS, ale celu neotevírat a tělo nechat viset do příchodu lékaře kvůli stopám.',
            isCorrect: false,
            feedback: 'Záchrana života má přednost před zajištěním stop. Smrt může konstatovat jen lékař – do té doby se obviněný vyprošťuje a resuscituje.',
            legalBasis: 'Traumatologický plán VS ČR & NGŘ č. 16/2022'
          },
          {
            id: 'c1-2',
            text: 'Přivolat rádiem posilu a VISS, vstoupit se zajištěním, odříznout škrtidlo a zahájit KPR 30:2.',
            isCorrect: true,
            feedback: 'Správně. Stisknete tísňové tlačítko nebo rádiem přivoláte další hlídku a VISS a do cely vstoupíte za dodržení zásad bezpečnosti se zajištěním dalším příslušníkem. Tělo nadzvednete k uvolnění tlaku na krk, záchranářským nožem odříznete škrtidlo, položíte na pevnou podložku a zahájíte kardiopulmonální resuscitaci (30:2).',
            legalBasis: '§ 3 písm. l) NGŘ č. 2/2026; Traumatologický plán VS ČR & NGŘ č. 16/2022',
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
            id: 'c2-2',
            text: 'Jako závažnou mimořádnou událost podle § 5 NGŘ č. 16/2022, kterou věznice hlásí jen generálnímu řediteli.',
            isCorrect: false,
            feedback: 'Úmrtí vězněné osoby není závažnou, ale ostatní mimořádnou událostí podle § 6 písm. b) NGŘ č. 16/2022 a hlásí se stálé službě GŘ a dozorovému státnímu zástupci.',
            legalBasis: '§ 6 písm. b) NGŘ č. 16/2022'
          },
          {
            id: 'c2-1',
            text: 'Jako ostatní MU podle § 6 písm. b) NGŘ č. 16/2022, hlášenou stálé službě GŘ a dozorovému státnímu zástupci.',
            isCorrect: true,
            feedback: 'Správně. Úmrtí je ostatní mimořádnou událostí podle § 6 písm. b). Věznice neprodleně telefonicky informuje stálou službu GŘ VS ČR a dozorového státního zástupce, místo zajistí pro PČR a do 3 pracovních dnů zašle písemnou zprávu v ETŘ. Vyrozumět dozorového státního zástupce o úmrtí obviněného ukládá věznici bez odkladu i zákon.',
            legalBasis: 'NGŘ č. 16/2022 § 6 písm. b), § 7 a § 9; § 20 odst. 6 písm. a) zákona č. 293/1993 Sb.'
          },
          {
            id: 'c2-3',
            text: 'Jako pokus o sebevraždu podle § 6 písm. a) NGŘ č. 16/2022, protože smrt nastala až během resuscitace.',
            isCorrect: false,
            feedback: 'Jakmile lékař konstatuje smrt, jde o úmrtí vězněné osoby podle § 6 písm. b). Písmeno a) se týká pokusu o sebevraždu a sebepoškození, kdy vězněná osoba přežije.',
            legalBasis: '§ 6 písm. a) a b) NGŘ č. 16/2022'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-05',
    title: 'Modelová situace 5: Noční neohlášená kontrola z Generálního ředitelství',
    category: 'Ostraha, vstupy & Justiční stráž',
    badge: 'NGŘ č. 33/2019 & § 54, 80',
    difficulty: 'Pokročilá',
    briefing: 'Konáte službu strážného u hlavního vchodu. Ve 22:15 hod. se ke vchodu dostaví muž v civilním oděvu, prokáže se služebním průkazem se žlutým pruhem a uvede, že je ředitel odboru VaJS GŘ VS ČR. Požaduje okamžitý vstup na vaše stanoviště bez přítomnosti VISS a chce zkontrolovat nabití vaší zbraně.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Kontrola průkazu a oprávnění ke vstupu',
        description: 'Jak posoudíte předložený doklad a požadavky kontrolujícího?',
        choices: [
          {
            id: 'c1-1',
            text: 'Ředitele odboru pustit na stanoviště i bez VISS, jde o nadřízeného s kontrolním oprávněním; zbraň mu nepředat.',
            isCorrect: false,
            feedback: 'Zbraň správně nepředáváte – strážný NESMÍ NIKOMU VYDAT SVOJI ZBRAŇ, ani nadřízenému. Na strážní stanoviště však bez VISS nesmí vstoupit ani kontrolující; kontrolu výkonu služby umožníte jen v přítomnosti službukonajícího VISS.',
            legalBasis: '§ 32 odst. 3 a § 80 odst. 3 písm. f) NGŘ č. 33/2019'
          },
          {
            id: 'c1-3',
            text: 'Vstup do objektu nepovolit, dokud se kontrolující nedostaví v pracovní době s písemným pověřením.',
            isCorrect: false,
            feedback: 'Průkaz se žlutým pruhem ředitele odboru GŘ VS ČR opravňuje ke vstupu do střeženého objektu bez prohlídky zavazadla i mimo pracovní dobu. Omezení se týká jen vstupu na samotné stanoviště bez VISS.',
            legalBasis: '§ 54 a § 80 odst. 2 písm. c) NGŘ č. 33/2019'
          },
          {
            id: 'c1-2',
            text: 'Ověřit průkaz, vstup do objektu povolit bez prohlídky zavazadla, na stanoviště jen s VISS a zbraň nepředat.',
            isCorrect: true,
            feedback: 'Správně. Ověříte platnost průkazu (žlutý pruh = ředitel odboru GŘ VS ČR) a podle § 80 odst. 2 písm. c) neprovádíte prohlídku jeho zavazadla. Vstup do střeženého objektu povolíte, avšak vstup na strážní stanoviště a kontrolu výkonu služby umožníte POUZE v přítomnosti službukonajícího VISS, kterého ihned vyrozumíte. Zbraň se nikdy nepředává z ruky do ruky.',
            legalBasis: '§ 54, § 80 a § 32 NGŘ č. 33/2019'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-06',
    title: 'Modelová situace 6: Přeprava peněžních zásilek Justiční stráží',
    category: 'Ostraha, vstupy & Justiční stráž',
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
            text: 'Tašku nese druhý příslušník JS, pokladní jde mezi oběma příslušníky a velitel přepravy jistí zezadu.',
            isCorrect: false,
            feedback: 'Chyba. Platí striktní zásada: zavazadlo s finanční hotovostí nese VÝHRADNĚ pracovník soudu, NIKDY příslušník justiční stráže.',
            legalBasis: '§ 144 odst. 6 NGŘ č. 33/2019; Instrukce MS č. 8/2022'
          },
          {
            id: 'c1-2',
            text: 'Tašku nese pokladní, druhý příslušník jde vedle ní s taškou mezi nimi, velitel přepravy jistí zezadu.',
            isCorrect: true,
            feedback: 'Správně. Zavazadlo nese výhradně pracovnice soudu. Druhý příslušník JS jde vedle zajišťované osoby tak, aby taška byla mezi ním a pracovnicí. Velitel přepravy provádí zajišťování a krytí zezadu s přehledem o okolí a stálým spojením na služebnu JS.',
            legalBasis: '§ 144 odst. 5 a 6 NGŘ č. 33/2019'
          },
          {
            id: 'c1-3',
            text: 'Tašku nese pokladní, oba příslušníci JS jdou před ní a razí cestu davem, velitel drží spojení se služebnou.',
            isCorrect: false,
            feedback: 'Nesení tašky je správně, rozestavení ne. Jeden příslušník jde po boku pracovnice tak, aby taška byla mezi nimi, a velitel přepravy jistí zezadu s přehledem o okolí – zepředu nikdo nevidí, co se děje za pokladní.',
            legalBasis: '§ 144 odst. 5 NGŘ č. 33/2019'
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
            text: 'Po výzvě vystřelit na dron, protože jde o útok ohrožující střežený objekt podle § 18 odst. 1 písm. d).',
            isCorrect: false,
            feedback: 'Chyba. I kdyby šlo o útok na střežený objekt, střelba na pohyblivý cíl nad dvorem s 20 odsouzenými je vyloučena: hrozí dopad střel mimo areál věznice, zásah vězňů nebo civilních osob. Příslušník je povinen dbát nutné opatrnosti, aby neohrozil život a zdraví jiných osob.',
            legalBasis: '§ 18 odst. 1 a 4 zákona č. 555/1992 Sb.'
          },
          {
            id: 'c1-2',
            text: 'Rádiem vyhlásit poplach VISS, popsat dron, nechat vyklidit dvůr a sledovat místo dopadu zásilky.',
            isCorrect: true,
            feedback: 'Správně. Okamžitě vyhlásíte poplach, popíšete směr příletu a výšku dronu, dozorci vyklidí vycházkový dvůr a uzamknou vězně do ubytovny a vy sledujete místo dopadu zásilky. Prioritou je izolace prostoru a zabránění převzetí balíčku odsouzenými bez nebezpečné střelby.',
            legalBasis: 'Metodický pokyn VS ČR pro zásah proti bezpilotním prostředkům (UAV)',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-3',
            text: 'Dron sledovat až do jeho odletu, aby šlo určit polohu pilota, a VISS vše nahlásit najednou potom.',
            isCorrect: false,
            feedback: 'Prodlevou v hlášení dáte odsouzeným čas balíček převzít a ukrýt. Poplach se vyhlašuje okamžitě; určení polohy pilota je až druhotný úkol.',
            legalBasis: 'Metodický pokyn VS ČR pro zásah proti bezpilotním prostředkům (UAV)'
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
            text: 'Balíček v rukavicích hned na místě opatrně otevřít, aby se zjistil obsah a nic se z něj neztratilo.',
            isCorrect: false,
            feedback: 'Neznámý balíček může obsahovat nástražný výbušný systém, biologický materiál nebo nebezpečné chemikálie (fentanyl). Otevřením se navíc zničí kriminalistické stopy.',
            legalBasis: 'Zásady pyrotechnické a chemické bezpečnosti'
          },
          {
            id: 'c2-3',
            text: 'Balíček odnést na strážnici do trezoru a Policii ČR vyrozumět jen tehdy, pokud se v něm najdou drogy.',
            isCorrect: false,
            feedback: 'S neznámým předmětem se nemanipuluje, dokud se nevyloučí nástražný výbušný systém. O nálezu se vyrozumívá Policie ČR bez ohledu na předpokládaný obsah.',
            legalBasis: 'Trestní řád a směrnice pro nález nepovolených předmětů VS ČR'
          },
          {
            id: 'c1-4',
            text: 'Uzavřít prostor, vyloučit výbušninu, balíček v rukavicích zadokumentovat, zajistit a vyrozumět PČR.',
            isCorrect: true,
            feedback: 'Správně. Uzavřete prostor, technickými prostředky (detektor kovů / RTG / psovod) vyloučíte nástražný výbušný systém a balíček v ochranných rukavicích zadokumentujete a zajistíte. Chráníte tak kriminalistické stopy (DNA, otisky prstů) pro vyšetřování Policií ČR.',
            legalBasis: 'Trestní řád a směrnice pro nález nepovolených předmětů VS ČR'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-08',
    title: 'Modelová situace 8: Pokus o korupci a nabídka úplatku za pronesení mobilu',
    category: 'Právo, etika & Donucovací prostředky',
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
            id: 'c1-2',
            text: 'Nabídku přejít vtipem a dál se s odsouzeným bavit, aby nepojal podezření, že věc oznámíte.',
            isCorrect: false,
            feedback: 'Pokračováním neformální komunikace dáváte najevo, že jste k nabídce otevřený. Příslušník se musí zdržet jednání, které může ohrozit důvěru v nestranný výkon služby – nabídku je nutné jednoznačně odmítnout.',
            legalBasis: '§ 45 odst. 1 písm. b) zákona č. 361/2003 Sb.; Kodex profesní etiky VS ČR'
          },
          {
            id: 'c1-3',
            text: 'Odsouzenému říct, že si to rozmyslíte, a nabídku nechat otevřenou, než se poradíte s VISS.',
            isCorrect: false,
            feedback: 'Chyba. Kdo si v souvislosti s obstaráváním věcí obecného zájmu úplatek „dá slíbit“, naplňuje znaky přijetí úplatku – nemusí ho ani převzít. Nabídka se odmítá hned; oznámení nadřízenému následuje až potom.',
            legalBasis: '§ 331 odst. 1 zákona č. 40/2009 Sb., trestní zákoník'
          },
          {
            id: 'c1-1',
            text: 'Nabídku jednoznačně odmítnout, zachovat profesionální odstup a do další diskuze se nepouštět.',
            isCorrect: true,
            feedback: 'Správně. Nabídku důrazně odmítnete, zachováte chladný profesionální odstup, nevstupujete do další diskuze a nepřijímáte žádné kompromisy. Neformální komunikaci tím okamžitě ukončíte v souladu s Kodexem etiky.',
            legalBasis: 'Kodex profesní etiky VS ČR a NGŘ č. 28/2018',
            nextStepId: 'step-2'
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
            text: 'Sepsat úřední záznam, informovat VISS a věc postoupit k prověření pro podezření z podplácení.',
            isCorrect: true,
            feedback: 'Správně. Neprodleně sepíšete podrobný úřední záznam, informujete velitele směny (VISS) a podnět se postoupí Oddělení prevence a stížností (OPaS) / GIBS pro podezření z trestného činu podplacení. Oznamovací povinnost příslušníka je klíčovou součástí protikorupčního programu VS ČR.',
            legalBasis: '§ 332 zákona č. 40/2009 Sb. a interní protikorupční program VS ČR'
          },
          {
            id: 'c2-2',
            text: 'Nic nesepisovat, odsouzenému jen udělit domluvu a dál sledovat, zda nabídku zopakuje.',
            isCorrect: false,
            feedback: 'Nabídka úplatku je podezřením z trestného činu podplacení, který trestní zákoník výslovně řadí mezi činy, jejichž neoznámení je samo trestné. Domluva ani vyčkávání oznámení nenahrazují.',
            legalBasis: '§ 332 a § 368 zákona č. 40/2009 Sb.'
          },
          {
            id: 'c2-3',
            text: 'Varovat jen kolegy na oddělení, ať jsou ostražití, a oficiálně to hlásit, až nabídku zopakuje.',
            isCorrect: false,
            feedback: 'Neformální varování kolegů nenahrazuje oficiální hlášení. Podplacení patří mezi trestné činy, jejichž neoznámení je trestné, a opakování nabídky se nečeká.',
            legalBasis: '§ 368 zákona č. 40/2009 Sb.; zákon č. 361/2003 Sb., o služebním poměru'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-09',
    title: 'Modelová situace 9: Hladovka a odmítání stravy odsouzeným',
    category: 'Mimořádné události & Zásah',
    badge: '§ 23 vyhl. č. 345/1999 Sb. & § 26 z. č. 169/1999 Sb.',
    difficulty: 'Základní',
    briefing: 'Odsouzený na oddělení se zvýšenou ostrahou odmítne třetí den po sobě převzít stravu (snídani, oběd i večeři). Tvrdí, že drží protestní hladovku kvůli zamítnutí přeřazení do mírnějšího typu věznice.',
    steps: [
      {
        id: 'step-1',
        title: 'Krok 1: Postup dozorce při odmítnutí stravy',
        description: 'Jak postupuje službukonající personál při opakovaném odmítání stravy vězněm?',
        choices: [
          {
            id: 'c1-3',
            text: 'Odmítnutí jen zapisovat do knihy a lékaře i státního zástupce vyrozumět, až odmítání potrvá 5 dní.',
            isCorrect: false,
            feedback: 'Lékař a dozorový státní zástupce se o odmítání stravy vyrozumívají neprodleně. Pětidenní hranice ze zákona o výkonu trestu je důvodem, pro který věznice vždy bez odkladu vyrozumí státního zástupce – neznamená, že se do té doby čeká.',
            legalBasis: '§ 23 odst. 4 vyhlášky č. 345/1999 Sb.; § 26 odst. 3 písm. i) zákona č. 169/1999 Sb.'
          },
          {
            id: 'c1-1',
            text: 'Každé odmítnutí stravy zaznamenat a neprodleně vyrozumět lékaře, psychologa a velitele oddílu.',
            isCorrect: true,
            feedback: 'Správně. Každé odmítnutí stravy přesně zaznamenáte do stravovací knihy a ETŘ, nevydanou stravu odeberete a neprodleně uvědomíte vězeňského lékaře, psychologa a velitele oddílu. O odmítání stravy musí být neprodleně vyrozuměn lékař, který zdravotní stav odsouzeného soustavně kontroluje a rozhoduje o způsobu dohledu, a státní zástupce vykonávající dozor nad výkonem trestu.',
            legalBasis: '§ 23 odst. 4 vyhlášky č. 345/1999 Sb.; § 26 odst. 3 písm. i) zákona č. 169/1999 Sb.',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-2',
            text: 'Stravu odsouzenému s pomocí kolegů vnutit, aby se jeho zdravotní stav dál nezhoršoval.',
            isCorrect: false,
            feedback: 'Dozorce nemá žádné oprávnění stravu vnutit. Násilné krmení by bylo zásahem do práv překračujícím míru nezbytnou k účelu služebního úkonu a zakázaným nelidským zacházením. O způsobu dohledu nad zdravotním stavem odsouzeného rozhoduje lékař.',
            legalBasis: '§ 6 odst. 2 zákona č. 555/1992 Sb.; § 23 odst. 4 vyhlášky č. 345/1999 Sb.; čl. 3 Úmluvy o ochraně lidských práv a základních svobod'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Zdravotní péče a poučení',
        description: 'Vězeňský lékař převezme odsouzeného do zdravotní péče. Jaká opatření následují?',
        choices: [
          {
            id: 'c2-2',
            text: 'Odsouzenému uložit samovazbu, dokud hladovku neukončí, aby ostatní vězni nebrali protest jako vzor.',
            isCorrect: false,
            feedback: 'Kázeňský trest není nástrojem k vynucení ukončení hladovky. Lze ho uložit jen za kázeňský přestupek po náležitém objasnění okolností a jen na dobu, kterou stanoví zákon (samovazba nejvýše 20 dnů) – nikoli „do odvolání“.',
            legalBasis: '§ 46 odst. 1 a 3 a § 47 odst. 1 zákona č. 169/1999 Sb.'
          },
          {
            id: 'c2-3',
            text: 'Péči nechat na dozorcích oddělení; lékař odsouzeného vyšetří, až se jeho stav zjevně zhorší.',
            isCorrect: false,
            feedback: 'Zdravotní stav odsouzeného, který odmítá stravu, soustavně kontroluje lékař a rozhoduje o způsobu dohledu – nečeká se na zjevné zhoršení.',
            legalBasis: '§ 23 odst. 4 vyhlášky č. 345/1999 Sb.'
          },
          {
            id: 'c2-1',
            text: 'Pravidelně kontrolovat vitální funkce, poučit o riziku poškození zdraví s podpisem a nabídnout psychologa.',
            isCorrect: true,
            feedback: 'Správně. Lékař pravidelně kontroluje vitální funkce (tlak, glykémie, hmotnost), odsouzeného poučí o nevratném poškození zdraví s podpisem do zdravotní dokumentace a nabídne se psychologická intervence. Jde o standardní penitenciární a zdravotnický postup péče o hladovkáře.',
            legalBasis: '§ 23 odst. 4 vyhlášky č. 345/1999 Sb.; Metodika zdravotnické služby VS ČR'
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
            id: 'c1-2',
            text: 'Celu otevřít hned bez dýchacího přístroje, jen s mokrým ručníkem přes ústa, a odsouzené vytáhnout.',
            isCorrect: false,
            feedback: 'Mokrý ručník před zplodinami hoření nechrání – bez dýchacího přístroje hrozí otrava oxidem uhelnatým (CO) během desítek sekund. Náhlý přísun kyslíku otevřením dveří navíc může způsobit backdraft a nechráněný záchranář upadne do bezvědomí.',
            legalBasis: 'Taktika hašení požárů HZS ČR; Požární poplachová směrnice VS ČR & BOZP'
          },
          {
            id: 'c1-3',
            text: 'Vyhlásit poplach a celu nechat zavřenou až do příjezdu HZS, protože zásah uvnitř je jen jejich úkol.',
            isCorrect: false,
            feedback: 'Odsouzení se v cele dusí a příjezd HZS může trvat příliš dlouho. Vystrojení příslušníci s dýchacím přístrojem zahajují záchranu osob ve dvojici ihned, jakmile jsou připraveni.',
            legalBasis: 'Požární poplachová směrnice VS ČR & BOZP'
          },
          {
            id: 'c1-1',
            text: 'Vyhlásit požární poplach, přivolat HZS a VISS, nasadit dýchací přístroj a počkat na druhého příslušníka.',
            isCorrect: true,
            feedback: 'Správně. Ihned vyhlásíte požární poplach (tlačítko EPS + radiostanice), přivoláte HZS a velitele směny, nasadíte autonomní dýchací přístroj a vyčkáte na druhého vystrojeného příslušníka. Bez dýchacího přístroje hrozí otrava CO; vstup do požáru se provádí vždy ve dvojici.',
            legalBasis: 'Požární poplachová směrnice VS ČR & BOZP',
            nextStepId: 'step-2'
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
            text: 'Hasicím přístrojem srazit plameny, odsouzené vyvést do nezakouřeného úseku, zajistit je a dát první pomoc.',
            isCorrect: true,
            feedback: 'Správně. Práškovým nebo sněhovým hasicím přístrojem srazíte plameny, vyvedete odsouzené do nezakouřeného úseku, zajistíte bezpečnost (pouta dle situace), poskytnete první pomoc při nadýchání kouřem (poloha v polosedě, kyslík) a předáte je ZZS.',
            legalBasis: 'Traumatologický plán VS ČR & § 16 NGŘ č. 16/2022'
          },
          {
            id: 'c2-2',
            text: 'Nejprve celu úplně dohasit a odsouzené vyvést až potom, aby oheň nepřeskočil na chodbu ubytovny.',
            isCorrect: false,
            feedback: 'Záchrana lidských životů má vždy absolutní prioritu před hašením majetku. Plameny se jen srazí tak, aby šlo osoby bezpečně vyvést.',
            legalBasis: 'Zákon o požární ochraně a instrukce VS ČR'
          },
          {
            id: 'c2-3',
            text: 'Odsouzené vyvést, hned je spoutané přemístit na jinou celu a první pomoc ponechat až na posádce ZZS.',
            isCorrect: false,
            feedback: 'Nadýchání kouřem vyžaduje okamžitou první pomoc (poloha v polosedě, kyslík) – čekání na ZZS ohrožuje život. Pouta se použijí jen podle situace, nikoli automaticky.',
            legalBasis: 'Traumatologický plán VS ČR & § 16 NGŘ č. 16/2022'
          }
        ]
      }
    ]
  },
  {
    id: 'sc-11',
    title: 'Modelová situace 11: Zadržení osoby s návykovou látkou na návštěvě',
    category: 'Ostraha, vstupy & Justiční stráž',
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
            id: 'c1-2',
            text: 'Zabránit osobě v odchodu podle § 76 odst. 2 TrŘ, sáčku se nedotýkat holýma rukama a přivolat PČR.',
            isCorrect: true,
            feedback: 'Správně. Osobní svobodu osoby přistižené při trestném činu smí omezit kdokoli, je-li to nutné k zamezení útěku nebo k zajištění důkazů; je však povinen ji ihned předat policejnímu orgánu. Sáček zajistíte v rukavicích, informujete velitele směny a přivoláte Policii ČR k převzetí osoby i důkazu.',
            legalBasis: '§ 76 odst. 2 trestního řádu',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-1',
            text: 'Osobu nechat odejít, protože civilistu smí zadržet jen policie, a sáček předat Policii ČR dodatečně.',
            isCorrect: false,
            feedback: 'Omyl. Osobu přistiženou při trestném činu nebo bezprostředně poté smí omezit na osobní svobodě kdokoli, je-li to nutné k zamezení útěku nebo k zajištění důkazů. Nález OPL zakládá podezření z trestného činu podle § 283 TZ.',
            legalBasis: '§ 76 odst. 2 trestního řádu; § 283 TZ'
          },
          {
            id: 'c1-3',
            text: 'Osobu zadržet a do příjezdu PČR ji sám vyslechnout a sepsat s ní protokol o původu nalezené látky.',
            isCorrect: false,
            feedback: 'Výslech a protokol o zadržení provádí policejní orgán. Strážný osobu jen omezí na svobodě a ihned ji předá Policii ČR; vlastním výslechem by mohl znehodnotit důkazy.',
            legalBasis: '§ 76 odst. 2 a 3 trestního řádu'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Administrativní opatření a hlášení',
        description: 'Policie osobu převzala. Co učiníte na úrovni věznice?',
        choices: [
          {
            id: 'c2-2',
            text: 'Událost dál nehlásit, protože ji převzala Policie ČR a odsouzený drogu nakonec nedostal.',
            isCorrect: false,
            feedback: 'Jakýkoli nález a zásah PČR je mimořádnou událostí, která musí být zaznamenána a hlášena vedení věznice (příp. GŘ).',
            legalBasis: 'NGŘ č. 16/2022'
          },
          {
            id: 'c2-3',
            text: 'Sepsat záznam a zrušit návštěvu, odsouzeného ale neprověřovat, protože o látce nemusel vědět.',
            isCorrect: false,
            feedback: 'Záznam je správně, ale cílový odsouzený je ihned považován za rizikového pro možnou držbu či distribuci OPL – navrhuje se mimořádná prohlídka a případně test na OPL.',
            legalBasis: 'NGŘ č. 33/2019 a Řád výkonu trestu'
          },
          {
            id: 'c2-1',
            text: 'Sepsat úřední záznam, zaevidovat událost v ETŘ a navrhnout mimořádnou prohlídku a test odsouzeného.',
            isCorrect: true,
            feedback: 'Správně. Zpracujete úřední záznam o incidentu, zaevidujete událost v ETŘ, navrhnete zrušení návštěvy a odsouzeného, k němuž návštěva směřovala, zavedete na mimořádnou prohlídku a případně test na OPL – je ihned považován za rizikového.',
            legalBasis: 'NGŘ č. 33/2019 a Řád výkonu trestu'
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
            id: 'c1-3',
            text: 'Přiblížit se k vězni a opakovanou výzvou jménem zákona ho přimět, aby rukojmí ihned pustil.',
            isCorrect: false,
            feedback: 'Přibližování a stupňovaný nátlak zvyšují riziko, že pachatel rukojmí zraní. Prioritou je izolace prostoru, přivolání specialistů a verbální zklidnění situace – nekřičet, nevyhrožovat.',
            legalBasis: 'Metodika krizového vyjednávání a NGŘ č. 16/2022'
          },
          {
            id: 'c1-2',
            text: 'Ustoupit, uzavřít únikovou cestu ze sektoru, vyhlásit poplach, deeskalovat a vyčkat na zásahovou jednotku.',
            isCorrect: true,
            feedback: 'Správně. Ustoupíte do bezpečné vzdálenosti, uzamknete únikovou cestu z daného sektoru, okamžitě stisknete tísňový hlásič (nebo nahlásíte kód pro vzetí rukojmí), navážete s pachatelem uklidňující verbální kontakt a vyčkáte na zásahovou jednotku. Zabráníte šíření incidentu a velení přivolá vyjednavače a ZJ.',
            legalBasis: 'Metodika krizového vyjednávání a NGŘ č. 16/2022',
            nextStepId: 'step-2'
          },
          {
            id: 'c1-1',
            text: 'Pokusit se vězně odzbrojit zezadu, dokud se soustředí na vychovatele a vás si nevšiml.',
            isCorrect: false,
            feedback: 'Závažná chyba: přímý útok na ozbrojeného pachatele, který drží rukojmí, s největší pravděpodobností povede ke smrtelnému zranění rukojmího (vychovatele). Zákrok je úkolem zásahové jednotky.',
            legalBasis: 'Zásady taktického zásahu a krizové vyjednávání'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Krok 2: Chování během krizového vyjednávání',
        description: 'Na místo dorazil VISS s vyjednavačem. Vězeň je stále extrémně rozrušený. Co uděláte s klíči od hlavních dveří, které máte u sebe?',
        choices: [
          {
            id: 'c2-2',
            text: 'Klíče nevydat, řízení situace předat vyjednavači a VISS a nadále plnit jen jejich pokyny.',
            isCorrect: true,
            feedback: 'Správně. Řízení přebírá krizový manažer/vyjednavač. Klíče se nesmí za žádných okolností vydat. Váš úkol se mění na podpůrný a zajišťovací (např. zabezpečení vnějšího okruhu, odsunutí ostatních vězňů z dohledu).',
            legalBasis: 'Směrnice pro řešení krizových situací (Rukojmí)'
          },
          {
            id: 'c2-1',
            text: 'Klíče vydat, ale nechat zamčený vnější katr, aby pachatel zůstal uvězněn v mezikatrovém prostoru.',
            isCorrect: false,
            feedback: 'Chyba: klíče od střeženého prostoru se NIKDY nesmí vydat vězňům, a to ani pod hrozbou násilí. Každý vydaný klíč rozšiřuje prostor, který pachatel ovládá, a neochrání rukojmí.',
            legalBasis: 'Zásady bezpečnosti VS ČR'
          },
          {
            id: 'c2-3',
            text: 'Vyjednávat s pachatelem sám a nabídnout mu klíče výměnou za propuštění vychovatele.',
            isCorrect: false,
            feedback: 'S pachatelem vyjednává jen určený vyjednavač a klíče nejsou předmětem vyjednávání. Souběžné nabídky dalších osob vyjednávání narušují.',
            legalBasis: 'Směrnice pro řešení krizových situací (Rukojmí)'
          }
        ]
      }
    ]
  },
  // Modelové situace 13–36 vycházejí z podkladu „ZOP A/2 2026 – Modelové situace a vzorové odpovědi“.
  {
    "id": "sc-13",
    "title": "Modelová situace 13: Výhrůžky odsouzeného po pohovoru",
    "category": "Právo, etika & Donucovací prostředky",
    "badge": "§ 6 a § 7 z. č. 555/1992 Sb. & § 28 z. č. 169/1999 Sb. & NGŘ 41/2024",
    "difficulty": "Základní",
    "briefing": "Jako dozorce jste přítomen pohovoru vychovatele s odsouzeným v jeho kanceláři. Po skončení pohovoru vyzvete odsouzeného, aby vstal ze židle a opustil kancelář. Příkaz musíte opakovat a odsouzený začne nadávat: „Co otravuješ, nech mě bejt, nebo se neudržím a všechno tady rozmlátím.“",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Reakce na výhrůžky",
        "description": "Odsouzený sedí, nadává vám a vyhrožuje, že vše rozmlátí. Vychovatel je v kanceláři s vámi. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Okamžitě ho chvatem zvednete ze židle a vyvedete z kanceláře",
            "isCorrect": false,
            "feedback": "Předčasné. Dovolují-li to okolnosti, musíte před zákrokem použít domluvy, výzvy nebo varování se slovy „jménem zákona“; donucovací prostředek přichází v úvahu až při neuposlechnutí.",
            "legalBasis": "§ 6 odst. 3 a § 17 zákona č. 555/1992 Sb."
          },
          {
            "id": "c1-2",
            "text": "Zachováte klid a vyzvete ho „jménem zákona“ k odchodu",
            "isCorrect": true,
            "feedback": "Správně. Jednáte vážně a rozhodně, nenecháte se strhnout k verbální agresi a výzvou se pokusíte dosáhnout účelu bez zákroku. Neuposlechnutí příkazu a výhrůžky zakládají povinnost zakročit podle § 7 odst. 1 písm. a).",
            "legalBasis": "§ 6 odst. 1 a 3 a § 7 odst. 1 zákona č. 555/1992 Sb.",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Odpovíte mu stejně ostrým tónem, ať ví, kdo tu velí",
            "isCorrect": false,
            "feedback": "Taktická chyba v komunikaci – opětování verbální agrese konflikt vystupňuje a intenzita agrese vězně může sílit. Příslušník má jednat vážně a rozhodně, ale bez urážek.",
            "legalBasis": "§ 6 odst. 1 zákona č. 555/1992 Sb.; učební text Psychologie pro ZOP"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Dokumentace události",
        "description": "Odsouzený po výzvě nakonec vstane a kancelář opustí; donucovací prostředky jste nepoužil. Opakované neuposlechnutí a výhrůžky je třeba řešit. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Vyřešíte to jen domluvou a zapíšete ji do VIS a do záznamového listu",
            "isCorrect": false,
            "feedback": "Domluva nepostačuje – odsouzený opakovaně neuposlechl příkaz a vyhrožoval. Zápis domluvy do VIS a jednotného záznamového listu je určen jen pro případy, kdy k nápravě domluva postačí.",
            "legalBasis": "§ 17 NGŘ č. 41/2024"
          },
          {
            "id": "c2-2",
            "text": "Sepíšete Záznam o použití donucovacího prostředku",
            "isCorrect": false,
            "feedback": "Tento záznam se sepisuje jen po použití donucovacího prostředku, k němuž v situaci nedošlo.",
            "legalBasis": "§ 20 zákona č. 555/1992 Sb.; PGŘ č. 03/2024"
          },
          {
            "id": "c2-3",
            "text": "Hlásíte IDS a sepíšete záznam o kázeňském přestupku",
            "isCorrect": true,
            "feedback": "Správně. Událost neprodleně hlásíte přímému nadřízenému (IDS) a sepíšete Záznam o kázeňském přestupku na tiskopisu podle přílohy č. 4 NGŘ č. 41/2024, zpravidla v den spáchání přestupku.",
            "legalBasis": "§ 16 a § 17 NGŘ č. 41/2024, příloha č. 4",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Popis skutku",
        "description": "Vyplňujete část „Popis skutku“ v záznamu o kázeňském přestupku. Co do ní musíte uvést?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Čas, místo, průběh s citací výroku, porušenou povinnost, svědky",
            "isCorrect": true,
            "feedback": "Správně. Popis skutku musí obsahovat přesný čas a místo, způsob a okolnosti, vylíčení průběhu s uvedením porušené povinnosti (zde § 28 odst. 1 zák. č. 169/1999 Sb.) a seznam svědků – zde vychovatele.",
            "legalBasis": "§ 16 odst. 3 NGŘ č. 41/2024; § 28 odst. 1 zákona č. 169/1999 Sb."
          },
          {
            "id": "c3-2",
            "text": "Své hodnocení povahy odsouzeného a návrh přiměřeného kázeňského trestu",
            "isCorrect": false,
            "feedback": "Záznam má být věcný. O trestu rozhoduje zaměstnanec s kázeňskou pravomocí, a to až po objasnění okolností a vyjádření odsouzeného.",
            "legalBasis": "§ 46 a § 51 zákona č. 169/1999 Sb.; § 18 NGŘ č. 41/2024"
          },
          {
            "id": "c3-3",
            "text": "Jen stručné shrnutí, výrok vynecháte, protože je vulgární",
            "isCorrect": false,
            "feedback": "Výrok odsouzeného je podstatou skutku, uvádí se přesně jako citace. Bez něj nelze posoudit, jakou povinnost porušil.",
            "legalBasis": "§ 16 odst. 3 NGŘ č. 41/2024"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-14",
    "title": "Modelová situace 14: Bezvědomí vězně při zdravotní eskortě",
    "category": "Eskorty & Střelba",
    "badge": "§ 41, § 43 a § 73 NGŘ 33/2019 & § 6 NGŘ 16/2022",
    "difficulty": "Pokročilá",
    "briefing": "Na základě rozhodnutí lékaře byla nařízena mimořádná eskorta do civilního zdravotnického zařízení. Jste velitelem eskorty, s vámi jede strážný eskorty a řidič. Během jízdy odsouzený náhle upadne do bezvědomí; do nemocnice zbývá přibližně 20 km.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: První reakce",
        "description": "Strážný hlásí, že eskortovaný v přepravním prostoru nereaguje. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Nařídíte zastavit na bezpečném místě a zajistit střežení",
            "isCorrect": true,
            "feedback": "Správně. Ohrožení života je vážným důvodem k zastavení vozidla. Před otevřením přepravního prostoru strážný zaujme postavení ke střežení – bezvědomí může být předstírané za účelem útěku nebo napadení.",
            "legalBasis": "§ 73 odst. 1 písm. l) a odst. 4 písm. a) NGŘ č. 33/2019",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-2",
            "text": "Necháte pokračovat do nemocnice co nejrychleji bez zastávky",
            "isCorrect": false,
            "feedback": "Nelze-li eskortovaného s ohledem na okamžitý stav bezpečně dopravit k poskytovateli zdravotních služeb, musí velitel eskorty neprodleně přivolat záchrannou službu; 20 km jízdy je v této situaci riziko.",
            "legalBasis": "§ 73 odst. 1 písm. n) NGŘ č. 33/2019"
          },
          {
            "id": "c1-3",
            "text": "Hned otevřete přepravní prostor a sami sejmete pouta",
            "isCorrect": false,
            "feedback": "Bez zajištění střežení riskujete útěk nebo napadení příslušníků. Donucovací prostředky se uvolňují jen v rozsahu nezbytném k první pomoci a až po zajištění bezpečnosti.",
            "legalBasis": "§ 73 odst. 1 písm. l) NGŘ č. 33/2019"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Stav eskortovaného",
        "description": "Vozidlo stojí mimo provoz se zapnutými výstražnými světly, strážný zaujal postavení. Eskortovaný nereaguje na oslovení ani dotyk. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Počkáte, zda se sám probere, a teprve pak rozhodnete o postupu",
            "isCorrect": false,
            "feedback": "Čekání ohrožuje život. Zjistíte stav, zahájíte první pomoc a neprodleně přivoláte záchrannou službu; nejeví-li eskortovaný známky života, je přivolání ZZS povinné vždy.",
            "legalBasis": "§ 73 odst. 1 písm. n) a o) NGŘ č. 33/2019"
          },
          {
            "id": "c2-2",
            "text": "Uvolníte pouta v nutném rozsahu, dáte první pomoc a voláte 155",
            "isCorrect": true,
            "feedback": "Správně. Zjistíte, zda reaguje a dýchá, uvolníte donucovací prostředky v nezbytném rozsahu, poskytnete první pomoc, přivoláte ZZS a neprodleně informujete operační středisko kmenové věznice. Jde o ostatní mimořádnou událost.",
            "legalBasis": "§ 41 odst. 10 a § 73 odst. 1 písm. n) a o) NGŘ č. 33/2019; § 6 písm. c) NGŘ č. 16/2022",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-3",
            "text": "Nejdřív voláte do věznice a s první pomocí čekáte na pokyn VISS",
            "isCorrect": false,
            "feedback": "Operační středisko informujete, ale přivolání záchranné služby nesmíte odkládat. Povinnost přivolat ZZS má velitel eskorty sám a neprodleně.",
            "legalBasis": "§ 73 odst. 1 písm. n) a o) NGŘ č. 33/2019"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Příjezd záchranné služby",
        "description": "Přijíždí posádka ZZS a lékař rozhodne o převozu do nemocnice. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Předáte vězně posádce ZZS a s eskortním vozidlem se vrátíte do věznice",
            "isCorrect": false,
            "feedback": "Eskorta eskortovaného doprovází a zdrží se v místě lékařského zákroku, dokud není zajištěno jeho střežení, které zajistí nejbližší věznice.",
            "legalBasis": "§ 41 odst. 11 NGŘ č. 33/2019"
          },
          {
            "id": "c3-2",
            "text": "Lékaři přečtete nahlas obsah zdravotní dokumentace",
            "isCorrect": false,
            "feedback": "Zdravotnická dokumentace se veze v zapečetěné obálce s nápisem „Otevře lékař“ a předává se neotevřená lékaři.",
            "legalBasis": "§ 43 NGŘ č. 33/2019; učební text Eskortní služba"
          },
          {
            "id": "c3-3",
            "text": "Předáte lékaři obálku, upozorníte na riziko a doprovázíte",
            "isCorrect": true,
            "feedback": "Správně. Předáte zapečetěnou zdravotnickou dokumentaci, informujete lékaře o nebezpečnosti vězněné osoby a eskorta ji doprovází až do zajištění střežení. Po návratu hlásíte událost a sepíšete služební záznam.",
            "legalBasis": "§ 41 odst. 11 a 12 a § 43 NGŘ č. 33/2019"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-15",
    "title": "Modelová situace 15: Návštěvnice odmítá osobní prohlídku",
    "category": "Ostraha, vstupy & Justiční stráž",
    "badge": "§ 13 z. č. 555/1992 Sb. & § 99–101 NGŘ 33/2019 & § 16 z. č. 293/1993 Sb.",
    "difficulty": "Pokročilá",
    "briefing": "Konáte službu u hlavního vchodu. Na návštěvu obviněného přichází jeho manželka se třemi dětmi ve věku 8 až 12 let a s balíkem oděvů o hmotnosti 7 kg. Při průchodu ženy detekčním rámem se ozve signál kovu. Žena uvádí, že má spodní prádlo s kovovými ozdobami.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Signál detekčního rámu",
        "description": "Detekční rám signalizuje kov na těle ženy. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Uvěříte vysvětlení a ženu vpustíte bez další kontroly",
            "isCorrect": false,
            "feedback": "Zvukový signál rámu je důvodným podezřením, že osoba má u sebe věc, kterou by mohla narušit výkon vazby. Příčinu musíte objasnit.",
            "legalBasis": "§ 99 odst. 2 NGŘ č. 33/2019"
          },
          {
            "id": "c1-2",
            "text": "Vyzvete ji k odložení kovů a dohledáte ručním detektorem",
            "isCorrect": true,
            "feedback": "Správně. Vyzvete k odložení kovových předmětů a opakovanému průchodu; při přetrvávající signalizaci provedete dohledání ručním detektorem – to není osobní prohlídka a nevyžaduje odkládání oděvu.",
            "legalBasis": "§ 101 odst. 3 NGŘ č. 33/2019; Metodika vstupu a vjezdu do objektu",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Hned jí nařídíte odložit oděv a osobní prohlídku provedete sami na místě",
            "isCorrect": false,
            "feedback": "O osobní prohlídce vstupující osoby rozhoduje VOVS, mimo pracovní dobu VISS, a provádí ji příslušnice stejného pohlaví v určené místnosti.",
            "legalBasis": "§ 99 NGŘ č. 33/2019"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Odmítnutí osobní prohlídky",
        "description": "Signalizace trvá. Navrhnete osobní prohlídku, ale žena ji odmítne slovy: „Nebudu tady nikomu dělat striptýz a budu si na vás stěžovat!“ Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Provedete prohlídku i proti její vůli kvůli podezření",
            "isCorrect": false,
            "feedback": "Vstupující osoba má právo osobní prohlídku odmítnout. Důsledkem odmítnutí je neumožnění vstupu, ne prohlídka proti její vůli.",
            "legalBasis": "§ 99 odst. 3 NGŘ č. 33/2019"
          },
          {
            "id": "c2-2",
            "text": "Poučíte ji o právu odmítnout a o tom, že nevstoupí",
            "isCorrect": true,
            "feedback": "Správně. Poučíte ji o právu prohlídku odmítnout a o důsledku – vstup jí ani dětem neumožníte. Na stížnost reagujete klidně a informujete VOVS, mimo pracovní dobu VISS.",
            "legalBasis": "§ 99 odst. 3 a § 101 odst. 1 a 6 NGŘ č. 33/2019",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-3",
            "text": "Vpustíte alespoň děti, aby návštěva nepropadla",
            "isCorrect": false,
            "feedback": "Osoby mladší 15 let nelze vpustit bez doprovodu osoby starší 18 let.",
            "legalBasis": "§ 80 odst. 3 písm. e) NGŘ č. 33/2019"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Balík s oděvy",
        "description": "Žena chce alespoň předat balík oděvů o hmotnosti 7 kg pro manžela. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Poučíte ji, že oděv lze poslat poštou či donést po dohodě",
            "isCorrect": true,
            "feedback": "Správně. Limit 5 kg se na oblečení k výměně nevztahuje, ale přímé předání je vázáno na návštěvu, která se nekoná. Výměnu lze uskutečnit poštou nebo individuální donáškou po dohodě se správou věznice. Poté sepíšete služební záznam o neumožnění vstupu – to je metodické doporučení pro doložení postupu, ne povinnost stanovená citovanými předpisy.",
            "legalBasis": "§ 16 odst. 2 a 3 zákona č. 293/1993 Sb.; § 30 odst. 4 a § 46 odst. 2 vyhlášky č. 109/1994 Sb.; služební záznam – metodické doporučení"
          },
          {
            "id": "c3-2",
            "text": "Balík odmítnete, protože překračuje limit 5 kg",
            "isCorrect": false,
            "feedback": "Hmotnostní limit 5 kg se nevztahuje na balíčky s oblečením zasílaným za účelem výměny; důvodem nepřevzetí je, že se návštěva neuskuteční.",
            "legalBasis": "§ 16 odst. 2 zákona č. 293/1993 Sb."
          },
          {
            "id": "c3-3",
            "text": "Balík převezmete a obviněnému ho předáte místo neuskutečněné návštěvy",
            "isCorrect": false,
            "feedback": "Každý balíček podléhá kontrole a přímé předání oděvu je možné jen při návštěvě, která se nekoná. Strážný u vchodu balík za návštěvu nepřebírá.",
            "legalBasis": "§ 16 odst. 3 zákona č. 293/1993 Sb.; § 46 odst. 2 vyhlášky č. 109/1994 Sb."
          }
        ]
      }
    ]
  },
  {
    "id": "sc-16",
    "title": "Modelová situace 16: Krvácející odsouzený v uzavřeném oddílu",
    "category": "Mimořádné události & Zásah",
    "badge": "§ 6 NGŘ č. 16/2022 & § 72 NGŘ č. 2/2026",
    "difficulty": "Pokročilá",
    "briefing": "Jako dozorce v uzavřeném oddílu provádíte kontrolu cel. Odsouzený, který vykonává kázeňský trest celodenního umístění do uzavřeného oddílu na 20 dní, leží na zemi v kaluži krve a silně krvácí z hluboké rány na předloktí. Na vaše slovní podněty nereaguje a je pravděpodobně v bezvědomí.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Prvotní reakce u celových dveří",
        "description": "Výdejním okénkem vidíte masivní krvácení a odsouzený nereaguje. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Okamžitě sám otevřu celu a vběhnu dovnitř, bez hlášení, protože každá sekunda rozhoduje.",
            "isCorrect": false,
            "feedback": "Situace může být předstíraná s cílem napadení nebo nátlaku; do cely se vstupuje za dodržení zásad bezpečnosti, pokud možno se zajištěním dalším příslušníkem, a pomoc se přivolává ihned.",
            "legalBasis": "§ 72 písm. h) NGŘ č. 2/2026"
          },
          {
            "id": "c1-2",
            "text": "Radiostanicí přivolám dalšího dozorce a IDS, informuji OS a požádám o lékaře a ZZS 155.",
            "isCorrect": true,
            "feedback": "Správně. Ihned přivoláte pomoc a lékaře i zdravotnickou záchrannou službu; do cely vstupujete za dodržení zásad bezpečnosti, ideálně se zajištěním.",
            "legalBasis": "§ 72 písm. h) NGŘ č. 2/2026; § 3 písm. l) NGŘ č. 2/2026; § 6 písm. a) NGŘ č. 16/2022",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Počkám na konec kontroly cel a událost zapíšu do knihy, lékař přijde při ranní vizitě.",
            "isCorrect": false,
            "feedback": "Sebepoškození s přímým ohrožením života je mimořádnou událostí a vyžaduje okamžité přivolání lékaře a pomoci.",
            "legalBasis": "§ 6 písm. a) NGŘ č. 16/2022"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Ošetření a zajištění předmětu",
        "description": "Do cely jste vstoupili se zajištěním, v cele není další odsouzený. Vedle odsouzeného leží ostrý předmět. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Předmět nechám ležet, abych nezničil stopy, a jen čekám na příchod lékaře.",
            "isCorrect": false,
            "feedback": "Předmět je nutné zajistit, aby jej odsouzený nemohl znovu použít; zároveň je třeba neprodleně zahájit první pomoc.",
            "legalBasis": "§ 12 zákona č. 555/1992 Sb."
          },
          {
            "id": "c2-2",
            "text": "Předmět hodím do koše na chodbě a odsouzeného posadím, aby se rychleji probral.",
            "isCorrect": false,
            "feedback": "Předmět se bere do úschovy jako důkazní prostředek, nevyhazuje se. Nezbytná je první pomoc a zástava krvácení.",
            "legalBasis": "§ 12 zákona č. 555/1992 Sb."
          },
          {
            "id": "c2-3",
            "text": "V rukavicích zastavím krvácení kapesním obvazem a předmět vezmu do úschovy.",
            "isCorrect": true,
            "feedback": "Správně. Dozorce je vystrojen kapesním obvazem; předmět se zajistí, aby jej nešlo znovu použít, a vezme se do úschovy jako důkazní prostředek.",
            "legalBasis": "§ 64 odst. 3 NGŘ č. 2/2026; § 12 zákona č. 555/1992 Sb.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Dořešení výkonu trestu a hlášení",
        "description": "Lékař rozhodl o převozu do nemocnice. Co platí pro výkon kázeňského trestu a hlášení?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Výkon trestu se po dobu pobytu mimo věznici přeruší, událost hlásím nadřízenému.",
            "isCorrect": true,
            "feedback": "Správně. Výkon se přeruší, stanoví-li tak lékař nebo po dobu přemístění mimo věznici; mimořádnou událost neprodleně hlásíte přímému nadřízenému a sepíšete služební záznam.",
            "legalBasis": "§ 66 odst. 1 vyhlášky č. 345/1999 Sb.; § 3 písm. c) NGŘ č. 16/2022"
          },
          {
            "id": "c3-2",
            "text": "Trest běží dál i během hospitalizace a o události se hlásí jen ústně při předání služby.",
            "isCorrect": false,
            "feedback": "Výkon trestu se po dobu přemístění mimo věznici přerušuje a mimořádná událost se hlásí neprodleně, nikoli až při předání služby.",
            "legalBasis": "§ 66 odst. 1 vyhlášky č. 345/1999 Sb."
          },
          {
            "id": "c3-3",
            "text": "Trest se ruší a odsouzený se po návratu vrací na ubytovnu bez dalšího opatření.",
            "isCorrect": false,
            "feedback": "Trest se nepřeruší zrušením; po stabilizaci se sepíše i záznam o kázeňském přestupku a informují se odborní zaměstnanci, zejména psycholog.",
            "legalBasis": "§ 28 odst. 3 písm. f) zákona č. 169/1999 Sb.; NGŘ č. 41/2024"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-17",
    "title": "Modelová situace 17: Úmrtí vězně v odkládací cele soudu",
    "category": "Eskorty & Střelba",
    "badge": "§ 73 NGŘ č. 33/2019 & § 6 NGŘ č. 16/2022",
    "difficulty": "Pokročilá",
    "briefing": "Jste velitelem eskorty k soudu. Při kontrole vězně v odkládací cele v budově soudu zjistíte, že leží na zemi a nejeví známky života. Poskytnete první pomoc a přivolaný lékař ZZS konstatuje smrt.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Postup po konstatování smrti",
        "description": "Lékař ZZS konstatoval smrt eskortovaného. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Tělo naložím do eskortního vozidla a odvezu je zpět do kmenové věznice k ohledání.",
            "isCorrect": false,
            "feedback": "Velitel eskorty přivolá Policii ČR a pohřební službu a převezme protokol o prohlídce zemřelého; tělo předává pohřební službě proti písemnému potvrzení.",
            "legalBasis": "§ 73 odst. 1 písm. o) NGŘ č. 33/2019"
          },
          {
            "id": "c1-2",
            "text": "Přivolám Policii ČR a pohřební službu, převezmu protokol o prohlídce zemřelého.",
            "isCorrect": true,
            "feedback": "Správně. Nepřivolal-li je již lékař, přivolá velitel eskorty Policii ČR a pohřební službu a převezme protokol o prohlídce zemřelého.",
            "legalBasis": "§ 73 odst. 1 písm. o) NGŘ č. 33/2019",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Oznámím to předsedovi senátu a eskortu ukončím, ostatní vyřeší justiční stráž.",
            "isCorrect": false,
            "feedback": "Povinnosti při úmrtí eskortovaného plní velitel eskorty; justiční stráž je partnerem pro spolupráci, ne náhradou jeho úkonů.",
            "legalBasis": "§ 73 odst. 1 písm. o) NGŘ č. 33/2019"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Předání těla, věcí a vyrozumění",
        "description": "Pohřební služba se dostavila. Co musíte dále zajistit?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Věci zemřelého rozdám ostatním eskortovaným a ředitele informuji až zítra.",
            "isCorrect": false,
            "feedback": "O odebrání osobních věcí zemřelého se vyhotovuje záznam a ředitel vysílající věznice se vyrozumívá ihned.",
            "legalBasis": "§ 73 odst. 1 písm. o) NGŘ č. 33/2019"
          },
          {
            "id": "c2-2",
            "text": "Tělo předám pohřební službě bez potvrzení, spis nechám u soudu a hlášení podám po návratu.",
            "isCorrect": false,
            "feedback": "Tělo se předává proti písemnému potvrzení, spis a věci se ponechávají v nejbližší věznici a ředitel se vyrozumívá ihned.",
            "legalBasis": "§ 41 odst. 13 NGŘ č. 33/2019"
          },
          {
            "id": "c2-3",
            "text": "Tělo předám proti potvrzení, spis a věci nejbližší věznici, ředitele vyrozumím ihned.",
            "isCorrect": true,
            "feedback": "Správně. Tělo se předá pohřební službě proti písemnému potvrzení, osobní spis a věci se předají nejbližší věznici a o úmrtí s příčinou se ihned vyrozumí ředitel vysílající věznice.",
            "legalBasis": "§ 41 odst. 13 a § 73 odst. 1 písm. o) NGŘ č. 33/2019",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Klasifikace a hlášení události",
        "description": "Jak je úmrtí vězněné osoby klasifikováno a komu jej věznice hlásí?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Jako závažnou MU, kterou ředitel hlásí výhradně ministrovi spravedlnosti.",
            "isCorrect": false,
            "feedback": "Úmrtí vězněné osoby není závažnou, ale ostatní mimořádnou událostí a hlásí se stálé službě GŘ a dozorovému státnímu zástupci.",
            "legalBasis": "§ 6 písm. b) NGŘ č. 16/2022"
          },
          {
            "id": "c3-2",
            "text": "Jako ostatní MU hlášenou stálé službě GŘ a dozorovému státnímu zástupci.",
            "isCorrect": true,
            "feedback": "Správně. Úmrtí je ostatní mimořádnou událostí podle § 6 písm. b); hlásí se neprodleně telefonicky stálé službě GŘ a dozorovému státnímu zástupci s údaji podle § 8.",
            "legalBasis": "§ 6 písm. b), § 7 a § 8 NGŘ č. 16/2022"
          },
          {
            "id": "c3-3",
            "text": "Nejde o mimořádnou událost, stačí záznam v Knize hlášení velitele eskorty.",
            "isCorrect": false,
            "feedback": "Úmrtí je mimořádnou událostí; záznam v Knize hlášení velitele eskorty a služební záznam hlášení nenahrazují.",
            "legalBasis": "§ 6 písm. b) NGŘ č. 16/2022"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-18",
    "title": "Modelová situace 18: Napadení eskorty na chodbě soudu",
    "category": "Eskorty & Střelba",
    "badge": "§ 17 a § 18 z. č. 555/1992 Sb. & § 5 NGŘ č. 16/2022",
    "difficulty": "Expertní",
    "briefing": "Jako velitel eskorty předvádíte obviněného chodbou soudní budovy do jednací síně. Skupina příbuzných a přátel obětí začne obviněného i příslušníky VS napadat nejprve verbálně a poté fyzicky (strkání, kopání, údery do zad a paží).",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Okamžitá reakce na napadení",
        "description": "Útočníci obklopují eskortu na chodbě. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Nařídím eskortě zůstat stát na chodbě a obviněného předám k ochraně justiční stráži soudu.",
            "isCorrect": false,
            "feedback": "Velitel eskorty je povinen zajistit, aby se eskorta co nejrychleji vzdálila z místa napadení, a obviněného střeží sama eskorta.",
            "legalBasis": "učební text Eskortní služba, s. 18"
          },
          {
            "id": "c1-2",
            "text": "Obviněného odvedu do nejbližšího uzamykatelného prostoru, eskorta jej semknutě střeží.",
            "isCorrect": true,
            "feedback": "Správně. Dovolí-li to okolnosti, eskorta se co nejrychleji vzdálí z místa napadení; není-li to možné, velitel zorganizuje obranu.",
            "legalBasis": "učební text Eskortní služba, s. 18; § 7 odst. 1 písm. d) zákona č. 555/1992 Sb.",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Ihned tasím služební zbraň a vystřelím varovně do stropu, aby dav ustoupil.",
            "isCorrect": false,
            "feedback": "Střelná zbraň je jen krajní prostředek za podmínek § 18 a v budově plné lidí hrozí ohrožení dalších osob; přednost mají přiměřené donucovací prostředky.",
            "legalBasis": "§ 17 odst. 3 a § 18 odst. 2 zákona č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Útočníci pokračují",
        "description": "Část útočníků pokračuje ve fyzickém útoku i u dveří místnosti. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Vyzvu je „jménem zákona“ s výstrahou a použiji přiměřené DP, vyžádám součinnost JS.",
            "isCorrect": true,
            "feedback": "Správně. Nejprve výzva se slovy „jménem zákona“ s výstrahou, pak přiměřené donucovací prostředky; justiční stráž je oprávněna zajišťovat pořádek v budově soudu a může povolat Policii ČR.",
            "legalBasis": "§ 6 odst. 3, § 17 a § 22 zákona č. 555/1992 Sb.",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-2",
            "text": "Bez jakékoli výzvy použiji obušek proti všem přítomným na chodbě, včetně přihlížejících osob.",
            "isCorrect": false,
            "feedback": "Před zákrokem je nutná výzva, nejde-li o zákrok nesnesoucí odkladu, a prostředky se používají jen proti osobám, které útočí, a přiměřeně.",
            "legalBasis": "§ 6 odst. 3 a § 17 odst. 3 zákona č. 555/1992 Sb."
          },
          {
            "id": "c2-3",
            "text": "Nezasahuji, protože napadení v budově soudu řeší výhradně justiční stráž.",
            "isCorrect": false,
            "feedback": "Velitel eskorty je povinen zakročit, je-li narušován pořádek nebo ohrožována bezpečnost v prostorách soudu a při předvádění.",
            "legalBasis": "§ 7 odst. 1 písm. d) zákona č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Po zvládnutí situace",
        "description": "Útočníci byli zadrženi. Co je nutné učinit?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Útočníky propustím, ať se situace neeskaluje, a hlášení podám zítra.",
            "isCorrect": false,
            "feedback": "Jednání útočníků vykazuje znaky trestného činu; předávají se Policii ČR a napadení eskorty se hlásí neprodleně.",
            "legalBasis": "§ 325 zákona č. 40/2009 Sb.; § 7 NGŘ č. 16/2022"
          },
          {
            "id": "c3-2",
            "text": "Záznam o použití DP nepíši, protože zákrok byl proti civilistům, ne vězňům.",
            "isCorrect": false,
            "feedback": "Každé použití donucovacího prostředku se bezodkladně oznamuje nadřízenému a sepisuje se o něm záznam bez ohledu na to, proti komu směřoval.",
            "legalBasis": "§ 20 zákona č. 555/1992 Sb."
          },
          {
            "id": "c3-3",
            "text": "Zkontroluji zdraví a DP, útočníky předám Policii ČR, hlásím závažnou MU.",
            "isCorrect": true,
            "feedback": "Správně. Kontrolujete neporušenost DP a zdravotní stav, zajistíte ošetření, útočníky předáte Policii ČR; napadení eskorty je závažnou mimořádnou událostí.",
            "legalBasis": "§ 20 zákona č. 555/1992 Sb.; § 5 písm. b) NGŘ č. 16/2022"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-19",
    "title": "Modelová situace 19: Opilý odsouzený na nestřeženém pracovišti",
    "category": "Právo, etika & Donucovací prostředky",
    "badge": "NGŘ č. 41/2024 & § 28 z. č. 169/1999 Sb.",
    "difficulty": "Základní",
    "briefing": "Při kontrole vnějšího nestřeženého pracoviště mimo věznici zpozorujete, že jeden odsouzený vrávorá. Na dotaz uvede, že mu je nevolno, a při rozmluvě z něj cítíte alkohol.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Ověření podezření",
        "description": "Máte podezření, že odsouzený požil alkohol. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Nechám ho pracovat dál a po návratu do věznice na to upozorním vychovatele.",
            "isCorrect": false,
            "feedback": "Požití alkoholu je porušením zákazu podle § 28 odst. 3 písm. b) a je nutné je ověřit a hlásit ihned, ne až po návratu.",
            "legalBasis": "§ 28 odst. 3 písm. b) zákona č. 169/1999 Sb."
          },
          {
            "id": "c1-2",
            "text": "Provedu dechovou zkoušku, při pozitivním výsledku opakovanou, a hlásím OS.",
            "isCorrect": true,
            "feedback": "Správně. Odsouzený je povinen podrobit se vyšetření na návykovou látku; pozitivní výsledek opakované dechové zkoušky je mimořádnou událostí hlášenou operačnímu středisku.",
            "legalBasis": "§ 28 odst. 2 písm. n) zákona č. 169/1999 Sb.; § 6 písm. f) NGŘ č. 16/2022",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Na místě mu uložím kázeňský trest pokuty a láhev s alkoholem vyliji.",
            "isCorrect": false,
            "feedback": "Dozorce kázeňskou pravomoc nemá a nalezenou věc je třeba odejmout se záznamem jako důkaz, nikoli ji zničit.",
            "legalBasis": "§ 16 NGŘ č. 41/2024; § 12 zákona č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Kázeňské řešení",
        "description": "Zkouška byla opakovaně pozitivní. Jak postupujete v kázeňské rovině?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Zpracuji záznam o kázeňském přestupku s důkazy a předám jej zaměstnanci s pravomocí.",
            "isCorrect": true,
            "feedback": "Správně. Záznam zpracovává kterýkoliv zaměstnanec, zpravidla v den přestupku, a v části Další důkazní prostředky přiloží výsledek dechové zkoušky, svědky či záznam o odnětí věci.",
            "legalBasis": "§ 16 odst. 1 až 4 NGŘ č. 41/2024"
          },
          {
            "id": "c2-2",
            "text": "Sám rozhodnu o umístění do uzavřeného oddílu a odsouzeného tam po návratu odvedu.",
            "isCorrect": false,
            "feedback": "Umístění do uzavřeného oddílu může uložit jen zaměstnanec s kázeňskou pravomocí (např. vychovatel až na 7 dnů), dozorce ji nemá.",
            "legalBasis": "příloha č. 1c NGŘ č. 41/2024"
          },
          {
            "id": "c2-3",
            "text": "Kázeňsky nic neřeším, protože k přestupku došlo mimo objekt věznice na pracovišti firmy.",
            "isCorrect": false,
            "feedback": "Povinnosti odsouzeného platí i na pracovišti mimo věznici; porušení se řeší záznamem o kázeňském přestupku.",
            "legalBasis": "§ 28 zákona č. 169/1999 Sb.; § 16 NGŘ č. 41/2024"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-20",
    "title": "Modelová situace 20: Svévolný odchod z nestřeženého pracoviště",
    "category": "Ostraha, vstupy & Justiční stráž",
    "badge": "§ 73 NGŘ č. 2/2026 & § 6 NGŘ č. 16/2022",
    "difficulty": "Pokročilá",
    "briefing": "Jste dozorcem na nestřeženém pracovišti mimo věznici v noční směně od 22:00 do 6:00 s 15 odsouzenými. Ve 2:30 vám jeden odsouzený oznámí, že jde na WC. Po asi 10 minutách stále není na svém pracovišti.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Zjištění nepřítomnosti",
        "description": "Odsouzený se nevrátil. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Opustím pracoviště a vydám se odsouzeného hledat po okolí, ostatní nechám pracovat.",
            "isCorrect": false,
            "feedback": "Dozorce pracoviště neopouští a zbývající odsouzené nenechává bez dozoru; pátrání organizuje vedení věznice a Policie ČR.",
            "legalBasis": "§ 73 odst. 1 NGŘ č. 2/2026"
          },
          {
            "id": "c1-2",
            "text": "Počkám do konce směny, zda se odsouzený nevrátí sám, a pak to nahlásím.",
            "isCorrect": false,
            "feedback": "Závažné skutečnosti se hlásí operačnímu středisku neprodleně, odkladem se ztrácí čas pro pátrání.",
            "legalBasis": "§ 73 odst. 1 písm. e) NGŘ č. 2/2026"
          },
          {
            "id": "c1-3",
            "text": "Prověřím WC a okolí, provedu početní prověrku ostatních a neprodleně hlásím OS.",
            "isCorrect": true,
            "feedback": "Správně. Prověříte toalety a okolí (úraz), shromáždíte zbývající odsouzené pod dohledem, provedete početní prověrku a neprodleně hlásíte operačnímu středisku s popisem osoby.",
            "legalBasis": "§ 73 odst. 1 písm. d) a e) NGŘ č. 2/2026",
            "nextStepId": "step-2"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Odsouzený utíká přes pole",
        "description": "Zahlédnete odsouzeného, jak se bez jakéhokoli útoku vzdaluje přes pole. Dozorce odsouzených na nestřeženém pracovišti střelnou zbraň standardně nemá; rozhodněte, jak byste jednal, i kdybyste ji u sebe měl. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Po výzvě s výstrahou vystřelím, protože jde o útěk podle § 18 odst. 1 písm. c) zákona.",
            "isCorrect": false,
            "feedback": "Nestřežené pracoviště není střeženým objektem a převoz na ně není eskortou, důvod § 18 odst. 1 písm. c) se proto neuplatní.",
            "legalBasis": "§ 30 odst. 5 a § 37 odst. 3 NGŘ č. 33/2019"
          },
          {
            "id": "c2-2",
            "text": "Zbraň nepoužiji; neútočí, jde o ostatní MU, hlásím směr a řídím se pokyny VISS.",
            "isCorrect": true,
            "feedback": "Správně. Proti odsouzenému, který jen odchází a neútočí, zbraň použít nelze; odchod z nestřeženého pracoviště je ostatní mimořádnou událostí podle § 6 písm. e).",
            "legalBasis": "§ 18 zákona č. 555/1992 Sb.; § 6 písm. e) NGŘ č. 16/2022",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-3",
            "text": "Použiji varovný výstřel do vzduchu, aby se zastavil, a pak jej pronásleduji.",
            "isCorrect": false,
            "feedback": "Pronásledováním byste opustil zbývajících 14 odsouzených; varovný výstřel je donucovací prostředek a zde nejde o situaci vyžadující střelbu.",
            "legalBasis": "§ 17 zákona č. 555/1992 Sb.; § 73 NGŘ č. 2/2026"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Administrativní dořešení",
        "description": "Po návratu do věznice dokončujete dokumentaci. Co podáte?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Jen ústní hlášení VISS, písemnosti zpracuje oddělení výkonu trestu samo.",
            "isCorrect": false,
            "feedback": "Dozorce sám sepisuje služební záznam o události a záznam o kázeňském přestupku a navrhuje odvolání z pracoviště.",
            "legalBasis": "§ 16 NGŘ č. 41/2024"
          },
          {
            "id": "c3-2",
            "text": "Služební záznam, záznam o kázeňském přestupku a návrh na odvolání z pracoviště.",
            "isCorrect": true,
            "feedback": "Správně. Sepíšete služební záznam (časy, opatření, hlášení), záznam o kázeňském přestupku podle § 16 NGŘ č. 41/2024 a návrh na odvolání odsouzeného z nestřeženého pracoviště.",
            "legalBasis": "§ 73 odst. 1 písm. e) NGŘ č. 2/2026; § 16 NGŘ č. 41/2024"
          },
          {
            "id": "c3-3",
            "text": "Záznam o použití donucovacích prostředků, přestože žádné donucovací prostředky použity nebyly.",
            "isCorrect": false,
            "feedback": "Záznam o použití DP se sepisuje jen při jejich skutečném použití; zde je potřeba služební záznam a záznam o kázeňském přestupku.",
            "legalBasis": "§ 20 zákona č. 555/1992 Sb."
          }
        ]
      }
    ]
  },
  {
    "id": "sc-21",
    "title": "Modelová situace 21: Obviněný odmítá opustit vycházkový dvůr",
    "category": "Právo, etika & Donucovací prostředky",
    "badge": "§ 6, § 7 a § 17 z. č. 555/1992 Sb. & § 86 NGŘ 33/2019",
    "difficulty": "Pokročilá",
    "briefing": "Jste velen jako strážný určený k předvádění obviněných na vycházky. Při ukončení vycházky jeden obviněný ze společně předváděné skupiny odmítne opustit vycházkový dvůr a hlasitě protestuje, že vycházka je příliš krátká a že není dobytek, aby byl pořád zavřený.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Protestující obviněný",
        "description": "Ostatní obvinění stojí u východu z dvora a sledují, jak zareagujete. Obviněný zůstává stát uprostřed dvora a opakuje své námitky. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Vyslechnu ho a věcně vysvětlím, že délku vycházky určuje zákon a řád; stížnost může podat.",
            "isCorrect": true,
            "feedback": "Správně. Příslušník jedná vážně a rozhodně a respektuje důstojnost osoby. Vycházka obviněných trvá nejméně hodinu denně a námitku lze uplatnit stížností.",
            "legalBasis": "§ 6 odst. 1 a 2 z. č. 555/1992 Sb.; § 18 odst. 2 z. č. 293/1993 Sb.",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-2",
            "text": "Vycházku mu výjimečně prodloužím, aby se situace zbytečně nevyhrotila před ostatními obviněnými.",
            "isCorrect": false,
            "feedback": "Chyba. Časový rozvrh dne stanoví vnitřní řád věznice a strážný ho nemůže sám měnit. Ustoupením by navíc motivoval další obviněné k podobnému jednání.",
            "legalBasis": "§ 3 vyhl. č. 109/1994 Sb.; § 5 odst. 2 z. č. 293/1993 Sb."
          },
          {
            "id": "c1-3",
            "text": "Odvedu ostatní obviněné na cely a protestujícího nechám zatím samotného na dvoře.",
            "isCorrect": false,
            "feedback": "Chyba. Strážný musí vězněnou osobu střežit po celou dobu předvádění. Obviněného nesmí nechat bez dohledu a skupinu musí zajistit i se zřetelem k zásadám oddělenosti.",
            "legalBasis": "§ 86 odst. 2 NGŘ 33/2019; § 7 z. č. 293/1993 Sb."
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Domluva nezabrala",
        "description": "Obviněný dál odmítá odejít a pokyn neplní. Tím porušuje povinnost plnit pokyny Vězeňské služby. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Hned ho bez jakéhokoli varování chytím a odvedu, protože jde jen o kázeňský přestupek.",
            "isCorrect": false,
            "feedback": "Chyba. Před zákrokem je příslušník povinen, dovolují-li to okolnosti, použít výzvy se slovy „jménem zákona“ a varovat, že použije donucovací prostředky.",
            "legalBasis": "§ 6 odst. 3 z. č. 555/1992 Sb."
          },
          {
            "id": "c2-2",
            "text": "Oddělím ho od skupiny, přivolám posilu a vyzvu ho „jménem zákona“ s varováním.",
            "isCorrect": true,
            "feedback": "Správně. Neplnění pokynu je kázeňským přestupkem a narušením pořádku, takže je příslušník povinen zakročit. Nejdřív zajistí skupinu a vyrozumí nadřízeného, potom dá výzvu s varováním.",
            "legalBasis": "§ 6 odst. 3 písm. b) a § 7 odst. 1 písm. a) a d) z. č. 555/1992 Sb.; § 21 odst. 1 z. č. 293/1993 Sb.",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-3",
            "text": "Situaci nechám být a obviněného ponechám na dvoře, dokud se sám neuklidní.",
            "isCorrect": false,
            "feedback": "Chyba. Obviněný páchá kázeňský přestupek a narušuje pořádek, proto je příslušník ve službě povinen zakročit. Nečinnost tu není přípustná.",
            "legalBasis": "§ 7 odst. 1 z. č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Pasivní odpor",
        "description": "Ani výzva nepomohla. Obviněný si sedne na zem a odmítá se hnout, neútočí však. Posila je na místě. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Použijeme obušek, aby obviněný pochopil, že musí poslechnout.",
            "isCorrect": false,
            "feedback": "Chyba. Použití donucovacího prostředku musí být přiměřené. Proti pasivnímu odporu bez útoku je úder obuškem zřejmě nepřiměřený.",
            "legalBasis": "§ 17 odst. 3 z. č. 555/1992 Sb."
          },
          {
            "id": "c3-2",
            "text": "Použijeme slzotvorný prostředek přímo na dvoře, protože je nejrychlejší.",
            "isCorrect": false,
            "feedback": "Chyba. Slzotvorný prostředek by v této situaci nebyl přiměřený povaze jednání a ohrozil by i další osoby. Volí se nejmírnější prostředek, který postačí k dosažení účelu.",
            "legalBasis": "§ 17 odst. 3 z. č. 555/1992 Sb."
          },
          {
            "id": "c3-3",
            "text": "Odvedeme ho hmaty a chvaty, případně v poutech, a vše ohlásíme.",
            "isCorrect": true,
            "feedback": "Správně. Proti pasivnímu odporu jsou přiměřené hmaty a chvaty sebeobrany a pouta. Použití DP se bezodkladně oznámí nadřízenému, sepíše se záznam o použití DP a záznam o kázeňském přestupku.",
            "legalBasis": "§ 17 odst. 3, § 19 a § 20 z. č. 555/1992 Sb.; § 16 NGŘ 41/2024"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-22",
    "title": "Modelová situace 22: Nakládání uzavřených beden bez dozorce",
    "category": "Ostraha, vstupy & Justiční stráž",
    "badge": "§ 80 a § 82 NGŘ 33/2019 & § 68 NGŘ 2/2026",
    "difficulty": "Pokročilá",
    "briefing": "Jste velen jako strážný na stanoviště doprovod a střežení vozidel. Do věznice přijelo nákladní vozidlo odvézt bedny z vnitřního pracoviště. Bedny jsou pevně uzavřené a nakládat je má 5 odsouzených z pracoviště. Dozorce z vnitřního pracoviště u nakládání není.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Uzavřené bedny",
        "description": "Odsouzení se chystají naložit první pevně uzavřenou bednu. Nikdo neví, zda byla před zavřením zkontrolována. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Nakládání zastavím a odsouzené vyzvu, aby od vozidla odstoupili.",
            "isCorrect": true,
            "feedback": "Správně. Strážný nesmí připustit nakládání uzavřených beden, které nebyly kontrolovány před naplněním. Mohla by v nich být ukryta vězněná osoba nebo nepovolené věci.",
            "legalBasis": "§ 82 odst. 1 písm. d) NGŘ 33/2019",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-2",
            "text": "Nakládání povolím, protože bedny stejně zkontroluje strážný na vjezdu.",
            "isCorrect": false,
            "feedback": "Chyba. Kontrolu nákladu při nakládání nelze přesouvat na vjezd. Strážný u vjezdu naopak vozidlo nepropustí, byl-li materiál naložen bez řádné kontroly.",
            "legalBasis": "§ 82 odst. 1 písm. d) a § 80 odst. 2 písm. n) NGŘ 33/2019"
          },
          {
            "id": "c1-3",
            "text": "Bedny nechám naložit, ale před tím si od řidiče vyžádám podepsané prohlášení o jejich obsahu.",
            "isCorrect": false,
            "feedback": "Chyba. Prohlášení řidiče nenahrazuje fyzickou kontrolu. Nepřehledný a těžko kontrolovatelný materiál se bez kontroly naplnění naložit nesmí.",
            "legalBasis": "§ 82 odst. 1 písm. d) NGŘ 33/2019"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Chybějící dozorce",
        "description": "Nakládání je přerušeno. Odsouzení stojí u vozidla a dozorce pracoviště stále nikde. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Odsouzené odvedu sám zpět do dílny a převezmu za ně odpovědnost místo dozorce.",
            "isCorrect": false,
            "feedback": "Chyba. Za odsouzené na vnitřním střeženém pracovišti odpovídá dozorce oddělení výkonu trestu. Úkolem strážného doprovodu je střežit vozidlo, ne nahrazovat dozorce.",
            "legalBasis": "§ 68 NGŘ 2/2026; § 82 NGŘ 33/2019"
          },
          {
            "id": "c2-2",
            "text": "Mám odsouzené v přehledu a radiostanicí nahlásím situaci VISS.",
            "isCorrect": true,
            "feedback": "Správně. Strážný musí mít neustále přehled o odsouzených u vozidla a nepřipustit kontakt řidiče s nimi. Nepřítomnost dozorce neprodleně ohlásí vrchnímu inspektorovi strážní služby.",
            "legalBasis": "§ 82 odst. 1 NGŘ 33/2019",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-3",
            "text": "Nechám řidiče vozidlo zamknout a s odsouzenými počkám, až dozorce někdy přijde.",
            "isCorrect": false,
            "feedback": "Chyba. Samotné čekání nestačí. Nepřítomnost dozorce je závažná skutečnost, kterou musí strážný ohlásit nadřízenému a vyžádat si jeho pokyny.",
            "legalBasis": "§ 82 odst. 1 NGŘ 33/2019"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Před odjezdem vozidla",
        "description": "Dozorce dorazil, bedny se otevřely, zkontrolovaly a naložily za vašeho dohledu. Vozidlo se chystá k odjezdu. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Vozidlo pustím k vjezdu hned, protože náklad už byl zkontrolován.",
            "isCorrect": false,
            "feedback": "Chyba. Vozidlo nesmí odjet bez početní prověrky stavu vězněných osob, které jsou na pracovišti.",
            "legalBasis": "§ 82 odst. 1 písm. d) NGŘ 33/2019"
          },
          {
            "id": "c3-2",
            "text": "Před odjezdem nechám náklad znovu přebalit a zaplombovat, strážnému na vjezdu nic nehlásím.",
            "isCorrect": false,
            "feedback": "Chyba. Plombování není předepsaný postup. Naopak je nutné nahlásit strážnému na vjezdu, že vozidlo bylo řádně zkontrolováno.",
            "legalBasis": "§ 82 NGŘ 33/2019"
          },
          {
            "id": "c3-3",
            "text": "Trvám na početní prověrce, pak hlásím vjezdu kontrolu vozidla a sepíšu záznam.",
            "isCorrect": true,
            "feedback": "Správně. Bez početní prověrky vozidlo neodjede. Strážnému na vjezdu se nahlásí, že vozidlo bylo řádně zkontrolováno, a o nepřítomnosti dozorce se sepíše služební záznam.",
            "legalBasis": "§ 82 odst. 1 NGŘ 33/2019; § 68 NGŘ 2/2026"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-23",
    "title": "Modelová situace 23: Návštěva obviněného s dítětem a těžkým balíčkem",
    "category": "Ostraha, vstupy & Justiční stráž",
    "badge": "§ 14 a § 16 z. č. 293/1993 Sb. & vyhl. č. 109/1994 Sb.",
    "difficulty": "Základní",
    "briefing": "Do vazební věznice přišla návštěva k obviněnému. Na žádance je uvedena manželka obviněného a jeho bratr. Bratr s sebou přivedl pětiletého syna, který na žádance uveden není. Manželka nese potravinový balíček o hmotnosti 5,5 kg.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Dítě mimo žádanku",
        "description": "U vstupu bratr trvá na tom, že syn půjde s ním, protože ho nemá kde nechat. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Dítě vpustím, protože s ním návštěva nepřekročí povolené 4 osoby.",
            "isCorrect": false,
            "feedback": "Chyba. Počet osob překročen není, dítě však na žádance uvedeno není. Vstup se umožní jen osobám s platným povolením a dokladem totožnosti.",
            "legalBasis": "§ 44 odst. 1 a 2 vyhl. č. 109/1994 Sb."
          },
          {
            "id": "c1-2",
            "text": "Jeho účast sám nepovolím a věc hned oznámím VISS a vrchnímu dozorci.",
            "isCorrect": true,
            "feedback": "Správně. Strážný vpustí jen osoby s platným povolením. O neuvedeném dítěti informuje VISS a vrchního dozorce oddělení výkonu vazby, který návštěvy organizuje.",
            "legalBasis": "§ 44 odst. 2 vyhl. č. 109/1994 Sb.; § 24 odst. 2 písm. f) a t) NGŘ 2/2026",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Dítě nechám u sebe na stanovišti, dokud návštěva neskončí a otec se nevrátí.",
            "isCorrect": false,
            "feedback": "Chyba. Na strážní stanoviště se nevpouštějí osoby, které tam nevykonávají službu. Dítě nemůže zůstat v prostoru věznice bez doprovodu dospělé osoby.",
            "legalBasis": "§ 80 odst. 3 písm. e) a f) NGŘ 33/2019"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Balíček 5,5 kg",
        "description": "Manželka předkládá potravinový balíček k předání obviněnému. Váha ukazuje 5,5 kg. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Balíček přijmu, protože půl kilogramu nad limit je zanedbatelný rozdíl.",
            "isCorrect": false,
            "feedback": "Chyba. Obviněný může při návštěvě přijmout balíček s potravinami a věcmi osobní potřeby do hmotnosti 5 kg. Limit nelze svévolně překročit.",
            "legalBasis": "§ 16 odst. 2 z. č. 293/1993 Sb.; § 46 odst. 1 vyhl. č. 109/1994 Sb."
          },
          {
            "id": "c2-2",
            "text": "Přebytečné potraviny vyjmu a zbytek balíčku bez dalšího předám dozorci.",
            "isCorrect": false,
            "feedback": "Chyba. Strážný do balíčku nesahá ani jej nepřebaluje. Balíček nad povolenou hmotnost se vrací odesilateli.",
            "legalBasis": "§ 48 odst. 3 vyhl. č. 109/1994 Sb.; § 101 odst. 5 NGŘ 33/2019"
          },
          {
            "id": "c2-3",
            "text": "Balíček vrátím a manželku poučím o limitu 5 kg a o zaslání poštou.",
            "isCorrect": true,
            "feedback": "Správně. Balíček vyšší než povolené hmotnosti se vrací odesilateli. Návštěvnici poučíte o hmotnosti, o zakázaných věcech a o možnosti poslat balíček poštou.",
            "legalBasis": "§ 48 odst. 2 a 3 vyhl. č. 109/1994 Sb.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Kontrola návštěvníků",
        "description": "Vedoucí rozhodl, že dítě se návštěvy zúčastnit smí. Následuje kontrola osob při vstupu. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Dítě prohlédnu za přítomnosti otce a doklady dospělých ověřím.",
            "isCorrect": true,
            "feedback": "Správně. Kontrola dítěte se provádí přiměřeně věku a osobní prohlídka vždy za přítomnosti zákonného zástupce. Totožnost dospělých se ověří podle platného dokladu a zapíše do VIS.",
            "legalBasis": "§ 99 odst. 6 a § 80 NGŘ 33/2019; Metodika vstupy a vjezd do objektu"
          },
          {
            "id": "c3-2",
            "text": "Dítě odvedu stranou a prohlédnu ho sám, aby otec prohlídku nerušil.",
            "isCorrect": false,
            "feedback": "Chyba. Osobní prohlídka dítěte se provádí vždy za přítomnosti jeho zákonného zástupce a komunikace směřuje k doprovázející osobě.",
            "legalBasis": "§ 99 odst. 6 NGŘ 33/2019"
          },
          {
            "id": "c3-3",
            "text": "Dítě kontrolovat nebudu, pětileté dítě nic nebezpečného nepronese.",
            "isCorrect": false,
            "feedback": "Chyba. Kontrole podléhají všechny vstupující osoby. U dítěte se kontrola jen přizpůsobí jeho věku.",
            "legalBasis": "§ 99 odst. 6 NGŘ 33/2019; Metodika vstupy a vjezd do objektu, část 5"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-24",
    "title": "Modelová situace 24: Porucha vozidla cestou na nestřežené pracoviště",
    "category": "Mimořádné události & Zásah",
    "badge": "§ 69 NGŘ 2/2026 & § 37 odst. 3 NGŘ 33/2019",
    "difficulty": "Pokročilá",
    "briefing": "Jste velen jako dozorce odsouzených na nestřežené pracoviště mimo věznici. Převzal jste od VISS odsouzené a vyrazil s nimi na pracoviště. Cestou se porouchal motor. S vozidlem jste ještě dojeli na odstavné parkoviště asi 1 km od pracoviště.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Zastavení na parkovišti",
        "description": "Vozidlo stojí na parkovišti a dál nepojede. Odsouzení začínají být neklidní. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Vymezím jim prostor, zakážu kontakty s cizími a provedu početní prověrku.",
            "isCorrect": true,
            "feedback": "Správně. Dozorce musí nejdřív zajistit odsouzené: vymezí prostor pohybu, dbá, aby se nevzdalovali a nenavazovali nedovolené styky, a ověří jejich počet.",
            "legalBasis": "§ 69 písm. c) NGŘ 2/2026",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-2",
            "text": "Nechám odsouzené volně vystoupit, ať si mezitím na parkovišti zakouří.",
            "isCorrect": false,
            "feedback": "Chyba. Odsouzení se nesmějí bez kontroly vzdalovat ani navazovat nedovolené kontakty s civilními osobami. Na parkovišti je dozor ještě důležitější.",
            "legalBasis": "§ 69 písm. c) NGŘ 2/2026"
          },
          {
            "id": "c1-3",
            "text": "Protože jde o eskortu, přivolám nejbližší hlídku Policie ČR k převzetí odsouzených.",
            "isCorrect": false,
            "feedback": "Chyba. Převoz na nestřežené pracoviště se nepovažuje za eskortu. Dozorce postupuje podle svých povinností a pokynů nadřízených z věznice.",
            "legalBasis": "§ 37 odst. 3 NGŘ 33/2019"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Komu hlásit",
        "description": "Odsouzení jsou zajištěni. Je potřeba rozhodnout, jak dál. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Nikomu nic nehlásím a vozidlo zkusím s odsouzenými opravit sám.",
            "isCorrect": false,
            "feedback": "Chyba. Závažné skutečnosti, které by mohly vést ke vzniku mimořádné události, dozorce hlásí operačnímu středisku. Oprava vozidla odsouzenými navíc není jeho úkolem.",
            "legalBasis": "§ 69 písm. e) NGŘ 2/2026"
          },
          {
            "id": "c2-2",
            "text": "Nahlásím jen zaměstnavateli, že skupina přijde později, a víc neřeším.",
            "isCorrect": false,
            "feedback": "Chyba. Zaměstnavatele je vhodné vyrozumět, ale nejdřív je nutné informovat operační středisko a VISS a řídit se jejich pokyny.",
            "legalBasis": "§ 69 písm. e) a f) NGŘ 2/2026; § 65 písm. f) NGŘ 33/2019"
          },
          {
            "id": "c2-3",
            "text": "Vyrozumím OS a VISS o místě, poruše a počtu odsouzených.",
            "isCorrect": true,
            "feedback": "Správně. Operačnímu středisku a VISS nahlásíte polohu, povahu poruchy a počet a stav odsouzených. O dalším postupu rozhodne nadřízený, zaměstnavatele vyrozumíte o zpoždění.",
            "legalBasis": "§ 69 písm. e) a f) NGŘ 2/2026; § 65 písm. f) NGŘ 33/2019",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Odsouzený odchází",
        "description": "Při čekání na náhradní vozidlo se jeden odsouzený zvedne a beze slova odchází z parkoviště. Neútočí. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Vyzvu ho k návratu a odchod ihned hlásím jako mimořádnou událost.",
            "isCorrect": true,
            "feedback": "Správně. Svévolný odchod z nestřeženého pracoviště je ostatní mimořádnou událostí, kterou dozorce hlásí operačnímu středisku. Střelnou zbraň proti odcházejícímu, který neútočí, použít nelze.",
            "legalBasis": "§ 6 písm. e) NGŘ 16/2022; § 17 a § 18 z. č. 555/1992 Sb."
          },
          {
            "id": "c3-2",
            "text": "Za odsouzeným se rozběhnu a ostatní nechám na parkovišti bez dohledu.",
            "isCorrect": false,
            "feedback": "Chyba. Dozorce nesmí ostatní odsouzené ponechat bez dohledu. Musí zajistit zbývající skupinu a událost ihned hlásit.",
            "legalBasis": "§ 69 písm. c) a e) NGŘ 2/2026"
          },
          {
            "id": "c3-3",
            "text": "Použiji varovný výstřel, protože jde o útěk ze střeženého objektu.",
            "isCorrect": false,
            "feedback": "Chyba. Nestřežené pracoviště není střeženým objektem a převoz není eskortou. Dozorce OVT navíc standardně střelnou zbraň nemá.",
            "legalBasis": "§ 18 odst. 1 písm. c) z. č. 555/1992 Sb.; § 64 odst. 3 NGŘ 2/2026; § 37 odst. 3 NGŘ 33/2019"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-25",
    "title": "Modelová situace 25: Baterie do mobilu při dílčí prohlídce",
    "category": "Právo, etika & Donucovací prostředky",
    "badge": "§ 12 z. č. 555/1992 Sb. & NGŘ 33/2019 & NGŘ 41/2024",
    "difficulty": "Základní",
    "briefing": "Jste velen jako strážný k dílčí prohlídce vnitřního pracoviště, truhlářské dílny. Při preventivní osobní prohlídce u jednoho odsouzeného najdete baterii do mobilního telefonu. Odsouzený tvrdí, že ji našel v dílně.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Nález baterie",
        "description": "Držíte v ruce baterii do mobilního telefonu a odsouzený trvá na tom, že ji jen našel. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Baterii mu nechám, protože tvrdí, že ji pouze našel a chtěl ji odevzdat.",
            "isCorrect": false,
            "feedback": "Chyba. Mobilní telekomunikační technika a její součásti patří mezi nepovolené věci. Odsouzený je musí odevzdat bez ohledu na to, jak k nim přišel.",
            "legalBasis": "§ 28 odst. 2 písm. j) z. č. 169/1999 Sb.; § 66 písm. k) NGŘ 2/2026"
          },
          {
            "id": "c1-2",
            "text": "Baterii odejmu, nález ohlásím a jeho tvrzení uvedu v záznamu.",
            "isCorrect": true,
            "feedback": "Správně. Příslušník je oprávněn odejmout věc, kterou má odsouzený neoprávněně u sebe. Nález ohlásí řídícímu prohlídky a VISS a tvrzení odsouzeného uvede jako okolnost odnětí.",
            "legalBasis": "§ 12 odst. 1 z. č. 555/1992 Sb.; § 37 NGŘ 41/2024",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Před ostatními odsouzenými ho hlasitě vyslechnu, od koho baterii má.",
            "isCorrect": false,
            "feedback": "Chyba. Při nálezu zachová příslušník klid, nekřičí, nevyhrožuje a neptá se před ostatními, od koho věc má.",
            "legalBasis": "učební text Prohlídky – zásady při nálezu; § 6 z. č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Podezření na další předměty",
        "description": "Kde je baterie, může být i telefon nebo SIM karta. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Navrhnu důkladnou osobní prohlídku a prohlídku jeho věcí i dílny.",
            "isCorrect": true,
            "feedback": "Správně. Při důvodném podezření na další nepovolené věci se provede důkladná osobní prohlídka příslušníkem stejného pohlaví a v rámci dílčí prohlídky se prohlédne pracoviště.",
            "legalBasis": "§ 92 odst. 1, § 94 odst. 1 a § 95 odst. 1 NGŘ 33/2019",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-2",
            "text": "Důkladnou prohlídku těla provedu hned v dílně před ostatními odsouzenými.",
            "isCorrect": false,
            "feedback": "Chyba. Důkladná osobní prohlídka se provádí v určené místnosti, příslušníkem stejného pohlaví a se zachováním lidské důstojnosti.",
            "legalBasis": "§ 95 odst. 1 NGŘ 33/2019"
          },
          {
            "id": "c2-3",
            "text": "Další prohlídku nepovažuji za nutnou, baterie byla nalezena a stačí záznam.",
            "isCorrect": false,
            "feedback": "Chyba. Nález součásti mobilního telefonu zakládá důvodné podezření, že odsouzený může mít další nepovolené věci. Proto se navrhne důkladná prohlídka.",
            "legalBasis": "§ 94 odst. 1 NGŘ 33/2019"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Dokumentace",
        "description": "Prohlídka skončila. Zbývá dokumentace a předání věci. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Sepíšu jen služební záznam a baterii si nechám na stanovišti do konce směny.",
            "isCorrect": false,
            "feedback": "Chyba. Odňatá věc se vloží do označeného obalu a předá se se Záznamem o odnětí věci nejbližšímu nadřízenému. Samotný služební záznam nestačí.",
            "legalBasis": "§ 37 a § 38 odst. 1 NGŘ 41/2024"
          },
          {
            "id": "c3-2",
            "text": "Baterii rovnou zničím jako věc nepatrné hodnoty, aby ji nikdo znovu nezneužil.",
            "isCorrect": false,
            "feedback": "Chyba. O dalším naložení s odňatou věcí rozhoduje oprávněná osoba. Věc slouží i jako důkaz v kázeňském řízení.",
            "legalBasis": "§ 12 odst. 2 z. č. 555/1992 Sb.; § 37 odst. 2 NGŘ 41/2024"
          },
          {
            "id": "c3-3",
            "text": "Sepíšu záznam o odnětí věci i o přestupku a baterii předám.",
            "isCorrect": true,
            "feedback": "Správně. Záznam o odnětí věci (příloha č. 9) i záznam o kázeňském přestupku (příloha č. 4 NGŘ 41/2024) se předají s odňatou věcí v označeném obalu nadřízenému.",
            "legalBasis": "§ 16, § 37 odst. 2 a § 38 odst. 1 NGŘ 41/2024; § 46 z. č. 169/1999 Sb."
          }
        ]
      }
    ]
  },
  {
    "id": "sc-26",
    "title": "Modelová situace 26: Útěk obviněného oknem jednací síně",
    "category": "Eskorty & Střelba",
    "badge": "§ 73 NGŘ č. 33/2019 & § 17–18 z. č. 555/1992 Sb.",
    "difficulty": "Pokročilá",
    "briefing": "Jste velitelem eskorty k okresnímu soudu. V jednací síni jste se strážným eskorty a strážným justiční stráže. Při vyhlašování rozsudku obviněný prudce odstrčí strážného eskorty, vyskočí z otevřeného okna z výšky 4 m na prostranství před budovou a po dopadu zůstane ležet.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Bezprostřední reakce",
        "description": "Obviněný leží na prostranství pod oknem jednací síně. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Vystřelíte z okna na ležícího obviněného, aby nemohl v útěku dál pokračovat.",
            "isCorrect": false,
            "feedback": "Střelnou zbraň lze k zamezení útěku při eskortě použít jen tehdy, nelze-li osobu zadržet jiným způsobem. Proti ležícímu zraněnému obviněnému je její použití nepřípustné.",
            "legalBasis": "§ 18 odst. 1 písm. c) a odst. 2 zákon č. 555/1992 Sb."
          },
          {
            "id": "c1-2",
            "text": "Se strážným eskorty se nejkratší cestou přesunete k obviněnému a strážný JS zajistí síň.",
            "isCorrect": true,
            "feedback": "Správně. Pronásledování a zadržení organizujete sami, justiční stráž zajistí jednací síň a pořádek v budově soudu a vyrozumí VIJS.",
            "legalBasis": "§ 73 NGŘ č. 33/2019; § 22 zákon č. 555/1992 Sb.",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Zůstanete v jednací síni a vyčkáte, až obviněného zadrží justiční stráž nebo policie na ulici.",
            "isCorrect": false,
            "feedback": "Velitel eskorty odpovídá za střežení eskortovaného; útěk musí bezprostředně zorganizovat pronásledování a zadržení, ne jej přenechat jiným.",
            "legalBasis": "§ 73 NGŘ č. 33/2019; učební text Eskortní služba, s. 17–18"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Zadržení zraněného obviněného",
        "description": "Doběhnete k obviněnému, který leží na zemi a sténá. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Obviněného hned zvednete a odvedete zpět do eskortní místnosti, aby se situace uklidnila.",
            "isCorrect": false,
            "feedback": "Po pádu ze 4 m hrozí vážné zranění. Se zraněným se nehýbe, pokud to není nezbytné; je třeba poskytnout první pomoc a přivolat záchrannou službu.",
            "legalBasis": "§ 73 odst. 1 písm. n) NGŘ č. 33/2019; § 20 odst. 1 zákon č. 555/1992 Sb."
          },
          {
            "id": "c2-2",
            "text": "Obezřetně ho vyzvete a zadržíte, přiměřeně spoutáte a zajistíte první pomoc a ZZS.",
            "isCorrect": true,
            "feedback": "Správně. Obviněný může útěk či zranění předstírat. Po pokusu o útěk a napadení lze přiložit pouta přiměřeně jeho stavu, poskytnout první pomoc a neprodleně přivolat ZZS.",
            "legalBasis": "§ 17 odst. 1, 3 a 5 a § 20 odst. 1 zákon č. 555/1992 Sb.",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-3",
            "text": "Protože je zraněný, nepoužijete žádný donucovací prostředek a jen čekáte na lékaře.",
            "isCorrect": false,
            "feedback": "Obviněný se pokusil o útěk a napadl příslušníka; může zranění předstírat. Přiložení pout k zamezení dalšího útěku je namístě, jen musí být přiměřené jeho zdravotnímu stavu.",
            "legalBasis": "§ 17 odst. 1, 3 a 5 zákon č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Hlášení události",
        "description": "Obviněný je zadržen a střežen, záchranná služba je na cestě. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Událost zapíšete až po návratu do věznice do Knihy hlášení velitele eskorty.",
            "isCorrect": false,
            "feedback": "Pokus o útěk i napadení eskorty jsou závažnými mimořádnými událostmi; operační středisko a VISS se vyrozumí neprodleně, ne až po návratu.",
            "legalBasis": "§ 5 písm. a) a b) NGŘ č. 16/2022"
          },
          {
            "id": "c3-2",
            "text": "Neprodleně vyrozumíte OS kmenové věznice a VISS: totožnost, událost, opatření, zdraví.",
            "isCorrect": true,
            "feedback": "Správně. Hlášení obsahuje totožnost obviněného, popis události, přijatá opatření a zdravotní stav; dále se řídíte pokyny OS a VISS a vyrozumíte i Policii ČR.",
            "legalBasis": "§ 73 NGŘ č. 33/2019; § 7 a 8 NGŘ č. 16/2022"
          },
          {
            "id": "c3-3",
            "text": "Informujete pouze předsedu senátu, protože se událost stala v budově soudu a spadá pod něj.",
            "isCorrect": false,
            "feedback": "Předsedu senátu informujete, ale hlášení operačnímu středisku kmenové věznice a VISS je povinné; předseda senátu nerozhoduje o bezpečnostních opatřeních eskorty.",
            "legalBasis": "§ 73 odst. 1 písm. s) NGŘ č. 33/2019; § 5 NGŘ č. 16/2022"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-27",
    "title": "Modelová situace 27: Podlitina na tváři odsouzeného",
    "category": "Právo, etika & Donucovací prostředky",
    "badge": "NGŘ č. 24/2022 & NGŘ č. 2/2026",
    "difficulty": "Základní",
    "briefing": "Jste dozorcem na ubytovně odsouzených. Při kontrole si všimnete, že jeden odsouzený má na pravé tváři výraznou podlitinu. Tvrdí, že ho předchozí den při fotbale udeřil loktem některý ze spoluvězňů, nedokáže však říct který. Pojmete podezření na úmyslné ublížení.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: První opatření",
        "description": "Máte důvodné podezření, že podlitina souvisí s fyzickým násilím. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Vysvětlení o fotbale přijmete a věc dál neřešíte, protože odsouzený nic neoznámil.",
            "isCorrect": false,
            "feedback": "Při podezření, že se vězněná osoba stala objektem fyzického násilí, musí dozorce jednat bez ohledu na to, zda násilí oznámila.",
            "legalBasis": "§ 20 NGŘ č. 24/2022"
          },
          {
            "id": "c1-2",
            "text": "Neprodleně provedete prohlídku těla (stejné pohlaví) a zamezíte dalšímu násilí.",
            "isCorrect": true,
            "feedback": "Správně. Prohlídka těla se při podezření provede neprodleně, s respektem k důstojnosti; zároveň zajistíte oddělení od ostatních a první pomoc či ošetření.",
            "legalBasis": "§ 13 a § 20 NGŘ č. 24/2022",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Odsouzeného necháte na ložnici a zjištění zmíníte až při předání služby střídajícímu dozorci.",
            "isCorrect": false,
            "feedback": "Zjištění stop po násilí se oznamuje a řeší bez zbytečného odkladu; odklad může vést k pokračování násilí.",
            "legalBasis": "§ 20 NGŘ č. 24/2022; § 3 písm. f) a l) NGŘ č. 2/2026"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Oznámení zjištění",
        "description": "Prohlídka potvrdila podlitinu, další stopy nejsou. Je 21:30. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Zjištění oznámíte přímo Policii ČR a nadřízené informujete až další pracovní den ráno.",
            "isCorrect": false,
            "feedback": "Oznámení jde bez zbytečného odkladu přes inspektora dozorčí služby; o trestním oznámení rozhoduje až šetření pověřeného orgánu.",
            "legalBasis": "§ 20 NGŘ č. 24/2022"
          },
          {
            "id": "c2-2",
            "text": "Bez odkladu to oznámíte přes IDS, mimo pracovní dobu vrchnímu inspektorovi SS.",
            "isCorrect": true,
            "feedback": "Správně. V mimopracovní době se oznamuje prostřednictvím IDS vrchnímu inspektorovi strážní služby, který zajistí i fotodokumentaci a vyrozumění vedení.",
            "legalBasis": "§ 20 NGŘ č. 24/2022",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-3",
            "text": "Protože odsouzený odmítá lékaře, necháte rozhodnutí o dalším postupu jen na něm samotném.",
            "isCorrect": false,
            "feedback": "Odsouzený musí být bez zbytečného odkladu předveden k lékaři; odmítne-li prohlídku, lékař s ním sepíše negativní reverz. Psycholog jej vyšetří i proti jeho vůli.",
            "legalBasis": "§ 20 NGŘ č. 24/2022"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Dokumentace",
        "description": "Odsouzený byl předveden na zdravotnické středisko. Jaký záznam zpracujete?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Záznam o fyzickém násilí podle přílohy č. 1 a evidenci v IS v záložce „Fyzické násilí“.",
            "isCorrect": true,
            "feedback": "Správně. Zaměstnanec, který stopy zjistil jako první, zpracuje záznam bez zbytečného odkladu, podepíše jej a předá přímému nadřízenému.",
            "legalBasis": "§ 20 a příloha č. 1 NGŘ č. 24/2022"
          },
          {
            "id": "c3-2",
            "text": "Pouze záznam o kázeňském přestupku na neznámého spoluodsouzeného, který ho udeřil loktem.",
            "isCorrect": false,
            "feedback": "Kázeňské řízení nelze vést proti neznámému pachateli; o tom, zda jde o trestný čin, přestupek nebo kázeňský přestupek, rozhodne šetření oddělení prevence a stížností.",
            "legalBasis": "§ 20 NGŘ č. 24/2022"
          },
          {
            "id": "c3-3",
            "text": "Žádný záznam nesepíšete, protože pachatel není znám a nic se nedá prokázat.",
            "isCorrect": false,
            "feedback": "Záznam o fyzickém násilí se zpracovává vždy při zjištění stop, i když původce není znám.",
            "legalBasis": "§ 20 a příloha č. 1 NGŘ č. 24/2022"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-28",
    "title": "Modelová situace 28: Pokus o útěk přes ohradní zeď",
    "category": "Eskorty & Střelba",
    "badge": "§ 81 NGŘ č. 33/2019 & § 17–18 z. č. 555/1992 Sb.",
    "difficulty": "Expertní",
    "briefing": "Jste strážným na strážní věži. V průběhu výkonu strážní služby vnikne jeden odsouzený do vnitřního zakázaného pásma a snaží se překonat ohradní zeď ve vašem úseku.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Zjištění narušení",
        "description": "Odsouzený běží zakázaným pásmem k ohradní zdi. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Opustíte strážní věž a běžíte odsouzeného zadržet přímo do zakázaného pásma.",
            "isCorrect": false,
            "feedback": "Strážný nesmí opustit strážní stanoviště, dokud nebude vystřídán nebo odvolán; zadržení provede strážní a zásahová hlídka.",
            "legalBasis": "§ 79 odst. 1 NGŘ č. 33/2019"
          },
          {
            "id": "c1-2",
            "text": "Podáte hlášení OS s místem narušení a číslem stanoviště a vyjdete na ochoz věže.",
            "isCorrect": true,
            "feedback": "Správně. Pokus o útěk je závažnou mimořádnou událostí; hlásíte ho radiostanicí nebo signalizací a se zbraní připravenou k použití sledujete odsouzeného z ochozu.",
            "legalBasis": "§ 81 NGŘ č. 33/2019; § 5 písm. a) NGŘ č. 16/2022",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Ihned bez výzvy střílíte na odsouzeného, protože vnikl do zakázaného pásma věznice.",
            "isCorrect": false,
            "feedback": "Samotné vniknutí do zakázaného pásma střelbu neopravňuje. Použití zbraně předchází výzva s výstrahou a musí být splněny podmínky § 18.",
            "legalBasis": "§ 18 odst. 1 až 3 zákon č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Výzva",
        "description": "Odsouzený se dostal ke zdi a začíná šplhat. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Bez jakékoli výzvy vystřelíte varovný výstřel směrem k odsouzenému, aby se lekl.",
            "isCorrect": false,
            "feedback": "Varovný výstřel je donucovací prostředek a míří se do bezpečného prostoru určeného strážní dokumentací, nikdy směrem k osobě; výzva má předcházet.",
            "legalBasis": "§ 6 odst. 3 a § 17 odst. 2 písm. m) zákon č. 555/1992 Sb."
          },
          {
            "id": "c2-2",
            "text": "Jen jej ze strážní věže sledujete a čekáte na zásahovou hlídku, žádnou výzvu nedáváte.",
            "isCorrect": false,
            "feedback": "Strážný má povinnost nepřipustit útěk přes střežený úsek; pasivní vyčkávání tomu neodpovídá. Nejprve použijte výzvu.",
            "legalBasis": "§ 81 písm. a) NGŘ č. 33/2019; § 6 odst. 3 zákon č. 555/1992 Sb."
          },
          {
            "id": "c2-3",
            "text": "Zvoláte „jménem zákona“ a vyzvete jej k zanechání jednání s výstrahou použití zbraně.",
            "isCorrect": true,
            "feedback": "Správně. Výzva „jménem zákona“ s výstrahou předchází použití zbraně; upustit od ní lze jen při ohrožení života či zdraví, kdy zákrok nesnese odkladu.",
            "legalBasis": "§ 6 odst. 3 a § 18 odst. 3 zákon č. 555/1992 Sb.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Odsouzený neuposlechne",
        "description": "Odsouzený výzvu ani varovný výstřel nerespektuje a přelézá zeď. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Nelze-li jej zadržet jinak, použijete zbraň v palebném sektoru a šetříte jeho život.",
            "isCorrect": true,
            "feedback": "Správně. Zbraň lze použít k zamezení útěku ze střeženého objektu, je-li použití donucovacích prostředků zřejmě neúčinné, s nutnou opatrností a jen ve stanoveném směru a sektoru.",
            "legalBasis": "§ 18 odst. 1 písm. c), odst. 2 a 4 zákon č. 555/1992 Sb.; § 33 NGŘ č. 33/2019"
          },
          {
            "id": "c3-2",
            "text": "Vystřílíte dávky přes celý úsek zdi, aby byl útěk za každou cenu a okamžitě zmařen.",
            "isCorrect": false,
            "feedback": "Při použití zbraně musíte dbát nutné opatrnosti, neohrozit jiné osoby a co nejvíce šetřit život osoby; střílí se jen ve směru a sektoru ze strážní dokumentace.",
            "legalBasis": "§ 18 odst. 4 zákon č. 555/1992 Sb.; § 33 NGŘ č. 33/2019"
          },
          {
            "id": "c3-3",
            "text": "Nic dalšího nečiníte, po překonání zdi je útěk už jen věcí policie a následného pátrání.",
            "isCorrect": false,
            "feedback": "Strážný je povinen nepřipustit útěk přes střežený úsek a spolupracovat se sousedními stanovišti; rezignace na zákrok je porušením povinností.",
            "legalBasis": "§ 81 písm. a) NGŘ č. 33/2019"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-29",
    "title": "Modelová situace 29: Verbální napadení v jednací síni",
    "category": "Právo, etika & Donucovací prostředky",
    "badge": "§ 73 NGŘ č. 33/2019 & § 17 z. č. 555/1992 Sb. & NGŘ č. 41/2024",
    "difficulty": "Pokročilá",
    "briefing": "Jste velitelem eskorty k soudnímu jednání. Při vyhlašování rozsudku obviněný verbálně napadne předsedu senátu a nereaguje na výzvy příslušníků eskorty. Předseda senátu vydá pokyn, aby byl obviněný odveden do odkládací cely. Při přikládání pout obviněný verbálně napadá i členy eskorty.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Pokyn předsedy senátu",
        "description": "Předseda senátu nařídil odvést obviněného do odkládací cely. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Za urážky obviněného ihned připoutáte k lavici v jednací síni až na dvě celé hodiny.",
            "isCorrect": false,
            "feedback": "Omezení volného pohybu připoutáním je možné jen při fyzickém napadání, ohrožování vlastního života, poškozování majetku nebo pokusu o útěk; verbální urážky mezi důvody nepatří.",
            "legalBasis": "§ 17 odst. 5 zákon č. 555/1992 Sb."
          },
          {
            "id": "c1-2",
            "text": "S jištěním dalšího příslušníka mu přiložíte pouta i řetízky a odvedete ho do cely.",
            "isCorrect": true,
            "feedback": "Správně. Při předvádění mimo věznici se při přiložení pout vždy přikládají i předváděcí řetízky; v otázkách jednání se řídíte pokyny předsedy senátu.",
            "legalBasis": "§ 41 odst. 4 a § 73 odst. 1 písm. h) a s) NGŘ č. 33/2019",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Počkáte, až se obviněný sám uklidní, a pokyn předsedy senátu zatím neplníte.",
            "isCorrect": false,
            "feedback": "V otázkách souvisejících se soudním jednáním se velitel eskorty řídí pokyny předsedy senátu; vyčkávání může situaci vyhrotit.",
            "legalBasis": "§ 73 odst. 1 písm. s) NGŘ č. 33/2019"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Urážky při poutání",
        "description": "Obviněný při přikládání pout nadává členům eskorty. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Za urážky mu pouta přitáhnete pevněji, aby pocítil následky svého chování.",
            "isCorrect": false,
            "feedback": "Pouta nesmí být příliš utažená; donucovací prostředek nesmí sloužit k trestání a jeho použití musí být přiměřené.",
            "legalBasis": "§ 17 odst. 3 zákon č. 555/1992 Sb.; Metodika poutání"
          },
          {
            "id": "c2-2",
            "text": "Uložíte mu na místě kázeňský trest, protože jste při eskortě jeho nadřízený.",
            "isCorrect": false,
            "feedback": "Velitel eskorty kázeňskou pravomoc vůči obviněnému nemá. Předseda senátu může obviněného přenechat ke kázeňskému potrestání řediteli věznice.",
            "legalBasis": "§ 66 odst. 2 zákona č. 141/1961 Sb."
          },
          {
            "id": "c2-3",
            "text": "Zachováte klid, úkon dokončíte a výroky si doslovně poznamenáte pro záznam.",
            "isCorrect": true,
            "feedback": "Správně. Profesionální klid a přesná citace verbálních projevů jsou podkladem pro popis skutku v záznamu o kázeňském přestupku.",
            "legalBasis": "§ 16 odst. 3 NGŘ č. 41/2024",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Písemnosti",
        "description": "Eskorta se vrátila do věznice. Které písemnosti vyhotovíte?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Záznam o kázeňském přestupku a zápis do Knihy hlášení velitele eskorty.",
            "isCorrect": true,
            "feedback": "Správně. Verbální napadení je kázeňským přestupkem obviněného; do Knihy hlášení se zapisuje průběh jednání i jeho narušení. Záznam o použití DP jen při zákroku proti odporu.",
            "legalBasis": "§ 22 odst. 1 zákona č. 293/1993 Sb.; § 16 NGŘ č. 41/2024; § 73 odst. 1 písm. q) NGŘ č. 33/2019"
          },
          {
            "id": "c3-2",
            "text": "Hlášení závažné mimořádné události napadení eskorty na stálou službu GŘ.",
            "isCorrect": false,
            "feedback": "Verbální napadení není mimořádnou událostí podle § 5 ani § 6 NGŘ č. 16/2022; mimořádnou událostí by byl až fyzický útok.",
            "legalBasis": "§ 5 a § 6 písm. i) NGŘ č. 16/2022"
          },
          {
            "id": "c3-3",
            "text": "Nic nesepisujete, verbální napadení v jednací síni řeší výhradně předseda senátu.",
            "isCorrect": false,
            "feedback": "Jednání obviněného je zaviněným porušením jeho povinností a řeší se záznamem o kázeňském přestupku; průběh eskorty se vždy zaznamenává.",
            "legalBasis": "§ 21 a § 22 zákona č. 293/1993 Sb.; § 16 NGŘ č. 41/2024"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-30",
    "title": "Modelová situace 30: Agrese při příjmu do uzavřeného oddílu",
    "category": "Právo, etika & Donucovací prostředky",
    "badge": "§ 12 z. č. 555/1992 Sb. & § 72 NGŘ č. 2/2026 & NGŘ č. 41/2024",
    "difficulty": "Základní",
    "briefing": "Jste dozorcem v oddělení výkonu kázeňských trestů. Při příjmu odsouzeného do uzavřeného oddělení u něj najdete škrtátko, zápalky, papírky a tabák, které chtěl pronést na celu. Prosí o vrácení části tabáku; po upozornění na zákaz kouření začne kopat do zdi, jde k vám a křičí: „Všechno tady rozmlátím, vraťte mi aspoň ten tabák.“",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Nalezené věci",
        "description": "Při osobní prohlídce jste našel tabák a potřeby ke kouření. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Tabák mu ponecháte, jen škrtátko a zápalky odeberete, aby se situace uklidnila.",
            "isCorrect": false,
            "feedback": "Při celodenním umístění do uzavřeného oddílu a v samovazbě není dovoleno kouřit; věci, které tam odsouzený nesmí mít, se odebírají všechny.",
            "legalBasis": "§ 72 písm. f) NGŘ č. 2/2026"
          },
          {
            "id": "c1-2",
            "text": "Věci mu odejmete, sepíšete záznam o odnětí a seznam, který odsouzený podepíše.",
            "isCorrect": true,
            "feedback": "Správně. Věc, kterou má odsouzený neoprávněně u sebe, se odejme, sepíše se služební záznam o odnětí věci a seznam odebraných věcí stvrzený podpisem.",
            "legalBasis": "§ 12 zákon č. 555/1992 Sb.; § 72 písm. f) NGŘ č. 2/2026",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Věci na místě před jeho očima zničíte, aby bylo jasné, že je už nedostane.",
            "isCorrect": false,
            "feedback": "Odňaté věci se vloží do označeného obalu a předají se se záznamem nadřízenému; slouží i jako důkaz v kázeňském řízení.",
            "legalBasis": "§ 12 zákon č. 555/1992 Sb.; učební text Prohlídky, s. 10–11"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Agresivní chování",
        "description": "Odsouzený kope do zdi, jde k vám a vyhrožuje. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Ustoupíte mu a část tabáku vrátíte jako kompromis, aby se konflikt co nejdřív ukončil.",
            "isCorrect": false,
            "feedback": "Kompromis v rozporu s předpisy není přípustný; dozorce jedná asertivně – klidně, věcně a jednoznačně – a na vydírání nepřistupuje.",
            "legalBasis": "§ 72 NGŘ č. 2/2026; učební text Psychologie, Asertivita"
          },
          {
            "id": "c2-2",
            "text": "Bez výzvy na něj ihned použijete hmaty a chvaty, protože vám vyhrožoval.",
            "isCorrect": false,
            "feedback": "Před zákrokem se zpravidla použije domluva, výzva nebo varování; donucovací prostředky až neuposlechne-li a pokračuje v jednání.",
            "legalBasis": "§ 6 odst. 3 a § 17 zákon č. 555/1992 Sb."
          },
          {
            "id": "c2-3",
            "text": "Klidně a věcně jej vyzvete k zanechání jednání a na vrácení tabáku nepřistoupíte.",
            "isCorrect": true,
            "feedback": "Správně. Domluva a výzva k zanechání protiprávního jednání mají přednost; teprve při neuposlechnutí lze použít přiměřené donucovací prostředky.",
            "legalBasis": "§ 6 odst. 3 zákon č. 555/1992 Sb.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Záznam o kázeňském přestupku",
        "description": "Odsouzený se uklidnil. Jak formulujete porušení v popisu skutku?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Uvedete jen porušení vnitřního řádu věznice, to pro kázeňské řízení plně postačí.",
            "isCorrect": false,
            "feedback": "Nikdy nelze uvést pouze porušení vnitřního řádu věznice; popis skutku musí uvést porušení zákonné povinnosti.",
            "legalBasis": "§ 16 odst. 3 NGŘ č. 41/2024"
          },
          {
            "id": "c3-2",
            "text": "Uvedete porušení § 28 odst. 1 zákona č. 169/1999 Sb., čas, místo, průběh a svědky.",
            "isCorrect": true,
            "feedback": "Správně. Popis skutku obsahuje přesný čas a místo, způsob a průběh jednání, porušení zákonné povinnosti (kázeňský přestupek podle § 46 odst. 1) a seznam svědků.",
            "legalBasis": "§ 16 odst. 3 NGŘ č. 41/2024; § 28 odst. 1 a § 46 odst. 1 zákona č. 169/1999 Sb."
          },
          {
            "id": "c3-3",
            "text": "Záznam nesepíšete, postačí ústní hlášení inspektorovi dozorčí služby na konci směny.",
            "isCorrect": false,
            "feedback": "Kázeňský přestupek se dokumentuje záznamem na tiskopisu podle přílohy č. 4 NGŘ č. 41/2024; ústní hlášení nestačí.",
            "legalBasis": "§ 16 a příloha č. 4 NGŘ č. 41/2024"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-31",
    "title": "Modelová situace 31: Výtržnost v ordinaci lékaře",
    "category": "Právo, etika & Donucovací prostředky",
    "badge": "§ 17 a 20 z. č. 555/1992 Sb. & § 28 z. č. 169/1999 Sb.",
    "difficulty": "Pokročilá",
    "briefing": "Jste dozorcem na zdravotnickém oddělení. Předvedl jste odsouzeného ke vstupní prohlídce a opustil ordinaci. Odsouzený odmítá pokyn lékaře svléknout se do spodního prádla, křičí: „Dokud mi nedáte léky, tak se nesvléknu!“ a shodí ze stolu všechny předměty a dokumentaci.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Hluk z ordinace",
        "description": "Z ordinace se ozývá křik a rámus. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Vyčkáte za dveřmi, protože vyšetření je důvěrné a do ordinace nemáte vůbec vstupovat.",
            "isCorrect": false,
            "feedback": "Při předvedení k lékaři příslušník střeží vězněnou osobu tak, aby nenapadla lékaře a zdravotnický personál a neodcizila léky či nástroje.",
            "legalBasis": "§ 86 odst. 2 NGŘ č. 33/2019"
          },
          {
            "id": "c1-2",
            "text": "Okamžitě vstoupíte, postavíte se mezi odsouzeného a personál a přivoláte posilu.",
            "isCorrect": true,
            "feedback": "Správně. Zabráníte napadení personálu, lékaře a sestru vyzvete k ústupu a radiostanicí přivoláte dalšího dozorce a vyrozumíte IDS.",
            "legalBasis": "§ 86 odst. 2 NGŘ č. 33/2019; § 3 NGŘ č. 2/2026",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Požádáte lékaře, aby odsouzenému léky vydal, a situace se tak sama brzy uklidní.",
            "isCorrect": false,
            "feedback": "O vydání léků rozhoduje výhradně lékař; o jejich vydání se s odsouzeným nevyjednává a jeho nátlaku se neustupuje.",
            "legalBasis": "§ 28 odst. 1 zákona č. 169/1999 Sb."
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Výzva odsouzenému",
        "description": "Odsouzený stojí u stolu a dál křičí. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Slíbíte mu léky, pokud se svlékne, abyste vstupní prohlídku urychlili.",
            "isCorrect": false,
            "feedback": "Slib léků je nepřípustné vyjednávání – o lécích rozhoduje lékař. Odsouzený je povinen podrobit se vstupní prohlídce.",
            "legalBasis": "§ 28 odst. 2 písm. c) zákona č. 169/1999 Sb."
          },
          {
            "id": "c2-2",
            "text": "„Jménem zákona“ ho vyzvete, aby zanechal ničení a splnil pokyn lékaře.",
            "isCorrect": true,
            "feedback": "Správně. Domluva a výzva mají přednost před zákrokem; odsouzený je povinen plnit pokyny a podrobit se vstupní lékařské prohlídce.",
            "legalBasis": "§ 6 odst. 3 zákon č. 555/1992 Sb.; § 28 odst. 1 a 2 písm. c) zákona č. 169/1999 Sb.",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-3",
            "text": "Bez výzvy mu hned přiložíte pouta s opaskem, protože shodil dokumentaci.",
            "isCorrect": false,
            "feedback": "Před použitím donucovacích prostředků se zpravidla použije výzva; zvolený prostředek musí být přiměřený.",
            "legalBasis": "§ 6 odst. 3 a § 17 odst. 3 zákon č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Neuposlechnutí výzvy",
        "description": "Odsouzený výzvu ignoruje a dál ničí vybavení ordinace. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Použijete obušek s údery do hlavy, aby ničení ordinace okamžitě ustalo.",
            "isCorrect": false,
            "feedback": "Prostředek musí být přiměřený účelu zákroku; údery do hlavy jsou u neozbrojeného odsouzeného hrubě nepřiměřené.",
            "legalBasis": "§ 17 odst. 3 zákon č. 555/1992 Sb."
          },
          {
            "id": "c3-2",
            "text": "Nic neděláte, škodu na zařízení vyřeší lékař s vedením zdravotnického zařízení.",
            "isCorrect": false,
            "feedback": "Odsouzený úmyslně poškozuje majetek a narušuje pořádek; dozorce je oprávněn a povinen zakročit.",
            "legalBasis": "§ 17 odst. 1 zákon č. 555/1992 Sb.; § 28 odst. 4 zákona č. 169/1999 Sb."
          },
          {
            "id": "c3-3",
            "text": "S dalším příslušníkem užijete hmaty a pouta a použití oznámíte nadřízenému.",
            "isCorrect": true,
            "feedback": "Správně. Přiměřené hmaty a chvaty a pouta; po zákroku případná první pomoc, bezodkladné oznámení nadřízenému a Záznam o použití DP podle PGŘ č. 03/2024.",
            "legalBasis": "§ 17 odst. 1 až 3 a § 20 zákon č. 555/1992 Sb."
          }
        ]
      }
    ]
  },
  {
    "id": "sc-32",
    "title": "Modelová situace 32: Eskorta k hlavnímu líčení a sejmutí pout",
    "category": "Eskorty & Střelba",
    "badge": "§ 73 NGŘ č. 33/2019 & § 17 z. č. 555/1992 Sb.",
    "difficulty": "Pokročilá",
    "briefing": "Denním rozkazem VOVS jste velen jako velitel eskorty k soudnímu líčení; s vámi jsou strážný, psovod se služebním psem a řidič. Na pokyn VOVS má obviněný přiložena pouta s poutacím opaskem a pouta na nohy. Předsedovi senátu předáte „Informaci pro rozhodnutí předsedy senátu o ponechání DP v jednací síni“.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Eskortní místnost soudu",
        "description": "Obviněný je umístěn v eskortní místnosti soudu. Běžně se po umístění DP snímají. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "DP sejmu jako obvykle, v odkládací cele už nejsou potřeba.",
            "isCorrect": false,
            "feedback": "Sejmutí po umístění do eskortní místnosti se neprovádí, brání-li tomu mimořádné bezpečnostní důvody; pokyn VOVS k poutání opaskem a nožními pouty takovým důvodem je.",
            "legalBasis": "§ 73 odst. 1 NGŘ č. 33/2019"
          },
          {
            "id": "c1-2",
            "text": "DP ponechám, určím strážného ke střežení cely a informuji JS.",
            "isCorrect": true,
            "feedback": "Správně. Pro mimořádné bezpečnostní důvody DP ponecháte, při předvádění přiložíte i předváděcí řetízky, strážného jmenovitě zapíšete do Knihy hlášení a o příchodu eskorty informujete justiční stráž.",
            "legalBasis": "§ 73 odst. 1 písm. h), k), p) NGŘ č. 33/2019",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Obviněného nechám v cele a jdu projednat jednání s předsedou senátu.",
            "isCorrect": false,
            "feedback": "Obviněný musí být v odkládací cele stále střežen určeným příslušníkem, kterého velitel eskorty jmenovitě eviduje včetně časového rozsahu.",
            "legalBasis": "§ 73 odst. 1 NGŘ č. 33/2019"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Rozhodnutí předsedy senátu",
        "description": "Předseda senátu si přečetl informaci a přesto rozhodl, že obviněnému budou v jednací síni DP sejmuty. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Odmítnu, o způsobu poutání obviněného rozhoduje jen vedoucí oddělení.",
            "isCorrect": false,
            "feedback": "V otázkách souvisejících se soudním jednáním se velitel eskorty řídí pokyny předsedy senátu; informace je jen podkladem pro jeho rozhodnutí.",
            "legalBasis": "§ 73 odst. 1 písm. s) NGŘ č. 33/2019"
          },
          {
            "id": "c2-2",
            "text": "DP sejmu už v eskortní místnosti, ať je obviněný klidnější.",
            "isCorrect": false,
            "feedback": "Rozhodnutí se týká jen jednací síně. DP se snímají až v síni bezprostředně před zahájením jednání, pod jištěním strážným.",
            "legalBasis": "Učební text Eskortní služba; Metodika poutání"
          },
          {
            "id": "c2-3",
            "text": "Rozhodnutí respektuji, upozorním na rizika a DP sejmu až v síni.",
            "isCorrect": true,
            "feedback": "Správně. Upozorníte na rizika z informace a DP sejmete v síni před zahájením podle Metodiky poutání, jištěn strážným; strážný má stále na dohled ruce obviněného a okna síně jsou zavřena.",
            "legalBasis": "§ 73 odst. 1 písm. r) a s) NGŘ č. 33/2019",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Přestávka v jednání",
        "description": "Předseda senátu vyhlásí přestávku. Rodina obviněného žádá o krátký rozhovor. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Před odvedením opět přiložím DP; rozhovor jen se svolením předsedy.",
            "isCorrect": true,
            "feedback": "Správně. Mimo síň platí rozhodnutí vedoucího oddělení o poutání. Rozmluvu s rodinou nebo obhájcem lze umožnit jen se svolením předsedy senátu, v prostoru stálého střežení a mimo eskortní místnost.",
            "legalBasis": "§ 41 odst. 3 a 4 a § 73 odst. 1 NGŘ č. 33/2019"
          },
          {
            "id": "c3-2",
            "text": "Obviněného odvedu bez pout, rozhodnutí soudu platí po celý zbytek dne.",
            "isCorrect": false,
            "feedback": "Rozhodnutí předsedy senátu se vztahuje jen na jednací síň; mimo ni se DP přikládají podle rozhodnutí vedoucího oddělení.",
            "legalBasis": "§ 41 odst. 3 NGŘ č. 33/2019"
          },
          {
            "id": "c3-3",
            "text": "Rozhovor s rodinou umožním v eskortní místnosti, tam je klid.",
            "isCorrect": false,
            "feedback": "Rozmluva je možná jen se svolením předsedy senátu a vždy mimo eskortní místnost, v prostoru, kde lze obviněného stále střežit.",
            "legalBasis": "§ 73 odst. 1 NGŘ č. 33/2019; učební text Eskortní služba"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-33",
    "title": "Modelová situace 33: Kontrola u vchodu do budovy soudu",
    "category": "Ostraha, vstupy & Justiční stráž",
    "badge": "§ 148 a § 150 NGŘ č. 33/2019 & § 7 z. č. 6/2002 Sb.",
    "difficulty": "Základní",
    "briefing": "Vykonáváte službu justiční stráže u vchodu do budovy soudu. Žena, která se chce zúčastnit veřejného jednání, tvrdí, že u sebe nic kovového nemá, detekční rám však signalizuje kov. Žena odmítá další úkony a chce vstoupit do budovy.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Signál detekčního rámu",
        "description": "Rám u ženy signalizuje kov. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Vyzvu ji k odložení kovu a dohledám ji ručním detektorem.",
            "isCorrect": true,
            "feedback": "Správně. Po odložení předmětů použijete ruční detektor ve stejné vzdálenosti od těla bez dotyku a vyzvete ji k opětovnému průchodu rámem. Jednáte slušně, taktně a rozhodně.",
            "legalBasis": "§ 148 odst. 5 NGŘ č. 33/2019",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-2",
            "text": "Ihned ji sám prohmatám, abych zjistil zdroj signálu.",
            "isCorrect": false,
            "feedback": "O osobní prohlídce rozhoduje VIJS nebo velící příslušník a provádí ji osoba stejného pohlaví; nejprve se postupuje dohledáním ručním detektorem.",
            "legalBasis": "§ 150 NGŘ č. 33/2019"
          },
          {
            "id": "c1-3",
            "text": "Vpustím ji, protože sama prohlásila, že nic kovového nemá.",
            "isCorrect": false,
            "feedback": "Signál detektoru je důvodným podezřením, že osoba může mít nebezpečný předmět; bez provedení kontroly ji do budovy nevpustíte.",
            "legalBasis": "§ 150 odst. 4 NGŘ č. 33/2019"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Odmítnutí kontroly",
        "description": "Žena další kontrolu odmítá a trvá na vstupu. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Zadržím ji a prohlídku provedu i bez jejího souhlasu.",
            "isCorrect": false,
            "feedback": "Osobě, která se kontrole odmítne podrobit, se vstup nepovolí; donucovací prostředky přicházejí v úvahu až při pokusu o vstup nebo narušení pořádku.",
            "legalBasis": "Instrukce MS č. 8/2022, § 4; § 22 z. č. 555/1992 Sb."
          },
          {
            "id": "c2-2",
            "text": "Poučím ji o § 7, nevpustím ji a věc ohlásím VIJS.",
            "isCorrect": true,
            "feedback": "Správně. Každý je povinen podrobit se při vstupu prohlídce. Odmítnutí ohlásíte VIJS nebo velícímu příslušníkovi, justiční stráž informuje předsedu soudu nebo pověřeného zaměstnance a řídí se jeho pokyny.",
            "legalBasis": "§ 7 z. č. 6/2002 Sb.; § 150 odst. 5 NGŘ č. 33/2019",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-3",
            "text": "Pustím ji, ale nechám ji doprovázet kolegou.",
            "isCorrect": false,
            "feedback": "Justiční stráž nevpustí do budovy osobu, která se prohlídce odmítne podrobit; doprovod kontrolu nenahrazuje.",
            "legalBasis": "Instrukce MS č. 8/2022, § 4"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Osobní prohlídka",
        "description": "Žena si to rozmyslí a VIJS rozhodne o osobní prohlídce. Jak ji zajistíte?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Provedu ji hned v hale, ať je vše transparentní.",
            "isCorrect": false,
            "feedback": "Prohlídku provádí osoba stejného pohlaví na určeném místě mimo zraky veřejnosti a bez ponížení lidské důstojnosti.",
            "legalBasis": "§ 150 odst. 2 a 3 NGŘ č. 33/2019"
          },
          {
            "id": "c3-2",
            "text": "Provede ji příslušnice za přítomnosti druhé příslušnice.",
            "isCorrect": true,
            "feedback": "Správně. Ženu nejprve seznámíte s průběhem, s právem prohlídku odmítnout a s následky. Prohlídku provede příslušnice s hygienickými rukavicemi, za přítomnosti druhé příslušnice, a sepíše se služební záznam.",
            "legalBasis": "§ 150 NGŘ č. 33/2019; Studijní opora Profesní etika"
          },
          {
            "id": "c3-3",
            "text": "Provedu ji já, kolega bude stát opodál jako nezávislý svědek.",
            "isCorrect": false,
            "feedback": "Prohlíží osoba stejného pohlaví, k jakému se prohlížená osoba hlásí; není-li příslušnice na místě, vyžádá se přes VIJS.",
            "legalBasis": "§ 150 odst. 3 NGŘ č. 33/2019"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-34",
    "title": "Modelová situace 34: Vyklizení jednací síně",
    "category": "Ostraha, vstupy & Justiční stráž",
    "badge": "§ 22 odst. 4 z. č. 555/1992 Sb. & § 142 NGŘ č. 33/2019",
    "difficulty": "Pokročilá",
    "briefing": "Zajišťujete jako příslušník justiční stráže soudní jednání s nebezpečným obžalovaným, souzeným pro vraždu a znásilnění, kterého do síně předvedla eskorta vězeňské stráže. Předseda senátu rozhodne, že jednání bude pokračovat bez přítomnosti veřejnosti, a někteří přítomní odmítají síň opustit.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Před zahájením jednání",
        "description": "Blíží se zahájení jednání. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Převezmu od eskorty přímé střežení obžalovaného v síni.",
            "isCorrect": false,
            "feedback": "Střežení vězně v jednací síni zajišťuje eskorta vězeňské stráže; justiční stráž zajišťuje pořádek a ochranu přítomných osob.",
            "legalBasis": "§ 22 odst. 4 z. č. 555/1992 Sb.; § 73 NGŘ č. 33/2019"
          },
          {
            "id": "c1-2",
            "text": "Seznámím se s riziky věci a domluvím spolupráci s eskortou.",
            "isCorrect": true,
            "feedback": "Správně. Příslušník JS se před jednáním seznámí s charakterem a riziky věci, dbá pokynů předsedy senátu a spolupracuje s vězeňskou stráží i policií.",
            "legalBasis": "§ 140 odst. 1 NGŘ č. 33/2019",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Bez pokynu předsedy senátu sám omezím vstup veřejnosti do síně.",
            "isCorrect": false,
            "feedback": "Pořádkovou službu při vstupu do síně vykonává JS na pokyn předsedy senátu, pokud bylo rozhodnuto o vyloučení veřejnosti nebo opatření proti přeplňování.",
            "legalBasis": "§ 22 odst. 4 písm. c) z. č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Výzva k opuštění síně",
        "description": "Předseda senátu vyloučil veřejnost; několik osob odmítá odejít. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Všichni příslušníci naráz vyzvou každý svou skupinu osob.",
            "isCorrect": false,
            "feedback": "Komunikaci s veřejností a výzvy zajišťuje vždy jeden příslušník, ostatní plní jeho pokyny.",
            "legalBasis": "§ 142 NGŘ č. 33/2019"
          },
          {
            "id": "c2-2",
            "text": "Osoby bez výzvy ihned vyvedeme hmaty a chvaty.",
            "isCorrect": false,
            "feedback": "Před zákrokem je nutné použít výzvu se slovy „jménem zákona“ a upozornit na použití donucovacích prostředků, dovolují-li to okolnosti.",
            "legalBasis": "§ 6 odst. 3 z. č. 555/1992 Sb."
          },
          {
            "id": "c2-3",
            "text": "Jeden příslušník vyzve „jménem zákona“ a upozorní na DP.",
            "isCorrect": true,
            "feedback": "Správně. Určený příslušník vyzve přítomné k opuštění síně a při neuposlechnutí zopakuje výzvu „jménem zákona“ s upozorněním, že k vyklizení budou použity zákonné donucovací prostředky; dbáte, aby veřejnost nepřišla do kontaktu s obžalovaným.",
            "legalBasis": "§ 6 odst. 3 písm. b) z. č. 555/1992 Sb.; § 142 odst. 2 NGŘ č. 33/2019",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Vyklizení síně",
        "description": "Ani na opakovanou výzvu osoby nereagují. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Vyvedeme je hmaty a chvaty; nezvládneme-li to, VIJS žádá PČR.",
            "isCorrect": true,
            "feedback": "Správně. Počet zasahujících je přiměřený, pozornost se věnuje vůdčím osobám. Použití DP oznámíte VIJS, sepíšete služební záznam a záznam o použití DP a u vyvedených zjistíte totožnost.",
            "legalBasis": "§ 17 odst. 2 písm. a) a § 20 z. č. 555/1992 Sb.; § 142 a § 151 NGŘ č. 33/2019"
          },
          {
            "id": "c3-2",
            "text": "Proti všem použijeme obušek, aby síň byla co nejrychleji prázdná.",
            "isCorrect": false,
            "feedback": "Donucovací prostředek musí být přiměřený účelu zákroku; k vyvedení pasivních osob postačí hmaty a chvaty sebeobrany.",
            "legalBasis": "§ 17 odst. 3 z. č. 555/1992 Sb."
          },
          {
            "id": "c3-3",
            "text": "Necháme je sedět a doporučíme předsedovi odročit jednání.",
            "isCorrect": false,
            "feedback": "Na pokyn předsedy senátu justiční stráž provádí rozhodnutí o vykázání osob a o vyklizení jednací síně; nečinnost není na místě.",
            "legalBasis": "§ 22 odst. 4 písm. a) z. č. 555/1992 Sb."
          }
        ]
      }
    ]
  },
  {
    "id": "sc-35",
    "title": "Modelová situace 35: Doprovod vykonavatelky při odebrání dítěte",
    "category": "Právo, etika & Donucovací prostředky",
    "badge": "§ 143 NGŘ č. 33/2019 & § 19 z. č. 555/1992 Sb.",
    "difficulty": "Expertní",
    "briefing": "Zajišťujete doprovod soudní vykonavatelky při výkonu rozhodnutí o odebrání 13letého chlapce. Rodiče výkonu rozhodnutí brání a nezletilý fyzicky napadne vykonavatelku.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Příchod na místo",
        "description": "Přicházíte s vykonavatelkou k domu, rodiče jsou rozrušení. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Vstoupím první a chlapce sám odvedu k vozidlu.",
            "isCorrect": false,
            "feedback": "Příslušník se na úkonech výkonu rozhodnutí nepodílí a nezajišťuje odebírané dítě; neměl by vstupovat první, oprávněnou osobou je vykonavatelka.",
            "legalBasis": "§ 143 NGŘ č. 33/2019; učební text Justiční stráž"
          },
          {
            "id": "c1-2",
            "text": "Rodiče pro jistotu hned spoutám, aby nemohli bránit výkonu rozhodnutí.",
            "isCorrect": false,
            "feedback": "Donucovací prostředky lze použít jen k dosažení účelu zákroku a přiměřeně; preventivní poutání nekonfliktních osob zákon nepřipouští.",
            "legalBasis": "§ 6 a § 17 odst. 3 z. č. 555/1992 Sb."
          },
          {
            "id": "c1-3",
            "text": "Vykonavatelku nechám jít první a sleduji chování všech osob.",
            "isCorrect": true,
            "feedback": "Správně. Zajišťujete osobní ochranu vykonavatelky, neděláte nic, co by odvádělo pozornost, a jste oprávněn zjistit totožnost osob, vůči nimž úkon směřuje.",
            "legalBasis": "§ 22 odst. 1 a 5 písm. d) z. č. 555/1992 Sb.; § 143 a § 147 NGŘ č. 33/2019",
            "nextStepId": "step-2"
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Útok nezletilého",
        "description": "Třináctiletý chlapec začne vykonavatelku bít a kopat. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Po výzvě ho odvrátím hmaty a chvaty sebeobrany.",
            "isCorrect": true,
            "feedback": "Správně. Proti osobě zjevně mladší 15 let nelze použít údery a kopy, slzotvorný prostředek, obušek ani zbraň, ledaže útok bezprostředně ohrožuje život nebo zdraví a nelze jej odvrátit jinak.",
            "legalBasis": "§ 19 odst. 1 písm. a) z. č. 555/1992 Sb.; § 151 NGŘ č. 33/2019",
            "nextStepId": "step-3"
          },
          {
            "id": "c2-2",
            "text": "Použiji slzotvorný prostředek, útočí na vykonavatelku.",
            "isCorrect": false,
            "feedback": "Slzotvorný prostředek proti osobě zjevně mladší 15 let použít nelze; útok chlapce bez ohrožení života tuto výjimku neodůvodňuje.",
            "legalBasis": "§ 19 odst. 1 z. č. 555/1992 Sb."
          },
          {
            "id": "c2-3",
            "text": "Zasáhnu údery a kopy, ať útok rychle skončí.",
            "isCorrect": false,
            "feedback": "Údery a kopy sebeobrany jsou proti osobě zjevně mladší 15 let vyloučeny; použít lze zejména hmaty a chvaty.",
            "legalBasis": "§ 19 odst. 1 písm. a) z. č. 555/1992 Sb."
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Vyhrocení a ukončení",
        "description": "Rodiče se přidávají a situace se vymyká kontrole. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Pokračujeme v úkonu, dokud se dítě nepodaří odebrat a odvézt.",
            "isCorrect": false,
            "feedback": "Při ohrožení střežené osoby musí příslušník zajistit její odchod z ohrožené oblasti i za cenu, že výkon rozhodnutí nebude dokončen.",
            "legalBasis": "Učební text Justiční stráž; § 143 NGŘ č. 33/2019"
          },
          {
            "id": "c3-2",
            "text": "Odvedu vykonavatelku do bezpečí a přivolám Policii ČR.",
            "isCorrect": true,
            "feedback": "Správně. Poté poskytnete případnou první pomoc, sepíšete záznam o použití DP (u jiné než vězněné osoby s číslem dokladu totožnosti) a nejpozději následující pracovní den informujete VIJS.",
            "legalBasis": "§ 20 a § 22 odst. 8 z. č. 555/1992 Sb.; § 143 NGŘ č. 33/2019"
          },
          {
            "id": "c3-3",
            "text": "Záznam nepíšu, nešlo o zákrok proti vězněné osobě.",
            "isCorrect": false,
            "feedback": "Každé použití donucovacího prostředku je třeba oznámit nadřízenému a sepsat o něm záznam, bez ohledu na to, proti komu byl použit.",
            "legalBasis": "§ 20 z. č. 555/1992 Sb.; ML č. 5/2014, § 4"
          }
        ]
      }
    ]
  },
  {
    "id": "sc-36",
    "title": "Modelová situace 36: Doručení obálky typu I",
    "category": "Ostraha, vstupy & Justiční stráž",
    "badge": "§ 22 odst. 5 písm. c) z. č. 555/1992 Sb. & § 49 OSŘ",
    "difficulty": "Základní",
    "briefing": "Velitel místní jednotky vás určil k doručení písemností předsedy soudu. Jednou ze zásilek je doporučený dopis v obálce typu I. Po příchodu na adresu zjistíte, že adresát není v místě bydliště přítomen.",
    "steps": [
      {
        "id": "step-1",
        "title": "Krok 1: Adresát nezastižen",
        "description": "Soused se nabízí, že dopis adresátovi předá. Jak budete jednat?",
        "choices": [
          {
            "id": "c1-1",
            "text": "Dopis předám sousedovi proti podpisu na doručence.",
            "isCorrect": false,
            "feedback": "Náhradní doručení sousedovi ani členu domácnosti OSŘ nezná; za adresáta může převzít jen osoba zmocněná plnou mocí udělenou před provozovatelem poštovních služeb.",
            "legalBasis": "§ 50a odst. 1 z. č. 99/1963 Sb."
          },
          {
            "id": "c1-2",
            "text": "Písemnost uložím u okresního soudu a zanechám výzvu.",
            "isCorrect": true,
            "feedback": "Správně. Obálka typu I umožňuje náhradní doručení: písemnost se uloží u okresního soudu, v jehož obvodu je místo doručení, a adresátovi se zanechá písemná výzva k vyzvednutí.",
            "legalBasis": "§ 49 odst. 2 a 3 písm. c) z. č. 99/1963 Sb.",
            "nextStepId": "step-2"
          },
          {
            "id": "c1-3",
            "text": "Dopis vhodím do domovní schránky, tím je doručen okamžitě.",
            "isCorrect": false,
            "feedback": "Doručení vhozením do schránky bez uložení platí u obálky typu III; u obálky typu I se písemnost ukládá a vhazuje se až po marném uplynutí 10 dnů.",
            "legalBasis": "§ 49 odst. 4 a § 50 odst. 1 z. č. 99/1963 Sb."
          }
        ]
      },
      {
        "id": "step-2",
        "title": "Krok 2: Vyplnění doručenky",
        "description": "Musíte vyplnit doručenku. Jak budete jednat?",
        "choices": [
          {
            "id": "c2-1",
            "text": "Napíšu jen „nezastižen“ a doručenku odevzdám soudu.",
            "isCorrect": false,
            "feedback": "Doručenka je veřejnou listinou a musí obsahovat předepsané údaje; pouhá poznámka nestačí.",
            "legalBasis": "§ 50f odst. 3 a § 50g z. č. 99/1963 Sb."
          },
          {
            "id": "c2-2",
            "text": "Doručenku nechám vyplnit až pracovníky podatelny soudu.",
            "isCorrect": false,
            "feedback": "Údaje o průběhu doručení vyznačuje a podpisem stvrzuje doručovatel, tedy doručující orgán.",
            "legalBasis": "§ 50g z. č. 99/1963 Sb."
          },
          {
            "id": "c2-3",
            "text": "Vyznačím den nezastižení, uložení a výzvy, podepíšu.",
            "isCorrect": true,
            "feedback": "Správně. Uvedete den, kdy adresát nebyl zastižen, den připravení k vyzvednutí, zanechání výzvy, své jméno, příjmení, podpis a otisk razítka.",
            "legalBasis": "§ 50g odst. 1 a 2 z. č. 99/1963 Sb.",
            "nextStepId": "step-3"
          }
        ]
      },
      {
        "id": "step-3",
        "title": "Krok 3: Další pokus o doručení",
        "description": "Při dalším doručování je branka zamčená a adresát na vás z pozemku míří zbraní. Jak budete jednat?",
        "choices": [
          {
            "id": "c3-1",
            "text": "Vzdálím se z ohrožené oblasti a přivolám Policii ČR.",
            "isCorrect": true,
            "feedback": "Správně. Na pozemek nevstupujete překonáním překážek a při ohrožení zbraní se vzdálíte a přivoláte policii; průběh zapíšete do Knihy hlášení a podáte hlášení VIJS.",
            "legalBasis": "§ 22 odst. 8 z. č. 555/1992 Sb.; § 128 NGŘ č. 33/2019; učební text Justiční stráž"
          },
          {
            "id": "c3-2",
            "text": "Přelezu zamčenou branku, abych doručení stihl ještě dokončit.",
            "isCorrect": false,
            "feedback": "Na pozemek adresáta se nevstupuje překonáním stavebních překážek, například uzamčené branky.",
            "legalBasis": "Učební text Justiční stráž, s. 16"
          },
          {
            "id": "c3-3",
            "text": "Vytasím zbraň a vyzvu adresáta k převzetí dopisu.",
            "isCorrect": false,
            "feedback": "Doručení není důvodem ke konfrontaci; podle učebního textu se má příslušník ohrožovaný zbraní přednostně vzdálit a přivolat policii.",
            "legalBasis": "§ 18 a § 22 odst. 8 z. č. 555/1992 Sb."
          }
        ]
      }
    ]
  }
];
