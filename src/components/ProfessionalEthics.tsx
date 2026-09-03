import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ShieldAlert, 
  Scale, 
  Globe2, 
  Calculator, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Search, 
  BookOpen, 
  Award, 
  UserCheck, 
  Shield, 
  FileText, 
  Sparkles,
  ChevronRight,
  RefreshCw,
  Info,
  Building,
  Flame,
  Stethoscope,
  KeyRound,
  Eye,
  Check,
  X
} from 'lucide-react';
import { profesniEtikaQuestions } from '../data/questions/profesniEtika';
import { Question } from '../types';

export const ProfessionalEthics: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'concepts' | 'code' | 'anticorruption' | 'conventions' | 'simulator' | 'test'>('concepts');
  
  // State for 36 Concepts Search & Filter
  const [conceptFilter, setConceptFilter] = useState<'all' | 'normative' | 'corruption' | 'rights' | 'service'>('all');
  const [conceptSearch, setConceptSearch] = useState('');
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number | null>(null);

  // State for Risk Matrix Calculator
  const [probScore, setProbScore] = useState<number>(2);
  const [impactScore, setImpactScore] = useState<number>(3);
  const [catalogFilter, setCatalogFilter] = useState<string>('all');

  // State for Deontological Simulator
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [selectedSimOption, setSelectedSimOption] = useState<number | null>(null);
  const [simSubmitted, setSimSubmitted] = useState<boolean>(false);
  const [simScore, setSimScore] = useState<number>(0);

  // State for Practice Test (20 questions / 50 questions)
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [testActive, setTestActive] = useState<boolean>(false);
  const [currentTestIdx, setCurrentTestIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [testFinished, setTestFinished] = useState<boolean>(false);

  // 36 Essential Concepts for ZOP A Study Guide
  const conceptsList = [
    {
      id: 1,
      term: 'Etika',
      category: 'normative',
      shortDef: 'Praktická filozofická disciplína, věda o správném způsobu života a teorie normativních systémů.',
      detail: 'Hledá a formuluje pravidla pro harmonické, spravedlivé a vzájemně prospěšné soužití lidí ve společnosti. Směřuje k neměnným etickým pravidlům a zkoumá směřování k nejvyššímu etickému cíli (dobru).',
      badge: 'Základní pojem'
    },
    {
      id: 2,
      term: 'Etický cíl',
      category: 'normative',
      shortDef: 'Ideový směr zaměřený k absolutnímu dobru.',
      detail: 'Nemá materiální podstatu, není to dosažitelný bod, ale směr a celoživotní kompas. Podle směru k etickému cíli řadíme hodnoty do hodnotových žebříčků a poměřujeme své úmysly a činy.',
      badge: 'Axiologie'
    },
    {
      id: 3,
      term: 'Axiologie',
      category: 'normative',
      shortDef: 'Etická disciplína zabývající se vědou o hodnotách (z řeckého axia = hodnota).',
      detail: 'Zkoumá procesy vzniku hodnot, jejich třídění na materiální a nemateriální a uspořádání do hodnotových žebříčků. U zralého člověka stojí nejvýše nemateriální hodnoty (život, spravedlnost, čest).',
      badge: 'Axiologie'
    },
    {
      id: 4,
      term: 'Deontologie',
      category: 'normative',
      shortDef: 'Etická nauka o povinnostech (z řeckého deon = povinnost / to, co je správné).',
      detail: 'Zabývá se vytvářením žebříčku a pořadí plnění povinností odvozených z hodnotového žebříčku. Profesní deontologie stanovuje etické povinnosti a standardy příslušníka bezpečnostního sboru.',
      badge: 'Deontologie'
    },
    {
      id: 5,
      term: 'Hodnoty',
      category: 'normative',
      shortDef: 'Cokoli, k čemu osoba svobodně a dobrovolně zaujme pozitivní vztah.',
      detail: 'Dělí se na materiální (majetek, peníze) a nemateriální (láska k lidem, spravedlnost, pravda, důstojnost). Z hodnot se rodí plnění povinností.',
      badge: 'Axiologie'
    },
    {
      id: 6,
      term: 'Povinnosti',
      category: 'normative',
      shortDef: 'Požadavky a závazky k jednání, které člověk naplňuje a vytváří tak další hodnoty.',
      detail: 'Plněním povinností se zabývá deontologie. Ve službě jsou povinnosti konkretizovány zákony (z. č. 555/1992 Sb., z. č. 361/2003 Sb.) a Etickým kodexem.',
      badge: 'Deontologie'
    },
    {
      id: 7,
      term: 'Deskriptivní etika',
      category: 'normative',
      shortDef: 'Disciplína, která věcně popisuje reálné etické kontexty situací bez jejich hodnocení.',
      detail: 'Analyzuje zúčastněné osoby, čas, místo, vztahy a reálné chování lidí. Na jejím základě pak normativní etika stanovuje, jaké by jednání mělo být.',
      badge: 'Metodologie'
    },
    {
      id: 8,
      term: 'Normativní systém',
      category: 'normative',
      shortDef: 'Souhrn hodnotících sankcí, pravidel a vzorů regulujících lidské chování.',
      detail: 'Společnost stojí na třech provázaných vrstvách normativních systémů: mravnost (svědomí), morálka (společenské zvyklosti) a právo (státní donucení).',
      badge: 'Základní pojem'
    },
    {
      id: 9,
      term: 'Mravnost',
      category: 'normative',
      shortDef: 'Vnitřní, individuální normativní systém opírající se výhradně o svědomí.',
      detail: 'Svědomí je jedinou interní pozitivní i negativní sankcí (čisté svědomí vs. pocit viny a výčitky). Mravnost je nezávislá na vnějším pozorování.',
      badge: 'Normativní systém'
    },
    {
      id: 10,
      term: 'Morálka',
      category: 'normative',
      shortDef: 'Normativní systém opírající se o nepsané společenské zvyklosti, tradice a kulturu.',
      detail: 'Reguluje vnější chování pomocí pozitivních (uznání, respekt) a negativních (odsouzení, ostrakizace) sociálních sankcí. Hrozí u ní riziko tzv. dvojí morálky a pokrytectví.',
      badge: 'Normativní systém'
    },
    {
      id: 11,
      term: 'Kodifikované právo',
      category: 'normative',
      shortDef: 'Formální normativní systém psaných právních norem s legitimní donucovací mocí státu.',
      detail: 'Nastupuje tam, kde mravnost a morálka nestačí zabránit nebezpečným činům. Opírá se o státem vynucované vnější sankce (tresty, pokuty, ochrana práv).',
      badge: 'Normativní systém'
    },
    {
      id: 12,
      term: 'Autorita přirozená a formální',
      category: 'service',
      shortDef: 'Rozlišení autority plynoucí z osobních kvalit vs. autority dané služebním zařazením.',
      detail: 'Formální autorita vychází z hodnosti a funkce. Přirozená autorita je založena na odbornosti, morální integritě, spravedlivém přístupu a schopnosti jít příkladem.',
      badge: 'Služební etika'
    },
    {
      id: 13,
      term: 'Vzory pro socializaci člověka',
      category: 'normative',
      shortDef: 'Osoby a instituce ovlivňující osvojování společenských a etických norem.',
      detail: 'Primární socializace probíhá v rodině, sekundární ve škole, vrstevnických skupinách a profesním prostředí. Příslušník VS ČR musí působit jako pozitivní vzor.',
      badge: 'Socializace'
    },
    {
      id: 14,
      term: 'Právní vědomí',
      category: 'normative',
      shortDef: 'Znalost platného práva spojená s vnitřním postojem k jeho dodržování.',
      detail: 'Neznamená pouze pasivní znalost paragrafů, ale míru ztotožnění se se smyslem zákonů a ochotu dobrovolně a čestně je v praxi uplatňovat.',
      badge: 'Právní stát'
    },
    {
      id: 15,
      term: 'Sankce',
      category: 'normative',
      shortDef: 'Následky jednání sloužící k upevnění normativního systému.',
      detail: 'Dělí se na vnitřní (svědomí) a vnější (společenské či právní), a zároveň na pozitivní (odměna, pochvala, statut) a negativní (trest, pokuta, zavržení).',
      badge: 'Normativní systém'
    },
    {
      id: 16,
      term: 'Kompetence',
      category: 'service',
      shortDef: 'Zákonem svěřená oprávnění a povinnosti k výkonu konkrétních úkolů.',
      detail: 'Příslušník smí uplatňovat státní moc pouze v mezích zákona (§ 6 z. č. 555/1992 Sb., Čl. 2 odst. 2 Ústavy) a nesmí své kompetence překročit ani zneužít.',
      badge: 'Služební etika'
    },
    {
      id: 17,
      term: 'Asertivita',
      category: 'service',
      shortDef: 'Schopnost klidně, pevně a slušně prosazovat zákonné požadavky bez agrese a pasivity.',
      detail: 'Založena na sebeúctě a respektu k právům druhých. Slouží jako obrana proti manipulaci a zastrašování; příslušník neustupuje z oprávněných požadavků.',
      badge: 'Komunikace'
    },
    {
      id: 18,
      term: 'Korupce',
      category: 'corruption',
      shortDef: 'Zneužití postavení a pravomoci k získání neoprávněného prospěchu pro sebe či jiného.',
      detail: 'Výsledkem je nenárokový zisk obou stran (korumpujícího i korumpovaného) na úkor veřejného zájmu. Trestá se dle § 331–333 TZ (sazby až 12 let).',
      badge: 'Protikorupční'
    },
    {
      id: 19,
      term: 'Klientelismus',
      category: 'corruption',
      shortDef: 'Systém neformálních vazeb založený na poskytování vzájemných protislužeb a výhod.',
      detail: 'Obchází standardní transparentní procedury (např. při veřejných zakázkách nebo přidělování pracovních pozic) a poškozuje rovnost šancí.',
      badge: 'Protikorupční'
    },
    {
      id: 20,
      term: 'Informace se stávají komoditou',
      category: 'corruption',
      shortDef: 'Rizikový jev, kdy jsou neveřejné úřední informace zpeněžovány nebo směňovány za výhody.',
      detail: 'Úniky z VIS, osobních spisů nebo o umístění vězňů představují zásadní bezpečnostní a korupční ohrožení. Vyžaduje přísnou mlčenlivost dle § 9 a § 23a.',
      badge: 'Bezpečnost'
    },
    {
      id: 21,
      term: 'Ochrana osobních údajů (GDPR)',
      category: 'rights',
      shortDef: 'Zákonná ochrana dat o vězněných osobách, zaměstnancích a třetích subjektech.',
      detail: 'Příslušník má přístup jen k údajům nezbytným pro službu. Neoprávněné nahlížení nebo předávání údajů bez právního zájmu je přísně sankcionováno.',
      badge: 'Legislativa'
    },
    {
      id: 22,
      term: 'Katalog korupčních rizik',
      category: 'corruption',
      shortDef: 'Příloha NGŘ č. 28/2018 Sb. definující riziková místa ve VS ČR a jejich eliminaci.',
      detail: 'Obsahuje přehled činností, rizik, pravděpodobnost (1–5), dopad (1–5), celkovou míru rizika (1–25) a konkrétní kontrolní protikorupční opatření.',
      badge: 'Protikorupční'
    },
    {
      id: 23,
      term: 'Předsudek a rovný přístup',
      category: 'rights',
      shortDef: 'Požadavek nestranného jednání bez apriorních negativních soudů o osobách.',
      detail: 'Dle Čl. 3 Listiny a Čl. 4 Etického kodexu nesmí být nikdo diskriminován pro rasu, národnost, pohlaví, víru či majetek. S vězni se jedná korektně.',
      badge: 'Lidská práva'
    },
    {
      id: 24,
      term: 'Genderový stereotyp a předsudek',
      category: 'rights',
      shortDef: 'Zjednodušující představy o rolích mužů a žen v bezpečnostním sboru i věznici.',
      detail: 'VS ČR garantuje rovné postavení žen a mužů ve službě i specifická ochranná opatření pro vězněné ženy a matky s dětmi dle EVP a Bangkokských pravidel.',
      badge: 'Lidská práva'
    },
    {
      id: 25,
      term: 'Osobní prohlídka a gender',
      category: 'service',
      shortDef: 'Pravidlo provádění osobních prohlídek výhradně osobou stejného pohlaví.',
      detail: 'Při prohlídce civilisty/občana musí být přítomni 2 příslušníci stejného pohlaví jako prohlížená osoba (jeden provádí, druhý svědčí). Intimní prohlídky smí provádět pouze lékař.',
      badge: 'Bezpečnostní služba'
    },
    {
      id: 26,
      term: 'OSN (New York, Ženeva)',
      category: 'rights',
      shortDef: 'Organizace spojených národů garantující univerzální ochranu lidských práv.',
      detail: 'Centrála v New Yorku, Výbor proti mučení s evropskou pobočkou v Ženevě. Vydává globální standardy pro vězeňství (Mandelova a Bangkokská pravidla).',
      badge: 'Mezinárodní'
    },
    {
      id: 27,
      term: 'Mandelova pravidla OSN',
      category: 'rights',
      shortDef: 'Standardní minimální pravidla OSN pro zacházení s vězni (1955/1957, revize 2015).',
      detail: 'Pojmenována na počest Nelsona Mandely. Stanovují globální minimum pro ubytování, hygienu, lékařskou péči, zákaz mučení a lidskou důstojnost.',
      badge: 'Mezinárodní'
    },
    {
      id: 28,
      term: 'Rada Evropy (Štrasburk)',
      category: 'rights',
      shortDef: 'Mezinárodní evropská organizace chránící demokracii a lidská práva (založena 1949).',
      detail: 'Sídlí ve Štrasburku. Přijala Úmluvu o lidských právech, Evropská vězeňská pravidla a zřídila soudní (ESLP) i inspekční (CPT) orgány.',
      badge: 'Mezinárodní'
    },
    {
      id: 29,
      term: 'CPT (Výbor pro prevenci mučení)',
      category: 'rights',
      shortDef: 'Evropský výbor pro prevenci mučení a nelidského či ponižujícího zacházení.',
      detail: 'Orgán Rady Evropy ve Štrasburku. Vysílá nezávislé inspekční delegace do věznic (periodicky 1x za 5 let nebo ad hoc) a publikuje zprávy o stavu vězeňství.',
      badge: 'Mezinárodní'
    },
    {
      id: 30,
      term: 'Evropská vězeňská pravidla (EVP)',
      category: 'rights',
      shortDef: 'Doporučení Rec(2006)2-rev Rady Evropy (aktualizováno Výborem ministrů 1. 7. 2020).',
      detail: 'Náročnější evropský standard zacházení s vězni; klade důraz na normalizaci života, dynamickou bezpečnost, vzdělávání personálu a zákaz ponižování.',
      badge: 'Mezinárodní'
    },
    {
      id: 31,
      term: 'Nevládní organizace (NGO)',
      category: 'rights',
      shortDef: 'Nezávislé občanské organizace sledující dodržování lidských práv.',
      detail: 'Nejsou státními institucemi. V ČR působí zejména Český helsinský výbor a Amnesty International, které monitorují stav vězeňství a pomáhají obětem.',
      badge: 'Občanská společnost'
    },
    {
      id: 32,
      term: 'Ústavní zákon č. 1/1993 Sb.',
      category: 'rights',
      shortDef: 'Ústava České republiky – základní zákon státu definující dělbu moci a právní stát.',
      detail: 'Zakotvuje svrchovanost lidu, dělbu moci (zákonodárná, výkonná, soudní) a v Čl. 10 přednost mezinárodních smluv o lidských právech před zákonem.',
      badge: 'Ústava ČR'
    },
    {
      id: 33,
      term: 'Ústavní zákon č. 2/1993 Sb.',
      category: 'rights',
      shortDef: 'Listina základních práv a svobod – součást ústavního pořádku ČR.',
      detail: 'Garantuje nezadatelná lidská práva (právo na život, lidskou důstojnost, zákaz mučení Čl. 7, osobní svobodu Čl. 8, zákaz diskriminace Čl. 3).',
      badge: 'Ústava ČR'
    },
    {
      id: 34,
      term: 'Použití zbraně v etických kontextech',
      category: 'service',
      shortDef: 'Aplikace § 18 zákona č. 555/1992 Sb. a prolomení imperativu „Nezabiješ“ při obraně životů.',
      detail: 'Stát zákonem zmocňuje příslušníka k použití zbraně při odvrácení smrtelného útoku nebo útěku nebezpečného vězně. Příslušník musí šetřit život a poskytnout první pomoc.',
      badge: 'Služební etika'
    },
    {
      id: 35,
      term: 'Zákonná ochrana na strážním stanovišti',
      category: 'service',
      shortDef: 'Specifické právní postavení ozbrojeného strážného veleného na stanoviště.',
      detail: 'Všechny osoby (včetně nadřízených) jsou povinny řídit se pokyny strážného. Nadřízený nesmí vydat nezákonný pokyn ani odvracet jeho pozornost či žádat zbraň.',
      badge: 'Bezpečnostní služba'
    },
    {
      id: 36,
      term: 'Kodex profesní etiky VS ČR',
      category: 'service',
      shortDef: 'Příloha č. 6 k NGŘ č. 28/2018 Sb. obsahující 8 závazných článků pro personál.',
      detail: 'Stanovuje etické standardy profesionality, nestrannosti, odmítání korupce a ochranu důstojnosti. Jeho porušení je kvalifikováno jako porušení služební kázně.',
      badge: 'Předpis VS ČR'
    }
  ];

  // Ethical Dilemma Scenarios for Simulator
  const dilemmaScenarios = [
    {
      id: 1,
      title: 'Etické dilema použití střelné zbraně vs. imperativ „Nezabiješ“',
      description: 'Při eskortě nebezpečného odsouzeného k lékaři mimo věznici dojde k ozbrojenému přepadení komplicem, který bezprostředně míří pistolí na vašeho kolegu a hrozí střelbou. Zákrok nesnese odkladu.',
      options: [
        {
          text: 'V souladu s § 18 odst. 1 písm. a) zákona č. 555/1992 Sb. v nutné obraně použít střelnou zbraň bez výstrahy, následně zajistit bezpečnost, okamžitě poskytnout první pomoc zraněnému útočníkovi a přivolat lékaře.',
          correct: true,
          explanation: 'Správně! Zákon v § 18 legitimně prolamuje mravní zákaz „Nezabiješ“ k záchraně života nevinného kolegy. Deontologickou povinností příslušníka po eliminaci hrozby je šetřit život zasaženého a poskytnout mu první pomoc (§ 20).'
        },
        {
          text: 'Střelbu nepoužít, protože mravní imperativ „Nezabiješ“ je absolutní a zbraň se nesmí použít za žádných okolností.',
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
      id: 2,
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
      id: 3,
      title: 'Střet zájmů a nabídka výhody od rodiny odsouzeného',
      description: 'Po skončení návštěvního dne vás na parkovišti před věznicí osloví manželka odsouzeného z vašeho oddílu. Nabízí vám dárkovou tašku s kvalitní kávou a prémiovým alkoholem se slovy: „To je jen malé poděkování za to, jak jste na manžela hodný.“',
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
      id: 4,
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

  // Catalogue Risk Items from NGŘ 28/2018 Sb.
  const riskCatalogItems = [
    {
      dept: 'Vězeňská stráž',
      action: 'Výkon strážní služby a prohlídky',
      risk: 'Průnik nepovolených předmětů (drogy, mobily), únik informací, nedovolené styky za úplatu',
      prob: 3,
      impact: 4,
      score: 12,
      measures: 'Vícestupňový kontrolní systém, rotace strážných, namátkové kontroly personálu, technická detekce.'
    },
    {
      dept: 'Pověřené orgány GŘ / OJ',
      action: 'Provádění úkonů v trestním řízení',
      risk: 'Ovlivnění šetření ve prospěch podezřelého, zatajení trestné činnosti, zkreslení informací OČTŘ',
      prob: 2,
      impact: 5,
      score: 10,
      measures: 'Přísná personální kritéria, dozor státního zástupce, elektronická evidence spisů v ETŘ, kontrola 4 očí.'
    },
    {
      dept: 'Personalistika',
      action: 'Vedení osobních údajů a přijímání zaměstnanců',
      risk: 'Únik citlivých dat z VIS/spisů, nepotismus a zvýhodnění příbuzných při výběrových řízeních',
      prob: 2,
      impact: 5,
      score: 10,
      measures: 'Vícečlenné výběrové komise, zákaz přímé podřízenosti blízkých osob, audit přístupových logů do personálního systému.'
    },
    {
      dept: 'Logistika a VZ',
      action: 'Zadávání veřejných zakázek a nákupy',
      risk: 'Zmanipulování soutěžních podmínek ve prospěch spřátelené firmy, předražené dodávky, nekvalitní plnění',
      prob: 2,
      impact: 5,
      score: 10,
      measures: 'Zadávání přes E-tržiště / EZAK, komisionální přebírání děl, účast zástupců odboru investic MSp.'
    },
    {
      dept: 'Zdravotnická střediska',
      action: 'Výdej léčiv a lékařská posouzení',
      risk: 'Neoprávněný výdej tlumivých léků vězňům, fingování zdravotního stavu pro přerušení trestu',
      prob: 2,
      impact: 4,
      score: 8,
      measures: 'Podvojná evidence omamných látek, posuzování oblastní lékařskou komisí, kontrola zdravotními pojišťovnami.'
    },
    {
      dept: 'Správní služba & VIS',
      action: 'Vedení evidence vězněných osob',
      risk: 'Neoprávněný únik informací o vězních, poskytnutí údajů bez právního zájmu za úplatu',
      prob: 3,
      impact: 4,
      score: 12,
      measures: 'Jedinečná hesla a přístupová práva, kontrolní bezpečnostní hesla GŘ pro lustrace OČTŘ, logování přístupů.'
    }
  ];

  const filteredConcepts = conceptsList.filter(c => {
    const matchesCategory = conceptFilter === 'all' || c.category === conceptFilter;
    const matchesSearch = c.term.toLowerCase().includes(conceptSearch.toLowerCase()) || 
                          c.shortDef.toLowerCase().includes(conceptSearch.toLowerCase()) ||
                          c.detail.toLowerCase().includes(conceptSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredRiskItems = catalogFilter === 'all' 
    ? riskCatalogItems 
    : riskCatalogItems.filter(item => item.dept.toLowerCase().includes(catalogFilter.toLowerCase()));

  const calculatedRiskLevel = probScore * impactScore;
  const getRiskColor = (score: number) => {
    if (score >= 15) return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', label: 'Vysoké / Kritické riziko (15–25)' };
    if (score >= 8) return { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', label: 'Střední riziko (8–14)' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', label: 'Nízké riziko (1–7)' };
  };

  const currentRiskColor = getRiskColor(calculatedRiskLevel);

  // Start 20-question practice test
  const startPracticeTest = (questionCount: number = 20) => {
    const shuffled = [...profesniEtikaQuestions].sort(() => Math.random() - 0.5).slice(0, questionCount);
    setTestQuestions(shuffled);
    setUserAnswers({});
    setCurrentTestIdx(0);
    setTestFinished(false);
    setTestActive(true);
  };

  const handleSelectTestOption = (optIdx: number) => {
    if (testFinished) return;
    setUserAnswers(prev => ({ ...prev, [currentTestIdx]: optIdx }));
  };

  const calculateTestScore = () => {
    let score = 0;
    testQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOption) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Profesní etika & Deontologie</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ZOP A • NGŘ 28/2018
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Komplexní modul profesní etiky, teorie normativních systémů, mezinárodních vězeňských pravidel (EVP / Mandelova pravidla), protikorupčního programu a etického kodexu VS ČR.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveSubTab('test'); startPracticeTest(20); }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Spustit e-Test (20 ot.)</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-800 pt-4 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('concepts')}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'concepts'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>36 Klíčových pojmů</span>
          </button>

          <button
            onClick={() => setActiveSubTab('code')}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'code'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Etický kodex VS ČR</span>
          </button>

          <button
            onClick={() => setActiveSubTab('anticorruption')}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'anticorruption'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Protikorupční program & Rizika</span>
          </button>

          <button
            onClick={() => setActiveSubTab('conventions')}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'conventions'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>EVP & Lidská práva</span>
          </button>

          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'simulator'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Trenažér etických dilemat</span>
          </button>

          <button
            onClick={() => setActiveSubTab('test')}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeSubTab === 'test'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Zkušební test & 50 otázek</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 36 ESSENTIAL CONCEPTS */}
      {activeSubTab === 'concepts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setConceptFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  conceptFilter === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Vše (36)
              </button>
              <button
                onClick={() => setConceptFilter('normative')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  conceptFilter === 'normative' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Normativní systémy & Axiologie
              </button>
              <button
                onClick={() => setConceptFilter('corruption')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  conceptFilter === 'corruption' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Protikorupční pojmy
              </button>
              <button
                onClick={() => setConceptFilter('rights')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  conceptFilter === 'rights' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Lidská práva & Ústava
              </button>
              <button
                onClick={() => setConceptFilter('service')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  conceptFilter === 'service' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Služební etika & Gender
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={conceptSearch}
                onChange={(e) => setConceptSearch(e.target.value)}
                placeholder="Hledat v 36 pojmech..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConcepts.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedConceptIndex(selectedConceptIndex === item.id ? null : item.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${
                  selectedConceptIndex === item.id
                    ? 'bg-slate-800/95 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/80 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                      {item.id}
                    </span>
                    <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                      {item.term}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {item.shortDef}
                </p>

                {selectedConceptIndex === item.id && (
                  <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-emerald-200/90 space-y-2 animate-fadeIn">
                    <p className="leading-relaxed bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30">
                      <strong className="text-emerald-300 block mb-1">Podrobný rozbor a penitenciární aplikace:</strong>
                      {item.detail}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-medium">
                    {selectedConceptIndex === item.id ? 'Kliknutím sbalit' : 'Klikněte pro podrobnosti'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedConceptIndex === item.id ? 'rotate-90' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CODE OF ETHICS VS CR (NGŘ 28/2018 Příloha č. 6) */}
      {activeSubTab === 'code' && (
        <div className="space-y-6">
          {/* Desatero Zásad Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Desatero etických zásad příslušníka a zaměstnance VS ČR</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              {[
                { num: 'I.', title: 'Etické zvažování', desc: 'Každou situaci zvažujeme podle etických zásad a při pochybnostech žádáme o radu nadřízené.' },
                { num: 'II.', title: 'Profesionalita', desc: 'Chováme se profesionálně vůči všem osobám (vězňům, kolegům, nadřízeným, soudcům).' },
                { num: 'III.', title: 'Mlčenlivost', desc: 'Důsledně chráníme důvěrné informace a osobní údaje před nepovolanými osobami.' },
                { num: 'IV.', title: 'Týmová spolupráce', desc: 'Vážíme si spolupráce v týmu a respektujeme všechny kolegy a členy personálu.' },
                { num: 'V.', title: 'Nulová diskriminace', desc: 'Jsme striktně proti jakékoli formě diskriminace (rasa, pohlaví, víra, majetek).' },
                { num: 'VI.', title: 'Zákaz darů a výhod', desc: 'Nepřijímáme ani nevyžadujeme dary, výhody ani pozornosti spojené s výkonem funkce.' },
                { num: 'VII.', title: 'Předcházení střetu', desc: 'Aktivně předcházíme střetu zájmů a okamžitě hlásíme možnou podjatost.' },
                { num: 'VIII.', title: 'Ochrana majetku', desc: 'Bráníme škodám, podvodům, zpronevěrám a neoprávněnému obohacování.' },
                { num: 'IX.', title: 'Integrita a čest', desc: 'Jsme čestní, objektivní, nestranní a za všech okolností nekompromitovaní.' },
                { num: 'X.', title: 'Důvěra veřejnosti', desc: 'Usilujeme o transparentnost a budujeme důvěru veřejnosti k VS ČR jako pilíři spravedlnosti.' }
              ].map((item) => (
                <div key={item.num} className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="font-bold text-emerald-400 font-mono">{item.num}</span>
                      <h4 className="font-bold text-white">{item.title}</h4>
                    </div>
                    <p className="text-slate-300 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8 Articles of Code of Ethics */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Znění Kodexu profesní etiky (Příloha č. 6 k NGŘ č. 28/2018 Sb.)</span>
            </h3>

            {[
              {
                art: 'Článek 1',
                title: 'Zákonnost a mezinárodní soulad',
                text: 'Zaměstnanec VS ČR vykonává profesi ve shodě s Ústavou ČR, Listinou základních práv a svobod, zákony, právem EU, doporučeními Evropských vězeňských pravidel (EVP) a mezinárodními smlouvami.',
                note: 'Stanovuje univerzální právní a etický rámec činnosti sboru.'
              },
              {
                art: 'Článek 2',
                title: 'Profesionalita, lidská důstojnost a vzdělávání',
                text: '(1) Povinností zaměstnance je jednat profesionálně, svědomitě, nestranně a ve vztahu ke všem osobám ctít lidskou důstojnost a princip rovného zacházení. (2) Odpovídá za úroveň svého výkonu, plní pokyny nadřízených vydané v souladu s kodexem, dbá o hospodárnost a své vzdělání si průběžně prohlubuje.',
                note: 'Důraz na celoživotní vzdělávání a zákaz vzniku zbytečných nákladů státu.'
              },
              {
                art: 'Článek 3',
                title: 'Důvěryhodnost a vystupování na veřejnosti',
                text: '(1) Profesní etika je neslučitelná s šířením urážek, pomluv nebo nepodložených obvinění vůči orgánům veřejné moci a kolegům. (2) Chová se tak, aby nediskreditoval sebe ani VS ČR. (3) Při výkonu služby je vždy vhodně oblečen a upraven.',
                note: 'Ochrana dobrého jména Vězeňské služby a dodržování služební zdvořilosti.'
              },
              {
                art: 'Článek 4',
                title: 'Zdvořilost a zákaz diskriminace',
                text: 'Zaměstnanec je vždy zdvořilý, tolerantní a vylučuje diskriminaci na základě pohlaví, rasy, barvy pleti, jazyka, víry, politického smýšlení či sociálního původu. S vězněnými osobami jedná korektně.',
                note: 'Korektnost a respekt k lidským právům bez ohledu na charakter trestné činnosti vězně.'
              },
              {
                art: 'Článek 5',
                title: 'Zákaz korupčního jednání a nepřijímání darů',
                text: '(1) Jakékoliv korupční jednání je neslučitelné s výkonem služby. (2) Zaměstnanec nevyžaduje a nesmí přijmout žádné dary ani zvýhodnění, která by mohla ovlivnit nestrannost. Nenabízí výhody spojené s postavením a neuvádí se do stavu závazku.',
                note: 'Absolutní zákaz přijetí jakýchkoli darů od vězňů, rodin nebo dodavatelů.'
              },
              {
                art: 'Článek 6',
                title: 'Ochrana osobních údajů a mlčenlivost',
                text: 'Zaměstnanec je povinen dodržovat zásady ochrany osobních údajů a zachovávat mlčenlivost o skutečnostech, o nichž se dozvěděl při výkonu své profese a které mají zůstat utajeny.',
                note: 'Ochrana dat z VIS, spisové služby a prevence komoditizace informací.'
              },
              {
                art: 'Článek 7',
                title: 'Ohlašovací povinnost při neetickém jednání (Whistleblowing)',
                text: 'Zjistí-li zaměstnanec ztrátu, neodpovědné hospodaření s majetkem, podvodné nebo korupční jednání, anebo se na něm vyžaduje neetické či protiprávní jednání, oznámí toto bez zbytečného odkladu.',
                note: 'Právní a etická povinnost aktivně ohlásit nekalé praktiky a tlaky.'
              },
              {
                art: 'Článek 8',
                title: 'Právní závaznost a služební kázeň',
                text: 'Etický kodex navazuje na povinnosti ze služebního poměru / zákoníku práce. Nerespektování zásad tohoto kodexu je posuzováno a trestáno jako porušení služební kázně nebo pracovních povinností.',
                note: 'Kodex není pouhým doporučením, ale přímou součástí hodnocení kázně.'
              }
            ].map((art) => (
              <div key={art.art} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                      {art.art}
                    </span>
                    <h4 className="font-bold text-white text-sm md:text-base">{art.title}</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed pt-1">
                    {art.text}
                  </p>
                </div>
                <div className="md:w-64 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-300 shrink-0">
                  <span className="text-emerald-400 font-semibold block mb-1">Aplikační význam:</span>
                  {art.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANTICORRUPTION PROGRAM & RISK CALCULATOR */}
      {activeSubTab === 'anticorruption' && (
        <div className="space-y-6">
          {/* Risk Calculator & Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Kalkulátor míry korupčního rizika (NGŘ 28/2018)</h3>
              </div>
              <p className="text-xs text-slate-300">
                Dle metodiky VS ČR se míra korupčního rizika vypočítává jako prostý součin: <br />
                <strong className="text-emerald-300 font-mono">Míra rizika = Pravděpodobnost výskytu (1–5) × Dopad jevu na chod OSS (1–5)</strong>
              </p>

              {/* Sliders */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300">1. Pravděpodobnost výskytu jevu (1–5):</span>
                    <span className="text-emerald-400 font-bold font-mono">Stupeň {probScore} / 5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={probScore}
                    onChange={(e) => setProbScore(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1: Výjimečný</span>
                    <span>2: Nepravděpodobný</span>
                    <span>3: Pravděpodobný</span>
                    <span>4: Častý</span>
                    <span>5: Téměř jistý</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-300">2. Míra dopadu jevu na chod OSS (1–5):</span>
                    <span className="text-emerald-400 font-bold font-mono">Stupeň {impactScore} / 5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={impactScore}
                    onChange={(e) => setImpactScore(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1: Bez vlivu</span>
                    <span>2: Malé ztráty</span>
                    <span>3: Střední ztráty</span>
                    <span>4: Velké ztráty</span>
                    <span>5: Devastující</span>
                  </div>
                </div>
              </div>

              {/* Calculated Result Box */}
              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Vypočtená míra rizika:</span>
                  <span className={`text-2xl font-bold font-mono ${currentRiskColor.text}`}>
                    {calculatedRiskLevel} / 25
                  </span>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${currentRiskColor.bg}/20 ${currentRiskColor.text} ${currentRiskColor.border}`}>
                    {currentRiskColor.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Whistleblowing and Reporting Contacts */}
            <div className="lg:col-span-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Protikorupční linky & Ochrana oznamovatelů</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                VS ČR deklaruje ochranu oznamovatelů (whistleblowerů) jednající v dobré víře. Zaměstnanec <strong>nesmí být vystaven žádné přímé ani nepřímé diskriminaci či represi</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-400" />
                    <span>Protikorupční linka VS ČR</span>
                  </h4>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">korupce@grvs.justice.cz</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">244 024 666</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Soudní 1672/1a, 140 67 Praha 4</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-blue-400" />
                    <span>Protikorupční linka MSp ČR</span>
                  </h4>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">korupce@msp.justice.cz</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-[11px]">221 997 595</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Vyšehradská 16, Praha 2</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200 leading-relaxed">
                <strong>Povinný obsah oznámení:</strong> Identifikace podezřelých osob, podrobný popis skutku, konkrétní důkazy a případný požadavek na zachování anonymity oznamovatele.
              </div>
            </div>
          </div>

          {/* Catalog of Risks Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Příklady z oficiálních Katalogů korupčních rizik VS ČR (NGŘ 28/2018)</span>
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={catalogFilter}
                  onChange={(e) => setCatalogFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Všechna oddělení</option>
                  <option value="Vězeňská stráž">Vězeňská stráž</option>
                  <option value="Pověřené orgány">Pověřené orgány</option>
                  <option value="Personalistika">Personalistika</option>
                  <option value="Logistika">Logistika & VZ</option>
                  <option value="Zdravotnická">Zdravotnická střediska</option>
                  <option value="Správní">Správní služba</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                    <th className="p-3 font-semibold">Oddělení / Činnost</th>
                    <th className="p-3 font-semibold">Identifikované korupční riziko</th>
                    <th className="p-3 font-semibold text-center font-mono">P × D</th>
                    <th className="p-3 font-semibold text-center">Míra</th>
                    <th className="p-3 font-semibold">Stanovená protikorupční opatření</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredRiskItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-medium text-white whitespace-nowrap">
                        <span className="text-emerald-400 font-bold block">{item.dept}</span>
                        <span className="text-[11px] text-slate-400">{item.action}</span>
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs">{item.risk}</td>
                      <td className="p-3 text-center font-mono text-slate-400 whitespace-nowrap">
                        {item.prob} × {item.impact}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold font-mono text-xs ${
                          item.score >= 10 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.score}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 max-w-sm">{item.measures}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EUROPEAN PRISON RULES & HUMAN RIGHTS */}
      {activeSubTab === 'conventions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* EPR Card */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Globe2 className="w-5 h-5" />
                <span>Evropská vězeňská pravidla (EVP)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Doporučení Rec(2006)2-rev Výboru ministrů Rady Evropy (aktualizováno 1. 7. 2020). Základní principy: výkon trestu se musí co nejvíce přibližovat životu na svobodě (normalizace), zákaz zhoršování utrpení nad rámec odnětí svobody a důraz na dynamickou bezpečnost.
              </p>
              <div className="p-2.5 bg-slate-800/80 rounded-xl text-[11px] text-slate-300 space-y-1">
                <div>• <strong>Samovazba (bod 60.6):</strong> Max. limity, zákaz pro děti a těhotné ženy, denní vizita ředitelem.</div>
                <div>• <strong>Prohlídky (bod 54):</strong> Pouze osobou stejného pohlaví, intimní prohlídky smí provádět <em>pouze lékař</em>.</div>
              </div>
            </div>

            {/* Mandela Rules Card */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Scale className="w-5 h-5" />
                <span>Mandelova pravidla OSN</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Standardní minimální pravidla OSN pro zacházení s vězni (1955/1957, revidována 2015 v Ženevě). Pojmenována po Nelsonu Mandelovi. Stanovují univerzální minimální standardy lidské důstojnosti po celém světě.
              </p>
              <div className="p-2.5 bg-slate-800/80 rounded-xl text-[11px] text-slate-300 space-y-1">
                <div>• <strong>Bangkokská pravidla (2010):</strong> Specifické záruky pro vězněné ženy, matky a děti.</div>
                <div>• <strong>Výbor proti mučení OSN:</strong> Sídlo evropské pobočky v Ženevě.</div>
              </div>
            </div>

            {/* Institutions Card */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Building className="w-5 h-5" />
                <span>Kontrolní instituce ochrany LP</span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div>
                  <strong className="text-white block">ESLP (Štrasburk):</strong>
                  Evropský soud pro lidská práva (zřízen 1959).
                </div>
                <div>
                  <strong className="text-white block">CPT (Štrasburk):</strong>
                  Evropský výbor pro prevenci mučení (inspekce 1x za 5 let nebo ad hoc).
                </div>
                <div>
                  <strong className="text-white block">Veřejný ochránce práv (Brno):</strong>
                  Nezávislý ombudsman v ČR (Stanislav Křeček).
                </div>
                <div>
                  <strong className="text-white block">Dozorový státní zástupce:</strong>
                  Pravidelné prověrky zákonnosti přímo ve věznicích.
                </div>
              </div>
            </div>
          </div>

          {/* Spiritual Care in Prison Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
              <span>Duchovní péče ve vězeňství (VDP & VDS)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700 space-y-2">
                <h4 className="font-bold text-emerald-300 text-sm">Smluvní základ a formy</h4>
                <p>
                  Duchovní péče je poskytována na základě <strong>trojstranné dohody</strong> (VS ČR + ČBK + ERC) a <strong>dvoustranné dohody</strong> (VS ČR + NSSJ). Účast odsouzených je <strong>zcela dobrovolná</strong>.
                </p>
                <p>
                  Duchovní působí buď jako neplacení dobrovolníci ve spolku <strong>Vězeňská duchovenská péče (VDP, z.s.)</strong>, nebo po zapracování jako kaplani <strong>Vězeňské duchovní služby (VDS)</strong> – zaměstnanci VS ČR.
                </p>
              </div>

              <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700 space-y-2">
                <h4 className="font-bold text-emerald-300 text-sm">Zákonné mantinely & Svoboda vyznání</h4>
                <p>
                  Dle Čl. 15–16 Listiny základních práv a svobod má každý zaručenu svobodu myšlení, svědomí a vyznání. Nikdo nesmí být nucen k účasti na bohoslužbách ani k přijímání návštěv církevních představitelů.
                </p>
                <p>
                  Vězněným osobám je umožněno vlastnit náboženskou literaturu a účastnit se povolených pastoračních aktivit v rámci programu zacházení.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DEONTOLOGICAL DILEMMA SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">Modelová situace #{activeScenarioIdx + 1} ze {dilemmaScenarios.length}</span>
                <h3 className="font-bold text-white text-lg mt-0.5">{dilemmaScenarios[activeScenarioIdx].title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Skóre: {simScore} bodů</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs md:text-sm text-slate-200 leading-relaxed">
              <strong className="text-white block mb-1.5 font-semibold">Popis služební situace:</strong>
              {dilemmaScenarios[activeScenarioIdx].description}
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block">Zvolte správný profesně-etický a zákonný postup:</span>
              {dilemmaScenarios[activeScenarioIdx].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!simSubmitted) {
                      setSelectedSimOption(idx);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all cursor-pointer ${
                    selectedSimOption === idx
                      ? simSubmitted
                        ? opt.correct
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                          : 'bg-red-950/60 border-red-500 text-red-200'
                        : 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      selectedSimOption === idx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Submission feedback */}
            {simSubmitted && selectedSimOption !== null && (
              <div className={`p-4 rounded-xl border text-xs md:text-sm leading-relaxed ${
                dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].correct
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/50 text-red-200'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1.5">
                  {dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].correct ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Správné řešení! (+15 XP)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span>Nesprávný postup</span>
                    </>
                  )}
                </div>
                <p>{dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].explanation}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                disabled={activeScenarioIdx === 0}
                onClick={() => {
                  setActiveScenarioIdx(prev => prev - 1);
                  setSelectedSimOption(null);
                  setSimSubmitted(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Předchozí situace
              </button>

              {!simSubmitted ? (
                <button
                  disabled={selectedSimOption === null}
                  onClick={() => {
                    setSimSubmitted(true);
                    if (selectedSimOption !== null && dilemmaScenarios[activeScenarioIdx].options[selectedSimOption].correct) {
                      setSimScore(prev => prev + 15);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm disabled:opacity-40 cursor-pointer"
                >
                  Vyhodnotit rozhodnutí
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (activeScenarioIdx < dilemmaScenarios.length - 1) {
                      setActiveScenarioIdx(prev => prev + 1);
                      setSelectedSimOption(null);
                      setSimSubmitted(false);
                    } else {
                      setActiveScenarioIdx(0);
                      setSelectedSimOption(null);
                      setSimSubmitted(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm cursor-pointer"
                >
                  {activeScenarioIdx < dilemmaScenarios.length - 1 ? 'Další modelová situace' : 'Začít znovu od 1. situace'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PRACTICE TEST & 50 EXAM QUESTIONS */}
      {activeSubTab === 'test' && (
        <div className="space-y-6">
          {!testActive ? (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Oficiální test předmětu Profesní etika (ZOP A)</h3>
                <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto">
                  Test obsahuje 20 náhodně vybraných otázek ze souboru 50 akreditovaných kontrolních otázek. Časový limit pro e-learningový test je stanoven na 30 minut.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => startPracticeTest(20)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Spustit standardní test (20 otázek)
                </button>
                <button
                  onClick={() => startPracticeTest(50)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
                >
                  Procvičit všech 50 otázek
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
              {/* Test Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Otázka {currentTestIdx + 1} z {testQuestions.length}
                  </span>
                  <h3 className="font-bold text-white text-base md:text-lg mt-1">
                    {testQuestions[currentTestIdx].question}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Opravdu chcete ukončit probíhající test?')) {
                        setTestActive(false);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Ukončit test
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {testQuestions[currentTestIdx].options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentTestIdx] === optIdx;
                  const isCorrect = testQuestions[currentTestIdx].correctOption === optIdx;

                  let optClass = 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-300';
                  if (testFinished) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-red-950/60 border-red-500 text-red-200';
                    }
                  } else if (isSelected) {
                    optClass = 'bg-emerald-500/10 border-emerald-500 text-white font-medium';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectTestOption(optIdx)}
                      className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all cursor-pointer ${optClass}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Finished Explanation */}
              {testFinished && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5">
                  <span className="font-bold text-emerald-300 block">Zdůvodnění a právní základ:</span>
                  <p className="text-slate-300">{testQuestions[currentTestIdx].rationale}</p>
                  <span className="text-slate-400 text-[11px] block">Pramen: {testQuestions[currentTestIdx].source}</span>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  disabled={currentTestIdx === 0}
                  onClick={() => setCurrentTestIdx(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  Předchozí
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-md px-2">
                  {testQuestions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTestIdx(idx)}
                      className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        currentTestIdx === idx
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : userAnswers[idx] !== undefined
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {currentTestIdx < testQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentTestIdx(prev => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Další
                  </button>
                ) : !testFinished ? (
                  <button
                    onClick={() => setTestFinished(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs md:text-sm cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    Odevzdat test
                  </button>
                ) : (
                  <button
                    onClick={() => startPracticeTest(testQuestions.length)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Spustit znovu
                  </button>
                )}
              </div>

              {/* Results Modal Box */}
              {testFinished && (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-white text-base">Výsledek testu: {calculateTestScore()} z {testQuestions.length} bodů ({Math.round((calculateTestScore() / testQuestions.length) * 100)} %)</h4>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      {calculateTestScore() / testQuestions.length >= 0.75 
                        ? 'Gratulujeme! Test z Profesní etiky jste úspěšně zvládli.' 
                        : 'Doporučujeme zopakovat 36 pojmů a Kodex etiky a test zopakovat.'}
                    </p>
                  </div>
                  <button
                    onClick={() => startPracticeTest(20)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer"
                  >
                    Nový test (20 ot.)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalEthics;
