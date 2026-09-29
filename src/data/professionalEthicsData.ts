/**
 * Výchozí obsah záložky Profesní etika.
 *
 * Dřív byl natvrdo v komponentách (PECodeOfEthics, PEAnticorruption,
 * PEConventions, PESimulator) a lektor ho neměl jak upravit. Teď ho lektor
 * a správce mění přes překryv content_blocks — druhy 'ethics_dilemma'
 * a 'study_section' (migrace 042). Tenhle soubor zůstává výchozí podobou,
 * ke které se dá kdykoli vrátit.
 */
import { StudySection, StudySectionFields, sectionItem } from './studySections';

// ─── Trenažér etických dilemat ───────────────────────────────────────────────

export interface DilemmaOption {
  text: string;
  correct: boolean;
  explanation: string;
}

export interface DilemmaScenario {
  id: string;
  title: string;
  description: string;
  options: DilemmaOption[];
}

export const defaultDilemmaScenarios: DilemmaScenario[] = [
  {
    id: 'dilema-1',
    title: 'Použití donucovacích prostředků při napadení kolegy',
    description: 'Jste na směně v oddílové chodbě. Odsouzený Petr Novák náhle zaútočí na vašeho kolegu - příslušníka VS ČR - a začne ho fyzicky napadat pěstmi. Kolega padá na zem a hrozí vážné zranění. Jste vyzbrojeni obuškem a pouty.',
    options: [
      {
        text: 'Bezodkladně zakročit a použít přiměřené donucovací prostředky (obušek, hmaty, chvaty) k ochraně kolegy, povolat posilu a neprodleně věc hlásit.',
        correct: true,
        explanation: 'Správně! Dle § 17 odst. 1 písm. b) z. č. 555/1992 Sb. je příslušník oprávněn a povinen použít donucovacích prostředků k ochraně jiné osoby. Nečinnost by byla porušením zákonné povinnosti.'
      },
      {
        text: 'Přivolat pomoc po telefonu a čekat, protože zasahovat samotný je nebezpečné.',
        correct: false,
        explanation: 'Chyba! Příslušník má ze zákona i eticky povinnost chránit životy ohrožených osob. Nečinnost by vedla ke smrti kolegy a byla by hrubým selháním povinností.'
      },
      {
        text: 'Zbraň použít, ale po zneškodnění útočníka mu neposkytovat první pomoc, protože si zranění způsobil sám svým protiprávním útokem.',
        correct: false,
        explanation: 'Chyba! Dle § 20 z. č. 555/1992 Sb. i zásad profesní etiky je příslušník povinen poskytnout první pomoc každé zraněné osobě, i pachateli.'
      }
    ]
  },
  {
    id: 'dilema-2',
    title: 'Genderový standard osobní prohlídky vstupující osoby',
    description: 'Na hlavní bránu vazební věznice dorazila advokátka k návštěvě klienta. Rámový detektor kovů opakovaně signalizuje přítomnost kovu v oblasti oděvu. Je nutné provést osobní prohlídku.',
    options: [
      {
        text: 'Osobní prohlídku provede příslušnice (žena) za přítomnosti další příslušnice jako svědkyně (celkem 2 ženy). Vyloučí se přítomnost mužů a chráněna je důstojnost i transparentnost.',
        correct: true,
        explanation: 'Přesně tak! Dle § 11 odst. 2 z. č. 555/1992 Sb. a metodiky ZOP provádí prohlídku osoba stejného pohlaví za přítomnosti dalšího svědka stejného pohlaví, aby se předešlo podezření ze zneužití pravomoci.'
      },
      {
        text: 'Osobní prohlídku provede službu konající strážný (muž), pokud má nasazené rukavice.',
        correct: false,
        explanation: 'Chyba! Prohlídku osoby smí provádět výhradně příslušník stejného pohlaví.'
      },
      {
        text: 'Příslušník provede na místě důkladnou intimní prohlídku tělesných dutin.',
        correct: false,
        explanation: 'Chyba! Personál VS ČR nesmí provádět intimní tělesné prohlídky (EVP bod 54.6, § 11 odst. 2) – ty smí provádět výhradně lékař!'
      }
    ]
  },
  {
    id: 'dilema-3',
    title: 'Střet zájmů a nabídka výhody od rodiny odsouzeného',
    description: 'Po skončení návštěvního dne vás na parkovišti před věznicí osloví manželka odsouzeného z vašeho oddílu. Nabízí vám dárkovou tašku s kvalitní kávou a prémiovým alkoholem se slovy: „To je jen malé poděkování za to, jak jste na manžela hodný."',
    options: [
      {
        text: 'Dar rázně a zdvořile odmítnout, vysvětlit zákaz přijímání jakýchkoli darů dle Čl. 5 Kodexu etiky a bezodkladně sepsat úřední záznam a informovat nadřízeného a oddělení prevence a stížností.',
        correct: true,
        explanation: 'Naprosto správně! Zaměstnanec nesmí přijmout žádné dary ani pozornosti, které by mohly ohrozit nestrannost. Událost musí být neprodleně písemně zaznamenána k ochraně příslušníka před vydíráním.'
      },
      {
        text: 'Dárkovou tašku převzít, protože káva a alkohol mají hodnotu pod 1 000 Kč a nejedná se o hotové peníze.',
        correct: false,
        explanation: 'Hrubá chyba! Zákaz přijímání darů v Čl. 5 Etického kodexu je absolutní. Přijetím daru se příslušník stává zavázaným a otevírá prostor pro vydírání a korupci.'
      },
      {
        text: 'Dar odmítnout, ale nikomu o tom neříkat, aby odsouzený neměl zbytečné problémy.',
        correct: false,
        explanation: 'Chyba! Zatajení takového kontaktu vystavuje příslušníka korupčnímu riziku a podezření z neohlášení protiprávního jednání dle Čl. 7 Kodexu.'
      }
    ]
  },
  {
    id: 'dilema-4',
    title: 'Nezákonný pokyn nadřízeného na strážním stanovišti',
    description: 'Jste velen se zbraní na strážní stanoviště u vchodu. Přichází nadřízený důstojník a nařizuje vám, abyste mu okamžitě vydal svou nabitou služební zbraň, protože si ji chce prohlédnout, a mezitím pustil do objektu neznámou dodávku bez kontroly dokladů a prohlídky.',
    options: [
      {
        text: 'Pokyn nadřízeného odmítnout splnit, zbraň zásadně nevydat, vozidlo do objektu bez řádné kontroly nevpustit a trvat na dodržení zákona a strážního řádu (příslušník na stanovišti požívá zákonné ochrany a nesmí plnit pokyny v rozporu se zákonem).',
        correct: true,
        explanation: 'Výborně! Dle § 19 a § 28 NGŘ č. 38/2018 Sb. i zákona č. 555/1992 Sb. nesmí pokyn nadřízeného odporovat zákonným povinnostem stráže na stanovišti. Strážný zbraň nevydává a kontrolu provést musí.'
      },
      {
        text: 'Okamžitě odevzdat zbraň a vpustit dodávku, protože rozkaz nadřízeného má vždy přednost před všemi zákony.',
        correct: false,
        explanation: 'Závažné selhání! Příslušník nesmí uposlechnout rozkaz, kterým by zjevně spáchal trestný čin nebo porušil bezpečnost střeženého objektu (§ 46 zákona o služebním poměru).'
      },
      {
        text: 'Opustit stanoviště a jít si stěžovat na ředitelství věznice.',
        correct: false,
        explanation: 'Chyba! Samovolné opuštění strážního stanoviště se zbraní je závažným porušením služební kázně i trestným činem.'
      }
    ]
  }
];

// ─── Textové bloky ───────────────────────────────────────────────────────────

export const defaultEthicsSections: StudySection[] = [
  {
    id: 'kodex-desatero',
    area: 'kodex',
    title: 'Desatero etických zásad příslušníka a zaměstnance VS ČR',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({ label: 'I.', title: 'Etické zvažování', text: 'Každou situaci zvažujeme podle etických zásad a při pochybnostech žádáme o radu nadřízené.' }),
      sectionItem({ label: 'II.', title: 'Profesionalita', text: 'Chováme se profesionálně vůči všem osobám (vězňům, kolegům, nadřízeným, soudcům).' }),
      sectionItem({ label: 'III.', title: 'Mlčenlivost', text: 'Důsledně chráníme důvěrné informace a osobní údaje před nepovolanými osobami.' }),
      sectionItem({ label: 'IV.', title: 'Týmová spolupráce', text: 'Vážíme si spolupráce v týmu a respektujeme všechny kolegy a členy personálu.' }),
      sectionItem({ label: 'V.', title: 'Nulová diskriminace', text: 'Jsme striktně proti jakékoli formě diskriminace (rasa, pohlaví, víra, majetek).' }),
      sectionItem({ label: 'VI.', title: 'Zákaz darů a výhod', text: 'Nepřijímáme ani nevyžadujeme dary, výhody ani pozornosti spojené s výkonem funkce.' }),
      sectionItem({ label: 'VII.', title: 'Předcházení střetu', text: 'Aktivně předcházíme střetu zájmů a okamžitě hlásíme možnou podjatost.' }),
      sectionItem({ label: 'VIII.', title: 'Ochrana majetku', text: 'Bráníme škodám, podvodům, zpronevěrám a neoprávněnému obohacování.' }),
      sectionItem({ label: 'IX.', title: 'Integrita a čest', text: 'Jsme čestní, objektivní, nestranní a za všech okolností nekompromitovaní.' }),
      sectionItem({ label: 'X.', title: 'Důvěra veřejnosti', text: 'Usilujeme o transparentnost a budujeme důvěru veřejnosti k VS ČR jako pilíři spravedlnosti.' }),
    ],
  },
  {
    id: 'kodex-clanky',
    area: 'kodex',
    title: 'Znění Kodexu profesní etiky (Příloha č. 6 k NGŘ č. 28/2018 Sb.)',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({
        label: 'Článek 1', title: 'Zákonnost a mezinárodní soulad',
        text: 'Zaměstnanec VS ČR vykonává profesi ve shodě s Ústavou ČR, Listinou základních práv a svobod, zákony, právem EU, doporučeními Evropských vězeňských pravidel (EVP) a mezinárodními smlouvami.',
        note: 'Stanovuje univerzální právní a etický rámec činnosti sboru.',
      }),
      sectionItem({
        label: 'Článek 2', title: 'Profesionalita, lidská důstojnost a vzdělávání',
        text: '(1) Povinností zaměstnance je jednat profesionálně, svědomitě, nestranně a ve vztahu ke všem osobám ctít lidskou důstojnost a princip rovného zacházení. (2) Odpovídá za úroveň svého výkonu, plní pokyny nadřízených vydané v souladu s kodexem, dbá o hospodárnost a své vzdělání si průběžně prohlubuje.',
        note: 'Důraz na celoživotní vzdělávání a zákaz vzniku zbytečných nákladů státu.',
      }),
      sectionItem({
        label: 'Článek 3', title: 'Důvěryhodnost a vystupování na veřejnosti',
        text: '(1) Profesní etika je neslučitelná s šířením urážek, pomluv nebo nepodložených obvinění vůči orgánům veřejné moci a kolegům. (2) Chová se tak, aby nediskreditoval sebe ani VS ČR. (3) Při výkonu služby je vždy vhodně oblečen a upraven.',
        note: 'Ochrana dobrého jména Vězeňské služby a dodržování služební zdvořilosti.',
      }),
      sectionItem({
        label: 'Článek 4', title: 'Zdvořilost a zákaz diskriminace',
        text: 'Zaměstnanec je vždy zdvořilý, tolerantní a vylučuje diskriminaci na základě pohlaví, rasy, barvy pleti, jazyka, víry, politického smýšlení či sociálního původu. S vězněnými osobami jedná korektně.',
        note: 'Korektnost a respekt k lidským právům bez ohledu na charakter trestné činnosti vězně.',
      }),
      sectionItem({
        label: 'Článek 5', title: 'Zákaz korupčního jednání a nepřijímání darů',
        text: '(1) Jakékoliv korupční jednání je neslučitelné s výkonem služby. (2) Zaměstnanec nevyžaduje a nesmí přijmout žádné dary ani zvýhodnění, která by mohla ovlivnit nestrannost. Nenabízí výhody spojené s postavením a neuvádí se do stavu závazku.',
        note: 'Absolutní zákaz přijetí jakýchkoli darů od vězňů, rodin nebo dodavatelů.',
      }),
      sectionItem({
        label: 'Článek 6', title: 'Ochrana osobních údajů a mlčenlivost',
        text: 'Zaměstnanec je povinen dodržovat zásady ochrany osobních údajů a zachovávat mlčenlivost o skutečnostech, o nichž se dozvěděl při výkonu své profese a které mají zůstat utajeny.',
        note: 'Ochrana dat z VIS, spisové služby a prevence komoditizace informací.',
      }),
      sectionItem({
        label: 'Článek 7', title: 'Ohlašovací povinnost při neetickém jednání (Whistleblowing)',
        text: 'Zjistí-li zaměstnanec ztrátu, neodpovědné hospodaření s majetkem, podvodné nebo korupční jednání, anebo se na něm vyžaduje neetické či protiprávní jednání, oznámí toto bez zbytečného odkladu.',
        note: 'Právní a etická povinnost aktivně ohlásit nekalé praktiky a tlaky.',
      }),
      sectionItem({
        label: 'Článek 8', title: 'Právní závaznost a služební kázeň',
        text: 'Etický kodex navazuje na povinnosti ze služebního poměru / zákoníku práce. Nerespektování zásad tohoto kodexu je posuzováno a trestáno jako porušení služební kázně nebo pracovních povinností.',
        note: 'Kodex není pouhým doporučením, ale přímou součástí hodnocení kázně.',
      }),
    ],
  },
  {
    id: 'protikorupce-linky',
    area: 'protikorupce',
    title: 'Protikorupční linky & Ochrana oznamovatelů',
    kicker: '',
    intro: 'VS ČR deklaruje ochranu oznamovatelů (whistleblowerů) jednající v dobré víře. Zaměstnanec **nesmí být vystaven žádné přímé ani nepřímé diskriminaci či represi**.',
    outro: '**Povinný obsah oznámení:** Identifikace podezřelých osob, podrobný popis skutku, konkrétní důkazy a případný požadavek na zachování anonymity oznamovatele.',
    items: [
      sectionItem({ title: 'Protikorupční linka VS ČR', text: 'korupce@grvs.justice.cz', note: '244 024 666', label: 'Soudní 1672/1a, 140 67 Praha 4' }),
      sectionItem({ title: 'Protikorupční linka MSp ČR', text: 'korupce@msp.justice.cz', note: '221 997 595', label: 'Vyšehradská 16, Praha 2' }),
    ],
  },
  {
    id: 'protikorupce-katalog',
    area: 'protikorupce',
    title: 'Příklady z oficiálních Katalogů korupčních rizik VS ČR (NGŘ 28/2018)',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({
        label: 'Vězeňská stráž',
        title: 'Výkon strážní služby a prohlídky',
        text: 'Průnik nepovolených předmětů (drogy, mobily), únik informací, nedovolené styky za úplatu',
        probability: 3, impact: 4,
        note: 'Vícestupňový kontrolní systém, rotace strážných, namátkové kontroly personálu, technická detekce.'
      }),
      sectionItem({
        label: 'Pověřené orgány GŘ / OJ',
        title: 'Provádění úkonů v trestním řízení',
        text: 'Ovlivnění šetření ve prospěch podezřelého, zatajení trestné činnosti, zkreslení informací OČTŘ',
        probability: 2, impact: 5,
        note: 'Přísná personální kritéria, dozor státního zástupce, elektronická evidence spisů v ETŘ, kontrola 4 očí.'
      }),
      sectionItem({
        label: 'Personalistika',
        title: 'Vedení osobních údajů a přijímání zaměstnanců',
        text: 'Únik citlivých dat z VIS/spisů, nepotismus a zvýhodnění příbuzných při výběrových řízeních',
        probability: 2, impact: 5,
        note: 'Vícečlenné výběrové komise, zákaz přímé podřízenosti blízkých osob, audit přístupových logů do personálního systému.'
      }),
      sectionItem({
        label: 'Logistika a VZ',
        title: 'Zadávání veřejných zakázek a nákupy',
        text: 'Zmanipulování soutěžních podmínek ve prospěch spřátelené firmy, předražené dodávky, nekvalitní plnění',
        probability: 2, impact: 5,
        note: 'Zadávání přes E-tržiště / EZAK, komisionální přebírání děl, účast zástupců odboru investic MSp.'
      }),
      sectionItem({
        label: 'Zdravotnická střediska',
        title: 'Výdej léčiv a lékařská posouzení',
        text: 'Neoprávněný výdej tlumivých léků vězňům, fingování zdravotního stavu pro přerušení trestu',
        probability: 2, impact: 4,
        note: 'Podvojná evidence omamných látek, posuzování oblastní lékařskou komisí, kontrola zdravotními pojišťovnami.'
      }),
      sectionItem({
        label: 'Správní služba & VIS',
        title: 'Vedení evidence vězněných osob',
        text: 'Neoprávněný únik informací o vězních, poskytnutí údajů bez právního zájmu za úplatu',
        probability: 3, impact: 4,
        note: 'Jedinečná hesla a přístupová práva, kontrolní bezpečnostní hesla GŘ pro lustrace OČTŘ, logování přístupů.'
      }),
    ],
  },
  {
    id: 'evp-evp',
    area: 'evp',
    title: 'Evropská vězeňská pravidla (EVP)',
    kicker: '',
    intro: 'Doporučení Rec(2006)2-rev Výboru ministrů Rady Evropy (aktualizováno 1. 7. 2020). Základní principy: výkon trestu se musí co nejvíce přibližovat životu na svobodě (normalizace), zákaz zhoršování utrpení nad rámec odnětí svobody a důraz na dynamickou bezpečnost.',
    outro: '',
    items: [
      sectionItem({ title: 'Samovazba (bod 60.6):', text: 'Max. limity, zákaz pro děti a těhotné ženy, denní vizita ředitelem.' }),
      sectionItem({ title: 'Prohlídky (bod 54):', text: 'Pouze osobou stejného pohlaví, intimní prohlídky smí provádět *pouze lékař*.' }),
    ],
  },
  {
    id: 'evp-mandela',
    area: 'evp',
    title: 'Mandelova pravidla OSN',
    kicker: '',
    intro: 'Standardní minimální pravidla OSN pro zacházení s vězni (1955/1957, revidována 2015 v Ženevě). Pojmenována po Nelsonu Mandelovi. Stanovují univerzální minimální standardy lidské důstojnosti po celém světě.',
    outro: '',
    items: [
      sectionItem({ title: 'Bangkokská pravidla (2010):', text: 'Specifické záruky pro vězněné ženy, matky a děti.' }),
      sectionItem({ title: 'Výbor proti mučení OSN:', text: 'Sídlo evropské pobočky v Ženevě.' }),
    ],
  },
  {
    id: 'evp-instituce',
    area: 'evp',
    title: 'Kontrolní instituce ochrany LP',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({ title: 'ESLP (Štrasburk):', text: 'Evropský soud pro lidská práva (zřízen 1959).' }),
      sectionItem({ title: 'CPT (Štrasburk):', text: 'Evropský výbor pro prevenci mučení (inspekce 1x za 5 let nebo ad hoc).' }),
      sectionItem({ title: 'Veřejný ochránce práv (Brno):', text: 'Nezávislý ombudsman v ČR (Stanislav Křeček).' }),
      sectionItem({ title: 'Dozorový státní zástupce:', text: 'Pravidelné prověrky zákonnosti přímo ve věznicích.' }),
    ],
  },
  {
    id: 'evp-duchovni',
    area: 'evp',
    title: 'Duchovní péče ve vězeňství (VDP & VDS)',
    kicker: '',
    intro: '',
    outro: '',
    items: [
      sectionItem({
        title: 'Smluvní základ a formy',
        text: 'Duchovní péče je poskytována na základě **trojstranné dohody** (VS ČR + ČBK + ERC) a **dvoustranné dohody** (VS ČR + NSSJ). Účast odsouzených je **zcela dobrovolná**.\nDuchovní působí buď jako neplacení dobrovolníci ve spolku **Vězeňská duchovenská péče (VDP, z.s.)**, nebo po zapracování jako kaplani **Vězeňské duchovní služby (VDS)** – zaměstnanci VS ČR.',
      }),
      sectionItem({
        title: 'Zákonné mantinely & Svoboda vyznání',
        text: 'Dle Čl. 15–16 Listiny základních práv a svobod má každý zaručenu svobodu myšlení, svědomí a vyznání. Nikdo nesmí být nucen k účasti na bohoslužbách ani k přijímání návštěv církevních představitelů.\nVězněným osobám je umožněno vlastnit náboženskou literaturu a účastnit se povolených pastoračních aktivit v rámci programu zacházení.',
      }),
    ],
  },
];

/** Co které pole výchozích bloků znamená — pro formulář lektora. */
export const ethicsSectionFields: Record<string, StudySectionFields> = {
  'kodex-desatero': {
    title: 'Nadpis bloku',
    itemsLegend: 'Zásady',
    item: { label: 'Číslo (např. I.)', title: 'Název zásady', text: 'Popis zásady' },
  },
  'kodex-clanky': {
    title: 'Nadpis bloku',
    itemsLegend: 'Články',
    item: { label: 'Označení (např. Článek 1)', title: 'Název článku', text: 'Text článku', note: 'Aplikační význam' },
  },
  'protikorupce-linky': {
    title: 'Nadpis bloku',
    intro: 'Úvodní text',
    outro: 'Zvýrazněná poznámka pod kontakty',
    itemsLegend: 'Kontakty',
    item: { title: 'Název linky', text: 'E-mail', note: 'Telefon', label: 'Adresa' },
  },
  'protikorupce-katalog': {
    title: 'Nadpis tabulky',
    itemsLegend: 'Řádky katalogu',
    item: {
      label: 'Oddělení',
      title: 'Činnost',
      text: 'Identifikované korupční riziko',
      note: 'Stanovená protikorupční opatření',
      rating: true,
    },
  },
  'evp-evp': {
    title: 'Nadpis karty',
    intro: 'Text karty',
    itemsLegend: 'Odrážky',
    item: { title: 'Tučný začátek odrážky', text: 'Text odrážky' },
  },
  'evp-mandela': {
    title: 'Nadpis karty',
    intro: 'Text karty',
    itemsLegend: 'Odrážky',
    item: { title: 'Tučný začátek odrážky', text: 'Text odrážky' },
  },
  'evp-instituce': {
    title: 'Nadpis karty',
    itemsLegend: 'Instituce',
    item: { title: 'Instituce', text: 'Popis' },
  },
  'evp-duchovni': {
    title: 'Nadpis bloku',
    itemsLegend: 'Rámečky',
    item: { title: 'Nadpis rámečku', text: 'Text (každý řádek = nový odstavec)' },
  },
};
