import { Question } from '../../types';

export const pravoQuestions: Question[] = [
  // 1. Ústavní práva a svobody omezené ve VTOS
  {
    id: 'pr-01',
    subject: 'Právo',
    topic: 'Ústavní právo a lidská práva',
    question: 'Která ústavní práva a svobody jsou občanům ze zákona omezena při výkonu trestu odnětí svobody (VTOS)?',
    answer: 'Zejména svoboda pohybu a pobytu (čl. 14 LZPS), právo na stávku (čl. 27 odst. 4), svobodná volba povolání a podnikání (čl. 26), částečně listovní tajemství a telekomunikační styk v mezích zákona. Absolutně nedotknutelný zůstává zákaz mučení a nelidského zacházení (čl. 7 odst. 2).',
    options: [
      'Pouze právo volit a být volen do zastupitelských sborů, právo na bezplatnou zdravotní péči a právo shromažďovací, přičemž svoboda pohybu a pobytu zůstává zachována s omezením na areál věznice a zákaz mučení lze omezit se souhlasem soudu.',
      'Zejména svoboda pohybu a pobytu (čl. 14 LZPS), právo na stávku (čl. 27 odst. 4), svobodná volba povolání a podnikání (čl. 26), částečně listovní tajemství a telekomunikační styk v mezích zákona. Absolutně nedotknutelný zůstává zákaz mučení a nelidského zacházení (čl. 7 odst. 2).',
      'Výlučně právo na zachování lidské důstojnosti a osobní cti, právo na právní pomoc a soudní ochranu, zatímco svoboda podnikání, právo na stávku i svoboda pohybu mimo věznici mohou být vykonávány se souhlasem ředitele věznice.',
      'Veškerá politická práva, právo na soukromí i absolutní práva podle čl. 7 LZPS, přičemž omezení těchto práv závisí výhradně na interním rozhodnutí ředitele věznice a dozorového státního zástupce bez vazby na zákon o VTOS.'
    ],
    correctOption: 1,
    rationale: 'Výkonem trestu odnětí svobody dochází k zákonnému omezení osobní svobody (čl. 8 LZPS), svobody pohybu a pobytu (čl. 14 LZPS) a souvisejících práv (svobodná volba povolání, právo na stávku, omezení soukromí při korespondenci a telefonování dle z. č. 169/1999 Sb.). Absolutní práva (právo na život, zákaz mučení a krutého zacházení dle čl. 7 odst. 2) nesmí být nikdy porušena.',
    source: 'Listina základních práv a svobod (čl. 7, 8, 14, 26, 27) a zákon č. 169/1999 Sb., o VTOS'
  },

  // 2. Instituce chránící lidská práva vězněných osob
  {
    id: 'pr-02',
    subject: 'Právo',
    topic: 'Ústavní právo a lidská práva',
    question: 'Které vnitrostátní a mezinárodní instituce se zabývají ochranou lidských práv vězněných osob?',
    answer: 'Vnitrostátní: Veřejný ochránce práv (ombudsman), dozorové státní zastupitelství, soudy, Generální inspekce bezpečnostních sborů (GIBS), Český helsinský výbor. Mezinárodní: Evropský výbor pro zabránění mučení (CPT), Evropský soud pro lidská práva (ESLP), Výbor OSN proti mučení (CAT).',
    options: [
      'Vnitrostátní: Nejvyšší kontrolní úřad (NKÚ), Úřad pro ochranu hospodářské soutěže (ÚOHS) a Finanční správa. Mezinárodní: Mezinárodní měnový fond (MMF), Mezinárodní kriminální policejní organizace (Interpol) a Světová obchodní organizace (WTO).',
      'Vnitrostátní: Veřejný ochránce práv (ombudsman), dozorové státní zastupitelství, soudy, Generální inspekce bezpečnostních sborů (GIBS), Český helsinský výbor. Mezinárodní: Evropský výbor pro zabránění mučení (CPT), Evropský soud pro lidská práva (ESLP), Výbor OSN proti mučení (CAT).',
      'Vnitrostátní: Výhradně Policejní prezidium ČR, Bezpečnostní informační služba (BIS) a Odbor vězeňské a justiční stráže. Mezinárodní: Europol, Agentura Frontex a Stálý rozhodčí soud v Haagu.',
      'Vnitrostátní: Pouze Petiční výbor Poslanecké sněmovny PČR a Ministerstvo vnitra ČR. Mezinárodní: Mezinárodní soudní dvůr v Haagu (ICJ) a Rada bezpečnosti OSN se zaměřením na ozbrojené konflikty.'
    ],
    correctOption: 1,
    rationale: 'Ochranu práv vězněných osob na národní úrovni zajišťuje Veřejný ochránce práv (systematické preventivní návštěvy míst zbavení svobody dle OPCAT), dozorující státní zástupci (§ 78 z. 169/1999 Sb.) a soudy. Na mezinárodní úrovni dohlíží CPT (Rada Evropy) a ESLP ve Štrasburku.',
    source: 'Zákon č. 349/1999 Sb., o Veřejném ochránci práv; Úmluva Rady Evropy o zabránění mučení (CPT)'
  },

  // 3. Mezinárodní právní normy stanovující práva vězněných osob
  {
    id: 'pr-03',
    subject: 'Právo',
    topic: 'Mezinárodní standardy vězeňství',
    question: 'Které klíčové mezinárodní právní normy a standardy upravují zacházení s vězněnými osobami?',
    answer: 'Pravidla OSN o minimálních standardech zacházení s vězněnými osobami (Pravidla Nelsona Mandely, 2015), Evropská vězeňská pravidla (EVP, Doporučení Rec(2006)2), Evropská úmluva o lidských právech (čl. 3) a Standardy CPT.',
    options: [
      'III. Ženevská úmluva o zacházení s válečnými zajatci z roku 1949, Haagské úmluvy o válečném právu a Statut Mezinárodního trestního soudu (Římský statut) pro stíhání válečných zločinů.',
      'Pravidla OSN o minimálních standardech zacházení s vězněnými osobami (Pravidla Nelsona Mandely, 2015), Evropská vězeňská pravidla (EVP, Doporučení Rec(2006)2), Evropská úmluva o lidských právech (čl. 3) a Standardy CPT.',
      'Schengenský hraniční kodex, Dublinské nařízení III o mezinárodní ochraně, Úmluva o právním postavení uprchlíků z roku 1951 a Směrnice EU o navracení neoprávněně pobývajících cizinců.',
      'Vídeňská úmluva o diplomatických stycích z roku 1961, Mezinárodní úmluva o zjednodušení celních formalit a Doporučení Mezinárodní organizace práce (ILO) k bezpečnosti při práci v průmyslu.'
    ],
    correctOption: 1,
    rationale: 'Základem mezinárodního penitenciárního standardu jsou Pravidla Nelsona Mandely (OSN rezoluce 70/175), Evropská vězeňská pravidla (Rada Evropy) a judikatura ESLP k čl. 3 (zákaz nelidského či ponižujícího zacházení nebo trestání).',
    source: 'Pravidla Nelsona Mandely OSN (2015), Evropská vězeňská pravidla (2006/2020), Standardy CPT'
  },

  // 4. Definice trestného činu a jeho dělení
  {
    id: 'pr-04',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jak definuje trestní zákoník trestný čin a jak se trestné činy dělí (§ 13 a § 14 TZ)?',
    answer: 'Trestným činem je protiprávní čin, který trestní zákon označuje za trestný a který vykazuje znaky uvedené v takovém zákoně. Dělí se na přečiny (všechny nedbalostní TČ a úmyslné s horní hranicí sazby do 5 let) a zločiny (ostatní TČ; zvláštní kategorií jsou zvlášť závažné zločiny).',
    options: [
      'Trestným činem je společensky nebezpečné jednání sankcionované soudem. Dělí se na přečiny (úmyslné TČ s horní hranicí sazby do 3 let) a zločiny (nedbalostní TČ bez ohledu na výši sazby a úmyslné činy se sazbou nad 3 roky).',
      'Trestným činem je protiprávní čin, který trestní zákon označuje za trestný a který vykazuje znaky uvedené v takovém zákoně. Dělí se na přečiny (všechny nedbalostní TČ a úmyslné s horní hranicí sazby do 5 let) a zločiny (ostatní TČ; zvláštní kategorií jsou zvlášť závažné zločiny).',
      'Trestným činem je jakékoliv zaviněné porušení zákona chránícího veřejný pořádek. Dělí se na správní přestupky (projednávané policií a obecními úřady), kárná provinění a soudní zločiny se sazbou nad 10 let.',
      'Trestným činem je materiálně škodlivý čin, jehož stupeň nebezpečnosti pro společnost je vyšší než nepatrný. Dělí se na lehké delikty (do 2 let), závažné přečiny (do 8 let) a hrdelní zločiny.'
    ],
    correctOption: 1,
    rationale: 'Dle § 13 odst. 1 TZ je trestným činem protiprávní čin vykazující znaky trestního zákona. Formální pojetí trestného činu je korigováno zásadou subsidiarity trestní represe (§ 12 odst. 2 TZ). Kategorizace na přečiny a zločiny (§ 14 TZ) určuje procesní postup, ukládání trestů i možnost přípravy.',
    source: '§ 13 a § 14 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 5. Zvlášť závažné zločiny
  {
    id: 'pr-05',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Co jsou podle trestního zákoníku zvlášť závažné zločiny (ZZZ) a jaké jsou typické příklady?',
    answer: 'Úmyslné trestné činy, na něž trestní zákoník stanoví trest odnětí svobody s horní hranicí trestní sazby nejméně 10 let (např. vražda § 140, těžké ublížení na zdraví § 145 odst. 3, loupež § 173 odst. 3, braní rukojmí § 174, vzpoura vězňů § 344 odst. 2).',
    options: [
      'Veškeré úmyslné i nedbalostní trestné činy, u nichž horní hranice trestní sazby činí nejméně 5 let odnětí svobody (např. krádež se škodou nikoli malou, nedbalostní usmrcení, neoprávněné užívání cizí věci).',
      'Úmyslné trestné činy, na něž trestní zákoník stanoví trest odnětí svobody s horní hranicí trestní sazby nejméně 10 let (např. vražda § 140, těžké ublížení na zdraví § 145 odst. 3, loupež § 173 odst. 3, braní rukojmí § 174, vzpoura vězňů § 344 odst. 2).',
      'Trestné činy spáchané výhradně organizovanou zločineckou skupinou nebo zvlášť nebezpečnými recidivisty se způsobenou škodou velkého rozsahu přesahující částku 5 000 000 Kč.',
      'Výhradně trestné činy, za které zákon umožňuje uložit výjimečný trest odnětí svobody nad 20 až do 30 let nebo trest doživotí, přičemž dolní hranice sazby musí činit nejméně 12 let.'
    ],
    correctOption: 1,
    rationale: 'Dle § 14 odst. 3 TZ jsou zvlášť závažnými zločiny úmyslné trestné činy s horní hranicí trestní sazby odnětí svobody nejméně 10 let. U ZZZ je trestná i příprava (§ 20 TZ), ukládá se u nich přísnější režim vazby a výkonu trestu.',
    source: '§ 14 odst. 3 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 6. Vývojová stadia trestného činu
  {
    id: 'pr-06',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jaká jsou tři vývojová stadia úmyslného trestného činu a jak se charakterizují?',
    answer: '1. Příprava trestného činu (§ 20 TZ – úmyslné vytváření podmínek pro spáchání ZZZ), 2. Pokus trestného činu (§ 21 TZ – bezprostřední směřování k dokonání bez nastoupení následku), 3. Dokonaný trestný čin (naplnění všech znaků skutkové podstaty).',
    options: [
      '1. Prověřování OČTŘ (§ 158 TrŘ – vyhledávání stop a důkazů), 2. Zahájení trestního stíhání (§ 160 TrŘ – sdělení obvinění), 3. Pravomocné odsouzení soudem v hlavním líčení (§ 225 TrŘ).',
      '1. Příprava trestného činu (§ 20 TZ – úmyslné vytváření podmínek pro spáchání ZZZ), 2. Pokus trestného činu (§ 21 TZ – bezprostřední směřování k dokonání bez nastoupení následku), 3. Dokonaný trestný čin (naplnění všech znaků skutkové podstaty).',
      '1. Pojmutí úmyslu (subjektivní rozhodnutí spáchat jakýkoliv TČ), 2. Příprava (trestná u všech přečinů i zločinů bez výjimky), 3. Dokonání trestného činu (včetně následného zahlazení odsouzení).',
      '1. Motivace a plánování (pořízení nákresů a plánů), 2. Pokus (jednání bezprostředně ohrožující jakýkoliv přestupek), 3. Exces ze spolupachatelství (vybočení ze společného úmyslu).'
    ],
    correctOption: 1,
    rationale: 'Vývojová stadia se vztahují pouze na úmyslné TČ. Samotná myšlenka ani projev úmyslu nejsou trestné. Příprava je trestná jen u ZZZ výslovně uvedených v zákoně. Pokus bezprostředně ohrožuje objekt TČ a je trestný u všech úmyslných TČ.',
    source: '§ 20 a § 21 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 7. Definice přípravy trestného činu dle TZ
  {
    id: 'pr-07',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jak je v § 20 odst. 1 trestního zákoníku definována příprava trestného činu?',
    answer: 'Jednání záležející v úmyslném vytváření podmínek pro spáchání zvlášť závažného zločinu (zejména organizování, opatřování nebo přizpůsobování nástrojů, spolčení, srocení, návod, pomoc), pokud to zákon u příslušného TČ výslovně stanoví a nedošlo k pokusu ani dokonání.',
    options: [
      'Jednání spočívající v jakémkoliv projevu úmyslu spáchat přečin nebo zločin, přičemž příprava je trestná u všech úmyslných trestných činů ze zákona automaticky i bez výslovného uvedení ve zvláštní části TZ.',
      'Jednání záležející v úmyslném vytváření podmínek pro spáchání zvlášť závažného zločinu (zejména organizování, opatřování nebo přizpůsobování nástrojů, spolčení, srocení, návod, pomoc), pokud to zákon u příslušného TČ výslovně stanoví a nedošlo k pokusu ani dokonání.',
      'Jednání, které bezprostředně směřuje k dokonání trestného činu a jehož se pachatel dopustil v úmyslu trestný čin spáchat, jestliže k dokonání trestného činu nedošlo pro překážku nezávislou na vůli pachatele.',
      'Pouze písemná nebo ústní dohoda nejméně tří osob o rozdělení výnosů z budoucí trestné činnosti majetkového charakteru, bez nutnosti faktického opatřování nástrojů či prostředků.'
    ],
    correctOption: 1,
    rationale: 'Příprava (§ 20 odst. 1 TZ) je trestná pouze u zvlášť závažných zločinů, u nichž to trestní zákoník v konkrétní skutkové podstatě výslovně stanoví („Příprava je trestná“). Trestnost přípravy zaniká, pokud pachatel dobrovolně upustil od dalšího jednání a odstranil nebezpečí nebo učinil oznámení OČTŘ (§ 20 odst. 3 TZ).',
    source: '§ 20 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 8. Trestní odpovědnost pokusu a přípravy TČ
  {
    id: 'pr-08',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jaká je trestní odpovědnost za pokus a přípravu trestného činu?',
    answer: 'Příprava i pokus jsou trestné podle trestní sazby stanovené pro trestný čin, k němuž směřovaly. Soud při stanovení trestu přihlédne k tomu, do jaké míry se pachatel přiblížil dokonání a proč k němu nedošlo.',
    options: [
      'Příprava i pokus se obligatorně trestají sazbou sníženou o jednu polovinu oproti dokonaného trestnému činu, přičemž u přečinů je trestní sazba automaticky omezena maximálně na 1 rok odnětí svobody.',
      'Příprava i pokus jsou trestné podle trestní sazby stanovené pro trestný čin, k němuž směřovaly. Soud při stanovení trestu přihlédne k tomu, do jaké míry se pachatel přiblížil dokonání a proč k němu nedošlo.',
      'Pokus je trestný pouze poloviční trestní sazbou odnětí svobody a příprava je postihována výhradně jako přestupek proti veřejnému pořádku v příslušném správním řízení.',
      'Trestní odpovědnost za přípravu i pokus nastává pouze v případě, že došlo k reálnému způsobení majetkové škody nebo zranění, jinak je jednání beztrestné z důvodu subsidiarity trestní represe.'
    ],
    correctOption: 1,
    rationale: 'Dle § 20 odst. 2 a § 21 odst. 2 TZ je trestní sazba shodná s dokonaným trestným činem. Stupeň přiblížení se dokonání je důležitým kritériem pro individualizaci trestu soudem dle § 39 TZ.',
    source: '§ 20 odst. 2, § 21 odst. 2 a § 39 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 9. Odpovědnost mládeže podle zákona č. 218/2003 Sb.
  {
    id: 'pr-09',
    subject: 'Právo',
    topic: 'Soudnictví ve věcech mládeže',
    question: 'Jak je posuzována protiprávní činnost dětí do 15 let a mladistvých (15–18 let) podle zákona č. 218/2003 Sb. (ZSM)?',
    answer: 'Děti mladší 15 let nejsou trestně odpovědné (páchají čin jinak trestný; ukládají se jim opatření dle § 93 v občanskoprávním řízení). Mladiství (15–18 let) páchají provinění, mají relativní trestní odpovědnost (podmíněnou rozumovou a mravní vyspělostí § 5 ZSM) a ukládají se jim výchovná, ochranná nebo trestní opatření.',
    options: [
      'Děti od 14 let mají plnou trestní odpovědnost a páchají trestné činy stejně jako dospělí, přičemž mladistvým od 15 do 18 let se ukládají standardní nepodmíněné tresty odnětí svobody v plné zákonné sazbě bez možnosti snížení.',
      'Děti mladší 15 let nejsou trestně odpovědné (páchají čin jinak trestný; ukládají se jim opatření dle § 93 v občanskoprávním řízení). Mladiství (15–18 let) páchají provinění, mají relativní trestní odpovědnost (podmíněnou rozumovou a mravní vyspělostí § 5 ZSM) a ukládají se jim výchovná, ochranná nebo trestní opatření.',
      'Děti do 15 let i mladiství do 18 let jsou zcela trestně neodpovědní; jejich jednání se posuzuje výhradně jako přestupek a ukládají se jim pouze kárná opatření orgánem sociálně-právní ochrany dětí (OSPOD).',
      'Děti do 15 let páchají provinění a jsou trestány v trestním řízení soudem pro mládež, zatímco mladiství (15–18 let) páchají činy jinak trestné a mohou jim být ukládána pouze ochranná léčení a ústavní výchova.'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 218/2003 Sb. rozlišuje: dítě mladší 15 let (čin jinak trestný – opatření ukládá soud pro mládež dle OSŘ) a mladistvý 15–18 let (provinění – nutná obhajoba od počátku, sazby na polovinu, prioritní odklony a restorativní justice).',
    source: '§ 2, § 5, § 6 a § 93 zákona č. 218/2003 Sb., o soudnictví ve věcech mládeže'
  },

  // 10. Povinné znaky skutkové podstaty trestného činu
  {
    id: 'pr-10',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Které čtyři základní obligatorní (povinné) znaky tvoří skutkovou podstatu trestného činu?',
    answer: 'Objekt (chráněný společenský zájem), Objektivní stránka (jednání, následek, příčinná souvislost), Subjekt (pachatel – věk 15+, příčetnost) a Subjektivní stránka (zavinění – úmysl nebo nedbalost).',
    options: [
      'Motiv činu (pohnutka pachatele), Kriminalistická stopa (materiální důkaz), Místo a čas spáchání a Přitěžující okolnosti podle § 42 trestního zákoníku.',
      'Objekt (chráněný společenský zájem), Objektivní stránka (jednání, následek, příčinná souvislost), Subjekt (pachatel – věk 15+, příčetnost) a Subjektivní stránka (zavinění – úmysl nebo nedbalost).',
      'Procesní způsobilost obviněného, Důkazní břemeno státního zástupce, Právní kvalifikace skutku v obžalobě a Pravomocný výrok soudu o vině.',
      'Protiprávnost jednání, Společenská škodlivost přesahující přestupek, Vývojové stadium pokusu a Druh uloženého trestu podle § 52 trestního zákoníku.'
    ],
    correctOption: 1,
    rationale: 'Skutková podstava je souhrn zákonných znaků charakterizujících určitý typ TČ. Všechny 4 prvky (objekt, objektivní stránka, subjekt, subjektivní stránka) musí být naplněny současně, jinak se nejedná o trestný čin.',
    source: 'Učební text Právo pro VS ČR (JUDr. A. Rambousek, 2020, s. 36)'
  },

  // 11. Objekt trestného činu
  {
    id: 'pr-11',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Co je objektem trestného činu a jak se člení?',
    answer: 'Společenské vztahy a zájmy chráněné trestním zákonem. Člení se na: obecný (všechny zájmy chráněné TZ), druhový/skupinový (společné zájmy v jednotlivých hlavách TZ, např. život a zdraví, majetek) a individuální (konkrétní chráněný zájem u daného TČ). Od objektu se odlišuje hmotný předmět útoku (člověk nebo věc).',
    options: [
      'Hmotný prostor, budova nebo pozemek, na kterém došlo ke spáchání činu. Člení se na: uzavřené objekty (věznice, soudní budovy), veřejně přístupná prostranství a chráněná pásma strategické infrastruktury státu.',
      'Společenské vztahy a zájmy chráněné trestním zákonem. Člení se na: obecný (všechny zájmy chráněné TZ), druhový/skupinový (společné zájmy v jednotlivých hlavách TZ, např. život a zdraví, majetek) a individuální (konkrétní chráněný zájem u daného TČ). Od objektu se odlišuje hmotný předmět útoku (člověk nebo věc).',
      'Věc nebo nástroj, jímž byl trestný čin spáchán, popřípadě věc, která byla trestným činem získána. Člení se na: zbraně chladné, střelné zbraně, výbušniny a padělané platební prostředky.',
      'Výhradně fyzická nebo právnická osoba, které byla trestným činem způsobena majetková nebo nemajetková újma. Člení se na: poškozeného přímého, nepřímého a zvlášť zranitelnou oběť trestného činu.'
    ],
    correctOption: 1,
    rationale: 'Objekt vyjadřuje hodnotu chráněnou právním řádem (např. u krádeže je objektem vlastnické právo, zatímco hmotným předmětem útoku je odcizená věc). Skupinový objekt určuje systematiku zvláštní části TZ (13 hlav).',
    source: 'Trestní zákoník č. 40/2009 Sb., obecná část'
  },

  // 12. Objektivní stránka trestného činu
  {
    id: 'pr-12',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Co tvoří objektivní stránku trestného činu a jaké jsou její povinné znaky?',
    answer: 'Objektivní stránku tvoří: 1. Jednání (projev vůle ve formě konání nebo opomenutí), 2. Následek (porucha nebo ohrožení chráněného zájmu) a 3. Příčinný vztah (kauzální nexus spojující jednání s následkem).',
    options: [
      '1. Pohnutka a cíl pachatele (vnitřní pohnutí mysli), 2. Forma zavinění (přímý úmysl či nevědomá nedbalost) a 3. Příčetnost pachatele v době spáchání trestného činu.',
      'Objektivní stránku tvoří: 1. Jednání (projev vůle ve formě konání nebo opomenutí), 2. Následek (porucha nebo ohrožení chráněného zájmu) a 3. Příčinný vztah (kauzální nexus spojující jednání s následkem).',
      '1. Přiznání obviněného v protokolu o výslechu, 2. Zajištěné věcné a listinné důkazy na místě činu a 3. Výpovědi přímých svědků trestné činnosti.',
      '1. Zahájení trestního stíhání policejním orgánem, 2. Podání obžaloby dozorovým státním zástupcem a 3. Rozhodnutí soudu o vině a trestu v hlavním líčení.'
    ],
    correctOption: 1,
    rationale: 'Jednání může mít formu aktivního konání nebo pasivního opomenutí konání, k němuž byl pachatel povinen (§ 112 TZ). Následek může být poruchový (zranění, škoda) nebo ohrožovací (všeobecné ohrožení). Příčinná souvislost musí být bezpečně prokázána.',
    source: 'Učební text Právo pro VS ČR (s. 37); § 112 TZ'
  },

  // 13. Subjekt trestného činu a dělení subjektů
  {
    id: 'pr-13',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Kdo je subjektem trestného činu a jak se subjekty dělí?',
    answer: 'Trestně odpovědný pachatel (fyzická osoba věku 15+ a příčetná, popř. právnická osoba dle z. č. 418/2011 Sb.). Dělí se na: obecný subjekt (kdokoliv), speciální subjekt (vyžaduje zvláštní vlastnost, např. úřední osoba, voják, příslušník bezpečnostního sboru) a konkrétní subjekt (např. matka u vraždy novorozeného dítěte § 142).',
    options: [
      'Každá fyzická osoba, která byla trestným činem poškozena na zdraví či majetku. Dělí se na: poškozeného s nárokem na náhradu škody, zvlášť zranitelnou oběť trestného činu a nezúčastněného očitého svědka.',
      'Trestně odpovědný pachatel (fyzická osoba věku 15+ a příčetná, popř. právnická osoba dle z. č. 418/2011 Sb.). Dělí se na: obecný subjekt (kdokoliv), speciální subjekt (vyžaduje zvláštní vlastnost, např. úřední osoba, voják, příslušník bezpečnostního sboru) a konkrétní subjekt (např. matka u vraždy novorozeného dítěte § 142).',
      'Výhradně orgány činné v trestním řízení provádějící úkony. Dělí se na: policejní orgány (vyšetřující subjekty), státní zástupce (dozorující subjekty) a nezávislé soudy (rozhodující subjekty).',
      'Pouze zletilá fyzická osoba starší 18 let s plnou svéprávností, přičemž právnické osoby trestní odpovědnost nést nemohou; dělí se na subjekty bezúhonné, podmíněně odsouzené a soudně trestané recidivisty.'
    ],
    correctOption: 1,
    rationale: 'Fyzická osoba musí v době činu splňovat věk nejméně 15 let (§ 25 TZ) a příčetnost (§ 26 TZ). U některých TČ zákon vyžaduje zvláštní postavení pachatele (speciální subjekt – např. zneužití pravomoci úřední osoby § 329 TZ).',
    source: '§ 22, § 25, § 26 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 14. Zavinění (úmysl a nedbalost)
  {
    id: 'pr-14',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jaké jsou formy zavinění v trestním právu a jak se rozlišují (§ 15–19 TZ)?',
    answer: 'Úmysl: 1. přímý (pachatel věděl a chtěl způsobit poruchu/ohrožení), 2. nepřímý (věděl, že může způsobit, a pro případ, že způsobí, byl s tím srozuměn). Nedbalost: 1. vědomá (věděl, ale bez přiměřených důvodů spoléhal, že nezpůsobí), 2. nevědomá (nevěděl, ač vzhledem k okolnostem a poměrům vědět měl a mohl), 3. hrubá nedbalost.',
    options: [
      'Úmysl se dělí výhradně na plánovaný (předem promyšlený po zralé úvaze) a afektový (náhlé hnutí mysli). Nedbalost se dělí pouze na lehkou (omluvitelnou) a těžkou (spojenou s hrubým porušením pracovní kázně).',
      'Úmysl: 1. přímý (pachatel věděl a chtěl způsobit poruchu/ohrožení), 2. nepřímý (věděl, že může způsobit, a pro případ, že způsobí, byl s tím srozuměn). Nedbalost: 1. vědomá (věděl, ale bez přiměřených důvodů spoléhal, že nezpůsobí), 2. nevědomá (nevěděl, ač vzhledem k okolnostem a poměrům vědět měl a mohl), 3. hrubá nedbalost.',
      'Formy zavinění rozlišují objektivní odpovědnost za způsobený následek bez ohledu na psychický stav pachatele a subjektivní odpovědnost vyžadující výhradně písemné přiznání obviněného.',
      'Úmysl přímý (pachatel nechtěl následek způsobit, ale byl s ním srozuměn) a nepřímý (pachatel nevěděl, že následek způsobí). Nedbalost vědomá (pachatel nevěděl a vědět nemohl) a nevědomá (pachatel věděl a chtěl způsobit).'
    ],
    correctOption: 1,
    rationale: 'Dle § 13 odst. 2 TZ je k trestní odpovědnosti třeba úmyslného zavinění, nestanoví-li zákon výslovně, že postačí nedbalost. Zavinění tvoří složka vědění (intelektuální) a složka vůle (volní).',
    source: '§ 15 až § 19 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 15. Pachatel trestného činu
  {
    id: 'pr-15',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Kdo může být pachatelem trestného činu ve smyslu trestního zákoníku (§ 22 TZ)?',
    answer: 'Ten, kdo svým jednáním naplnil znaky skutkové podstaty trestného činu nebo jeho pokusu či přípravy, je-li trestná. Pachatelem může být přímý pachatel (spáchal sám), spolupachatelé (§ 23) i nepřímý pachatel (§ 22 odst. 2).',
    options: [
      'Pouze plně svéprávná fyzická osoba starší 21 let, která byla v minulosti již pravomocně odsouzena za úmyslný trestný čin, přičemž mladiství pachatelé jsou posuzováni výhradně jako svědci.',
      'Ten, kdo svým jednáním naplnil znaky skutkové podstaty trestného činu nebo jeho pokusu či přípravy, je-li trestná. Pachatelem může být přímý pachatel (spáchal sám), spolupachatelé (§ 23) i nepřímý pachatel (§ 22 odst. 2).',
      'Výhradně ten, kdo trestný čin zosnoval nebo řídil jako organizátor, zatímco osoby, které čin fyzicky vykonaly, mají ze zákona postavení pouhých pomocníků bez trestní odpovědnosti.',
      'Každá osoba, proti níž bylo zahájeno trestní stíhání sdělením obvinění policejním orgánem nebo na kterou byl vydán příkaz k zatčení soudcem, bez ohledu na naplnění znaků skutkové podstaty.'
    ],
    correctOption: 1,
    rationale: 'Pachatelem je fyzická osoba trestně odpovědná (věk 15+, příčetná). Jedná-li pachatel sám, jde o přímé pachatelství. Jedná-li více osob společně, odpovídá každý jako by čin spáchal sám (§ 23 TZ).',
    source: '§ 22 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 16. Nepřímý pachatel dle TZ
  {
    id: 'pr-16',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Kdo je nepřímým pachatelem trestného činu podle § 22 odst. 2 TZ a co je to „živý nástroj“?',
    answer: 'Ten, kdo ke spáchání trestného činu zneužije jiné osoby, která není trestně odpovědná (pro nedostatek věku <15 let nebo nepříčetnost), která jedná ve skutkovém omylu, v nutné obraně či krajní nouzi anebo nejednala v úmyslu. Tato zneužitá osoba se označuje jako „živý nástroj“.',
    options: [
      'Spolupachatel, který se sám osobně nepodílel na násilí, ale opatřil střelné zbraně, falešné doklady nebo technické nástroje pro překonání překážek ostatním členům organizované skupiny.',
      'Ten, kdo ke spáchání trestného činu zneužije jiné osoby, která není trestně odpovědná (pro nedostatek věku <15 let nebo nepříčetnost), která jedná ve skutkovém omylu, v nutné obraně či krajní nouzi anebo nejednala v úmyslu. Tato zneužitá osoba se označuje jako „živý nástroj“.',
      'Svědek v trestním řízení, který odmítl vypovídat nebo záměrně uvedl nepravdivé údaje k ochraně obviněného, přičemž „živým nástrojem“ se rozumí policejní agent nasazený ve věznici.',
      'Obhájce obviněného nebo zákonný zástupce mladistvého, který jedná před soudem jménem obžalovaného a vykonává procesní úkony na základě udělené plné moci.'
    ],
    correctOption: 1,
    rationale: 'Nepřímé pachatelství (§ 22 odst. 2 TZ): Příkladem je rodič, který pošle své 10leté dítě krást do obchodu, nebo velitel, který zneužije svého práva vydávat rozkazy podřízenému.',
    source: '§ 22 odst. 2 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 17. Spolupachatel trestného činu
  {
    id: 'pr-17',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jak je v § 23 trestního zákoníku definováno spolupachatelství a co znamená „exces ze spolupachatelství“?',
    answer: 'Spolupachatelé jsou dvě nebo více osob, které spáchaly trestný čin společným jednáním. Každý odpovídá tak, jako by čin spáchal sám. Exces (vybočení) znamená, že pokud jeden ze spolupachatelů vykoná závažnější čin mimo společnou dohodu (např. při krádeži nečekaně zavraždí hlídače), odpovídá za tento exces pouze on sám.',
    options: [
      'Spolupachatelé jsou členové rodiny nebo zaměstnanci pachatele. Při excesu (vybočení) jednoho z nich nesou všichni zúčastnění bez výjimky plnou trestní odpovědnost za nejtěžší způsobený následek na principu kolektivní viny.',
      'Spolupachatelé jsou dvě nebo více osob, které spáchaly trestný čin společným jednáním. Každý odpovídá tak, jako by čin spáchal sám. Exces (vybočení) znamená, že pokud jeden ze spolupachatelů vykoná závažnější čin mimo společnou dohodu (např. při krádeži nečekaně zavraždí hlídače), odpovídá za tento exces pouze on sám.',
      'Spolupachatelé jsou osoby, které z nedbalosti společně způsobily dopravní nehodu nebo požár; excesem se rozumí situace, kdy soud rozdělí trestní sazbu rovným dílem mezi všechny obviněné.',
      'Spolupachatelství nastává při spáchání činu nejméně třemi osobami, přičemž každý odpovídá pouze za jím způsobený poměrný díl škody a excesem je dobrovolné vzdání se trestné činnosti před policií.'
    ],
    correctOption: 1,
    rationale: 'Spolupachatelství vyžaduje: 1. společné jednání (objektivní znak), 2. společný úmysl (subjektivní znak). Spolupachatelství je možné pouze u úmyslných trestných činů. Za exces odpovídá samostatně pouze excesující spolupachatel.',
    source: '§ 23 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 18. Formy trestné součinnosti
  {
    id: 'pr-18',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jaké jsou formy trestné součinnosti a účastenství v trestním právu?',
    answer: 'Účastenství na trestném činu (§ 24 TZ): 1. Organizátor (zosnoval nebo řídil), 2. Návodce (navedl jiného k činu), 3. Pomocník (poskytl pomoc – radou, opatřením prostředků, hlídáním). Další formy: spolčení, srocení, podněcování (§ 364), schvalování (§ 365), nadržování (§ 366), nepřekažení (§ 367) a neoznámení (§ 368).',
    options: [
      'Společné členství ve spolku, odborové organizaci nebo politické straně, účast na demonstraci bez povolení úřadu a společný výkon trestu odnětí svobody ve stejné ubytovně věznice.',
      'Účastenství na trestném činu (§ 24 TZ): 1. Organizátor (zosnoval nebo řídil), 2. Návodce (navedl jiného k činu), 3. Pomocník (poskytl pomoc – radou, opatřením prostředků, hlídáním). Další formy: spolčení, srocení, podněcování (§ 364), schvalování (§ 365), nadržování (§ 366), nepřekažení (§ 367) a neoznámení (§ 368).',
      'Procesní součinnost podle trestního řádu: podání trestního oznámení, podání vysvětlení na policii, účast svědka při rekognici a vypracování znaleckého posudku přizvaným znalcem.',
      'Výhradně finanční sponzorování pachatele a zprostředkování nákupu nemovitostí z výnosů trestné činnosti, přičemž jiné formy pomoci či navádění nejsou v trestním zákoníku postižitelné.'
    ],
    correctOption: 1,
    rationale: 'Účastenství v užším smyslu (organizátorství, návod, pomoc dle § 24 TZ) je akcesorické k činu hlavního pachatele a trestá se podle stejné sazby. Trestné činy nadržování (§ 366), nepřekažení (§ 367) a neoznámení (§ 368) jsou samostatnými delikty proti pořádku ve věcech veřejných.',
    source: '§ 24, § 364 až § 368 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 19. Spolčení a srocení
  {
    id: 'pr-19',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Co znamená v trestním právu pojem spolčení a srocení?',
    answer: 'Spolčení je výslovná nebo konkludentní dohoda alespoň dvou osob o budoucím spáchání úmyslného TČ (formou přípravy). Srocení je shluk alespoň tří osob k bezprostřednímu spáchání násilného TČ, k němuž došlo i bez předchozí výslovné dohody.',
    options: [
      'Spolčení je řádná registrace spolku ve spolkovém rejstříku vedeném krajským soudem, zatímco srocení je ohlášené veřejné shromáždění občanů podle zákona o právu shromažďovacím.',
      'Spolčení je výslovná nebo konkludentní dohoda alespoň dvou osob o budoucím spáchání úmyslného TČ (formou přípravy). Srocení je shluk alespoň tří osob k bezprostřednímu spáchání násilného TČ, k němuž došlo i bez předchozí výslovné dohody.',
      'Spolčení je shluk nejméně deseti osob na veřejném prostranství k vyjádření nespokojenosti, zatímco srocení je písemná smlouva dvou osob o spáchání nedbalostního přečinu v dopravě.',
      'Spolčení představuje povolenou zájmovou činnost odsouzených ve věznici a srocení je nedovolený nástup vězňů na vycházkový dvůr v rozporu s vnitřním řádem věznice.'
    ],
    correctOption: 1,
    rationale: 'Spolčení (min. 2 osoby zaměřené do budoucna) a srocení (min. 3 osoby vzniklé ad hoc k okamžitému útoku) jsou zákonem definované formy přípravy k trestnému činu (§ 20 odst. 1 TZ).',
    source: '§ 20 odst. 1 zákona č. 40/2009 Sb., trestní zákoník; Učební text Právo, s. 34'
  },

  // 20. Zásady pro stanovení druhu a výměry trestu (§ 39 TZ)
  {
    id: 'pr-20',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'K jakým okolnostem soud povinně přihlíží při stanovení druhu trestu a jeho výměry (§ 39 TZ)?',
    answer: 'K povaze a závažnosti trestného činu, osobním, rodinným a majetkovým poměrům pachatele, dosavadnímu způsobu života, možnosti nápravy, chování po činu (náhrada škody), polehčujícím (§ 41) a přitěžujícím (§ 42) okolnostem a délce trestního řízení.',
    options: [
      'Výhradně k dosaženému stupni vzdělání pachatele, jeho politické příslušnosti, náboženskému vyznání a doporučení jeho současného zaměstnavatele či odborové organizace.',
      'K povaze a závažnosti trestného činu, osobním, rodinným a majetkovým poměrům pachatele, dosavadnímu způsobu života, možnosti nápravy, chování po činu (náhrada škody), polehčujícím (§ 41) a přitěžujícím (§ 42) okolnostem a délce trestního řízení.',
      'Pouze k celkové výši finančních úspor na bankovních účtech obžalovaného a jeho schopnosti uhradit soudní poplatky a náklady výkonu vazby ve stanovené lhůtě.',
      'Především k mediálnímu ohlasu trestní kauzy, požadavkům poškozeného na exemplární potrestání a návrhu ředitele vazební věznice na zpřísnění režimu výkonu trestu.'
    ],
    correctOption: 1,
    rationale: 'Ustanovení § 39 TZ stanoví obecné zásady pro ukládání trestů. Trest musí být přiměřený (proporcionalita), nesmí být krutý ani nepřiměřený a nesmí jím být ponížena lidská důstojnost (§ 36 a 37 TZ).',
    source: '§ 36 až § 39 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 21. Společenská škodlivost a subsidiarita trestní represe
  {
    id: 'pr-21',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Co znamená v trestním právu pojem společenská škodlivost a princip ultima ratio (§ 12 odst. 2 TZ)?',
    answer: 'Trestní odpovědnost lze uplatňovat jen v případech společensky škodlivých, ve kterých nepostačuje uplatnění odpovědnosti podle jiného právního předpisu (správní/přestupkové nebo občanské právo). Trestní právo je nejzazším prostředkem ochrany (ultima ratio).',
    options: [
      'Trestní odpovědnost se musí uplatnit přednostně před všemi ostatními právními odvětvími (prima ratio), přičemž jakékoliv porušení občanskoprávní smlouvy je automaticky trestným činem.',
      'Trestní odpovědnost lze uplatňovat jen v případech společensky škodlivých, ve kterých nepostačuje uplatnění odpovědnosti podle jiného právního předpisu (správní/přestupkové nebo občanské právo). Trestní právo je nejzazším prostředkem ochrany (ultima ratio).',
      'Společenská škodlivost vyžaduje, aby trestným činem byla způsobena škoda přesahující 1 000 000 Kč a čin byl spáchán veřejně za přítomnosti nejméně deseti svědků.',
      'Princip ultima ratio stanoví, že o vině a trestu může rozhodnout přímo policejní orgán na místě činu uložením blokové pokuty bez nutnosti projednání věci před nezávislým soudem.'
    ],
    correctOption: 1,
    rationale: 'Zásada subsidiarity trestní represe (§ 12 odst. 2 TZ) stanoví, že trestní právo nastupuje až tehdy, kdy jiné právní prostředky (např. přestupkový zákon, náhrada škody v civilním řízení) selhávají nebo nepostačují k ochraně společnosti.',
    source: '§ 12 odst. 2 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 22. Hranice výše škody dle § 138 TZ
  {
    id: 'pr-22',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jaké jsou zákonné hranice výše škody v trestním zákoníku (§ 138 TZ)?',
    answer: '1. Škoda nikoli nepatrná (hranice TČ): nejméně 10 000 Kč; 2. Škoda nikoli malá: nejméně 50 000 Kč; 3. Větší škoda: nejméně 100 000 Kč; 4. Značná škoda: nejméně 1 000 000 Kč; 5. Škoda velkého rozsahu: nejméně 10 000 000 Kč.',
    options: [
      '1. Škoda nikoli nepatrná: nejméně 5 000 Kč; 2. Škoda nikoli malá: nejméně 25 000 Kč; 3. Větší škoda: nejméně 50 000 Kč; 4. Značná škoda: nejméně 500 000 Kč; 5. Škoda velkého rozsahu: nejméně 5 000 000 Kč.',
      '1. Škoda nikoli nepatrná (hranice TČ): nejméně 10 000 Kč; 2. Škoda nikoli malá: nejméně 50 000 Kč; 3. Větší škoda: nejméně 100 000 Kč; 4. Značná škoda: nejméně 1 000 000 Kč; 5. Škoda velkého rozsahu: nejméně 10 000 000 Kč.',
      '1. Škoda nikoli nepatrná: nejméně 20 000 Kč; 2. Škoda nikoli malá: nejméně 100 000 Kč; 3. Větší škoda: nejméně 250 000 Kč; 4. Značná škoda: nejméně 2 500 000 Kč; 5. Škoda velkého rozsahu: nejméně 20 000 000 Kč.',
      '1. Škoda nikoli nepatrná: nejméně 1 000 Kč; 2. Škoda nikoli malá: nejméně 10 000 Kč; 3. Větší škoda: nejméně 50 000 Kč; 4. Značná škoda: nejméně 500 000 Kč; 5. Škoda velkého rozsahu: nejméně 1 000 000 Kč.'
    ],
    correctOption: 1,
    rationale: 'Novela TZ (z. č. 333/2020 Sb.) upravila hranice škod v § 138 TZ: nikoli nepatrná (min. 10 000 Kč), nikoli malá (min. 50 000 Kč), větší (min. 100 000 Kč), značná (min. 1 000 000 Kč) a velkého rozsahu (min. 10 000 000 Kč). Stejné částky platí pro prospěch a hodnotu věci.',
    source: '§ 138 zákona č. 40/2009 Sb., trestní zákoník (ve znění novely č. 333/2020 Sb.)'
  },

  // 23. Úřední osoba dle § 127 TZ
  {
    id: 'pr-23',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Kdo je podle § 127 trestního zákoníku úřední osobou a kdy požívá zvýšené trestněprávní ochrany?',
    answer: 'Soudce, státní zástupce, prezident/poslanec/senátor/člen vlády, příslušník bezpečnostního sboru (včetně VS ČR a PČR), strážník obecní policie, soudní exekutor, notář jako soudní komisař, lesní/myslivecká/rybářská stráž. Ochranu požívá, je-li čin spáchán v souvislosti s její pravomocí a odpovědností.',
    options: [
      'Každý zaměstnanec soukromé bezpečnostní služby (SBS), revizor městské hromadné dopravy, poštovní doručovatel, recepční v administrativní budově a správce nemovitosti při výkonu své pracovní směny.',
      'Soudce, státní zástupce, prezident/poslanec/senátor/člen vlády, příslušník bezpečnostního sboru (včetně VS ČR a PČR), strážník obecní policie, soudní exekutor, notář jako soudní komisař, lesní/myslivecká/rybářská stráž. Ochranu požívá, je-li čin spáchán v souvislosti s její pravomocí a odpovědností.',
      'Výhradně ředitel věznice, generální ředitel VS ČR, ministr spravedlnosti a předseda Nejvyššího soudu, přičemž řadoví příslušníci ve směně status úřední osoby podle trestního zákoníku nemají.',
      'Jakýkoliv státní zaměstnanec zařazený v platové třídě 10 a vyšší na ministerstvu nebo úřadu práce, a to nepřetržitě 24 hodin denně bez ohledu na souvislost s výkonem pravomoci.'
    ],
    correctOption: 1,
    rationale: 'Příslušníci Vězeňské služby ČR jsou úředními osobami dle § 127 odst. 1 písm. e) TZ. Požívají zvýšené právní ochrany při výkonu služby (např. TČ násilí proti úřední osobě § 325 TZ), ale zároveň nesou přísnější trestní odpovědnost (např. zneužití pravomoci úřední osoby § 329 TZ).',
    source: '§ 127 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 24. Trestné činy úředních osob (§ 329 a § 330 TZ)
  {
    id: 'pr-24',
    subject: 'Právo',
    topic: 'Trestné činy ve vězeňství',
    question: 'Jaké jsou základní trestné činy úředních osob podle Hlavy X trestního zákoníku?',
    answer: '1. Zneužití pravomoci úřední osoby (§ 329 TZ – úmyslné vykonávání pravomoci v rozporu se zákonem, překročení pravomoci nebo nesplnění povinnosti k opatření neoprávněného prospěchu či škody) a 2. Maření úkolu úřední osoby z nedbalosti (§ 330 TZ – zmaření nebo podstatné ztížení splnění důležitého úkolu).',
    options: [
      '1. Porušení služební kázně z nedbalosti (pozdní příchod na služební stanoviště) a 2. Neoprávněné nošení služebního stejnokroje a odznaku bezpečnostního sboru na veřejnosti mimo výkon služby.',
      '1. Zneužití pravomoci úřední osoby (§ 329 TZ – úmyslné vykonávání pravomoci v rozporu se zákonem, překročení pravomoci nebo nesplnění povinnosti k opatření neoprávněného prospěchu či škody) a 2. Maření úkolu úřední osoby z nedbalosti (§ 330 TZ – zmaření nebo podstatné ztížení splnění důležitého úkolu).',
      '1. Zpronevěra svěřených služebních pomůcek (§ 206 TZ) a 2. Podvodné čerpání cestovních náhrad při služební cestě (§ 209 TZ) se způsobením škody nikoli malé.',
      '1. Vlastizrada spáchaná ve služebním poměru (§ 309 TZ) a 2. Sabotáž chodu organizační jednotky bezpečnostního sboru (§ 314 TZ) s následkem těžké újmy na zdraví.'
    ],
    correctOption: 1,
    rationale: 'Zneužití pravomoci úřední osoby (§ 329 TZ) je úmyslným deliktem (např. vnesení nepovolených věcí/telefonu vězni za peníze), zatímco maření úkolu (§ 330 TZ) je deliktem nedbalostním (např. nedbalá kontrola mříží vedoucí k útěku vězně).',
    source: '§ 329 a § 330 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 25. Korupce (úplatkářství)
  {
    id: 'pr-25',
    subject: 'Právo',
    topic: 'Trestné činy ve vězeňství',
    question: 'Co je úplatek a jaké trestné činy tvoří úplatkářství dle trestního zákoníku (§ 331–334 TZ)?',
    answer: 'Úplatek je neoprávněná výhoda spočívající v přímém majetkovém obohacení nebo jiném prospěchu. TČ: 1. Přijetí úplatku (§ 331 – pachatelem je ten, kdo úplatek přijme nebo si dá slíbit), 2. Podplacení (§ 332 – pachatelem je ten, kdo úplatek poskytne nebo slíbí), 3. Nepřímé úplatkářství (§ 333 – zprostředkování vlivu).',
    options: [
      'Úplatek je výhradně hotovost v české měně přesahující 100 000 Kč předaná osobně. TČ úplatkářství tvoří pouze přijetí peněz úřední osobou, zatímco poskytnutí peněz občanem je beztrestné.',
      'Úplatek je neoprávněná výhoda spočívající v přímém majetkovém obohacení nebo jiném prospěchu. TČ: 1. Přijetí úplatku (§ 331 – pachatelem je ten, kdo úplatek přijme nebo si dá slíbit), 2. Podplacení (§ 332 – pachatelem je ten, kdo úplatek poskytne nebo slíbí), 3. Nepřímé úplatkářství (§ 333 – zprostředkování vlivu).',
      'Úplatek je jakýkoliv dar věnovaný státnímu orgánu. Úplatkářství zahrnuje pouze zneužití pravomoci soudce a státního zástupce, přičemž nepřímé úplatkářství a slib úplatku trestní zákoník nepostihuje.',
      'Úplatek je obchodní provize dohodnutá v písemné smlouvě. Trestnými činy jsou pouze neoprávněné podnikání, porušení předpisů o pravidlech hospodářské soutěže a zkrácení daně.'
    ],
    correctOption: 1,
    rationale: 'Dle § 334 TZ je úplatkem neoprávněná výhoda jakékoliv povahy (peníze, dovolená, protislužba). Zvlášť přísně je trestán čin spáchaný v souvislosti s obstaráváním věcí obecného zájmu nebo úřední osobou (§ 331 odst. 2 TZ).',
    source: '§ 331 až § 334 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 26. Důvody zániku trestní odpovědnosti
  {
    id: 'pr-26',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Které zákonné instituty způsobují zánik trestní odpovědnosti pachatele?',
    answer: 'Účinná lítost (§ 33 TZ), promlčení trestní odpovědnosti (§ 34 TZ), smrt pachatele, zánik trestnosti u přípravy a pokusu při dobrovolném upuštění (§ 20 odst. 3, § 21 odst. 3 TZ), milost a amnestie prezidenta republiky.',
    options: [
      'Písemná omluva poškozenému schválená notářem, zaplacení paušálního soudního poplatku na účet ministerstva a uplynutí lhůty 30 dnů ode dne spáchání skutku.',
      'Účinná lítost (§ 33 TZ), promlčení trestní odpovědnosti (§ 34 TZ), smrt pachatele, zánik trestnosti u přípravy a pokusu při dobrovolném upuštění (§ 20 odst. 3, § 21 odst. 3 TZ), milost a amnestie prezidenta republiky.',
      'Výhradně nutná obrana (§ 29 TZ), krajní nouze (§ 28 TZ), svolení poškozeného (§ 30 TZ) a oprávněné použití zbraně příslušníkem bezpečnostního sboru podle zvláštního zákona.',
      'Přeložení obviněného do jiné vazební věznice, podání stížnosti proti usnesení o zahájení stíhání a změna dozorového státního zástupce v přípravném řízení.'
    ],
    correctOption: 1,
    rationale: 'Zánik trestní odpovědnosti znamená, že čin byl v době spáchání trestným, ale v důsledku dodatečné právní skutečnosti (např. uplynutí promlčecí doby 3–30 let dle § 34 TZ, nebo účinné lítosti dle § 33 TZ u taxativně vymezených TČ) trestní odpovědnost zanikla.',
    source: '§ 33 až § 35 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 27. Nepříčetnost a zmenšená příčetnost
  {
    id: 'pr-27',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jaký je rozdíl mezi nepříčetností (§ 26 TZ) a zmenšenou příčetností (§ 27 TZ)?',
    answer: 'Nepříčetnost zcela vylučuje trestní odpovědnost (pro duševní poruchu v době činu nemohl rozpoznat protiprávnost NEBO ovládat své jednání). Zmenšená příčetnost trestní odpovědnost nevylučuje (schopnost byla podstatně snížena), ale soud k ní přihlédne při stanovení trestu a může uložit ochranné léčení.',
    options: [
      'Nepříčetnost je stav způsobený požitím alkoholu nebo drog nad 1,5 promile vylučující trest, zatímco zmenšená příčetnost je stav fyzického vyčerpání po noční službě zkracující trest na polovinu.',
      'Nepříčetnost zcela vylučuje trestní odpovědnost (pro duševní poruchu v době činu nemohl rozpoznat protiprávnost NEBO ovládat své jednání). Zmenšená příčetnost trestní odpovědnost nevylučuje (schopnost byla podstatně snížena), ale soud k ní přihlédne při stanovení trestu a může uložit ochranné léčení.',
      'Nepříčetnost vede obligatorně k uložení výjimečného trestu odnětí svobody v trvání 20 až 30 let, zatímco u zmenšené příčetnosti soud ukládá výhradně peněžitý trest s dohledem.',
      'Nepříčetnost ponechává trestní odpovědnost v plném rozsahu s povinností nahradit škodu, zatímco zmenšená příčetnost trestní odpovědnost zcela vylučuje a věc se postupuje do přestupkového řízení.'
    ],
    correctOption: 1,
    rationale: 'Dle § 26 a 27 TZ: Nepříčetný pachatel nespáchal TČ (chybí subjekt). Zmenšeně příčetný pachatel je trestně odpovědný, avšak soud může snížit trest pod dolní hranici sazby za současného uložení ochranného léčení (§ 40 a § 47 TZ). Výjimkou je stav vyvolaný návykovou látkou (§ 360 TZ opilství).',
    source: '§ 26 a § 27 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 28. Okolnosti vylučující protiprávnost
  {
    id: 'pr-28',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Kterých 5 okolností vylučujících protiprávnost taxativně upravuje Hlava III trestního zákoníku?',
    answer: '1. Krajní nouze (§ 28), 2. Nutná obrana (§ 29), 3. Svolení poškozeného (§ 30), 4. Přípustné riziko (§ 31), 5. Oprávněné použití zbraně (§ 32).',
    options: [
      '1. Závazný rozkaz nadřízeného, 2. Výkon noční směny, 3. Stav momentálního afektu, 4. Únava po službě, 5. Zpoždění eskortního vozidla z důvodu dopravní zácpy.',
      '1. Krajní nouze (§ 28), 2. Nutná obrana (§ 29), 3. Svolení poškozeného (§ 30), 4. Přípustné riziko (§ 31), 5. Oprávněné použití zbraně (§ 32).',
      '1. Promlčení trestní odpovědnosti, 2. Vyhlášení prezidentské amnestie, 3. Udělení individuální milosti, 4. Účinná lítost pachatele, 5. Úmrtí obviněného v průběhu řízení.',
      '1. Předvedení podezřelého, 2. Zadržení policejním orgánem, 3. Vzetí do vazby soudcem, 4. Domovní prohlídka, 5. Osobní prohlídka při nástupu do VTOS.'
    ],
    correctOption: 1,
    rationale: 'Okolnosti vylučující protiprávnost způsobují, že čin, který má jinak formální znaky trestného činu, není protiprávní a není společensky škodlivý. Jedná se o činy právem dovolené.',
    source: '§ 28 až § 32 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 29. Krajní nouze (§ 28 TZ)
  {
    id: 'pr-29',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jak je definována krajní nouze v § 28 TZ a jaké jsou její 3 podmínky (meze)?',
    answer: 'Čin jinak trestný, kterým někdo odvrací nebezpečí přímo hrozící zájmu chráněnému trestním zákonem. Podmínky: 1. Subsidiarita (nebezpečí nebylo možno za daných okolností odvrátit jinak), 2. Proporcionalita (způsobený následek nesmí být stejně závažný nebo ještě závažnější než ten, který hrozil), 3. Absence povinnosti nebezpečí snášet (lékař, hasič, policista, příslušník VS ČR).',
    options: [
      'Čin, kterým někdo odvrací přímo hrozící nebo trvající útok jiné osoby na svůj majetek, přičemž obrana může být zcela zjevně nepřiměřená a způsobený následek může být podstatně těžší než hrozící škoda.',
      'Čin jinak trestný, kterým někdo odvrací nebezpečí přímo hrozící zájmu chráněnému trestním zákonem. Podmínky: 1. Subsidiarita (nebezpečí nebylo možno za daných okolností odvrátit jinak), 2. Proporcionalita (způsobený následek nesmí být stejně závažný nebo ještě závažnější než ten, který hrozil), 3. Absence povinnosti nebezpečí snášet (lékař, hasič, policista, příslušník VS ČR).',
      'Oprávnění příslušníka VS ČR opustit střežené stanoviště na základě ústního souhlasu ředitele věznice v případě poruchy technických zabezpečovacích prostředků nebo výpadku proudu.',
      'Jednání odvracející vzdálené budoucí nebezpečí, při němž může zachránce způsobit následek zjevně závažnější než hrozící ujma, přičemž policista i hasič mohou odmítnout zásah s odkazem na nouzi.'
    ],
    correctOption: 1,
    rationale: 'V krajní nouzi (§ 28 TZ) se obětuje jeden chráněný zájem pro záchranu zájmu vyšší hodnoty (např. vyražení dveří a poškození cizího majetku pro záchranu dusícího se člověka). Způsobená škoda musí být menší než hrozící škoda.',
    source: '§ 28 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 30. Nutná obrana (§ 29 TZ)
  {
    id: 'pr-30',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jak je definována nutná obrana v § 29 TZ a jaké jsou její meze?',
    answer: 'Čin jinak trestný, kterým někdo odvrací přímo hrozící nebo trvající útok na zájem chráněný trestním zákonem. Nejde o nutnou obranu, byla-li obrana zcela zjevně nepřiměřená způsobu útoku. Obrana směřuje proti útočníkovi, může být intenzivnější než útok a obránce není povinen zkoumat, zda lze ustoupit.',
    options: [
      'Jednání směřující k dodatečnému potrestání a fyzickému napadení pachatele po uplynutí několika hodin od skončení jeho útoku z důvodu ochrany cti a zadostiučinění poškozeného.',
      'Čin jinak trestný, kterým někdo odvrací přímo hrozící nebo trvající útok na zájem chráněný trestním zákonem. Nejde o nutnou obranu, byla-li obrana zcela zjevně nepřiměřená způsobu útoku. Obrana směřuje proti útočníkovi, může být intenzivnější než útok a obránce není povinen zkoumat, zda lze ustoupit.',
      'Odvracení útoku za podmínky, že obránce použije výhradně stejnou zbraň a stejnou intenzitu síly jako útočník, a před zahájením obrany je povinen se nejprve pokusit o útěk z místa střetu.',
      'Čin, kterým někdo odvrací živelní pohromu nebo útok zvířete bez lidského přičinění, přičemž způsobená škoda musí být bezpodmínečně menší než škoda odvrácená podle zásady subsidiarity.'
    ],
    correctOption: 1,
    rationale: 'Nutná obrana (§ 29 TZ) předpokládá přímo hrozící nebo trvající protiprávní útok člověka. Obrana musí být důraznější než útok, nesmí však být zcela zjevně excesivní (např. zastřelení neozbrojeného zloděje jablek). Nutnou obranou lze bránit i zájem jiné osoby (pomoc v nutné obraně).',
    source: '§ 29 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 31. Svolení poškozeného (§ 30 TZ)
  {
    id: 'pr-31',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Za jakých podmínek vylučuje svolení poškozeného protiprávnost (§ 30 TZ) a na co se nevztahuje?',
    answer: 'Svolení musí být dáno předem nebo současně s činem, dobrovolně, vážně a srozumitelně osobou oprávněnou o svých zájmech rozhodovat. Svolení k ublížení na zdraví nebo usmrcení je NEPLATNÉ (eutanazie je v ČR trestná), s výjimkou lékařských zákroků v souladu se zákonem a poznatky vědy (např. transplantace orgánů).',
    options: [
      'Svolení může být uděleno dodatečně kdykoliv v průběhu trestního stíhání a vztahuje se na všechny trestné činy včetně usmrcení na žádost (eutanazie) a závažného ublížení na zdraví.',
      'Svolení musí být dáno předem nebo současně s činem, dobrovolně, vážně a srozumitelně osobou oprávněnou o svých zájmech rozhodovat. Svolení k ublížení na zdraví nebo usmrcení je NEPLATNÉ (eutanazie je v ČR trestná), s výjimkou lékařských zákroků v souladu se zákonem a poznatky vědy (např. transplantace orgánů).',
      'Svolení musí mít vždy formu notářského zápisu schváleného dozorovým státním zástupcem a lze jej uplatnit výhradně u majetkových škod způsobených při dopravních nehodách.',
      'Svolení poškozeného je platné pro jakékoliv fyzické násilí, vzájemné souboje se zbraní i trvalé zmrzačení, pokud oběť předem podepsala písemné prohlášení o zřeknutí se nároků.'
    ],
    correctOption: 1,
    rationale: 'Dle § 30 TZ nelze disponovat se zájmy společnosti ani se životem a zdravím (čl. 6 LZPS). Eutanazie na žádost trpícího je posuzována jako vražda (§ 140 TZ). Výjimkou jsou indikované chirurgické a lékařské výkony a odběry orgánů dle transplantačního zákona.',
    source: '§ 30 zákona č. 40/2009 Sb., trestní zákoník; transplantační zákon č. 285/2002 Sb.'
  },

  // 32. Přípustné riziko (§ 31 TZ)
  {
    id: 'pr-32',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jak je v § 31 TZ upraveno přípustné riziko a jaké jsou jeho podmínky?',
    answer: 'Trestný čin nespáchá, kdo v souladu s dosaženým stavem poznání vykonává v rámci zaměstnání, povolání nebo funkce společensky prospěšnou činnost (výzkum, medicína, zkušební letectví), nelze-li výsledku dosáhnout jinak. Nejde o přípustné riziko, ohrozí-li život/zdraví bez souhlasu nebo odporuje-li zásadám lidskosti.',
    options: [
      'Oprávnění příslušníka bezpečnostního sboru riskovat život vězněných osob při provádění cvičných zákroků a používat služební zbraň k varovným výstřelům v uzavřených prostorách cely.',
      'Trestný čin nespáchá, kdo v souladu s dosaženým stavem poznání vykonává v rámci zaměstnání, povolání nebo funkce společensky prospěšnou činnost (výzkum, medicína, zkušební letectví), nelze-li výsledku dosáhnout jinak. Nejde o přípustné riziko, ohrozí-li život/zdraví bez souhlasu nebo odporuje-li zásadám lidskosti.',
      'Jednání manažera státního podniku, který investuje svěřené veřejné finance do vysoce rizikových akciových fondů na burze s cílem dosáhnout mimořádného zisku pro státní rozpočet.',
      'Vynětí z trestní odpovědnosti pro řidiče záchranné služby nebo policie, kteří řídí soukromé motorové vozidlo v době osobního volna bez platného řidičského oprávnění.'
    ],
    correctOption: 1,
    rationale: 'Přípustné riziko (§ 31 TZ) chrání vědce, lékaře a testovací experty, kteří při vývoji nových látek či postupů podstupují kalkulované riziko pro společenský pokrok, pokud zachovají náležitou opatrnost.',
    source: '§ 31 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 33. Oprávněné použití zbraně (§ 32 TZ)
  {
    id: 'pr-33',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jak trestní zákoník definuje oprávněné použití zbraně (§ 32 TZ)?',
    answer: 'Trestný čin nespáchá, kdo použije zbraně v mezích stanovených jiným právním předpisem (např. zákon č. 555/1992 Sb. pro VS ČR, zákon č. 273/2008 Sb. pro PČR, zákon o ozbrojených silách ČR).',
    options: [
      'Každý držitel platného zbrojního průkazu skupiny E, který použije střelnou zbraň proti pachateli přestupku proti majetku s cílem zabránit jeho útěku z místa činu.',
      'Trestný čin nespáchá, kdo použije zbraně v mezích stanovených jiným právním předpisem (např. zákon č. 555/1992 Sb. pro VS ČR, zákon č. 273/2008 Sb. pro PČR, zákon o ozbrojených silách ČR).',
      'Oprávnění příslušníka bezpečnostního sboru střílet ze své soukromé neregistrované zbraně kdykoliv v době mimo výkon služby při podezření na spáchání přečinu.',
      'Použití střelné zbraně strážným, které bylo dodatečně schváleno velitelem směny v záznamu o služebním zákroku, bez ohledu na splnění zákonných důvodů v době střelby.'
    ],
    correctOption: 1,
    rationale: 'Ustanovení § 32 TZ je blanketní normou odkazující na zvláštní zákony bezpečnostních sborů a ozbrojených sil. Pro příslušníky VS ČR a Justiční stráže jsou tyto podmínky upraveny v § 18, 19, 20 a 21 zákona č. 555/1992 Sb.',
    source: '§ 32 TZ a § 18–21 zákona č. 555/1992 Sb., o VS a JS ČR'
  },

  // 34. Trestní sankce a jejich systém
  {
    id: 'pr-34',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Co jsou trestní sankce a jaké druhy trestů upravuje § 52 trestního zákoníku?',
    answer: 'Trestní sankce tvoří tresty a ochranná opatření. Tresty (§ 52 TZ): odnětí svobody (podmíněné, nepodmíněné, výjimečné), domácí vězení, obecně prospěšné práce, propadnutí majetku, peněžitý trest, propadnutí věci, zákaz činnosti, zákaz pobytu, zákaz vstupu na sportovní/kulturní akce, ztráta čestných titulů a vyznamenání, ztráta vojenské hodnosti, vyhoštění.',
    options: [
      'Trestní sankce zahrnují trest smrti prováděný popravou, nucené těžké práce na státních stavbách, tělesné tresty a doživotní vyhoštění všech rodinných příslušníků odsouzeného.',
      'Trestní sankce tvoří tresty a ochranná opatření. Tresty (§ 52 TZ): odnětí svobody (podmíněné, nepodmíněné, výjimečné), domácí vězení, obecně prospěšné práce, propadnutí majetku, peněžitý trest, propadnutí věci, zákaz činnosti, zákaz pobytu, zákaz vstupu na sportovní/kulturní akce, ztráta čestných titulů a vyznamenání, ztráta vojenské hodnosti, vyhoštění.',
      'Výhradně disciplinární opatření: umístění do samovazby až na 30 dnů, celodenní připoutání k lůžku, zákaz nákupu v kantýně a odebrání osobních věcí ředitelem věznice.',
      'Pouze správní sankce ukládané v příkazním řízení Policií ČR: blokové pokuty na místě, záznam trestných bodů v registru řidičů a odebrání občanského průkazu.'
    ],
    correctOption: 1,
    rationale: 'Hlava V trestního zákoníku (§ 36–104 TZ) obsahuje ucelený katalog trestů a ochranných opatření. Tresty smí ukládat pouze nezávislý soud na základě zákona (čl. 90 Ústavy, čl. 39 LZPS).',
    source: '§ 52 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 35. Alternativní tresty
  {
    id: 'pr-35',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Co jsou to alternativní tresty a jaké jsou jejich hlavní příklady v českém právu?',
    answer: 'Tresty nespojené s bezprostředním uvězněním (nepodmíněným odnětím svobody), které umožňují pachateli zůstat v běžném sociálním a pracovním prostředí. Příklady: domácí vězení (§ 60 TZ, až na 2 roky), obecně prospěšné práce (§ 65 TZ, 50–300 hod), peněžitý trest (§ 67), zákaz vstupu na akce, podmíněné odsouzení s dohledem.',
    options: [
      'Tresty odnětí svobody vykonávané v soukromých nápravných zařízeních v zahraničí na základě mezistátní smlouvy o předávání odsouzených osob k výkonu trestu.',
      'Tresty nespojené s bezprostředním uvězněním (nepodmíněným odnětím svobody), které umožňují pachateli zůstat v běžném sociálním a pracovním prostředí. Příklady: domácí vězení (§ 60 TZ, až na 2 roky), obecně prospěšné práce (§ 65 TZ, 50–300 hod), peněžitý trest (§ 67), zákaz vstupu na akce, podmíněné odsouzení s dohledem.',
      'Trestní sankce, jejichž druh a délku trvání si odsouzený volí sám při nástupu do věznice po dohodě s vězeňským psychologem a vychovatelem oddělení.',
      'Výhradně ústavní ochranné léčení na psychiatrické klinice nařízené soudem pro nepříčetné pachatele bez možnosti jejich propuštění do domácího ošetřování.'
    ],
    correctOption: 1,
    rationale: 'Alternativní tresty snižují přeplněnost věznic, eliminují prizonizační vlivy na prvopachatele přečinů a šetří finanční prostředky státu. Kontrolu jejich výkonu provádí Probační a mediační služba ČR.',
    source: '§ 52, § 60, § 65, § 67 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 36. Ochranná opatření (§ 98–104 TZ)
  {
    id: 'pr-36',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Kterých 5 druhů ochranných opatření upravuje trestní právo (§ 98–104 TZ a ZSM)?',
    answer: '1. Ochranné léčení (§ 99 TZ – ústavní nebo ambulantní), 2. Zabezpečovací detence (§ 100 TZ), 3. Zabrání věci (§ 101 TZ), 4. Zabrání části majetku (§ 102a TZ), 5. Ochranná výchova (podle zákona č. 218/2003 Sb. o soudnictví ve věcech mládeže).',
    options: [
      '1. Kázeňská samovazba, 2. Celodenní poutání, 3. Zvláštní přísná dieta, 4. Zákaz návštěv na 6 měsíců, 5. Důkladná osobní prohlídka s rentgenem.',
      '1. Ochranné léčení (§ 99 TZ – ústavní nebo ambulantní), 2. Zabezpečovací detence (§ 100 TZ), 3. Zabrání věci (§ 101 TZ), 4. Zabrání části majetku (§ 102a TZ), 5. Ochranná výchova (podle zákona č. 218/2003 Sb. o soudnictví ve věcech mládeže).',
      '1. Předvedení policií, 2. Krátkodobé zadržení, 3. Zatčení na příkaz soudce, 4. Koluzní vazba, 5. Výslech v přítomnosti obhájce.',
      '1. Domácí vězení, 2. Obecně prospěšné práce, 3. Zákaz pobytu v obci, 4. Zákaz činnosti, 5. Propadnutí majetku státu.'
    ],
    correctOption: 1,
    rationale: 'Ochranná opatření nemají represivní charakter (nevyjadřují morální odsouzení činu), ale sledují preventivní a léčebný cíl k ochraně společnosti. Lze je uložit i osobám, které pro nepříčetnost nejsou trestně odpovědné.',
    source: '§ 98 až § 104 zákona č. 40/2009 Sb., trestní zákoník'
  },

  // 37. Účel zabezpečovací detence (§ 100 TZ)
  {
    id: 'pr-37',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jaký je účel zabezpečovací detence a pro které osoby je určena (§ 100 TZ a z. č. 129/2008 Sb.)?',
    answer: 'Léčebné, výchovné a izolační působení na extrémně nebezpečné osoby trpící těžkou duševní poruchou nebo deviací, u nichž nelze očekávat, že by ochranné léčení v psychiatrické nemocnici vedlo k ochraně společnosti. Vykonává se v ústavech pro výkon zabezpečovací detence (Brno, Opava) střežených Vězeňskou službou ČR.',
    options: [
      'Krátkodobé umístění osob pod vlivem alkoholu na protialkoholní záchytné stanici na dobu maximálně 24 hodin do odeznění akutní intoxikace.',
      'Léčebné, výchovné a izolační působení na extrémně nebezpečné osoby trpící těžkou duševní poruchou nebo deviací, u nichž nelze očekávat, že by ochranné léčení v psychiatrické nemocnici vedlo k ochraně společnosti. Vykonává se v ústavech pro výkon zabezpečovací detence (Brno, Opava) střežených Vězeňskou službou ČR.',
      'Výkon vazby obviněných osob ve vazební věznici po dobu probíhajícího odvolacího řízení u Vrchního soudu s cílem zabránit jejich útěku do zahraničí.',
      'Kázeňský trest umístění odsouzeného do samovazby na dobu 14 dnů za hrubé fyzické napadení příslušníka Vězeňské služby ČR při výkonu služby.'
    ],
    correctOption: 1,
    rationale: 'Zabezpečovací detence (§ 100 TZ) je časově neomezená (soud nejméně jednou za 12 měsíců, u mladistvých za 6 měsíců, přezkoumává její trvání). Výkon detence střeží příslušníci VS ČR ve zvláštních odděleních ÚVZVD.',
    source: '§ 100 zákona č. 40/2009 Sb., TZ a zákon č. 129/2008 Sb., o výkonu zabezpečovací detence'
  },

  // 38. Účel trestního řízení
  {
    id: 'pr-38',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Co je hlavním účelem trestního řízení v České republice (§ 1 TrŘ)?',
    answer: 'Upravit postup OČTŘ tak, aby trestné činy byly náležitě zjištěny a jejich pachatelé podle zákona spravedlivě potrestáni, rozhodnutí vykonána a působením řízení se upevňovala zákonnost, předcházelo trestné činnosti a chránila práva poškozených a občanů.',
    options: [
      'Co nejrychlejší vzetí každého podezřelého do vazby bez zbytečného zdržování dokazováním a jeho následné odsouzení k nepodmíněnému trestu odnětí svobody.',
      'Upravit postup OČTŘ tak, aby trestné činy byly náležitě zjištěny a jejich pachatelé podle zákona spravedlivě potrestáni, rozhodnutí vykonána a působením řízení se upevňovala zákonnost, předcházelo trestné činnosti a chránila práva poškozených a občanů.',
      'Veřejné zveřejnění osobních a biometrických údajů všech obviněných osob v celostátních médiích a na internetu za účelem jejich společenské dehonestace.',
      'Zajištění maximálního finančního výnosu pro státní rozpočet prostřednictvím ukládání vysokých majetkových sankcí a vymáhání nákladů trestního řízení.'
    ],
    correctOption: 1,
    rationale: 'Dle § 1 odst. 1 TrŘ trestní řízení chrání společnost i jednotlivce. Zahrnuje zjištění skutku, určení viny a spravedlivého trestu, ochranu poškozeného a prevenci kriminality.',
    source: '§ 1 zákona č. 141/1961 Sb., trestní řád'
  },

  // 39. Subjekty trestního řízení
  {
    id: 'pr-39',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Kdo jsou subjekty trestního řízení a jak se liší od stran trestního řízení?',
    answer: 'Subjekty jsou všichni činitelé s procesními právy a povinnostmi ovlivňující průběh řízení: 1. OČTŘ (soud, státní zástupce, policejní orgán), 2. Osoba, proti níž se řízení vede (podezřelý, obviněný, obžalovaný, odsouzený), 3. Poškozený, 4. Zúčastněná osoba, 5. Obhájce, opatrovník, PMS. Stranami jsou subjekty vystupující v řízení před soudem s rovnými právy (žalobce a obžalovaný).',
    options: [
      'Subjekty jsou výhradně očití svědci a přizvaní soudní znalci, zatímco stranami trestního řízení jsou pouze příslušníci vězeňské eskorty a justiční stráže.',
      'Subjekty jsou všichni činitelé s procesními právy a povinnostmi ovlivňující průběh řízení: 1. OČTŘ (soud, státní zástupce, policejní orgán), 2. Osoba, proti níž se řízení vede (podezřelý, obviněný, obžalovaný, odsouzený), 3. Poškozený, 4. Zúčastněná osoba, 5. Obhájce, opatrovník, PMS. Stranami jsou subjekty vystupující v řízení před soudem s rovnými právy (žalobce a obžalovaný).',
      'Subjektem trestního řízení je pouze předseda senátu krajského soudu a stranami jsou vyšetřovatelé Policie ČR podávající zprávu o průběhu vyšetřování.',
      'Subjekty trestního řízení jsou pouze příslušníci a občanští zaměstnanci Vězeňské služby ČR zajišťující ostrahu obviněného v průběhu soudního líčení.'
    ],
    correctOption: 1,
    rationale: 'Svědci a znalci se stávají subjekty řízení pouze tehdy, když uplatňují nárok na svědečné nebo znalečné. V řízení před soudem platí zásada kontradiktornosti a rovnosti stran (§ 2 odst. 10 TrŘ).',
    source: '§ 12 odst. 1 až 6 zákona č. 141/1961 Sb., trestní řád'
  },

  // 40. Orgány činné v trestním řízení (OČTŘ)
  {
    id: 'pr-40',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Které tři orgány tvoří taxativní výčet Orgánů činných v trestním řízení (OČTŘ) dle § 12 odst. 1 TrŘ?',
    answer: '1. Soud, 2. Státní zástupce, 3. Policejní orgány (útvary Policie ČR, GIBS, pověřené orgány VS ČR, Vojenské policie, Celní správy a BIS v zákonem vymezeném rozsahu).',
    options: [
      '1. Ředitel vazební věznice, 2. Primátor statutárního města, 3. Veřejný ochránce práv (ombudsman).',
      '1. Soud, 2. Státní zástupce, 3. Policejní orgány (útvary Policie ČR, GIBS, pověřené orgány VS ČR, Vojenské policie, Celní správy a BIS v zákonem vymezeném rozsahu).',
      '1. Česká advokátní komora, 2. Notářská komora ČR, 3. Exekutorská komora České republiky.',
      '1. Hasičský záchranný sbor ČR, 2. Horská služba ČR, 3. Český červený kříž.'
    ],
    correctOption: 1,
    rationale: 'Dle § 12 odst. 1 and odst. 2 TrŘ jsou OČTŘ výhradně: soudy, státní zástupci a zákonem definované policejní orgány. Pověřené orgány VS ČR vystupují jako policejní orgán při vyšetřování TČ osob ve výkonu vazby, VTOS nebo zabezpečovací detence (§ 12 odst. 2 písm. d TrŘ).',
    source: '§ 12 odst. 1 a 2 zákona č. 141/1961 Sb., trestní řád'
  },

  // 41. Postavení státního zástupce v trestním řízení
  {
    id: 'pr-41',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Jaké je postavení a role státního zástupce v přípravném řízení a v řízení před soudem?',
    answer: 'V přípravném řízení je „pánem sporu“ (dominus litis) – vykonává dozor nad zákonností policejního postupu, dává závazné pokyny a má výlučná oprávnění (podat obžalobu, rozhodnout o zastavení stíhání či odklonu). V řízení před soudem vystupuje jako strana sporu – veřejný žalobce s povinnou účastí u hlavního líčení.',
    options: [
      'V přípravném řízení i v řízení před soudem vystupuje jako nestranný soudce, který sám vynáší pravomocný rozsudek o vině a trestu a nařizuje výkon trestu.',
      'V přípravném řízení je „pánem sporu“ (dominus litis) – vykonává dozor nad zákonností policejního postupu, dává závazné pokyny a má výlučná oprávnění (podat obžalobu, rozhodnout o zastavení stíhání či odklonu). V řízení před soudem vystupuje jako strana sporu – veřejný žalobce s povinnou účastí u hlavního líčení.',
      'V přípravném řízení plní roli bezplatného právního zástupce a obhájce obviněného a před soudem vznáší námitky proti nezákonnému postupu policie.',
      'Má pouze poradní hlas bez možnosti vydávat závazné pokyny policii, přičemž o podání obžaloby rozhoduje policejní vyšetřovatel samostatně.'
    ],
    correctOption: 1,
    rationale: 'V přípravném řízení (§ 174–175 TrŘ) nese státní zástupce plnou odpovědnost za zákonnost. V soudním řízení podává obžalobu (§ 176 TrŘ) a nese důkazní břemeno prokázání viny obžalovaného.',
    source: '§ 174, § 175, § 180 zákona č. 141/1961 Sb., trestní řád'
  },

  // 42. Zásady trestního řízení
  {
    id: 'pr-42',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Co znamená zásada presumpce neviny a pravidlo „in dubio pro reo“ (§ 2 odst. 2 TrŘ)?',
    answer: 'Dokud pravomocným odsuzujícím rozsudkem soudu není vina vyslovena, nelze na obviněného hledět, jako by byl vinen. Pravidlo „in dubio pro reo“ (v pochybnostech ve prospěch) stanoví, že nelze-li pochybnosti o vině rozptýlit prováděním důkazů, musí soud rozhodnout ve prospěch obžalovaného.',
    options: [
      'Obviněný nese plné důkazní břemeno a je povinen před soudem předložit nezvratné důkazy o své nevině, jinak je automaticky shledán vinným ze spáchání skutku.',
      'Dokud pravomocným odsuzujícím rozsudkem soudu není vina vyslovena, nelze na obviněného hledět, jako by byl vinen. Pravidlo „in dubio pro reo“ (v pochybnostech ve prospěch) stanoví, že nelze-li pochybnosti o vině rozptýlit prováděním důkazů, musí soud rozhodnout ve prospěch obžalovaného.',
      'Soudce je oprávněn uznat obžalovaného vinným i při existenci zásadních pochybností, pokud se skutek jeví jako vysoce pravděpodobný na základě operativních informací policie.',
      'Presumpce neviny zaniká okamžikem vzetí obviněného do vazby, přičemž ve vazebním řízení se na obviněného hledí jako na pravomocně odsouzeného pachatele.'
    ],
    correctOption: 1,
    rationale: 'Presumpce neviny (čl. 40 odst. 2 LZPS a § 2 odst. 2 TrŘ) zbavuje obviněného povinnosti dokazovat nevinu. Důkazní břemeno leží na státním zástupci. Zůstanou-li po vyčerpání důkazů pochybnosti, obžalovaný musí být zproštěn obžaloby.',
    source: 'Čl. 40 odst. 2 LZPS a § 2 odst. 2 zákona č. 141/1961 Sb., trestní řád'
  },

  // 43. Stadia trestního řízení
  {
    id: 'pr-43',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Kterých 5 po sobě jdoucích stádií tvoří trestní řízení v ČR?',
    answer: '1. Přípravné řízení (postup před zahájením stíhání a vyšetřování), 2. Předběžné projednání obžaloby soudem, 3. Hlavní líčení (rozhodnutí o vině a trestu), 4. Opravné řízení (odvolání, stížnost, dovolání), 5. Vykonávací řízení (výkon trestu/opatření).',
    options: [
      '1. Zadržení podezřelého, 2. Eskorta do věznice, 3. Vstupní lékařská prohlídka, 4. Výkon kázeňského trestu, 5. Podmíněné propuštění na svobodu.',
      '1. Přípravné řízení (postup před zahájením stíhání a vyšetřování), 2. Předběžné projednání obžaloby soudem, 3. Hlavní líčení (rozhodnutí o vině a trestu), 4. Opravné řízení (odvolání, stížnost, dovolání), 5. Vykonávací řízení (výkon trestu/opatření).',
      '1. Spáchání přestupku, 2. Překlasifikování na přečin, 3. Soudní řízení o zločinu, 4. Mimořádný trest za ZZZ, 5. Zahlazení odsouzení.',
      '1. Policejní výslech s prověrkou na polygonu, 2. Zveřejnění v tiskové zprávě OČTŘ, 3. Zkrácené hlavní líčení bez možnosti podání odvolání.'
    ],
    correctOption: 1,
    rationale: 'Trestní proces postupuje od fáze prověřování a vyšetřování (přípravné řízení), přes soudní rozhodování o vině a trestu (hlavní líčení), až po případný přezkum (opravné řízení) a samotnou realizaci rozsudku (vykonávací řízení).',
    source: 'Zákon č. 141/1961 Sb., trestní řád (Části I–V)'
  },

  // 44. Rozhodnutí soudu v přípravném řízení
  {
    id: 'pr-44',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'O kterých závažných zásazích do základních práv a svobod rozhoduje výhradně soudce v přípravném řízení na návrh státního zástupce?',
    answer: '1. Vzetí do vazby (§ 68 TrŘ), 2. Vydání příkazu k zatčení (§ 69), 3. Vydání příkazu k domovní prohlídce (§ 83), 4. Vydání příkazu k odposlechu a záznamu telekomunikačního provozu (§ 88), 5. Nařízení pozorování duševního stavu ve zdravotnickém zařízení (§ 116).',
    options: [
      '1. Schválení služební cesty vyšetřovatele, 2. Nákup policejní techniky, 3. Přidělení služební zbraně, 4. Vyplacení odměny informátorovi, 5. Změna pracovní doby příslušníků.',
      '1. Vzetí do vazby (§ 68 TrŘ), 2. Vydání příkazu k zatčení (§ 69), 3. Vydání příkazu k domovní prohlídce (§ 83), 4. Vydání příkazu k odposlechu a záznamu telekomunikačního provozu (§ 88), 5. Nařízení pozorování duševního stavu ve zdravotnickém zařízení (§ 116).',
      '1. Udělení kázeňské odměny vězni, 2. Schválení nákupu v kantýně, 3. Povolení mimořádné návštěvy rodiny, 4. Přemístění na jiný ubytovací pokoj, 5. Vydání osobního balíčku.',
      '1. Běžná silniční kontrola, 2. Pořízení fotodokumentace na veřejném místě, 3. Kontrola totožnosti občanů, 4. Prohlídka motorového vozidla, 5. Zajištění stop na místě činu.'
    ],
    correctOption: 1,
    rationale: 'Ústavní pořádek (čl. 8, 12, 13 LZPS) svěřuje rozhodování o nejzávažnějších zásazích do osobní svobody a soukromí výhradně nezávislému soudci. Státní zástupce podává k těmto úkonům návrh.',
    source: '§ 68, § 69, § 83, § 88, § 116 zákona č. 141/1961 Sb., trestní řád'
  },

  // 45. Důvody vazby dle § 67 TrŘ
  {
    id: 'pr-45',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Jaké jsou 3 zákonné důvody vazby stanovené v § 67 trestního řádu?',
    answer: '1. Písm. a) Útěková vazba (obava, že obviněný uprchne nebo se bude skrývat), 2. Písm. b) Koluzní vazba (obava, že bude působit na svědky, spoluobviněné nebo jinak mařit objasňování), 3. Písm. c) Předstižná/preventivní vazba (obava, že bude opakovat, dokoná nebo spáchá trestný čin).',
    options: [
      '1. Trestní vazba (k potrestání pachatele před rozsudkem), 2. Disciplinární vazba (za porušení pořádku při výslechu), 3. Karanténní vazba (ze zdravotních a hygienických důvodů).',
      '1. Písm. a) Útěková vazba (obava, že obviněný uprchne nebo se bude skrývat), 2. Písm. b) Koluzní vazba (obava, že bude působit na svědky, spoluobviněné nebo jinak mařit objasňování), 3. Písm. c) Předstižná/preventivní vazba (obava, že bude opakovat, dokoná nebo spáchá trestný čin).',
      '1. Krátkodobá předběžná vazba do 48 hodin, 2. Vyšetřovací vazba v trvání do 5 let bez přezkumu, 3. Výjimečná doživotní vazba pro nebezpečné pachatele.',
      '1. Vazba z důvodu přistižení při činu, 2. Vazba z důvodu nezaplacení soudního poplatku, 3. Vazba z důvodu odmítnutí vypovídat před policejním orgánem.'
    ],
    correctOption: 1,
    rationale: 'Vazba (§ 67 TrŘ) je zajišťovacím institutem, nikoli trestem. Koluzní vazba (písm. b) smí trvat nejdéle 3 měsíce (nestanoví-li zákon výjimku při ovlivňování svědků dle § 72a TrŘ).',
    source: '§ 67 zákona č. 141/1961 Sb., trestní řád'
  },

  // 46. Propuštění z výkonu vazby a nahrazení vazby
  {
    id: 'pr-46',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Kdy musí být obviněný propuštěn z vazby a jakými opatřeními lze vazbu nahradit (§ 73, § 73a TrŘ)?',
    answer: 'Propuštěn musí být ihned, jakmile pominou důvody vazby nebo uplyne nejvyšší přípustná lhůta. Vazbu písm. a) a c) lze nahradit: zárukou zájmového sdružení/důvěryhodné osoby, písemným slibem obviněného, dohledem probačního úředníka, elektronickou kontrolou, předběžným opatřením nebo peněžitou zárukou (kaucí § 73a). Koluzní vazbu (písm. b) kaucí nahradit nelze.',
    options: [
      'Propuštěn může být pouze po složení nevratného administrativního poplatku ve výši 500 000 Kč přímo na účet ředitele vazební věznice, přičemž náhradní instituty zákon nepřipouští.',
      'Propuštěn musí být ihned, jakmile pominou důvody vazby nebo uplyne nejvyšší přípustná lhůta. Vazbu písm. a) a c) lze nahradit: zárukou zájmového sdružení/důvěryhodné osoby, písemným slibem obviněného, dohledem probačního úředníka, elektronickou kontrolou, předběžným opatřením nebo peněžitou zárukou (kaucí § 73a). Koluzní vazbu (písm. b) kaucí nahradit nelze.',
      'O propuštění rozhoduje výhradně velitel strážní směny vazební věznice, přičemž jakoukoliv formu vazby lze nahradit výhradně čestným prohlášením zaměstnavatele obviněného.',
      'Z vazby nelze obviněného propustit před vynesením pravomocného rozsudku, přičemž koluzní vazbu lze přednostně nahradit peněžitou zárukou (kaucí) a písemným slibem.'
    ],
    correctOption: 1,
    rationale: 'O propuštění z vazby rozhoduje v přípravném řízení státní zástupce nebo soudce, v řízení před soudem soudce. U koluzní vazby (§ 67 písm. b) je ze zákona vyloučeno nahrazení kaucí, slibem i dohledem.',
    source: '§ 71, § 72, § 73, § 73a zákona č. 141/1961 Sb., trestní řád'
  },

  // 47. Opravné prostředky v trestním řízení (řádné a mimořádné)
  {
    id: 'pr-47',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Jak se dělí opravné prostředky v trestním řízení a jaké mají účinky?',
    answer: 'Řádné (proti nepravomocným rozhodnutím): 1. Odvolání (proti rozsudku do 8 dnů, odkladný a devolutivní účinek), 2. Stížnost (proti usnesení do 3 dnů), 3. Odpor (proti trestnímu příkazu do 8 dnů, nedevelutivní – ruší příkaz). Mimořádné (proti pravomocným): Dovolání (k Nejvyššímu soudu), Obnova řízení (§ 277 TrŘ), Stížnost pro porušení zákona (podává pouze ministr spravedlnosti).',
    options: [
      'Řádné: Petice občanů zaslaná Parlamentu ČR do 30 dnů a Žádost o přezkum ředitelem věznice. Mimořádné: Žádost o milost u prezidenta republiky a stížnost k Evropskému parlamentu.',
      'Řádné (proti nepravomocným rozhodnutím): 1. Odvolání (proti rozsudku do 8 dnů, odkladný a devolutivní účinek), 2. Stížnost (proti usnesení do 3 dnů), 3. Odpor (proti trestnímu příkazu do 8 dnů, nedevelutivní – ruší příkaz). Mimořádné (proti pravomocným): Dovolání (k Nejvyššímu soudu), Obnova řízení (§ 277 TrŘ), Stížnost pro porušení zákona (podává pouze ministr spravedlnosti).',
      'Řádné: Odvolání (lhůta 15 dnů, nemá odkladný účinek), Kárná žaloba a Rozklad. Mimořádné: Dovolání k Ústavnímu soudu ČR, Kasační stížnost k NSS a Amnestie prezidenta republiky.',
      'Řádné: Dovolání a Obnova řízení (podávají se do 3 let). Mimořádné: Odvolání a Stížnost (lze podat kdykoliv po nástupu do výkonu trestu odnětí svobody).'
    ],
    correctOption: 1,
    rationale: 'Devolutivní účinek znamená, že o opravném prostředku rozhoduje soud vyššího stupně. Suspenzivní (odkladný) účinek odkládá právní moc a vykonatelnost napadeného rozhodnutí.',
    source: 'Část III hlava 16 až 21 zákona č. 141/1961 Sb., trestní řád'
  },

  // 48. Odpor v trestním řízení (§ 314g TrŘ)
  {
    id: 'pr-48',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Co je to odpor v trestním řízení a jaké má právní důsledky (§ 314g TrŘ)?',
    answer: 'Odpor je řádný opravný prostředek proti trestnímu příkazu. Mohou jej podat obviněný nebo státní zástupce do 8 dnů od doručení. Podáním odporu se trestní příkaz bez dalšího ruší a samosoudce nařídí ve věci hlavní líčení.',
    options: [
      'Fyzické nebo verbální kladení odporu příslušníkovi Vězeňské služby ČR při provádění služebního zákroku, které je kvalifikováno jako trestný čin násilí proti úřední osobě (§ 325 TZ).',
      'Odpor je řádný opravný prostředek proti trestnímu příkazu. Mohou jej podat obviněný nebo státní zástupce do 8 dnů od doručení. Podáním odporu se trestní příkaz bez dalšího ruší a samosoudce nařídí ve věci hlavní líčení.',
      'Žádost odsouzeného o přeložení do věznice s mírnějším režimem nebo do věznice blíže k místu bydliště, o níž rozhoduje generální ředitel VS ČR ve správním řízení.',
      'Opravný prostředek, který může podat výhradně poškozený do 15 dnů od vyhlášení rozsudku, pokud nesouhlasí s výší přiznaného nároku na náhradu škody.'
    ],
    correctOption: 1,
    rationale: 'Dle § 314g TrŘ podáním odporu trestní příkaz zaniká a věc se projedná v klasickém hlavním líčení. V hlavním líčení není soud vázán právní kvalifikací ani druhem trestu z trestního příkazu (rozsudek může být pro obžalovaného i přísnější).',
    source: '§ 314g zákona č. 141/1961 Sb., trestní řád'
  },

  // 49. Obnova řízení (§ 277 TrŘ)
  {
    id: 'pr-49',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Kdy a za jakých podmínek lze povolit obnovu pravomocně skončeného trestního řízení (§ 277 TrŘ)?',
    answer: 'Pokud po právní moci rozhodnutí vyjdou najevo nové, dříve neznámé skutečnosti nebo důkazy soudu neznámé, které by samy o sobě nebo ve spojení se známými skutečnostmi mohly odůvodnit jiné rozhodnutí o vině nebo o náhradě škody, nebo pro které by uložený trest byl ve zřejmém nepoměru.',
    options: [
      'Povoluje se automaticky ředitelem věznice po uplynutí každých 2 let nepřetržitého výkonu trestu odnětí svobody za účelem přezkoumání chování odsouzeného.',
      'Pokud po právní moci rozhodnutí vyjdou najevo nové, dříve neznámé skutečnosti nebo důkazy soudu neznámé, které by samy o sobě nebo ve spojení se známými skutečnostmi mohly odůvodnit jiné rozhodnutí o vině nebo o náhradě škody, nebo pro které by uložený trest byl ve zřejmém nepoměru.',
      'Obnova řízení nastává ze zákona automaticky při každé změně složení Poslanecké sněmovny nebo jmenování nového ministra spravedlnosti ČR.',
      'Pouze v případě, že obžalovaný nesouhlasí s právním posouzením skutku soudem prvního stupně a navrhne nové teoretické výklady trestního zákoníku bez předložení nových důkazů.'
    ],
    correctOption: 1,
    rationale: 'Obnova řízení (§ 277 TrŘ) je mimořádný opravný prostředek směřující k nápravě skutkových omylů. Povolení obnovy ruší původní pravomocné rozhodnutí a řízení se vrací do příslušného stádia.',
    source: '§ 277 až § 289 zákona č. 141/1961 Sb., trestní řád'
  },

  // 50. CPT Standardy – 3 základní záruky proti špatnému zacházení
  {
    id: 'pr-50',
    subject: 'Právo',
    topic: 'Mezinárodní standardy vězeňství',
    question: 'Která tři základní práva představují podle Evropského výboru pro zabránění mučení (CPT) klíčové záruky proti špatnému zacházení od samého počátku zbavení svobody policií?',
    answer: '1. Právo na informování třetí osoby (rodinný příslušník, přítel, konzulát) o zadržení, 2. Právo na přístup k právnímu zástupci (včetně důvěrného rozhovoru a přítomnosti u výslechu), 3. Právo na lékařské vyšetření lékařem dle vlastního výběru (mimo doslech a dohled policistů).',
    options: [
      '1. Právo na bezplatné stravování v restauračním zařízení, 2. Právo na vlastní televizor na cele předběžného zadržení, 3. Právo na neomezené vycházky mimo policejní služebnu.',
      '1. Právo na informování třetí osoby (rodinný příslušník, přítel, konzulát) o zadržení, 2. Právo na přístup k právnímu zástupci (včetně důvěrného rozhovoru a přítomnosti u výslechu), 3. Právo na lékařské vyšetření lékařem dle vlastního výběru (mimo doslech a dohled policistů).',
      '1. Právo na vystoupení v celostátním televizním vysílání, 2. Právo na okamžité finanční odškodnění ve výši 10 000 Kč, 3. Právo na bezpodmínečné propuštění po 2 hodinách.',
      '1. Právo odmítnout sdělení totožnosti policejnímu orgánu, 2. Právo na okamžité udělení milosti prezidentem republiky, 3. Právo na bezplatné ubytování v hotelovém zařízení.'
    ],
    correctOption: 1,
    rationale: 'Dle 2. obecné zprávy CPT (odst. 36) a navazujících zpráv představuje trojice práv (informování blízkých, přístup k advokátovi a přístup k lékaři) od prvních okamžiků zadržení elementární štít proti mučení, nezákonnému nátlaku a vynucování přiznání.',
    source: 'Standardy CPT (Zpráva CPT/Inf (92) 3, body 36–43; CPT/Inf (2002) 15)'
  }
  ,
  // 51. Probační a mediační služba
  {
    id: 'pr-51',
    subject: 'Právo',
    topic: 'Probační a mediační služba',
    question: 'Jaký je hlavní cíl činnosti Probační a mediační služby (PMS) podle zákona č. 257/2000 Sb. a v jaké fázi se podílí na trestním řízení?',
    answer: 'Hlavním cílem PMS je urovnání konfliktního stavu mezi pachatelem a poškozeným (mediace), provádění dohledu nad obviněnými/odsouzenými a kontrola výkonu alternativních trestů (probace). Podílí se na celém průběhu trestního řízení – od přípravného řízení až po vykonávací řízení a péči po propuštění z VTOS.',
    options: [
      'Hlavním cílem PMS je výhradně bezplatné právní zastupování pachatelů před soudem. Podílí se pouze na přípravném řízení před podáním obžaloby a nahrazuje činnost advokátů.',
      'Hlavním cílem PMS je urovnání konfliktního stavu mezi pachatelem a poškozeným (mediace), provádění dohledu nad obviněnými/odsouzenými a kontrola výkonu alternativních trestů (probace). Podílí se na celém průběhu trestního řízení – od přípravného řízení až po vykonávací řízení a péči po propuštění z VTOS.',
      'Hlavním cílem je vyšetřování stížností na postup policie a vězeňské služby. Funguje jako nezávislý dozorový orgán a její činnost se omezuje výhradně na výkon vazby.',
      'PMS se zaměřuje pouze na ochranu obětí trestných činů a poskytování finanční kompenzace od státu; s pachateli zásadně nepracuje, aby nedošlo ke střetu zájmů.'
    ],
    correctOption: 1,
    rationale: 'Zákon č. 257/2000 Sb. vymezuje probaci (dohled nad pachatelem, kontrola alternativních trestů) a mediaci (mimosoudní zprostředkování řešení sporu). PMS pracuje s pachateli i oběťmi ve všech stadiích trestního řízení, včetně přípravy na propuštění z vězení (tzv. parole).',
    source: 'Zákon č. 257/2000 Sb., o Probační a mediační službě'
  },
  // 52. Druhy trestů odnětí svobody
  {
    id: 'pr-52',
    subject: 'Právo',
    topic: 'Trestní právo hmotné',
    question: 'Jak se z hlediska výkonu člení nepodmíněné tresty odnětí svobody (§ 56 TZ a ZVTOS)?',
    answer: 'Odnětí svobody se vykonává ve věznicích s ostrahou (členěné na oddělení s nízkým, středním a vysokým stupněm zabezpečení) nebo se zvýšenou ostrahou. Do věznice se zvýšenou ostrahou soud obligatorně zařadí např. pachatele s výjimečným trestem nebo odsouzeného za ZZZ spáchaný ve prospěch organizované zločinecké skupiny.',
    options: [
      'Vykonávají se výhradně ve třech typech věznic: dohled, dozor a ostraha. O zařazení rozhoduje ředitel věznice na základě kapacity ubytovacích prostor bez ohledu na verdikt soudu.',
      'Odnětí svobody se vykonává ve věznicích s ostrahou (členěné na oddělení s nízkým, středním a vysokým stupněm zabezpečení) nebo se zvýšenou ostrahou. Do věznice se zvýšenou ostrahou soud obligatorně zařadí např. pachatele s výjimečným trestem nebo odsouzeného za ZZZ spáchaný ve prospěch organizované zločinecké skupiny.',
      'Tresty odnětí svobody se člení na krátkodobé (do 1 roku), střednědobé (do 5 let) a dlouhodobé (nad 5 let), přičemž všechny se vykonávají ve stejných ubytovnách se společným režimem.',
      'Existuje pouze jeden typ věznice s jednotným režimem pro všechny odsouzené, protože ústava zaručuje rovnost občanů před zákonem i během výkonu trestu.'
    ],
    correctOption: 1,
    rationale: 'Novelou TZ a ZVTOS (2017) došlo ke zrušení čtyř typů věznic a nahrazení dvěma základními typy: věznice s ostrahou a věznice se zvýšenou ostrahou. O konkrétním umístění do oddělení v rámci věznice s ostrahou rozhoduje ředitel na návrh odborné komise, o typu věznice rozhoduje soud.',
    source: '§ 56 zákona č. 40/2009 Sb., trestní zákoník a § 39a zákona č. 169/1999 Sb.'
  },
  // 53. Zvláštní způsoby řízení (Odklony)
  {
    id: 'pr-53',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Co se v trestním právu procesním rozumí pod pojmem „odklony“ a jaké jsou hlavní příklady?',
    answer: 'Odklony jsou alternativní (zvláštní) způsoby trestního řízení, které umožňují vyřídit věc mimo klasické hlavní líčení u soudu, pokud jde o méně závažné činy (přečiny) a pachatel splní podmínky (doznání, náhrada škody). Příklady: Podmíněné zastavení trestního stíhání (§ 307 TrŘ) a Narovnání (§ 309 TrŘ).',
    options: [
      'Odklony označují procesní přesunutí trestní věci k příslušnému správnímu orgánu za účelem uložení pořádkové pokuty, pokud pachatel odmítne vypovídat.',
      'Odklony jsou alternativní (zvláštní) způsoby trestního řízení, které umožňují vyřídit věc mimo klasické hlavní líčení u soudu, pokud jde o méně závažné činy (přečiny) a pachatel splní podmínky (doznání, náhrada škody). Příklady: Podmíněné zastavení trestního stíhání (§ 307 TrŘ) a Narovnání (§ 309 TrŘ).',
      'Znamenají převedení pravomoci k vydání rozsudku z nezávislého soudu na dozorového státního zástupce, který rovnou ukládá nepodmíněné tresty.',
      'Je to dočasné přerušení výkonu trestu odnětí svobody z humanitárních důvodů (zdravotní stav, úmrtí v rodině), po němž se vězeň musí vrátit.'
    ],
    correctOption: 1,
    rationale: 'Odklony jsou projevem restorativní justice (obnovující spravedlnosti). Šetří náklady, urychlují řízení, uspokojují nároky poškozeného a motivují prvopachatele přečinů k nápravě bez nutnosti klasického potrestání a záznamu v trestním rejstříku.',
    source: '§ 307, § 309 zákona č. 141/1961 Sb., trestní řád'
  },
  // 54. Zadržení osoby podezřelé
  {
    id: 'pr-54',
    subject: 'Právo',
    topic: 'Trestní právo procesní',
    question: 'Za jakých podmínek může policie nebo občan zadržet osobu podezřelou ze spáchání trestného činu a jaké jsou následné lhůty (§ 76 TrŘ)?',
    answer: 'Policejní orgán smí zadržet osobu při existenci vazebních důvodů (i bez souhlasu SZ u neodkladnosti). Kterýkoliv občan smí omezit osobní svobodu (zadržet) toho, kdo byl přistižen při TČ nebo těsně poté (k zjištění totožnosti/předání policii). Policie musí zadrženého do 48 hodin vyslechnout a buď propustit, nebo předat soudu (soud má pak dalších 24 hod na rozhodnutí o vazbě).',
    options: [
      'Policejní orgán smí zadržet kohokoliv bez důvodu na 72 hodin. Občané právo zadržet nemají, vystavují se tím riziku stíhání za omezování svobody.',
      'Policejní orgán smí zadržet osobu při existenci vazebních důvodů (i bez souhlasu SZ u neodkladnosti). Kterýkoliv občan smí omezit osobní svobodu (zadržet) toho, kdo byl přistižen při TČ nebo těsně poté (k zjištění totožnosti/předání policii). Policie musí zadrženého do 48 hodin vyslechnout a buď propustit, nebo předat soudu (soud má pak dalších 24 hod na rozhodnutí o vazbě).',
      'Policie smí zadržet osobu maximálně na 12 hodin, poté musí být propuštěna na kauci. Souhlas soudu k prodloužení se nevyžaduje. Občanské zadržení je povoleno jen u majetkových deliktů.',
      'Osobu podezřelou smí zadržet výhradně soudce nebo státní zástupce na místě činu. Doba zadržení nesmí přesáhnout 24 hodin celkem.'
    ],
    correctOption: 1,
    rationale: 'Zadržení (§ 76 TrŘ) je krátkodobé omezení osobní svobody (max. 48 + 24 hod dle čl. 8 LZPS). Občanské zadržení („nutnost přistižení při činu nebo bezprostředně po něm“) vyžaduje okamžité předání policejnímu orgánu.',
    source: '§ 76 zákona č. 141/1961 Sb., trestní řád'
  },
  // 55. Rozdíl mezi TČ a Přestupkem
  {
    id: 'pr-55',
    subject: 'Právo',
    topic: 'Základy práva',
    question: 'Jaký je hlavní rozdíl mezi trestným činem (přečinem/zločinem) a přestupkem?',
    answer: 'Trestný čin je závažnější protiprávní čin zakotvený výhradně v trestním zákoníku, o kterém rozhoduje nezávislý soud a ukládá tresty zanechávající záznam v Rejstříku trestů. Přestupek je méně závažné společensky škodlivé jednání, které projednávají správní orgány (obce, policie), trestem jsou pokuty, zákazy činnosti či napomenutí, bez záznamu v Rejstříku trestů.',
    options: [
      'Obě kategorie jsou totožné, rozdíl je pouze v terminologii starých a nových zákonů; o obou rozhoduje výhradně soud v trestním řízení a ukládá stejné tresty.',
      'Trestný čin je závažnější protiprávní čin zakotvený výhradně v trestním zákoníku, o kterém rozhoduje nezávislý soud a ukládá tresty zanechávající záznam v Rejstříku trestů. Přestupek je méně závažné společensky škodlivé jednání, které projednávají správní orgány (obce, policie), trestem jsou pokuty, zákazy činnosti či napomenutí, bez záznamu v Rejstříku trestů.',
      'Přestupkem je pouze neúmyslné (nedbalostní) jednání řešené Policií ČR na ulici, zatímco trestným činem je výhradně úmyslné násilí páchané organizovanými skupinami.',
      'Rozdíl spočívá výhradně ve věku pachatele: přestupky páchají mladiství do 18 let, zatímco dospělí nad 18 let páchají vždy jen trestné činy bez ohledu na závažnost.'
    ],
    correctOption: 1,
    rationale: 'Přestupky upravuje zákon č. 250/2016 Sb. o odpovědnosti za přestupky a o řízení o nich. Mají nižší materiální škodlivost. O trestech za trestné činy (sankční dualismus – tresty a ochranná opatření) smí rozhodovat pouze soud (čl. 39 a 40 LZPS).',
    source: 'Zákon č. 250/2016 Sb. a Zákon č. 40/2009 Sb.'
  }
];
